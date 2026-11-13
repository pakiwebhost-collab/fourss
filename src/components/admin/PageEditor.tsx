import { ExternalLink, Trash2 } from "lucide-react";
import type { PageRow } from "@/lib/types";
import { savePage, deletePage } from "@/app/admin/actions";
import { pageImages } from "@/lib/content";
import { pagePath } from "@/lib/util";
import { ICON_NAMES } from "@/components/site/Icon";
import { ActionForm, ConfirmButton, Field, inputCls, Label, SubmitButton, TextArea, Toggle } from "./Form";
import { ImageField, MultiImageField } from "./MediaPicker";
import RichEditor from "./RichEditor";
import { Card } from "./ui";

const TEMPLATE_HELP: Record<string, string> = {
  services: "Shows all service cards, then the content below.",
  industries: "Shows all industry pages as cards.",
  locations: "Shows all location pages and office addresses.",
  clients: "Shows the client list (edit under Clients).",
  about: "Shows vision, mission and management (edit under About Content and Team).",
  team: "Shows team members (edit under Team).",
  blog: "Shows published blog posts with filters.",
  gallery: "Shows the gallery (edit under Gallery).",
  contact: "Shows office addresses, contact form and map (edit under Site Settings).",
  faqs: "Shows the FAQ list (edit under FAQs).",
};

export default function PageEditor({ page, type = "page", saved, error }: { page?: PageRow; type?: string; saved?: boolean; error?: string }) {
  const t = page?.type ?? type;
  const template = page?.template ?? "default";
  const core = template !== "default";
  const prefix = t === "service" ? "our-services/" : t === "industry" ? "industries/" : t === "location" ? "locations/security-services-karachi/" : "";
  return (
    <>
      {error === "core" && <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This is a core page and can’t be deleted. Untick “Published” to hide it instead.</p>}
      <ActionForm action={savePage} initialMessage={saved ? "Page created." : undefined} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <input type="hidden" name="id" value={page?.id ?? 0} />
        <input type="hidden" name="type" value={t} />
        <input type="hidden" name="template" value={template} />
        <div className="min-w-0 space-y-6">
          {core && <p className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"><strong>Template: {template}.</strong> {TEMPLATE_HELP[template]}</p>}
          <Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Title" name="title" defaultValue={page?.title} required hint="used in menus & cards" />
              <Field label="URL path" name="path" defaultValue={page?.path ?? prefix} required hint="e.g. our-services/guard-services" />
              <div className="sm:col-span-2"><Field label="Main heading (H1)" name="heading" defaultValue={page?.heading} hint="defaults to title" /></div>
              <Field label="Eyebrow label" name="eyebrow" defaultValue={page?.eyebrow} hint="small text above heading" />
              {t !== "page" && t !== "legal" && (
                <div>
                  <Label htmlFor="f-icon">Icon</Label>
                  <select id="f-icon" name="icon" defaultValue={page?.icon} className={inputCls}>
                    <option value="">Default</option>
                    {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2"><TextArea label="Summary" name="summary" defaultValue={page?.summary} rows={3} hint="intro under the heading and on cards" /></div>
            </div>
          </Card>
          <Card>
            <RichEditor name="body" label="Page content" defaultValue={page?.body} minHeight={380} />
          </Card>
          <Card title="SEO">
            <div className="space-y-4">
              <Field label="Meta title" name="meta_title" defaultValue={page?.meta_title} />
              <TextArea label="Meta description" name="meta_description" defaultValue={page?.meta_description} rows={2} />
            </div>
          </Card>
        </div>
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Visibility">
            <div className="space-y-4">
              <Toggle label="Published" name="published" defaultChecked={page ? !!page.published : true} />
              {t !== "page" && t !== "legal" && <Toggle label="Show in listings" name="show_in_listing" defaultChecked={page ? !!page.show_in_listing : true} hint="cards on the overview page" />}
              {t === "service" ? (
                <Toggle label="Has its own page" name="has_detail" defaultChecked={page ? !!page.has_detail : true} hint="off = card only, links to contact" />
              ) : (
                <input type="hidden" name="has_detail" value="1" />
              )}
              {t === "page" || t === "legal" ? <input type="hidden" name="show_in_listing" value="1" /> : null}
              <Field label="Sort order" name="sort" type="number" defaultValue={page?.sort ?? 0} />
              <SubmitButton className="w-full">{page ? "Save page" : "Create page"}</SubmitButton>
              {page && <a href={`${pagePath(page.path)}?preview=1`} target="_blank" className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"><ExternalLink className="size-4" />View page</a>}
            </div>
          </Card>
          <Card title="Images">
            <div className="space-y-5">
              <ImageField name="hero_image" label="Banner image" defaultValue={page?.hero_image} />
              <MultiImageField name="images" label="Extra images" defaultValue={page ? pageImages(page) : []} hint="shown under the content" />
            </div>
          </Card>
        </div>
      </ActionForm>
      {page && !core && (
        <form action={deletePage} className="mt-6">
          <input type="hidden" name="id" value={page.id} />
          <ConfirmButton message="Delete this page permanently?"><Trash2 className="size-4" />Delete page</ConfirmButton>
        </form>
      )}
    </>
  );
}
