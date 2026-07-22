/** User-facing status lines while AI² responds — native assistant tone. */

const WAITING_LINES = [
  "Thinking…",
  "Reading your question…",
  "Composing a clear answer…",
] as const;

const THINKING_LINES = [
  "Gathering a careful reply…",
  "Putting this in plain words…",
  "Checking what fits your question…",
  "Shaping a grounded answer…",
  "Almost ready…",
] as const;

export function pickWaitingLine(seed = 0): string {
  return WAITING_LINES[Math.abs(seed) % WAITING_LINES.length] ?? WAITING_LINES[0];
}

export function pickThinkingLine(seed = 0): string {
  return THINKING_LINES[Math.abs(seed) % THINKING_LINES.length] ?? THINKING_LINES[0];
}

export const AI2_STREAM_LABEL = "AI²";
