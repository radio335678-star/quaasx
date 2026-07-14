import Link from "next/link";
import { brand, corpusCoverage } from "@/lib/brand";

export const metadata = {
  title: `Corpus — ${brand.name}`,
  description:
    "Query-ready classical coverage vs raw corpus still being ingested.",
};

function statusLabel(translation: string) {
  if (translation === "gold") {
    return "Verified English (gold)";
  }
  if (translation === "machine") {
    return "Working translation";
  }
  return "Sanskrit only (translation pending)";
}

export default function CorpusPage() {
  const totalReady = corpusCoverage.queryReady.reduce(
    (sum, t) => sum + t.shlokas,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28">
      <p className="mb-3 text-muted-foreground text-sm tracking-wide uppercase">
        Corpus
      </p>
      <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
        What is query-ready
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {brand.name} answers from a quality-gated unified corpus — cite-first
        classical text, not the entire tradition at once. Counts below reflect
        what is searchable today.
      </p>

      <p className="mt-8 text-muted-foreground text-sm">
        Query-ready shlokas:{" "}
        <span className="font-medium text-foreground">
          {totalReady.toLocaleString()}
        </span>
      </p>

      <section className="mt-10">
        <h2 className="mb-4 border-b border-border/40 pb-2 font-medium text-foreground">
          Query-ready texts
        </h2>
        <ul className="space-y-3">
          {corpusCoverage.queryReady.map((text) => (
            <li
              className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between"
              key={text.name}
            >
              <span className="text-foreground text-sm">{text.name}</span>
              <span className="text-muted-foreground text-sm">
                {text.shlokas.toLocaleString()} · {statusLabel(text.translation)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 border-b border-border/40 pb-2 font-medium text-foreground">
          Raw corpus (not fully query-ready)
        </h2>
        <p className="mb-3 text-muted-foreground text-sm">
          Present in the broader CORPUS archive; not yet fully loaded into the
          unified query index.
        </p>
        <ul className="space-y-2">
          {corpusCoverage.rawOnly.map((item) => (
            <li
              className="text-muted-foreground text-sm leading-relaxed"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

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
