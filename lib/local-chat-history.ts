/**
 * Local-first chat history (IndexedDB). No Auth.js / Postgres required.
 * Accounts/sync deferred — this persists threads in the same browser only.
 */

import type { ChatMessage } from "@/lib/types";

const DB_NAME = "ai2-local-chats";
const DB_VERSION = 1;
const STORE = "chats";

export type LocalChat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  visibility: "private" | "public";
  messages: ChatMessage[];
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

function titleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const text =
    firstUser?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => ("text" in p ? String(p.text) : ""))
      .join(" ")
      .trim() || "New chat";
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

export async function listLocalChats(): Promise<LocalChat[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as LocalChat[]) ?? [];
      rows.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getLocalChat(id: string): Promise<LocalChat | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as LocalChat) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocalChat(params: {
  id: string;
  messages: ChatMessage[];
  visibility?: "private" | "public";
  createdAt?: string;
}): Promise<LocalChat> {
  const existing = await getLocalChat(params.id).catch(() => null);
  const now = new Date().toISOString();
  const chat: LocalChat = {
    id: params.id,
    title: titleFromMessages(params.messages),
    createdAt: existing?.createdAt ?? params.createdAt ?? now,
    updatedAt: now,
    visibility: params.visibility ?? existing?.visibility ?? "private",
    messages: params.messages,
  };
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(chat);
    tx.oncomplete = () => resolve(chat);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteLocalChat(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAllLocalChats(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Shape compatible with sidebar Chat history UI */
export function localChatToSidebarChat(chat: LocalChat) {
  return {
    id: chat.id,
    title: chat.title,
    createdAt: new Date(chat.createdAt),
    userId: "local",
    visibility: chat.visibility,
  };
}
