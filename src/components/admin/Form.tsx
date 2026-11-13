"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useServerForm } from "@/lib/useServerForm";
import { useFormStatus } from "react-dom";
import { CircleCheck, Loader2, Save, TriangleAlert } from "lucide-react";
import type { ActionState } from "@/app/admin/actions";

export const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-zinc-50";

export function Label({ children, hint, htmlFor }: { children: React.ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
      {hint && <span className="ml-1 font-normal text-zinc-400">— {hint}</span>}
    </label>
  );
}

export function Field({ label, hint, name, ...rest }: { label: string; hint?: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label hint={hint} htmlFor={`f-${name}`}>{label}</Label>
      <input id={`f-${name}`} name={name} className={inputCls} {...rest} />
    </div>
  );
}

export function TextArea({ label, hint, name, ...rest }: { label: string; hint?: string; name: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label hint={hint} htmlFor={`f-${name}`}>{label}</Label>
      <textarea id={`f-${name}`} name={name} className={inputCls} rows={4} {...rest} />
    </div>
  );
}

export function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-zinc-300 transition after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-amber-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/40" />
      <span className="text-sm">
        <span className="font-medium text-zinc-800">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

const PendingContext = createContext(false);

export function SubmitButton({ children = "Save changes", className = "" }: { children?: React.ReactNode; className?: string }) {
  const status = useFormStatus();
  const pending = useContext(PendingContext) || status.pending;
  return (
    <button type="submit" disabled={pending} className={`inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60 ${className}`}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : typeof children === "string" ? <Save className="size-4" /> : null}
      {pending ? "Saving…" : children}
    </button>
  );
}

/** Remount (via key) for each new result; it hides itself after a few seconds. */
export function Toast({ state }: { state: ActionState }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), state?.ok ? 3500 : 7000);
    return () => clearTimeout(t);
  }, [state]);
  if (!state || !show) return null;
  return (
    <div role="status" className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${state.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {state.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
      {state.message}
    </div>
  );
}

/** Form bound to a server action that returns ActionState; shows a toast on completion. */
export function ActionForm({
  action, children, className = "", initialMessage, resetOnSuccess = false,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  initialMessage?: string;
  resetOnSuccess?: boolean;
}) {
  const { state, pending, onSubmit, formKey, result } = useServerForm(action, {
    initial: initialMessage ? { ok: true, message: initialMessage } : null,
    resetOnSuccess,
  });
  return (
    <PendingContext.Provider value={pending}>
      <form onSubmit={onSubmit} className={className} key={`form-${formKey}`}>
        {children}
      </form>
      <Toast key={`toast-${result}`} state={state} />
    </PendingContext.Provider>
  );
}

export function ConfirmButton({ children, message = "Are you sure? This cannot be undone.", className = "" }: { children: React.ReactNode; message?: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className || "inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
    >
      {children}
    </button>
  );
}
