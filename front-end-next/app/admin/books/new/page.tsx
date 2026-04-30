import { LegacyBookForm } from "@/components/admin/LegacyBookForm";

export default function NewBookPage() {
  return (
    <LegacyBookForm
      mode="create"
      endpoint="/api/admin/books"
      redirectTo="/admin/books"
    />
  );
}
