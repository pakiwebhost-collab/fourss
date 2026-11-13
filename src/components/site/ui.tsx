import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Phone } from "lucide-react";
import Reveal from "./Reveal";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-white/60">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5" />}
            {it.href ? <Link href={it.href} className="hover:text-gold">{it.label}</Link> : <span className="text-white">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  title, eyebrow, summary, image, crumbs, children, size = "md",
}: {
  title: string; eyebrow?: string; summary?: string; image?: string; crumbs: { label: string; href?: string }[]; children?: React.ReactNode; size?: "sm" | "md";
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {image && <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-45" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-ink/70 to-transparent" />
      <div className={`container-site ${size === "sm" ? "py-14 sm:py-16" : "py-16 sm:py-24 lg:py-28"}`}>
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
        <h1 className="h-display mt-3 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
        {summary && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{summary}</p>}
        {children}
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-40 bg-gold" />
    </section>
  );
}

export function SectionHeading({ eyebrow, title, text, center = false, dark = false }: { eyebrow?: string; title: string; text?: string; center?: boolean; dark?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className={`eyebrow ${center ? "justify-center" : ""}`}>{eyebrow}</p>}
      <h2 className={`h-display mt-3 text-3xl sm:text-4xl lg:text-5xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      {text && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? "text-white/70" : "text-steel"}`}>{text}</p>}
    </Reveal>
  );
}

export function CtaBand({ title, text, href = "/contact-us/", label = "Contact Us", phone }: { title: string; text: string; href?: string; label?: string; phone?: string }) {
  return (
    <section className="relative overflow-hidden bg-gold">
      <div className="absolute inset-0 opacity-[.07] [background-image:repeating-linear-gradient(135deg,#000_0,#000_2px,transparent_2px,transparent_14px)]" />
      <div className="container-site relative flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
        <div>
          <h2 className="h-display text-3xl text-ink sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-ink/75">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {phone && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn border border-ink/30 text-ink hover:bg-ink hover:text-white"><Phone className="size-4" />{phone}</a>}
          <Link href={href} className="btn btn-dark">{label}<ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}

export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`prose-site ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
