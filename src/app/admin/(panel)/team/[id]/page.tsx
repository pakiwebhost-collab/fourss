import { notFound } from "next/navigation";
import { get } from "@/lib/db";
import type { TeamRow } from "@/lib/types";
import TeamEditor from "@/components/admin/TeamEditor";
import { PageHeader } from "@/components/admin/ui";

export default async function EditMember({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const member = get<TeamRow>("SELECT * FROM team WHERE id = ?", Number(id));
  if (!member) notFound();
  return (
    <>
      <PageHeader title={member.name} description="Edit team member" back="/admin/team/" />
      <TeamEditor member={member} saved={!!saved} />
    </>
  );
}
