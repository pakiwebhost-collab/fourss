import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getSite, listPages, pageImages } from "@/lib/content";
import { pagePath } from "@/lib/util";
import { CtaBand, PageHero, Prose, SectionHeading } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import Reveal from "@/components/site/Reveal";

export default function ServicesTemplate({ page }: { page: PageRow }) {
  const site = getSite();
  const services = listPages("service", { listingOnly: true });
  const images = pageImages(page);

  return (
    <>
      <PageHero title={page.title} eyebrow={page.eyebrow} summary="Government approved security services across Pakistan since 1994." image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />

      <section id="all-services" className="scroll-mt-24 py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Services" title={page.heading} text={page.summary} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const body = (
                <>
                  <div className="flex items-start justify-between">
                    <span className="grid size-14 place-items-center rounded-md bg-ink text-gold transition-colors group-hover:bg-gold group-hover:text-ink"><Icon name={s.icon} className="size-6" /></span>
                    <span className="font-display text-sm font-bold text-ink/25">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold uppercase leading-tight">{s.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{s.summary}</p>
                  {s.has_detail ? (
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-gold-dark">Learn more<ArrowUpRight className="size-4" /></span>
                  ) : (
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-steel">Available on request</span>
                  )}
                </>
              );
              return (
                <Reveal key={s.id} delay={(i % 3) * 70} className="h-full">
                  {s.has_detail ? (
                    <Link href={pagePath(s.path)} className="card-lift group flex h-full flex-col rounded-md border border-line bg-white p-7">{body}</Link>
                  ) : (
                    <Link href={`/contact-us/?service=${encodeURIComponent(s.title)}`} className="card-lift group flex h-full flex-col rounded-md border border-line bg-white p-7">{body}</Link>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {page.body && (
        <section className="bg-paper py-20 sm:py-24">
          <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
            <Prose html={page.body} />
            {images.length > 0 && (
              <div className="grid content-start gap-4 lg:sticky lg:top-28">
                {images.map((src) => (
                  <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-md">
                    <Image src={src} alt="" fill sizes="(min-width:1024px) 420px, 100vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <CtaBand title="Provision of services on short notice" text="Any size of security task within a week. Guards on 24 hours notice in an emergency." phone={site.phones[0]?.number} />
    </>
  );
}
