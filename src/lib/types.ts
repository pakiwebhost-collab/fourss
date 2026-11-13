export type Link = { label: string; href: string };

export type SiteSettings = {
  companyName: string;
  shortName: string;
  tagline: string;
  email: string;
  notifyEmail: string;
  address: string;
  hours: string;
  phones: { label: string; number: string }[];
  whatsapp: { label: string; number: string }[];
  whatsappMessage: string;
  social: { facebook: string; linkedin: string; instagram: string; youtube: string };
  offices: { name: string; address: string; phone: string }[];
  mapEmbed: string;
  footerAbout: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    text: string;
    image: string;
    primary: Link;
    secondary: Link;
    badges: string[];
  };
  stats: { value: string; label: string }[];
  about: { eyebrow: string; title: string; text: string; image: string; points: string[]; cta: Link };
  services: { eyebrow: string; title: string; text: string; items: { title: string; text: string; image: string; href: string }[] };
  recruitment: { eyebrow: string; title: string; text: string; image: string; pillars: { title: string; text: string }[] };
  equipment: { eyebrow: string; title: string; text: string; items: string[]; image: string; image2: string; cta: Link };
  trust: { eyebrow: string; title: string; text: string; image: string; values: { title: string; text: string; image: string }[] };
  cta: { title: string; text: string; button: Link };
  blog: { eyebrow: string; title: string };
};

export type AboutContent = {
  visionTitle: string;
  vision: string;
  missionTitle: string;
  mission: { title: string; text: string }[];
  highlights: { value: string; label: string }[];
};

export type PageRow = {
  id: number;
  path: string;
  type: "page" | "service" | "industry" | "location" | "legal";
  template: string;
  title: string;
  heading: string;
  eyebrow: string;
  summary: string;
  hero_image: string;
  images: string;
  icon: string;
  body: string;
  meta_title: string;
  meta_description: string;
  show_in_listing: number;
  has_detail: number;
  sort: number;
  published: number;
  updated_at: string;
};

export type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  category: string;
  tags: string;
  author: string;
  status: "draft" | "published";
  featured: number;
  meta_title: string;
  meta_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamRow = {
  id: number;
  name: string;
  position: string;
  department: string;
  bio: string;
  photo: string;
  phone: string;
  email: string;
  linkedin: string;
  featured: number;
  sort: number;
  published: number;
};

export type ClientRow = { id: number; name: string; category: string; logo: string; sort: number };
export type GalleryRow = { id: number; image: string; caption: string; category: string; sort: number };
export type FaqRow = { id: number; question: string; answer: string; sort: number };
export type SubmissionRow = {
  id: number;
  kind: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  is_read: number;
  emailed: number;
  created_at: string;
};
export type MediaRow = { id: number; url: string; name: string; mime: string; size: number; alt: string; created_at: string };
export type UserRow = { id: number; name: string; email: string; password_hash: string; role: string; created_at: string };
