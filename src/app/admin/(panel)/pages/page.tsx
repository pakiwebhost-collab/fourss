import Link from "next/link";
import { ExternalLink, EyeOff, Pencil, Plus } from "lucide-react";
import { all } from "@/lib/db";
import type { PageRow } from "@/lib/types";
import { pagePath } from "@/lib/util";
import { Badge, Notice, PageHeader, btnPrimary } from "@/components/admin/ui";

const TABS = [
  { key: "page", label: "Main pages" },
  { key: "service", label: "Services" },
  { key: "industry", label: "Industries" },
  { key: "location", label: "Locations" },
  { key: "legal", label: "FAQ & Legal" },
];

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ type?: string; deleted?: string }> }) {
  const { type = "page", deleted } = await searchParams;
  const pages = all<PageRow>("SELECT * FROM pages WHERE type = ? ORDER BY sort, title", type);
  const counts = Object.fromEntries(all<{ type: string; n: number }>("SELECT type, COUNT(*) n FROM pages GROUP BY type").map((r) => [r.type, r.n]));

  return (
    <>
      <PageHeader title="Pages & Services" description="Edit text, images and SEO for every page on the site." actions={<Link href={`/admin/pages/new/?type=${type}`} className={btnPrimary}><Plus className="size-4" />New {type === "page" ? "page" : type}</Link>} />
      {deleted && <Notice>Page deleted.</Notice>}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/pages/?type=${t.key}`} className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium ${type === t.key ? "border-amber-500 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}>
            {t.label} <span className="text-zinc-400">{counts[t.key] ?? 0}</span>
          </Link>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <ul className="divide-y divide-zinc-100">
          {pages.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4">
              <div className="hidden h-12 w-16 shrink-0 overflow-hidden rounded bg-zinc-100 sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.hero_image && <img src={p.hero_image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/pages/${p.id}/`} className="font-medium hover:text-amber-700">{p.title}</Link>
                <p className="truncate text-xs text-zinc-500">{pagePath(p.path)}</p>
              </div>
              <div className="flex items-center gap-2">
                {!p.published && <Badge tone="amber"><EyeOff className="mr-1 size-3" />hidden</Badge>}
                {p.type === "service" && !p.has_detail && <Badge>card only</Badge>}
                {p.template !== "default" && <Badge tone="blue">{p.template}</Badge>}
                {(p.has_detail || p.type !== "service") && <a href={pagePath(p.path)} target="_blank" className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" aria-label="View"><ExternalLink className="size-4" /></a>}
                <Link href={`/admin/pages/${p.id}/`} className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" aria-label="Edit"><Pencil className="size-4" /></Link>
              </div>
            </li>
          ))}
          {!pages.length && <li className="p-10 text-center text-sm text-zinc-500">No pages in this section.</li>}
        </ul>
      </div>
    </>
  );
}
