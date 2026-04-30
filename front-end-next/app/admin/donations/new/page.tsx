import { LegacyDonationForm } from "@/components/admin/LegacyDonationForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { User } from "@/lib/types";

export default async function NewDonationPage() {
  const user = await fetchProtectedResource<User>("auth/me");

  return (
    <LegacyDonationForm
      mode="create"
      endpoint="/api/admin/donations"
      redirectTo="/admin/donations"
      adminId={user.id}
    />
  );
}
