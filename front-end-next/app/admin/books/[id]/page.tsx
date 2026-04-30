import { LegacyBookForm } from "@/components/admin/LegacyBookForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Book } from "@/lib/types";

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const book = await fetchProtectedResource<Book>(`admin/books/${params.id}`);

  return (
    <LegacyBookForm
      mode="edit"
      endpoint={`/api/admin/books/${params.id}`}
      redirectTo="/admin/books"
      initialValues={{
        title: book.title,
        description: book.description,
        link_url: book.link_url,
        link_label: book.link_label,
        author_name: book.author_name,
        language: book.language,
        sort_order: book.sort_order,
        is_published: book.is_published,
        cover_image_url: book.cover_image_url
      }}
    />
  );
}
