import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getHome, getSite, latestPosts, listClients, listPages } from "@/lib/content";
import { pagePath, telHref } from "@/lib/util";
import { Icon } from "@/components/site/Icon";
import Reveal from "@/components/site/Reveal";
import { CtaBand, SectionHeading } from "@/components/site/ui";
import { ContactForm } from "@/components/site/Forms";
import PostCard from "@/components/site/PostCard";

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    title: site.defaultMetaTitle,
    description: site.defaultMetaDescription,
    alternates: { canonical: "/" },
    openGraph: { title: site.defaultMetaTitle, description: site.defaultMetaDescription, images: ["/images/site/1-4.webp"], type: "website" },
  };
}

export default function HomePage() {
  const home = getHome();
  const site = getSite();
  const services = listPages("service");
  const industries = listPages("industry");
  const locations = listPages("location");
  const clients = listClients();
  const posts = latestPosts(3);
  const { hero, stats, about, recruitment, equipment, trust } = home;
  const siteUrl = process.env.SITE_URL || "https://4ssecurity.pk";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SecurityService",
    name: site.companyName,
    url: new URL("/", siteUrl).href,
    logo: new URL("/brand/logo-dark.webp", siteUrl).href,
    telephone: site.phones[0]?.number,
    email: site.email,
    foundingDate: "1994-03-07",
    address: { "@type": "PostalAddress", streetAddress: site.address, addressLocality: "Karachi", addressCountry: "PK" },
    openingHours: "Mo-Sa 09:00-18:00",
    sameAs: Object.values(site.social).filter(Boolean),
    areaServed: ["Sindh", "Balochistan", "Khyber Pakhtunkhwa", "Islamabad"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[62%]">
          <Image src={hero.image} alt="Four Stars Security armed personnel" fill priority sizes="(min-width:1024px) 62vw, 100vw" className="object-cover object-center" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/20 lg:via-ink/80 lg:to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <Image src="/images/site/Icon.webp" alt="" width={430} height={520} className="pointer-events-none absolute -left-24 top-10 -z-10 w-[420px] opacity-[.05]" />

        <div className="container-site flex min-h-[72svh] flex-col justify-center pb-12 pt-16 lg:min-h-[calc(100svh-120px)] lg:pb-44">
          <div className="max-w-2xl">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className="h-display mt-5 text-[2.75rem] sm:text-6xl lg:text-7xl">
              {hero.title}
              <span className="mt-1 block text-gold">{hero.highlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={hero.primary.href} className="btn btn-gold">{hero.primary.label}<ArrowRight className="size-4" /></Link>
              <Link href={hero.secondary.href} className="btn btn-ghost">{hero.secondary.label}</Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
              {hero.badges.map((b) => (
                <li key={b} className="flex items-center gap-2"><BadgeCheck className="size-4 text-gold" />{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative lg:absolute lg:inset-x-0 lg:bottom-0">
          <div className="container-site">
            <dl className="grid grid-cols-2 border-t border-white/10 bg-ink/70 backdrop-blur lg:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i} className={`flex flex-col-reverse px-4 py-5 sm:px-6 sm:py-7 ${i % 2 ? "border-l border-white/10" : ""} ${i > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                  <dt className="order-2 mt-1 text-xs uppercase tracking-wider text-white/55 sm:text-sm">{s.label}</dt>
                  <dd className="font-display text-3xl font-bold text-gold sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 sm:py-28">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md sm:aspect-[5/5]">
              <Image src={about.image} alt="Four Stars Security team" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-2 rounded-md bg-ink p-6 text-white shadow-2xl sm:-right-6 sm:p-8">
              <p className="font-display text-5xl font-bold text-gold sm:text-6xl">1994</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-white/70">Serving Pakistan since</p>
            </div>
            <div className="absolute -left-3 -top-3 -z-10 h-2/3 w-2/3 border-l-4 border-t-4 border-gold" />
          </Reveal>
          <div>
            <SectionHeading eyebrow={about.eyebrow} title={about.title} />
            <Reveal delay={100}><p className="mt-6 text-lg leading-relaxed text-steel">{about.text}</p></Reveal>
            <Reveal delay={150}>
              <ul className="mt-7 space-y-3">
                {about.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 font-medium"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-dark"><Check className="size-3.5" /></span>{p}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={200} className="mt-9 flex flex-wrap gap-3">
              <Link href={about.cta.href} className="btn btn-dark">{about.cta.label}<ArrowRight className="size-4" /></Link>
              <Link href="/about-us/" className="btn btn-outline">About Us</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={home.services.eyebrow} title={home.services.title} text={home.services.text} />
            <Reveal><Link href="/our-services/" className="btn btn-outline shrink-0">All Services<ArrowRight className="size-4" /></Link></Reveal>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.services.items.map((s, i) => (
              <Reveal key={s.title} delay={i * 80} as="article" className="card-lift group flex flex-col overflow-hidden rounded-md bg-white">
                <Link href={s.href} className="relative block aspect-[4/3] overflow-hidden">
                  <Image src={s.image} alt={s.title} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 font-display text-sm font-bold text-white/90">0{i + 1}</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold uppercase leading-tight"><Link href={s.href} className="hover:text-gold-dark">{s.title}</Link></h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{s.text}</p>
                  <Link href={s.href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-gold-dark" aria-label={`Learn more about ${s.title}`}>Learn more<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => {
              const inner = (
                <>
                  <Icon name={s.icon} className="size-5 shrink-0 text-gold-dark" />
                  <span className="text-sm font-semibold leading-snug">{s.title}</span>
                </>
              );
              return s.has_detail ? (
                <Link key={s.id} href={pagePath(s.path)} className="flex items-center gap-3 bg-white px-5 py-4 transition hover:bg-ink hover:text-white">{inner}</Link>
              ) : (
                <Link key={s.id} href="/our-services/#all-services" className="flex items-center gap-3 bg-white px-5 py-4 transition hover:bg-ink hover:text-white">{inner}</Link>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* RECRUITMENT */}
      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
        <div className="noise absolute inset-0" />
        <div className="container-site relative grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="relative order-2 aspect-[4/3] overflow-hidden rounded-md lg:order-1">
            <Image src={recruitment.image} alt="Trained Four Stars security guards" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow={recruitment.eyebrow} title={recruitment.title} text={recruitment.text} dark />
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {recruitment.pillars.map((p, i) => (
                <Reveal key={p.title} delay={i * 100} className="rounded-md border border-white/10 bg-white/[.03] p-5">
                  <p className="font-display text-3xl font-bold text-gold">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold uppercase">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{p.text}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-9"><Link href="/contact-us/" className="btn btn-gold">Contact Us<ArrowRight className="size-4" /></Link></Reveal>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="py-20 sm:py-28">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={equipment.eyebrow} title={equipment.title} text={equipment.text} />
            <Reveal delay={100}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {equipment.items.map((it) => (
                  <li key={it} className="flex items-center gap-3 rounded-md border border-line px-4 py-3.5 font-semibold"><ShieldCheck className="size-5 shrink-0 text-gold-dark" />{it}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150} className="mt-9"><Link href={equipment.cta.href} className="btn btn-dark">{equipment.cta.label}<ArrowRight className="size-4" /></Link></Reveal>
          </div>
          <Reveal className="relative grid grid-cols-5 gap-4">
            <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-md">
              <Image src={equipment.image} alt="Walk through gate" fill sizes="(min-width:1024px) 30vw, 60vw" className="object-cover" />
            </div>
            <div className="col-span-2 flex flex-col gap-4 pt-12">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                <Image src={equipment.image2} alt="Fire alarm system" fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover" />
              </div>
              <div className="rounded-md bg-gold p-5 text-ink">
                <p className="font-display text-2xl font-bold uppercase leading-none">Govt. Approved</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider">Equipment & Devices</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* INDUSTRIES + LOCATIONS */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading eyebrow="Sectors & Coverage" title="Industries we protect, places we serve" center />
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {industries.map((p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <Link href={pagePath(p.path)} className="card-lift group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-md bg-ink p-6 text-white">
                    {p.hero_image && <Image src={p.hero_image} alt="" fill sizes="(min-width:1024px) 28vw, (min-width:640px) 50vw, 100vw" className="object-cover opacity-50 transition-transform duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                    <div className="relative">
                      <span className="grid size-11 place-items-center rounded bg-gold text-ink"><Icon name={p.icon} className="size-5" /></span>
                      <h3 className="mt-4 font-display text-2xl font-bold uppercase leading-tight">{p.title}</h3>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gold">Explore<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <Reveal className="flex flex-col rounded-md bg-white p-6 sm:p-8">
              <p className="eyebrow">Locations</p>
              <h3 className="h-display mt-3 text-3xl">Karachi & beyond</h3>
              <ul className="mt-6 flex-1 divide-y divide-line">
                {locations.map((l) => (
                  <li key={l.id}>
                    <Link href={pagePath(l.path)} className="group flex items-center justify-between gap-3 py-3.5 font-semibold hover:text-gold-dark">
                      <span className="flex items-center gap-3"><MapPin className="size-4 text-gold-dark" />{l.title}</span>
                      <ArrowRight className="size-4 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded bg-paper p-4 text-sm text-steel">Regional offices in <strong className="text-ink">Peshawar, Islamabad & Quetta</strong>. Serving Sindh, Balochistan, KP & Islamabad.</div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="relative isolate overflow-hidden bg-ink py-20 text-white sm:py-28">
        <Image src={trust.image} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/85 to-ink" />
        <div className="container-site grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={trust.eyebrow} title={trust.title} dark />
            {trust.text.split(/\n\s*\n/).map((para, i) => (
              <Reveal key={i} delay={i * 80}><p className="mt-5 leading-relaxed text-white/70">{para}</p></Reveal>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trust.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 90} className={`group relative aspect-square overflow-hidden rounded-md ${i % 2 ? "translate-y-8" : ""}`}>
                <Image src={v.image} alt="" fill sizes="(min-width:1024px) 22vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-display text-lg font-bold uppercase leading-tight sm:text-xl">{v.title}</h3>
                  <p className="mt-1 hidden text-sm text-white/70 sm:block">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS MARQUEE */}
      {clients.length > 0 && (
        <section className="border-b border-line py-12" aria-label="Clients">
          <div className="container-site flex flex-col items-center gap-2 text-center">
            <p className="eyebrow">Trusted by</p>
            <p className="text-sm text-steel">Consulates, international companies, hospitals, schools and housing societies</p>
          </div>
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
            <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
              {[...clients, ...clients].map((c, i) => (
                <span key={i} aria-hidden={i >= clients.length} className="whitespace-nowrap rounded-full border border-line bg-white px-5 py-2.5 font-display text-base font-semibold uppercase tracking-wide text-ink/80">{c.name}</span>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center"><Link href="/client/" className="text-sm font-semibold uppercase tracking-wider text-gold-dark hover:text-ink">View all clients →</Link></div>
        </section>
      )}

      {/* BLOG */}
      {posts.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-site">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow={home.blog.eyebrow} title={home.blog.title} />
              <Reveal><Link href="/blogs/" className="btn btn-outline">All Articles<ArrowRight className="size-4" /></Link></Reveal>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {posts.map((p, i) => <Reveal key={p.id} delay={i * 80}><PostCard post={p} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      {/* QUOTE */}
      <section id="quote" className="bg-ink-2 py-20 text-white sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading eyebrow="Get in touch" title="Request a free security assessment" text="Tell us about your site and our team will plan the right mix of guards, supervision and equipment. We reply within 24 hours." dark />
            <Reveal delay={100}>
              <ul className="mt-8 space-y-4">
                {site.phones.slice(0, 2).map((p) => (
                  <li key={p.number}><a href={telHref(p.number)} className="flex items-center gap-4 hover:text-gold"><span className="grid size-11 place-items-center rounded bg-white/5 text-gold"><Phone className="size-5" /></span><span><span className="block text-xs uppercase tracking-wider text-white/50">{p.label}</span>{p.number}</span></a></li>
                ))}
                <li><a href={`mailto:${site.email}`} className="flex items-center gap-4 hover:text-gold"><span className="grid size-11 place-items-center rounded bg-white/5 text-gold"><Mail className="size-5" /></span><span><span className="block text-xs uppercase tracking-wider text-white/50">Email</span>{site.email}</span></a></li>
                <li className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded bg-white/5 text-gold"><MapPin className="size-5" /></span><span><span className="block text-xs uppercase tracking-wider text-white/50">Head Office</span>{site.address}</span></li>
              </ul>
            </Reveal>
          </div>
          <Reveal className="rounded-md border border-white/10 bg-white/[.03] p-6 sm:p-8">
            <ContactForm services={services.map((s) => s.title)} dark kind="quote" />
          </Reveal>
        </div>
      </section>

      <CtaBand title={home.cta.title} text={home.cta.text} href={home.cta.button.href} label={home.cta.button.label} phone={site.phones[1]?.number} />
    </>
  );
}
