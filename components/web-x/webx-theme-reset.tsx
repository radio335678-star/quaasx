"use client";

import { useEffect } from "react";

/** Web-X uses a light Google-style shell; keep it readable inside AI²'s dark default theme. */
export function WebXThemeReset() {
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("dark");
    root.classList.add("light");
    document.body.style.background = "#ffffff";
    document.body.style.color = "#202124";

    return () => {
      root.classList.remove("light");
      if (hadDark) {
        root.classList.add("dark");
      }
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);

  return null;
}
