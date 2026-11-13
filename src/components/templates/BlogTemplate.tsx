import Link from "next/link";
import { Search } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { listPosts, postCategories } from "@/lib/content";
import { PageHero } from "@/components/site/ui";
import PostCard from "@/components/site/PostCard";
import Reveal from "@/components/site/Reveal";

const PER_PAGE = 9;

export default function BlogTemplate({ page, searchParams }: { page: PageRow; searchParams: Record<string, string | string[] | undefined> }) {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const category = str(searchParams.category);
  const q = str(searchParams.q).slice(0, 80);
  const current = Math.max(1, parseInt(str(searchParams.page) || "1", 10) || 1);
  const filtered = Boolean(category || q);

  const { rows, total } = listPosts({ category: category || undefined, q: q || undefined, limit: PER_PAGE + (filtered || current > 1 ? 0 : 1), offset: (current - 1) * PER_PAGE + (filtered || current === 1 ? 0 : 1) });
  const showFeatured = !filtered && current === 1 && rows.length > 0;
  const featured = showFeatured ? rows[0] : null;
  const grid = showFeatured ? rows.slice(1) : rows;
  const pages = Math.max(1, Math.ceil((filtered ? total : Math.max(0, total - 1)) / PER_PAGE));
  const cats = postCategories();

  const href = (o: { category?: string; page?: number; q?: string }) => {
    const p = new URLSearchParams();
    if (o.category) p.set("category", o.category);
    if (o.q) p.set("q", o.q);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    const s = p.toString();
    return `/blogs/${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHero title={page.heading || page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: "Blogs" }]} size="sm" />

      <div className="sticky top-[72px] z-30 border-b border-line bg-white/95 backdrop-blur lg:top-20">
        <div className="container-site flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Blog categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:pb-0">
            <Link href="/blogs/" className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${!category ? "bg-ink text-white" : "bg-paper text-ink hover:bg-line"}`}>All</Link>
            {cats.map((c) => (
              <Link key={c.category} href={href({ category: c.category })} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === c.category ? "bg-ink text-white" : "bg-paper text-ink hover:bg-line"}`}>
                {c.category} <span className="opacity-50">{c.n}</span>
              </Link>
            ))}
          </nav>
          <form action="/blogs/" method="get" role="search" className="relative md:w-72">
            {category && <input type="hidden" name="category" value={category} />}
            <label htmlFor="blog-q" className="sr-only">Search articles</label>
            <input id="blog-q" name="q" defaultValue={q} placeholder="Search articles…" className="field py-2.5 pl-10" />
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-steel" />
          </form>
        </div>
      </div>

      <section className="py-14 sm:py-20">
        <div className="container-site">
          {filtered && (
            <p className="mb-10 text-steel">
              {total} article{total === 1 ? "" : "s"}{q && <> matching <strong className="text-ink">“{q}”</strong></>}{category && <> in <strong className="text-ink">{category}</strong></>}. <Link href="/blogs/" className="font-semibold text-gold-dark underline">Clear filters</Link>
            </p>
          )}

          {featured && (
            <Reveal className="mb-16 border-b border-line pb-16">
              <p className="eyebrow mb-6">Featured article</p>
              <PostCard post={featured} large />
            </Reveal>
          )}

          {grid.length > 0 ? (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {grid.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 70}><PostCard post={p} /></Reveal>)}
            </div>
          ) : (
            !featured && (
              <div className="rounded-md border border-dashed border-line py-20 text-center">
                <p className="font-display text-2xl font-bold uppercase">No articles found</p>
                <p className="mt-2 text-steel">Try a different search or category.</p>
              </div>
            )
          )}

          {pages > 1 && (
            <nav className="mt-16 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
              {current > 1 && <Link href={href({ category, q, page: current - 1 })} className="rounded border border-line px-4 py-2 text-sm font-semibold hover:bg-paper">← Prev</Link>}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={href({ category, q, page: n })} aria-current={n === current ? "page" : undefined} className={`grid size-10 place-items-center rounded text-sm font-semibold ${n === current ? "bg-ink text-white" : "border border-line hover:bg-paper"}`}>{n}</Link>
              ))}
              {current < pages && <Link href={href({ category, q, page: current + 1 })} className="rounded border border-line px-4 py-2 text-sm font-semibold hover:bg-paper">Next →</Link>}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
