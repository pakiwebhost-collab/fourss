"use client";

import { useState, useTransition, type FormEvent } from "react";

type State = { ok: boolean; message: string; errors?: Record<string, string> } | null;

/**
 * Submits a form to a server action without React's automatic form reset,
 * so visitors keep what they typed when validation fails. The form is only
 * cleared (remounted via `formKey`) after a successful submission when `resetOnSuccess` is set.
 */
export function useServerForm<S extends State>(action: (prev: S, fd: FormData) => Promise<S>, opts: { initial?: S; resetOnSuccess?: boolean } = {}) {
  const [state, setState] = useState<S>((opts.initial ?? null) as S);
  const [result, setResult] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const [pending, start] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const next = await action(state, fd);
      setState(next);
      setResult((n) => n + 1);
      if (next?.ok && opts.resetOnSuccess) setFormKey((k) => k + 1);
    });
  };

  return { state, pending, onSubmit, formKey, result };
}
