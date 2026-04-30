import { ResourceForm } from "@/components/admin/ResourceForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Donor } from "@/lib/types";

export default async function EditDonorPage({ params }: { params: { id: string } }) {
  const donor = await fetchProtectedResource<Donor>(`admin/donors/${params.id}`);

  return (
    <ResourceForm
      title="Edit Donor"
      endpoint={`/api/admin/donors/${params.id}`}
      method="PATCH"
      redirectTo="/admin/donors"
      submitLabel="Update Donor"
      fields={[
        { name: "name", label: "Name", required: true, defaultValue: donor.name },
        { name: "email", label: "Email", type: "email", required: true, defaultValue: donor.email },
        { name: "phone_number", label: "Phone Number", defaultValue: donor.phone_number || "" },
        { name: "address", label: "Address", type: "textarea", required: true, defaultValue: donor.address || "" },
        { name: "is_hidden", label: "Hide donor publicly", type: "checkbox", defaultValue: donor.is_hidden }
      ]}
    />
  );
}
