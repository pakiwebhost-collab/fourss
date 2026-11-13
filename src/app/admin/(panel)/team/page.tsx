import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, UserPlus } from "lucide-react";
import { all } from "@/lib/db";
import type { TeamRow } from "@/lib/types";
import { initials } from "@/lib/util";
import { moveItem } from "@/app/admin/actions";
import { Badge, Notice, PageHeader, btnPrimary, btnSecondary } from "@/components/admin/ui";

export default async function TeamAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const team = all<TeamRow>("SELECT * FROM team ORDER BY sort, id");
  return (
    <>
      <PageHeader
        title="Team"
        description="Members appear on the Team page, grouped by department. Featured members also show on About Us."
        actions={<>
          <a href="/team/" target="_blank" className={btnSecondary}><ExternalLink className="size-4" />View page</a>
          <Link href="/admin/team/new/" className={btnPrimary}><UserPlus className="size-4" />Add member</Link>
        </>}
      />
      {deleted && <Notice>Team member removed.</Notice>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.map((m, i) => (
          <div key={m.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Link href={`/admin/team/${m.id}/`} className="relative block aspect-[4/3] bg-zinc-900">
              {m.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo} alt="" className="h-full w-full object-cover object-top" />
              ) : (
                <span className="grid h-full place-items-center text-4xl font-bold text-amber-500">{initials(m.name)}</span>
              )}
              <span className="absolute left-2 top-2 flex gap-1">
                {!m.published && <Badge tone="amber">hidden</Badge>}
                {!!m.featured && <Badge tone="blue">featured</Badge>}
              </span>
            </Link>
            <div className="p-4">
              <p className="truncate font-medium">{m.name}</p>
              <p className="truncate text-sm text-zinc-500">{m.position || <span className="italic text-amber-700">No position set</span>}</p>
              <p className="truncate text-xs text-zinc-400">{m.department}</p>
              <div className="mt-3 flex items-center gap-1">
                <form action={moveItem}><input type="hidden" name="table" value="team" /><input type="hidden" name="id" value={m.id} /><input type="hidden" name="dir" value="up" />
                  <button disabled={i === 0} className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
                </form>
                <form action={moveItem}><input type="hidden" name="table" value="team" /><input type="hidden" name="id" value={m.id} /><input type="hidden" name="dir" value="down" />
                  <button disabled={i === team.length - 1} className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
                </form>
                <Link href={`/admin/team/${m.id}/`} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"><Pencil className="size-3.5" />Edit</Link>
              </div>
            </div>
          </div>
        ))}
        <Link href="/admin/team/new/" className="grid min-h-64 place-items-center rounded-lg border-2 border-dashed border-zinc-300 text-sm font-medium text-zinc-500 hover:border-amber-500 hover:text-zinc-900">
          <span className="flex flex-col items-center gap-2"><UserPlus className="size-6" />Add team member</span>
        </Link>
      </div>
    </>
  );
}
