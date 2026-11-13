"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Upload } from "lucide-react";
import { uploadFiles } from "./MediaPicker";

export function MediaUploader() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [drag, setDrag] = useState(false);
  const go = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const { urls, errors } = await uploadFiles(files);
    setBusy(false);
    setMsg([urls.length ? `${urls.length} file(s) uploaded.` : "", ...errors].filter(Boolean).join(" "));
    router.refresh();
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); go(e.dataTransfer.files); }}
      className={`mb-6 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition ${drag ? "border-amber-500 bg-amber-50" : "border-zinc-300 bg-white"}`}
    >
      {busy ? <Loader2 className="size-8 animate-spin text-amber-600" /> : <Upload className="size-8 text-zinc-400" />}
      <p className="text-sm text-zinc-600">Drag & drop images here, or</p>
      <button type="button" onClick={() => ref.current?.click()} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Choose files</button>
      <p className="text-xs text-zinc-400">JPG, PNG, WebP, GIF, PDF, MP4 · max 25 MB · large photos are optimised automatically</p>
      <input ref={ref} type="file" multiple hidden accept="image/*,application/pdf,video/mp4,video/webm" onChange={(e) => go(e.target.files)} />
      {msg && <p className="text-sm font-medium text-zinc-700">{msg}</p>}
    </div>
  );
}

export function CopyUrl({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1500); }} className="grid size-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" aria-label="Copy URL" title="Copy URL">
      {ok ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
    </button>
  );
}
