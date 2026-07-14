export type DemoKind = "hero" | "example";

export type DemoExpectedLayout =
  | "clinical_compare"
  | "shloka_study"
  | "citation_lookup";

export type DemoPrompt = {
  id: string;
  kind: DemoKind;
  title: string;
  subtitle: string;
  query: string;
  expectedLayout: DemoExpectedLayout;
};

export const HERO_DEMO: DemoPrompt = {
  id: "jwara-charaka-sushruta",
  kind: "hero",
  title: "Jwara — Charaka vs Sushruta",
  subtitle: "Side-by-side classical citations · ~30 sec",
  query:
    "Compare Charaka and Sushruta on jwara (fever): nidana, lakshana, and chikitsa with primary shlokas side by side.",
  expectedLayout: "clinical_compare",
};

export const EXAMPLE_DEMOS: DemoPrompt[] = [
  {
    id: "agni-study",
    kind: "example",
    title: "Agni with citations",
    subtitle: "Shloka study layout",
    query: "Explain the concept of Agni with citations from Charaka Samhita.",
    expectedLayout: "shloka_study",
  },
  {
    id: "raktamokshana-compare",
    kind: "example",
    title: "Raktamokshana compare",
    subtitle: "Charaka vs Sushruta",
    query: "Compare Charaka and Sushruta on raktamokshana with primary shlokas.",
    expectedLayout: "clinical_compare",
  },
  {
    id: "ca-ni-lookup",
    kind: "example",
    title: "Ca.Ni.1.16",
    subtitle: "Single verse hero",
    query: "Explain Ca.Ni.1.16 with full Devanagari, English, and Hindi meaning.",
    expectedLayout: "citation_lookup",
  },
];

export function getDemoById(id: string): DemoPrompt | undefined {
  if (HERO_DEMO.id === id) {
    return HERO_DEMO;
  }
  return EXAMPLE_DEMOS.find((d) => d.id === id);
}
