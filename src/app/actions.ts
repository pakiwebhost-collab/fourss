"use server";

import { run, get } from "@/lib/db";
import { getSite } from "@/lib/content";
import { sendNotification } from "@/lib/mail";
import { cleanText } from "@/lib/sanitize";
import { clientIp } from "@/lib/auth";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const hits = new Map<string, number[]>();

function rateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) return true;
  list.push(now);
  hits.set(key, list);
  return false;
}

export async function submitContact(_: FormState, fd: FormData): Promise<FormState> {
  // Honeypot: real visitors never see or fill this field.
  if (cleanText(fd.get("website"))) return { ok: true, message: "Thank you! We will get back to you shortly." };

  const data = {
    name: cleanText(fd.get("name"), 120),
    email: cleanText(fd.get("email"), 160).toLowerCase(),
    phone: cleanText(fd.get("phone"), 40),
    subject: cleanText(fd.get("subject"), 160),
    message: cleanText(fd.get("message"), 4000),
    source: cleanText(fd.get("source"), 200),
    kind: cleanText(fd.get("kind"), 20) === "quote" ? "quote" : "contact",
  };
  const errors: Record<string, string> = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (!data.phone && !data.email) errors.phone = "Please give a phone number or email so we can reach you.";
  if (data.email && !EMAIL.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.phone && !/^[+\d][\d\s\-()]{6,}$/.test(data.phone)) errors.phone = "Please enter a valid phone number.";
  if (data.message.length < 5 && data.kind === "contact") errors.message = "Please tell us a little about what you need.";
  if (Object.keys(errors).length) return { ok: false, message: "Please check the highlighted fields.", errors };

  const ip = await clientIp();
  if (rateLimited("contact:" + ip)) return { ok: false, message: "Too many messages sent. Please try again in a few minutes or call us directly." };

  const res = run(
    "INSERT INTO submissions (kind, name, email, phone, subject, message, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
    data.kind, data.name, data.email, data.phone, data.subject, data.message, data.source,
  );
  const site = getSite();
  const sent = await sendNotification(
    site.notifyEmail || site.email,
    `New ${data.kind === "quote" ? "quote request" : "website enquiry"}${data.subject ? `: ${data.subject}` : ""} from ${data.name}`,
    { Name: data.name, Phone: data.phone, Email: data.email, Service: data.subject, Message: data.message, Page: data.source },
    data.email || undefined,
  );
  if (sent) run("UPDATE submissions SET emailed = 1 WHERE id = ?", Number(res.lastInsertRowid));
  return { ok: true, message: "Thank you! Your message has been received. Our team will contact you within 24 hours." };
}

export async function subscribe(_: FormState, fd: FormData): Promise<FormState> {
  if (cleanText(fd.get("website"))) return { ok: true, message: "Subscribed!" };
  const email = cleanText(fd.get("email"), 160).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, message: "Please enter a valid email address." };
  const ip = await clientIp();
  if (rateLimited("sub:" + ip, 5)) return { ok: false, message: "Please try again later." };
  if (get("SELECT id FROM subscribers WHERE email = ?", email)) return { ok: true, message: "You're already subscribed. Thank you!" };
  run("INSERT INTO subscribers (email) VALUES (?)", email);
  const site = getSite();
  await sendNotification(site.notifyEmail || site.email, "New newsletter subscriber", { Email: email });
  return { ok: true, message: "Thanks for subscribing! You'll hear from us soon." };
}
