import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import scraped from "./scraped.json";
import { defaultAbout, defaultHome, defaultSite } from "./defaults";
import { hashPassword } from "@/lib/password";
import { DATA_DIR } from "@/lib/paths";

type Scraped = { path: string; type: string; h1: string; metaTitle: string; metaDescription: string; hero: string; images: string[]; body: string };
const S = scraped as { pages: Scraped[]; posts: { slug: string; title: string; metaTitle: string; metaDescription: string; date: string; cover: string; body: string }[] };
const sp = (p: string) => S.pages.find((x) => x.path === p);

const SERVICES: { title: string; path: string; summary: string; icon: string; image?: string }[] = [
  { title: "Bullet Proof & Bomb Proof Vehicles", path: "our-services/bulletproof-bombproof-vehicle-services", icon: "car", image: "/images/site/Cars.jpg", summary: "As trusted bulletproof vehicle providers in Pakistan, we supply armored cars built for high risk travel. Our armored car services keep executives, diplomats, and VIPs safe on every route." },
  { title: "CCTV Installation & Maintenance", path: "our-services/cctv-installation-maintenance", icon: "cctv", summary: "Complete CCTV installation, live monitoring, and maintenance so your premises stay watched around the clock. We plan placement, install the system, and keep it running." },
  { title: "Cash Delivery Escort Vehicles", path: "our-services/cash-delivery-escort-vehicles", icon: "truck", image: "/images/site/Pickup.jpg", summary: "Secure cash in transit movement with armed guards and escort vehicles. Our armed security money trucks protect bank runs, payroll, and daily collection from pickup to drop off." },
  { title: "Mobile Armed Escort / Bodyguard Service", path: "our-services/mobile-armed-escort-and-bodyguard-service", icon: "shield", summary: "Armed escort security for individuals and convoys. You can hire a bodyguard in Pakistan for a single day or on a standing contract, with trained personnel who stay alert on the move." },
  { title: "Mobile Force & Anti-Terrorist Squads", path: "our-services/mobile-force-anti-terrorist-squads", icon: "siren", summary: "Rapid response teams trained to handle serious threats. Our mobile force and anti-terrorist squads reinforce any site the moment the risk level rises." },
  { title: "Electronic Security Monitoring Services", path: "our-services/electronic-security-monitoring", icon: "monitor", image: "/images/site/Home4.webp", summary: "Round the clock electronic security monitoring that links alarms, cameras, and sensors to a central control point for quick action on any alert." },
  { title: "Security Consultancy & Training", path: "our-services/security-consultancy-training", icon: "graduation", image: "/images/site/cropped-view-of-policeman-typing-on-laptop-keyboard.jpg", summary: "Practical security consultancy and training, from risk surveys to guard training, so your site is protected by a plan that actually fits its threats." },
  { title: "Fire Alarm Systems & Firefighting Squads", path: "our-services/fire-alarm-firefighting", icon: "flame", image: "/images/site/Firealarm.webp", summary: "Fire alarm systems and trained firefighting squads to detect, contain, and respond to fire emergencies before they spread." },
  { title: "Security Trained Receptionists", path: "our-services/security-trained-receptionists", icon: "bell", image: "/images/site/attractive-policewoman-talking-by-radio-set-near-police-car.jpg", summary: "Well groomed, security trained receptionists who manage your front desk and control visitor access without slowing down daily work." },
  { title: "Lady Searchers, Drivers & Peons", path: "our-services/lady-searchers-drivers-peons", icon: "users", summary: "Trained lady searchers, drivers, and peons for settings that need courteous, discreet, and properly screened support staff." },
  { title: "Executive Protection Team (Retired SSG)", path: "our-services/executive-protection-team-retired-ssg-commandos", icon: "star", summary: "Executive protection services in Pakistan delivered by retired SSG commandos, as private bodyguards for corporate leaders and celebrity security." },
  { title: "Corporate Functions Security Coverage", path: "our-services/corporate-functions-security-coverage", icon: "building", summary: "Full security coverage for corporate functions, conferences, and large gatherings, including access control, crowd management, and close protection." },
];

const INDUSTRIES = [
  { title: "Security Guards for Banks", path: "industries/security-guard-for-banks", icon: "landmark" },
  { title: "Security Guards for Factories", path: "industries/security-guards-for-factories", icon: "factory" },
  { title: "Security Guards for Supermarkets", path: "industries/security-guards-for-supermarkets", icon: "cart" },
  { title: "Petrol Pump Security Guards", path: "industries/petrol-pump-security-guards", icon: "fuel" },
];

const LOCATIONS = [
  { title: "Security Services in Karachi", path: "locations/security-services-karachi" },
  { title: "Security Guards in DHA Karachi", path: "locations/security-services-karachi/security-guards-dha-karachi" },
  { title: "Security Guards in PECHS Karachi", path: "locations/security-services-karachi/security-guards-pechs-karachi" },
  { title: "Security Guards in Clifton Karachi", path: "locations/security-services-karachi/security-guards-clifton-karachi" },
  { title: "Security Guards in Bahria Town Karachi", path: "locations/security-services-karachi/security-guards-bahria-town-karachi" },
];

const SERVICES_BODY = `<h4>Emergency Number</h4>
<h2>Provision of Services on Short Notice</h2>
<p>Four Stars is strong enough to take on any size of security management task within a week. In an emergency, we can arrange the required strength of guards on 24 hours notice and still maintain our optimum performance.</p>
<h2>Security Equipments &amp; Devices</h2>
<p>Four Stars uses security equipment and devices duly approved by the concerned agencies, kept ready and serviced for daily use. The system includes:</p>
<ul><li>Security Alarm System</li><li>Magna Scanner (Walk Through Gates)</li><li>CCTV, Monitoring System</li><li>Metal Detectors/Scanners</li><li>Vehicle Inspection Mirrors</li></ul>
<h2>Checking / Inspection Systems</h2>
<p>Our officers and checking supervisors inspect guard performance at every location on a regular basis, with daily reports to the General Manager and Executive Director. Surprise checks cover uniform, weapons, and guard status, so service quality stays high and our clients stay satisfied.</p>
<h2>Transportation Vehicles</h2>
<p>Four Stars has invested heavily in mobility so our teams reach any site with minimum reaction time in an emergency. For this purpose we run:</p>
<ul><li>Cars</li><li>Pickups</li><li>Motorcycles</li><li>Mobile Escort Vehicle</li><li>Cash Carrying Transit Vehicles (In Progress)</li></ul>
<blockquote><p>“Cops work for a cause, not applause.”</p></blockquote>
<h2>Arms / Ammunition</h2>
<p>Four Stars Security Services (Pvt) Ltd. holds licences for the following non-prohibited bore weapons, kept strictly for the safety and protection of our valuable clients:</p>
<ul><li>Ruger 9MM</li><li>GLOCK Brown 9MM</li><li>CANIK 9MM</li></ul>
<figure><img src="/images/site/Ruger-9MM.jpg" alt="Ruger 9MM"><figcaption>Ruger 9MM</figcaption></figure>
<figure><img src="/images/site/GLOCK-Brown-9MM-Austria.jpg" alt="GLOCK Brown 9MM"><figcaption>GLOCK Brown 9MM</figcaption></figure>
<figure><img src="/images/site/CANIK-9MM.jpg" alt="CANIK 9MM"><figcaption>CANIK 9MM</figcaption></figure>`;

const ABOUT_BODY = `<p>Four Stars Security Services Private Ltd is a security company striving to provide best security services to our respected clients. We started our journey from Sindh with our head office in Karachi; with gigantic team efforts, operations have been extended to KP, Balochistan and Islamabad (soon in Punjab as well).</p>`;

const PRIVACY = `<p><em>Last updated: November 2026</em></p>
<p>Four Stars Security Services (Pvt) Ltd (“Four Stars”, “we”, “us”) respects your privacy. This policy explains what information we collect through 4ssecurity.pk and how we use it.</p>
<h2>Information we collect</h2>
<ul><li><strong>Enquiry and quote forms:</strong> your name, phone number, email address, the service you are interested in and your message.</li><li><strong>Newsletter:</strong> your email address when you subscribe.</li><li><strong>WhatsApp and phone:</strong> if you contact us on WhatsApp or by phone, we receive the details you share through those services.</li><li><strong>Technical data:</strong> our hosting provider may log basic request data (such as IP address and browser type) for security and troubleshooting.</li></ul>
<h2>How we use your information</h2>
<ul><li>To respond to your enquiry, prepare a quotation or arrange a site survey.</li><li>To send updates you have subscribed to. You can unsubscribe at any time by emailing us.</li><li>To protect our website against abuse and fraud.</li></ul>
<p>We do not sell or rent your personal information. We share it only with staff who need it to serve you, or where required by the law of Pakistan.</p>
<h2>Cookies</h2>
<p>The public website does not use advertising or tracking cookies. A strictly necessary cookie is used only when our staff sign in to the website’s administration area.</p>
<h2>Data retention and security</h2>
<p>Enquiries are kept for as long as needed to handle your request and maintain business records. We use reasonable technical and organisational measures to protect the information you send us.</p>
<h2>Your choices</h2>
<p>You may ask us to access, correct or delete the personal information we hold about you by contacting <a href="mailto:info@4ssecurity.pk">info@4ssecurity.pk</a>.</p>
<h2>Contact</h2>
<p>Four Stars Security Services (Pvt) Ltd, C-57, Street # 6, Block - B, Gulshan-e-Jamal, Karachi. Phone (+92) 213 459 9993.</p>`;

const TERMS = `<p><em>Last updated: November 2026</em></p>
<p>These terms govern your use of 4ssecurity.pk, operated by Four Stars Security Services (Pvt) Ltd. By using the website you agree to them.</p>
<h2>Website content</h2>
<p>The information on this website is provided for general information about our services. It does not form an offer or contract. Service scope, deployment and pricing are agreed only in a written quotation or service agreement signed by both parties.</p>
<h2>Quotes and enquiries</h2>
<p>Submitting a form or message does not create an obligation for either party. We aim to respond within 24 hours on working days.</p>
<h2>Intellectual property</h2>
<p>The Four Stars name, logo, text and images on this website belong to Four Stars Security Services (Pvt) Ltd or are used with permission. Please do not copy or reuse them without written consent.</p>
<h2>Acceptable use</h2>
<p>You agree not to misuse the website, attempt to gain unauthorised access to it, or submit false or malicious information through its forms.</p>
<h2>Third-party links</h2>
<p>Links to third-party services such as WhatsApp, Google Maps, Facebook and LinkedIn are provided for convenience. We are not responsible for their content or privacy practices.</p>
<h2>Limitation of liability</h2>
<p>To the extent permitted by law, Four Stars is not liable for any loss arising from use of, or reliance on, the information on this website.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of Pakistan, and the courts of Karachi have jurisdiction.</p>
<h2>Contact</h2>
<p>Questions about these terms can be sent to <a href="mailto:info@4ssecurity.pk">info@4ssecurity.pk</a>.</p>`;

const FAQS: [string, string][] = [
  ["Is Four Stars Security a government approved company?", "Yes. Four Stars Security Services (Pvt) Ltd. was incorporated in Karachi on 7th March 1994 and has operated with the approval of the Government of Pakistan since then. We are a member of the All Pakistan Security Agencies Association (APSAA)."],
  ["Which cities and regions do you cover?", "We presently serve Sindh, Balochistan, Khyber Pakhtunkhwa and Islamabad, with offices in Karachi (head office), Peshawar, Islamabad and Quetta. Punjab coverage is coming soon."],
  ["How quickly can you deploy security guards?", "We can take on any size of security management task within a week. In an emergency, we can arrange the required strength of guards on 24 hours notice."],
  ["Who are your guards?", "Our teams are drawn from retired armed forces personnel and carefully screened civilians. Executive protection is delivered by retired SSG commandos. Every guard is checked for bearing, discipline, uniform turnout, professionalism and weapon handling before deployment."],
  ["How are guards supervised once they are on duty?", "Officers and checking supervisors inspect guard performance at every location on a regular basis, including surprise checks on uniform, weapons and guard status, with daily reports to the General Manager and Executive Director."],
  ["Can I hire a bodyguard for a single day?", "Yes. Armed escort and bodyguard cover is available for a single day or on a standing contract."],
  ["How much does a security guard cost?", "Cost depends on the number of guards, shift length, armed or unarmed cover, the site and any equipment required. Read our <a href=\"/how-much-does-it-cost-to-hire-a-security-guard-in-karachi/\">guard cost guide</a>, or <a href=\"/contact-us/\">request a quote</a> and we will start with a site survey."],
  ["Do you supply security equipment as well as guards?", "Yes. We supply and maintain government approved equipment including metal detectors, walk through gates, CCTV and monitoring systems, walkie talkie sets and under-vehicle search mirrors."],
];

const CLIENTS: Record<string, string[]> = {
  Consulates: ["China Consulate, Karachi"],
  "Pharmaceuticals Companies": ["SAMI Pharmaceuticals (Pvt) Limited", "Burhani Hospital"],
  "International Clients": ["ANPIN Industrial Consultant (Chinese)", "Chinese Embassy (Old)", "COSCO Shipping", "Four Wind Trade Company (Chinese)", "JINGJIANG Head Office (Chinese)", "CHINA COMMUNICATION (Chinese)", "UNITED Fortune Trading (Chinese)", "Wanda Builders (Chinese)", "Brothers Smelting (Chinese)"],
  "Dasu Hydro Project KP": ["Sawan Maira Grid Station, Mansehra", "Khakri Warehouse, KP"],
  Schools: ["City School (Kareemabad)", "MAFHH Institute", "Saqib Rose (Chain)"],
  "Clinics & Hospitals": ["Neuro Mind Hospital", "Hafiz Medical", "Muazam Medical", "Shan Consulting Clinic", "TRIMAX Hospitals", "Syed Medical Centre"],
  "Ltd Companies": ["Ittehad Rooler Flour Mill", "Green Acres (Pvt) Ltd", "Five Star 3PL Services", "MHL Private Ltd", "Hubcrete (Pvt) Ltd", "Stone World", "Global Enterprises", "Amalgamated Textiles", "FIXMYBIKE", "Cold Store SITE", "ANOGS Pvt Ltd", "Irfan Noman Bernas (Pvt) Ltd", "Pakistan Corrugated (Pvt) Ltd"],
  "Residencies / Societies": ["Al Hamd Town", "T-Sector Gulshan-e-Meymar Society", "Chinese Residential Units, Islamabad", "Harmain Royal Residency"],
  Miscellaneous: ["Eidgah Market Jama Cloth", "Ganna Godam Sohrab Goth", "Union Co-Operative Club", "NAFT Corporation", "Dr. Salman Abid Qazalbash", "Rahmania Madrasa (Bahria Town)", "Vicky Cosmetics"],
};

const TEAM = [
  { name: "Col Syed Ahtesham ul Abbas (R), SI(M)", photo: "/images/site/WhatsApp-Image-2024-11-27-at-3.05.48-PM.jpeg", phone: "" },
  { name: "Salik Shahbaz Ali", photo: "/images/site/2.jpg", phone: "+92 333 1003431" },
  { name: "Syed Nazim Ali", photo: "/images/site/Nazim-Pic.jpg", phone: "+92 344 7779992" },
  { name: "Maj Asif Khan (R)", photo: "/images/site/WhatsApp-Image-2025-02-27-at-12.52.36_b6c47430.jpg", phone: "+92 91 5252036" },
];

const POST_CATEGORY: Record<string, string> = {
  "how-much-does-it-cost-to-hire-a-security-guard-in-karachi": "Hiring Guides",
  "residential-security-karachi-dha-clifton-pechs": "Residential Security",
  "how-to-hire-a-bodyguard-in-pakistan-process-cost-and-what-to-expect": "Hiring Guides",
  "benefits-of-hiring-security-guards-in-karachi": "Business Security",
};

function galleryCategory(file: string) {
  if (/^WhatsApp-Image-2024-04/.test(file)) return "Our Guards";
  if (/^WhatsApp-Image-2024-05|^Group-/.test(file)) return "Vehicles";
  return "Arms & Equipment";
}
function galleryCaption(file: string) {
  if (/^WhatsApp|^Group-/.test(file)) return "";
  return file.replace(/\.[a-z]+$/i, "").replace(/-rotated$/, "").replace(/-\d$/, "").replace(/-/g, " ").replace(/\bMM\b/g, "MM");
}

export function runSeed(db: DatabaseSync) {
  db.exec("BEGIN");
  try {
    const setting = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    setting.run("site", JSON.stringify(defaultSite));
    setting.run("home", JSON.stringify(defaultHome));
    setting.run("about", JSON.stringify(defaultAbout));

    const page = db.prepare(`INSERT INTO pages (path, type, template, title, heading, eyebrow, summary, hero_image, images, icon, body, meta_title, meta_description, show_in_listing, has_detail, sort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const add = (p: { path: string; type?: string; template?: string; title: string; heading?: string; eyebrow?: string; summary?: string; hero?: string; images?: string[]; icon?: string; body?: string; metaTitle?: string; metaDescription?: string; listing?: number; detail?: number; sort?: number }) =>
      page.run(p.path, p.type ?? "page", p.template ?? "default", p.title, p.heading ?? "", p.eyebrow ?? "", p.summary ?? "", p.hero ?? "", JSON.stringify(p.images ?? []), p.icon ?? "", p.body ?? "", p.metaTitle ?? "", p.metaDescription ?? "", p.listing ?? 1, p.detail ?? 1, p.sort ?? 0);

    // Listing / template pages
    const svc = sp("our-services");
    add({ path: "our-services", template: "services", title: "Our Services", heading: "Services We Offer", eyebrow: "What We Do", hero: "/images/site/IMG-20250212-WA0051.jpg", summary: "Four Stars Security Services (Pvt) Ltd. is a government approved security services provider in Pakistan with the capability to handle any requirement, big or small. From static armed and unarmed guards, bouncers, supervisors, and officers to specialised protection teams, we deliver complete cover for businesses, institutions, and high profile clients.", body: SERVICES_BODY, metaTitle: svc?.metaTitle, metaDescription: svc?.metaDescription, images: ["/images/site/Scanner.jpg", "/images/site/Cars.jpg", "/images/site/Pickup.jpg"] });
    add({ path: "industries", template: "industries", title: "Industries", heading: "Industries We Protect", eyebrow: "Sector Expertise", hero: "/images/site/4bde63e4-16c0-43ef-b306-2b992276b768.jpg", summary: "Every sector has its own risks. We deploy trained guards, supervisors and equipment planned around how your site actually works.", metaTitle: "Industries We Serve | Four Stars Security", metaDescription: "Security guards for banks, factories, supermarkets and petrol pumps across Pakistan from Four Stars Security, government approved since 1994." });
    add({ path: "locations", template: "locations", title: "Locations", heading: "Security Services Near You", eyebrow: "Where We Work", hero: "/images/site/858a2298-224e-4020-87e4-7e4c48945b36.png", summary: "Head office in Karachi with regional offices in Peshawar, Islamabad and Quetta. Explore our coverage across Karachi's key neighbourhoods.", metaTitle: "Locations | Four Stars Security", metaDescription: "Four Stars Security serves Karachi including DHA, Clifton, PECHS and Bahria Town, plus Sindh, Balochistan, KP and Islamabad." });
    add({ path: "client", template: "clients", title: "Our Clients", heading: "Judge Us By The Clients We Have", eyebrow: "Trusted By", hero: "/images/site/slider.webp", summary: "From consulates and international companies to hospitals, schools and housing societies, organisations across Pakistan rely on Four Stars every day.", metaTitle: "Our Clients | Four Stars Security", metaDescription: "Clients of Four Stars Security include the China Consulate Karachi, international companies, hospitals, schools, factories and residential societies." });
    add({ path: "about-us", template: "about", title: "About Us", heading: "Securing Tomorrow, Today", eyebrow: "About Us", hero: "/images/site/mature-male-police-officer-pointing-by-finger-to-colleague-with-clipboard-near-car-at-street.jpg", summary: "A government approved security company protecting people, property and assets across Pakistan since 1994.", body: ABOUT_BODY, images: ["/images/site/About-us3.jpg", "/images/site/About-us2-1.jpg"], metaTitle: "About Us | Four Stars Security Services (Pvt) Ltd", metaDescription: "Four Stars Security Services (Pvt) Ltd, incorporated in Karachi in 1994, protects people, property and assets across Sindh, Balochistan, KP and Islamabad." });
    add({ path: "team", template: "team", title: "Our Team", heading: "The People Behind Four Stars", eyebrow: "Leadership", hero: "/images/gallery/WhatsApp-Image-2024-04-22-at-5.29.55-PM.jpeg", summary: "Led by retired armed forces officers and experienced security managers, our team brings discipline, accountability and decades of field experience to every post.", metaTitle: "Our Team | Four Stars Security", metaDescription: "Meet the management team of Four Stars Security Services (Pvt) Ltd, led by retired armed forces officers." });
    add({ path: "blogs", template: "blog", title: "Blogs", heading: "Security Insights & Guides", eyebrow: "Our Blog", hero: "/images/site/wp7618626.jpg", summary: "Practical advice on hiring guards, protecting homes and businesses, and staying safe in Karachi and across Pakistan.", metaTitle: "Blog | Four Stars Security", metaDescription: "Security guides and insights from Four Stars Security: guard costs, hiring bodyguards, residential and business security in Karachi." });
    add({ path: "gallery", template: "gallery", title: "Gallery", heading: "Products Showcase", eyebrow: "Gallery", hero: "/images/site/mature-male-police-officer-pointing-by-finger-to-colleague-with-clipboard-near-car-at-street.jpg", summary: "Our teams, equipment and licensed arms in the field.", metaTitle: "Gallery | Four Stars Security", metaDescription: "Photos of Four Stars Security teams, operations, equipment and licensed arms." });
    add({ path: "contact-us", template: "contact", title: "Contact Us", heading: "Have any questions?", eyebrow: "Contact Us", hero: "/images/site/attractive-policewoman-talking-by-radio-set-near-police-car.jpg", summary: "If you have any questions, please do not hesitate to send us a message. We reply within 24 hours!", metaTitle: "Contact Us | Four Stars Security", metaDescription: "Contact Four Stars Security in Karachi, Peshawar, Islamabad or Quetta. Call (+92) 213 459 9993 or email info@4ssecurity.pk." });
    add({ path: "faqs", template: "faqs", type: "legal", title: "FAQs", heading: "Frequently Asked Questions", eyebrow: "Help Centre", hero: "/images/site/cropped-view-of-policeman-typing-on-laptop-keyboard.jpg", summary: "Answers to the questions clients ask us most about hiring guards and security services.", metaTitle: "FAQs | Four Stars Security", metaDescription: "Frequently asked questions about Four Stars Security guards, coverage, deployment times and services." });
    add({ path: "privacy-policy", type: "legal", title: "Privacy Policy", heading: "Privacy Policy", eyebrow: "Legal", body: PRIVACY, metaTitle: "Privacy Policy | Four Stars Security", metaDescription: "How Four Stars Security collects and uses information submitted through 4ssecurity.pk." });
    add({ path: "terms-and-conditions", type: "legal", title: "Terms & Conditions", heading: "Terms & Conditions", eyebrow: "Legal", body: TERMS, metaTitle: "Terms & Conditions | Four Stars Security", metaDescription: "Terms of use for the Four Stars Security website." });

    SERVICES.forEach((s, i) => {
      const x = sp(s.path);
      add({ path: s.path, type: "service", title: s.title, heading: x?.h1 || s.title, eyebrow: "Our Services", summary: s.summary, hero: x?.hero || s.image || "", images: x?.images ?? [], icon: s.icon, body: x?.body ?? "", metaTitle: x?.metaTitle, metaDescription: x?.metaDescription || s.summary, detail: x ? 1 : 0, sort: i });
    });
    INDUSTRIES.forEach((s, i) => {
      const x = sp(s.path)!;
      add({ path: s.path, type: "industry", title: s.title, heading: x.h1, eyebrow: "Industries", summary: x.metaDescription, hero: x.hero, images: x.images, icon: s.icon, body: x.body, metaTitle: x.metaTitle, metaDescription: x.metaDescription, sort: i });
    });
    LOCATIONS.forEach((s, i) => {
      const x = sp(s.path)!;
      add({ path: s.path, type: "location", title: s.title, heading: x.h1, eyebrow: "Locations", summary: x.metaDescription, hero: x.hero, images: x.images, icon: "map", body: x.body, metaTitle: x.metaTitle, metaDescription: x.metaDescription, sort: i });
    });

    const post = db.prepare(`INSERT INTO posts (slug, title, excerpt, body, cover, category, tags, status, featured, meta_title, meta_description, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?)`);
    S.posts.forEach((p) => {
      const date = new Date(p.date || Date.now()).toISOString();
      post.run(p.slug, p.title, p.metaDescription, p.body, p.cover, POST_CATEGORY[p.slug] ?? "Security Guides", "Karachi, Security Guards", p.slug.startsWith("benefits") ? 1 : 0, p.metaTitle, p.metaDescription, date, date, date);
    });

    const team = db.prepare("INSERT INTO team (name, position, department, photo, phone, featured, sort) VALUES (?, ?, 'Company Management', ?, ?, 1, ?)");
    TEAM.forEach((t, i) => team.run(t.name, "", t.photo, t.phone, i));

    const client = db.prepare("INSERT INTO clients (name, category, sort) VALUES (?, ?, ?)");
    let ci = 0;
    for (const [cat, names] of Object.entries(CLIENTS)) for (const n of names) client.run(n, cat, ci++);

    const faq = db.prepare("INSERT INTO faqs (question, answer, sort) VALUES (?, ?, ?)");
    FAQS.forEach(([q, a], i) => faq.run(q, `<p>${a}</p>`, i));

    const pub = path.join(process.cwd(), "public", "images");
    const media = db.prepare("INSERT OR IGNORE INTO media (url, name, mime, size) VALUES (?, ?, ?, ?)");
    const gal = db.prepare("INSERT INTO gallery (image, caption, category, sort) VALUES (?, ?, ?, ?)");
    for (const dir of ["site", "gallery"]) {
      const full = path.join(pub, dir);
      if (!fs.existsSync(full)) continue;
      fs.readdirSync(full)
        .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f) && !/-\d+x\d+\./.test(f))
        .forEach((f, i) => {
          const ext = f.split(".").pop()!.toLowerCase();
          media.run(`/images/${dir}/${f}`, f, `image/${ext === "jpg" ? "jpeg" : ext}`, fs.statSync(path.join(full, f)).size);
          if (dir === "gallery") gal.run(`/images/gallery/${f}`, galleryCaption(f), galleryCategory(f), i);
        });
    }

    // First admin account
    const email = (process.env.ADMIN_EMAIL || "admin@4ssecurity.pk").toLowerCase();
    let pw = process.env.ADMIN_PASSWORD;
    if (!pw) {
      pw = crypto.randomBytes(9).toString("base64url");
      fs.writeFileSync(path.join(DATA_DIR, "INITIAL_ADMIN_PASSWORD.txt"), `Email: ${email}\nPassword: ${pw}\nChange it after first login, then delete this file.\n`);
    }
    db.prepare("INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')").run("Administrator", email, hashPassword(pw));

    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
