import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowDownIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useComposerCollapse } from "@/hooks/use-composer-collapse";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { EmptyState } from "./empty-state";
import { PreviewMessage, ThinkingMessage } from "./message";
import type { VisibilityType } from "./visibility-selector";

type MessagesProps = {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  isArtifactVisible: boolean;
  isLoading?: boolean;
  selectedModelId: string;
  onEditMessage?: (message: ChatMessage) => void;
  onComposerCollapseChange?: (collapsed: boolean) => void;
};

function PureMessages({
  addToolApprovalResponse,
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  sendMessage,
  selectedVisibilityType,
  isReadonly,
  isArtifactVisible,
  isLoading,
  selectedModelId: _selectedModelId,
  onEditMessage,
  onComposerCollapseChange,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
    reset,
  } = useMessages({
    status,
  });

  const { collapsed, onScroll, reset: resetComposerCollapse } =
    useComposerCollapse(messages.length > 0);

  useDataStream();

  const prevChatIdRef = useRef(chatId);
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId;
      reset();
      resetComposerCollapse();
    }
  }, [chatId, reset, resetComposerCollapse]);

  useEffect(() => {
    onComposerCollapseChange?.(collapsed);
  }, [collapsed, onComposerCollapseChange]);

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom("smooth");
  }, [scrollToBottom]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el || messages.length === 0) {
      return;
    }
    const handle = () => onScroll(el.scrollTop);
    el.addEventListener("scroll", handle, { passive: true });
    return () => el.removeEventListener("scroll", handle);
  }, [messages.length, messagesContainerRef, onScroll]);

  const isEmpty = messages.length === 0 && !isLoading && !isReadonly;
  const hasCompare =
    messages.some((m) => {
      const part = m.parts?.find((p) => p.type === "data-ai2-answer");
      const data = part?.data as { layout_type?: string } | undefined;
      return data?.layout_type === "clinical_compare";
    }) ||
    messages.some((m) => m.metadata?.demoKind === "hero");

  if (isEmpty) {
    return (
      <div className="relative flex min-h-0 flex-1 bg-background">
        <EmptyState
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          sendMessage={sendMessage}
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 bg-background">
      <div
        className={cn(
          "absolute inset-0 touch-pan-y overflow-y-auto",
          messages.length > 0 ? "bg-background" : "bg-transparent"
        )}
        ref={messagesContainerRef}
        style={isArtifactVisible ? { scrollbarWidth: "none" } : undefined}
      >
        <div
          className={cn(
            "mx-auto flex min-h-full min-w-0 flex-col gap-5 px-2 py-6 md:gap-7 md:px-4",
            hasCompare ? "max-w-6xl" : "max-w-4xl"
          )}
        >
          {messages.map((message, index) => {
            const prev = index > 0 ? messages[index - 1] : undefined;
            const replyToDemoKind =
              message.role === "assistant" &&
              prev?.role === "user" &&
              prev.metadata?.demoKind
                ? prev.metadata.demoKind
                : undefined;
            return (
              <PreviewMessage
                addToolApprovalResponse={addToolApprovalResponse}
                chatId={chatId}
                isLoading={
                  status === "streaming" && messages.length - 1 === index
                }
                isReadonly={isReadonly}
                key={message.id}
                message={message}
                onEdit={onEditMessage}
                regenerate={regenerate}
                replyToDemoKind={replyToDemoKind}
                requiresScrollPadding={
                  hasSentMessage && index === messages.length - 1
                }
                setMessages={setMessages}
                vote={
                  votes
                    ? votes.find((vote) => vote.messageId === message.id)
                    : undefined
                }
              />
            );
          })}

          {status === "submitted" && messages.at(-1)?.role !== "assistant" && (
            <ThinkingMessage />
          )}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </div>
      </div>

      <button
        aria-label="Scroll to bottom"
        className={`absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center rounded-full border border-border/50 bg-card/90 px-3.5 shadow-[var(--shadow-float)] backdrop-blur-lg transition-all duration-200 h-7 text-[10px] ${
          isAtBottom
            ? "pointer-events-none scale-90 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={handleScrollToBottom}
        type="button"
      >
        <ArrowDownIcon className="size-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export const Messages = PureMessages;
