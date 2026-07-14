"use client";

import { useEffect, useRef } from "react";

/**
 * Fire-and-forget Modal warmup when user opens /app (moves cold start off first query).
 */
export function Ai2Warmup() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) {
      return;
    }
    fired.current = true;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    void fetch(`${base}/api/warmup`, { method: "GET" }).catch(() => {
      /* non-blocking */
    });
  }, []);

  return null;
}
