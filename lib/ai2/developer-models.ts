import type { AudienceMode } from "./audience-mode";

export type DeveloperModelTier = "flash" | "pro" | "max" | "god";

/** Chat pipeline routing key (matches model slug → backend). */
export type ChatPipeline = "flash_kamatera" | "pro_parallel" | "max_deepseek";

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
  unavailableReason?: string;
  badge?: string;
};

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
      "Low-thinking Flash — pure Kamatera Web-X Scrapling agent (max 3 calls). No Modal.",
    inputPer1M: "$0.20",
    outputPer1M: "$0.80",
    context: "128K",
    available: true,
    chatSelectable: true,
    pipeline: "flash_kamatera",
  },
  {
    id: "pro",
    name: "AI²-ayu-pro",
    slug: "ai2-ayu-pro",
    audienceLabel: "Scholar",
    audienceMode: "scholar",
    thinking: "Medium",
    description:
      "Parallel Linga DB (Modal) + Linga web (Kamatera), then Linga merge — classical + live web.",
    inputPer1M: "$1.20",
    outputPer1M: "$4.80",
    context: "128K",
    available: true,
    chatSelectable: true,
    pipeline: "pro_parallel",
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
      "DeepSeek v4 flash on Modal — classical library only, no Web-X.",
    inputPer1M: "$3.50",
    outputPer1M: "$14.00",
    context: "256K",
    available: true,
    chatSelectable: true,
    pipeline: "max_deepseek",
  },
  {
    id: "god",
    name: "AI² — GOD mode",
    slug: "ai2-ayu-god",
    audienceLabel: "GOD mode",
    audienceMode: "scholar",
    thinking: "Maximum",
    description:
      "Memory-intensive, highest-performance classical intelligence — reserved for enterprise and research partners.",
    inputPer1M: null,
    outputPer1M: null,
    context: "1M+",
    available: false,
    chatSelectable: false,
    pipeline: null,
    unavailableReason: "Unavailable on free tier",
    badge: "Unavailable on free tier",
  },
];

export const DEFAULT_CHAT_MODEL =
  DEVELOPER_MODELS.find((m) => m.slug === "ai2-ayu-pro" && m.chatSelectable)
    ?.slug ??
  DEVELOPER_MODELS.find((m) => m.chatSelectable)?.slug ??
  "ai2-ayu-pro";

export const LINGA_MODEL = "inclusionai/ling-2.6-flash";
export const DEEPSEEK_MODEL = "deepseek/deepseek-v4-flash";

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
