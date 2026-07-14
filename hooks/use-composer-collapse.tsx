"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Collapse the sticky composer when the user scrolls down the transcript,
 * expand again on scroll up — same pattern as ChatGPT / Claude mobile UIs.
 */
export function useComposerCollapse(enabled = true) {
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollTop = useRef(0);
  const ticking = useRef(false);

  const onScroll = useCallback(
    (scrollTop: number) => {
      if (!enabled) {
        setCollapsed(false);
        return;
      }
      if (ticking.current) {
        return;
      }
      ticking.current = true;
      requestAnimationFrame(() => {
        const delta = scrollTop - lastScrollTop.current;
        const nearTop = scrollTop < 48;

        if (nearTop) {
          setCollapsed(false);
        } else if (delta > 8) {
          setCollapsed(true);
        } else if (delta < -8) {
          setCollapsed(false);
        }

        lastScrollTop.current = scrollTop;
        ticking.current = false;
      });
    },
    [enabled]
  );

  const reset = useCallback(() => {
    lastScrollTop.current = 0;
    setCollapsed(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setCollapsed(false);
    }
  }, [enabled]);

  return { collapsed, onScroll, reset };
}
