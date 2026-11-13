import { Plus, Trash2 } from "lucide-react";
import { all } from "@/lib/db";
import type { ClientRow } from "@/lib/types";
import { groupBy } from "@/lib/content";
import { saveClient, deleteClient } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, inputCls, SubmitButton } from "@/components/admin/Form";
import { ImageField } from "@/components/admin/MediaPicker";
import { Card, PageHeader } from "@/components/admin/ui";

export default function ClientsAdmin() {
  const clients = all<ClientRow>("SELECT * FROM clients ORDER BY sort, id");
  const cats = [...new Set(clients.map((c) => c.category))];
  const groups = groupBy(clients, (c) => c.category);
  return (
    <>
      <PageHeader title="Clients" description="Shown on the Clients page (grouped by category) and in the homepage marquee." />
      <datalist id="client-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
      <Card title="Add a client" className="mb-6">
        <ActionForm action={saveClient} resetOnSuccess className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="id" value="0" />
          <div><label className="mb-1.5 block text-sm font-medium">Client name</label><input name="name" required className={inputCls} placeholder="e.g. ABC Textiles (Pvt) Ltd" /></div>
          <div><label className="mb-1.5 block text-sm font-medium">Category</label><input name="category" list="client-cats" className={inputCls} placeholder="e.g. Ltd Companies" /></div>
          <SubmitButton><Plus className="size-4" />Add</SubmitButton>
        </ActionForm>
      </Card>
      <div className="space-y-6">
        {groups.map(([cat, list]) => (
          <Card key={cat} title={`${cat} (${list.length})`}>
            <ul className="divide-y divide-zinc-100">
              {list.map((c) => (
                <li key={c.id} className="py-3">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {c.logo ? <img src={c.logo} alt="" className="size-8 rounded object-contain" /> : <span className="size-2 rounded-full bg-amber-500" />}
                      <span className="flex-1 text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-zinc-400 group-open:hidden">Edit</span>
                    </summary>
                    <div className="mt-3 rounded-md bg-zinc-50 p-4">
                      <ActionForm action={saveClient} className="grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="id" value={c.id} />
                        <div><label className="mb-1.5 block text-sm font-medium">Name</label><input name="name" defaultValue={c.name} required className={inputCls} /></div>
                        <div><label className="mb-1.5 block text-sm font-medium">Category</label><input name="category" defaultValue={c.category} list="client-cats" className={inputCls} /></div>
                        <div className="sm:col-span-2"><ImageField name="logo" label="Logo (optional)" defaultValue={c.logo} /></div>
                        <div><SubmitButton>Save</SubmitButton></div>
                      </ActionForm>
                      <form action={deleteClient} className="mt-3">
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton message={`Remove ${c.name}?`}><Trash2 className="size-4" />Remove</ConfirmButton>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
