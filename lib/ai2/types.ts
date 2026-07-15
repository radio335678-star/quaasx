export type Ai2LayoutType =
  | "clinical_compare"
  | "shloka_study"
  | "nidana"
  | "quick_fact"
  | "citation_lookup"
  | "mcq_exam"
  | "treatment_plan"
  | "general";

export type PadacchedaEntry = {
  word: string;
  gloss_en: string;
};

export type Ai2Commentary = {
  commentator: string;
  text?: string;
  iast?: string;
  english?: string;
  critic_note?: string;
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
  commentaries?: Ai2Commentary[];
  critic_note?: string;
};

export type CrossAcharya = {
  agree: string[];
  differ: string[];
  silent: string[];
};

export type SampraptiStage = {
  label?: string;
  name?: string;
  citation_ids?: string[];
};

export type SampraptiMapData = {
  stages?: SampraptiStage[];
};

export type TantrayuktiData = {
  name?: string;
  yukti?: string;
  note?: string;
  text?: string;
  description?: string;
};

export type CriticData = {
  note?: string;
  summary?: string;
  text?: string;
};

export type SafetyHerb = {
  common?: string;
  botanical?: string;
  class?: string;
};

export type ClinicalSafetyBannerData = {
  level?: string;
  title?: string;
  body?: string;
  herbs?: SafetyHerb[];
};

export type TreatmentPlanStage = {
  id: string;
  title: string;
  summary?: string;
};

export type TreatmentPlanData = {
  stages?: TreatmentPlanStage[];
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
    audience?: "patient" | "scholar";
    hide_padaccheda_default?: boolean;
  };
  strategies?: string[];
  quality_gate_passed?: boolean;
  clinical_caution?: string;
  samprapti_map?: SampraptiMapData;
  tantrayukti?: TantrayuktiData | string;
  critic?: CriticData | string;
  audience_mode?: "patient" | "scholar";
  safety_banner?: ClinicalSafetyBannerData;
  safety_warnings?: string[];
  treatment_plan?: TreatmentPlanData;
};

export type BackendMetaEvent = {
  type: "meta";
  layout_type?: Ai2LayoutType;
  headline?: string;
  direct_answer?: string;
  citations?: Ai2Citation[];
  cross_acharya?: CrossAcharya;
  ui_hints?: Ai2AnswerLayout["ui_hints"];
  strategies?: string[];
  quality_gate_passed?: boolean;
  clinical_caution?: string;
  samprapti_map?: SampraptiMapData;
  tantrayukti?: TantrayuktiData | string;
  critic?: CriticData | string;
  audience_mode?: "patient" | "scholar";
  safety_banner?: ClinicalSafetyBannerData;
  safety_warnings?: string[];
  treatment_plan?: TreatmentPlanData;
  tools?: unknown[];
  session_id?: string;
};

export function metaToLayout(meta: BackendMetaEvent): Ai2AnswerLayout {
  return {
    layout_type: meta.layout_type ?? "general",
    headline: meta.headline,
    direct_answer: meta.direct_answer,
    citations: meta.citations ?? [],
    cross_acharya: meta.cross_acharya,
    ui_hints: meta.ui_hints,
    strategies: meta.strategies,
    quality_gate_passed: meta.quality_gate_passed,
    clinical_caution: meta.clinical_caution,
    samprapti_map: meta.samprapti_map,
    tantrayukti: meta.tantrayukti,
    critic: meta.critic,
    audience_mode: meta.audience_mode,
    safety_banner: meta.safety_banner,
    safety_warnings: meta.safety_warnings,
    treatment_plan: meta.treatment_plan,
  };
}
