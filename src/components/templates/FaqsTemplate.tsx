import Link from "next/link";
import { Plus } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { getSite, listFaqs } from "@/lib/content";
import { stripHtml, telHref } from "@/lib/util";
import { PageHero, Prose } from "@/components/site/ui";

export default function FaqsTemplate({ page }: { page: PageRow }) {
  const site = getSite();
  const faqs = listFaqs();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: stripHtml(f.answer) } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero title={page.heading || page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]} size="sm" />
      <section className="py-16 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f, i) => (
              <details key={f.id} className="group py-1" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <h2 className="font-display text-lg font-bold uppercase leading-snug sm:text-xl">{f.question}</h2>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper transition group-open:rotate-45 group-open:bg-gold"><Plus className="size-4" /></span>
                </summary>
                <div className="pb-6 pr-12"><Prose html={f.answer} className="text-base" /></div>
              </details>
            ))}
          </div>
          <aside className="h-fit rounded-md bg-ink p-8 text-white lg:sticky lg:top-28">
            <h2 className="h-display text-2xl">Still have questions?</h2>
            <p className="mt-3 text-sm text-white/65">Our team is available {site.hours}.</p>
            <a href={telHref(site.phones[0]?.number ?? "")} className="btn btn-gold mt-6 w-full">Call {site.phones[0]?.number}</a>
            <Link href="/contact-us/" className="btn btn-ghost mt-3 w-full">Send a message</Link>
          </aside>
        </div>
        {page.body && <div className="container-site mt-12 max-w-3xl"><Prose html={page.body} /></div>}
      </section>
    </>
  );
}
