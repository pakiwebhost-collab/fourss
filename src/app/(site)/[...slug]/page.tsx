import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPost, getSite } from "@/lib/content";
import { currentUser } from "@/lib/auth";
import { excerpt, pagePath } from "@/lib/util";
import type { PageRow } from "@/lib/types";
import DetailTemplate from "@/components/templates/DetailTemplate";
import ServicesTemplate from "@/components/templates/ServicesTemplate";
import ListingTemplate from "@/components/templates/ListingTemplate";
import ClientsTemplate from "@/components/templates/ClientsTemplate";
import AboutTemplate from "@/components/templates/AboutTemplate";
import TeamTemplate from "@/components/templates/TeamTemplate";
import BlogTemplate from "@/components/templates/BlogTemplate";
import GalleryTemplate from "@/components/templates/GalleryTemplate";
import ContactTemplate from "@/components/templates/ContactTemplate";
import FaqsTemplate from "@/components/templates/FaqsTemplate";
import PostView from "@/components/templates/PostView";

type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function resolve(slug: string[], preview: boolean) {
  const path = slug.map(decodeURIComponent).join("/");
  const drafts = preview && !!(await currentUser());
  const page = getPage(path, drafts);
  if (page) return { page } as const;
  if (slug.length === 1) {
    const post = getPost(path, drafts);
    if (post) return { post } as const;
  }
  return null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const r = await resolve(slug, sp.preview === "1");
  if (!r) return { title: "Page not found | Four Stars Security" };
  const site = getSite();
  if ("page" in r && r.page) {
    const p = r.page;
    const title = p.meta_title || `${p.title} | ${site.shortName}`;
    const description = p.meta_description || p.summary || excerpt(p.body);
    return {
      title, description,
      alternates: { canonical: pagePath(p.path) },
      openGraph: { title, description, images: p.hero_image ? [p.hero_image] : undefined, type: "website" },
    };
  }
  const post = r.post!;
  const title = post.meta_title || `${post.title} | ${site.shortName}`;
  const description = post.meta_description || post.excerpt || excerpt(post.body);
  return {
    title, description,
    alternates: { canonical: `/${post.slug}/` },
    openGraph: { title, description, images: post.cover ? [post.cover] : undefined, type: "article", publishedTime: post.published_at ?? undefined },
  };
}

function renderPage(page: PageRow, sp: Record<string, string | string[] | undefined>) {
  switch (page.template) {
    case "services": return <ServicesTemplate page={page} />;
    case "industries": return <ListingTemplate page={page} type="industry" />;
    case "locations": return <ListingTemplate page={page} type="location" />;
    case "clients": return <ClientsTemplate page={page} />;
    case "about": return <AboutTemplate page={page} />;
    case "team": return <TeamTemplate page={page} />;
    case "blog": return <BlogTemplate page={page} searchParams={sp} />;
    case "gallery": return <GalleryTemplate page={page} />;
    case "contact": return <ContactTemplate page={page} service={typeof sp.service === "string" ? sp.service : ""} />;
    case "faqs": return <FaqsTemplate page={page} />;
    default: return <DetailTemplate page={page} />;
  }
}

export default async function CatchAll({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const r = await resolve(slug, sp.preview === "1");
  if (!r) notFound();
  if ("page" in r && r.page) {
    if (!r.page.has_detail && r.page.type === "service") notFound();
    return renderPage(r.page, sp);
  }
  return <PostView post={r.post!} />;
}
