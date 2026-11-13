"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink, FileText, HelpCircle, Home, Images, Inbox, LayoutDashboard, LogOut, Menu, Newspaper, Settings, ImageIcon, Users, UserCog, Building2, X, Info,
} from "lucide-react";
import { logout } from "@/app/admin/actions";

const NAV = [
  { group: "Overview", items: [{ href: "/admin/", label: "Dashboard", Icon: LayoutDashboard, exact: true }, { href: "/admin/inbox/", label: "Inbox", Icon: Inbox, badge: true }] },
  {
    group: "Content",
    items: [
      { href: "/admin/homepage/", label: "Homepage", Icon: Home },
      { href: "/admin/pages/", label: "Pages & Services", Icon: FileText },
      { href: "/admin/posts/", label: "Blog Posts", Icon: Newspaper },
      { href: "/admin/team/", label: "Team", Icon: Users },
      { href: "/admin/about/", label: "About Content", Icon: Info },
      { href: "/admin/clients/", label: "Clients", Icon: Building2 },
      { href: "/admin/gallery/", label: "Gallery", Icon: Images },
      { href: "/admin/faqs/", label: "FAQs", Icon: HelpCircle },
      { href: "/admin/media/", label: "Media Library", Icon: ImageIcon },
    ],
  },
  { group: "System", items: [{ href: "/admin/settings/", label: "Site Settings", Icon: Settings }, { href: "/admin/users/", label: "Users & Account", Icon: UserCog }] },
];

export default function AdminShell({ children, user, unread }: { children: React.ReactNode; user: { name: string; email: string; role: string }; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="relative h-9 w-36"><Image src="/brand/logo-light.webp" alt="Four Stars" fill sizes="144px" className="object-contain object-left" /></div>
        <span className="ml-auto rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">CMS</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{g.group}</p>
            <ul className="mt-2 space-y-0.5">
              {g.items.map(({ href, label, Icon, ...rest }) => {
                const active = "exact" in rest && rest.exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link href={href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${active ? "bg-amber-500 text-zinc-950" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}>
                      <Icon className="size-4" />
                      {label}
                      {"badge" in rest && unread > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-zinc-950 text-white" : "bg-amber-500 text-zinc-950"}`}>{unread}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-white">{user.name}</p>
        <p className="truncate text-xs text-zinc-500">{user.email} · {user.role}</p>
        <div className="mt-3 flex gap-2">
          <a href="/" target="_blank" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/10 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"><ExternalLink className="size-3.5" />View site</a>
          <form action={logout} className="flex-1">
            <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"><LogOut className="size-3.5" />Sign out</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-zinc-950 lg:block">{sidebar}</aside>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <aside onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }} className={`absolute inset-y-0 left-0 w-72 bg-zinc-950 transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 z-10 grid size-8 place-items-center rounded text-zinc-400" aria-label="Close menu"><X className="size-5" /></button>
          {sidebar}
        </aside>
      </div>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-md border border-zinc-200" aria-label="Open menu"><Menu className="size-5" /></button>
          <span className="font-semibold">Four Stars CMS</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
