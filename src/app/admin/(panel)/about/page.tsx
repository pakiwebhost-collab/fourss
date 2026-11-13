import Link from "next/link";
import { getAbout } from "@/lib/content";
import { get } from "@/lib/db";
import { aboutSchema } from "@/components/admin/schemas";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { PageHeader } from "@/components/admin/ui";

export default function AboutAdmin() {
  const page = get<{ id: number }>("SELECT id FROM pages WHERE template = 'about'");
  return (
    <>
      <PageHeader
        title="About content"
        description="Vision, mission and highlights on the About Us page."
        actions={page ? <Link href={`/admin/pages/${page.id}/`} className="text-sm font-medium text-amber-700 hover:underline">Edit About page text & images →</Link> : undefined}
      />
      <SettingsEditor settingKey="about" schema={aboutSchema} value={getAbout() as unknown as Record<string, unknown>} viewHref="/about-us/" />
    </>
  );
}
