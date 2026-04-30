import { blogDetailsPath } from "@/lib/routes";
import { redirect } from "next/navigation";

export default async function BlogDetailsSlugPage({ params }: { params: { slug: string } }) {
  redirect(blogDetailsPath(params.slug));
}
