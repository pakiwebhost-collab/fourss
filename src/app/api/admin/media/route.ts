import { currentUser } from "@/lib/auth";
import { all } from "@/lib/db";
import type { MediaRow } from "@/lib/types";

export async function GET(req: Request) {
  if (!(await currentUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  const rows = all<MediaRow>(
    "SELECT * FROM media WHERE mime LIKE 'image/%' AND (name LIKE ? OR url LIKE ?) ORDER BY id DESC LIMIT 300",
    `%${q}%`, `%${q}%`,
  );
  return Response.json({ items: rows });
}
