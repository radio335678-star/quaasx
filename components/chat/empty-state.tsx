"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { DemoBadge } from "@/components/ai2/DemoBadge";
import { DemoHero } from "@/components/ai2/DemoHero";
import { SleepWakeCard } from "@/components/ai2/SleepWakeCard";
import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import { type DemoPrompt, EXAMPLE_DEMOS } from "@/lib/ai2/demos";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "../ai-elements/suggestion";
import { Greeting } from "./greeting";
import type { VisibilityType } from "./visibility-selector";

const DEMO_DISMISS_KEY = "ai2-demo-hero-dismissed";

type EmptyStateProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function ExampleDemoCard({
  demo,
  index,
  onSelect,
}: {
  demo: DemoPrompt;
  index: number;
  onSelect: (demo: DemoPrompt) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(demo);
  }, [demo, onSelect]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 14 }}
      transition={{
        delay: 0.08 * index + 0.2,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Suggestion
        className="flex h-full min-h-[48px] w-full flex-col items-start gap-1.5 rounded-xl border border-border/50 bg-card/30 px-3.5 py-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/60 hover:shadow-[var(--shadow-card)] touch-manipulation active:scale-[0.99]"
        onClick={handleClick}
        suggestion={demo.query}
      >
        <DemoBadge kind="example" />
        <span className="text-[13px] font-medium leading-snug text-foreground">
          {demo.title}
        </span>
        <span className="text-[11px] leading-relaxed text-muted-foreground">
          {demo.subtitle}
        </span>
      </Suggestion>
    </motion.div>
  );
}

function PureEmptyState({ chatId, sendMessage }: EmptyStateProps) {
  const { isComposerEnabled, wake } = useEngineWarmup();
  const [demoVisible, setDemoVisible] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setDemoVisible(localStorage.getItem(DEMO_DISMISS_KEY) !== "1");
    } catch {
      setDemoVisible(true);
    }
    setHydrated(true);
  }, []);

  const updateScrollCue = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollCue(remaining > 48);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateScrollCue();
    const onScroll = () => updateScrollCue();
    el.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollCue);
    resizeObserver.observe(el);
    window.addEventListener("resize", updateScrollCue);
    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollCue);
    };
  }, [hydrated, updateScrollCue]);

  const dismissDemo = useCallback(() => {
    setDemoVisible(false);
    try {
      localStorage.setItem(DEMO_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    requestAnimationFrame(updateScrollCue);
  }, [updateScrollCue]);

  const scrollDown = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollBy({
      behavior: "smooth",
      top: Math.min(280, el.clientHeight * 0.55),
    });
  }, []);

  const handleDemoClick = useCallback(
    async (demo: DemoPrompt) => {
      if (!isComposerEnabled) {
        await wake();
      }
      window.history.pushState(
        {},
        "",
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/app/chat/${chatId}`
      );
      sendMessage({
        metadata: {
          createdAt: new Date().toISOString(),
          demoId: demo.id,
          demoKind: demo.kind,
        },
        parts: [{ text: demo.query, type: "text" }],
        role: "user",
      });
    },
    [chatId, isComposerEnabled, sendMessage, wake]
  );

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col"
      data-testid="empty-state"
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        ref={scrollRef}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 pb-6 pt-4 sm:gap-6 sm:px-4 sm:pb-8 sm:pt-6 md:pt-8">
          <Greeting />

          {!isComposerEnabled ? (
            <SleepWakeCard />
          ) : null}

          {hydrated && demoVisible && isComposerEnabled ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{
                delay: 0.15,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <DemoHero
                chatId={chatId}
                onDismiss={dismissDemo}
                sendMessage={sendMessage}
              />
            </motion.div>
          ) : null}

          {isComposerEnabled ? (
            <div data-testid="suggested-actions">
              <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {hydrated && !demoVisible
                  ? "Try an example"
                  : "Or try an example"}
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {EXAMPLE_DEMOS.map((demo, index) => (
                  <ExampleDemoCard
                    demo={demo}
                    index={index}
                    key={demo.id}
                    onSelect={handleDemoClick}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <button
        aria-label="Scroll down"
        className={`absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/50 bg-card/95 px-3.5 py-2 text-[11px] font-medium text-muted-foreground shadow-[var(--shadow-float)] backdrop-blur-md transition-all duration-300 touch-manipulation ${
          showScrollCue
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
        data-testid="scroll-down-cue"
        onClick={scrollDown}
        type="button"
      >
        <span>Scroll</span>
        <ChevronDownIcon className="size-3.5 animate-bounce" />
      </button>
    </div>
  );
}

export const EmptyState = memo(PureEmptyState, (prevProps, nextProps) => {
  if (prevProps.chatId !== nextProps.chatId) {
    return false;
  }
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
    return false;
  }
  return true;
});
