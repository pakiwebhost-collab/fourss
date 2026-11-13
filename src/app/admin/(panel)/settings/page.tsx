import { getSite } from "@/lib/content";
import { mailConfigured } from "@/lib/mail";
import { siteSchema } from "@/components/admin/schemas";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { Notice, PageHeader } from "@/components/admin/ui";

export default function SettingsAdmin() {
  return (
    <>
      <PageHeader title="Site settings" description="Contact details, offices, WhatsApp, social links and default SEO used across the whole site." />
      <Notice tone={mailConfigured() ? "green" : "amber"}>
        {mailConfigured()
          ? "Email delivery is configured. New enquiries are emailed to the notification address below."
          : "Email delivery is not configured yet (SMTP settings on the server). Enquiries are still saved in the Inbox."}
      </Notice>
      <SettingsEditor settingKey="site" schema={siteSchema} value={getSite() as unknown as Record<string, unknown>} />
    </>
  );
}
