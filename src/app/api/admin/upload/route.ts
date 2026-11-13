import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { currentUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/paths";

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif",
  "application/pdf": ".pdf", "video/mp4": ".mp4", "video/webm": ".webm",
};
const MAX = 25 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await currentUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const fd = await req.formData();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "No files" }, { status: 400 });

  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(UPLOAD_DIR, sub);
  await fs.mkdir(dir, { recursive: true });
  const out: { url: string; name: string }[] = [];
  const errors: string[] = [];

  for (const f of files) {
    const ext = ALLOWED[f.type];
    if (!ext) { errors.push(`${f.name}: file type not allowed`); continue; }
    if (f.size > MAX) { errors.push(`${f.name}: larger than 25 MB`); continue; }
    const base = path.basename(f.name, path.extname(f.name)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
    let buf: Buffer = Buffer.from(await f.arrayBuffer());
    let finalExt = ext;
    // Resize very large photos and store them as WebP to keep pages fast.
    if (["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      try {
        const img = sharp(buf, { failOn: "none" }).rotate();
        const meta = await img.metadata();
        buf = await img.resize({ width: Math.min(meta.width ?? 2400, 2400), withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
        finalExt = ".webp";
      } catch {
        errors.push(`${f.name}: not a valid image`);
        continue;
      }
    }
    const name = `${base}-${crypto.randomBytes(3).toString("hex")}${finalExt}`;
    await fs.writeFile(path.join(dir, name), buf);
    const url = `/uploads/${sub}/${name}`;
    run("INSERT INTO media (url, name, mime, size) VALUES (?, ?, ?, ?)", url, f.name.slice(0, 200), finalExt === ".webp" ? "image/webp" : f.type, buf.length);
    out.push({ url, name: f.name });
  }
  return Response.json({ files: out, errors });
}
