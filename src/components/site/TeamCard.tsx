"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mail, Phone, X } from "lucide-react";
import type { TeamRow } from "@/lib/types";
import { initials } from "@/lib/util";
import { LinkedinIcon } from "./Icon";

function Contacts({ m, dark = false }: { m: TeamRow; dark?: boolean }) {
  const cls = `grid size-9 place-items-center rounded-full transition ${dark ? "bg-white/10 text-white hover:bg-gold hover:text-ink" : "bg-paper text-ink hover:bg-gold"}`;
  return (
    <div className="flex gap-2">
      {m.phone && <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className={cls} aria-label={`Call ${m.name}`} onClick={(e) => e.stopPropagation()}><Phone className="size-4" /></a>}
      {m.email && <a href={`mailto:${m.email}`} className={cls} aria-label={`Email ${m.name}`} onClick={(e) => e.stopPropagation()}><Mail className="size-4" /></a>}
      {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${m.name} on LinkedIn`} onClick={(e) => e.stopPropagation()}><LinkedinIcon className="size-4" /></a>}
    </div>
  );
}

function Photo({ m, sizes }: { m: TeamRow; sizes: string }) {
  return m.photo ? (
    <Image src={m.photo} alt={m.name} fill sizes={sizes} className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
  ) : (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-ink-3 to-ink font-display text-6xl font-bold text-gold">{initials(m.name)}</div>
  );
}

export default function TeamCard({ member: m, variant = "default" }: { member: TeamRow; variant?: "default" | "feature" }) {
  const [open, setOpen] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dlg.current?.showModal();
    else dlg.current?.close();
  }, [open]);
  const role = m.position || m.department || "Management";

  return (
    <>
      <article className="group h-full">
        <button type="button" onClick={() => setOpen(true)} className="block w-full text-left" aria-label={`View profile of ${m.name}`}>
          <div className={`relative overflow-hidden rounded-md bg-ink ${variant === "feature" ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
            <Photo m={m} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-90" />
            <div className="absolute left-0 top-6 h-10 w-1 bg-gold transition-all duration-300 group-hover:h-16" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-gold">{role}</p>
              <h3 className="mt-1.5 font-display text-xl font-bold uppercase leading-tight sm:text-2xl">{m.name}</h3>
              <span className="mt-3 inline-block translate-y-2 text-xs font-semibold uppercase tracking-wider text-white/70 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">View profile →</span>
            </div>
          </div>
        </button>
        <div className="mt-4 flex items-center justify-between gap-3">
          {m.phone ? <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="text-sm font-semibold text-ink/80 hover:text-gold-dark">{m.phone}</a> : <span className="text-sm text-steel">{m.department}</span>}
          <Contacts m={{ ...m, phone: "" }} />
        </div>
      </article>

      <dialog ref={dlg} onClose={() => setOpen(false)} onClick={(e) => e.target === dlg.current && setOpen(false)} className="m-auto w-[min(92vw,820px)] overflow-hidden rounded-lg bg-white p-0 backdrop:bg-ink/70 backdrop:backdrop-blur-sm">
        {open && (
          <div className="grid sm:grid-cols-[300px_1fr]">
            <div className="relative aspect-[4/3] bg-ink sm:aspect-auto sm:min-h-[420px]"><Photo m={m} sizes="300px" /></div>
            <div className="relative p-7 sm:p-9">
              <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-paper hover:bg-gold" aria-label="Close"><X className="size-4" /></button>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-gold-dark">{role}</p>
              <h2 className="h-display mt-2 pr-10 text-3xl">{m.name}</h2>
              <p className="mt-1 text-sm text-steel">{m.department}</p>
              <div className="mt-5 h-px bg-line" />
              <p className="mt-5 whitespace-pre-line leading-relaxed text-ink/80">{m.bio || `${m.name} is part of the ${m.department || "management"} team at Four Stars Security Services (Pvt) Ltd.`}</p>
              <div className="mt-6 space-y-2 text-sm">
                {m.phone && <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 font-semibold hover:text-gold-dark"><Phone className="size-4 text-gold-dark" />{m.phone}</a>}
                {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-2 font-semibold hover:text-gold-dark"><Mail className="size-4 text-gold-dark" />{m.email}</a>}
              </div>
              <div className="mt-6"><Contacts m={m} /></div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
