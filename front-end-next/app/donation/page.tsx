import { PublicShell } from "@/components/public/PublicShell";
import { donationDetailsPath } from "@/lib/routes";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Donation } from "@/lib/types";

export default async function DonationsPage() {
  const donations = await fetchPublicResource<Donation[]>("donations").catch(() => []);

  return (
    <PublicShell>
      <div className="breadcrumb-wrapper fix bg-cover" style={{ backgroundImage: "url(/assets/img/boksoon/hero-bg.webp)" }}>
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">Causes of Donations</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li>Donation</li>
            </ul>
          </div>
        </div>
      </div>
      <section className="donation-section-2 section-padding fix">
        <div className="container">
          <div className="donation-wrapper-2">
            <div className="row g-4" id="donations">
              {donations.length ? donations.map((donation) => (
                <div className="col-lg-6 col-md-6" key={donation.id}>
                  <div className="donation-card-item-2 mt-0">
                    <div className="left-shape">
                      <img src="/assets/img/home-2/donation/shape-1.png" alt="img" />
                    </div>
                    <div className="donation-image">
                      <img src={donation.placeholder_url || "/assets/img/default.webp"} alt="img" style={{ maxHeight: 260, objectFit: "cover" }} />
                      <div className="news-layer-wrapper">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="news-layer-image" style={{ backgroundImage: `url(${donation.placeholder_url || "/assets/img/default.webp"})` }} />
                        ))}
                      </div>
                    </div>
                    <div className="donation-content">
                      <h4><a href={donationDetailsPath(donation.id)}>{donation.title}</a></h4>
                      <ul className="donate-list">
                        <li>Raised - ${donation.raised_amount}</li>
                        <li><span>Goal - ${donation.target_amount}</span></li>
                      </ul>
                      <a href={donationDetailsPath(donation.id)} className="theme-btn style-2">Donte Now <i className="fa-solid fa-arrow-right-long" /></a>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-12 wow fadeInUp" data-wow-delay=".3s">
                  <p className="text-center mb-0">No donation found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
