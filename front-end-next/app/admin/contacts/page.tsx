import { fetchProtectedResource } from "@/lib/server/laravel";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { Contact } from "@/lib/types";

export default async function AdminContactsPage() {
  const contacts = await fetchProtectedResource<Contact[]>("admin/contacts").catch(() => []);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Contacts</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Contacts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>All Contacts</h3>
          <p className="section-copy mb-0">A cleaner inbox-style view for reviewing submitted messages.</p>
        </div>
        <div className="card-body">
          <div className="dt-responsive table-responsive" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <table id="order-table" className="table table-striped table-bordered">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Number</th><th>Received</th><th>Message</th></tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.number || "-"}</td>
                    <td><LocalizedDateText value={contact.created_at} variant="dateTime" fallback="-" /></td>
                    <td>{contact.message}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th>Name</th><th>Email</th><th>Number</th><th>Received</th><th>Message</th></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
