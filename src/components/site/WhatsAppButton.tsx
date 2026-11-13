"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { WhatsappIcon } from "./Icon";

export default function WhatsAppButton({ contacts, message }: { contacts: { label: string; number: string }[]; message: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  if (!contacts.length) return null;
  const href = (n: string) => `https://wa.me/${n.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="w-72 overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between bg-[#075e54] px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Chat with us</p>
              <p className="text-xs text-white/75">We typically reply within minutes</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat options"><X className="size-4" /></button>
          </div>
          <ul className="p-2">
            {contacts.map((c) => (
              <li key={c.number}>
                <a href={href(c.number)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-paper">
                  <span className="grid size-10 place-items-center rounded-full bg-[#25d366] text-white"><WhatsappIcon className="size-5" /></span>
                  <span><span className="block text-sm font-semibold">{c.label}</span><span className="block text-xs text-steel">{c.number}</span></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (contacts.length === 1) window.open(href(contacts[0].number), "_blank", "noopener"); else setOpen((o) => !o); }}
        className="group flex items-center gap-2 rounded-full bg-[#25d366] py-3 pl-3 pr-3 text-white shadow-lg shadow-black/20 transition hover:pr-5 sm:pr-5"
        aria-label="Chat with us on WhatsApp"
        aria-expanded={open}
      >
        <WhatsappIcon className="size-7" />
        <span className="hidden text-sm font-semibold sm:inline">Need Help? Chat with us</span>
      </button>
    </div>
  );
}
