import { LegacyUserForm } from "@/components/admin/LegacyUserForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Ministry, Role } from "@/lib/types";

export default async function NewUserPage() {
  const [roles, ministries] = await Promise.all([
    fetchProtectedResource<Role[]>("admin/roles").catch(() => []),
    fetchProtectedResource<Ministry[]>("admin/ministries").catch(() => [])
  ]);

  return (
    <LegacyUserForm
      mode="create"
      endpoint="/api/admin/users"
      redirectTo="/admin/users"
      roleOptions={roles.map((role) => ({ value: role.id, label: role.name }))}
      ministryOptions={ministries.map((ministry) => ({ value: ministry.id, label: ministry.name }))}
    />
  );
}
