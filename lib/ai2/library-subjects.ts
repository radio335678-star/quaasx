import catalog from "./library-catalog.json";

export type LibraryBook = {
  name: string;
  db_text_name: string | null;
  abbrev: string | null;
  tier: string;
  total_shlokas: number | null;
  translation_status?: Record<string, number> | null;
  category?: string | null;
};

export type LibrarySubject = {
  group_id: string;
  subject: string;
  short_name: string;
  display_name: string;
  agent_id: string;
  corpus_path: string;
  authors: string[];
  books: LibraryBook[];
  corpus_editions: Array<{
    folder: string;
    file_count: number;
    corpus_path: string;
    source?: string;
  }>;
  corpus_file_count: number;
};

export type LibraryCatalog = {
  version: number;
  generated_at: string;
  total_subjects: number;
  total_scoped_works: number;
  total_corpus_files: number;
  subjects: LibrarySubject[];
};

export const libraryCatalog = catalog as LibraryCatalog;

export function tierLabel(tier: string): string {
  return tier === "db" ? "Native core" : "Expanding depth";
}

export function primaryTranslation(book: {
  translation_status?: Record<string, number> | null;
}): "gold" | "machine" | "missing" | null {
  const ts = book.translation_status;
  if (!ts) {
    return null;
  }
  if (ts.gold) {
    return "gold";
  }
  if (ts.machine) {
    return "machine";
  }
  if (ts.missing) {
    return "missing";
  }
  return null;
}
