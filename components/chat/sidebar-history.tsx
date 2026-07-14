"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Chat } from "@/lib/db/schema";
import {
  deleteLocalChat,
  listLocalChats,
  localChatToSidebarChat,
} from "@/lib/local-chat-history";
import { ChatItem } from "./sidebar-history-item";

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

export type ChatHistory = {
  chats: Chat[];
  hasMore: boolean;
};

/** Kept for mutate keys used elsewhere (local-first history ignores pagination). */
export function getChatHistoryPaginationKey() {
  return "ai2-local-chat-history";
}

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      lastMonth: [],
      lastWeek: [],
      older: [],
      today: [],
      yesterday: [],
    } as GroupedChats
  );
};

async function fetchLocalHistory(): Promise<Chat[]> {
  const local = await listLocalChats();
  return local.map(localChatToSidebarChat) as Chat[];
}

export function SidebarHistory({ user: _user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const id = pathname?.startsWith("/app/chat/")
    ? pathname.split("/")[3]
    : null;

  const {
    data: chats = [],
    isLoading,
    mutate,
  } = useSWR<Chat[]>(getChatHistoryPaginationKey(), fetchLocalHistory, {
    fallbackData: [],
    revalidateOnFocus: true,
  });

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = useCallback(() => {
    const chatToDelete = deleteId;
    const isCurrentChat = pathname === `/app/chat/${chatToDelete}`;

    setShowDeleteDialog(false);

    if (isCurrentChat) {
      router.replace("/app");
    }

    if (chatToDelete) {
      void deleteLocalChat(chatToDelete).then(() => mutate());
    }

    toast.success("Chat deleted");
  }, [deleteId, mutate, pathname, router]);

  const handleShowDeleteDialog = useCallback((chatId: string) => {
    setDeleteId(chatId);
    setShowDeleteDialog(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
          History
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex flex-col gap-0.5 px-1">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                className="flex h-8 items-center gap-2 rounded-lg px-2"
                key={item}
              >
                <div
                  className="h-3 max-w-(--skeleton-width) flex-1 animate-pulse rounded-md bg-sidebar-foreground/[0.06]"
                  style={
                    {
                      "--skeleton-width": `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (chats.length === 0) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
          History
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-[13px] text-sidebar-foreground/60">
            Conversations stay on this device — start chatting to save history.
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupedChats = groupChatsByDate(chats);

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
          History
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className="flex flex-col gap-4">
              {groupedChats.today.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
                    Today
                  </div>
                  {groupedChats.today.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={chat.id === id}
                      key={chat.id}
                      onDelete={handleShowDeleteDialog}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}

              {groupedChats.yesterday.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
                    Yesterday
                  </div>
                  {groupedChats.yesterday.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={chat.id === id}
                      key={chat.id}
                      onDelete={handleShowDeleteDialog}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}

              {groupedChats.lastWeek.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
                    Last 7 days
                  </div>
                  {groupedChats.lastWeek.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={chat.id === id}
                      key={chat.id}
                      onDelete={handleShowDeleteDialog}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}

              {groupedChats.lastMonth.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
                    Last 30 days
                  </div>
                  {groupedChats.lastMonth.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={chat.id === id}
                      key={chat.id}
                      onDelete={handleShowDeleteDialog}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}

              {groupedChats.older.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
                    Older
                  </div>
                  {groupedChats.older.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={chat.id === id}
                      key={chat.id}
                      onDelete={handleShowDeleteDialog}
                      setOpenMobile={setOpenMobile}
                    />
                  ))}
                </div>
              )}
            </div>
          </SidebarMenu>

          <motion.div />
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the conversation from this browser only. It cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
