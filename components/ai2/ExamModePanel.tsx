"use client";

import type { Ai2AnswerLayout, ExamSlots, ExamVerdict } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";

const OPTION_RE = /\(([A-D])\)\s*([^\n(]+)/gi;
const OPTION_LINE_RE = /^\s*([A-D])[).:]\s+(.+)$/gim;

function parseOptions(text: string): { key: string; text: string }[] {
  const options: { key: string; text: string }[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(OPTION_RE)) {
    const key = match[1]?.toUpperCase();
    const body = match[2]?.trim();
    if (key && body && !seen.has(key)) {
      seen.add(key);
      options.push({ key, text: body });
    }
  }
  for (const match of text.matchAll(OPTION_LINE_RE)) {
    const key = match[1]?.toUpperCase();
    const body = match[2]?.trim();
    if (key && body && !seen.has(key)) {
      seen.add(key);
      options.push({ key, text: body });
    }
  }
  return options;
}

function slotOptions(exam?: ExamSlots): { key: string; text: string }[] {
  if (!exam?.options?.length) {
    return [];
  }
  return exam.options
    .filter((o) => o?.label && o?.text)
    .map((o) => ({ key: String(o.label).toUpperCase(), text: String(o.text) }));
}

function looksLikeMcq(text: string | undefined): boolean {
  if (!text) {
    return false;
  }
  return /\([A-D]\)/i.test(text) || /^\s*[A-D][).:]/m.test(text);
}

function looksLikeMatch(text: string | undefined): boolean {
  if (!text) {
    return false;
  }
  return /match\s+the\s+following|list\s+i\b|column\s+[ab]\b|pairing|सुमेलित/i.test(
    text
  );
}

function looksLikeFillBlank(text: string | undefined): boolean {
  if (!text) {
    return false;
  }
  return /fill\s+in\s+the\s+blank|रिक्त\s*स्थान|_{3,}|\.{4,}/i.test(text);
}

function parseMatchPairs(text: string): { left: string; right: string }[] {
  const pairs: { left: string; right: string }[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(
      /^\s*(?:\d+[).:]|[A-Da-d][).:])?\s*(.+?)\s*(?:→|->|—|:|=)\s*(.+?)\s*$/
    );
    if (m?.[1] && m[2] && m[1].length < 80 && m[2].length < 80) {
      pairs.push({ left: m[1].trim(), right: m[2].trim() });
    }
  }
  return pairs.slice(0, 8);
}

function VerdictBanner({ verdict }: { verdict?: ExamVerdict }) {
  if (!verdict?.status) {
    return null;
  }
  if (verdict.status === "insufficient_evidence") {
    return (
      <p className="mb-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[12px] text-amber-900 dark:text-amber-100">
        Insufficient classical evidence — no forced guess
      </p>
    );
  }
  if (verdict.status === "answered" && verdict.chosen_option) {
    return (
      <p className="mb-2 text-[12px] text-muted-foreground">
        Cite-backed answer:{" "}
        <span className="font-mono font-semibold text-foreground">
          ({verdict.chosen_option})
        </span>
      </p>
    );
  }
  if (verdict.status === "evidence_only") {
    return (
      <p className="mb-2 text-[12px] text-muted-foreground">
        Evidence shown — no option forced
      </p>
    );
  }
  return null;
}

export function ExamModePanel({
  layout,
  className,
}: {
  layout: Ai2AnswerLayout;
  className?: string;
}) {
  const answer = layout.direct_answer?.trim() ?? "";
  const intent = layout.engine_trace?.intent ?? layout.query_understanding?.intent;
  const exam = layout.exam;
  const verdict = layout.exam_verdict;
  const isMcq =
    layout.layout_type === "mcq_exam" ||
    intent === "exam_mcq" ||
    exam?.format === "mcq" ||
    looksLikeMcq(answer);
  const isMatch =
    intent === "exam_match" ||
    exam?.format === "match" ||
    looksLikeMatch(answer);
  const isFill =
    intent === "exam_fill_blank" ||
    exam?.format === "fill_blank" ||
    (layout.layout_type === "quick_fact" && looksLikeFillBlank(answer));

  const abstain = verdict?.status === "insufficient_evidence";
  if ((!isMcq && !isMatch && !isFill && !abstain) || (!answer && !exam)) {
    return null;
  }

  const optionsFromSlots = slotOptions(exam);
  const options =
    optionsFromSlots.length >= 2
      ? optionsFromSlots
      : isMcq
        ? parseOptions(answer)
        : [];
  const pairs = isMatch ? parseMatchPairs(answer) : [];
  const leftCol = exam?.left_column?.filter(Boolean) ?? [];
  const rightCol = exam?.right_column?.filter(Boolean) ?? [];
  const stem =
    exam?.stem?.trim() ||
    (options.length >= 2
      ? answer.slice(0, answer.search(/\([A-D]\)|^[A-D][).:]/im)).trim()
      : "");
  const chosen = verdict?.chosen_option?.toUpperCase();

  const title = abstain
    ? "Exam — abstain"
    : isMatch
      ? "Match"
      : isFill
        ? "Fill in the blank"
        : "Exam";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-muted/20 px-3.5 py-3",
        className
      )}
      data-testid="exam-mode-panel"
    >
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <VerdictBanner verdict={verdict} />

      {isMatch && leftCol.length > 0 && rightCol.length > 0 ? (
        <div className="mb-2 grid grid-cols-2 gap-2 text-[13px]">
          <ul className="space-y-1">
            {leftCol.map((item, i) => (
              <li
                className="rounded-md bg-background/50 px-2 py-1"
                key={`L-${i}-${item}`}
              >
                {i + 1}. {item}
              </li>
            ))}
          </ul>
          <ul className="space-y-1">
            {rightCol.map((item, i) => (
              <li
                className="rounded-md bg-background/50 px-2 py-1"
                key={`R-${i}-${item}`}
              >
                {String.fromCharCode(97 + i)}. {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isMatch && pairs.length >= 2 ? (
        <ul className="space-y-1.5">
          {pairs.map((p) => (
            <li
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md bg-background/50 px-2.5 py-1.5 text-[13px]"
              key={`${p.left}-${p.right}`}
            >
              <span className="text-foreground/90">{p.left}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground/90">{p.right}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {isMcq && stem ? (
        <p className="mb-2.5 text-sm leading-relaxed text-foreground">{stem}</p>
      ) : null}
      {isMcq && options.length >= 2 ? (
        <ul className="space-y-1.5">
          {options.map((opt) => {
            const selected = chosen === opt.key;
            return (
              <li
                className={cn(
                  "flex gap-2 rounded-md px-2.5 py-1.5 text-[13px] leading-relaxed",
                  selected
                    ? "border border-foreground/20 bg-foreground/5"
                    : "bg-background/50"
                )}
                key={opt.key}
              >
                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  ({opt.key})
                </span>
                <span className="text-foreground/90">{opt.text}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {isFill && exam?.blanks?.length ? (
        <p className="mb-2 text-sm text-muted-foreground">
          Blank(s): {exam.blanks.join(", ")}
        </p>
      ) : null}

      {(abstain ||
        ((!(isMcq && options.length >= 2) &&
          !(isMatch && (pairs.length >= 2 || leftCol.length > 0))) &&
          Boolean(answer))) ? (
        <div className="rounded-md border border-border/40 bg-background/40 px-3 py-2">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}
