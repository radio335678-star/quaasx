"use client";

import { PlayIcon } from "lucide-react";
import { useCallback } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { HERO_DEMO } from "@/lib/ai2/demos";
import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import type { ChatMessage } from "@/lib/types";

type DemoHeroProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
};

export function DemoHero({ chatId, sendMessage }: DemoHeroProps) {
  const { runWarmup, status } = useEngineWarmup();

  const runDemo = useCallback(() => {
    window.history.pushState(
      {},
      "",
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/app/chat/${chatId}`
    );
    sendMessage({
      metadata: {
        createdAt: new Date().toISOString(),
        demoId: HERO_DEMO.id,
        demoKind: HERO_DEMO.kind,
      },
      parts: [{ text: HERO_DEMO.query, type: "text" }],
      role: "user",
    });
  }, [chatId, sendMessage]);

  const handlePrefetch = useCallback(() => {
    if (status !== "ready" && status !== "warming") {
      void runWarmup();
    }
  }, [runWarmup, status]);

  return (
    <article
      className="w-full rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/10 to-card/40 p-4 shadow-[var(--shadow-card)] sm:p-5"
      data-testid="demo-hero"
      onFocus={handlePrefetch}
      onMouseEnter={handlePrefetch}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-800/80 dark:text-amber-200/80">
        30-second demo
      </p>
      <h3 className="mt-1 font-semibold text-base text-foreground sm:text-lg">
        {HERO_DEMO.title}
      </h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
        Side-by-side classical citations — same live engine as your questions.
      </p>
      <Button
        className="mt-4 h-12 min-h-[48px] w-full touch-manipulation text-sm font-semibold sm:w-auto sm:px-8"
        data-testid="demo-hero-run"
        onClick={runDemo}
        type="button"
      >
        <PlayIcon className="mr-2 size-4" />
        Run demo
      </Button>
      <p className="mt-2 text-[10px] text-muted-foreground/70">
        Curated demo query · live corpus
      </p>
    </article>
  );
}
