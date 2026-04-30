import Script from "next/script";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <>
      <link rel="icon" href="/assets/img/favicon.svg" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap" />
      <link rel="stylesheet" href="/admin-assets/css/style.css" />
      <link rel="stylesheet" href="/admin-assets/css/style-preset.css" />
      <link rel="stylesheet" href="/admin-assets/css/interactive-ui.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/tabler-icons.min.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/feather.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/fontawesome.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/material.css" />
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill" />
        </div>
      </div>
      <Script id="admin-login-body-setup" strategy="beforeInteractive">
        {`
          document.documentElement.lang = 'en';
          document.body.classList.add('admin-shell');
          document.body.setAttribute('data-pc-theme', 'light');
        `}
      </Script>
      <div className="auth-main admin-shell" data-pc-theme="light">
        <div className="auth-wrapper v3">
          <div className="auth-form">
            <div className="auth-header">
              <div className="auth-header-row">
                <div className="admin-brand auth-brand-mark">
                  <img src="/assets/img/logo/logo.png" className="admin-brand-logo" alt="logo" />
                  <span className="admin-brand-copy">
                    <strong>Boksoon Kim</strong>
                    <small>Admin Panel</small>
                  </span>
                </div>
                <h1 className="auth-brand-title">Welcome back</h1>
                <p className="auth-brand-copy">Secure access to campaigns, publishing, and operations.</p>
              </div>
            </div>
            <div className="card my-5">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-end mb-4">
                  <h3 className="mb-0"><b>Sign in</b></h3>
                </div>
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Script src="/admin-assets/js/plugins/jquery.min.js" strategy="afterInteractive" />
      <Script src="/admin-assets/js/plugins/popper.min.js" strategy="afterInteractive" />
      <Script src="/admin-assets/js/plugins/simplebar.min.js" strategy="afterInteractive" />
      <Script src="/admin-assets/js/plugins/bootstrap.min.js" strategy="afterInteractive" />
      <Script src="/admin-assets/js/pcoded.js" strategy="afterInteractive" />
      <Script src="/admin-assets/js/plugins/feather.min.js" strategy="afterInteractive" />
      <Script src="/admin-assets/js/interactive-ui.js" strategy="afterInteractive" />
      <Script id="admin-login-theme-init" strategy="afterInteractive">
        {`
          (function () {
            var savedTheme = null;
            try {
              savedTheme = localStorage.getItem('adminTheme');
            } catch (e) {
              savedTheme = null;
            }

            if (typeof layout_change === 'function') {
              if (savedTheme === 'dark' || savedTheme === 'light') {
                layout_change(savedTheme);
              } else {
                layout_change('light');
              }
            }

            if (typeof change_box_container === 'function') change_box_container('false');
            if (typeof layout_rtl_change === 'function') layout_rtl_change('false');
            if (typeof preset_change === 'function') preset_change('preset-1');
            if (typeof font_change === 'function') font_change('Manrope');
            document.body.classList.add('admin-shell-ready');
          })();
        `}
      </Script>
    </>
  );
}
