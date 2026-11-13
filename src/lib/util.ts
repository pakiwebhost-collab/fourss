export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "";
  const date = new Date(d.includes("T") || d.includes("Z") ? d : d.replace(" ", "T") + "Z");
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(html: string, len = 160) {
  const t = stripHtml(html);
  return t.length > len ? t.slice(0, len).replace(/\s+\S*$/, "") + "…" : t;
}

export function telHref(n: string) {
  return "tel:" + n.replace(/[^\d+]/g, "");
}

export function waHref(n: string, msg = "") {
  const num = n.replace(/\D/g, "");
  return `https://wa.me/${num}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
}

export function pagePath(path: string) {
  const p = path.replace(/^\/|\/$/g, "");
  return p ? `/${p}/` : "/";
}

export function initials(name: string) {
  return name
    .replace(/\(.*?\)|,.*$/g, "")
    .split(/\s+/)
    .filter((w) => w && !/^(col|maj|capt|lt|gen|brig|syed|dr|mr|mrs|ms)\.?$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
