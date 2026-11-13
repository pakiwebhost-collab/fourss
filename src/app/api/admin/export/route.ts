import { currentUser } from "@/lib/auth";
import { all } from "@/lib/db";

const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  // Prefix cells that start with formula characters so spreadsheets don't execute them.
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
};

export async function GET(req: Request) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  const type = new URL(req.url).searchParams.get("type") === "subscribers" ? "subscribers" : "submissions";
  const rows =
    type === "subscribers"
      ? all("SELECT email, created_at FROM subscribers ORDER BY id DESC")
      : all("SELECT id, kind, name, phone, email, subject, message, source, created_at FROM submissions ORDER BY id DESC");
  return new Response("﻿" + csv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="4ss-${type}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
