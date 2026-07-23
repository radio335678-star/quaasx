import type { AudienceMode } from "./audience-mode";

/**
 * Frontend-only audience tuning for ai2-rust-env.
 * Modal agent keeps AGENT_PROMPT.md (scholar baseline); we steer via the user question string.
 */

const PATIENT_INSTRUCTIONS = `[Audience: Patient mode]

Answer for a lay reader, not a vaidya or student.

- Use plain English first; avoid Sanskrit terms unless you immediately gloss them in simple words.
- Lead with a short, direct answer (2–4 sentences), then optional brief evidence.
- Keep shloka evidence minimal (1–3 citations max); quote classical English when available; for AH/AS/Sy/Ck Sanskrit-only sources, give a plain-English paraphrase of the Sanskrit (not a fake stored translation); skip padaccheda and long commentary unless essential.
- Emphasize safety: classical context only, not personal medical advice; say when evidence is thin.
- Cite-first: confirm verses before claiming them; prefer gold-quality sources; never invent citation IDs.
- Never mention databases, gold rows, retrieval, or tools in the answer.`;

/** Flash / knowledge-only patient voice — no DB or tool jargon. */
const PATIENT_NATIVE_INSTRUCTIONS = `[Audience: Patient mode]

Answer like a native AI assistant for a lay reader.

- Plain English first; gloss any Sanskrit term immediately.
- Lead with a short direct answer, then optional brief evidence.
- If you can support the point with 1–2 well-attested classical references (text + chapter/verse and a short English explanation), include them. Never invent verses or citation IDs.
- Never mention databases, web search, tools, URLs, or which books you opened.
- Educational context only — not personal medical advice.`;

const SCHOLAR_INSTRUCTIONS = `[Audience: Scholar mode]

Answer for an Ayurveda scholar / serious student.

- Write the main answer in clear English unless the user explicitly asks for Hindi or Sanskrit.
- Quote shlokas in Devanagari or IAST, then give a short English meaning — do not write the entire answer in Hindi/Sanskrit.
- Cite-first with text + chapter/verse (and citation_id when known); never invent IDs.
- Cross-Acharya briefly when relevant: Agree / Differ / Silent.
- Never narrate retrieval, gold rows, databases, or tools.`;

const CLINICIAN_INSTRUCTIONS = `[Audience: Clinician mode]

Answer for a practicing Ayurveda clinician (BAMS-level), not an exam scholar.

- Write the main answer in clear English unless the user explicitly asks for Hindi or Sanskrit.
- Quote shlokas in Devanagari/IAST with a short English gloss — do not write the whole answer in Hindi/Sanskrit.
- Structure clinically when relevant: nidana → lakshana → samprapti sketch → chikitsa (including diet, lifestyle, formulations mentioned in classical texts).
- Prefer actionable classical chikitsa supported by cited verses; name herbs/formulations only when classical evidence supports them.
- Compare Charaka / Sushruta / others briefly when texts agree or differ on management.
- Use concise Sanskrit or IAST for key terms; weave English naturally; for AH/AS/Sy/Ck Sanskrit-canonical sources, paraphrase Sanskrit clinically without meta disclaimers.
- Cite-first; never invent IDs or modern drug advice. Never narrate retrieval, gold rows, or library/DB mechanics.`;

export function audienceInstructions(
  mode: AudienceMode,
  opts?: { nativeKnowledge?: boolean; nativeWeb?: boolean }
): string | null {
  if (mode === "patient") {
    return opts?.nativeKnowledge || opts?.nativeWeb
      ? PATIENT_NATIVE_INSTRUCTIONS
      : PATIENT_INSTRUCTIONS;
  }
  if (mode === "clinician") {
    return CLINICIAN_INSTRUCTIONS;
  }
  if (mode === "scholar") {
    return SCHOLAR_INSTRUCTIONS;
  }
  return null;
}

/** Prepend mode block to the agent question. */
export function applyAudiencePrompt(
  question: string,
  mode: AudienceMode,
  maxChars = 8000,
  opts?: { nativeKnowledge?: boolean; nativeWeb?: boolean }
): string {
  const trimmed = question.trim();
  if (!trimmed) {
    return trimmed;
  }

  const instructions = audienceInstructions(mode, opts);
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
