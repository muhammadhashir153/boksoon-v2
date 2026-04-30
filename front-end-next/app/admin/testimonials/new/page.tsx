import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewTestimonialPage() {
  return (
    <ResourceForm
      title="Add Testimonial"
      endpoint="/api/admin/testimonials"
      redirectTo="/admin/testimonials"
      submitLabel="Create Testimonial"
      fields={[
        { name: "reviewer_name", label: "Reviewer Name", required: true },
        { name: "review", label: "Review", type: "textarea", required: true }
      ]}
    />
  );
}
