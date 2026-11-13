import Image from "next/image";
import { Building2, Check } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getSite, groupBy, listClients } from "@/lib/content";
import { CtaBand, PageHero, Prose, SectionHeading } from "@/components/site/ui";
import Reveal from "@/components/site/Reveal";

export default function ClientsTemplate({ page }: { page: PageRow }) {
  const site = getSite();
  const clients = listClients();
  const groups = groupBy(clients, (c) => c.category);

  return (
    <>
      <PageHero title={page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: "Clients" }]}>
        <dl className="mt-10 flex flex-wrap gap-10">
          <div><dd className="font-display text-4xl font-bold text-gold">{clients.length}+</dd><dt className="text-xs uppercase tracking-wider text-white/60">Clients served</dt></div>
          <div><dd className="font-display text-4xl font-bold text-gold">{groups.length}</dd><dt className="text-xs uppercase tracking-wider text-white/60">Sectors</dt></div>
          <div><dd className="font-display text-4xl font-bold text-gold">1994</dd><dt className="text-xs uppercase tracking-wider text-white/60">Serving since</dt></div>
        </dl>
      </PageHero>

      <section className="py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Our Clients" title={page.heading} text="Four Stars Security Services (Pvt) Ltd. has licences of non-prohibited bore weapons for the safety and protection requirements of our valuable clients." />
          <div className="mt-12 columns-1 gap-6 md:columns-2 lg:columns-3">
            {groups.map(([cat, list], i) => (
              <Reveal key={cat} delay={(i % 3) * 60} className="mb-6 break-inside-avoid rounded-md border border-line bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded bg-ink text-gold"><Building2 className="size-5" /></span>
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase leading-tight">{cat}</h2>
                    <p className="text-xs text-steel">{list.length} client{list.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {list.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 text-sm font-medium">
                      {c.logo ? (
                        <span className="relative size-8 shrink-0 overflow-hidden rounded bg-paper"><Image src={c.logo} alt="" fill sizes="32px" className="object-contain p-1" /></span>
                      ) : (
                        <Check className="size-4 shrink-0 text-gold-dark" />
                      )}
                      {c.name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          {page.body && <div className="mt-12 max-w-3xl"><Prose html={page.body} /></div>}
        </div>
      </section>
      <CtaBand title="Join our trusted clients" text="From a single gate to a full industrial complex, we match the right team to every site." phone={site.phones[0]?.number} />
    </>
  );
}
