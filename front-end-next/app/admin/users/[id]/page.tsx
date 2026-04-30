import { LegacyUserForm } from "@/components/admin/LegacyUserForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Ministry, Role, User } from "@/lib/types";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const [user, roles, ministries] = await Promise.all([
    fetchProtectedResource<User>(`admin/users/${params.id}`),
    fetchProtectedResource<Role[]>("admin/roles").catch(() => []),
    fetchProtectedResource<Ministry[]>("admin/ministries").catch(() => [])
  ]);

  return (
    <LegacyUserForm
      mode="edit"
      endpoint={`/api/admin/users/${params.id}`}
      redirectTo="/admin/users"
      roleOptions={roles.map((role) => ({ value: role.id, label: role.name }))}
      ministryOptions={ministries.map((ministry) => ({ value: ministry.id, label: ministry.name }))}
      initialValues={{
        name: user.name,
        email: user.email,
        role_id: user.role || "",
        ministry_id: user.ministry_id || ""
      }}
    />
  );
}
