import Script from "next/script";
import { ReactNode } from "react";
import { fetchPublicResource } from "@/lib/server/laravel";
import { appConfig } from "@/lib/server/config";
import { Ministry } from "@/lib/types";
import { NewsletterForm } from "./NewsletterForm";
import { PreloaderController } from "./PreloaderController";

async function PublicHeader() {
  const ministries = await fetchPublicResource<Ministry[]>("ministries").catch(() => []);

  return (
    <header id="header-sticky" className="header-1">
      <div className="container-fluid">
        <div className="mega-menu-wrapper">
          <div className="header-main">
            <div className="header-left">
              <div className="logo">
                <a href="/" className="header-logo">
                  <img src="/assets/img/logo/logo.png" style={{ filter: "brightness(0)" }} width="200" alt="logo-img" />
                </a>
              </div>
            </div>
            <div className="mean__menu-wrapper">
              <div className="main-menu">
                <nav id="mobile-menu">
                  <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/books">Books</a></li>
                    <li><a href="/testimonials">Testimonials</a></li>
                    <li><a href="/donation">Donations</a></li>
                    <li>
                      <a href="/blogs">Ministries</a>
                      <ul className="submenu">
                        {ministries.map((ministry) => (
                          <li key={ministry.id}>
                            <a href={`/ministries/${encodeURIComponent(ministry.id)}`}>{ministry.name} Ministry</a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li><a href="/contact">Contact Us</a></li>
                  </ul>
                </nav>
              </div>
            </div>
            <div className="header-right d-flex justify-content-end align-items-center">
              <div className="header-button">
                <a href="/donation" className="theme-btn">
                  Donate Now <i className="fa-solid fa-arrow-right" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <>
      <footer className="footer-section header-bg fix pt-5">
        <div className="container">
          <div className="footer-widget-wrapper">
            <div className="row g-4 justify-content-between">
              <div className="col-xl-3 col-md-6 col-lg-2">
                <div className="single-footer-widget">
                  <div className="wid-title"><h3>Quick Links</h3></div>
                  <ul className="list-area">
                    <li><a href="/about"><i className="fa-solid fa-chevrons-right" />About US</a></li>
                    <li><a href="/donation"><i className="fa-solid fa-chevrons-right" />Donations</a></li>
                    <li><a href="/contact"><i className="fa-solid fa-chevrons-right" />Contact</a></li>
                    <li><a href="/testimonials"><i className="fa-solid fa-chevrons-right" />Testimonials</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 col-lg-2">
                <div className="single-footer-widget">
                  <div className="wid-title"><h3>Supports</h3></div>
                  <ul className="list-area">
                    <li><a href="#"><i className="fa-solid fa-chevrons-right" />Privacy Policy</a></li>
                    <li><a href="#"><i className="fa-solid fa-chevrons-right" />Terms and Conditions</a></li>
                    <li><a href="#"><i className="fa-solid fa-chevrons-right" />Support Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-6 col-md-6 col-lg-5 ps-lg-5">
                <div className="single-footer-widget">
                  <div className="wid-title"><h3>Newsletter</h3></div>
                  <div className="footer-newsletter">
                    <p>
                      Charity not only helps to reduce suffering but also fosters a sense of unity and shared responsibility in society.
                    </p>
                    <NewsletterForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-wrapper">
              <p>Copyright & Design By <span style={{ textTransform: "lowercase" }}>{new URL(appConfig.siteUrl).host}</span></p>
            </div>
          </div>
        </div>
      </footer>
      <Script src="/assets/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/viewport.jquery.js" strategy="afterInteractive" />
      <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.nice-select.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.waypoints.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.counterup.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/swiper-bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.meanmenu.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.magnific-popup.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/wow.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
}

export async function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="shortcut icon" href="/assets/img/favicon.svg" />
      <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/css/all.min.css" />
      <link rel="stylesheet" href="/assets/css/animate.css" />
      <link rel="stylesheet" href="/assets/css/magnific-popup.css" />
      <link rel="stylesheet" href="/assets/css/meanmenu.css" />
      <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
      <link rel="stylesheet" href="/assets/css/nice-select.css" />
      <link rel="stylesheet" href="/assets/css/main.css" />
      <div id="preloader" className="preloader">
        <div className="animation-preloader">
          <div className="spinner" />
          <div className="txt-loading">
            {["B", "O", "K", "S", "O", "O", "N"].map((letter, index) => (
              <span key={`${letter}-${index}`} data-text-preloader={letter} className="letters-loading">
                {letter}
              </span>
            ))}
          </div>
          <p className="text-center">Loading</p>
        </div>
        <div className="loader">
          <div className="row">
            <div className="col-3 loader-section section-left">
              <div className="bg" />
            </div>
            <div className="col-3 loader-section section-left">
              <div className="bg" />
            </div>
            <div className="col-3 loader-section section-right">
              <div className="bg" />
            </div>
            <div className="col-3 loader-section section-right">
              <div className="bg" />
            </div>
          </div>
        </div>
      </div>
      <PreloaderController />
      <button id="back-top" className="back-to-top show">
        <i className="fa-regular fa-arrow-up" />
      </button>
      <div className="mouseCursor cursor-outer" />
      <div className="mouseCursor cursor-inner" />
      {await PublicHeader()}
      {children}
      <PublicFooter />
    </>
  );
}
