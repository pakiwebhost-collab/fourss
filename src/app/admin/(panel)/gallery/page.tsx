import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { all } from "@/lib/db";
import type { GalleryRow } from "@/lib/types";
import { addGalleryImages, deleteGalleryItem, moveItem, saveGalleryItem } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, inputCls, SubmitButton } from "@/components/admin/Form";
import { MultiImageField } from "@/components/admin/MediaPicker";
import { Card, PageHeader, btnSecondary } from "@/components/admin/ui";

export default async function GalleryAdmin({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat = "" } = await searchParams;
  const all_ = all<GalleryRow>("SELECT * FROM gallery ORDER BY sort, id");
  const cats = [...new Set(all_.map((g) => g.category))];
  const items = cat ? all_.filter((g) => g.category === cat) : all_;
  return (
    <>
      <PageHeader title="Gallery" description={`${all_.length} images. Visitors can filter by category.`} actions={<a href="/gallery/" target="_blank" className={btnSecondary}><ExternalLink className="size-4" />View gallery</a>} />
      <datalist id="gal-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
      <Card title="Add images" description="Pick from the media library or upload new photos." className="mb-6">
        <ActionForm action={addGalleryImages} resetOnSuccess className="space-y-4">
          <MultiImageField name="images" label="Images" />
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-64"><label className="mb-1.5 block text-sm font-medium">Category</label><input name="category" list="gal-cats" defaultValue={cats[0]} className={inputCls} /></div>
            <SubmitButton><Plus className="size-4" />Add to gallery</SubmitButton>
          </div>
        </ActionForm>
      </Card>
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/gallery/" className={`rounded-full px-3 py-1.5 text-sm font-medium ${!cat ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200"}`}>All</Link>
        {cats.map((c) => <Link key={c} href={`/admin/gallery/?cat=${encodeURIComponent(c)}`} className={`rounded-full px-3 py-1.5 text-sm font-medium ${cat === c ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200"}`}>{c}</Link>)}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-2 p-3">
              <ActionForm action={saveGalleryItem} className="space-y-2">
                <input type="hidden" name="id" value={g.id} />
                <input name="caption" defaultValue={g.caption} placeholder="Caption" className={inputCls} />
                <input name="category" defaultValue={g.category} list="gal-cats" className={inputCls} />
                <SubmitButton className="w-full py-1.5">Save</SubmitButton>
              </ActionForm>
              <div className="flex items-center gap-1">
                <form action={moveItem}><input type="hidden" name="table" value="gallery" /><input type="hidden" name="id" value={g.id} /><input type="hidden" name="dir" value="up" /><button className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" aria-label="Move earlier"><ArrowUp className="size-4" /></button></form>
                <form action={moveItem}><input type="hidden" name="table" value="gallery" /><input type="hidden" name="id" value={g.id} /><input type="hidden" name="dir" value="down" /><button className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" aria-label="Move later"><ArrowDown className="size-4" /></button></form>
                <form action={deleteGalleryItem} className="ml-auto"><input type="hidden" name="id" value={g.id} /><ConfirmButton message="Remove this image from the gallery? (It stays in the media library.)" className="grid size-8 place-items-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></ConfirmButton></form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
