import { ResourceForm } from "@/components/admin/ResourceForm";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Donation, Donor, Transaction } from "@/lib/types";

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
  const [transaction, donors, donations] = await Promise.all([
    fetchProtectedResource<Transaction>(`admin/transactions/${params.id}`),
    fetchProtectedResource<Donor[]>("admin/donors").catch(() => []),
    fetchProtectedResource<Donation[]>("admin/donations").catch(() => [])
  ]);

  return (
    <ResourceForm
      title="Edit Transaction"
      endpoint={`/api/admin/transactions/${params.id}`}
      method="PATCH"
      redirectTo="/admin/transactions"
      submitLabel="Update Transaction"
      fields={[
        {
          name: "donation_id",
          label: "Donation",
          type: "select",
          required: true,
          defaultValue: transaction.donation_id || "",
          options: donations.map((donation) => ({ value: donation.id, label: donation.title }))
        },
        {
          name: "donor_id",
          label: "Existing Donor",
          type: "select",
          defaultValue: transaction.donor_id || "",
          options: donors.map((donor) => ({ value: donor.id, label: `${donor.name} (${donor.email})` }))
        },
        { name: "amount", label: "Amount", type: "number", required: true, defaultValue: transaction.amount },
        { name: "payment_method", label: "Payment Method", defaultValue: transaction.payment_method || "" },
        { name: "currency", label: "Currency", defaultValue: transaction.currency || "USD" },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          defaultValue: transaction.status || "completed",
          options: [
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "cancelled", label: "Cancelled" },
            { value: "refunded", label: "Refunded" }
          ]
        }
      ]}
    />
  );
}
