import { PublicShell } from "@/components/public/PublicShell";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Testimonial } from "@/lib/types";

export default async function TestimonialsPage() {
  const testimonials = await fetchPublicResource<Testimonial[]>("testimonials").catch(() => []);

  return (
    <PublicShell>
      <div className="breadcrumb-wrapper fix bg-cover" style={{ backgroundImage: "url(/assets/img/inner-page/breadcrumb.png)" }}>
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">Testimonials</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li>Testimonials</li>
            </ul>
          </div>
        </div>
      </div>
      <section className="event-list-section section-padding fix">
        <div className="container">
          <div className="event-list-wrapper">
            <div className="row g-4" id="testimonials">
              {testimonials.length ? testimonials.map((testimonial) => (
                <div className="col-md-6 testimonial" key={testimonial.id}>
                  <div className="content">
                    <div className="star">{Array.from({ length: 5 }).map((_, index) => <i key={index} className="fa-solid fa-star" />)}</div>
                    <h4>{testimonial.reviewer_name}</h4>
                    <p className="mt-3">&ldquo;{testimonial.review}&rdquo;</p>
                  </div>
                </div>
              )) : (
                <div className="col-12">
                  <p className="text-center mb-0">No testimonials found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
