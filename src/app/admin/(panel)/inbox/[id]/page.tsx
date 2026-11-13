import { notFound } from "next/navigation";
import { Mail, MailOpen, Phone, Trash2 } from "lucide-react";
import { get, run } from "@/lib/db";
import type { SubmissionRow } from "@/lib/types";
import { telHref, waHref } from "@/lib/util";
import { deleteSubmission, setRead } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/Form";
import { WhatsappIcon } from "@/components/site/Icon";
import { Badge, Card, PageHeader, btnSecondary } from "@/components/admin/ui";

export default async function MessageView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = get<SubmissionRow>("SELECT * FROM submissions WHERE id = ?", Number(id));
  if (!m) notFound();
  // Opening a message marks it as read.
  if (!m.is_read) run("UPDATE submissions SET is_read = 1 WHERE id = ?", m.id);
  const date = new Date(m.created_at.replace(" ", "T") + "Z").toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });

  return (
    <>
      <PageHeader title={m.name} description={`Received ${date} (PKT)`} back="/admin/inbox/" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <div className="mb-4 flex flex-wrap gap-2"><Badge tone={m.kind === "quote" ? "blue" : "zinc"}>{m.kind === "quote" ? "Quote request" : "Contact message"}</Badge>{m.emailed ? <Badge tone="green">emailed</Badge> : <Badge>not emailed</Badge>}</div>
          {m.subject && <p className="text-sm text-zinc-500">Service: <strong className="text-zinc-900">{m.subject}</strong></p>}
          <p className="mt-4 whitespace-pre-wrap leading-relaxed">{m.message || <em className="text-zinc-400">No message</em>}</p>
          {m.source && <p className="mt-6 text-xs text-zinc-400">Sent from page: {m.source}</p>}
        </Card>
        <div className="space-y-4">
          <Card title="Reply">
            <div className="space-y-2">
              {m.phone && <a href={telHref(m.phone)} className={`${btnSecondary} w-full`}><Phone className="size-4" />{m.phone}</a>}
              {m.phone && <a href={waHref(m.phone.replace(/^0/, "92"))} target="_blank" className={`${btnSecondary} w-full`}><WhatsappIcon className="size-4" />WhatsApp</a>}
              {m.email && <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your enquiry to Four Stars Security")}`} className={`${btnSecondary} w-full`}><Mail className="size-4" />{m.email}</a>}
            </div>
          </Card>
          <form action={setRead}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="read" value="0" />
            <button className={`${btnSecondary} w-full`}><MailOpen className="size-4" />Mark as unread</button>
          </form>
          <form action={deleteSubmission}>
            <input type="hidden" name="id" value={m.id} />
            <ConfirmButton message="Delete this message permanently?"><Trash2 className="size-4" />Delete message</ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
