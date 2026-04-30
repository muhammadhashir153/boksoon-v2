import { ResourceForm } from "@/components/admin/ResourceForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Testimonial } from "@/lib/types";

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  const testimonial = await fetchProtectedResource<Testimonial>(`admin/testimonials/${params.id}`);

  return (
    <ResourceForm
      title="Edit Testimonial"
      endpoint={`/api/admin/testimonials/${params.id}`}
      method="PATCH"
      redirectTo="/admin/testimonials"
      submitLabel="Update Testimonial"
      fields={[
        { name: "reviewer_name", label: "Reviewer Name", required: true, defaultValue: testimonial.reviewer_name },
        { name: "review", label: "Review", type: "textarea", required: true, defaultValue: testimonial.review }
      ]}
    />
  );
}
