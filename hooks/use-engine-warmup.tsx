"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type EngineStatus = "idle" | "warming" | "ready" | "degraded";

type EngineWarmupContextValue = {
  status: EngineStatus;
  runWarmup: () => Promise<void>;
};

const EngineWarmupContext = createContext<EngineWarmupContextValue | null>(
  null
);

const READY_FADE_MS = 5000;

export function EngineWarmupProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EngineStatus>("idle");
  const inflight = useRef<Promise<void> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runWarmup = useCallback(async () => {
    if (inflight.current) {
      return inflight.current;
    }
    setStatus("warming");
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    inflight.current = fetch(`${base}/api/warmup`, { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          setStatus("degraded");
          return;
        }
        setStatus("ready");
        if (fadeTimer.current) {
          clearTimeout(fadeTimer.current);
        }
        fadeTimer.current = setTimeout(() => {
          setStatus("idle");
        }, READY_FADE_MS);
      })
      .catch(() => {
        setStatus("degraded");
      })
      .finally(() => {
        inflight.current = null;
      });
    return inflight.current;
  }, []);

  useEffect(() => {
    void runWarmup();
    return () => {
      if (fadeTimer.current) {
        clearTimeout(fadeTimer.current);
      }
    };
  }, [runWarmup]);

  return (
    <EngineWarmupContext.Provider value={{ status, runWarmup }}>
      {children}
    </EngineWarmupContext.Provider>
  );
}

export function useEngineWarmup() {
  const ctx = useContext(EngineWarmupContext);
  if (!ctx) {
    throw new Error("useEngineWarmup must be used within EngineWarmupProvider");
  }
  return ctx;
}
