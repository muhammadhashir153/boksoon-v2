import { PublicShell } from "@/components/public/PublicShell";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Testimonial } from "@/lib/types";

const faqItems = [
  {
    id: "Two",
    heading: "What is the mission of Boksoon Kim Organization?",
    body: "Our mission is to guide people back to the Lord through spiritual books, testimonies, and outreach programs that bring hope and transformation.",
    expanded: false,
    delay: ".3s"
  },
  {
    id: "One",
    heading: "How are donations used?",
    body: "Every donation is directed toward producing more books, distributing them globally, and supporting our prison ministries and community outreach.",
    expanded: true,
    delay: ".5s"
  },
  {
    id: "three",
    heading: "Can I volunteer with the organization?",
    body: "Yes! We welcome volunteers who want to help with book distribution, events, and outreach programs. It's a wonderful way to serve and spread faith.",
    expanded: false,
    delay: ".3s"
  },
  {
    id: "four",
    heading: "Do you distribute books outside of prisons?",
    body: "Absolutely. In addition to prison ministries, we provide books to churches, shelters, and underserved communities worldwide.",
    expanded: false,
    delay: ".5s"
  },
  {
    id: "five",
    heading: "How can I share my testimony?",
    body: "If you've been touched by Boksoon Kim's work, we'd love to hear from you. You can share your testimony through our website's contact form or by emailing us directly.",
    expanded: false,
    delay: ".3s"
  }
];

export default async function AboutPage() {
  const testimonials = await fetchPublicResource<Testimonial[]>("testimonials").catch(() => []);

  return (
    <PublicShell>
      <div
        className="breadcrumb-wrapper fix bg-cover"
        style={{ backgroundImage: "url(/assets/img/boksoon/about-us-hero.webp)" }}
      >
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">About Us</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li>About Us</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="about-section section-padding fix">
        <div className="container">
          <div className="about-wrapper-2">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="about-left-item">
                  <div className="section-title style-2 mb-0">
                    <span className="sub-title wow fadeInUp">About Boksoon Kim Organization</span>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                      <span>A</span> Mission to Guide Souls Back to the Lord
                    </h2>
                  </div>
                  <p className="text wow fadeInUp" data-wow-delay=".5s">
                    Boksoon Kim Organization is a faith-driven nonprofit dedicated to guiding people back to the Lord through the power of books, testimonies, and outreach. Founded by spiritual author Boksoon Kim, the organization works globally to bring hope, healing, and inspiration to individuals and communities in need.
                  </p>
                  <div className="about-image wow img-custom-anim-left" data-wow-duration="1.3s" data-wow-delay="0.3s">
                    <img src="/assets/img/boksoon/about-us-2.webp" alt="img" />
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="about-right-item">
                  <div className="about-image wow img-custom-anim-right" data-wow-duration="1.3s" data-wow-delay="0.3s">
                    <img src="/assets/img/boksoon/about-us-3.webp" alt="img" />
                  </div>
                  <div className="about-icon-main-item">
                    <div className="about-icon-item">
                      <div className="icon-item wow fadeInUp" data-wow-delay=".3s">
                        <div className="icon">
                          <img src="/assets/img/home-2/icon/01.svg?v=1" alt="img" className="w-50" />
                        </div>
                        <div className="content">
                          <h5>Books</h5>
                          <p>Publishing and distributing spiritual works that guide people back to God.</p>
                        </div>
                      </div>
                      <div className="icon-item wow fadeInUp" data-wow-delay=".5s">
                        <div className="icon">
                          <img src="/assets/img/home-2/icon/02.svg" className="w-50" alt="img" />
                        </div>
                        <div className="content">
                          <h5>Prisons</h5>
                          <p>Providing free books to inmates, offering hope and redemption behind bars.</p>
                        </div>
                      </div>
                    </div>
                    <div className="about-icon-item mb-0">
                      <div className="icon-item wow fadeInUp" data-wow-delay=".3s">
                        <div className="icon">
                          <img src="/assets/img/home-2/icon/03.svg" className="w-50" alt="img" />
                        </div>
                        <div className="content">
                          <h5>Testimonies</h5>
                          <p>Sharing real stories of transformation to inspire faith in others.</p>
                        </div>
                      </div>
                      <div className="icon-item wow fadeInUp" data-wow-delay=".5s">
                        <div className="icon">
                          <img src="/assets/img/home-2/icon/04.svg" className="w-50" alt="img" />
                        </div>
                        <div className="content">
                          <h5>Outreach</h5>
                          <p>Extending support to communities in need through donations and service.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section section-padding fix">
        <div className="container">
          <div className="faq-wrapper">
            <div className="row g-4 align-items-center">
              <div className="col-lg-6">
                <div className="faq-items">
                  <div className="accordion" id="accordionExample">
                    {faqItems.map((item, index) => (
                      <div key={item.id} className={`accordion-item${index === faqItems.length - 1 ? " mb-0" : ""} wow fadeInUp`} data-wow-delay={item.delay}>
                        <h2 className="accordion-header" id={`heading${item.id}`}>
                          <button
                            className={`accordion-button${item.expanded ? "" : " collapsed"}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${item.id}`}
                            aria-expanded={item.expanded}
                            aria-controls={`collapse${item.id}`}
                          >
                            {item.heading}
                          </button>
                        </h2>
                        <div
                          id={`collapse${item.id}`}
                          className={`accordion-collapse collapse${item.expanded ? " show" : ""}`}
                          aria-labelledby={`heading${item.id}`}
                          data-bs-parent="#accordionExample"
                        >
                          <div className="accordion-body">
                            <p>{item.body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="faq-content">
                  <div className="section-title mb-0">
                    <span className="sub-title wow fadeInUp">FAQs</span>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                      <span>F</span>requently Asked Questions
                    </h2>
                  </div>
                  <p className="text wow fadeInUp" data-wow-delay=".5s">
                    We understand you may have questions about our mission, donations, and outreach. Below are answers to some of the most common questions we receive. If you need more details, feel free to reach out to us directly - we&apos;re always here to help.
                  </p>
                  <div className="faq-image wow slideInRight" data-wow-delay="100ms" data-wow-duration="2500ms">
                    <img src="/assets/img/boksoon/faq-1.webp" alt="img" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section section-padding fix">
        <div className="container">
          <div className="section-title">
            <span className="sub-title wow fadeInUp">Testimonials</span>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              <span>W</span>hat people say about charity.
            </h2>
          </div>
          <div className="testimonial-wrapper">
            <div className="row g-4">
              <div className="col-lg-5 wow slideInLeft" data-wow-delay="100ms" data-wow-duration="2500ms">
                <div className="testimonial-image">
                  <img src="/assets/img/home-1/testimonial/01.jpg" alt="img" />
                  <div className="shape">
                    <img src="/assets/img/home-1/testimonial/shape.png" alt="img" />
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="testimonial-content">
                  <div className="swiper testimonial-slider">
                    <div className="swiper-wrapper">
                      {testimonials.length ? testimonials.map((testimonial) => (
                        <div className="swiper-slide" key={testimonial.id}>
                          <div className="content">
                            <div className="star">
                              {Array.from({ length: 5 }).map((_, index) => <i key={index} className="fa-solid fa-star" />)}
                            </div>
                            <p>&ldquo;{testimonial.review}&rdquo;</p>
                            <h3>{testimonial.reviewer_name}</h3>
                          </div>
                        </div>
                      )) : (
                        <div className="swiper-slide">
                          <div className="content">
                            <p>No testimonials found.</p>
                          </div>
                        </div>
                      )}
                    </div>
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
