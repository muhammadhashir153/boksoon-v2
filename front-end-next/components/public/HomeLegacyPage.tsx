import { Donation, Testimonial } from "@/lib/types";
import { donationDetailsPath } from "@/lib/routes";

type HomeLegacyPageProps = {
  donations: Donation[];
  testimonials: Testimonial[];
};

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

const serviceItems = [
  {
    icon: "/assets/img/home-1/icon/03.svg",
    title: "Book Publishing",
    body: "We publish spiritual books in multiple languages, carefully crafted to touch hearts and inspire faith. By expanding access across cultures, we ensure God's message of love and redemption reaches people worldwide.",
    href: "/books"
  },
  {
    icon: "/assets/img/home-1/icon/04.svg",
    title: "Testimonies of Faith",
    body: "We collect and share powerful stories of transformation from readers whose lives have been changed by Boksoon Kim's works. These testimonies encourage others to find hope and strengthen their relationship with the Lord.",
    href: "#"
  },
  {
    icon: "/assets/img/home-1/icon/05.svg",
    title: "Global Distribution",
    body: "Our mission goes beyond borders, delivering books to communities that often lack access to spiritual resources. Through this outreach, we bring light and encouragement to people in some of the most underserved regions of the world.",
    href: "#"
  },
  {
    icon: "/assets/img/home-1/icon/03.svg",
    title: "Prison Outreach",
    body: "We provide free books to prisons, placing hope and spiritual guidance in the hands of inmates. This ministry reminds those behind bars that they are not forgotten and that redemption and renewal are always possible.",
    href: "#"
  },
  {
    icon: "/assets/img/home-1/icon/04.svg",
    title: "Donor Support",
    body: "Every contribution we receive goes directly into producing and distributing books and supporting outreach causes. With each donation, our supporters actively participate in spreading faith and transforming lives.",
    href: "#"
  },
  {
    icon: "/assets/img/home-1/icon/04.svg",
    title: "Volunteer Opportunities",
    body: "We welcome volunteers who share our vision of guiding souls back to the Lord. By joining our community, you can help extend faith, hope, and encouragement to individuals and families worldwide.",
    href: "#"
  }
];

const projectRows = [
  [
    { title: "Books for Redemption", image: "/assets/img/boksoon/others/1.webp" },
    { title: "Hope Behind Bars", image: "/assets/img/boksoon/others/2.webp" },
    { title: "Voices of Testimony", image: "/assets/img/boksoon/others/3.webp" }
  ],
  [
    { title: "Global Faith Outreach", image: "/assets/img/boksoon/others/1.webp" },
    { title: "Hearts in Service", image: "/assets/img/boksoon/others/2.webp" },
    { title: "Light for Communities", image: "/assets/img/boksoon/others/3.webp" }
  ]
];

export function HomeLegacyPage({ donations, testimonials }: HomeLegacyPageProps) {
  return (
    <>
      <section className="hero-section-1">
        <div className="hero-1">
          <div className="shape">
            <img src="/assets/img/home-1/hero/shape.png" alt="img" />
          </div>
          <div className="hero-bg bg-cover" style={{ backgroundImage: "url(/assets/img/boksoon/hero-bg.webp)" }} />
          <div className="container">
            <div className="row g-4 justify-content-center">
              <div className="col-lg-10">
                <div className="hero-content">
                  <h6 data-animation="fadeInUp" data-delay="1.3s">Guiding Hearts Back to the Lord</h6>
                  <h1 data-animation="fadeInUp" data-delay="1.5s">Faith, Hope, and Redemption Through the Written Word</h1>
                  <p data-animation="fadeInUp" data-delay="1.3s">
                    Boksoon Kim Organization spreads God&apos;s love through books, testimonies, and outreach. Together, we bring light into lives and hope to those who need it most.
                  </p>
                  <div className="hero-button" data-animation="fadeInUp" data-delay="1.5s">
                    <a href="/contact" className="theme-btn">Join With Us <i className="fa-solid fa-arrow-right-long" /></a>
                    <a href="/about" className="theme-btn border-btn">Read More <i className="fa-solid fa-arrow-right-long" /></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section section-padding fix">
        <div className="container">
          <div className="about-wrapper">
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="about-content">
                  <div className="section-title mb-0">
                    <span className="sub-title wow fadeInUp">About Us</span>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                      <span>T</span>ransforming Lives Through Faith and the Power of Words
                    </h2>
                  </div>
                  <p className="text wow fadeInUp" data-wow-delay=".5s">
                    Founded by author Boksoon Kim, our organization is dedicated to publishing and sharing spiritual books that inspire change, healing, and deeper connection with the Lord. With the support of our readers and donors, we extend these messages of hope across the globe.
                  </p>
                  <div className="about-icon-item wow fadeInUp" data-wow-delay=".3s">
                    <div className="icon">
                      <img src="/assets/img/home-1/icon/01.svg" alt="img" />
                    </div>
                    <div className="content">
                      <h4>Our Mission</h4>
                      <p>To guide people back to the Lord by sharing spiritual works, testimonies of transformation, and faith-filled outreach.</p>
                    </div>
                  </div>
                  <div className="about-icon-item mb-0 wow fadeInUp" data-wow-delay=".5s">
                    <div className="icon">
                      <img src="/assets/img/home-1/icon/02.svg" alt="img" />
                    </div>
                    <div className="content">
                      <h4>Our Work</h4>
                      <p>From publishing and distributing books to serving prison ministries, we ensure every effort directly uplifts souls in need of encouragement and redemption.</p>
                    </div>
                  </div>
                  <div className="about-bottom wow fadeInUp" data-wow-delay=".3s">
                    <a href="/about" className="theme-btn">More About Us <i className="fa-solid fa-arrow-right-long" /></a>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 my-md-auto">
                <div className="about-item">
                  <div className="about-image">
                    <img src="/assets/img/boksoon/others/7.webp" alt="img" className="wow img-custom-anim-right" data-wow-duration="1.3s" data-wow-delay="0.3s" />
                    <div className="shape">
                      <img src="/assets/img/home-1/about/shape.png" alt="img" />
                    </div>
                    <div className="about-image-2">
                      <img src="/assets/img/boksoon/others/6.webp" alt="img" className="wow img-custom-anim-left" data-wow-duration="1.3s" data-wow-delay="0.3s" />
                    </div>
                    <div className="about-image-3">
                      <img src="/assets/img/boksoon/others/5.webp" alt="img" className="wow img-custom-anim-left" data-wow-duration="1.3s" data-wow-delay="0.3s" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="causes-section section-padding fix bg-cover" style={{ backgroundImage: "url(/assets/img/home-1/service/bg.jpg)" }}>
        <div className="shape">
          <img src="/assets/img/home-1/service/shape.png" alt="img" />
        </div>
        <div className="container">
          <div className="section-title text-center">
            <span className="sub-title wow fadeInUp">Programs &amp; Impact</span>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              <span>H</span>ow We Are Making a Difference
            </h2>
          </div>
          <div className="swiper service-slider">
            <div className="swiper-wrapper">
              {serviceItems.map((item) => (
                <div className="swiper-slide" key={item.title}>
                  <div className="causes-box-item">
                    <div className="icon">
                      <img src={item.icon} alt="img" />
                    </div>
                    <div className="content">
                      <h3><a href={item.href}>{item.title}</a></h3>
                      <p>{item.body}</p>
                      <a href={item.href} className="theme-btn">Learn More <i className="fa-solid fa-arrow-right-long" /></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="donation-section section-padding fix">
        <div className="container">
          <div className="section-title-area">
            <div className="section-title">
              <span className="sub-title wow fadeInUp">Causes We Donate For</span>
              <h2 className="wow fadeInUp" data-wow-delay=".3s">
                <span>C</span>auses We Support<br /> With Your Contributions
              </h2>
            </div>
            <a href="/donation" className="theme-btn">Learn More <i className="fa-solid fa-arrow-right-long" /></a>
          </div>
          <div className="donation-wrapper">
            <div className="row" id="donations">
              {donations.length ? donations.slice(0, 4).map((donation) => (
                <div className="col-lg-6 wow fadeInUp" data-wow-delay=".2s" key={donation.id}>
                  <div className="donation-card-item">
                    <div className="donation-image">
                      <img src={donation.placeholder_url || "/assets/img/default.webp"} alt="img" className="w-100" style={{ maxHeight: 260, objectFit: "cover" }} />
                      <div className="right-shape">
                        <img src="/assets/img/home-1/donation/shape.png" alt="img" />
                      </div>
                    </div>
                    <div className="donation-content">
                      <h4><a href={donationDetailsPath(donation.id)}>{donation.title}</a></h4>
                      <p>{donation.description}</p>
                      <hr />
                      <ul className="donate-list">
                        <li><span>Goal :</span> ${donation.target_amount}</li>
                        <li><span>Raised:</span> ${donation.raised_amount}</li>
                      </ul>
                      <a href={donationDetailsPath(donation.id)} className="theme-btn">Donate Now <i className="fa-solid fa-arrow-right-long" /></a>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-12 wow fadeInUp" data-wow-delay=".2s">
                  <p className="text-center mb-0">No donation found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="project-section fix">
        <div className="container">
          <div className="section-title text-center">
            <span className="sub-title wow fadeInUp">Projects</span>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              <span>O</span>ur Ongoing Projects of Faith and Service
            </h2>
          </div>
        </div>
        <div className="swiper project-slider">
          <div className="swiper-wrapper slide-transtion">
            {projectRows[0].map((project) => (
              <div className="swiper-slide brand-slide-element" key={project.title}>
                <div className="project-card-item">
                  <div className="project-image">
                    <img src={project.image} alt="img" />
                    <div className="shape-image">
                      <img src="/assets/img/home-1/project/shape.png" alt="img" />
                    </div>
                    <div className="project-content">
                      <div className="content">
                        <h3><a href="#">{project.title}</a></h3>
                      </div>
                      <a href="#" className="arrow-icon"><i className="fa-solid fa-arrow-right-long" /></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div dir="rtl" className="swiper project-slider-2">
          <div className="swiper-wrapper slide-transtion">
            {projectRows[1].map((project) => (
              <div className="swiper-slide brand-slide-element" key={project.title}>
                <div className="project-card-item">
                  <div className="project-image">
                    <img src={project.image} alt="img" />
                    <div className="shape-image">
                      <img src="/assets/img/home-1/project/shape.png" alt="img" />
                    </div>
                    <div className="project-content style-2">
                      <div className="content">
                        <h3><a href="#">{project.title}</a></h3>
                      </div>
                      <a href="#" className="arrow-icon"><i className="fa-solid fa-arrow-right-long" /></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial-section section-padding fix">
        <div className="container">
          <div className="section-title">
            <span className="sub-title wow fadeInUp">Testimonials</span>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">Here are Some Reviews on Boksoon&apos;s Spiritual Books</h2>
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
                      {testimonials.length ? testimonials.slice(0, 4).map((testimonial) => (
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

      <div className="counter-section fix section-bg-1">
        <div className="right-shape">
          <img src="/assets/img/home-1/feature/shape-2.png" alt="img" />
        </div>
        <div className="container">
          <div className="counter-wrapper">
            <div className="row g-4 align-items-center">
              <div className="col-lg-6">
                <div className="counter-image">
                  <img src="/assets/img/boksoon/mission-1.webp" alt="img" />
                  <div className="shape">
                    <img src="/assets/img/home-1/feature/shape-1.png" alt="img" />
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="counter-content">
                  <div className="section-title mb-0">
                    <span className="sub-title wow fadeInUp">Mission</span>
                    <h2 className="sec-title">
                      <span>W</span>e Always Stand With the Needy and Bring Them Hope
                    </h2>
                  </div>
                  <p className="text wow fadeInUp" data-wow-delay=".3s">
                    Charity not only reduces suffering but also creates unity and shared responsibility. Through your support, we are making a real difference in people&apos;s lives - one book, one testimony, and one act of service at a time.
                  </p>
                  <div className="counter-main-item">
                    <div className="counter-item wow fadeInUp" data-wow-delay=".5s">
                      <div className="content style-2">
                        <h2><span className="count">2</span>k</h2>
                        <p>Global Readers</p>
                      </div>
                      <div className="content">
                        <h2><span className="count">6</span>+</h2>
                        <p>Published Books</p>
                      </div>
                    </div>
                    <div className="counter-item style-border wow fadeInUp" data-wow-delay=".3s">
                      <div className="content">
                        <h2><span className="count">1</span>k+</h2>
                        <p>Incredible<br />Volunteers</p>
                      </div>
                      <div className="content style-2">
                        <h2><span className="count">20</span>+</h2>
                        <p>Monthly Donors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <section className="contact-section section-padding pb-0">
        <div className="container-fluid">
          <div className="contact-wrapper">
            <div className="row g-4 align-items-end">
              <div className="col-lg-6">
                <div className="contact-image wow img-custom-anim-left" data-wow-duration="1.3s" data-wow-delay="0.3s">
                  <img src="/assets/img/boksoon/mission-2.webp" style={{ objectPosition: "bottom" }} alt="img" />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="contact-content">
                  <div className="logo-image">
                    <a href="/"><img src="/assets/img/logo/logo.png" width="150" alt="img" /></a>
                  </div>
                  <div className="section-title mb-0">
                    <h2 className="sec-title text-white">
                      <span>B</span>e Part of a Mission That Changes Lives Through Faith and Hope
                    </h2>
                  </div>
                  <p className="text wow fadeInUp" data-wow-delay=".3s">
                    Your support helps us publish more books, reach more souls, and bring God&apos;s message to those in need - from prisons to communities worldwide. Together, we can make a lasting impact.
                  </p>
                  <div className="contact-item wow fadeInUp" data-wow-delay=".5s">
                    <a href="/contact" className="theme-btn">Explore More <i className="fa-solid fa-arrow-right-long" /></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
