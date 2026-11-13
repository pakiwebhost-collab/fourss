import Link from "next/link";
import { Download, Mail, Trash2 } from "lucide-react";
import { all } from "@/lib/db";
import type { SubmissionRow } from "@/lib/types";
import { formatDate } from "@/lib/util";
import { deleteSubscriber } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/Form";
import { Badge, Notice, PageHeader, btnSecondary } from "@/components/admin/ui";

export default async function InboxAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; filter?: string; deleted?: string }> }) {
  const { tab = "messages", filter = "", deleted } = await searchParams;
  const where = filter === "unread" ? "WHERE is_read = 0" : filter === "quote" ? "WHERE kind = 'quote'" : filter === "contact" ? "WHERE kind = 'contact'" : "";
  const msgs = all<SubmissionRow>(`SELECT * FROM submissions ${where} ORDER BY id DESC LIMIT 500`);
  const subs = all<{ id: number; email: string; created_at: string }>("SELECT * FROM subscribers ORDER BY id DESC");
  const tabCls = (a: boolean) => `-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${a ? "border-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-900"}`;

  return (
    <>
      <PageHeader title="Inbox" description="Every contact, quote and newsletter form submission is stored here." actions={<a href={`/api/admin/export?type=${tab === "subscribers" ? "subscribers" : "submissions"}`} className={btnSecondary}><Download className="size-4" />Export CSV</a>} />
      {deleted && <Notice>Message deleted.</Notice>}
      <div className="mb-4 flex gap-1 border-b border-zinc-200">
        <Link href="/admin/inbox/" className={tabCls(tab !== "subscribers")}>Messages <span className="text-zinc-400">{msgs.length}</span></Link>
        <Link href="/admin/inbox/?tab=subscribers" className={tabCls(tab === "subscribers")}>Subscribers <span className="text-zinc-400">{subs.length}</span></Link>
      </div>

      {tab === "subscribers" ? (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-100">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <Mail className="size-4 text-zinc-400" />
                <a href={`mailto:${s.email}`} className="flex-1 text-sm font-medium hover:text-amber-700">{s.email}</a>
                <span className="text-xs text-zinc-400">{formatDate(s.created_at)}</span>
                <form action={deleteSubscriber}><input type="hidden" name="id" value={s.id} /><ConfirmButton message="Remove this subscriber?" className="grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></ConfirmButton></form>
              </li>
            ))}
            {!subs.length && <li className="p-10 text-center text-sm text-zinc-500">No subscribers yet.</li>}
          </ul>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            {[["", "All"], ["unread", "Unread"], ["quote", "Quote requests"], ["contact", "Contact messages"]].map(([k, l]) => (
              <Link key={k} href={`/admin/inbox/${k ? `?filter=${k}` : ""}`} className={`rounded-full px-3 py-1.5 font-medium ${filter === k ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white"}`}>{l}</Link>
            ))}
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <ul className="divide-y divide-zinc-100">
              {msgs.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/inbox/${m.id}/`} className={`flex items-start gap-3 px-4 py-3.5 hover:bg-zinc-50 ${m.is_read ? "" : "bg-amber-50/40"}`}>
                    <span className={`mt-2 size-2 shrink-0 rounded-full ${m.is_read ? "bg-transparent" : "bg-amber-500"}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`flex flex-wrap items-center gap-2 text-sm ${m.is_read ? "" : "font-semibold"}`}>
                        {m.name}<span className="font-normal text-zinc-500">{m.phone || m.email}</span><Badge tone={m.kind === "quote" ? "blue" : "zinc"}>{m.kind}</Badge>
                      </p>
                      <p className="mt-0.5 truncate text-sm text-zinc-500">{m.subject ? <strong className="font-medium text-zinc-700">{m.subject}: </strong> : null}{m.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-400">{formatDate(m.created_at)}</span>
                  </Link>
                </li>
              ))}
              {!msgs.length && <li className="p-10 text-center text-sm text-zinc-500">No messages.</li>}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
