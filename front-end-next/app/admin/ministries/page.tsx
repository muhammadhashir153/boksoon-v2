import { DeleteButton } from "@/components/admin/DeleteButton";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Ministry } from "@/lib/types";

export default async function AdminMinistriesPage() {
  const ministries = await fetchProtectedResource<Ministry[]>("admin/ministries").catch(() => []);

  return (
    <div className="card">
      <div className="card-body">
        <div className="admin-actions mb-3">
          <a href="/admin/ministries/new" className="btn btn-primary">Add Ministry</a>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th /></tr></thead>
            <tbody>
              {ministries.map((ministry) => (
                <tr key={ministry.id}>
                  <td>{ministry.name}</td>
                  <td>
                    <div className="admin-actions">
                      <a className="btn btn-primary btn-sm" href={`/admin/ministries/${ministry.id}`}>Edit</a>
                      <DeleteButton endpoint={`/api/admin/ministries/${ministry.id}`} />
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
