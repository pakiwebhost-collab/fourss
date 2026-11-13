"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Clock, Mail, Menu, Phone, X } from "lucide-react";
import { FacebookIcon, LinkedinIcon, InstagramIcon, YoutubeIcon } from "./Icon";

export type NavItem = { label: string; href: string; children?: { label: string; href: string; note?: string }[] };

type Props = {
  nav: NavItem[];
  phone: string;
  email: string;
  hours: string;
  social: { facebook: string; linkedin: string; instagram: string; youtube: string };
};

export default function Header({ nav, phone, email, hours, social }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const socials = [
    { href: social.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: social.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
    { href: social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: social.youtube, Icon: YoutubeIcon, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <>
      <div className="hidden lg:block bg-ink text-white/70 text-[13px]">
        <div className="container-site flex h-10 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-gold"><Phone className="size-3.5 text-gold" />{phone}</a>
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-gold"><Mail className="size-3.5 text-gold" />{email}</a>
            <span className="flex items-center gap-2"><Clock className="size-3.5 text-gold" />{hours}</span>
          </div>
          <div className="flex items-center gap-1">
            {socials.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-8 place-items-center rounded hover:text-gold"><Icon className="size-4" /></a>
            ))}
          </div>
        </div>
      </div>

    <header className="sticky top-0 z-50">
      <div className={`border-b transition-all ${scrolled ? "bg-white/95 backdrop-blur border-line shadow-[0_6px_30px_-12px_rgba(0,0,0,.25)]" : "bg-white border-transparent"}`}>
        <div className="container-site flex h-[72px] items-center justify-between gap-4 lg:h-20">
          <Link href="/" className="relative block h-11 w-[170px] shrink-0 sm:h-12 sm:w-[190px]" aria-label="Four Stars Security home">
            <Image src="/brand/logo-dark.webp" alt="Four Stars Security Services (Pvt) Ltd" fill priority sizes="190px" className="object-contain object-left" />
          </Link>

          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main">
            {nav.map((item) =>
              item.children?.length ? (
                <div key={item.label} className="group relative">
                  <Link href={item.href} className={`flex items-center gap-1 px-3 py-7 text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-gold-dark ${isActive(item.href) ? "text-gold-dark" : "text-ink"}`}>
                    {item.label}
                    <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full w-80 -translate-x-1/2 translate-y-2 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-md border border-line bg-white shadow-2xl">
                      <div className="h-1 bg-gold" />
                      <ul className="p-2">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className={`block rounded px-4 py-2.5 text-sm hover:bg-paper ${pathname === c.href ? "text-gold-dark font-semibold" : "text-ink/85"}`}>
                              {c.label}
                              {c.note && <span className="block text-xs text-steel">{c.note}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.label} href={item.href} className={`px-3 py-7 text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-gold-dark ${isActive(item.href) ? "text-gold-dark" : "text-ink"}`}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/contact-us/" className="btn btn-dark hidden sm:inline-flex">Contact Us</Link>
            <button type="button" onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded border border-line xl:hidden" aria-label="Open menu" aria-expanded={open}>
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 xl:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-ink/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <div role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) { setOpen(false); setExpanded(null); } }} className={`absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col bg-ink text-white transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
            <div className="relative h-10 w-40"><Image src="/brand/logo-light.webp" alt="Four Stars Security" fill sizes="160px" className="object-contain object-left" /></div>
            <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded border border-white/15" aria-label="Close menu"><X className="size-5" /></button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
            {nav.map((item) => (
              <div key={item.label} className="border-b border-white/10">
                {item.children?.length ? (
                  <>
                    <button type="button" className="flex w-full items-center justify-between py-4 text-left font-display text-lg font-semibold uppercase tracking-wide" onClick={() => setExpanded(expanded === item.label ? null : item.label)} aria-expanded={expanded === item.label}>
                      {item.label}
                      <ChevronDown className={`size-5 text-gold transition-transform ${expanded === item.label ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`grid transition-all ${expanded === item.label ? "grid-rows-[1fr] pb-3" : "grid-rows-[0fr]"}`}>
                      <ul className="overflow-hidden">
                        <li><Link href={item.href} className="block py-2 pl-3 text-sm font-semibold text-gold">View all {item.label.toLowerCase()}</Link></li>
                        {item.children.map((c) => (
                          <li key={c.href}><Link href={c.href} className="block py-2 pl-3 text-sm text-white/75 hover:text-white">{c.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link href={item.href} className={`block py-4 font-display text-lg font-semibold uppercase tracking-wide ${isActive(item.href) ? "text-gold" : ""}`}>{item.label}</Link>
                )}
              </div>
            ))}
          </nav>
          <div className="space-y-3 border-t border-white/10 p-5 text-sm">
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3 text-white/80"><Phone className="size-4 text-gold" />{phone}</a>
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-white/80"><Mail className="size-4 text-gold" />{email}</a>
            <Link href="/contact-us/" className="btn btn-gold w-full">Get a Free Quote</Link>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
