import type { AudienceMode } from "./audience-mode";

export type DeveloperModelTier = "flash" | "pro" | "max" | "god";

/** Chat pipeline routing key (matches model slug → backend). */
export type ChatPipeline =
  | "flash_kamatera"
  | "pro_parallel"
  | "max_db"
  | "god_db";

/** OpenRouter reasoning.effort values (never send "max" — OR rejects it). */
export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export type DeveloperModel = {
  id: DeveloperModelTier;
  name: string;
  slug: string;
  /** UI label: Patient, Scholar, Clinician, GOD mode */
  audienceLabel: string;
  /** Backend audience prompt when this tier is active */
  audienceMode: AudienceMode;
  thinking: string;
  description: string;
  inputPer1M: string | null;
  outputPer1M: string | null;
  context: string;
  /** Listed on Developers API page */
  available: boolean;
  /** Selectable in the chat composer */
  chatSelectable: boolean;
  /** Server-side routing pipeline */
  pipeline: ChatPipeline | null;
  /** OpenRouter model slug for this tier */
  openRouterModel: string;
  /** OpenRouter reasoning.effort (exclude=true in backends) */
  reasoningEffort: ReasoningEffort;
  unavailableReason?: string;
  badge?: string;
};

/** Flash + Pro LLM (OpenRouter). */
export const FLASH_PRO_MODEL = "deepseek/deepseek-v3.2";
/** Max (extra-high) Modal DB-only. */
export const MAX_MODEL = "stepfun/step-3.5-flash";
/** GOD mode Modal DB-only. */
export const GOD_MODEL = "deepseek/deepseek-v4-pro";

/** @deprecated Use FLASH_PRO_MODEL */
export const LINGA_MODEL = FLASH_PRO_MODEL;
/** @deprecated Use MAX_MODEL / GOD_MODEL */
export const DEEPSEEK_MODEL = MAX_MODEL;

/** Public model catalog for the Developers page (token pricing is indicative). */
export const DEVELOPER_MODELS: DeveloperModel[] = [
  {
    id: "flash",
    name: "AI²-ayu-flash",
    slug: "ai2-ayu-flash",
    audienceLabel: "Patient",
    audienceMode: "patient",
    thinking: "Low",
    description:
      "Low thinking — DeepSeek V3.2 on Kamatera Web-X Scrapling (max 3 calls). No Modal.",
    inputPer1M: "$0.25",
    outputPer1M: "$0.40",
    context: "128K",
    available: true,
    chatSelectable: true,
    pipeline: "flash_kamatera",
    openRouterModel: FLASH_PRO_MODEL,
    reasoningEffort: "low",
  },
  {
    id: "pro",
    name: "AI²-ayu-pro",
    slug: "ai2-ayu-pro",
    audienceLabel: "Scholar",
    audienceMode: "scholar",
    thinking: "Medium",
    description:
      "Medium thinking — DeepSeek V3.2 parallel: Modal classical DB + Kamatera Scrapling web, then merge.",
    inputPer1M: "$0.25",
    outputPer1M: "$0.40",
    context: "128K",
    available: true,
    chatSelectable: true,
    pipeline: "pro_parallel",
    openRouterModel: FLASH_PRO_MODEL,
    reasoningEffort: "medium",
    badge: "Recommended",
  },
  {
    id: "max",
    name: "AI²-ayu-max",
    slug: "ai2-ayu-max",
    audienceLabel: "Clinician",
    audienceMode: "clinician",
    thinking: "Extra high",
    description:
      "Extra-high thinking — Step 3.5 Flash on Modal classical library only (no Web-X).",
    inputPer1M: "$0.10",
    outputPer1M: "$0.30",
    context: "256K",
    available: true,
    chatSelectable: true,
    pipeline: "max_db",
    openRouterModel: MAX_MODEL,
    reasoningEffort: "high",
  },
  {
    id: "god",
    name: "AI² — GOD mode",
    slug: "ai2-ayu-god",
    audienceLabel: "GOD mode",
    audienceMode: "scholar",
    thinking: "Maximum",
    description:
      "Maximum thinking — DeepSeek V4-Pro on Modal classical library only (1M context).",
    inputPer1M: "$1.20",
    outputPer1M: "$4.80",
    context: "1M",
    available: true,
    chatSelectable: true,
    pipeline: "god_db",
    openRouterModel: GOD_MODEL,
    reasoningEffort: "xhigh",
    badge: "GOD",
  },
];

export const DEFAULT_CHAT_MODEL =
  DEVELOPER_MODELS.find((m) => m.slug === "ai2-ayu-pro" && m.chatSelectable)
    ?.slug ??
  DEVELOPER_MODELS.find((m) => m.chatSelectable)?.slug ??
  "ai2-ayu-pro";

export function findChatModel(slug: string) {
  return DEVELOPER_MODELS.find((m) => m.slug === slug);
}

export function resolveChatModel(slug: string | undefined) {
  const model = slug ? findChatModel(slug) : undefined;
  if (model?.chatSelectable) {
    return model;
  }
  return findChatModel(DEFAULT_CHAT_MODEL)!;
}

export function audienceModeForModel(slug: string | undefined): AudienceMode {
  return resolveChatModel(slug).audienceMode;
}

export function pipelineForModel(slug: string | undefined): ChatPipeline {
  return resolveChatModel(slug).pipeline ?? "pro_parallel";
}

export const DEVELOPER_API_BASE = "https://api.ai2.quaasx.com/v1";
