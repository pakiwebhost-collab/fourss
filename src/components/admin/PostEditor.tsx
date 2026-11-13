import { ExternalLink, Trash2 } from "lucide-react";
import type { PostRow } from "@/lib/types";
import { savePost, deletePost } from "@/app/admin/actions";
import { all } from "@/lib/db";
import { ActionForm, ConfirmButton, Field, inputCls, Label, SubmitButton, TextArea, Toggle } from "./Form";
import { ImageField } from "./MediaPicker";
import RichEditor from "./RichEditor";
import { Card } from "./ui";

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PostEditor({ post, saved }: { post?: PostRow; saved?: boolean }) {
  const cats = all<{ category: string }>("SELECT DISTINCT category FROM posts ORDER BY category").map((c) => c.category);
  return (
    <>
      <ActionForm action={savePost} initialMessage={saved ? "Post created." : undefined} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <input type="hidden" name="id" value={post?.id ?? 0} />
        <div className="min-w-0 space-y-6">
          <Card>
            <div className="space-y-5">
              <Field label="Title" name="title" defaultValue={post?.title} required placeholder="e.g. How to choose a security company in Karachi" />
              <Field label="URL slug" name="slug" defaultValue={post?.slug} hint="leave blank to generate from title" placeholder="how-to-choose-a-security-company" />
              <TextArea label="Excerpt" name="excerpt" defaultValue={post?.excerpt} rows={3} hint="shown on blog cards and as intro" />
              <RichEditor name="body" label="Content" defaultValue={post?.body} minHeight={420} />
            </div>
          </Card>
          <Card title="SEO" description="Optional. Falls back to the title and excerpt.">
            <div className="space-y-4">
              <Field label="Meta title" name="meta_title" defaultValue={post?.meta_title} maxLength={200} />
              <TextArea label="Meta description" name="meta_description" defaultValue={post?.meta_description} rows={2} maxLength={400} />
            </div>
          </Card>
        </div>
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Publish">
            <div className="space-y-4">
              <div>
                <Label htmlFor="f-status">Status</Label>
                <select id="f-status" name="status" defaultValue={post?.status ?? "draft"} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Field label="Publish date" name="published_at" type="datetime-local" defaultValue={toLocalInput(post?.published_at ?? null)} hint="future = scheduled" />
              <Toggle label="Featured post" name="featured" defaultChecked={!!post?.featured} hint="Highlighted at the top of the blog" />
              <SubmitButton className="w-full">{post ? "Save post" : "Create post"}</SubmitButton>
              {post && (
                <a href={`/${post.slug}/?preview=1`} target="_blank" className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"><ExternalLink className="size-4" />Preview</a>
              )}
            </div>
          </Card>
          <Card title="Details">
            <div className="space-y-4">
              <div>
                <Label htmlFor="f-category">Category</Label>
                <input id="f-category" name="category" list="cats" defaultValue={post?.category ?? "Security Guides"} className={inputCls} />
                <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <Field label="Tags" name="tags" defaultValue={post?.tags} hint="comma separated" />
              <Field label="Author" name="author" defaultValue={post?.author ?? "Four Stars Security"} />
              <ImageField name="cover" label="Cover image" defaultValue={post?.cover} />
            </div>
          </Card>
        </div>
      </ActionForm>
      {post && (
        <form action={deletePost} className="mt-6">
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message="Delete this post permanently?"><Trash2 className="size-4" />Delete post</ConfirmButton>
        </form>
      )}
    </>
  );
}
