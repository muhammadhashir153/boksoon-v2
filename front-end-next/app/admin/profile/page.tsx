import { fetchProtectedResource } from "@/lib/server/laravel";
import { ProfileForms } from "@/components/admin/ProfileForms";
import { User } from "@/lib/types";

export default async function AdminProfilePage() {
  const user = await fetchProtectedResource<User>("auth/me");

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h3 className="mb-4">Profile</h3>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="detail-list-item h-100">
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-list-item h-100">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-list-item h-100">
                <span>Role</span>
                <strong>{user.role_name}</strong>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-list-item h-100">
                <span>Ministry</span>
                <strong>{user.ministry || "-"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProfileForms user={user} />
    </>
  );
}
