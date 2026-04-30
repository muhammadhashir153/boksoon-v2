import { DeleteButton } from "@/components/admin/DeleteButton";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Donation } from "@/lib/types";
import { money } from "@/lib/format";

export default async function AdminDonationsPage() {
  const donations = await fetchProtectedResource<Donation[]>("admin/donations").catch(() => []);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Donations</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Donations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="page-toolbar">
        <div className="page-toolbar-copy">
          <h2>Campaign Library</h2>
          <p>Review active campaigns, monitor fundraising momentum, and jump into editing.</p>
        </div>
        <div className="page-toolbar-actions">
          <a href="/admin/donations/new" className="btn btn-primary">Create Campaign</a>
          <a href="/admin/trash" className="btn btn-outline-secondary">Open Trash</a>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-header">
              <h3>All Campaigns</h3>
              <p className="section-copy mb-0">Each card keeps fundraising progress, schedule, and quick actions visible.</p>
            </div>
            <div className="card-body">
              <div className="row donation-grid" id="donations">
                {!donations.length ? (
                  <div className="empty-state">
                    <strong>No campaigns yet</strong>
                    <div>Create your first donation campaign to start tracking progress.</div>
                  </div>
                ) : donations.map((donation) => {
                  const progress = donation.target_amount > 0 ? Math.min(100, (donation.raised_amount / donation.target_amount) * 100) : 0;
                  return (
                    <div className="col-12 col-md-6 col-lg-4" key={donation.id}>
                      <div className="donation-item">
                        <div className="donation-cover">
                          <img src={donation.placeholder_url || "/admin-assets/images/user/avatar-2.jpg"} alt={donation.title} className="w-100" />
                        </div>
                        <div className="content">
                          <div className="donation-tags">
                            <span className="badge bg-secondary">Campaign</span>
                            <span className="badge bg-secondary">{progress.toFixed(1)}% funded</span>
                            {donation.end_date ? <span className="badge bg-secondary">Ends {donation.end_date}</span> : null}
                          </div>
                          <h4 className="mt-3">{donation.title}</h4>
                          <p>{donation.description || "No campaign summary provided yet."}</p>
                          <div className="progress mt-3" style={{ height: "10px" }}>
                            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${progress.toFixed(1)}%` }} />
                          </div>
                          <div className="stat-pair mt-2"><span>Progress</span><strong>{progress.toFixed(1)}%</strong></div>
                          <div className="price-box donation-tags">
                            <div className="detail-list-item"><span>Target</span><strong>{money(donation.target_amount)}</strong></div>
                            <div className="detail-list-item"><span>Raised</span><strong>{money(donation.raised_amount)}</strong></div>
                          </div>
                          <div className="date-box donation-tags">
                            <div className="detail-list-item"><span>Start</span><strong>{donation.start_date || "-"}</strong></div>
                            {donation.end_date ? <div className="detail-list-item"><span>End</span><strong>{donation.end_date}</strong></div> : null}
                          </div>
                          <div className="actions">
                            <a className="btn btn-primary btn-sm" href={`/admin/donations/${donation.id}`}>
                              <span className="pc-micon"><i className="ti ti-edit-circle" /></span> Edit
                            </a>
                            <DeleteButton
                              endpoint={`/api/admin/donations/${donation.id}`}
                              className="btn btn-danger btn-sm"
                              confirmMessage="Move this donation campaign to trash?"
                              confirmTitle="Move Donation to Trash"
                              failureMessage="Could not move this donation campaign to trash."
                            >
                              <span className="pc-micon"><i className="ti ti-trash" /></span> Move to Trash
                            </DeleteButton>
                          </div>
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
