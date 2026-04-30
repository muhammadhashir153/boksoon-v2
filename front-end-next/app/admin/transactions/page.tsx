import { DeleteButton } from "@/components/admin/DeleteButton";
import { money } from "@/lib/format";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Transaction } from "@/lib/types";

export default async function AdminTransactionsPage() {
  const transactions = await fetchProtectedResource<Transaction[]>("admin/transactions").catch(() => []);

  return (
    <div className="card">
      <div className="card-body">
        <div className="admin-actions mb-3">
          <a href="/admin/transactions/new" className="btn btn-primary">Add Transaction</a>
          <a href="/admin/trash" className="btn btn-outline-secondary">Open Trash</a>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Donor</th><th>Donation</th><th>Amount</th><th>Status</th><th /></tr></thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.donor_name || transaction.donor_email || "-"}</td>
                  <td>{transaction.donation_title || "-"}</td>
                  <td>{money(transaction.amount, transaction.currency || "USD")}</td>
                  <td>{transaction.status}</td>
                  <td>
                    <div className="admin-actions">
                      <a className="btn btn-primary btn-sm" href={`/admin/transactions/${transaction.id}`}>Edit</a>
                      <DeleteButton
                        endpoint={`/api/admin/transactions/${transaction.id}`}
                        confirmMessage="Move this transaction to trash?"
                        confirmTitle="Move Transaction to Trash"
                        failureMessage="Could not move this transaction to trash."
                      >
                        Move to Trash
                      </DeleteButton>
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
