import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewDonorPage() {
  return (
    <ResourceForm
      title="Add Donor"
      endpoint="/api/admin/donors"
      redirectTo="/admin/donors"
      submitLabel="Create Donor"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone_number", label: "Phone Number" },
        { name: "address", label: "Address", type: "textarea", required: true },
        { name: "is_hidden", label: "Hide donor publicly", type: "checkbox" }
      ]}
    />
  );
}
