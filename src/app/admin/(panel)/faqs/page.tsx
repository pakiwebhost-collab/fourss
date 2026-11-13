import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { all } from "@/lib/db";
import type { FaqRow } from "@/lib/types";
import { saveFaq, deleteFaq, moveItem } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, Field, SubmitButton } from "@/components/admin/Form";
import RichEditor from "@/components/admin/RichEditor";
import { Card, PageHeader } from "@/components/admin/ui";

export default function FaqsAdmin() {
  const faqs = all<FaqRow>("SELECT * FROM faqs ORDER BY sort, id");
  return (
    <>
      <PageHeader title="FAQs" description="Questions shown on the FAQs page (also published as FAQ rich results for Google)." />
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={f.id} className="group rounded-lg border border-zinc-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <span className="text-xs font-semibold text-zinc-400">{i + 1}</span>
              <span className="flex-1 font-medium">{f.question}</span>
              <form action={moveItem}><input type="hidden" name="table" value="faqs" /><input type="hidden" name="id" value={f.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} className="grid size-7 place-items-center rounded hover:bg-zinc-100 disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button></form>
              <form action={moveItem}><input type="hidden" name="table" value="faqs" /><input type="hidden" name="id" value={f.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === faqs.length - 1} className="grid size-7 place-items-center rounded hover:bg-zinc-100 disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button></form>
            </summary>
            <div className="border-t border-zinc-100 p-4">
              <ActionForm action={saveFaq} className="space-y-4">
                <input type="hidden" name="id" value={f.id} />
                <Field label="Question" name="question" defaultValue={f.question} required />
                <RichEditor name="answer" label="Answer" defaultValue={f.answer} minHeight={120} />
                <SubmitButton>Save FAQ</SubmitButton>
              </ActionForm>
              <form action={deleteFaq} className="mt-3"><input type="hidden" name="id" value={f.id} /><ConfirmButton message="Delete this FAQ?"><Trash2 className="size-4" />Delete</ConfirmButton></form>
            </div>
          </details>
        ))}
      </div>
      <Card title="Add a question" className="mt-6">
        <ActionForm action={saveFaq} resetOnSuccess className="space-y-4">
          <input type="hidden" name="id" value="0" />
          <Field label="Question" name="question" required />
          <RichEditor name="answer" label="Answer" minHeight={120} />
          <SubmitButton><Plus className="size-4" />Add FAQ</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
