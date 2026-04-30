import { BlogDetailsView } from "@/components/public/BlogDetailsView";

export default async function BlogSlugPage({ params }: { params: { slug: string } }) {
  return <BlogDetailsView slug={params.slug} />;
}
