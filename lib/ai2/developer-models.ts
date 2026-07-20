export type DeveloperModelTier = "flash" | "pro" | "max" | "god";

export type DeveloperModel = {
  id: DeveloperModelTier;
  name: string;
  slug: string;
  thinking: string;
  description: string;
  inputPer1M: string | null;
  outputPer1M: string | null;
  context: string;
  available: boolean;
  badge?: string;
};

/** Public model catalog for the Developers page (token pricing is indicative). */
export const DEVELOPER_MODELS: DeveloperModel[] = [
  {
    id: "flash",
    name: "AI²-ayu-flash",
    slug: "ai2-ayu-flash",
    thinking: "Low",
    description:
      "Fast cite-first answers for consumer apps, triage flows, and high-volume chat.",
    inputPer1M: "$0.20",
    outputPer1M: "$0.80",
    context: "128K",
    available: true,
  },
  {
    id: "pro",
    name: "AI²-ayu-pro",
    slug: "ai2-ayu-pro",
    thinking: "Medium",
    description:
      "Balanced classical reasoning with cross-Acharya scope — default for clinical assistants.",
    inputPer1M: "$1.20",
    outputPer1M: "$4.80",
    context: "128K",
    available: true,
    badge: "Recommended",
  },
  {
    id: "max",
    name: "AI²-ayu-max",
    slug: "ai2-ayu-max",
    thinking: "Extra high",
    description:
      "Deep shloka synthesis, multi-text compare, and long-context scholarly workflows.",
    inputPer1M: "$3.50",
    outputPer1M: "$14.00",
    context: "256K",
    available: true,
  },
  {
    id: "god",
    name: "AI² — GOD mode",
    slug: "ai2-ayu-god",
    thinking: "Maximum",
    description:
      "Memory-intensive, highest-performance classical intelligence — reserved for enterprise and research partners.",
    inputPer1M: null,
    outputPer1M: null,
    context: "1M+",
    available: false,
    badge: "Unavailable on free tier",
  },
];

export const DEVELOPER_API_BASE = "https://api.ai2.quaasx.com/v1";
