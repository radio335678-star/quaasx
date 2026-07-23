/** Call ai2-rust-env Modal by chat pipeline (Flash / Pro / Max / GOD). */

import {
  FLASH_PRO_MODEL,
  GOD_MODEL,
  MAX_MODEL,
  type ChatPipeline,
  pipelineForModel,
  resolveChatModel,
} from "@/lib/ai2/developer-models";

const MAX_QUESTION_CHARS = 8000;
const EXEC_TIMEOUT_MS = 240_000;
const PRO_TIMEOUT_MS = 180_000;
const GOD_TIMEOUT_MS = 300_000;
const FLASH_TIMEOUT_MS = 90_000;

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
  model?: string;
  pipeline?: string;
  steps?: unknown[];
  [key: string]: unknown;
};

/** Strip tool/CoT/search leakage so answers read like a native model. */
export function sanitizeNativeAnswer(text: string): string {
  let t = text.trim();
  if (!t) {
    return "";
  }

  t = t.replace(
    /<(?:use_mdl_tool|tool_call|function_call)[^>]*>[\s\S]*?<\/(?:use_mdl_tool|tool_call|function_call)>/gi,
    ""
  );
  t = t.replace(
    /^(?:(?:we need to|let me|i(?:'ll| will)|i(?:'m| am) (?:going to |now )?(?:search|look|fetch|check|query)|searching|looking up|fetching|querying|based on (?:my |the )?(?:search|web|database|tools?)|from (?:the )?(?:web |online )?search|openrouter|scrapling|web-?x|(?:consulting|opening|checking) (?:the )?(?:database|library|charaka|sushruta))[^\n]*(?:\n(?!\n|\*\*|##)[^\n]*)*)+/is,
    ""
  );
  t = t.replace(/^##\s*Web findings[^\n]*\n+/im, "");
  t = t.replace(/\*?\(Formatted from Web-X[^)]*\)\*?\s*/gi, "");
  t = t.replace(
    /^\*{0,2}\s*(?:Plain[-\s]?English answer|Answer|Final answer)\s*\*{0,2}\s*:?\s*\n?/im,
    ""
  );
  t = t.replace(/【\s*https?:\/\/[^】]+】/g, "");
  t = t.replace(/https?:\/\/[^\s\]）)》】>"']+/g, "");
  t = t.replace(
    /\b(?:library DB|sqlite|db_sql|FTS|citation_id|OpenRouter|Scrapling|Web-X|web search|searched the|searching the|database for)\b[^.!\n]*[.!]?\s*/gi,
    ""
  );
  t = t.replace(/[ \t]+\n/g, "\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/[ \t]{2,}/g, " ");
  return t.trim();
}

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

function toBase64Utf8(obj: unknown): string {
  const json = JSON.stringify(obj);
  return Buffer.from(json, "utf8").toString("base64");
}

export async function callRustEnvAgent(
  baseUrl: string,
  question: string,
  opts?: {
    pipeline?: string;
    model?: string;
    reasoningEffort?: string;
    dbPack?: unknown;
    webPack?: unknown;
    timeoutMs?: number;
  }
): Promise<{ answer: string; raw: AgentResult }> {
  const url = baseUrl.replace(/\/$/, "");
  const pipeline = opts?.pipeline ?? "full";
  const timeoutMs = opts?.timeoutMs ?? EXEC_TIMEOUT_MS;

  const envExports: string[] = [`AI2_PIPELINE=${pipeline}`];
  if (opts?.model) {
    envExports.push(`AI2_RUSTENV_LLM_MODEL=${opts.model}`);
    envExports.push(`AI2_LLM_MODEL=${opts.model}`);
  }
  if (opts?.reasoningEffort) {
    envExports.push(`AI2_REASONING_EFFORT=${opts.reasoningEffort}`);
  }
  if (
    pipeline === "linga_db" ||
    pipeline === "deepseek_db" ||
    pipeline === "db_only" ||
    pipeline === "knowledge_only" ||
    pipeline === "pro_full"
  ) {
    envExports.push("AI2_WEB_PREFETCH=off");
  }
  if (opts?.dbPack !== undefined) {
    envExports.push(`AI2_DB_PACK_B64=${toBase64Utf8(opts.dbPack)}`);
  }
  if (opts?.webPack !== undefined) {
    envExports.push(`AI2_WEB_PACK_B64=${toBase64Utf8(opts.webPack)}`);
  }

  // Cage-bro cannot spawn `VAR=x cmd` reliably — set env inside Python.
  const envPy = envExports
    .map((e) => {
      const i = e.indexOf("=");
      const k = e.slice(0, i);
      const v = e.slice(i + 1);
      return `os.environ[${JSON.stringify(k)}]=${JSON.stringify(v)}`;
    })
    .join("; ");
  const qLit = JSON.stringify(question);
  const command = `python3 -c ${shellQuote(
    `import os,sys,runpy; ${envPy}; sys.argv=["agent_run.py", ${qLit}]; runpy.run_path("/workspace/agent_run.py", run_name="__main__")`
  )}`;

  const res = await fetch(`${url}/exec`, {
    body: JSON.stringify({ command, timeout_ms: timeoutMs }),
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
      execBody.error || execBody.stderr?.slice(0, 300) || "Modal /exec failed"
    );
  }

  if (code !== undefined && code !== 0 && !execBody.stdout?.trim()) {
    throw new Error(
      execBody.stderr?.slice(0, 300) || `agent exited with code ${code}`
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

  return { answer, raw: agent };
}

/**
 * Route by chat model pipeline:
 * - knowledge_only: Modal DeepSeek V3.2, no tools (Flash)
 * - pro_full: Modal V3.2 classical DB + OpenRouter paid web_search/web_fetch
 * - max_db: Modal DeepSeek V4 Flash DB-only
 * - god_db: Modal DeepSeek V4-Pro DB-only
 */
export async function runChatPipeline(
  modalUrl: string,
  question: string,
  modelSlug: string | undefined
): Promise<{ answer: string; pipeline: ChatPipeline }> {
  const pipeline = pipelineForModel(modelSlug);
  const catalog = resolveChatModel(modelSlug);

  if (pipeline === "knowledge_only") {
    const { answer } = await callRustEnvAgent(modalUrl, question, {
      pipeline: "knowledge_only",
      model: catalog.openRouterModel || FLASH_PRO_MODEL,
      reasoningEffort: catalog.reasoningEffort || "low",
      timeoutMs: FLASH_TIMEOUT_MS,
    });
    return { answer: sanitizeNativeAnswer(answer) || answer, pipeline };
  }

  if (pipeline === "pro_full") {
    const { answer } = await callRustEnvAgent(modalUrl, question, {
      pipeline: "pro_full",
      model: catalog.openRouterModel || FLASH_PRO_MODEL,
      reasoningEffort: catalog.reasoningEffort || "medium",
      timeoutMs: PRO_TIMEOUT_MS,
    });
    return { answer, pipeline };
  }

  if (pipeline === "max_db") {
    const { answer } = await callRustEnvAgent(modalUrl, question, {
      pipeline: "deepseek_db",
      model: catalog.openRouterModel || MAX_MODEL,
      reasoningEffort: catalog.reasoningEffort || "high",
      timeoutMs: EXEC_TIMEOUT_MS,
    });
    return { answer, pipeline };
  }

  if (pipeline === "god_db") {
    const { answer } = await callRustEnvAgent(modalUrl, question, {
      pipeline: "deepseek_db",
      model: catalog.openRouterModel || GOD_MODEL,
      reasoningEffort: catalog.reasoningEffort || "xhigh",
      timeoutMs: GOD_TIMEOUT_MS,
    });
    return { answer, pipeline };
  }

  // Fallback: Pro-style single Modal agent
  const { answer } = await callRustEnvAgent(modalUrl, question, {
    pipeline: "pro_full",
    model: catalog.openRouterModel || FLASH_PRO_MODEL,
    reasoningEffort: catalog.reasoningEffort || "medium",
    timeoutMs: PRO_TIMEOUT_MS,
  });
  return { answer, pipeline: "pro_full" };
}
