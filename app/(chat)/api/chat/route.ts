import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import type { AudienceMode } from "@/lib/ai2/audience-mode";
import { isAudienceMode } from "@/lib/ai2/audience-mode";
import { applyAudiencePrompt } from "@/lib/ai2/audience-prompts";
import {
  DEFAULT_CHAT_MODEL,
  pipelineForModel,
} from "@/lib/ai2/developer-models";
import {
  ACCESS_COOKIE_NAME,
  decodeAccessCookie,
} from "@/lib/ai2/access-cookie";
import {
  isModelAllowedForRole,
  modelLockReason,
} from "@/lib/ai2/access-role";
import {
  buildAgentQuestion,
  runChatPipeline,
} from "@/lib/ai2/rustenv-exec";
import {
  applyScopeLockToQuestion,
  resolveScopedClassics,
} from "@/lib/ai2/scope-lock";
import {
  AI2_STREAM_LABEL,
  pickThinkingLine,
  pickWaitingLine,
} from "@/lib/ai2/waiting-copy";
import { ChatbotError } from "@/lib/errors";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { generateUUID } from "@/lib/utils";
import { cookies } from "next/headers";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 300;

const BACKEND_URL =
  process.env.AI2_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8090";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function productionErrorMessage(error: unknown): string {
  const detail =
    error instanceof Error ? error.message : "AI² could not reach the server";

  if (IS_PRODUCTION) {
    return (
      `**AI² is temporarily unavailable**\n\n` +
      `Please wait a moment and try again — the first answer after idle can take a minute or two.\n\n` +
      `If this keeps happening, try refreshing the page.`
    );
  }

  return (
    `**AI² unreachable**\n\n${detail}\n\n` +
    `Dev: set \`AI2_BACKEND_URL\` in \`.env.local\`.`
  );
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

function extractAudienceMode(body: PostRequestBody): AudienceMode {
  const fromMessage = body.message?.metadata?.audienceMode;
  if (fromMessage && isAudienceMode(fromMessage)) {
    return fromMessage;
  }
  return "scholar";
}

function extractModelSlug(body: PostRequestBody): string {
  const slug = body.message?.metadata?.modelSlug;
  if (typeof slug === "string" && slug.trim()) {
    return slug.trim();
  }
  return DEFAULT_CHAT_MODEL;
}

function extractScopedMetadata(body: PostRequestBody): {
  scopedWorks?: string[];
  scopedAbbrevs?: string[];
} {
  const meta = body.message?.metadata as
    | { scopedWorks?: string[]; scopedAbbrevs?: string[] }
    | undefined;
  return {
    scopedWorks: meta?.scopedWorks,
    scopedAbbrevs: meta?.scopedAbbrevs,
  };
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
  const audienceMode = extractAudienceMode(requestBody);
  const modelSlug = extractModelSlug(requestBody);
  const jar = await cookies();
  const accessRole = decodeAccessCookie(jar.get(ACCESS_COOKIE_NAME)?.value);
  if (!isModelAllowedForRole(accessRole, modelSlug)) {
    return new Response(
      JSON.stringify({
        error:
          modelLockReason(accessRole, modelSlug) ??
          "This model is not available for your access role",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  const isFlash = pipelineForModel(modelSlug) === "knowledge_only";
  const baseQuestion = buildAgentQuestion(messages);
  let question: string;
  if (requestBody.message) {
    const { scopedWorks, scopedAbbrevs } = extractScopedMetadata(requestBody);
    // Flash: knowledge-only — no @ scope required, no SCOPE LOCK.
    if (isFlash) {
      question = applyAudiencePrompt(baseQuestion, audienceMode, 8000, {
        nativeKnowledge: true,
      });
    } else {
      const scope = resolveScopedClassics(scopedWorks, scopedAbbrevs);
      if (!scope.ok) {
        return new Response(JSON.stringify({ error: scope.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const scopedQuestion = applyScopeLockToQuestion(
        baseQuestion,
        scope.names,
        scope.abbrevs
      );
      question = applyAudiencePrompt(scopedQuestion, audienceMode, 8000);
    }
  } else {
    question = applyAudiencePrompt(baseQuestion, audienceMode, 8000, {
      nativeKnowledge: isFlash,
    });
  }
  const statusSeed = question.length + audienceMode.length + modelSlug.length;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        data: {
          message: pickWaitingLine(statusSeed),
          modelId: modelSlug,
          modelName: AI2_STREAM_LABEL,
          phase: "waiting",
        },
        transient: true,
        type: "data-waiting-status",
      });

      try {
        writer.write({
          data: {
            message: pickThinkingLine(statusSeed + 1),
            modelId: modelSlug,
            modelName: AI2_STREAM_LABEL,
            phase: "thinking",
          },
          transient: true,
          type: "data-waiting-status",
        });

        const { answer } = await runChatPipeline(
          BACKEND_URL,
          question,
          modelSlug
        );

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
