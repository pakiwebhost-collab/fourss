"use client";

import { useServerForm } from "@/lib/useServerForm";
import { usePathname } from "next/navigation";
import { ArrowRight, CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { submitContact, subscribe, type FormState } from "@/app/actions";

function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <div role="status" className={`flex items-start gap-2 rounded px-4 py-3 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
      {state.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
      {state.message}
    </div>
  );
}

export function ContactForm({ services, dark = false, kind = "contact", compact = false, defaultService = "" }: { services: string[]; dark?: boolean; kind?: "contact" | "quote"; compact?: boolean; defaultService?: string }) {
  const options = defaultService && !services.includes(defaultService) ? [defaultService, ...services] : services;
  const { state, pending, onSubmit, formKey } = useServerForm<FormState>(submitContact, { resetOnSuccess: true });
  const pathname = usePathname();
  const f =`field ${dark ? "field-dark" : ""}`;
  const err = (k: string) => state?.errors?.[k] && <p className="mt-1 text-xs text-red-500">{state.errors[k]}</p>;
  const label = `mb-1.5 block text-xs font-semibold uppercase tracking-wider ${dark ? "text-white/60" : "text-steel"}`;

  return (
    <form key={formKey} onSubmit={onSubmit} className="relative space-y-4" noValidate>
      <Honeypot />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="source" value={pathname} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${kind}-name`} className={label}>Full name *</label>
          <input id={`${kind}-name`} name="name" required className={f} placeholder="Your name" autoComplete="name" aria-invalid={!!state?.errors?.name} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${kind}-phone`} className={label}>Phone *</label>
          <input id={`${kind}-phone`} name="phone" type="tel" className={f} placeholder="03XX XXXXXXX" autoComplete="tel" aria-invalid={!!state?.errors?.phone} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor={`${kind}-email`} className={label}>Email</label>
          <input id={`${kind}-email`} name="email" type="email" className={f} placeholder="you@company.com" autoComplete="email" aria-invalid={!!state?.errors?.email} />
          {err("email")}
        </div>
        <div>
          <label htmlFor={`${kind}-subject`} className={label}>Service required</label>
          <select id={`${kind}-subject`} name="subject" className={`${f} ${dark ? "[&>option]:text-ink" : ""}`} defaultValue={defaultService}>
            <option value="">Select a service</option>
            {options.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value="Security Guards">Security Guards (Static)</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={`${kind}-message`} className={label}>Message {kind === "contact" && "*"}</label>
        <textarea id={`${kind}-message`} name="message" rows={compact ? 3 : 5} className={f} placeholder="Tell us about your site, number of guards, shift timings…" aria-invalid={!!state?.errors?.message} />
        {err("message")}
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending} className="btn btn-gold w-full sm:w-auto disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {pending ? "Sending…" : kind === "quote" ? "Request a Quote" : "Send Message"}
      </button>
    </form>
  );
}

export function SubscribeForm() {
  const { state, pending, onSubmit, formKey } = useServerForm<FormState>(subscribe, { resetOnSuccess: true });
  return (
    <form key={formKey} onSubmit={onSubmit} className="relative w-full" noValidate>
      <Honeypot />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="sub-email" className="sr-only">Email address</label>
        <input id="sub-email" name="email" type="email" required placeholder="Enter your email address" className="field field-dark flex-1" autoComplete="email" />
        <button type="submit" disabled={pending} className="btn btn-gold disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}Subscribe
        </button>
      </div>
      {state && <p role="status" className={`mt-2 text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>{state.message}</p>}
    </form>
  );
}
