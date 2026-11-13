import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({ title, description, back, actions }: { title: string; description?: string; back?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && <Link href={back} className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"><ArrowLeft className="size-4" />Back</Link>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "", title, description }: { children: React.ReactNode; className?: string; title?: string; description?: string }) {
  return (
    <section className={`min-w-0 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function Badge({ children, tone = "zinc" }: { children: React.ReactNode; tone?: "zinc" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-700",
    blue: "bg-sky-50 text-sky-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export const btnPrimary = "inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600";
export const btnSecondary = "inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50";

export function Notice({ tone = "green", children }: { tone?: "green" | "red" | "amber"; children: React.ReactNode }) {
  const t = { green: "border-emerald-200 bg-emerald-50 text-emerald-800", red: "border-red-200 bg-red-50 text-red-800", amber: "border-amber-200 bg-amber-50 text-amber-900" }[tone];
  return <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${t}`}>{children}</div>;
}
