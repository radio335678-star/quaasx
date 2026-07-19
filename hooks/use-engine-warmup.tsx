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

export type EngineStatus = "asleep" | "waking" | "awake" | "degraded";

type EngineWarmupContextValue = {
  status: EngineStatus;
  wakeCountdown: number | null;
  isComposerEnabled: boolean;
  wake: () => Promise<void>;
  heartbeat: () => void;
  markTyping: () => void;
  markIdle: () => void;
  /** @deprecated Use wake() */
  runWarmup: () => Promise<void>;
};

const EngineWarmupContext = createContext<EngineWarmupContextValue | null>(
  null
);

const WAKE_COUNTDOWN_SEC = 7;
// Modal scaledown_window is 180s — heartbeat well inside it, sleep in sync with it.
const HEARTBEAT_INTERVAL_MS = 60_000;
const IDLE_SLEEP_MS = 180_000;

export function EngineWarmupProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EngineStatus>("asleep");
  const [wakeCountdown, setWakeCountdown] = useState<number | null>(null);
  const [composerUnlocked, setComposerUnlocked] = useState(false);

  const inflight = useRef<Promise<boolean> | null>(null);
  const lastPing = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeCountdownTimer = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const wakeWaiters = useRef<Array<() => void>>([]);
  const wakingRef = useRef(false);

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const clearWakeCountdownTimer = useCallback(() => {
    if (wakeCountdownTimer.current) {
      clearInterval(wakeCountdownTimer.current);
      wakeCountdownTimer.current = null;
    }
  }, []);

  const notifyWakeWaiters = useCallback(() => {
    for (const resolve of wakeWaiters.current) {
      resolve();
    }
    wakeWaiters.current = [];
  }, []);

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

  const scheduleIdleSleep = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => {
      wakingRef.current = false;
      setStatus("asleep");
      setComposerUnlocked(false);
      setWakeCountdown(null);
      clearWakeCountdownTimer();
    }, IDLE_SLEEP_MS);
  }, [clearIdleTimer, clearWakeCountdownTimer]);

  const heartbeat = useCallback(() => {
    if (
      status !== "awake" &&
      status !== "waking" &&
      status !== "degraded"
    ) {
      return;
    }
    const now = Date.now();
    if (now - lastPing.current < HEARTBEAT_INTERVAL_MS) {
      return;
    }
    void pingWarmup();
  }, [pingWarmup, status]);

  const markTyping = useCallback(() => {
    clearIdleTimer();
    if (status === "awake" || status === "degraded") {
      scheduleIdleSleep();
      heartbeat();
    }
  }, [clearIdleTimer, heartbeat, scheduleIdleSleep, status]);

  const markIdle = useCallback(() => {
    if (status !== "awake" && status !== "degraded") {
      return;
    }
    scheduleIdleSleep();
  }, [scheduleIdleSleep, status]);

  const waitForComposer = useCallback((): Promise<void> => {
    if (composerUnlocked) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      wakeWaiters.current.push(resolve);
    });
  }, [composerUnlocked]);

  const unlockComposer = useCallback(() => {
    clearWakeCountdownTimer();
    setWakeCountdown(null);
    setComposerUnlocked(true);
    notifyWakeWaiters();
  }, [clearWakeCountdownTimer, notifyWakeWaiters]);

  const startWakeCountdown = useCallback(() => {
    clearWakeCountdownTimer();
    setWakeCountdown(WAKE_COUNTDOWN_SEC);
    let remaining = WAKE_COUNTDOWN_SEC;
    wakeCountdownTimer.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        unlockComposer();
        return;
      }
      setWakeCountdown(remaining);
    }, 1000);
  }, [clearWakeCountdownTimer, unlockComposer]);

  const wake = useCallback(async () => {
    if (status === "awake" || status === "degraded") {
      return;
    }
    if (status === "waking" || wakingRef.current) {
      await waitForComposer();
      return;
    }

    wakingRef.current = true;
    setStatus("waking");
    setComposerUnlocked(false);
    clearIdleTimer();
    startWakeCountdown();

    const healthOk = await pingWarmup();
    setStatus(healthOk ? "awake" : "degraded");
    // Container answered — no reason to keep the user waiting on the timer.
    unlockComposer();
    scheduleIdleSleep();
  }, [
    clearIdleTimer,
    pingWarmup,
    scheduleIdleSleep,
    startWakeCountdown,
    status,
    unlockComposer,
    waitForComposer,
  ]);

  const runWarmup = wake;

  const isComposerEnabled = composerUnlocked;

  useEffect(() => {
    return () => {
      clearIdleTimer();
      clearWakeCountdownTimer();
    };
  }, [clearIdleTimer, clearWakeCountdownTimer]);

  return (
    <EngineWarmupContext.Provider
      value={{
        heartbeat,
        isComposerEnabled,
        markIdle,
        markTyping,
        runWarmup,
        status,
        wake,
        wakeCountdown,
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
