import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewMinistryPage() {
  return (
    <ResourceForm
      title="Add Ministry"
      endpoint="/api/admin/ministries"
      redirectTo="/admin/ministries"
      submitLabel="Create Ministry"
      fields={[{ name: "name", label: "Ministry Name", required: true }]}
    />
  );
}
