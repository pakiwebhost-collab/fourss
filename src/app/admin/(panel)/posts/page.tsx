import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search, Star } from "lucide-react";
import { all } from "@/lib/db";
import { formatDate } from "@/lib/util";
import type { PostRow } from "@/lib/types";
import { Badge, Notice, PageHeader, btnPrimary } from "@/components/admin/ui";

export default async function PostsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; deleted?: string }> }) {
  const { q = "", status = "", deleted } = await searchParams;
  const where: string[] = [];
  const params: string[] = [];
  if (q) { where.push("(title LIKE ? OR category LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (status === "published" || status === "draft") { where.push("status = ?"); params.push(status); }
  const posts = all<PostRow>(`SELECT * FROM posts ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY COALESCE(published_at, created_at) DESC`, ...params);
  const now = new Date().toISOString();

  return (
    <>
      <PageHeader title="Blog posts" description="Write, publish and schedule articles." actions={<Link href="/admin/posts/new/" className={btnPrimary}><Plus className="size-4" />New post</Link>} />
      {deleted && <Notice>Post deleted.</Notice>}
      <form className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input name="q" defaultValue={q} placeholder="Search posts…" className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm" />
        </div>
        <select name="status" defaultValue={status} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
          <option value="">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option>
        </select>
        <button className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium">Filter</button>
      </form>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <ul className="divide-y divide-zinc-100">
          {posts.map((p) => {
            const scheduled = p.status === "published" && p.published_at && p.published_at > now;
            return (
              <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.cover && <img src={p.cover} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/posts/${p.id}/`} className="flex items-center gap-2 font-medium hover:text-amber-700">
                    {p.featured ? <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" /> : null}<span className="truncate">{p.title}</span>
                  </Link>
                  <p className="mt-0.5 text-xs text-zinc-500">{p.category} · {p.published_at ? formatDate(p.published_at) : "Not published"} · /{p.slug}/</p>
                </div>
                <div className="flex items-center gap-2">
                  {scheduled ? <Badge tone="blue">scheduled</Badge> : <Badge tone={p.status === "published" ? "green" : "amber"}>{p.status}</Badge>}
                  <a href={`/${p.slug}/${p.status !== "published" || scheduled ? "?preview=1" : ""}`} target="_blank" className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" aria-label="View"><ExternalLink className="size-4" /></a>
                  <Link href={`/admin/posts/${p.id}/`} className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" aria-label="Edit"><Pencil className="size-4" /></Link>
                </div>
              </li>
            );
          })}
          {!posts.length && <li className="p-10 text-center text-sm text-zinc-500">No posts found.</li>}
        </ul>
      </div>
    </>
  );
}
