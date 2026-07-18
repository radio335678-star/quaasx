/** Call ai2-rust-env Modal app via POST /exec → agent_run.py (no /v1/chat). */

const MAX_QUESTION_CHARS = 8000;
const AGENT_SCRIPT = "python3 /workspace/agent_run.py";
const EXEC_TIMEOUT_MS = 240_000;

export type ChatTurn = { role: string; content: string };

type ExecEnvelope = {
  ok?: boolean;
  stdout?: string;
  stderr?: string;
  returncode?: number;
  exit_code?: number;
  error?: string;
  fallback?: boolean;
};

type AgentResult = {
  ok?: boolean;
  answer?: string;
  error?: string;
  question?: string;
};

/** POSIX single-quote escape for shell=True on Modal /exec. */
export function shellQuote(text: string): string {
  if (!text.includes("'")) {
    return `'${text}'`;
  }
  return `'${text.replace(/'/g, `'\\''`)}'`;
}

/** Fold prior turns + current question for agent_run (no server session). */
export function buildAgentQuestion(messages: ChatTurn[]): string {
  if (messages.length === 0) {
    return "";
  }
  if (messages.length === 1) {
    return messages[0]?.content?.trim() ?? "";
  }

  const last = messages.at(-1);
  const prior = messages.slice(0, -1);
  const priorLines = prior
    .filter((m) => m.content?.trim())
    .map((m) => `${m.role}: ${m.content.trim()}`)
    .join("\n");

  const current = last?.content?.trim() ?? "";
  if (!priorLines) {
    return current;
  }

  const combined = `Prior conversation:\n${priorLines}\n\nCurrent question: ${current}`;
  if (combined.length <= MAX_QUESTION_CHARS) {
    return combined;
  }

  const budget = MAX_QUESTION_CHARS - current.length - 30;
  const trimmedPrior =
    priorLines.length > budget
      ? `…\n${priorLines.slice(priorLines.length - Math.max(0, budget))}`
      : priorLines;

  return `Prior conversation:\n${trimmedPrior}\n\nCurrent question: ${current}`.slice(
    0,
    MAX_QUESTION_CHARS
  );
}

function execExitCode(body: ExecEnvelope): number | undefined {
  if (typeof body.returncode === "number") {
    return body.returncode;
  }
  if (typeof body.exit_code === "number") {
    return body.exit_code;
  }
  return undefined;
}

function parseAgentStdout(stdout: string): AgentResult {
  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new Error("agent produced empty stdout");
  }
  try {
    return JSON.parse(trimmed) as AgentResult;
  } catch {
    throw new Error(`agent stdout is not JSON: ${trimmed.slice(0, 200)}`);
  }
}

export async function callRustEnvAgent(
  baseUrl: string,
  question: string
): Promise<{ answer: string }> {
  const url = baseUrl.replace(/\/$/, "");
  const command = `${AGENT_SCRIPT} ${shellQuote(question)}`;

  const res = await fetch(`${url}/exec`, {
    body: JSON.stringify({ command, timeout_ms: EXEC_TIMEOUT_MS }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Modal /exec error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const execBody = (await res.json()) as ExecEnvelope;
  const code = execExitCode(execBody);

  if (execBody.ok === false && !execBody.stdout) {
    throw new Error(
      execBody.error ||
        execBody.stderr?.slice(0, 300) ||
        "Modal /exec failed"
    );
  }

  if (code !== undefined && code !== 0 && !execBody.stdout?.trim()) {
    throw new Error(
      execBody.stderr?.slice(0, 300) ||
        `agent exited with code ${code}`
    );
  }

  const agent = parseAgentStdout(execBody.stdout ?? "");

  if (!agent.ok) {
    throw new Error(agent.error || "agent returned ok: false");
  }

  const answer = (agent.answer ?? "").trim();
  if (!answer) {
    throw new Error(agent.error || "agent returned empty answer");
  }

  return { answer };
}
