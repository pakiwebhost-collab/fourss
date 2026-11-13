import PostEditor from "@/components/admin/PostEditor";
import { PageHeader } from "@/components/admin/ui";

export default function NewPost() {
  return (
    <>
      <PageHeader title="New post" back="/admin/posts/" />
      <PostEditor />
    </>
  );
}
