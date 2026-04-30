import { BlogEditorForm } from "@/components/admin/BlogEditorForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Ministry, User } from "@/lib/types";

export default async function NewBlogPage() {
  const [ministries, user] = await Promise.all([
    fetchProtectedResource<Ministry[]>("admin/ministries").catch(() => []),
    fetchProtectedResource<User>("auth/me")
  ]);

  return (
    <BlogEditorForm
      mode="create"
      title="Publish Story"
      endpoint="/api/admin/blogs"
      redirectTo="/admin/blogs"
      submitLabel="Create Blog"
      initialValues={{ is_published: true }}
      ministries={ministries.map((ministry) => ({ value: ministry.id, label: ministry.name }))}
      userRole={user.role_name}
    />
  );
}
