import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import type { PostRow } from "@/lib/types";
import { formatDate } from "@/lib/util";
import { readingTime } from "@/lib/content";

export default function PostCard({ post, large = false }: { post: PostRow; large?: boolean }) {
  const href = `/${post.slug}/`;
  return (
    <article className={`group flex h-full flex-col ${large ? "lg:grid lg:grid-cols-2 lg:gap-10" : ""}`}>
      <Link href={href} className={`relative block overflow-hidden rounded-md bg-paper ${large ? "aspect-[16/10] lg:aspect-auto lg:min-h-[380px]" : "aspect-[16/10]"}`}>
        {post.cover && <Image src={post.cover} alt={post.title} fill sizes={large ? "(min-width:1024px) 50vw, 100vw" : "(min-width:768px) 33vw, 100vw"} className="object-cover transition-transform duration-500 group-hover:scale-105" />}
        <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">{post.category}</span>
      </Link>
      <div className={`flex flex-1 flex-col ${large ? "pt-6 lg:justify-center lg:pt-0" : "pt-5"}`}>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-steel">
          <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{formatDate(post.published_at)}</span>
          <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{readingTime(post.body)} min read</span>
        </div>
        <h3 className={`mt-3 font-display font-bold uppercase leading-tight ${large ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>
          <Link href={href} className="transition-colors hover:text-gold-dark">{post.title}</Link>
        </h3>
        <p className={`mt-3 flex-1 leading-relaxed text-steel ${large ? "text-base sm:text-lg" : "line-clamp-3 text-sm"}`}>{post.excerpt}</p>
        <Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-ink hover:text-gold-dark">
          Read article<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
