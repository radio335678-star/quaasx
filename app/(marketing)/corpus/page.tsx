import Link from "next/link";
import { brand } from "@/lib/brand";
import { libraryCatalog, primaryTranslation, tierLabel } from "@/lib/ai2/library-subjects";
import { NcismCoverageSection } from "@/components/ncism-coverage-section";

export const metadata = {
  title: `${brand.fullName} — ${brand.name}`,
  description:
    "AI² Hybrid Engine: proprietary cite-first classical intelligence built on the Samhitas — Ancient Intelligence × Artificial Intelligence.",
};

function masteryNote(book: {
  tier: string;
  abbrev?: string | null;
  total_shlokas: number | null;
  translation_status?: Record<string, number> | null;
}) {
  if (book.tier !== "db") {
    return "Depth expanding";
  }
  const t = primaryTranslation(book);
  if (t === "gold") {
    if (
      book.abbrev === "AH" ||
      book.abbrev === "AS" ||
      book.abbrev === "Sy" ||
      book.abbrev === "Ck"
    ) {
      return "Sanskrit-native mastery";
    }
    return "Full classical mastery";
  }
  if (t === "machine") {
    return "Active refinement";
  }
  if (book.total_shlokas) {
    return "Sanskrit-native · refining voice";
  }
  return "Woven into the engine";
}

export default function CorpusPage() {
  const coreWorks = libraryCatalog.subjects.flatMap((s) =>
    s.books.filter((b) => b.tier === "db")
  );
  const totalVerses = coreWorks.reduce(
    (sum, b) => sum + (b.total_shlokas ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28">
      <p className="mb-3 text-muted-foreground text-sm tracking-wide uppercase">
        {brand.fullName}
      </p>
      <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
        Built on classical intelligence — not bolted on
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {brand.name} ({brand.spokenName}) is a proprietary hybrid model from{" "}
        {brand.companyShort}: {brand.equation}. Classical Ayurveda is not a
        search layer on top of a generic chatbot — it is the architecture the
        system was designed around.
      </p>

      <div className="mt-8 rounded-xl border border-border/50 bg-muted/20 px-5 py-5 md:px-6">
        <p className="font-medium text-foreground text-sm">
          State-of-the-art cite-first framework
        </p>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          The Hybrid Engine couples deep classical reasoning with modern
          inference so every answer can anchor to real Acharya lines — Devanagari,
          transliteration, and meaning — with Agree / Differ / Silent across
          traditions. You get the fluency of AI with the discipline of the
          Samhitas.
        </p>
        <ul className="mt-4 grid gap-2 text-muted-foreground text-sm sm:grid-cols-2">
          <li>Native six-classic scope (@Charaka, @Sushruta, …)</li>
          <li>Verse-level citation gate — no invented IDs</li>
          <li>Cross-Acharya compare in one conversation</li>
          <li>Sanskrit-canonical mastery for Vagbhata, Siddhayoga, Cakradatta</li>
        </ul>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/50 px-4 py-3">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">
            Knowledge domains
          </dt>
          <dd className="mt-1 font-semibold text-2xl">
            {libraryCatalog.total_subjects}
          </dd>
        </div>
        <div className="rounded-lg border border-border/50 px-4 py-3">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">
            Verses internalized
          </dt>
          <dd className="mt-1 font-semibold text-2xl">
            {totalVerses > 0 ? totalVerses.toLocaleString() : "67,004+"}
          </dd>
        </div>
        <div className="rounded-lg border border-border/50 px-4 py-3">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">
            Core Samhitas
          </dt>
          <dd className="mt-1 font-semibold text-2xl">{coreWorks.length}</dd>
        </div>
      </dl>

      <p className="mt-10 text-muted-foreground text-sm">
        What follows is the classical breadth the engine is shaped on — by
        subject, by Acharya tradition — not a reading list.
      </p>

      <div className="mt-8 space-y-14">
        {libraryCatalog.subjects.map((subject) => (
          <section key={subject.group_id}>
            <h2 className="border-b border-border/40 pb-2 font-medium text-foreground text-xl">
              {subject.short_name}
            </h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {subject.subject}
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
                        {book.abbrev}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {tierLabel(book.tier)}
                    {book.total_shlokas != null
                      ? ` · ${book.total_shlokas.toLocaleString()} verses`
                      : ""}
                    {" · "}
                    {masteryNote(book)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <NcismCoverageSection />

      <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          className="inline-flex justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
          href={brand.appPath}
        >
          Experience {brand.name}
        </Link>
        <Link
          className="inline-flex justify-center rounded-md border border-border/60 px-6 py-3 font-medium text-foreground text-sm transition-colors hover:bg-muted/40"
          href="/product"
        >
          How the Hybrid Engine works
        </Link>
      </div>
    </div>
  );
}
