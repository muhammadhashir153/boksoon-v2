import { TrashActionButton } from "@/components/admin/TrashActionButton";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { money } from "@/lib/format";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Blog, Book, Donation, Transaction, User } from "@/lib/types";

function EmptyTrash({ label }: { label: string }) {
  return (
    <div className="empty-state">
      <strong>No {label.toLowerCase()} in trash</strong>
      <div>Once a record is moved to trash, it will appear here for restore or permanent deletion.</div>
    </div>
  );
}

export default async function AdminTrashPage() {
  const user = await fetchProtectedResource<User>("auth/me");
  const role = user.role_name === "reviewer" ? "reviwer" : user.role_name;
  const canPurge = role === "admin" || role === "manager";

  const [blogs, books, donations, transactions] = await Promise.all([
    fetchProtectedResource<Blog[]>("admin/blogs/trash").catch(() => []),
    fetchProtectedResource<Book[]>("admin/books/trash").catch(() => []),
    canPurge ? fetchProtectedResource<Donation[]>("admin/donations/trash").catch(() => []) : Promise.resolve([]),
    canPurge ? fetchProtectedResource<Transaction[]>("admin/transactions/trash").catch(() => []) : Promise.resolve([]),
  ]);

  const sections = [
    {
      title: "Blogs",
      visible: ["admin", "manager", "author"].includes(role),
      items: blogs,
      emptyLabel: "Blogs",
      render: (blog: Blog) => (
        <div className="card-body">
          <h4>{blog.title}</h4>
          <p className="mb-2">{blog.ministry_name || "No ministry assigned"}</p>
          <small className="text-muted d-block mb-3">Deleted <LocalizedDateText value={blog.deleted_at} variant="deletedAt" fallback="recently" /></small>
          <div className="admin-actions">
            <TrashActionButton endpoint={`/api/admin/blogs/${blog.id}/restore`} label="Restore" className="btn btn-sm btn-outline-primary" />
            {canPurge ? (
              <TrashActionButton endpoint={`/api/admin/blogs/${blog.id}/purge`} method="DELETE" label="Delete Forever" className="btn btn-sm btn-danger" confirmMessage="Permanently delete this blog from trash?" />
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: "Books",
      visible: ["admin", "manager", "reviwer"].includes(role),
      items: books,
      emptyLabel: "Books",
      render: (book: Book) => (
        <div className="card-body">
          <h4>{book.title}</h4>
          <p className="mb-2">{book.author_name || "Unknown author"}</p>
          <small className="text-muted d-block mb-3">Deleted <LocalizedDateText value={book.deleted_at} variant="deletedAt" fallback="recently" /></small>
          <div className="admin-actions">
            <TrashActionButton endpoint={`/api/admin/books/${book.id}/restore`} label="Restore" className="btn btn-sm btn-outline-primary" />
            {canPurge ? (
              <TrashActionButton endpoint={`/api/admin/books/${book.id}/purge`} method="DELETE" label="Delete Forever" className="btn btn-sm btn-danger" confirmMessage="Permanently delete this book from trash?" />
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: "Donations",
      visible: canPurge,
      items: donations,
      emptyLabel: "Donations",
      render: (donation: Donation) => (
        <div className="card-body">
          <h4>{donation.title}</h4>
          <p className="mb-2">Target {money(donation.target_amount)}</p>
          <small className="text-muted d-block mb-3">Deleted <LocalizedDateText value={donation.deleted_at} variant="deletedAt" fallback="recently" /></small>
          <div className="admin-actions">
            <TrashActionButton endpoint={`/api/admin/donations/${donation.id}/restore`} label="Restore" className="btn btn-sm btn-outline-primary" />
            <TrashActionButton endpoint={`/api/admin/donations/${donation.id}/purge`} method="DELETE" label="Delete Forever" className="btn btn-sm btn-danger" confirmMessage="Permanently delete this donation from trash?" />
          </div>
        </div>
      ),
    },
    {
      title: "Transactions",
      visible: canPurge,
      items: transactions,
      emptyLabel: "Transactions",
      render: (transaction: Transaction) => (
        <div className="card-body">
          <h4>{transaction.donor_name || transaction.donor_email || "Transaction"}</h4>
          <p className="mb-2">{transaction.donation_title || "No campaign"} - {money(transaction.amount, transaction.currency || "USD")}</p>
          <small className="text-muted d-block mb-3">Deleted <LocalizedDateText value={transaction.deleted_at} variant="deletedAt" fallback="recently" /></small>
          <div className="admin-actions">
            <TrashActionButton endpoint={`/api/admin/transactions/${transaction.id}/restore`} label="Restore" className="btn btn-sm btn-outline-primary" />
            <TrashActionButton endpoint={`/api/admin/transactions/${transaction.id}/purge`} method="DELETE" label="Delete Forever" className="btn btn-sm btn-danger" confirmMessage="Permanently delete this transaction from trash?" />
          </div>
        </div>
      ),
    },
  ].filter((section) => section.visible);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Trash</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Trash</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <div className="page-toolbar-copy">
          <h2>Trash Review</h2>
          <p>{canPurge ? "Restore records that were deleted by mistake, or permanently remove them when you are sure." : "Review your trashed work and restore it whenever you need."}</p>
        </div>
      </div>

      {sections.map((section) => (
        <div className="card mb-4" key={section.title}>
          <div className="card-header">
            <h3>{section.title}</h3>
          </div>
          <div className="card-body">
            {!section.items.length ? (
              <EmptyTrash label={section.emptyLabel} />
            ) : (
              <div className="row donation-grid">
                {section.items.map((item) => (
                  <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                    <div className="donation-item h-100">{section.render(item as never)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
