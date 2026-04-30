import { LegacyPasswordResetForm } from "@/components/admin/LegacyPasswordResetForm";
import { redirect } from "next/navigation";

export default function UpdateUserPasswordPage({
  searchParams
}: {
  searchParams: { uid?: string };
}) {
  const userId = searchParams.uid;
  if (!userId) {
    redirect("/admin/users");
  }

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Add User</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item"><a href="/admin/users">Users</a></li>
                <li className="breadcrumb-item" aria-current="page">Update Password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LegacyPasswordResetForm userId={userId} />
    </>
  );
}
