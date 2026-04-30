import { PublicShell } from "@/components/public/PublicShell";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { blogDetailsPath } from "@/lib/routes";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Blog } from "@/lib/types";

export default async function BlogsPage() {
  const blogs = await fetchPublicResource<Blog[]>("blogs").catch(() => []);
  const title = "Ministries";
  const blogCards = blogs.map((blog) => ({
    ...blog,
    detailsHref: blogDetailsPath(blog)
  }));

  return (
    <PublicShell>
      <div className="breadcrumb-wrapper fix bg-cover" style={{ backgroundImage: "url(/assets/img/boksoon/about-us-hero.webp)" }}>
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp title" data-wow-delay=".3s">{title}</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li className="title">{title}</li>
            </ul>
          </div>
        </div>
      </div>
      <section className="event-section-4 section-padding fix">
        <div className="container">
          <div className="row g-4" id="blogs-container">
            {blogCards.length ? blogCards.map((blog) => (
              <div className="col-xl-4 col-lg-6 col-md-6" key={blog.id}>
                <div className="event-inner-items">
                  <div className="event-image">
                    <img src={blog.banner_image_url || "/assets/img/default.webp"} style={{ height: 250, objectFit: "cover" }} alt="img" />
                    <span className="event-tag">
                      <LocalizedDateText value={blog.published_at} variant="date" options={{ day: "2-digit", month: "short", year: "numeric" }} />
                    </span>
                  </div>
                  <div className="event-content">
                    <ul className="event-list">
                      <li><i className="fa-regular fa-location-dot" />{blog.ministry_name}</li>
                    </ul>
                    <h4><a href={blog.detailsHref}>{blog.title}</a></h4>
                    <a href={blog.detailsHref} className="link-btn">EXPLORE MORE <i className="fa-solid fa-arrow-right-long" /></a>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12">
                <p className="text-center mb-0">No blogs found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
