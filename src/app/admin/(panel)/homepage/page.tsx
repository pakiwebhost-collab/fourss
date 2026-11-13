import { getHome } from "@/lib/content";
import { homeSchema } from "@/components/admin/schemas";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { PageHeader } from "@/components/admin/ui";

export default function HomepageAdmin() {
  return (
    <>
      <PageHeader title="Homepage" description="Edit every section of the homepage. Industries, locations, clients and blog posts update automatically from their own sections." />
      <SettingsEditor settingKey="home" schema={homeSchema} value={getHome() as unknown as Record<string, unknown>} viewHref="/" />
    </>
  );
}
