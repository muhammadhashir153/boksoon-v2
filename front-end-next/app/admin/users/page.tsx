import { DeleteButton } from "@/components/admin/DeleteButton";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { User } from "@/lib/types";

export default async function AdminUsersPage() {
  const users = await fetchProtectedResource<User[]>("admin/users").catch(() => []);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Users</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="page-toolbar">
        <div className="page-toolbar-copy">
          <h2>Staff Directory</h2>
          <p>Manage access, ministry assignments, and password resets from a single control surface.</p>
        </div>
        <div className="page-toolbar-actions">
          <a href="/admin/users/new" className="btn btn-primary">Create Staff Member</a>
          <a href="/admin/ministries" className="btn btn-outline-secondary">Manage Ministries</a>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-header">
              <h3>All Staff</h3>
              <p className="section-copy mb-0">Use quick actions for details, password resets, and access cleanup.</p>
            </div>
            <div className="card-body">
              <div className="dt-responsive table-responsive" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                <table id="order-table" className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Ministry</th>
                      <th>Email Verified</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody id="users">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role_name}</td>
                        <td>{user.ministry || "-"}</td>
                        <td>{!user.is_verified ? "No" : "Yes"}</td>
                        <td>
                          <div className="admin-actions">
                            <a className="btn btn-primary btn-sm" href={`/admin/users/${user.id}`}>Edit</a>
                            <a className="btn btn-outline-secondary btn-sm" href={`/admin/users/update-pass?uid=${encodeURIComponent(user.id)}`}>Reset Password</a>
                            <DeleteButton endpoint={`/api/admin/users/${user.id}`} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Ministry</th>
                      <th>Email Verified</th>
                      <th>Action</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
