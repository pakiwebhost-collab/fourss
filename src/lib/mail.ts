import "server-only";
import nodemailer from "nodemailer";

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Sends a notification email. Returns false (never throws) when SMTP is not configured or fails. */
export async function sendNotification(to: string, subject: string, fields: Record<string, string>, replyTo?: string) {
  if (!mailConfigured() || !to) return false;
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_SECURE ?? (Number(process.env.SMTP_PORT || 465) === 465 ? "true" : "false")) === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const rows = Object.entries(fields)
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px;background:#f6f6f6;font-weight:600;vertical-align:top">${esc(k)}</td><td style="padding:8px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`,
      )
      .join("");
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      replyTo,
      subject,
      text: Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><h2 style="margin:0 0 12px">${esc(subject)}</h2><table style="border-collapse:collapse;border:1px solid #ddd">${rows}</table><p style="color:#777;font-size:12px">Sent from the 4ssecurity.pk website. View all messages in the admin inbox.</p></div>`,
    });
    return true;
  } catch (e) {
    console.error("[mail] send failed:", e);
    return false;
  }
}
