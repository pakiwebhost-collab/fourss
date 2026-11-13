"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { FacebookIcon, LinkedinIcon, WhatsappIcon } from "./Icon";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const cls = "grid size-10 place-items-center rounded-full border border-line text-ink transition hover:border-gold hover:bg-gold";
  return (
    <div className="flex gap-2">
      <a className={cls} href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><WhatsappIcon className="size-4" /></a>
      <a className={cls} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><FacebookIcon className="size-4" /></a>
      <a className={cls} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><LinkedinIcon className="size-4" /></a>
      <button
        type="button"
        className={cls}
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {}
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
