import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import {
  buildAgentQuestion,
  callRustEnvAgent,
} from "@/lib/ai2/rustenv-exec";
import { ChatbotError } from "@/lib/errors";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { generateUUID } from "@/lib/utils";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 300;

const BACKEND_URL =
  process.env.AI2_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8090";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function waitingMessage(): string {
  if (IS_PRODUCTION) {
    return "Consulting AI² Rust Env…";
  }
  return "Consulting AI² Rust Env...";
}

function extractTextFromMessage(message: {
  parts?: Array<{ type?: string; text?: string }>;
}): string {
  const parts = message.parts ?? [];
  return parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("\n")
    .trim();
}

function buildBackendMessages(body: PostRequestBody): Array<{
  role: string;
  content: string;
}> {
  if (body.messages?.length) {
    return body.messages.map((m) => {
      const text =
        m.parts
          ?.filter((p) => p.type === "text" && typeof p.text === "string")
          .map((p) => String(p.text))
          .join("\n") || "";
      return { role: m.role, content: text };
    });
  }
  if (body.message) {
    return [
      {
        role: "user",
        content: extractTextFromMessage(body.message),
      },
    ];
  }
  return [];
}

function productionErrorMessage(error: unknown): string {
  const detail =
    error instanceof Error ? error.message : "AI² Rust Env unavailable";

  if (IS_PRODUCTION) {
    return (
      `**AI² is temporarily unavailable**\n\n` +
      `${detail}\n\n` +
      `The Rust Env agent may be cold-starting (first request can take up to 2–3 minutes). ` +
      `Please wait a moment and try again.\n\n` +
      `If this persists, verify \`AI2_BACKEND_URL\` points at the ai2-rust-env Modal endpoint.`
    );
  }

  return (
    `**AI² Rust Env unreachable**\n\n${detail}\n\n` +
    `Set \`AI2_BACKEND_URL\` to the live Modal app, e.g.\n` +
    `\`https://quaasx--ai2-rust-env-rustenvgateway-web.modal.run\`\n\n` +
    `Smoke: \`python scripts/smoke_rustenv.py\``
  );
}

export async function POST(request: Request) {
  const rate = checkRateLimit(clientIp(request));
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait before trying again.",
        retryAfterSec: rate.retryAfterSec,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rate.retryAfterSec ?? 60),
        },
      }
    );
  }

  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const messages = buildBackendMessages(requestBody);
  if (!messages.length || !messages.at(-1)?.content) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const textId = generateUUID();
  const question = buildAgentQuestion(messages);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        data: {
          message: waitingMessage(),
          modelId: "ai2-rust-env",
          modelName: "AI² Rust Env",
          phase: "waiting",
        },
        transient: true,
        type: "data-waiting-status",
      });

      try {
        writer.write({
          data: {
            message: "Running library agent (db_sql + tools)…",
            modelId: "ai2-rust-env",
            modelName: "AI² Rust Env",
            phase: "thinking",
          },
          transient: true,
          type: "data-waiting-status",
        });

        const { answer } = await callRustEnvAgent(BACKEND_URL, question);

        writer.write({ type: "text-start", id: textId });
        writer.write({
          type: "text-delta",
          id: textId,
          delta: answer,
        });
        writer.write({ type: "text-end", id: textId });
      } catch (error) {
        writer.write({ type: "text-start", id: textId });
        writer.write({
          type: "text-delta",
          id: textId,
          delta: productionErrorMessage(error),
        });
        writer.write({ type: "text-end", id: textId });
      }
    },
    generateId: generateUUID,
  });

  return createUIMessageStreamResponse({ stream });
}

export async function DELETE() {
  return new Response(null, { status: 204 });
}
