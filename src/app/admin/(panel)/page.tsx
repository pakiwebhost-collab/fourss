import Link from "next/link";
import { FileText, Inbox, Mail, Newspaper, Plus, Users, UserPlus } from "lucide-react";
import { all, get } from "@/lib/db";
import { mailConfigured } from "@/lib/mail";
import { formatDate } from "@/lib/util";
import type { PostRow, SubmissionRow } from "@/lib/types";
import { Badge, Card, Notice, PageHeader, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { currentUser } from "@/lib/auth";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const user = await currentUser();
  const count = (sql: string) => get<{ n: number }>(sql)?.n ?? 0;
  const stats = [
    { label: "Unread messages", value: count("SELECT COUNT(*) n FROM submissions WHERE is_read = 0"), Icon: Inbox, href: "/admin/inbox/" },
    { label: "Published posts", value: count("SELECT COUNT(*) n FROM posts WHERE status = 'published'"), Icon: Newspaper, href: "/admin/posts/" },
    { label: "Pages", value: count("SELECT COUNT(*) n FROM pages"), Icon: FileText, href: "/admin/pages/" },
    { label: "Team members", value: count("SELECT COUNT(*) n FROM team"), Icon: Users, href: "/admin/team/" },
    { label: "Subscribers", value: count("SELECT COUNT(*) n FROM subscribers"), Icon: Mail, href: "/admin/inbox/?tab=subscribers" },
  ];
  const messages = all<SubmissionRow>("SELECT * FROM submissions ORDER BY id DESC LIMIT 6");
  const posts = all<PostRow>("SELECT * FROM posts ORDER BY updated_at DESC LIMIT 5");

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0] ?? ""}`}
        description="Manage everything on 4ssecurity.pk from here."
        actions={<>
          <Link href="/admin/posts/new/" className={btnPrimary}><Plus className="size-4" />New post</Link>
          <Link href="/admin/team/new/" className={btnSecondary}><UserPlus className="size-4" />Add team member</Link>
        </>}
      />
      {error === "forbidden" && <Notice tone="red">That section is only available to administrators.</Notice>}
      {!mailConfigured() && (
        <Notice tone="amber">Email notifications are off: SMTP is not configured. Form submissions are still saved in the Inbox. Add SMTP settings to the server environment to receive them by email.</Notice>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, Icon, href }) => (
          <Link key={label} href={href} className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-amber-400">
            <Icon className="size-5 text-amber-600" />
            <p className="mt-3 text-3xl font-semibold">{value}</p>
            <p className="text-sm text-zinc-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Latest enquiries">
          {messages.length ? (
            <ul className="-my-2 divide-y divide-zinc-100">
              {messages.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/inbox/${m.id}/`} className="flex items-start gap-3 py-3 hover:bg-zinc-50">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${m.is_read ? "bg-zinc-200" : "bg-amber-500"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">{m.name} <Badge tone={m.kind === "quote" ? "blue" : "zinc"}>{m.kind}</Badge></p>
                      <p className="truncate text-sm text-zinc-500">{m.subject || m.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-400">{formatDate(m.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-zinc-500">No messages yet.</p>}
          <Link href="/admin/inbox/" className="mt-4 inline-block text-sm font-medium text-amber-700 hover:underline">Open inbox →</Link>
        </Card>
        <Card title="Recently edited posts">
          <ul className="-my-2 divide-y divide-zinc-100">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/posts/${p.id}/`} className="flex items-center gap-3 py-3 hover:bg-zinc-50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-zinc-400">{p.category} · updated {formatDate(p.updated_at)}</p>
                  </div>
                  <Badge tone={p.status === "published" ? "green" : "amber"}>{p.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/admin/posts/" className="mt-4 inline-block text-sm font-medium text-amber-700 hover:underline">All posts →</Link>
        </Card>
      </div>
    </>
  );
}
