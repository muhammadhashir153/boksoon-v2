import { BlogDetailsView } from "@/components/public/BlogDetailsView";
import { blogDetailsPath } from "@/lib/routes";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Blog } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function BlogDetailsPage({ searchParams }: { searchParams: { id?: string; slug?: string } }) {
  const id = searchParams.id;
  const slug = searchParams.slug;

  if (slug) {
    redirect(blogDetailsPath(slug));
  }

  if (id) {
    const blog = await fetchPublicResource<Blog>(`blogs/${id}`).catch(() => null);
    if (blog) {
      redirect(blogDetailsPath(blog));
    }
  }

  redirect("/blogs");
}
