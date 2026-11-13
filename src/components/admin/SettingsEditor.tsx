import { saveSettings } from "@/app/admin/actions";
import { ActionForm, SubmitButton } from "./Form";
import SchemaForm, { type SchemaSection } from "./SchemaForm";

export default function SettingsEditor({ settingKey, schema, value, viewHref }: { settingKey: "site" | "home" | "about"; schema: SchemaSection[]; value: Record<string, unknown>; viewHref?: string }) {
  return (
    <ActionForm action={saveSettings} className="pb-20">
      <input type="hidden" name="key" value={settingKey} />
      <SchemaForm schema={schema} initial={value} />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {viewHref && <a href={viewHref} target="_blank" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">View on site ↗</a>}
          <SubmitButton />
        </div>
      </div>
    </ActionForm>
  );
}
