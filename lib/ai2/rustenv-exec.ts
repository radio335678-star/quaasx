/** Call ai2-rust-env Modal and Kamatera Linga agent by chat pipeline. */

import {
  LINGA_MODEL,
  type ChatPipeline,
  pipelineForModel,
} from "@/lib/ai2/developer-models";

const MAX_QUESTION_CHARS = 8000;
const AGENT_SCRIPT = "python3 /workspace/agent_run.py";
const EXEC_TIMEOUT_MS = 240_000;
const LINGA_WEB_TIMEOUT_MS = 45_000;
const LINGA_DB_TIMEOUT_MS = 120_000;
const LINGA_MERGE_TIMEOUT_MS = 90_000;

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

export type LingaWebEnvelope = {
  ok?: boolean;
  answer_md?: string;
  answer?: string;
  error?: string;
  sources?: Array<Record<string, unknown>>;
  web_backend?: string;
  sufficient?: boolean;
  needs_classical_db?: boolean;
  confidence?: number;
  model?: string;
  linga_ms?: number;
  scrape_ms?: number;
  tools_used?: string[];
  [key: string]: unknown;
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
  if (pipeline === "linga_db" || pipeline === "deepseek_db") {
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

export async function callKamateraLingaAgent(
  question: string
): Promise<{ answer: string; raw: LingaWebEnvelope }> {
  const base = (
    process.env.WEBX_BACKEND_URL || "https://api.webx.quaasx108.com"
  ).replace(/\/$/, "");
  const secret = (process.env.AI2_WEBX_BRIDGE_SECRET || "").trim();
  if (!secret) {
    throw new Error("AI2_WEBX_BRIDGE_SECRET not configured on Vercel");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINGA_WEB_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/api/internal/agent/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AI2-Bridge-Secret": secret,
      },
      body: JSON.stringify({ query: question, max_pages: 3 }),
      signal: controller.signal,
    });
    const raw = (await res.json()) as LingaWebEnvelope;
    if (!res.ok || !raw.ok) {
      throw new Error(
        raw.error || `Kamatera Linga HTTP ${res.status}`
      );
    }
    const answer = (raw.answer_md || raw.answer || "").trim();
    if (!answer) {
      throw new Error("Kamatera Linga returned empty answer");
    }
    return { answer, raw };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Route by chat model pipeline:
 * - flash_kamatera: Kamatera Linga only
 * - pro_parallel: Modal Linga DB + Kamatera Linga web → Linga merge
 * - max_deepseek: Modal DeepSeek DB-only
 */
export async function runChatPipeline(
  modalUrl: string,
  question: string,
  modelSlug: string | undefined
): Promise<{ answer: string; pipeline: ChatPipeline }> {
  const pipeline = pipelineForModel(modelSlug);

  if (pipeline === "flash_kamatera") {
    const { answer } = await callKamateraLingaAgent(question);
    return { answer, pipeline };
  }

  if (pipeline === "max_deepseek") {
    const { answer } = await callRustEnvAgent(modalUrl, question, {
      pipeline: "deepseek_db",
      timeoutMs: EXEC_TIMEOUT_MS,
    });
    return { answer, pipeline };
  }

  // pro_parallel
  const [dbSettled, webSettled] = await Promise.allSettled([
    callRustEnvAgent(modalUrl, question, {
      pipeline: "linga_db",
      model: LINGA_MODEL,
      timeoutMs: LINGA_DB_TIMEOUT_MS,
    }),
    callKamateraLingaAgent(question),
  ]);

  const dbOk = dbSettled.status === "fulfilled" ? dbSettled.value : null;
  const webOk = webSettled.status === "fulfilled" ? webSettled.value : null;

  if (!dbOk && webOk) {
    return { answer: webOk.answer, pipeline };
  }
  if (dbOk && !webOk) {
    return { answer: dbOk.answer, pipeline };
  }
  if (!dbOk && !webOk) {
    const dbErr =
      dbSettled.status === "rejected"
        ? String(dbSettled.reason)
        : "db failed";
    const webErr =
      webSettled.status === "rejected"
        ? String(webSettled.reason)
        : "web failed";
    throw new Error(`Pro parallel failed — db: ${dbErr}; web: ${webErr}`);
  }

  const dbPack = {
    answer: dbOk!.answer,
    model: dbOk!.raw.model,
    steps: dbOk!.raw.steps,
    ok: true,
  };
  const webPack = webOk!.raw;

  try {
    const { answer } = await callRustEnvAgent(modalUrl, question, {
      pipeline: "linga_merge",
      model: LINGA_MODEL,
      dbPack,
      webPack,
      timeoutMs: LINGA_MERGE_TIMEOUT_MS,
    });
    return { answer, pipeline };
  } catch {
    // Degraded: concatenate if merge fails
    return {
      answer: `${dbOk!.answer}\n\n---\n\n## Web research\n\n${webOk!.answer}`,
      pipeline,
    };
  }
}
