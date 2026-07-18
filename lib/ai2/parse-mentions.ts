import {
  findWorkByName,
  LIBRARY_WORKS,
  MAX_SCOPED_WORKS,
  type LibraryWork,
} from "./works";

const NAME_SET = new Set(LIBRARY_WORKS.map((w) => w.name));

function longestCatalogFromAt(text: string, start: number): string | null {
  const rest = text.slice(start).trimStart();
  if (!rest) {
    return null;
  }
  const words = rest.split(/\s+/).slice(0, 4);
  let best: string | null = null;
  for (let i = 0; i < words.length; i += 1) {
    const chunk = words
      .slice(0, i + 1)
      .join(" ")
      .replace(/[,.;:!?)]+$/, "")
      .trim();
    if (!chunk) {
      continue;
    }
    if (NAME_SET.has(chunk)) {
      best = chunk;
      continue;
    }
    const work = findWorkByName(chunk);
    if (work) {
      best = work.name;
    }
  }
  if (best) {
    return best;
  }
  const first = words[0]?.replace(/[,.;:!?)]+$/, "") ?? "";
  return first ? findWorkByName(first)?.name ?? null : null;
}

/** Parse @Work mentions from message body (longest catalog name wins). */
export function extractScopedWorksFromText(text: string): string[] {
  if (!text.includes("@")) {
    return [];
  }
  const found: string[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== "@") {
      continue;
    }
    const name = longestCatalogFromAt(text, i + 1);
    if (name && !found.includes(name)) {
      found.push(name);
      if (found.length >= MAX_SCOPED_WORKS) {
        break;
      }
    }
  }
  return found;
}

export function stripScopedMentionsFromText(
  text: string,
  works: string[]
): string {
  if (!text || works.length === 0) {
    return text.trim();
  }
  let out = text;
  for (const name of [...works].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(
      `@${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$|[,.;:!?)])`,
      "gi"
    );
    out = out.replace(re, " ");
  }
  return out.replace(/\s+/g, " ").trim();
}

export function resolveScopedWorksFromInput(
  text: string,
  pickerWorks: LibraryWork[]
): { merged: LibraryWork[]; cleanText: string } {
  const fromPicker = pickerWorks.map((w) => w.name);
  const fromBody = extractScopedWorksFromText(text);
  const mergedNames: string[] = [];
  for (const name of [...fromPicker, ...fromBody]) {
    if (!mergedNames.includes(name)) {
      mergedNames.push(name);
    }
    if (mergedNames.length >= MAX_SCOPED_WORKS) {
      break;
    }
  }
  const merged = mergedNames
    .map((name) => LIBRARY_WORKS.find((w) => w.name === name))
    .filter((w): w is LibraryWork => Boolean(w));
  let cleanText = stripScopedMentionsFromText(text, mergedNames);
  if (merged.length > 0 && !cleanText) {
    cleanText = `Inquiry scoped to ${mergedNames.join(", ")}`;
  }
  return { merged, cleanText };
}

export function libraryWorksFromNames(names: string[]): LibraryWork[] {
  return names
    .map((name) => findWorkByName(name))
    .filter((w): w is LibraryWork => Boolean(w));
}
