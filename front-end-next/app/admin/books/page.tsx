import { DeleteButton } from "@/components/admin/DeleteButton";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Book } from "@/lib/types";

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function AdminBooksPage() {
  const books = await fetchProtectedResource<Book[]>("admin/books").catch(() => []);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Books</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Books</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="page-toolbar">
        <div className="page-toolbar-copy">
          <h2>Book Library</h2>
          <p>Manage the public books page from one place, including links, images, language, and publishing state.</p>
        </div>
        <div className="page-toolbar-actions">
          <a href="/admin/books/new" className="btn btn-primary">Add Book</a>
          <a href="/admin/trash" className="btn btn-outline-secondary">Open Trash</a>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-header">
              <h3>All Books</h3>
              <p className="section-copy mb-0">Each card reflects what can appear on the public books page.</p>
            </div>
            <div className="card-body">
              <div className="row donation-grid" id="books-admin-list">
                {!books.length ? (
                  <div className="empty-state">
                    <strong>No books found</strong>
                    <div>Add a book to populate the public books page.</div>
                  </div>
                ) : books.map((book) => {
                  const previewText = stripHtml(book.description || "").slice(0, 220);
                  const statusClass = book.is_deleted ? "bg-danger" : (book.is_published ? "bg-success" : "bg-secondary");
                  const statusLabel = book.is_deleted ? "Deleted" : (book.is_published ? "Published" : "Draft");
                  return (
                    <div className="col-12 col-md-6 col-xl-4" key={book.id}>
                      <div className="donation-item h-100">
                        <div className="donation-cover">
                          <img src={book.cover_image_url || "/assets/img/default.webp"} alt={book.title} className="card-img-top" style={{ height: "280px", objectFit: "contain" }} />
                        </div>
                        <div className="card-body">
                          <div className="donation-tags">
                            <span className={`badge ${statusClass}`}>{statusLabel}</span>
                            <span className="badge bg-secondary">Order {Number(book.sort_order || 0)}</span>
                            {book.language ? <span className="badge bg-secondary">{book.language}</span> : null}
                          </div>
                          <h3 className="card-title mt-3">{book.title}</h3>
                          <p>{previewText || "No summary provided yet."}</p>
                          <div className="detail-list mt-3">
                            <div className="detail-list-item">
                              <span>Author</span>
                              <strong>{book.author_name || "Boksoon Kim"}</strong>
                            </div>
                            <div className="detail-list-item">
                              <span>Button</span>
                              <strong>{book.link_label || "Check Out on Amazon"}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer d-flex justify-content-between gap-2">
                          <a className="btn btn-sm btn-primary" href={`/admin/books/${book.id}`}>Edit</a>
                          <DeleteButton
                            endpoint={`/api/admin/books/${book.id}`}
                            className="btn btn-sm btn-danger"
                            confirmMessage="Move this book to trash?"
                            confirmTitle="Move Book to Trash"
                            failureMessage="Could not move this book to trash."
                          >
                            Move to Trash
                          </DeleteButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
