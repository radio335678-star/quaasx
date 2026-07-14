import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { metaToLayout, type BackendMetaEvent } from "@/lib/ai2/types";
import { ChatbotError } from "@/lib/errors";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { generateUUID } from "@/lib/utils";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 300;

const BACKEND_URL =
  process.env.AI2_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8090";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const HOBBY_BUDGET = process.env.AI2_HOBBY_SAFE === "1";

function backendHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (HOBBY_BUDGET) {
    headers["X-AI2-Budget"] = "hobby";
  }
  return headers;
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

async function* readBackendSse(
  response: Response
): AsyncGenerator<BackendMetaEvent | { type: string; delta?: string }> {
  const reader = response.body?.getReader();
  if (!reader) {
    return;
  }
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("data:"));
      if (!line) {
        continue;
      }
      const raw = line.slice(5).trim();
      try {
        yield JSON.parse(raw) as BackendMetaEvent | { type: string; delta?: string };
      } catch {
        /* ignore malformed */
      }
    }
  }
}

function productionErrorMessage(error: unknown): string {
  const detail =
    error instanceof Error ? error.message : "AI² backend unavailable";

  if (IS_PRODUCTION) {
    return (
      `**AI² is temporarily unavailable**\n\n` +
      `${detail}\n\n` +
      `The classical engine may be cold-starting (first request can take up to 2–3 minutes). ` +
      `Please wait a moment and try again.\n\n` +
      `If this persists, the Modal deployment may need attention — ` +
      `operators should verify \`AI2_BACKEND_URL\` on Vercel.`
    );
  }

  return (
    `**AI² backend unreachable**\n\n${detail}\n\n` +
    `Local dev:\n\`\`\`\n` +
    `cd c:\\ayurAI-standalone\n` +
    `set AI2_DATA_ROOT=c:\\ayurAI-standalone\n` +
    `python -m uvicorn backend.local_server:app --host 127.0.0.1 --port 8090\n` +
    `\`\`\`\n\n` +
    `Or set \`AI2_BACKEND_URL\` to your Modal endpoint.`
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

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        data: {
          message: IS_PRODUCTION
            ? "Waking AI² engine (cold start may take a minute)..."
            : "Consulting AI² Hybrid Engine...",
          modelId: "ai2-hybrid",
          modelName: "AI² Hybrid Engine",
          phase: "waiting",
        },
        transient: true,
        type: "data-waiting-status",
      });

      try {
        const upstream = await fetch(`${BACKEND_URL}/v1/chat`, {
          body: JSON.stringify({
            messages,
            session_id: requestBody.id,
            stream: true,
          }),
          headers: backendHeaders(),
          method: "POST",
        });

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          throw new Error(
            `AI² backend error ${upstream.status}: ${errText.slice(0, 200)}`
          );
        }

        writer.write({ type: "text-start", id: textId });
        writer.write({
          data: {
            message: "Grounding in classical corpus...",
            modelId: "ai2-hybrid",
            modelName: "AI² Hybrid Engine",
            phase: "thinking",
          },
          transient: true,
          type: "data-waiting-status",
        });

        let metaSent = false;

        for await (const event of readBackendSse(upstream)) {
          if (event.type === "meta" && !metaSent) {
            metaSent = true;
            writer.write({
              type: "data-ai2-answer",
              data: metaToLayout(event as BackendMetaEvent),
            });
          }
          if (event.type === "text-delta" && "delta" in event && event.delta) {
            writer.write({
              type: "text-delta",
              id: textId,
              delta: event.delta,
            });
          }
        }
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

