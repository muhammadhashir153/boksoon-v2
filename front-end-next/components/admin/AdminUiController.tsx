"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    SimpleBar?: new (element: Element) => unknown;
    feather?: { replace: () => void };
    layout_change?: (theme: string) => void;
    initAdminUploadFields?: () => void;
  }
}

function getStoredTheme() {
  try {
    const value = window.localStorage.getItem("adminTheme");
    return value === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function setTheme(theme: "light" | "dark") {
  if (typeof window.layout_change === "function") {
    window.layout_change(theme);
  } else {
    document.body.setAttribute("data-pc-theme", theme);
  }

  document.body.setAttribute("data-pc-theme", theme);

  try {
    window.localStorage.setItem("adminTheme", theme);
  } catch {
    return;
  }
}

function syncThemeToggle() {
  const icon = document.getElementById("theme-toggle-icon");
  const button = document.getElementById("theme-toggle-btn");
  const isDark = document.body.getAttribute("data-pc-theme") === "dark";

  if (icon) {
    icon.className = isDark ? "ti ti-sun" : "ti ti-moon";
  }

  if (button) {
    const label = isDark ? "Switch to light theme" : "Switch to dark theme";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }
}

export function AdminUiController() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = "en";
    document.body.classList.add("admin-shell", "admin-shell-ready");
    document.body.setAttribute("data-pc-preset", "preset-1");
    document.body.setAttribute("data-pc-direction", "ltr");
    setTheme(getStoredTheme());
    syncThemeToggle();

    window.requestAnimationFrame(() => {
      const loader = document.querySelector(".loader-bg");
      if (loader) {
        loader.remove();
      }
    });

    if (window.feather && typeof window.feather.replace === "function") {
      window.feather.replace();
    }

    const navbarContent = document.querySelector(".navbar-content");
    if (
      navbarContent &&
      window.SimpleBar &&
      !navbarContent.querySelector(".simplebar-content-wrapper")
    ) {
      new window.SimpleBar(navbarContent);
    }

    const sidebar = document.querySelector(".pc-sidebar");
    const removeOverlay = () => {
      sidebar?.classList.remove("mob-sidebar-active");
      sidebar?.querySelector(".pc-menu-overlay")?.remove();
    };

    const ensureOverlay = () => {
      if (!sidebar || sidebar.querySelector(".pc-menu-overlay")) {
        return;
      }

      const overlay = document.createElement("div");
      overlay.className = "pc-menu-overlay";
      overlay.addEventListener("click", removeOverlay);
      sidebar.appendChild(overlay);
    };

    const handleThemeToggle = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const nextTheme = document.body.getAttribute("data-pc-theme") === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      syncThemeToggle();
    };

    const handleSidebarToggle = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      sidebar?.classList.toggle("pc-sidebar-hide");
    };

    const handleMobileToggle = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (!sidebar) {
        return;
      }

      if (sidebar.classList.contains("mob-sidebar-active")) {
        removeOverlay();
      } else {
        sidebar.classList.add("mob-sidebar-active");
        ensureOverlay();
      }
    };

    const closeFlyouts = (except?: Element) => {
      document.querySelectorAll(".pc-flyout-item.is-open").forEach((item) => {
        if (item !== except) {
          item.classList.remove("is-open");
        }
      });
    };

    const handleFlyoutToggle = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const toggle = event.currentTarget as HTMLElement | null;
      const item = toggle?.closest(".pc-flyout-item");

      if (!item) {
        return;
      }

      const shouldOpen = !item.classList.contains("is-open");
      closeFlyouts(item);
      item.classList.toggle("is-open", shouldOpen);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;

      if (!target?.closest(".pc-flyout-item")) {
        closeFlyouts();
      }
    };

    const themeButton = document.getElementById("theme-toggle-btn");
    const sidebarButton = document.getElementById("sidebar-hide");
    const mobileButton = document.getElementById("mobile-collapse");
    const flyoutButtons = Array.from(document.querySelectorAll(".pc-flyout-toggle"));

    themeButton?.addEventListener("click", handleThemeToggle, true);
    sidebarButton?.addEventListener("click", handleSidebarToggle, true);
    mobileButton?.addEventListener("click", handleMobileToggle, true);
    flyoutButtons.forEach((button) => {
      button.addEventListener("click", handleFlyoutToggle, true);
    });
    document.addEventListener("click", handleDocumentClick);

    return () => {
      themeButton?.removeEventListener("click", handleThemeToggle, true);
      sidebarButton?.removeEventListener("click", handleSidebarToggle, true);
      mobileButton?.removeEventListener("click", handleMobileToggle, true);
      flyoutButtons.forEach((button) => {
        button.removeEventListener("click", handleFlyoutToggle, true);
      });
      document.removeEventListener("click", handleDocumentClick);
      removeOverlay();
      closeFlyouts();
    };
  }, []);

  useEffect(() => {
    let stopped = false;

    const refreshSession = async () => {
      if (stopped) {
        return;
      }

      try {
        await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            Accept: "application/json"
          }
        });
      } catch {
        // Ignore transient failures; route guards handle invalid sessions.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    };

    // Keep session alive while admin panel is actively used.
    void refreshSession();
    const intervalId = window.setInterval(() => {
      void refreshSession();
    }, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (typeof window.initAdminUploadFields === "function") {
        window.initAdminUploadFields();
      }

      document.querySelectorAll(".pc-flyout-item.is-open").forEach((item) => {
        item.classList.remove("is-open");
      });
    });
  }, [pathname]);

  return null;
}
