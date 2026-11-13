import "server-only";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DATA_DIR, get, run } from "./db";
import type { UserRow } from "./types";

export const SESSION_COOKIE = "fss_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) return process.env.SESSION_SECRET;
  // No secret configured: create one once and keep it next to the database.
  const file = path.join(DATA_DIR, "session.key");
  if (!fs.existsSync(file)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(file, crypto.randomBytes(48).toString("hex"), { mode: 0o600 });
  }
  return fs.readFileSync(file, "utf8").trim();
}

export { hashPassword, verifyPassword } from "./password";

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createToken(userId: number) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof uid === "number" && exp > Date.now() ? uid : null;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<Omit<UserRow, "password_hash"> | null> {
  const jar = await cookies();
  const uid = readToken(jar.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  return get<UserRow>("SELECT id, name, email, role, created_at FROM users WHERE id = ?", uid) ?? null;
}

/** Use at the top of every admin page and server action. */
export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/admin/login/");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "admin") redirect("/admin/?error=forbidden");
  return u;
}

export async function startSession(userId: number) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}

/** Simple brute-force protection: 8 failed attempts per 15 minutes per IP. */
export function tooManyAttempts(ip: string) {
  const since = Date.now() - 15 * 60 * 1000;
  run("DELETE FROM login_attempts WHERE at < ?", since);
  const n = get<{ n: number }>("SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ?", ip)?.n ?? 0;
  return n >= 8;
}
export const recordFailedAttempt = (ip: string) => run("INSERT INTO login_attempts (ip, at) VALUES (?, ?)", ip, Date.now());
