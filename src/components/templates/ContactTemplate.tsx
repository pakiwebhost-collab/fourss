import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getSite, listPages } from "@/lib/content";
import { telHref, waHref } from "@/lib/util";
import { PageHero } from "@/components/site/ui";
import { ContactForm } from "@/components/site/Forms";
import { FacebookIcon, LinkedinIcon, WhatsappIcon } from "@/components/site/Icon";
import Reveal from "@/components/site/Reveal";

export default function ContactTemplate({ page, service = "" }: { page: PageRow; service?: string }) {
  const site = getSite();
  const services = listPages("service").map((s) => s.title);

  return (
    <>
      <PageHero title={page.title} eyebrow="Get in touch" summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} size="sm" />

      <section className="relative z-10 -mt-px bg-ink pb-12">
        <div className="container-site grid gap-px overflow-hidden rounded-md bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <a href={telHref(site.phones[0]?.number ?? "")} className="flex items-center gap-4 bg-ink-2 p-6 text-white hover:bg-ink-3"><Phone className="size-6 text-gold" /><span><span className="block text-xs uppercase tracking-wider text-white/50">Call us</span><span className="font-semibold">{site.phones[0]?.number}</span></span></a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-4 bg-ink-2 p-6 text-white hover:bg-ink-3"><Mail className="size-6 text-gold" /><span><span className="block text-xs uppercase tracking-wider text-white/50">Email</span><span className="font-semibold">{site.email}</span></span></a>
          {site.whatsapp[0] && <a href={waHref(site.whatsapp[0].number, site.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-ink-2 p-6 text-white hover:bg-ink-3"><WhatsappIcon className="size-6 text-gold" /><span><span className="block text-xs uppercase tracking-wider text-white/50">WhatsApp</span><span className="font-semibold">{site.whatsapp[0].number}</span></span></a>}
          <div className="flex items-center gap-4 bg-ink-2 p-6 text-white"><Clock className="size-6 text-gold" /><span><span className="block text-xs uppercase tracking-wider text-white/50">Office hours</span><span className="font-semibold">{site.hours}</span></span></div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <p className="eyebrow">Contact Us</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">{page.heading}</h2>
            <p className="mt-4 text-steel">{page.summary}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {site.offices.map((o, i) => (
                <Reveal key={o.name} delay={i * 60} className={`rounded-md border p-5 ${i === 0 ? "border-gold bg-gold/5" : "border-line"}`}>
                  <h3 className="font-display text-lg font-bold uppercase">{o.name}</h3>
                  <p className="mt-2 flex gap-2 text-sm text-steel"><MapPin className="mt-0.5 size-4 shrink-0 text-gold-dark" />{o.address}</p>
                  {o.phone && <a href={telHref(o.phone)} className="mt-2 flex items-center gap-2 text-sm font-semibold hover:text-gold-dark"><Phone className="size-4 text-gold-dark" />{o.phone}</a>}
                </Reveal>
              ))}
            </div>
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-steel">Official social media</p>
              <div className="mt-3 flex gap-2">
                {site.social.facebook && <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid size-11 place-items-center rounded-full bg-ink text-white hover:bg-gold hover:text-ink"><FacebookIcon className="size-5" /></a>}
                {site.social.linkedin && <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid size-11 place-items-center rounded-full bg-ink text-white hover:bg-gold hover:text-ink"><LinkedinIcon className="size-5" /></a>}
              </div>
            </div>
          </div>
          <div className="rounded-md border border-line bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.25)] sm:p-10">
            <h2 className="font-display text-2xl font-bold uppercase">Send us a message</h2>
            <p className="mb-6 mt-1 text-sm text-steel">We reply within 24 hours.</p>
            <ContactForm services={services} defaultService={service.slice(0, 80)} />
          </div>
        </div>
      </section>

      {site.mapEmbed && (
        <section aria-label="Map" className="h-[420px] bg-paper">
          <iframe src={site.mapEmbed} title="Four Stars Security head office map" className="h-full w-full border-0 grayscale-[.3]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </section>
      )}
    </>
  );
}
