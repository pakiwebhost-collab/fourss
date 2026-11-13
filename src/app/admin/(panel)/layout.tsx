import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { get } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Four Stars CMS", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = get<{ n: number }>("SELECT COUNT(*) AS n FROM submissions WHERE is_read = 0")?.n ?? 0;
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} unread={unread}>
      {children}
    </AdminShell>
  );
}
