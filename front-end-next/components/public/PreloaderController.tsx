"use client";

import { useEffect } from "react";

function hidePreloader() {
  const preloader = document.querySelector<HTMLElement>(".preloader");
  if (!preloader) {
    return;
  }

  preloader.classList.add("loaded");
  window.setTimeout(() => {
    preloader.style.display = "none";
  }, 250);
}

export function PreloaderController() {
  useEffect(() => {
    if (document.readyState === "complete") {
      hidePreloader();
      return;
    }

    const onLoad = () => hidePreloader();
    window.addEventListener("load", onLoad);

    const fallbackTimer = window.setTimeout(() => {
      hidePreloader();
    }, 1200);

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return null;
}
