import type { AboutContent, HomeContent, SiteSettings } from "@/lib/types";

export const defaultAbout: AboutContent = {
  visionTitle: "Vision",
  vision:
    "We aspire to stand among the world’s foremost security companies, offering integrated services that prioritize common operating goals, shared awareness, and proactive prevention. Our commitment extends to synchronized responses, always valuing human rights and welfare.",
  missionTitle: "Mission",
  mission: [
    { title: "Comprehensive Security Assurance", text: "Ensuring the safety of lives, properties, and assets with unwavering commitment and stakeholder understanding." },
    { title: "Continuous Excellence", text: "Pursuing constant improvement through internal checks, client feedback, and systematic reviews." },
    { title: "Unified Commitment", text: "Fostering teamwork and steadfast dedication among our employees for seamless security operations." },
  ],
  highlights: [
    { value: "1994", label: "Incorporated in Karachi" },
    { value: "4", label: "Offices across Pakistan" },
    { value: "APSAA", label: "Association member" },
  ],
};

export const defaultSite: SiteSettings = {
  companyName: "Four Stars Security Services (Pvt) Ltd",
  shortName: "Four Stars Security",
  tagline: "Always Ready To Serve",
  email: "info@4ssecurity.pk",
  notifyEmail: "info@4ssecurity.pk",
  address: "C-57, Street # 6, Block - B, Gulshan-e-Jamal, Karachi",
  hours: "Mon - Sat : 9:00 am - 6:00 pm",
  phones: [
    { label: "Head Office", number: "(+92) 213 459 9993" },
    { label: "Mobile", number: "(+92) 344 7779992" },
    { label: "Mobile", number: "(+92) 333 1003431" },
  ],
  whatsapp: [
    { label: "Syed Nazim Ali", number: "+92 344 7779992" },
    { label: "Salik Shahbaz Ali", number: "+92 333 1003431" },
  ],
  whatsappMessage: "Hi! I need more info about Four Stars Security services.",
  social: {
    facebook: "https://www.facebook.com/4sspk/",
    linkedin: "https://www.linkedin.com/company/4sspk/",
    instagram: "",
    youtube: "",
  },
  offices: [
    { name: "Head Office", address: "C-57, Street # 6, Block - B, Gulshan-e-Jamal, Karachi.", phone: "(+92) 213 459 9993" },
    { name: "Peshawar Office", address: "Rabbani Tower, Opposite F.C. Plaza, BRT Stop, Near Dr. Younas Chowk, Peshawar Cantt.", phone: "091 5252036" },
    { name: "Islamabad Office", address: "Office # 303, 3rd Floor, Capital Business Centre, Sector F10 Markaz, Islamabad.", phone: "0345-9438215" },
    { name: "Quetta Office", address: "Office # 210, 2nd Floor, Jinnah Road, Near Angle Road, Civic Center, Gul Plaza, Quetta.", phone: "0345-9438213" },
  ],
  mapEmbed:
    "https://maps.google.com/maps?q=Four%20Stars%20Security%20Services%20%28Pvt%29%20Ltd&t=m&z=16&output=embed&iwloc=near",
  footerAbout:
    "Government approved private security company protecting people, property and assets across Pakistan since 1994.",
  defaultMetaTitle: "Best Security Company in Karachi Pakistan | Four Stars Security",
  defaultMetaDescription:
    "Pakistan's trusted security services provider company since 1994. Security guards, SSG commandos, cash in transit, bodyguards, bulletproof vehicles.",
};

export const defaultHome: HomeContent = {
  hero: {
    eyebrow: "Always Ready To Serve",
    title: "Security Company in Pakistan.",
    highlight: "We Secure You Better.",
    text: "Four Stars is a government approved security company in Pakistan protecting businesses, institutions, banks, and high profile clients since 1994. From static guards and mobile patrols to armed escorts and executive protection, we cover the full range of security you need to stay safe and keep working without worry.",
    image: "/images/site/1-4.webp",
    primary: { label: "Request a Quote", href: "/contact-us/" },
    secondary: { label: "Explore Services", href: "/our-services/" },
    badges: ["Govt. Approved since 1994", "Member APSAA", "Retired SSG & Armed Forces Personnel"],
  },
  stats: [
    { value: "1994", label: "Incorporated in Karachi" },
    { value: "4", label: "Regional offices" },
    { value: "24/7", label: "Control room response" },
    { value: "24 hrs", label: "Emergency deployment" },
  ],
  about: {
    eyebrow: "Four Stars Security Services (Pvt) Ltd.",
    title: "Protecting people, property and assets across Pakistan",
    text: "A private limited company, incorporated under the Companies Ordinance Act, 1984 on 7th March 1994 at Karachi. As a trusted security services provider in Pakistan, we protect people, property, and assets for clients across the country. Our teams are drawn from retired armed forces personnel and carefully screened civilians, and we are counted among the leading security companies in Karachi.",
    image: "/images/site/IMG-20250212-WA0051.jpg",
    points: [
      "Presently serving in Sindh, Balochistan, KP & Islamabad",
      "Soon in Punjab",
      "Protecting the Chinese Consulate, Karachi since December 2023",
    ],
    cta: { label: "Explore All Services", href: "/our-services/" },
  },
  services: {
    eyebrow: "What We Do",
    title: "Elite security solutions",
    text: "Static guards, mobile armed escort, and professional bodyguard cover delivered by retired SSG commandos, ex service men, and civil trained guards. We match the right team to every site, from a single gate to a full industrial complex, and supervise them closely once they are on duty.",
    items: [
      {
        title: "Bullet Proof & Bomb Proof Vehicles",
        text: "We are among the leading bulletproof vehicle providers in Pakistan, supplying armored cars built for safe travel in high risk conditions. Each vehicle is maintained to stay road ready and dependable when you need it.",
        image: "/images/site/Cars.jpg",
        href: "/our-services/bulletproof-bombproof-vehicle-services/",
      },
      {
        title: "CCTV Installation & Maintenance",
        text: "Reliable CCTV installation, monitoring, and maintenance for round the clock coverage. We plan camera placement, set up recording and live monitoring, and keep your systems running 24/7.",
        image: "/images/site/Home-2.webp",
        href: "/our-services/cctv-installation-maintenance/",
      },
      {
        title: "Executive & Event Protection",
        text: "Discreet executive protection for corporate leaders and public figures, and complete security cover for corporate functions. Our close protection teams plan routes, manage access, and stay a step ahead.",
        image: "/images/site/EVENT-SECURITY.jpg",
        href: "/our-services/executive-protection-team-retired-ssg-commandos/",
      },
      {
        title: "Mobile Armed Escort & Bodyguards",
        text: "Armed escort security for individuals and convoys. Hire a bodyguard in Pakistan for a single day or on a standing contract, with trained personnel who stay alert on the move.",
        image: "/images/site/WhatsApp-Image-2024-04-22-at-5.29.53-PM-2-1.jpeg",
        href: "/our-services/mobile-armed-escort-and-bodyguard-service/",
      },
    ],
  },
  recruitment: {
    eyebrow: "Professional Recruitment & Training Standards",
    title: "Recruitment Standard",
    text: "We hold our security guards in Karachi to the highest standards. Every guard is screened for bearing, discipline, uniform turnout, professionalism, and weapon handling before deployment. We verify background and references, put each candidate through practical checks, and keep training continuous, so the person guarding your gate is always alert, presentable, and ready to act.",
    image: "/images/gallery/WhatsApp-Image-2024-04-22-at-5.29.55-PM.jpeg",
    pillars: [
      { title: "General Appearance", text: "Bearing, discipline and uniform turnout checked before every deployment." },
      { title: "Professional Skills", text: "Practical checks and continuous training, including weapon handling." },
      { title: "Sense of Responsibility", text: "Verified backgrounds and references, so every post is held by someone you can trust." },
    ],
  },
  equipment: {
    eyebrow: "Services",
    title: "Security Equipment & Devices",
    text: "Four Stars supplies security equipment and devices duly approved by the Government of Pakistan. From entry screening to field communication, we equip your site with the tools trained guards rely on every day, and we service and replace them so your setup stays fully operational.",
    items: ["Metal Detectors", "Walk Through Gates", "CCTV, Monitoring System", "Walkie Talkie Sets", "Under-Vehicle Search Mirrors"],
    image: "/images/site/gate.webp",
    image2: "/images/site/Firealarm.webp",
    cta: { label: "Read More", href: "/our-services/" },
  },
  trust: {
    eyebrow: "Why Four Stars",
    title: "Quality over quantity, and a fast response every time",
    text: "Four Stars Security Services (Pvt) Ltd. has operated with the approval of the Government of Pakistan since 1994. Backed by a professional and motivated team, we deliver complete security solutions for industrial, commercial, and residential clients across Pakistan. Years of field experience mean we understand local threats and know how to plan for them before they become a problem.\n\nProtecting the Chinese Consulate in Karachi since December 2023 reflects the trust clients place in our work. Our values guide how we hire, train, and look after both clients and staff.",
    image: "/images/site/Home-2.webp",
    values: [
      { title: "Integrity & Trust", text: "Long-term relationships built on honest service.", image: "/images/site/Home3.webp" },
      { title: "Constant Vigilance", text: "Control room monitoring and fast response.", image: "/images/site/Home4.webp" },
      { title: "Trained Professionals", text: "Screened, disciplined and continuously trained.", image: "/images/site/Home5.webp" },
      { title: "Client Care", text: "We look after clients and staff alike.", image: "/images/site/Home6.webp" },
    ],
  },
  cta: {
    title: "Need guards on short notice?",
    text: "In an emergency we can arrange the required strength of guards on 24 hours notice and still maintain our optimum performance.",
    button: { label: "Contact Us", href: "/contact-us/" },
  },
  blog: { eyebrow: "Insights", title: "Latest from our blog" },
};
