import { notFound } from "next/navigation";
import { get } from "@/lib/db";
import type { PostRow } from "@/lib/types";
import PostEditor from "@/components/admin/PostEditor";
import { PageHeader } from "@/components/admin/ui";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const post = get<PostRow>("SELECT * FROM posts WHERE id = ?", Number(id));
  if (!post) notFound();
  return (
    <>
      <PageHeader title="Edit post" description={`/${post.slug}/`} back="/admin/posts/" />
      <PostEditor post={post} saved={!!saved} />
    </>
  );
}
