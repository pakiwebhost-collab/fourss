import { Trash2 } from "lucide-react";
import type { TeamRow } from "@/lib/types";
import { all } from "@/lib/db";
import { saveTeam, deleteTeam } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, Field, inputCls, Label, SubmitButton, TextArea, Toggle } from "./Form";
import { ImageField } from "./MediaPicker";
import { Card } from "./ui";

export default function TeamEditor({ member, saved }: { member?: TeamRow; saved?: boolean }) {
  const depts = all<{ department: string }>("SELECT DISTINCT department FROM team ORDER BY department").map((d) => d.department);
  const maxSort = all<{ m: number }>("SELECT COALESCE(MAX(sort), 0) + 1 AS m FROM team")[0]?.m ?? 0;
  return (
    <>
      <ActionForm action={saveTeam} initialMessage={saved ? "Team member added." : undefined} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <input type="hidden" name="id" value={member?.id ?? 0} />
        <div className="space-y-6">
          <Card title="Profile">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Full name" name="name" defaultValue={member?.name} required placeholder="e.g. Maj Asif Khan (R)" /></div>
              <Field label="Position / title" name="position" defaultValue={member?.position} placeholder="e.g. Director Operations" />
              <div>
                <Label htmlFor="f-department" hint="groups members on the Team page">Department</Label>
                <input id="f-department" name="department" list="depts" defaultValue={member?.department ?? "Company Management"} className={inputCls} />
                <datalist id="depts">{depts.map((d) => <option key={d} value={d} />)}</datalist>
              </div>
              <div className="sm:col-span-2"><TextArea label="Biography" name="bio" defaultValue={member?.bio} rows={6} hint="shown in the profile popup" /></div>
            </div>
          </Card>
          <Card title="Contact details" description="Optional. Shown on the profile card.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" name="phone" defaultValue={member?.phone} placeholder="+92 3XX XXXXXXX" />
              <Field label="Email" name="email" type="email" defaultValue={member?.email} />
              <div className="sm:col-span-2"><Field label="LinkedIn URL" name="linkedin" type="url" defaultValue={member?.linkedin} placeholder="https://www.linkedin.com/in/…" /></div>
            </div>
          </Card>
        </div>
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Photo">
            <ImageField name="photo" defaultValue={member?.photo} hint="portrait works best" />
          </Card>
          <Card title="Visibility">
            <div className="space-y-4">
              <Toggle label="Published" name="published" defaultChecked={member ? !!member.published : true} />
              <Toggle label="Featured on About Us" name="featured" defaultChecked={!!member?.featured} />
              <Field label="Sort order" name="sort" type="number" defaultValue={member?.sort ?? maxSort} />
              <SubmitButton className="w-full">{member ? "Save member" : "Add member"}</SubmitButton>
            </div>
          </Card>
        </div>
      </ActionForm>
      {member && (
        <form action={deleteTeam} className="mt-6">
          <input type="hidden" name="id" value={member.id} />
          <ConfirmButton message={`Remove ${member.name} from the team?`}><Trash2 className="size-4" />Remove member</ConfirmButton>
        </form>
      )}
    </>
  );
}
