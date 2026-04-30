import { ReactNode } from "react";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { User } from "@/lib/types";
import { LogoutButton } from "./LogoutButton";
import { AdminUiController } from "./AdminUiController";
import Script from "next/script";
import { headers } from "next/headers";

type MenuItem =
  | { href: string; label: string; icon: string; roles: string[]; children?: never; action?: never }
  | { label: string; icon: string; roles: string[]; children: MenuChild[]; href?: never; action?: never };

type MenuChild =
  | { href: string; label: string; icon: string; roles: string[]; action?: never }
  | { action: "logout"; label: string; icon: string; roles: string[]; href?: never };

const menuItems: MenuItem[] = [
  { href: "/admin", label: "Dashboard", icon: "ti ti-dashboard", roles: ["admin", "manager"] },
  {
    label: "Donations",
    icon: "ti ti-report-money",
    roles: ["admin", "manager"],
    children: [
      { href: "/admin/donations", label: "View All", icon: "ti ti-zoom-money", roles: ["admin", "manager"] },
      { href: "/admin/donations/new", label: "Add", icon: "ti ti-square-plus", roles: ["admin", "manager"] }
    ]
  },
  {
    label: "Transactions",
    icon: "ti ti-receipt-2",
    roles: ["admin", "manager"],
    children: [
      { href: "/admin/transactions", label: "View Transactions", icon: "ti ti-receipt-2", roles: ["admin", "manager"] },
      { href: "/admin/donors", label: "Donors", icon: "ti ti-history", roles: ["admin", "manager"] },
      { href: "/admin/donors/new", label: "Add Donor", icon: "ti ti-user-plus", roles: ["admin", "manager"] },
      { href: "/admin/transactions/new", label: "Add Transaction", icon: "ti ti-cash", roles: ["admin", "manager"] }
    ]
  },
  {
    label: "Blogs & Reviews",
    icon: "ti ti-blockquote",
    roles: ["admin", "manager", "author", "reviwer"],
    children: [
      { href: "/admin/blogs", label: "Manage Blogs", icon: "ti ti-blockquote", roles: ["admin", "manager", "author"] },
      { href: "/admin/blogs/new", label: "Add Blog", icon: "ti ti-file-diff", roles: ["admin", "manager", "author"] },
      { href: "/admin/testimonials", label: "Manage Testimonials", icon: "ti ti-message-dots", roles: ["admin", "manager", "reviwer"] },
      { href: "/admin/testimonials/new", label: "Add Testimonial", icon: "ti ti-message-plus", roles: ["admin", "manager", "reviwer"] },
      { href: "/admin/comments", label: "Manage Comments", icon: "ti ti-message-circle", roles: ["admin", "manager", "reviwer"] }
    ]
  },
  {
    label: "Books",
    icon: "ti ti-book",
    roles: ["admin", "manager", "reviwer"],
    children: [
      { href: "/admin/books", label: "View All", icon: "ti ti-stack", roles: ["admin", "manager", "reviwer"] },
      { href: "/admin/books/new", label: "Add", icon: "ti ti-book", roles: ["admin", "manager", "reviwer"] }
    ]
  },
  {
    label: "Inquiries",
    icon: "ti ti-zoom-question",
    roles: ["admin", "manager"],
    children: [
      { href: "/admin/contacts", label: "Form Submissions", icon: "ti ti-file-phone", roles: ["admin", "manager"] },
      { href: "/admin/newsletter", label: "Newsletter", icon: "ti ti-news", roles: ["admin", "manager"] }
    ]
  },
  {
    label: "Users",
    icon: "ti ti-users",
    roles: ["admin"],
    children: [
      { href: "/admin/users", label: "Manage Staff", icon: "ti ti-users", roles: ["admin"] },
      { href: "/admin/users/new", label: "Add User", icon: "ti ti-user-plus", roles: ["admin"] },
      { href: "/admin/ministries", label: "Manage Ministries", icon: "ti ti-user-exclamation", roles: ["admin"] }
    ]
  },
  {
    label: "Account",
    icon: "ti ti-settings",
    roles: ["admin", "manager", "author", "reviwer"],
    children: [
      { href: "/admin/profile", label: "Profile", icon: "ti ti-user", roles: ["admin", "manager", "author", "reviwer"] },
      { href: "/admin/trash", label: "Trash", icon: "ti ti-trash", roles: ["admin", "manager", "author", "reviwer"] },
      { action: "logout", label: "Logout", icon: "ti ti-logout", roles: ["admin", "manager", "author", "reviwer"] }
    ]
  }
];

export async function AdminShell({ children }: { children: ReactNode }) {
  const user = await fetchProtectedResource<User>("auth/me");
  const normalizedRole = user.role_name === "reviewer" ? "reviwer" : user.role_name;
  const allowedItems = menuItems
    .filter((item) => item.roles.includes(normalizedRole))
    .map((item) => {
      if (!item.children) {
        return item;
      }

      return {
        ...item,
        children: item.children.filter((child) => child.roles.includes(normalizedRole))
      };
    })
    .filter((item) => !item.children || item.children.length > 0);
  const headerStore = headers();
  const pathname =
    headerStore.get("x-admin-pathname") ||
    headerStore.get("x-pathname") ||
    headerStore.get("x-invoke-path") ||
    headerStore.get("next-url") ||
    headerStore.get("x-matched-path") ||
    "";

  const isActiveItem = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isActiveGroup = (item: MenuItem) => {
    if (!item.children) {
      return isActiveItem(item.href);
    }

    return item.children.some((child) => child.href ? isActiveItem(child.href) : false);
  };

  return (
    <>
      <link rel="icon" href="/assets/img/favicon.svg" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap" id="main-font-link" />
      <link rel="stylesheet" href="/admin-assets/css/style.css" />
      <link rel="stylesheet" href="/admin-assets/css/style-preset.css" />
      <link rel="stylesheet" href="/admin-assets/css/interactive-ui.css" />
      <link rel="stylesheet" href="/admin-assets/css/plugins/dataTables.bootstrap5.min.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/tabler-icons.min.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/feather.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/fontawesome.css" />
      <link rel="stylesheet" href="/admin-assets/fonts/material.css" />
      <AdminUiController />
      <Script id="admin-shell-body-setup" strategy="beforeInteractive">
        {`
          document.documentElement.lang = 'en';
          document.body.classList.add('admin-shell');
          document.body.setAttribute('data-pc-preset', 'preset-1');
          document.body.setAttribute('data-pc-direction', 'ltr');
          document.body.setAttribute('data-pc-theme', 'light');
        `}
      </Script>
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill" />
        </div>
      </div>
      <div className="admin-shell-bg" />
      <nav className="pc-sidebar">
        <div className="navbar-wrapper">
          <div className="m-header">
            <a href="/admin" className="b-brand text-primary admin-brand">
              <img src="/assets/img/logo/logo.png" className="admin-brand-logo" alt="logo" />
            </a>
          </div>
          <div className="navbar-content">
            <ul className="pc-navbar">
              {allowedItems.map((item) => (
                item.children ? (
                  <li className={`pc-item pc-flyout-item${isActiveGroup(item) ? " active" : ""}`} key={item.label}>
                    <button type="button" className="pc-link pc-flyout-toggle" aria-haspopup="true">
                      <span className="pc-micon"><i className={item.icon} /></span>
                      <span className="pc-mtext">{item.label}</span>
                      <span className="pc-arrow"><i className="ti ti-chevron-right" /></span>
                    </button>
                    <ul className="pc-submenu admin-sidebar-flyout">
                      {item.children.map((child) => (
                        <li className={`pc-item${child.href && isActiveItem(child.href) ? " active" : ""}`} key={child.href || child.action}>
                          {child.href ? (
                            <a href={child.href} className="pc-link">
                              <span className="pc-micon"><i className={child.icon} /></span>
                              <span className="pc-mtext">{child.label}</span>
                            </a>
                          ) : (
                            <LogoutButton className="pc-link admin-sidebar-logout" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li className={`pc-item${isActiveItem(item.href) ? " active" : ""}`} key={item.href}>
                    <a href={item.href} className="pc-link">
                      <span className="pc-micon"><i className={item.icon} /></span>
                      <span className="pc-mtext">{item.label}</span>
                    </a>
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </nav>
      <header className="pc-header">
        <div className="header-wrapper">
          <div className="me-auto pc-mob-drp">
            <ul className="list-unstyled">
              <li className="pc-h-item pc-sidebar-collapse">
                <a href="#" className="pc-head-link ms-0" id="sidebar-hide">
                  <i className="ti ti-menu-2" />
                </a>
              </li>
              <li className="pc-h-item pc-sidebar-popup">
                <a href="#" className="pc-head-link ms-0" id="mobile-collapse">
                  <i className="ti ti-menu-2" />
                </a>
              </li>
            </ul>
          </div>
          <div className="admin-header-intro">
            <span className="admin-header-kicker">Workspace</span>
            <h1 className="admin-header-title">Editorial Admin</h1>
          </div>
          <div className="ms-auto">
            <ul className="list-unstyled">
              {normalizedRole ? (
                <li className="pc-h-item">
                  <a
                    href="/admin/trash"
                    className="pc-head-link"
                    aria-label="Open trash"
                    title="Open trash"
                  >
                    <i className="ti ti-trash" />
                  </a>
                </li>
              ) : null}
              <li className="pc-h-item">
                <button type="button" className="pc-head-link theme-toggle-btn" id="theme-toggle-btn" aria-label="Switch theme" title="Switch theme">
                  <i className="ti ti-moon" id="theme-toggle-icon" />
                </button>
              </li>
              <li className="dropdown pc-h-item header-user-profile">
                <a
                  className="pc-head-link dropdown-toggle arrow-none me-0"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="false"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  <img src={user.dp_url || "/admin-assets/images/user/avatar-2.jpg"} alt="user-image" className="user-avtar userAvatarPlace" data-default-avatar="/admin-assets/images/user/avatar-2.jpg" />
                  <span className="userNamePlace">{user.name}</span>
                </a>
                <div className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown">
                  <div className="dropdown-header">
                    <div className="d-flex mb-1">
                      <div className="flex-shrink-0">
                        <img src={user.dp_url || "/admin-assets/images/user/avatar-2.jpg"} alt="user-image" className="user-avtar wid-35 userAvatarPlace" data-default-avatar="/admin-assets/images/user/avatar-2.jpg" />
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1 userNamePlace">{user.name}</h6>
                        <span className="text-muted userEmailPlace">{user.email || "No email"}</span>
                      </div>
                    </div>
                  </div>
                  <a href="/admin/profile" className="dropdown-item">
                    <i className="ti ti-user-edit" />
                    <span>My Profile</span>
                  </a>
                  <LogoutButton className="dropdown-item text-danger border-0 bg-transparent w-100 text-start" iconClassName="ti ti-power" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </header>
      <div className="pc-container">
        <div className="pc-content">
          <div className="admin-page-shell">{children}</div>
        </div>
      </div>
      <Script src="/admin-assets/js/plugins/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/plugins/popper.min.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/plugins/simplebar.min.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/plugins/bootstrap.min.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/fonts/custom-font.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/plugins/feather.min.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/pcoded.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/plugins/sweetalert2.all.min.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/interactive-ui.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/plugins/jquery.dataTables.min.js" strategy="beforeInteractive" />
      <Script src="/admin-assets/js/plugins/dataTables.bootstrap5.min.js" strategy="beforeInteractive" />
      <Script id="admin-shell-theme-init" strategy="afterInteractive">
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
