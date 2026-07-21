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

export type EngineStatus = "ready" | "degraded";

type EngineWarmupContextValue = {
  status: EngineStatus;
  isComposerEnabled: boolean;
  heartbeat: () => void;
  markTyping: () => void;
  markIdle: () => void;
  /** @deprecated No-op; Modal keeps one warm container. */
  wake: () => Promise<void>;
  /** @deprecated Use wake() */
  runWarmup: () => Promise<void>;
};

const EngineWarmupContext = createContext<EngineWarmupContextValue | null>(
  null
);

const HEARTBEAT_INTERVAL_MS = 60_000;

export function EngineWarmupProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EngineStatus>("ready");

  const inflight = useRef<Promise<boolean> | null>(null);
  const lastPing = useRef(0);

  const pingWarmup = useCallback(async (): Promise<boolean> => {
    if (inflight.current) {
      return inflight.current;
    }
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    inflight.current = fetch(`${base}/api/warmup`, { method: "GET" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        inflight.current = null;
      });
    const ok = await inflight.current;
    if (ok) {
      lastPing.current = Date.now();
    }
    return ok;
  }, []);

  const refreshStatus = useCallback(async () => {
    const ok = await pingWarmup();
    setStatus(ok ? "ready" : "degraded");
    return ok;
  }, [pingWarmup]);

  const heartbeat = useCallback(() => {
    const now = Date.now();
    if (now - lastPing.current < HEARTBEAT_INTERVAL_MS) {
      return;
    }
    void refreshStatus();
  }, [refreshStatus]);

  const markTyping = useCallback(() => {
    heartbeat();
  }, [heartbeat]);

  const markIdle = useCallback(() => {}, []);

  const wake = refreshStatus;
  const runWarmup = wake;

  useEffect(() => {
    void refreshStatus();
    const interval = setInterval(() => {
      void refreshStatus();
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <EngineWarmupContext.Provider
      value={{
        heartbeat,
        isComposerEnabled: true,
        markIdle,
        markTyping,
        runWarmup,
        status,
        wake,
      }}
    >
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
