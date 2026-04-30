import { fetchProtectedResource } from "@/lib/server/laravel";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { Blog, Donation, Transaction } from "@/lib/types";
import { money } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [donations, blogs, transactions] = await Promise.all([
    fetchProtectedResource<Donation[]>("admin/donations").catch(() => []),
    fetchProtectedResource<Blog[]>("admin/blogs").catch(() => []),
    fetchProtectedResource<Transaction[]>("admin/transactions").catch(() => [])
  ]);

  const totalRaised = donations.reduce((sum, donation) => sum + donation.raised_amount, 0);
  const totalTarget = donations.reduce((sum, donation) => sum + donation.target_amount, 0);
  const progress = totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 0;
  const completedCount = donations.filter((donation) => donation.target_amount > 0 && donation.raised_amount >= donation.target_amount).length;
  const activity = [
    ...transactions.map((transaction) => ({
      id: `transaction-${transaction.id}`,
      type: "transaction" as const,
      title: transaction.donation_title || "Donation Payment",
      sub: transaction.donor_name || transaction.donor_email || "Unknown donor",
      amount: money(transaction.amount),
      date: transaction.created_at
    })),
    ...blogs.map((blog) => ({
      id: `blog-${blog.id}`,
      type: "blog" as const,
      title: blog.title || "Blog Post",
      sub: blog.ministry_name || "General",
      amount: blog.is_published ? "Published" : "Draft",
      date: blog.created_at
    }))
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="page-header-title">
                <h5 className="m-b-10">Admin Overview</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Dashboard</li>
              </ul>
            </div>
            <div className="col-lg-4">
              <div className="page-toolbar-actions justify-content-lg-end">
                <a href="/admin/donations/new" className="btn btn-primary">New Campaign</a>
                <a href="/admin/books/new" className="btn btn-outline-secondary">New Book</a>
                <a href="/admin/blogs/new" className="btn btn-outline-secondary">Publish Story</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 col-xl-3">
          <div className="card kpi-card">
            <div className="card-body">
              <span className="eyebrow">Campaigns</span>
              <h4 className="mb-2 metric-value" id="kpi-campaigns">{donations.length}</h4>
              <p className="mb-0 text-muted text-sm" id="kpi-campaigns-sub">{completedCount} campaigns reached target</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card kpi-card">
            <div className="card-body">
              <span className="eyebrow">Editorial</span>
              <h4 className="mb-2 metric-value" id="kpi-blogs">{blogs.length}</h4>
              <p className="mb-0 text-muted text-sm" id="kpi-blogs-sub">Content across ministries</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card kpi-card">
            <div className="card-body">
              <span className="eyebrow">Raised</span>
              <h4 className="mb-2 metric-value" id="kpi-raised">{money(totalRaised)}</h4>
              <p className="mb-0 text-muted text-sm" id="kpi-raised-sub">Target: {money(totalTarget)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card kpi-card">
            <div className="card-body">
              <span className="eyebrow">Progress</span>
              <h4 className="mb-2 metric-value" id="kpi-progress">{progress.toFixed(1)}%</h4>
              <p className="mb-0 text-muted text-sm" id="kpi-progress-sub">Overall progress against target</p>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-xl-8">
          <div className="card">
            <div className="card-header">
              <h3>Campaign Performance</h3>
              <p className="section-copy mb-0">Track live fundraising progress across your active campaigns.</p>
            </div>
            <div className="card-body">
              <h6 className="mb-3 f-w-400 text-muted" id="kpi-target">Raised {money(totalRaised)} of {money(totalTarget)}</h6>
              <div id="campaign-progress-list" className="d-flex flex-column gap-3">
                {!donations.length ? (
                  <div className="empty-state">
                    <strong>No donation campaigns found</strong>
                    <div>Create a campaign to start tracking fundraising performance.</div>
                  </div>
                ) : donations.slice(0, 6).map((donation) => {
                  const percent = donation.target_amount > 0 ? Math.min(100, (donation.raised_amount / donation.target_amount) * 100) : 0;
                  return (
                    <div className="detail-list-item" key={donation.id}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">{donation.title || "Untitled Campaign"}</span>
                        <span className="text-muted">{percent.toFixed(1)}%</span>
                      </div>
                      <div className="progress" style={{ height: "10px" }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${percent.toFixed(2)}%` }} />
                      </div>
                      <div className="d-flex justify-content-between mt-2 small text-muted">
                        <span>Raised: {money(donation.raised_amount)}</span>
                        <span>Target: {money(donation.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-xl-4">
          <div className="card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <p className="section-copy mb-0">A quick stream of recent donations and publishing updates.</p>
            </div>
            <div className="list-group list-group-flush" id="dashboard-activity-list">
              {!activity.length ? <div className="list-group-item">No recent activity found.</div> : activity.slice(0, 8).map((item) => (
                <div className="list-group-item list-group-item-action" key={item.id}>
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <div className={`avtar avtar-s rounded-circle ${item.type === "transaction" ? "text-success bg-light-success" : "text-primary bg-light-primary"}`}>
                        <i className={`ti ${item.type === "transaction" ? "ti-wallet" : "ti-news"} f-18`} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">{item.title}</h6>
                      <p className="mb-0 text-muted">{item.sub}</p>
                    </div>
                    <div className="flex-shrink-0 text-end">
                      <h6 className="mb-1">{item.amount}</h6>
                      <p className="mb-0 text-muted">
                        <LocalizedDateText value={item.date} variant="dateTime" fallback="-" />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
