"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type Item = { id: number; image: string; caption: string; category: string };

export default function GalleryGrid({ items }: { items: Item[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [cat, setCat] = useState("All");
  const [idx, setIdx] = useState<number | null>(null);
  const list = cat === "All" ? items : items.filter((i) => i.category === cat);

  const move = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [idx, move]);

  const active = idx !== null ? list[idx] : null;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Gallery categories">
        {cats.map((c) => (
          <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${cat === c ? "bg-ink text-white" : "bg-paper hover:bg-line"}`}>
            {c} <span className="opacity-50">{c === "All" ? items.length : items.filter((i) => i.category === c).length}</span>
          </button>
        ))}
      </div>
      <div className="mt-10 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        {list.map((it, i) => (
          <button key={it.id} type="button" onClick={() => setIdx(i)} className="group relative mb-3 block w-full overflow-hidden rounded-md bg-paper sm:mb-4" aria-label={`Open image${it.caption ? `: ${it.caption}` : ""}`}>
            <Image src={it.image} alt={it.caption || it.category} width={600} height={450} sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" className="h-auto w-full transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100"><ZoomIn className="size-8 text-white" /></span>
            {it.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{it.caption}</span>}
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setIdx(null)}>
          <button type="button" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-ink" onClick={() => setIdx(null)} aria-label="Close"><X className="size-5" /></button>
          <button type="button" className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-ink sm:left-6" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous image"><ChevronLeft className="size-6" /></button>
          <button type="button" className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-ink sm:right-6" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next image"><ChevronRight className="size-6" /></button>
          <figure className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={active.image} alt={active.caption || active.category} fill sizes="100vw" className="object-contain" />
            <figcaption className="absolute inset-x-0 -bottom-8 text-center text-sm text-white/70">{active.caption || active.category} · {idx! + 1} / {list.length}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
