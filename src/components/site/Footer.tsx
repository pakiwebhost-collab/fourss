import Link from "next/link";
import Image from "next/image";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { telHref } from "@/lib/util";
import { SubscribeForm } from "./Forms";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "./Icon";

export default function Footer({ site, services }: { site: SiteSettings; services: { title: string; href: string }[] }) {
  const socials = [
    { href: site.social.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: site.social.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
    { href: site.social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: site.social.youtube, Icon: YoutubeIcon, label: "YouTube" },
  ].filter((s) => s.href);
  const quick = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about-us/" },
    { label: "Our Team", href: "/team/" },
    { label: "Our Services", href: "/our-services/" },
    { label: "Gallery", href: "/gallery/" },
    { label: "Blogs", href: "/blogs/" },
  ];
  const other = [
    { label: "Our Clients", href: "/client/" },
    { label: "Industries", href: "/industries/" },
    { label: "Locations", href: "/locations/" },
    { label: "FAQs", href: "/faqs/" },
    { label: "Privacy Policy", href: "/privacy-policy/" },
    { label: "Terms & Condition", href: "/terms-and-conditions/" },
  ];
  const heading = "mb-5 font-display text-lg font-semibold uppercase tracking-wider text-white";
  const lnk = "text-white/60 transition-colors hover:text-gold";

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="border-b border-white/10">
        <div className="container-site grid items-center gap-6 py-10 lg:grid-cols-[1fr_minmax(0,520px)]">
          <div>
            <h2 className="h-display text-2xl sm:text-3xl">Subscribe &amp; Get More Information</h2>
            <p className="mt-2 text-white/60">Stay up to date with events and important information regarding {site.companyName}.</p>
          </div>
          <SubscribeForm />
        </div>
      </div>

      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <div className="relative h-14 w-52"><Image src="/brand/logo-light.webp" alt={site.companyName} fill sizes="208px" className="object-contain object-left" /></div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">{site.footerAbout}</p>
          <div className="mt-6 flex gap-2">
            {socials.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded border border-white/15 text-white/70 transition hover:border-gold hover:bg-gold hover:text-ink"><Icon className="size-4" /></a>
            ))}
          </div>
        </div>
        <div>
          <h3 className={heading}>Quick Links</h3>
          <ul className="space-y-2.5 text-sm">{quick.map((l) => <li key={l.href}><Link href={l.href} className={lnk}>{l.label}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className={heading}>Other Pages</h3>
          <ul className="space-y-2.5 text-sm">{other.map((l) => <li key={l.href}><Link href={l.href} className={lnk}>{l.label}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className={heading}>Contact Info</h3>
          <ul className="space-y-3.5 text-sm text-white/70">
            <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" />{site.address}</li>
            {site.phones.map((p) => (
              <li key={p.number} className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-gold" /><a href={telHref(p.number)} className="hover:text-gold">{p.number}</a></li>
            ))}
            <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-gold" /><a href={`mailto:${site.email}`} className="hover:text-gold">{site.email}</a></li>
            <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-gold" />{site.hours}</li>
          </ul>
        </div>
      </div>

      {services.length > 0 && (
        <div className="border-t border-white/10">
          <div className="container-site flex flex-wrap gap-x-5 gap-y-2 py-5 text-xs text-white/45">
            {services.map((s) => <Link key={s.href} href={s.href} className="hover:text-gold">{s.title}</Link>)}
          </div>
        </div>
      )}

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/45 sm:flex-row">
          <p>Copyright © {new Date().getFullYear()} {site.companyName}. All rights reserved.</p>
          <p>Government approved security services since 1994</p>
        </div>
      </div>
    </footer>
  );
}
