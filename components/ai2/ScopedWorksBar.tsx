"use client";

import type { ScopedWorkEntry } from "@/lib/ai2/types";

type ScopedWorksBarProps = {
  works: ScopedWorkEntry[];
  className?: string;
  variant?: "answer" | "user";
};

/** Hidden — chat should feel like a native model, not a RAG scope chip. */
export function ScopedWorksBar(_props: ScopedWorksBarProps) {
  return null;
}
