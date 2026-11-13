import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, Target } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getAbout, getSite, listTeam, pageImages } from "@/lib/content";
import { CtaBand, PageHero, Prose, SectionHeading } from "@/components/site/ui";
import Reveal from "@/components/site/Reveal";
import TeamCard from "@/components/site/TeamCard";

export default function AboutTemplate({ page }: { page: PageRow }) {
  const site = getSite();
  const about = getAbout();
  const team = listTeam().filter((t) => t.featured).slice(0, 4);
  const [img1, img2] = pageImages(page);

  return (
    <>
      <PageHero title={page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />

      <section className="py-20 sm:py-28">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who we are" title={page.heading} />
            <Reveal delay={100} className="mt-6"><Prose html={page.body} /></Reveal>
            <Reveal delay={150}>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
                {about.highlights.map((h) => (
                  <div key={h.label}><dd className="font-display text-3xl font-bold text-gold-dark sm:text-4xl">{h.value}</dd><dt className="mt-1 text-xs uppercase tracking-wider text-steel">{h.label}</dt></div>
                ))}
              </dl>
            </Reveal>
          </div>
          <Reveal className="grid grid-cols-2 gap-4">
            {img1 && <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-md sm:col-span-1 sm:row-span-2 sm:aspect-auto"><Image src={img1} alt="Four Stars Security personnel" fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover" /></div>}
            {img2 && <div className="relative aspect-square overflow-hidden rounded-md"><Image src={img2} alt="Four Stars Security on duty" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /></div>}
            <div className="flex aspect-square flex-col justify-end rounded-md bg-ink p-6 text-white">
              <Image src="/images/site/Icon.webp" alt="" width={60} height={72} className="mb-auto opacity-80" />
              <p className="font-display text-2xl font-bold uppercase leading-tight">Always ready to serve</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <div className="container-site grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <Reveal className="relative overflow-hidden rounded-md bg-ink p-8 text-white sm:p-10">
            <Eye className="size-10 text-gold" />
            <h2 className="h-display mt-6 text-4xl">{about.visionTitle}</h2>
            <p className="mt-4 leading-relaxed text-white/70">{about.vision}</p>
            <div className="absolute -bottom-10 -right-10 size-40 rounded-full border-[18px] border-gold/10" />
          </Reveal>
          <Reveal delay={100} className="rounded-md bg-white p-8 sm:p-10">
            <Target className="size-10 text-gold-dark" />
            <h2 className="h-display mt-6 text-4xl">{about.missionTitle}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {about.mission.map((m, i) => (
                <div key={m.title} className="border-t-2 border-gold pt-4">
                  <p className="font-display text-sm font-bold text-gold-dark">0{i + 1}</p>
                  <h3 className="mt-1 font-display text-lg font-bold uppercase leading-tight">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{m.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {team.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-site">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Positions" title="Company Management" />
              <Reveal><Link href="/team/" className="btn btn-outline">Meet the full team<ArrowRight className="size-4" /></Link></Reveal>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((t, i) => <Reveal key={t.id} delay={i * 70}><TeamCard member={t} /></Reveal>)}
            </div>
          </div>
        </section>
      )}
      <CtaBand title="Securing tomorrow, today" text="Talk to our team about protecting your people, property and assets." phone={site.phones[0]?.number} />
    </>
  );
}
