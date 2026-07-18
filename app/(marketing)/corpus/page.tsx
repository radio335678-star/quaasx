import Link from "next/link";
import { brand } from "@/lib/brand";
import { libraryCatalog, primaryTranslation, tierLabel } from "@/lib/ai2/library-subjects";
import { NcismCoverageSection } from "@/components/ncism-coverage-section";

export const metadata = {
  title: `Corpus — ${brand.name}`,
  description:
    "Subject-wise Ayurveda books on the AI² Modal library — DB query tier vs raw CORPUS editions.",
};

function translationNote(book: {
  tier: string;
  abbrev?: string | null;
  total_shlokas: number | null;
  translation_status?: Record<string, number> | null;
}) {
  if (book.tier !== "db") {
    return "Raw `.txt` editions on volume";
  }
  const t = primaryTranslation(book);
  if (t === "gold") {
    // AH/AS are Sanskrit-canonical gold (no stored English); others are English gold.
    if (book.abbrev === "AH" || book.abbrev === "AS") {
      return "Sanskrit gold — English from model when needed";
    }
    return "Verified English (gold)";
  }
  if (t === "machine") {
    return "Working translation";
  }
  if (book.total_shlokas) {
    return "Sanskrit in DB (translation pending)";
  }
  return "In unified DB";
}

export default function CorpusPage() {
  const dbBooks = libraryCatalog.subjects.flatMap((s) =>
    s.books.filter((b) => b.tier === "db")
  );
  const totalReady = dbBooks.reduce(
    (sum, b) => sum + (b.total_shlokas ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28">
      <p className="mb-3 text-muted-foreground text-sm tracking-wide uppercase">
        Corpus
      </p>
      <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
        Ayurveda library by subject
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {brand.name} mounts a single Modal volume at{" "}
        <code className="text-foreground text-sm">/data</code> — unified DB for
        cite-first answers, plus raw classical editions grouped by Ayurveda
        subject.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/50 px-4 py-3">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">
            Subjects
          </dt>
          <dd className="mt-1 font-semibold text-2xl">
            {libraryCatalog.total_subjects}
          </dd>
        </div>
        <div className="rounded-lg border border-border/50 px-4 py-3">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">
            DB shlokas
          </dt>
          <dd className="mt-1 font-semibold text-2xl">
            {totalReady > 0 ? totalReady.toLocaleString() : "67,004+"}
          </dd>
        </div>
        <div className="rounded-lg border border-border/50 px-4 py-3">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">
            Raw edition files
          </dt>
          <dd className="mt-1 font-semibold text-2xl">
            {libraryCatalog.total_corpus_files}
          </dd>
        </div>
      </dl>

      <div className="mt-12 space-y-14">
        {libraryCatalog.subjects.map((subject) => (
          <section key={subject.group_id}>
            <h2 className="border-b border-border/40 pb-2 font-medium text-foreground text-xl">
              {subject.short_name}
            </h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {subject.subject}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              Agent:{" "}
              <span className="font-mono text-foreground/80">
                {subject.agent_id}
              </span>
              {" · "}
              {subject.corpus_file_count} raw file
              {subject.corpus_file_count === 1 ? "" : "s"}
            </p>

            <ul className="mt-4 space-y-3">
              {subject.books.map((book) => (
                <li
                  className="flex flex-col gap-0.5 border-border/30 border-l-2 pl-3 sm:flex-row sm:items-baseline sm:justify-between"
                  key={`${subject.group_id}-${book.name}`}
                >
                  <span className="text-foreground text-sm">
                    {book.name}
                    {book.abbrev ? (
                      <span className="ml-2 text-muted-foreground text-xs">
                        ({book.abbrev})
                      </span>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {tierLabel(book.tier)}
                    {book.total_shlokas != null
                      ? ` · ${book.total_shlokas.toLocaleString()} shlokas`
                      : ""}
                    {" · "}
                    {translationNote(book)}
                  </span>
                </li>
              ))}
            </ul>

            {subject.corpus_editions.length > 0 ? (
              <details className="mt-4">
                <summary className="cursor-pointer text-muted-foreground text-sm hover:text-foreground">
                  Edition folders on volume ({subject.corpus_editions.length})
                </summary>
                <ul className="mt-2 space-y-1 pl-2">
                  {subject.corpus_editions.map((ed) => (
                    <li
                      className="font-mono text-muted-foreground text-xs"
                      key={ed.corpus_path}
                    >
                      {ed.folder}
                      {ed.file_count > 0 ? ` — ${ed.file_count} file(s)` : ""}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>
        ))}
      </div>

      <NcismCoverageSection />

      <div className="mt-14">
        <Link
          className="inline-flex rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
          href={brand.appPath}
        >
          Ask {brand.name}
        </Link>
      </div>
    </div>
  );
}
