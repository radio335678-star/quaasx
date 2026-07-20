"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EngineStatusBar } from "@/components/ai2/EngineStatusBar";
import { useActiveChat } from "@/hooks/use-active-chat";
import { EngineWarmupProvider } from "@/hooks/use-engine-warmup";
import type { Attachment, ChatMessage } from "@/lib/types";
import { ChatHeader } from "./chat-header";
import { DataStreamHandler } from "./data-stream-handler";
import { submitEditedMessage } from "./message-editor";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";

export function ChatShell() {
  return (
    <EngineWarmupProvider>
      <ChatShellInner />
    </EngineWarmupProvider>
  );
}

function ChatShellInner() {
  const {
    chatId,
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    addToolApprovalResponse,
    input,
    setInput,
    visibilityType,
    isReadonly,
    isLoading,
    votes,
    currentModelId,
    setCurrentModelId,
  } = useActiveChat();

  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [composerCollapsed, setComposerCollapsed] = useState(false);

  const stopRef = useRef(stop);
  stopRef.current = stop;

  const handleComposerCollapse = useCallback((collapsed: boolean) => {
    setComposerCollapsed(collapsed);
  }, []);

  const prevChatIdRef = useRef(chatId);
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId;
      stopRef.current();
      setEditingMessage(null);
      setAttachments([]);
      setComposerCollapsed(false);
    }
  }, [chatId]);

  const handleEditMessage = useCallback(
    (msg: ChatMessage) => {
      const text = msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("");
      setInput(text ?? "");
      setEditingMessage(msg);
    },
    [setInput]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setInput("");
  }, [setInput]);

  const handleSendEditedMessage = useCallback(async () => {
    if (!editingMessage) {
      return;
    }

    const msg = editingMessage;
    setEditingMessage(null);
    await submitEditedMessage({
      message: msg,
      regenerate,
      setMessages,
      text: input,
    });
    setInput("");
  }, [editingMessage, input, regenerate, setInput, setMessages]);

  return (
    <>
      <div className="flex h-dvh w-full flex-row overflow-hidden">
        <div className="flex min-w-0 w-full flex-col bg-sidebar">
          <ChatHeader
            chatId={chatId}
            isReadonly={isReadonly}
            selectedVisibilityType={visibilityType}
          />
          <EngineStatusBar />

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-tl-[12px] md:border-t md:border-l md:border-border/40">
            <Messages
              addToolApprovalResponse={addToolApprovalResponse}
              chatId={chatId}
              isArtifactVisible={false}
              isLoading={isLoading}
              isReadonly={isReadonly}
              messages={messages}
              onComposerCollapseChange={handleComposerCollapse}
              onEditMessage={handleEditMessage}
              regenerate={regenerate}
              selectedModelId={currentModelId}
              selectedVisibilityType={visibilityType}
              sendMessage={sendMessage}
              setMessages={setMessages}
              status={status}
              votes={votes}
            />

            <div
              className={`sticky bottom-0 z-10 mx-auto flex w-full max-w-6xl shrink-0 gap-2 border-t border-border/20 bg-background/95 px-2 backdrop-blur-sm transition-all duration-300 ease-out md:px-4 ${
                composerCollapsed
                  ? "max-h-14 overflow-hidden pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
                  : "max-h-[320px] pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pt-3 md:pb-4"
              }`}
              data-composer-collapsed={composerCollapsed ? "true" : "false"}
            >
              {!isReadonly && (
                <MultimodalInput
                  attachments={attachments}
                  chatId={chatId}
                  collapsed={composerCollapsed}
                  editingMessage={editingMessage}
                  input={input}
                  isLoading={isLoading}
                  messages={messages}
                  onCancelEdit={handleCancelEdit}
                  onExpandComposer={() => setComposerCollapsed(false)}
                  onModelChange={setCurrentModelId}
                  selectedModelId={currentModelId}
                  selectedVisibilityType={visibilityType}
                  sendMessage={
                    editingMessage ? handleSendEditedMessage : sendMessage
                  }
                  setAttachments={setAttachments}
                  setInput={setInput}
                  setMessages={setMessages}
                  status={status}
                  stop={stop}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <DataStreamHandler />
    </>
  );
}
