export type Ai2LayoutType =
  | "clinical_compare"
  | "shloka_study"
  | "nidana"
  | "quick_fact"
  | "citation_lookup"
  | "general";

export type PadacchedaEntry = {
  word: string;
  gloss_en: string;
};

export type Ai2Citation = {
  citation_id: string;
  source: string;
  trust: string;
  sthana?: string;
  chapter_num?: number;
  devanagari?: string;
  iast?: string;
  english?: string;
  hindi?: string;
  padaccheda?: PadacchedaEntry[];
  verse_meaning?: string;
};

export type CrossAcharya = {
  agree: string[];
  differ: string[];
  silent: string[];
};

export type Ai2AnswerLayout = {
  layout_type: Ai2LayoutType;
  headline?: string;
  direct_answer?: string;
  citations: Ai2Citation[];
  cross_acharya?: CrossAcharya;
  ui_hints?: {
    default_lang?: "en" | "hi";
    emphasize?: "compare" | "verse" | "summary";
  };
  strategies?: string[];
  quality_gate_passed?: boolean;
  clinical_caution?: string;
};

export type BackendMetaEvent = {
  type: "meta";
  layout_type?: Ai2LayoutType;
  headline?: string;
  citations?: Ai2Citation[];
  cross_acharya?: CrossAcharya;
  ui_hints?: Ai2AnswerLayout["ui_hints"];
  strategies?: string[];
  quality_gate_passed?: boolean;
  clinical_caution?: string;
  tools?: unknown[];
  session_id?: string;
};

export function metaToLayout(meta: BackendMetaEvent): Ai2AnswerLayout {
  return {
    layout_type: meta.layout_type ?? "general",
    headline: meta.headline,
    citations: meta.citations ?? [],
    cross_acharya: meta.cross_acharya,
    ui_hints: meta.ui_hints,
    strategies: meta.strategies,
    quality_gate_passed: meta.quality_gate_passed,
    clinical_caution: meta.clinical_caution,
  };
}
