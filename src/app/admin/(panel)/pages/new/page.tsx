import PageEditor from "@/components/admin/PageEditor";
import { PageHeader } from "@/components/admin/ui";

const LABELS: Record<string, string> = { page: "page", service: "service", industry: "industry page", location: "location page", legal: "legal page" };

export default async function NewPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type = "page" } = await searchParams;
  const t = LABELS[type] ? type : "page";
  return (
    <>
      <PageHeader title={`New ${LABELS[t]}`} back={`/admin/pages/?type=${t}`} />
      <PageEditor type={t} />
    </>
  );
}
