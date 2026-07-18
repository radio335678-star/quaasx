import type { AudienceMode } from "./audience-mode";

/**
 * Frontend-only audience tuning for ai2-rust-env.
 * Modal agent keeps AGENT_PROMPT.md (scholar baseline); we steer via the user question string.
 */

const PATIENT_INSTRUCTIONS = `[Audience: Patient mode]

Answer for a lay reader, not a vaidya or student.

- Use plain English first; avoid Sanskrit terms unless you immediately gloss them in simple words.
- Lead with a short, direct answer (2–4 sentences), then optional brief evidence.
- Keep shloka evidence minimal (1–3 citations max); quote English from DB when available; for AH/AS/MN Sanskrit-only gold, give a plain-English paraphrase of the Sanskrit (not a fake stored translation); skip padaccheda and long commentary unless essential.
- Emphasize safety: classical context only, not personal medical advice; say when evidence is thin.
- Same cite-first rules: confirm rows in the library DB; prefer translation_status=gold (including Sanskrit-canonical AH/AS/MN); never invent citation IDs.`;

const CLINICIAN_INSTRUCTIONS = `[Audience: Clinician mode]

Answer for a practicing Ayurveda clinician (BAMS-level), not an exam scholar.

- Structure clinically when relevant: nidana → lakshana → samprapti sketch → chikitsa (including diet, lifestyle, formulations mentioned in classical texts).
- Prefer actionable classical chikitsa from retrieved rows; name herbs/formulations only when supported by DB evidence with citation_id.
- Compare Charaka / Sushruta / others briefly when texts agree or differ on management.
- Use concise Sanskrit or IAST for key terms; English from DB when present; for AH/AS/MN Sanskrit-canonical gold (empty english_explanation), paraphrase Sanskrit clinically — English from model, not a stored gold English field.
- Same cite-first rules: confirm shlokas in DB; prefer gold (including Sanskrit-canonical AH/AS/MN); never invent IDs or modern drug advice.`;

export function audienceInstructions(mode: AudienceMode): string | null {
  if (mode === "patient") {
    return PATIENT_INSTRUCTIONS;
  }
  if (mode === "clinician") {
    return CLINICIAN_INSTRUCTIONS;
  }
  return null;
}

/** Prepend mode block to the agent question (scholar = unchanged). */
export function applyAudiencePrompt(
  question: string,
  mode: AudienceMode,
  maxChars = 8000
): string {
  const trimmed = question.trim();
  if (!trimmed || mode === "scholar") {
    return trimmed;
  }

  const instructions = audienceInstructions(mode);
  if (!instructions) {
    return trimmed;
  }

  const prefix = `${instructions}\n\n---\n\n`;
  const budget = maxChars - prefix.length;
  if (budget < 200) {
    return trimmed.slice(0, maxChars);
  }

  const body =
    trimmed.length > budget ? trimmed.slice(trimmed.length - budget) : trimmed;
  return `${prefix}${body}`;
}
