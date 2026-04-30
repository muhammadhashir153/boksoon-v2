import { LegacyDonationForm } from "@/components/admin/LegacyDonationForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Donation } from "@/lib/types";

export default async function EditDonationPage({ params }: { params: { id: string } }) {
  const donation = await fetchProtectedResource<Donation>(`admin/donations/${params.id}`);

  return (
    <LegacyDonationForm
      mode="edit"
      endpoint={`/api/admin/donations/${params.id}`}
      redirectTo="/admin/donations"
      initialValues={{
        title: donation.title,
        description: donation.description,
        start_date: donation.start_date,
        end_date: donation.end_date,
        target_amount: donation.target_amount,
        placeholder_url: donation.placeholder_url
      }}
    />
  );
}
