import { ResourceForm } from "@/components/admin/ResourceForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Ministry } from "@/lib/types";

export default async function EditMinistryPage({ params }: { params: { id: string } }) {
  const ministry = await fetchProtectedResource<Ministry>(`admin/ministries/${params.id}`);

  return (
    <ResourceForm
      title="Edit Ministry"
      endpoint={`/api/admin/ministries/${params.id}`}
      method="PATCH"
      redirectTo="/admin/ministries"
      submitLabel="Update Ministry"
      fields={[{ name: "name", label: "Ministry Name", required: true, defaultValue: ministry.name }]}
    />
  );
}
