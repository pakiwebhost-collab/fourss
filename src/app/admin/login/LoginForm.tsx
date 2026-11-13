"use client";

import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { login, type ActionState } from "../actions";
import { inputCls, Label } from "@/components/admin/Form";
import { useServerForm } from "@/lib/useServerForm";

export default function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useServerForm<ActionState>(login);
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      {state && !state.ok && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}
      <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}Sign in
      </button>
      <p className="pt-2 text-center text-xs text-zinc-400"><Link href="/" className="hover:text-zinc-700">← Back to website</Link></p>
    </form>
  );
}
