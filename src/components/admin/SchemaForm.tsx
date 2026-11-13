"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { ImageField } from "./MediaPicker";
import { inputCls, Label } from "./Form";

export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "url"; hint?: string; rows?: number }
  | { key: string; label: string; type: "image"; hint?: string }
  | { key: string; label: string; type: "strings"; hint?: string }
  | { key: string; label: string; type: "group"; hint?: string; fields: FieldDef[]; collapsed?: boolean }
  | { key: string; label: string; type: "list"; hint?: string; fields: FieldDef[]; itemLabel?: string; titleKey?: string };

type Obj = Record<string, unknown>;

function emptyFor(fields: FieldDef[]): Obj {
  return Object.fromEntries(fields.map((f) => [f.key, f.type === "list" || f.type === "strings" ? [] : f.type === "group" ? emptyFor(f.fields) : ""]));
}

function FieldInput({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  switch (def.type) {
    case "text":
    case "url":
      return (
        <div>
          <Label hint={def.hint}>{def.label}</Label>
          <input className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "textarea":
      return (
        <div>
          <Label hint={def.hint}>{def.label}</Label>
          <textarea className={inputCls} rows={def.rows ?? 4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "image":
      return <ImageField label={def.label} hint={def.hint} value={String(value ?? "")} onChange={onChange} />;
    case "strings": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label hint={def.hint}>{def.label}</Label>
          <div className="space-y-2">
            {list.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} value={v} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" className="grid size-9 shrink-0 place-items-center rounded-md border border-zinc-300 text-red-600 hover:bg-red-50" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="size-4" /></button>
              </div>
            ))}
            <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:underline" onClick={() => onChange([...list, ""])}><Plus className="size-4" />Add</button>
          </div>
        </div>
      );
    }
    case "group": {
      const obj = (value as Obj) ?? {};
      return (
        <fieldset className="rounded-md border border-zinc-200 p-4">
          <legend className="px-1 text-sm font-semibold text-zinc-800">{def.label}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {def.fields.map((f) => (
              <div key={f.key} className={f.type === "text" || f.type === "url" ? "min-w-0" : "min-w-0 sm:col-span-2"}>
                <FieldInput def={f} value={obj[f.key]} onChange={(v) => onChange({ ...obj, [f.key]: v })} />
              </div>
            ))}
          </div>
        </fieldset>
      );
    }
    case "list": {
      const list = Array.isArray(value) ? (value as Obj[]) : [];
      const move = (i: number, d: number) => {
        const j = i + d;
        if (j < 0 || j >= list.length) return;
        const copy = [...list];
        [copy[i], copy[j]] = [copy[j], copy[i]];
        onChange(copy);
      };
      return (
        <div>
          <Label hint={def.hint}>{def.label}</Label>
          <div className="space-y-3">
            {list.map((item, i) => (
              <details key={i} className="group rounded-md border border-zinc-200 bg-zinc-50/60" open={list.length <= 2}>
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <ChevronDown className="size-4 text-zinc-400 transition group-open:rotate-180" />
                  <span className="truncate">{String(item[def.titleKey ?? def.fields[0].key] || `${def.itemLabel ?? "Item"} ${i + 1}`)}</span>
                  <span className="ml-auto flex gap-1">
                    <button type="button" onClick={(e) => { e.preventDefault(); move(i, -1); }} className="grid size-7 place-items-center rounded hover:bg-zinc-200" aria-label="Move up"><ArrowUp className="size-3.5" /></button>
                    <button type="button" onClick={(e) => { e.preventDefault(); move(i, 1); }} className="grid size-7 place-items-center rounded hover:bg-zinc-200" aria-label="Move down"><ArrowDown className="size-3.5" /></button>
                    <button type="button" onClick={(e) => { e.preventDefault(); if (confirm("Remove this item?")) onChange(list.filter((_, j) => j !== i)); }} className="grid size-7 place-items-center rounded text-red-600 hover:bg-red-50" aria-label="Remove"><Trash2 className="size-3.5" /></button>
                  </span>
                </summary>
                <div className="grid gap-4 border-t border-zinc-200 bg-white p-4 sm:grid-cols-2">
                  {def.fields.map((f) => (
                    <div key={f.key} className={f.type === "text" || f.type === "url" ? "min-w-0" : "min-w-0 sm:col-span-2"}>
                      <FieldInput def={f} value={item[f.key]} onChange={(v) => onChange(list.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))} />
                    </div>
                  ))}
                </div>
              </details>
            ))}
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:border-amber-500" onClick={() => onChange([...list, emptyFor(def.fields)])}>
              <Plus className="size-4" />Add {def.itemLabel ?? "item"}
            </button>
          </div>
        </div>
      );
    }
  }
}

export type SchemaSection = { title: string; description?: string; key?: string; fields: FieldDef[] };

export default function SchemaForm({ schema, initial }: { schema: SchemaSection[]; initial: Obj }) {
  const [value, setValue] = useState<Obj>(initial);
  return (
    <div className="space-y-6">
      <input type="hidden" name="value" value={JSON.stringify(value)} />
      {schema.map((section) => {
        // A section with a key edits a nested object (e.g. home.hero); otherwise it edits top-level fields.
        const obj = section.key ? ((value[section.key] as Obj) ?? {}) : value;
        const set = (k: string, v: unknown) =>
          setValue((old) => (section.key ? { ...old, [section.key]: { ...((old[section.key] as Obj) ?? {}), [k]: v } } : { ...old, [k]: v }));
        return (
          <section key={section.title} id={section.key} className="min-w-0 scroll-mt-20 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-zinc-900">{section.title}</h2>
            {section.description && <p className="mt-0.5 text-sm text-zinc-500">{section.description}</p>}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {section.fields.map((f) => (
                <div key={f.key} className={f.type === "text" || f.type === "url" ? "min-w-0" : "min-w-0 sm:col-span-2"}>
                  <FieldInput def={f} value={obj[f.key]} onChange={(v) => set(f.key, v)} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
