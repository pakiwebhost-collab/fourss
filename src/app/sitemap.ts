import type { MetadataRoute } from "next";
import { all } from "@/lib/db";

const BASE = process.env.SITE_URL || "https://4ssecurity.pk";

// Rebuild on every request so new posts and pages appear immediately.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = all<{ path: string; updated_at: string; type: string; has_detail: number }>(
    "SELECT path, updated_at, type, has_detail FROM pages WHERE published = 1",
  ).filter((p) => p.has_detail || p.type !== "service");
  const posts = all<{ slug: string; updated_at: string }>(
    "SELECT slug, updated_at FROM posts WHERE status = 'published' AND (published_at IS NULL OR published_at <= ?)",
    new Date().toISOString(),
  );
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    ...pages.map((p) => ({ url: `${BASE}/${p.path}/`, lastModified: new Date(p.updated_at + "Z"), priority: p.type === "page" ? 0.8 : 0.7 })),
    ...posts.map((p) => ({ url: `${BASE}/${p.slug}/`, lastModified: new Date(p.updated_at), priority: 0.6 })),
  ];
}
