"use client";

import type { Ai2AnswerLayout } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";

const OPTION_RE = /\(([A-D])\)\s*([^\n(]+)/gi;

function parseOptions(text: string): { key: string; text: string }[] {
  const options: { key: string; text: string }[] = [];
  for (const match of text.matchAll(OPTION_RE)) {
    const key = match[1]?.toUpperCase();
    const body = match[2]?.trim();
    if (key && body) {
      options.push({ key, text: body });
    }
  }
  return options;
}

function looksLikeMcq(text: string | undefined): boolean {
  if (!text) {
    return false;
  }
  return /\([A-D]\)/i.test(text);
}

export function ExamModePanel({
  layout,
  className,
}: {
  layout: Ai2AnswerLayout;
  className?: string;
}) {
  const answer = layout.direct_answer?.trim() ?? "";
  const isExam =
    layout.layout_type === "mcq_exam" || looksLikeMcq(answer);

  if (!isExam || !answer) {
    return null;
  }

  const options = parseOptions(answer);
  const stem =
    options.length >= 2
      ? answer.slice(0, answer.search(/\([A-D]\)/i)).trim()
      : "";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-muted/20 px-3.5 py-3",
        className
      )}
      data-testid="exam-mode-panel"
    >
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Exam
      </p>
      {stem ? (
        <p className="mb-2.5 text-sm leading-relaxed text-foreground">{stem}</p>
      ) : null}
      {options.length >= 2 ? (
        <ul className="space-y-1.5">
          {options.map((opt) => (
            <li
              className="flex gap-2 rounded-md bg-background/50 px-2.5 py-1.5 text-[13px] leading-relaxed"
              key={opt.key}
            >
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                ({opt.key})
              </span>
              <span className="text-foreground/90">{opt.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-border/40 bg-background/40 px-3 py-2">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
