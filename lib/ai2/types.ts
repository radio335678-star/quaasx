export type ScopedWorkEntry = {
  name: string;
  tier: "db" | "corpus" | "unknown";
  group_id?: string;
  agent_id?: string;
  short_group?: string;
};

export type ScopedCoverageSummary = {
  skip_fts_preflight?: boolean;
  db_works?: string[];
  corpus_works?: string[];
};

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

export type ExamSlots = {
  format?: string;
  stem?: string;
  options?: { label?: string; text?: string }[];
  left_column?: string[];
  right_column?: string[];
  blanks?: string[];
  require_citation_for_answer?: boolean;
};

export type ExamVerdict = {
  status?: "insufficient_evidence" | "answered" | "evidence_only" | string;
  chosen_option?: string | null;
  reason?: string;
  supporting_citation_ids?: string[];
};

export type EngineTrace = {
  phase?: string;
  intent?: string;
  classifier_source?: string;
  confidence?: number;
  plan_type?: string;
  deepened?: boolean;
  react_recovery?: boolean;
  retrieval_query?: string;
  audience_mode?: string;
  epistemic_mode?: string;
  epistemic_escalated?: boolean;
  epistemic_verified_count?: number;
  epistemic_rejected?: string[];
};

export type QueryUnderstandingSummary = {
  intent?: string;
  confidence?: number;
  classifier_source?: string;
  phase?: string;
};

export type RetrievalPlanSummary = {
  plan_type?: string;
  strategies?: string[];
  schema_version?: string;
};

export type EpistemicSummary = {
  mode?: string;
  escalated?: boolean;
  accepted_ids?: string[];
  rejected_ids?: string[];
  verified_count?: number;
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
  engine_trace?: EngineTrace;
  query_understanding?: QueryUnderstandingSummary;
  retrieval_plan?: RetrievalPlanSummary;
  epistemic?: EpistemicSummary;
  exam?: ExamSlots;
  exam_verdict?: ExamVerdict;
  scoped_works?: ScopedWorkEntry[];
  scoped_coverage?: ScopedCoverageSummary;
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
  engine_trace?: EngineTrace;
  query_understanding?: QueryUnderstandingSummary;
  retrieval_plan?: RetrievalPlanSummary;
  epistemic?: EpistemicSummary;
  exam?: ExamSlots;
  exam_verdict?: ExamVerdict;
  scoped_works?: ScopedWorkEntry[];
  scoped_coverage?: ScopedCoverageSummary;
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
    engine_trace: meta.engine_trace,
    query_understanding: meta.query_understanding,
    retrieval_plan: meta.retrieval_plan,
    epistemic: meta.epistemic,
    exam: meta.exam,
    exam_verdict: meta.exam_verdict,
    scoped_works: meta.scoped_works,
    scoped_coverage: meta.scoped_coverage,
  };
}
