import { ResourceForm } from "@/components/admin/ResourceForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Donation, Donor } from "@/lib/types";

export default async function NewTransactionPage() {
  const [donors, donations] = await Promise.all([
    fetchProtectedResource<Donor[]>("admin/donors").catch(() => []),
    fetchProtectedResource<Donation[]>("admin/donations").catch(() => [])
  ]);

  return (
    <ResourceForm
      title="Add Transaction"
      endpoint="/api/admin/transactions"
      redirectTo="/admin/transactions"
      submitLabel="Create Transaction"
      fields={[
        {
          name: "donation_id",
          label: "Donation",
          type: "select",
          required: true,
          options: donations.map((donation) => ({ value: donation.id, label: donation.title }))
        },
        {
          name: "donor_id",
          label: "Existing Donor",
          type: "select",
          options: donors.map((donor) => ({ value: donor.id, label: `${donor.name} (${donor.email})` }))
        },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "payment_method", label: "Payment Method", defaultValue: "manual" },
        { name: "currency", label: "Currency", defaultValue: "USD" },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          defaultValue: "completed",
          options: [
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "cancelled", label: "Cancelled" },
            { value: "refunded", label: "Refunded" }
          ]
        },
        { name: "name", label: "Donor Name" },
        { name: "email", label: "Donor Email", type: "email" },
        { name: "phone_number", label: "Phone Number" },
        { name: "address", label: "Address", type: "textarea" }
      ]}
    />
  );
}
