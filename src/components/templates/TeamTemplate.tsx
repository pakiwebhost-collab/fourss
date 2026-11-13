import Link from "next/link";
import { ArrowRight, Award, ShieldCheck, Users } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getSite, groupBy, listTeam } from "@/lib/content";
import { CtaBand, PageHero, Prose, SectionHeading } from "@/components/site/ui";
import Reveal from "@/components/site/Reveal";
import TeamCard from "@/components/site/TeamCard";

export default function TeamTemplate({ page }: { page: PageRow }) {
  const site = getSite();
  const team = listTeam();
  const groups = groupBy(team, (t) => t.department || "Team");
  const pillars = [
    { Icon: ShieldCheck, title: "Armed forces discipline", text: "Leadership drawn from retired officers of Pakistan's armed forces." },
    { Icon: Award, title: "Proven since 1994", text: "Three decades of planning and running security operations." },
    { Icon: Users, title: "Hands-on management", text: "Daily reports, surprise checks and direct access to the people in charge." },
  ];

  return (
    <>
      <PageHero title={page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about-us/" }, { label: page.title }]} />

      <section className="border-b border-line">
        <div className="container-site grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {pillars.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="flex gap-4 py-8 md:px-8 md:first:pl-0">
              <span className="grid size-12 shrink-0 place-items-center rounded-md bg-gold/15 text-gold-dark"><Icon className="size-6" /></span>
              <div>
                <h2 className="font-display text-lg font-bold uppercase">{title}</h2>
                <p className="mt-1 text-sm text-steel">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {groups.map(([dept, members], gi) => (
        <section key={dept} className={`py-20 sm:py-24 ${gi % 2 ? "bg-paper" : ""}`}>
          <div className="container-site">
            <SectionHeading eyebrow={gi === 0 ? "Leadership" : "Team"} title={dept} text={gi === 0 ? page.heading : undefined} />
            <div className={`mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 ${members.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {members.map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 70}><TeamCard member={m} variant={gi === 0 ? "feature" : "default"} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {page.body && <section className="pb-20"><div className="container-site max-w-3xl"><Prose html={page.body} /></div></section>}

      <section className="bg-ink py-20 text-white">
        <div className="container-site grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="eyebrow">Careers</p>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl">Served in the armed forces? Join Four Stars.</h2>
            <p className="mt-3 max-w-2xl text-white/65">We recruit retired armed forces personnel and carefully screened civilians. Get in touch with your details and experience.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/contact-us/?service=Careers" className="btn btn-gold">Apply / Enquire<ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>
      <CtaBand title="Talk to our management" text="Direct access to the people responsible for your security." phone={site.phones[0]?.number} />
    </>
  );
}
