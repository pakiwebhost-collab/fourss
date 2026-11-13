import { Trash2, UserPlus } from "lucide-react";
import { all } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/util";
import { changePassword, createUser, deleteUser, saveProfile } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, Field, inputCls, Label, SubmitButton } from "@/components/admin/Form";
import { Badge, Card, Notice, PageHeader } from "@/components/admin/ui";

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const me = await requireUser();
  const { error, deleted } = await searchParams;
  const users = all<{ id: number; name: string; email: string; role: string; created_at: string }>("SELECT id, name, email, role, created_at FROM users ORDER BY id");
  const isAdmin = me.role === "admin";
  return (
    <>
      <PageHeader title="Users & account" description="Admins can manage everything including users. Editors can manage content." />
      {error === "self" && <Notice tone="red">You can’t delete your own account.</Notice>}
      {error === "last" && <Notice tone="red">You can’t delete the last administrator.</Notice>}
      {deleted && <Notice>User deleted.</Notice>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Your profile">
          <ActionForm action={saveProfile} className="space-y-4">
            <Field label="Name" name="name" defaultValue={me.name} required />
            <Field label="Email" name="email_ro" defaultValue={me.email} disabled />
            <SubmitButton>Save profile</SubmitButton>
          </ActionForm>
        </Card>
        <Card title="Change password">
          <ActionForm action={changePassword} resetOnSuccess className="space-y-4">
            <Field label="Current password" name="current" type="password" autoComplete="current-password" required />
            <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={10} required hint="at least 10 characters" />
            <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
            <SubmitButton>Update password</SubmitButton>
          </ActionForm>
        </Card>
      </div>

      <Card title="All users" className="mt-6">
        <ul className="-my-2 divide-y divide-zinc-100">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{u.name} {u.id === me.id && <span className="text-zinc-400">(you)</span>}</p>
                <p className="text-xs text-zinc-500">{u.email} · added {formatDate(u.created_at)}</p>
              </div>
              <Badge tone={u.role === "admin" ? "amber" : "zinc"}>{u.role}</Badge>
              {isAdmin && u.id !== me.id && (
                <form action={deleteUser}><input type="hidden" name="id" value={u.id} /><ConfirmButton message={`Delete ${u.email}?`} className="grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></ConfirmButton></form>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {isAdmin && (
        <Card title="Add a user" className="mt-6">
          <ActionForm action={createUser} resetOnSuccess className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Temporary password" name="password" type="password" minLength={10} required hint="share it securely; they can change it" autoComplete="new-password" />
            <div>
              <Label htmlFor="f-role">Role</Label>
              <select id="f-role" name="role" className={inputCls} defaultValue="editor"><option value="editor">Editor (content only)</option><option value="admin">Administrator</option></select>
            </div>
            <div className="sm:col-span-2"><SubmitButton><UserPlus className="size-4" />Create user</SubmitButton></div>
          </ActionForm>
        </Card>
      )}
    </>
  );
}
