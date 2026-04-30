import { DeleteButton } from "@/components/admin/DeleteButton";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Donor } from "@/lib/types";

export default async function AdminDonorsPage() {
  const donors = await fetchProtectedResource<Donor[]>("admin/donors").catch(() => []);

  return (
    <div className="card">
      <div className="card-body">
        <div className="admin-actions mb-3">
          <a href="/admin/donors/new" className="btn btn-primary">Add Donor</a>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th /></tr></thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.name}</td>
                  <td>{donor.email}</td>
                  <td>{donor.phone_number || "-"}</td>
                  <td>
                    <div className="admin-actions">
                      <a className="btn btn-primary btn-sm" href={`/admin/donors/${donor.id}`}>Edit</a>
                      <DeleteButton endpoint={`/api/admin/donors/${donor.id}`} />
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
