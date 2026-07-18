/** User-facing status lines while AI² responds — no DB/tool jargon. */

const WAITING_LINES = [
  "Consulting the classical tradition…",
  "Opening the samhitas…",
  "Listening to your question…",
] as const;

const THINKING_LINES = [
  "Tracing the answer through ancient texts…",
  "Weaving Sanskrit evidence into plain words…",
  "Cross-reading Charaka, Sushruta, and the corpus…",
  "Finding the verses that fit your question…",
  "Synthesizing a grounded reply…",
] as const;

export function pickWaitingLine(seed = 0): string {
  return WAITING_LINES[Math.abs(seed) % WAITING_LINES.length] ?? WAITING_LINES[0];
}

export function pickThinkingLine(seed = 0): string {
  return THINKING_LINES[Math.abs(seed) % THINKING_LINES.length] ?? THINKING_LINES[0];
}

export const AI2_STREAM_LABEL = "AI²";
