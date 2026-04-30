import { BlogEditorForm } from "@/components/admin/BlogEditorForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Blog, Ministry, User } from "@/lib/types";

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const [blog, ministries, user] = await Promise.all([
    fetchProtectedResource<Blog>(`admin/blogs/${params.id}`),
    fetchProtectedResource<Ministry[]>("admin/ministries").catch(() => []),
    fetchProtectedResource<User>("auth/me")
  ]);

  return (
    <BlogEditorForm
      mode="edit"
      title="Update Blog Post"
      endpoint={`/api/admin/blogs/${params.id}`}
      redirectTo="/admin/blogs"
      submitLabel="Update Blog"
      initialValues={{
        title: blog.title,
        ministry_id: blog.ministry_id,
        content: blog.content,
        is_published: blog.is_published
      }}
      ministries={ministries.map((ministry) => ({ value: ministry.id, label: ministry.name }))}
      userRole={user.role_name}
    />
  );
}
