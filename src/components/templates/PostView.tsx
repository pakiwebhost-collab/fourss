import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import type { PostRow } from "@/lib/types";
import { getSite, latestPosts, readingTime } from "@/lib/content";
import { formatDate, slugify } from "@/lib/util";
import { Breadcrumbs, CtaBand, Prose } from "@/components/site/ui";
import PostCard from "@/components/site/PostCard";
import ShareButtons from "@/components/site/ShareButtons";

function withHeadingIds(html: string) {
  const toc: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugify(text) || "section";
    while (used.has(id)) id += "-2";
    used.add(id);
    toc.push({ id, text });
    return `<h2${attrs} id="${id}" class="scroll-mt-28">${inner}</h2>`;
  });
  return { html: out, toc };
}

export default function PostView({ post }: { post: PostRow }) {
  const site = getSite();
  const { html, toc } = withHeadingIds(post.body);
  const related = latestPosts(3, post.id);
  const url = `https://4ssecurity.pk/${post.slug}/`;
  const tags = post.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover ? `https://4ssecurity.pk${post.cover}` : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: site.companyName, logo: { "@type": "ImageObject", url: "https://4ssecurity.pk/brand/logo-dark.webp" } },
    mainEntityOfPage: url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {post.status !== "published" && <div className="bg-amber-100 py-2 text-center text-sm font-semibold text-amber-900">Draft preview — this post is not published yet.</div>}

      <header className="bg-ink pb-40 pt-12 text-white sm:pt-16">
        <div className="container-site max-w-4xl">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blogs", href: "/blogs/" }, { label: post.category, href: `/blogs/?category=${encodeURIComponent(post.category)}` }]} />
          <Link href={`/blogs/?category=${encodeURIComponent(post.category)}`} className="mt-8 inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">{post.category}</Link>
          <h1 className="h-display mt-5 text-4xl sm:text-5xl lg:text-6xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/65">
            <span className="flex items-center gap-2"><User className="size-4 text-gold" />{post.author}</span>
            <span className="flex items-center gap-2"><Calendar className="size-4 text-gold" />{formatDate(post.published_at)}</span>
            <span className="flex items-center gap-2"><Clock className="size-4 text-gold" />{readingTime(post.body)} min read</span>
          </div>
        </div>
      </header>

      <div className="container-site -mt-32 max-w-5xl">
        {post.cover && (
          <div className="relative aspect-[16/8] overflow-hidden rounded-md bg-paper shadow-2xl">
            <Image src={post.cover} alt={post.title} fill priority sizes="(min-width:1024px) 1024px, 100vw" className="object-cover" />
          </div>
        )}
      </div>

      <section className="py-14 sm:py-16">
        <div className="container-site grid max-w-6xl gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="order-2 lg:order-1">
            <div className="space-y-8 lg:sticky lg:top-28">
              {toc.length > 1 && (
                <nav aria-label="Table of contents" className="hidden lg:block">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-steel">In this article</p>
                  <ol className="mt-4 space-y-2 border-l border-line">
                    {toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-sm leading-snug text-ink/70 hover:border-gold hover:text-ink">{t.text}</a></li>)}
                  </ol>
                </nav>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-steel">Share</p>
                <div className="mt-3"><ShareButtons url={url} title={post.title} /></div>
              </div>
            </div>
          </aside>

          <article className="order-1 min-w-0 lg:order-2">
            {post.excerpt && <p className="mb-8 border-l-4 border-gold pl-5 text-xl leading-relaxed text-ink/80">{post.excerpt}</p>}
            <Prose html={html} />
            {tags.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-line pt-8">
                <Tag className="size-4 text-steel" />
                {tags.map((t) => <Link key={t} href={`/blogs/?q=${encodeURIComponent(t)}`} className="rounded-full bg-paper px-3 py-1 text-sm hover:bg-line">{t}</Link>)}
              </div>
            )}
            <div className="mt-10 flex flex-col gap-5 rounded-md bg-paper p-6 sm:flex-row sm:items-center sm:p-8">
              <Image src="/images/site/Icon.webp" alt="" width={56} height={68} className="shrink-0" />
              <div className="flex-1">
                <p className="font-display text-lg font-bold uppercase">{site.companyName}</p>
                <p className="mt-1 text-sm text-steel">Government approved security company protecting people, property and assets across Pakistan since 1994.</p>
              </div>
              <Link href="/contact-us/" className="btn btn-dark shrink-0">Get a Quote</Link>
            </div>
            <Link href="/blogs/" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-gold-dark"><ArrowLeft className="size-4" />Back to all articles</Link>
          </article>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper py-20">
          <div className="container-site">
            <h2 className="h-display text-3xl sm:text-4xl">Keep reading</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">{related.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      )}
      <CtaBand title="Need professional security?" text="Talk to Four Stars about guards, escorts, CCTV and executive protection." phone={site.phones[0]?.number} />
    </>
  );
}
