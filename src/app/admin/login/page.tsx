import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in | Four Stars CMS", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentUser()) redirect("/admin/");
  const { next = "/admin/" } = await searchParams;
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:block">
        <Image src="/images/site/1-4.webp" alt="" fill sizes="50vw" className="object-cover opacity-40" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-400">Content Management</p>
          <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-none">Four Stars Security</h1>
          <p className="mt-3 max-w-md text-white/70">Manage pages, blog posts, team members, gallery and enquiries for 4ssecurity.pk.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-zinc-50 p-6">
        <div className="w-full max-w-sm">
          <div className="relative mb-8 h-14 w-56"><Image src="/brand/logo-dark.webp" alt="Four Stars Security" fill sizes="224px" className="object-contain object-left" /></div>
          <h2 className="text-2xl font-semibold text-zinc-900">Sign in</h2>
          <p className="mt-1 text-sm text-zinc-500">Use your admin account to continue.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
