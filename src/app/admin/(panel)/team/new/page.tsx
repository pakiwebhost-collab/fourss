import TeamEditor from "@/components/admin/TeamEditor";
import { PageHeader } from "@/components/admin/ui";

export default function NewMember() {
  return (
    <>
      <PageHeader title="Add team member" back="/admin/team/" />
      <TeamEditor />
    </>
  );
}
