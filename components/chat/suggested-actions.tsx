"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { DemoHero } from "@/components/ai2/DemoHero";
import { DemoBadge } from "@/components/ai2/DemoBadge";
import { EXAMPLE_DEMOS } from "@/lib/ai2/demos";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "../ai-elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const handleDemoClick = useCallback(
    (demo: (typeof EXAMPLE_DEMOS)[number]) => {
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
    [chatId, sendMessage]
  );

  return (
    <div className="flex w-full flex-col gap-4" data-testid="suggested-actions">
      <DemoHero chatId={chatId} sendMessage={sendMessage} />

      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          Or try an example
        </p>
        <div
          className="-mx-1 flex gap-2.5 overflow-x-auto overscroll-x-contain pb-1 snap-x snap-mandatory px-1"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {EXAMPLE_DEMOS.map((demo, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="min-w-[min(85vw,220px)] shrink-0 snap-start sm:min-w-[200px]"
              exit={{ opacity: 0, y: 16 }}
              initial={{ opacity: 0, y: 16 }}
              key={demo.id}
              transition={{
                delay: 0.06 * index,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Suggestion
                className="flex h-auto min-h-[44px] w-full flex-col items-start gap-1.5 rounded-xl border border-border/50 bg-card/30 px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/60 hover:shadow-[var(--shadow-card)] touch-manipulation"
                onClick={() => handleDemoClick(demo)}
                suggestion={demo.query}
              >
                <DemoBadge kind="example" />
                <span className="text-[12px] font-medium leading-snug text-foreground">
                  {demo.title}
                </span>
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  {demo.subtitle}
                </span>
              </Suggestion>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    return true;
  }
);
