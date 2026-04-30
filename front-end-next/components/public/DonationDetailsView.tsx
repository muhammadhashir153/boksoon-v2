import { PublicShell } from "@/components/public/PublicShell";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { formatDate } from "@/lib/format";
import { blogDetailsPath } from "@/lib/routes";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Blog, Donation, Ministry } from "@/lib/types";
import { DonationForm } from "./DonationForm";

export async function DonationDetailsView({ donationId }: { donationId: string }) {
  const [donation, ministries, blogs] = await Promise.all([
    fetchPublicResource<Donation>(`donations/${donationId}`).catch(() => null),
    fetchPublicResource<Ministry[]>("ministries").catch(() => []),
    fetchPublicResource<Blog[]>("blogs").catch(() => [])
  ]);

  if (!donation) {
    return (
      <PublicShell>
        <div className="container section-padding"><div className="page-error">Donation not found.</div></div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <style>{`
        .donation-blog-card {
          display: block !important;
        }
        .donation-blog-card .details-thumb {
          width: 100%;
          margin-bottom: 18px;
        }
        .donation-blog-card .details-thumb img {
          width: 100%;
          height: 220px !important;
          object-fit: cover;
          display: block;
        }
        .donation-blog-card .details-content {
          width: 100%;
        }
        .donation-blog-card .details-content ul {
          margin-top: 10px;
          padding-left: 0;
          list-style: none;
        }
      `}</style>
      <div className="breadcrumb-wrapper fix bg-cover" style={{ backgroundImage: "url(/assets/img/inner-page/breadcrumb.png)" }}>
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">Donation Details</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li><a href="/donation">Donations</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li>Donation Details</li>
            </ul>
          </div>
        </div>
      </div>
      <section className="donation-details-section section-padding fix">
        <div className="container">
          <div className="donation-details-wrapper">
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="donation-details-left">
                  <h3>{donation.title}</h3>
                  <ul className="list">
                    <li className="style-2">By {donation.admin_name || "Admin"}</li>
                    <li className="style-2">{formatDate(donation.start_date)}</li>
                  </ul>
                  <p>{donation.description}</p>
                  <div className="details-image">
                    <img style={{ maxHeight: 260, objectFit: "cover" }} src={donation.placeholder_url || "/assets/img/default.webp"} alt="img" />
                  </div>
                  <div className="radius-box">
                    <div className="box-ber">
                      <div className="shape">
                        <img src="/assets/img/inner-page/donation-details/shape.png" alt="img" />
                      </div>
                      <h5>Notice: Test mode is enabled while in test mode no live donations are processed.</h5>
                    </div>
                  </div>
                  <DonationForm donation={donation} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="donation-details-sideber">
                  <div className="donation-details-sideber-box">
                    <h4>Ministries</h4>
                      <ul className="donation-list">
                        {ministries.map((ministry) => (
                          <li key={ministry.id}><a href={`/ministries/${encodeURIComponent(ministry.id)}`}>{ministry.name}</a></li>
                        ))}
                      </ul>
                  </div>
                  <h4 className="text">Blogs</h4>
                    <div className="details-post-area">
                      {blogs.length ? blogs.slice(0, 3).map((blog) => (
                        <div className="details-items donation-blog-card" key={blog.id}>
                          <div className="details-thumb"><img src={blog.banner_image_url || "/assets/img/default.webp"} alt={blog.title} /></div>
                          <div className="details-content">
                            <h5><a href={blogDetailsPath(blog)}>{blog.title}</a></h5>
                          <ul>
                            <li>
                              <LocalizedDateText value={blog.published_at} variant="date" />
                              {blog.published_at && blog.ministry_name ? " . " : ""}
                              {blog.ministry_name || ""}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )) : <p>No blogs found.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
