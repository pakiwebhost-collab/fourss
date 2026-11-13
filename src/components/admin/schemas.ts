import type { SchemaSection } from "./SchemaForm";

const link = (key: string, label: string) => ({ key, label, type: "group" as const, fields: [{ key: "label", label: "Button text", type: "text" as const }, { key: "href", label: "Link", type: "url" as const, hint: "e.g. /contact-us/" }] });

export const homeSchema: SchemaSection[] = [
  {
    title: "Hero banner", key: "hero", description: "The first section visitors see.",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Headline", type: "text" },
      { key: "highlight", label: "Gold highlight line", type: "text" },
      { key: "text", label: "Intro text", type: "textarea", rows: 3 },
      { key: "image", label: "Background image", type: "image" },
      link("primary", "Main button"),
      link("secondary", "Second button"),
      { key: "badges", label: "Trust badges", type: "strings" },
    ],
  },
  {
    // Stats is a top-level array, so this section has no key.
    title: "Stats bar", description: "Numbers along the bottom of the hero.",
    fields: [{ key: "stats", label: "Stats", type: "list", itemLabel: "stat", titleKey: "label", fields: [{ key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" }] }],
  },
  {
    title: "About intro", key: "about",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "text", label: "Text", type: "textarea", rows: 5 },
      { key: "image", label: "Image", type: "image" },
      { key: "points", label: "Bullet points", type: "strings" },
      link("cta", "Button"),
    ],
  },
  {
    title: "Featured services", key: "services",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "text", label: "Intro", type: "textarea", rows: 3 },
      { key: "items", label: "Service cards", type: "list", itemLabel: "service card", fields: [
        { key: "title", label: "Title", type: "text" }, { key: "href", label: "Link", type: "url" }, { key: "text", label: "Text", type: "textarea", rows: 3 }, { key: "image", label: "Image", type: "image" },
      ] },
    ],
  },
  {
    title: "Recruitment standard", key: "recruitment",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "text", label: "Text", type: "textarea", rows: 5 },
      { key: "image", label: "Image", type: "image" },
      { key: "pillars", label: "Pillars", type: "list", itemLabel: "pillar", fields: [{ key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "textarea", rows: 2 }] },
    ],
  },
  {
    title: "Security equipment", key: "equipment",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "text", label: "Text", type: "textarea", rows: 4 },
      { key: "items", label: "Equipment list", type: "strings" },
      { key: "image", label: "Large image", type: "image" },
      { key: "image2", label: "Small image", type: "image" },
      link("cta", "Button"),
    ],
  },
  {
    title: "Why Four Stars", key: "trust",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "text", label: "Text", type: "textarea", rows: 7, hint: "blank line = new paragraph" },
      { key: "image", label: "Background image", type: "image" },
      { key: "values", label: "Value tiles", type: "list", itemLabel: "tile", fields: [{ key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "text" }, { key: "image", label: "Image", type: "image" }] },
    ],
  },
  { title: "Blog section", key: "blog", fields: [{ key: "eyebrow", label: "Small label", type: "text" }, { key: "title", label: "Heading", type: "text" }] },
  {
    title: "Bottom call-to-action", key: "cta",
    fields: [{ key: "title", label: "Heading", type: "text" }, { key: "text", label: "Text", type: "textarea", rows: 2 }, link("button", "Button")],
  },
];

export const aboutSchema: SchemaSection[] = [
  { title: "Vision", fields: [{ key: "visionTitle", label: "Heading", type: "text" }, { key: "vision", label: "Vision statement", type: "textarea", rows: 4 }] },
  { title: "Mission", fields: [{ key: "missionTitle", label: "Heading", type: "text" }, { key: "mission", label: "Mission points", type: "list", itemLabel: "point", fields: [{ key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "textarea", rows: 2 }] }] },
  { title: "Highlights", description: "Figures shown on the About page.", fields: [{ key: "highlights", label: "Highlights", type: "list", itemLabel: "highlight", titleKey: "label", fields: [{ key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" }] }] },
];

export const siteSchema: SchemaSection[] = [
  {
    title: "Company", fields: [
      { key: "companyName", label: "Company name", type: "text" },
      { key: "shortName", label: "Short name", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "footerAbout", label: "Footer description", type: "textarea", rows: 2 },
    ],
  },
  {
    title: "Contact details", fields: [
      { key: "email", label: "Public email", type: "text" },
      { key: "notifyEmail", label: "Send form notifications to", type: "text", hint: "comma separate for several" },
      { key: "address", label: "Head office address", type: "text" },
      { key: "hours", label: "Office hours", type: "text" },
      { key: "phones", label: "Phone numbers", type: "list", itemLabel: "phone", titleKey: "number", fields: [{ key: "label", label: "Label", type: "text" }, { key: "number", label: "Number", type: "text" }] },
    ],
  },
  {
    title: "WhatsApp", description: "Floating chat button.", fields: [
      { key: "whatsapp", label: "WhatsApp contacts", type: "list", itemLabel: "contact", titleKey: "label", fields: [{ key: "label", label: "Name", type: "text" }, { key: "number", label: "Number (with country code)", type: "text" }] },
      { key: "whatsappMessage", label: "Pre-filled message", type: "textarea", rows: 2 },
    ],
  },
  {
    title: "Offices", fields: [
      { key: "offices", label: "Offices", type: "list", itemLabel: "office", titleKey: "name", fields: [{ key: "name", label: "Name", type: "text" }, { key: "phone", label: "Phone", type: "text" }, { key: "address", label: "Address", type: "textarea", rows: 2 }] },
      { key: "mapEmbed", label: "Google Maps embed URL", type: "url", hint: "src of the embed iframe" },
    ],
  },
  {
    title: "Social media", fields: [{ key: "social", label: "Profiles", type: "group", fields: [
      { key: "facebook", label: "Facebook", type: "url" }, { key: "linkedin", label: "LinkedIn", type: "url" }, { key: "instagram", label: "Instagram", type: "url" }, { key: "youtube", label: "YouTube", type: "url" },
    ] }],
  },
  {
    title: "Default SEO", description: "Used for the homepage and pages without their own SEO.", fields: [
      { key: "defaultMetaTitle", label: "Meta title", type: "text" },
      { key: "defaultMetaDescription", label: "Meta description", type: "textarea", rows: 2 },
    ],
  },
];
