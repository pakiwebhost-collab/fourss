import "server-only";
import { all, get } from "./db";
import type {
  ClientRow,
  FaqRow,
  GalleryRow,
  HomeContent,
  PageRow,
  PostRow,
  SiteSettings,
  TeamRow,
} from "./types";
import { defaultAbout, defaultHome, defaultSite } from "@/seed/defaults";
import type { AboutContent } from "./types";

export function getSetting<T>(key: string, fallback: T): T {
  const row = get<{ value: string }>("SELECT value FROM settings WHERE key = ?", key);
  if (!row) return fallback;
  try {
    // Merge over defaults so newly added fields never come back undefined.
    const parsed = JSON.parse(row.value);
    return Array.isArray(fallback) ? parsed : { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export const getSite = () => getSetting<SiteSettings>("site", defaultSite);
export const getHome = () => getSetting<HomeContent>("home", defaultHome);
export const getAbout = () => getSetting<AboutContent>("about", defaultAbout);

export function getPage(path: string, includeDrafts = false) {
  return get<PageRow>(
    `SELECT * FROM pages WHERE path = ? ${includeDrafts ? "" : "AND published = 1"}`,
    path.replace(/^\/|\/$/g, ""),
  );
}

export function listPages(type: PageRow["type"], opts: { listingOnly?: boolean } = {}) {
  return all<PageRow>(
    `SELECT * FROM pages WHERE type = ? AND published = 1 ${opts.listingOnly ? "AND show_in_listing = 1" : ""} ORDER BY sort, title`,
    type,
  );
}

export function pageImages(p: Pick<PageRow, "images">): string[] {
  try {
    return JSON.parse(p.images || "[]");
  } catch {
    return [];
  }
}

const nowIso = () => new Date().toISOString();
const PUBLISHED = `status = 'published' AND (published_at IS NULL OR published_at <= ?)`;

export function listPosts(opts: { category?: string; q?: string; limit?: number; offset?: number } = {}) {
  const where = [PUBLISHED];
  const params: (string | number)[] = [nowIso()];
  if (opts.category) {
    where.push("category = ?");
    params.push(opts.category);
  }
  if (opts.q) {
    where.push("(title LIKE ? OR excerpt LIKE ? OR body LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  const sql = `SELECT * FROM posts WHERE ${where.join(" AND ")} ORDER BY featured DESC, published_at DESC LIMIT ? OFFSET ?`;
  const total = get<{ n: number }>(`SELECT COUNT(*) AS n FROM posts WHERE ${where.join(" AND ")}`, ...params)?.n ?? 0;
  const rows = all<PostRow>(sql, ...params, opts.limit ?? 100, opts.offset ?? 0);
  return { rows, total };
}

export function latestPosts(limit = 3, excludeId = 0) {
  return all<PostRow>(`SELECT * FROM posts WHERE ${PUBLISHED} AND id != ? ORDER BY published_at DESC LIMIT ?`, nowIso(), excludeId, limit);
}

export function postCategories() {
  return all<{ category: string; n: number }>(
    `SELECT category, COUNT(*) AS n FROM posts WHERE ${PUBLISHED} GROUP BY category ORDER BY n DESC`,
    nowIso(),
  );
}

export function getPost(slug: string, includeDrafts = false) {
  return get<PostRow>(`SELECT * FROM posts WHERE slug = ? ${includeDrafts ? "" : `AND ${PUBLISHED}`}`, slug, ...(includeDrafts ? [] : [nowIso()]));
}

export const listTeam = () => all<TeamRow>("SELECT * FROM team WHERE published = 1 ORDER BY sort, id");
export const listClients = () => all<ClientRow>("SELECT * FROM clients ORDER BY sort, id");
export const listGallery = () => all<GalleryRow>("SELECT * FROM gallery ORDER BY sort, id");
export const listFaqs = () => all<FaqRow>("SELECT * FROM faqs ORDER BY sort, id");

export function readingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function groupBy<T, K extends string>(rows: T[], key: (r: T) => K) {
  const map = new Map<K, T[]>();
  for (const r of rows) {
    const k = key(r);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  return [...map.entries()];
}
