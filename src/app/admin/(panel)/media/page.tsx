import { FileText, Search, Trash2 } from "lucide-react";
import { all } from "@/lib/db";
import type { MediaRow } from "@/lib/types";
import { deleteMedia } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/Form";
import { CopyUrl, MediaUploader } from "@/components/admin/MediaUploader";
import { PageHeader } from "@/components/admin/ui";

const size = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default async function MediaAdmin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const items = all<MediaRow>("SELECT * FROM media WHERE name LIKE ? OR url LIKE ? ORDER BY id DESC", `%${q}%`, `%${q}%`);
  return (
    <>
      <PageHeader title="Media library" description={`${items.length} files. Uploaded images can be used anywhere in the CMS.`} />
      <MediaUploader />
      <form className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input name="q" defaultValue={q} placeholder="Search files…" className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm" />
      </form>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {items.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <a href={m.url} target="_blank" className="block aspect-square bg-zinc-100">
              {m.mime.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt || m.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full place-items-center text-zinc-400"><FileText className="size-8" /></span>
              )}
            </a>
            <div className="p-2">
              <p className="truncate text-xs font-medium" title={m.name}>{m.name}</p>
              <p className="text-[11px] text-zinc-400">{size(m.size)}</p>
              <div className="mt-2 flex gap-1">
                <CopyUrl url={m.url} />
                <form action={deleteMedia} className="ml-auto">
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton message="Delete this file? Pages still using it will show a broken image." className="grid size-8 place-items-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></ConfirmButton>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
