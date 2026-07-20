import type { AudienceMode } from "./audience-mode";

export type DeveloperModelTier = "flash" | "pro" | "max" | "god";

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
      "Fast cite-first answers for consumer apps, triage flows, and high-volume chat.",
    inputPer1M: "$0.20",
    outputPer1M: "$0.80",
    context: "128K",
    available: true,
    chatSelectable: false,
    unavailableReason: "Coming soon",
  },
  {
    id: "pro",
    name: "AI²-ayu-pro",
    slug: "ai2-ayu-pro",
    audienceLabel: "Scholar",
    audienceMode: "scholar",
    thinking: "Medium",
    description:
      "Balanced classical reasoning with cross-Acharya scope — default for clinical assistants.",
    inputPer1M: "$1.20",
    outputPer1M: "$4.80",
    context: "128K",
    available: true,
    chatSelectable: true,
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
      "Deep shloka synthesis, multi-text compare, and long-context scholarly workflows.",
    inputPer1M: "$3.50",
    outputPer1M: "$14.00",
    context: "256K",
    available: true,
    chatSelectable: false,
    unavailableReason: "Upgrade required",
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
    unavailableReason: "Unavailable on free tier",
    badge: "Unavailable on free tier",
  },
];

export const DEFAULT_CHAT_MODEL =
  DEVELOPER_MODELS.find((m) => m.chatSelectable)?.slug ?? "ai2-ayu-pro";

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

export const DEVELOPER_API_BASE = "https://api.ai2.quaasx.com/v1";
