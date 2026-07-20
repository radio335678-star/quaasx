"use client";

import { useEffect } from "react";

/** Web-X uses a light shell; restore AI² dark theme when leaving /app/web-x. */
export function WebXThemeReset() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");

    return () => {
      root.classList.remove("light");
      root.classList.add("dark");
      document.body.removeAttribute("style");
    };
  }, []);

  return null;
}
