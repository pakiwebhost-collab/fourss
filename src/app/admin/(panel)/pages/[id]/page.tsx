import { notFound } from "next/navigation";
import { get } from "@/lib/db";
import type { PageRow } from "@/lib/types";
import { pagePath } from "@/lib/util";
import PageEditor from "@/components/admin/PageEditor";
import { PageHeader } from "@/components/admin/ui";

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const page = get<PageRow>("SELECT * FROM pages WHERE id = ?", Number(id));
  if (!page) notFound();
  return (
    <>
      <PageHeader title={`Edit: ${page.title}`} description={pagePath(page.path)} back={`/admin/pages/?type=${page.type}`} />
      <PageEditor page={page} saved={!!saved} error={error} />
    </>
  );
}
