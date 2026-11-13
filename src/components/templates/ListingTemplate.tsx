import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getSite, listPages } from "@/lib/content";
import { pagePath, telHref } from "@/lib/util";
import { CtaBand, PageHero, Prose, SectionHeading } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import Reveal from "@/components/site/Reveal";

export default function ListingTemplate({ page, type }: { page: PageRow; type: "industry" | "location" }) {
  const site = getSite();
  const items = listPages(type, { listingOnly: true });

  return (
    <>
      <PageHero title={page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <section className="py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading eyebrow={page.eyebrow} title={page.heading || page.title} />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={(i % 2) * 80}>
                <Link href={pagePath(p.path)} className="card-lift group grid h-full overflow-hidden rounded-md border border-line bg-white sm:grid-cols-[220px_1fr]">
                  <div className="relative aspect-[16/9] bg-ink sm:aspect-auto sm:min-h-full">
                    {p.hero_image && <Image src={p.hero_image} alt="" fill sizes="(min-width:640px) 220px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                    <span className="absolute left-4 top-4 grid size-10 place-items-center rounded bg-gold text-ink"><Icon name={p.icon || (type === "location" ? "map" : "building")} className="size-5" /></span>
                  </div>
                  <div className="flex flex-col p-6">
                    <h2 className="font-display text-2xl font-bold uppercase leading-tight">{p.title}</h2>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-steel">{p.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-gold-dark">Explore<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          {page.body && <div className="mt-16 max-w-3xl"><Prose html={page.body} /></div>}
        </div>
      </section>

      {type === "location" && (
        <section className="bg-ink py-20 text-white sm:py-24">
          <div className="container-site">
            <SectionHeading eyebrow="Our Offices" title="Offices across Pakistan" dark />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {site.offices.map((o) => (
                <div key={o.name} className="rounded-md border border-white/10 bg-white/[.03] p-6">
                  <h3 className="font-display text-xl font-bold uppercase text-gold">{o.name}</h3>
                  <p className="mt-3 flex gap-2 text-sm text-white/70"><MapPin className="mt-0.5 size-4 shrink-0" />{o.address}</p>
                  {o.phone && <a href={telHref(o.phone)} className="mt-3 flex items-center gap-2 text-sm font-semibold hover:text-gold"><Phone className="size-4" />{o.phone}</a>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title="Protect your site with Four Stars" text="Tell us about your premises and we will plan the right guard force and equipment." phone={site.phones[0]?.number} />
    </>
  );
}
