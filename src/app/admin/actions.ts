"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { all, get, run } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/paths";
import {
  clientIp, endSession, hashPassword, recordFailedAttempt, requireAdmin, requireUser, startSession, tooManyAttempts, verifyPassword,
} from "@/lib/auth";
import { cleanHtml, cleanText } from "@/lib/sanitize";
import { slugify } from "@/lib/util";
import type { UserRow } from "@/lib/types";

export type ActionState = { ok: boolean; message: string } | null;

const s = (fd: FormData, k: string, max = 500) => cleanText(fd.get(k), max);
const n = (fd: FormData, k: string) => (Number.isFinite(Number(fd.get(k))) ? Number(fd.get(k)) : 0);
const b = (fd: FormData, k: string) => (fd.get(k) === "on" || fd.get(k) === "1" || fd.get(k) === "true" ? 1 : 0);
const refresh = () => revalidatePath("/", "layout");

/* ---------- Auth ---------- */

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const ip = await clientIp();
  if (tooManyAttempts(ip)) return { ok: false, message: "Too many failed attempts. Please wait 15 minutes and try again." };
  const email = s(fd, "email", 160).toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = get<UserRow>("SELECT * FROM users WHERE email = ?", email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    recordFailedAttempt(ip);
    return { ok: false, message: "Incorrect email or password." };
  }
  await startSession(user.id);
  const next = s(fd, "next", 200);
  redirect(next.startsWith("/admin") ? next : "/admin/");
}

export async function logout() {
  await endSession();
  redirect("/admin/login/");
}

export async function changePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const row = get<UserRow>("SELECT * FROM users WHERE id = ?", me.id)!;
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("password") ?? "");
  if (!verifyPassword(current, row.password_hash)) return { ok: false, message: "Your current password is incorrect." };
  if (next.length < 10) return { ok: false, message: "New password must be at least 10 characters." };
  if (next !== String(fd.get("confirm") ?? "")) return { ok: false, message: "Passwords do not match." };
  run("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(next), me.id);
  const name = s(fd, "name", 80);
  if (name) run("UPDATE users SET name = ? WHERE id = ?", name, me.id);
  return { ok: true, message: "Password updated." };
}

export async function saveProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const name = s(fd, "name", 80);
  if (!name) return { ok: false, message: "Name is required." };
  run("UPDATE users SET name = ? WHERE id = ?", name, me.id);
  return { ok: true, message: "Profile saved." };
}

export async function createUser(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = s(fd, "name", 80);
  const email = s(fd, "email", 160).toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = s(fd, "role") === "admin" ? "admin" : "editor";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Enter a name and a valid email." };
  if (password.length < 10) return { ok: false, message: "Password must be at least 10 characters." };
  if (get("SELECT id FROM users WHERE email = ?", email)) return { ok: false, message: "A user with this email already exists." };
  run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", name, email, hashPassword(password), role);
  revalidatePath("/admin/users/");
  return { ok: true, message: `User ${email} created.` };
}

export async function deleteUser(fd: FormData) {
  const me = await requireAdmin();
  const id = n(fd, "id");
  if (id === me.id) redirect("/admin/users/?error=self");
  const admins = get<{ c: number }>("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'")!.c;
  const target = get<UserRow>("SELECT * FROM users WHERE id = ?", id);
  if (target?.role === "admin" && admins <= 1) redirect("/admin/users/?error=last");
  run("DELETE FROM users WHERE id = ?", id);
  redirect("/admin/users/?deleted=1");
}

/* ---------- Blog posts ---------- */

function uniqueSlug(table: "posts", wanted: string, id: number) {
  let slug = slugify(wanted) || "post";
  let i = 2;
  const base = slug;
  // Posts live at the site root, so they must not clash with page paths either.
  while (get(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, slug, id) || get("SELECT id FROM pages WHERE path = ?", slug)) slug = `${base}-${i++}`;
  return slug;
}

export async function savePost(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = n(fd, "id");
  const title = s(fd, "title", 200);
  if (!title) return { ok: false, message: "Title is required." };
  const slug = uniqueSlug("posts", s(fd, "slug", 120) || title, id);
  const status = s(fd, "status") === "published" ? "published" : "draft";
  let publishedAt = s(fd, "published_at", 40);
  publishedAt = publishedAt ? new Date(publishedAt).toISOString() : status === "published" ? new Date().toISOString() : "";
  const vals = [
    slug, title, s(fd, "excerpt", 600), cleanHtml(String(fd.get("body") ?? "")), s(fd, "cover"), s(fd, "category", 80) || "Security Guides",
    s(fd, "tags", 300), s(fd, "author", 120) || "Four Stars Security", status, b(fd, "featured"), s(fd, "meta_title", 200), s(fd, "meta_description", 400),
    publishedAt || null,
  ] as const;
  if (id) {
    run(`UPDATE posts SET slug=?, title=?, excerpt=?, body=?, cover=?, category=?, tags=?, author=?, status=?, featured=?, meta_title=?, meta_description=?, published_at=?, updated_at=datetime('now') WHERE id=?`, ...vals, id);
    refresh();
    return { ok: true, message: status === "published" ? "Post saved and published." : "Draft saved." };
  }
  const r = run(`INSERT INTO posts (slug, title, excerpt, body, cover, category, tags, author, status, featured, meta_title, meta_description, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, ...vals);
  refresh();
  redirect(`/admin/posts/${r.lastInsertRowid}/?saved=1`);
}

export async function deletePost(fd: FormData) {
  await requireUser();
  run("DELETE FROM posts WHERE id = ?", n(fd, "id"));
  refresh();
  redirect("/admin/posts/?deleted=1");
}

/* ---------- Pages ---------- */

export async function savePage(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = n(fd, "id");
  const title = s(fd, "title", 200);
  if (!title) return { ok: false, message: "Title is required." };
  const pathIn = s(fd, "path", 200).toLowerCase().split("/").map(slugify).filter(Boolean).join("/");
  if (!pathIn) return { ok: false, message: "URL path is required." };
  if (get("SELECT id FROM pages WHERE path = ? AND id != ?", pathIn, id)) return { ok: false, message: `Another page already uses /${pathIn}/.` };
  if (!pathIn.includes("/") && get("SELECT id FROM posts WHERE slug = ?", pathIn)) return { ok: false, message: `A blog post already uses /${pathIn}/.` };
  if (/^(admin|api|uploads|images|brand|_next)(\/|$)/.test(pathIn)) return { ok: false, message: "That URL is reserved." };
  const type = ["page", "service", "industry", "location", "legal"].includes(s(fd, "type")) ? s(fd, "type") : "page";
  const images = String(fd.get("images") ?? "[]");
  let imgs: string[] = [];
  try { imgs = (JSON.parse(images) as unknown[]).map(String).slice(0, 12); } catch {}
  const vals = [
    pathIn, type, s(fd, "template", 40) || "default", title, s(fd, "heading", 250), s(fd, "eyebrow", 100), s(fd, "summary", 1200), s(fd, "hero_image"),
    JSON.stringify(imgs), s(fd, "icon", 40), cleanHtml(String(fd.get("body") ?? "")), s(fd, "meta_title", 200), s(fd, "meta_description", 400),
    b(fd, "show_in_listing"), b(fd, "has_detail"), n(fd, "sort"), b(fd, "published"),
  ] as const;
  if (id) {
    run(`UPDATE pages SET path=?, type=?, template=?, title=?, heading=?, eyebrow=?, summary=?, hero_image=?, images=?, icon=?, body=?, meta_title=?, meta_description=?, show_in_listing=?, has_detail=?, sort=?, published=?, updated_at=datetime('now') WHERE id=?`, ...vals, id);
    refresh();
    return { ok: true, message: "Page saved." };
  }
  const r = run(`INSERT INTO pages (path, type, template, title, heading, eyebrow, summary, hero_image, images, icon, body, meta_title, meta_description, show_in_listing, has_detail, sort, published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, ...vals);
  refresh();
  redirect(`/admin/pages/${r.lastInsertRowid}/?saved=1`);
}

export async function deletePage(fd: FormData) {
  await requireUser();
  const id = n(fd, "id");
  const p = get<{ template: string }>("SELECT template FROM pages WHERE id = ?", id);
  // Template pages (blog, contact, team…) power core site sections and cannot be deleted, only unpublished.
  if (p && p.template !== "default") redirect(`/admin/pages/${id}/?error=core`);
  run("DELETE FROM pages WHERE id = ?", id);
  refresh();
  redirect("/admin/pages/?deleted=1");
}

/* ---------- Team ---------- */

export async function saveTeam(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = n(fd, "id");
  const name = s(fd, "name", 150);
  if (!name) return { ok: false, message: "Name is required." };
  const linkedin = s(fd, "linkedin", 300);
  if (linkedin && !/^https?:\/\//.test(linkedin)) return { ok: false, message: "LinkedIn must be a full URL starting with https://" };
  const vals = [name, s(fd, "position", 150), s(fd, "department", 100) || "Company Management", s(fd, "bio", 3000), s(fd, "photo"), s(fd, "phone", 40), s(fd, "email", 160), linkedin, b(fd, "featured"), n(fd, "sort"), b(fd, "published")] as const;
  if (id) {
    run("UPDATE team SET name=?, position=?, department=?, bio=?, photo=?, phone=?, email=?, linkedin=?, featured=?, sort=?, published=? WHERE id=?", ...vals, id);
    refresh();
    return { ok: true, message: "Team member saved." };
  }
  const r = run("INSERT INTO team (name, position, department, bio, photo, phone, email, linkedin, featured, sort, published) VALUES (?,?,?,?,?,?,?,?,?,?,?)", ...vals);
  refresh();
  redirect(`/admin/team/${r.lastInsertRowid}/?saved=1`);
}

export async function deleteTeam(fd: FormData) {
  await requireUser();
  run("DELETE FROM team WHERE id = ?", n(fd, "id"));
  refresh();
  redirect("/admin/team/?deleted=1");
}

/** Move an item up/down in a sortable table. */
export async function moveItem(fd: FormData) {
  await requireUser();
  const table = s(fd, "table");
  if (!["team", "clients", "faqs", "gallery"].includes(table)) return;
  const id = n(fd, "id");
  const dir = s(fd, "dir") === "up" ? -1 : 1;
  const rows = all<{ id: number }>(`SELECT id FROM ${table} ORDER BY sort, id`);
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  rows.forEach((r, k) => run(`UPDATE ${table} SET sort = ? WHERE id = ?`, k, r.id));
  refresh();
}

/* ---------- Clients, FAQs, Gallery ---------- */

export async function saveClient(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = n(fd, "id");
  const name = s(fd, "name", 150);
  const category = s(fd, "category", 100) || "Miscellaneous";
  if (!name) return { ok: false, message: "Client name is required." };
  if (id) run("UPDATE clients SET name=?, category=?, logo=? WHERE id=?", name, category, s(fd, "logo"), id);
  else run("INSERT INTO clients (name, category, logo, sort) VALUES (?,?,?,(SELECT COALESCE(MAX(sort),0)+1 FROM clients))", name, category, s(fd, "logo"));
  refresh();
  return { ok: true, message: id ? "Client updated." : "Client added." };
}

export async function deleteClient(fd: FormData) {
  await requireUser();
  run("DELETE FROM clients WHERE id = ?", n(fd, "id"));
  refresh();
}

export async function saveFaq(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = n(fd, "id");
  const q = s(fd, "question", 300);
  const a = cleanHtml(String(fd.get("answer") ?? ""));
  if (!q || !a) return { ok: false, message: "Question and answer are required." };
  if (id) run("UPDATE faqs SET question=?, answer=? WHERE id=?", q, a, id);
  else run("INSERT INTO faqs (question, answer, sort) VALUES (?,?,(SELECT COALESCE(MAX(sort),0)+1 FROM faqs))", q, a);
  refresh();
  return { ok: true, message: id ? "FAQ updated." : "FAQ added." };
}

export async function deleteFaq(fd: FormData) {
  await requireUser();
  run("DELETE FROM faqs WHERE id = ?", n(fd, "id"));
  refresh();
}

export async function addGalleryImages(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let urls: string[] = [];
  try { urls = JSON.parse(String(fd.get("images") ?? "[]")); } catch {}
  const category = s(fd, "category", 80) || "Operations";
  urls.filter((u) => typeof u === "string" && u.startsWith("/")).forEach((u) =>
    run("INSERT INTO gallery (image, caption, category, sort) VALUES (?, '', ?, (SELECT COALESCE(MIN(sort),0)-1 FROM gallery))", u, category),
  );
  refresh();
  return { ok: true, message: `${urls.length} image(s) added to the gallery.` };
}

export async function saveGalleryItem(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  run("UPDATE gallery SET caption=?, category=? WHERE id=?", s(fd, "caption", 200), s(fd, "category", 80) || "Operations", n(fd, "id"));
  refresh();
  return { ok: true, message: "Saved." };
}

export async function deleteGalleryItem(fd: FormData) {
  await requireUser();
  run("DELETE FROM gallery WHERE id = ?", n(fd, "id"));
  refresh();
}

/* ---------- Settings (site / home / about JSON) ---------- */

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const key = s(fd, "key");
  if (!["site", "home", "about"].includes(key)) return { ok: false, message: "Unknown settings group." };
  let value: unknown;
  try { value = JSON.parse(String(fd.get("value") ?? "")); } catch { return { ok: false, message: "Could not read the form data." }; }
  // Strip control characters from every string in the tree.
  const clean = (v: unknown): unknown =>
    typeof v === "string" ? cleanText(v, 5000) : Array.isArray(v) ? v.map(clean) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)])) : v;
  run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", key, JSON.stringify(clean(value)));
  refresh();
  return { ok: true, message: "Settings saved. Changes are live." };
}

/* ---------- Inbox ---------- */

export async function setRead(fd: FormData) {
  await requireUser();
  run("UPDATE submissions SET is_read = ? WHERE id = ?", b(fd, "read"), n(fd, "id"));
  revalidatePath("/admin", "layout");
}

export async function deleteSubmission(fd: FormData) {
  await requireUser();
  run("DELETE FROM submissions WHERE id = ?", n(fd, "id"));
  redirect("/admin/inbox/?deleted=1");
}

export async function deleteSubscriber(fd: FormData) {
  await requireUser();
  run("DELETE FROM subscribers WHERE id = ?", n(fd, "id"));
  revalidatePath("/admin/inbox/");
}

/* ---------- Media ---------- */

export async function deleteMedia(fd: FormData) {
  await requireUser();
  const id = n(fd, "id");
  const m = get<{ url: string }>("SELECT url FROM media WHERE id = ?", id);
  if (!m) return;
  if (m.url.startsWith("/uploads/")) {
    const file = path.resolve(UPLOAD_DIR, m.url.slice("/uploads/".length));
    if (file.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) await fs.rm(file, { force: true });
  }
  run("DELETE FROM media WHERE id = ?", id);
  revalidatePath("/admin/media/");
}

export async function saveMediaAlt(fd: FormData) {
  await requireUser();
  run("UPDATE media SET alt = ? WHERE id = ?", s(fd, "alt", 200), n(fd, "id"));
  revalidatePath("/admin/media/");
}
