import { DeleteButton } from "@/components/admin/DeleteButton";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Testimonial } from "@/lib/types";

export default async function AdminTestimonialsPage() {
  const testimonials = await fetchProtectedResource<Testimonial[]>("admin/testimonials").catch(() => []);

  return (
    <div className="card">
      <div className="card-body">
        <div className="admin-actions mb-3">
          <a href="/admin/testimonials/new" className="btn btn-primary">Add Testimonial</a>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Review</th><th>Created</th><th>Updated</th><th /></tr></thead>
            <tbody>
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td>{testimonial.reviewer_name}</td>
                  <td>{testimonial.review}</td>
                  <td><LocalizedDateText value={testimonial.created_at} variant="dateTime" fallback="-" /></td>
                  <td><LocalizedDateText value={testimonial.updated_at} variant="dateTime" fallback="-" /></td>
                  <td>
                    <div className="admin-actions">
                      <a className="btn btn-primary btn-sm" href={`/admin/testimonials/${testimonial.id}`}>Edit</a>
                      <DeleteButton endpoint={`/api/admin/testimonials/${testimonial.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
