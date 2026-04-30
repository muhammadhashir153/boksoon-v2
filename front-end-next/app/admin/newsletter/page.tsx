import { fetchProtectedResource } from "@/lib/server/laravel";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { Newsletter } from "@/lib/types";

export default async function AdminNewsletterPage() {
  const subscribers = await fetchProtectedResource<Newsletter[]>("admin/newsletters").catch(() => []);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">NewsLetters</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">NewsLetters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>All NewsLetters</h3>
          <p className="section-copy mb-0">Subscriber emails are organized into a cleaner read-focused list.</p>
        </div>
        <div className="card-body">
          <div className="dt-responsive table-responsive" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <table id="order-table" className="table table-striped table-bordered">
              <thead>
                <tr><th>S No.</th><th>Email</th><th>Subscribed</th></tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber, index) => (
                  <tr key={subscriber.id}>
                    <td>{index + 1}</td>
                    <td>{subscriber.email}</td>
                    <td><LocalizedDateText value={subscriber.created_at} variant="dateTime" fallback="-" /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th>S No.</th><th>Email</th><th>Subscribed</th></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
