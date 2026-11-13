"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Search, Upload, X } from "lucide-react";
import { Label } from "./Form";

type Media = { id: number; url: string; name: string };

export async function uploadFiles(files: FileList | File[]): Promise<{ urls: string[]; errors: string[] }> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) return { urls: [], errors: [`Upload failed (${res.status})`] };
  const data = await res.json();
  return { urls: data.files.map((f: { url: string }) => f.url), errors: data.errors ?? [] };
}

export function MediaModal({ open, onClose, onSelect, multiple = false }: { open: boolean; onClose: () => void; onSelect: (urls: string[]) => void; multiple?: boolean }) {
  const [items, setItems] = useState<Media[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (query = "") => {
    const r = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}`);
    if (r.ok) setItems((await r.json()).items);
  }, []);

  useEffect(() => {
    if (open) {
      dlg.current?.showModal();
      // Fetching data when the dialog opens; state is set after the request resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load(q);
    } else dlg.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Clear the selection when the dialog closes so it opens fresh next time.
  const close = () => {
    setSel([]);
    setErr("");
    onClose();
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const { urls, errors } = await uploadFiles(files);
    setBusy(false);
    setErr(errors.join(" · "));
    await load(q);
    setSel((s) => (multiple ? [...urls, ...s] : urls.slice(0, 1)));
  };

  const toggle = (url: string) => setSel((s) => (multiple ? (s.includes(url) ? s.filter((x) => x !== url) : [...s, url]) : [url]));

  return (
    <dialog ref={dlg} onClose={close} className="m-auto h-[85vh] w-[min(96vw,1100px)] rounded-xl bg-white p-0 shadow-2xl backdrop:bg-zinc-900/60">
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 p-4">
          <h2 className="text-lg font-semibold">Media library</h2>
          {/* Not a <form>: this modal is rendered inside editor forms, and forms can't be nested. */}
          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); if (!e.target.value) load(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); load(q); } }}
              placeholder="Search… (Enter)"
              aria-label="Search media"
              className="w-48 rounded-md border border-zinc-300 py-2 pl-8 pr-3 text-sm"
            />
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-amber-400">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <button type="button" onClick={close} className="grid size-9 place-items-center rounded-md hover:bg-zinc-100" aria-label="Close"><X className="size-5" /></button>
        </div>
        {err && <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        <div
          className="flex-1 overflow-y-auto p-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {items.map((m) => (
              <button type="button" key={m.id} onClick={() => toggle(m.url)} onDoubleClick={() => { onSelect([m.url]); close(); }} className={`group relative aspect-square overflow-hidden rounded-md border-2 bg-zinc-100 ${sel.includes(m.url) ? "border-amber-500" : "border-transparent hover:border-zinc-300"}`} title={m.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                {sel.includes(m.url) && <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-amber-500 text-zinc-900"><Check className="size-4" /></span>}
              </button>
            ))}
          </div>
          {!items.length && <p className="py-16 text-center text-sm text-zinc-500">No images yet. Drop files here or click Upload.</p>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">{sel.length ? `${sel.length} selected` : "Tip: drag & drop images to upload"}</p>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="button" disabled={!sel.length} onClick={() => { onSelect(sel); close(); }} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Use selected</button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

/** Single image input backed by a hidden field. */
export function ImageField({ name, label, defaultValue = "", hint, value: controlled, onChange }: { name?: string; label?: string; defaultValue?: string; hint?: string; value?: string; onChange?: (v: string) => void }) {
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const set = (v: string) => { setInner(v); onChange?.(v); };
  const [open, setOpen] = useState(false);
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      {name && <input type="hidden" name={name} value={value} />}
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => setOpen(true)} className="relative grid aspect-[4/3] w-36 shrink-0 place-items-center overflow-hidden rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 hover:border-amber-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="size-6" />}
        </button>
        <div className="flex min-w-0 flex-col gap-2">
          <button type="button" onClick={() => setOpen(true)} className="w-fit rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50">{value ? "Change image" : "Choose image"}</button>
          {value && <button type="button" onClick={() => set("")} className="w-fit text-sm text-red-600 hover:underline">Remove</button>}
          {value && <p className="truncate text-xs text-zinc-400">{value}</p>}
        </div>
      </div>
      <MediaModal open={open} onClose={() => setOpen(false)} onSelect={(u) => u[0] && set(u[0])} />
    </div>
  );
}

/** Multiple images stored as a JSON array in a hidden field. */
export function MultiImageField({ name, label, defaultValue = [], hint }: { name: string; label: string; defaultValue?: string[]; hint?: string }) {
  const [list, setList] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <input type="hidden" name={name} value={JSON.stringify(list)} />
      <div className="flex flex-wrap gap-3">
        {list.map((u, i) => (
          <div key={u + i} className="group relative aspect-[4/3] w-28 overflow-hidden rounded-md bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => setList(list.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100" aria-label="Remove image"><X className="size-3.5" /></button>
          </div>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="grid aspect-[4/3] w-28 place-items-center rounded-md border border-dashed border-zinc-300 text-zinc-400 hover:border-amber-500"><ImagePlus className="size-6" /></button>
      </div>
      <MediaModal open={open} multiple onClose={() => setOpen(false)} onSelect={(u) => setList([...list, ...u.filter((x) => !list.includes(x))])} />
    </div>
  );
}
