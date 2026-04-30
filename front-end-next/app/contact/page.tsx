import { ContactForm } from "@/components/public/ContactForm";
import { PublicShell } from "@/components/public/PublicShell";

export default async function ContactPage() {
  return (
    <PublicShell>
      <div className="breadcrumb-wrapper fix bg-cover" style={{ backgroundImage: "url(/assets/img/boksoon/about-us-hero.webp)" }}>
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">Contact Us</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="contact-us-section-2 section-padding fix">
        <div className="container">
          <div className="contact-us-wrapper-2">
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="contact-us-box mb-0">
                  <div className="icon"><i className="fa-solid fa-square-chevron-down" /></div>
                  <div className="contact-us-content">
                    <span>Email Address</span>
                    <h5><a style={{ textTransform: "lowercase" }} href="mailto:boksoonkimfoundation@gmail.com">boksoonkimfoundation@gmail.com</a></h5>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="from-fill-up-box">
                  <h4>Fill Up The Form</h4>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
