import Header, { type NavItem } from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { getSite, listPages } from "@/lib/content";
import { pagePath } from "@/lib/util";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  const services = listPages("service").filter((p) => p.has_detail);
  const industries = listPages("industry");
  const locations = listPages("location");

  const nav: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/our-services/", children: services.map((p) => ({ label: p.title, href: pagePath(p.path) })) },
    { label: "Industries", href: "/industries/", children: industries.map((p) => ({ label: p.title, href: pagePath(p.path) })) },
    { label: "Locations", href: "/locations/", children: locations.map((p) => ({ label: p.title, href: pagePath(p.path) })) },
    { label: "Client", href: "/client/" },
    {
      label: "About",
      href: "/about-us/",
      children: [
        { label: "About Us", href: "/about-us/" },
        { label: "Our Team", href: "/team/" },
        { label: "Gallery", href: "/gallery/" },
        { label: "FAQs", href: "/faqs/" },
      ],
    },
    { label: "Blogs", href: "/blogs/" },
  ];

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <Header nav={nav} phone={site.phones[0]?.number ?? ""} email={site.email} hours={site.hours} social={site.social} />
      <main id="main" className="flex-1">{children}</main>
      <Footer site={site} services={services.map((p) => ({ title: p.title, href: pagePath(p.path) }))} />
      <WhatsAppButton contacts={site.whatsapp} message={site.whatsappMessage} />
    </>
  );
}
