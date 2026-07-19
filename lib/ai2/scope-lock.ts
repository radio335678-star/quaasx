/**
 * Build / validate SCOPE LOCK block injected into rustenv agent questions.
 * Keep in sync with backend/rustenv_agent_prompt.md SCOPE LOCK section.
 */
import {
  abbrevsForWorkNames,
  isValidClassicName,
  MAX_SCOPED_WORKS,
  MIN_SCOPED_WORKS,
  nameForAbbrev,
} from "./works";

export type ScopeResolution = {
  ok: true;
  names: string[];
  abbrevs: string[];
} | {
  ok: false;
  error: string;
};

export function resolveScopedClassics(
  scopedWorks?: string[] | null,
  scopedAbbrevs?: string[] | null
): ScopeResolution {
  const names: string[] = [];
  const abbrevs: string[] = [];

  if (scopedAbbrevs?.length) {
    for (const ab of scopedAbbrevs) {
      const name = nameForAbbrev(ab);
      if (!name) {
        return { ok: false, error: `Unknown text abbrev: ${ab}` };
      }
      if (!abbrevs.includes(ab)) {
        abbrevs.push(ab);
        names.push(name);
      }
    }
  } else if (scopedWorks?.length) {
    for (const name of scopedWorks) {
      if (!isValidClassicName(name)) {
        return { ok: false, error: `Unknown classic: ${name}` };
      }
      if (!names.includes(name)) {
        names.push(name);
      }
    }
    abbrevs.push(...abbrevsForWorkNames(names));
  }

  if (names.length < MIN_SCOPED_WORKS) {
    return {
      ok: false,
      error: `Select at least ${MIN_SCOPED_WORKS} classic (@) to query the library.`,
    };
  }
  if (names.length > MAX_SCOPED_WORKS) {
    return {
      ok: false,
      error: `Maximum ${MAX_SCOPED_WORKS} classics per query.`,
    };
  }

  return { ok: true, names, abbrevs };
}

export function buildScopeLockBlock(names: string[], abbrevs: string[]): string {
  const labeled = names
    .map((n, i) => `${n} (${abbrevs[i] ?? "?"})`)
    .join(", ");
  const inList = abbrevs.map((a) => `'${a}'`).join(",");
  return (
    `[SCOPE LOCK — mandatory]\n` +
    `User scoped these texts only: ${labeled}\n` +
    `Every db_sql / FTS / LIKE / sqlite3 query MUST include:\n` +
    `  t.text_abbrev IN (${inList})\n` +
    `Do not search other texts. Citations outside this set are invalid.\n` +
    `[/SCOPE LOCK]`
  );
}

export function applyScopeLockToQuestion(
  question: string,
  names: string[],
  abbrevs: string[]
): string {
  const block = buildScopeLockBlock(names, abbrevs);
  const q = question.trim();
  return q ? `${block}\n\n${q}` : block;
}
