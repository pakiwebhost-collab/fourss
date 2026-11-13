import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, Phone } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getSite, listPages, pageImages } from "@/lib/content";
import { pagePath, telHref, waHref } from "@/lib/util";
import { CtaBand, PageHero, Prose } from "@/components/site/ui";
import { Icon, WhatsappIcon } from "@/components/site/Icon";
import { ContactForm } from "@/components/site/Forms";

const SECTION: Record<string, { label: string; href: string; listLabel: string }> = {
  service: { label: "Our Services", href: "/our-services/", listLabel: "Other services" },
  industry: { label: "Industries", href: "/industries/", listLabel: "Other industries" },
  location: { label: "Locations", href: "/locations/", listLabel: "Areas we cover" },
};

export default function DetailTemplate({ page }: { page: PageRow }) {
  const site = getSite();
  const sec = SECTION[page.type];

  if (!sec) {
    // Simple content / legal page
    return (
      <>
        <PageHero title={page.heading || page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image || undefined} crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} size="sm" />
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-3xl"><Prose html={page.body} /></div>
        </section>
      </>
    );
  }

  const siblings = listPages(page.type as "service").filter((p) => p.has_detail);
  const images = pageImages(page).slice(0, 4);
  const services = listPages("service").map((s) => s.title);
  const crumbs: { label: string; href?: string }[] = [{ label: "Home", href: "/" }, { label: sec.label, href: sec.href }];
  if (page.type === "location" && page.path.split("/").length > 2) crumbs.push({ label: "Karachi", href: "/locations/security-services-karachi/" });
  crumbs.push({ label: page.title });

  return (
    <>
      <PageHero title={page.heading || page.title} eyebrow={page.eyebrow || sec.label} summary={page.summary} image={page.hero_image || undefined} crumbs={crumbs}>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#enquire" className="btn btn-gold">Get a Quote<ArrowRight className="size-4" /></a>
          {site.whatsapp[0] && <a href={waHref(site.whatsapp[0].number, `${site.whatsappMessage} (${page.title})`)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><WhatsappIcon className="size-4" />WhatsApp</a>}
        </div>
      </PageHero>

      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            <Prose html={page.body} />
            {images.length > 0 && (
              <div className={`mt-12 grid gap-4 ${images.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {images.map((src) => (
                  <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-md bg-paper">
                    <Image src={src} alt={page.title} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-md bg-ink text-white">
              <div className="p-6">
                <p className="eyebrow">Talk to us</p>
                <h2 className="h-display mt-2 text-2xl">Need this service?</h2>
                <p className="mt-2 text-sm text-white/65">Speak to our operations team for a site survey and quotation.</p>
                <div className="mt-5 space-y-2">
                  {site.phones.slice(0, 2).map((p) => (
                    <a key={p.number} href={telHref(p.number)} className="flex items-center gap-3 rounded bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-gold hover:text-ink"><Phone className="size-4" />{p.number}</a>
                  ))}
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 rounded bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-gold hover:text-ink"><Mail className="size-4" />{site.email}</a>
                </div>
              </div>
            </div>
            <nav className="rounded-md border border-line p-6" aria-label={sec.listLabel}>
              <h2 className="font-display text-lg font-bold uppercase">{sec.listLabel}</h2>
              <ul className="mt-4 space-y-1">
                {siblings.map((s) => (
                  <li key={s.id}>
                    <Link href={pagePath(s.path)} aria-current={s.id === page.id ? "page" : undefined} className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${s.id === page.id ? "bg-gold/15 text-ink" : "text-ink/75 hover:bg-paper"}`}>
                      <Icon name={s.icon} className="size-4 shrink-0 text-gold-dark" />{s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-24 bg-paper py-16 sm:py-20">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Enquire</p>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl">Request a quote for {page.title}</h2>
            <p className="mt-4 text-steel">Share a few details and we will begin with a site survey. Government approved since 1994, member APSAA.</p>
          </div>
          <div className="rounded-md bg-white p-6 shadow-sm sm:p-8"><ContactForm services={services} kind="quote" compact /></div>
        </div>
      </section>

      <CtaBand title="Guards on 24 hours notice" text="In an emergency we can arrange the required strength of guards on 24 hours notice." phone={site.phones[0]?.number} />
    </>
  );
}
