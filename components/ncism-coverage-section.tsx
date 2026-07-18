"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import {
  NCISM_TABS,
  ncismCoverage,
  statusClass,
  statusLabel,
  type NcismSubject,
} from "@/lib/ai2/ncism-coverage";

export function NcismCoverageSection() {
  const [tab, setTab] = useState<(typeof NCISM_TABS)[number]["id"]>("I");
  const active = NCISM_TABS.find((t) => t.id === tab)!;
  const rows = ncismCoverage.subjects.filter(active.match);
  const summary = ncismCoverage.summary;

  return (
    <section className="mt-16 rounded-xl border border-border/50 p-6">
      <h2 className="font-medium text-foreground text-xl">NCISM subject coverage</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed">
        All {ncismCoverage.total_subjects} NCISM core subjects (20 UG + 18 PG) mapped to
        canonical Modal CORPUS paths or documented modern-only N/A.
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        {(["green", "amber", "red", "modern_na"] as const).map((k) => (
          <div className="rounded-lg border border-border/40 px-3 py-2" key={k}>
            <dt className="text-muted-foreground text-xs uppercase">{statusLabel(k)}</dt>
            <dd className="font-semibold text-lg">{summary[k] ?? 0}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/40 pb-3">
        {NCISM_TABS.map((t) => (
          <button
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
            key={t.id}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-4">
        {rows.map((s) => (
          <NcismRow key={s.code} subject={s} />
        ))}
      </ul>
    </section>
  );
}

function NcismRow({ subject }: { subject: NcismSubject }) {
  const scopeHint =
    subject.required_texts.length > 0
      ? subject.required_texts.slice(0, 3).map((t) => `@${t.split(" ")[0]}`).join(" ")
      : null;

  return (
    <li className="border-border/30 border-l-2 pl-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground text-sm">{subject.code}</span>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${statusClass(subject.coverage_status)}`}
        >
          {statusLabel(subject.coverage_status)}
        </span>
        <span className="text-muted-foreground text-xs">{subject.query_tier}</span>
      </div>
      <p className="mt-0.5 text-foreground text-sm">{subject.subject}</p>
      {subject.required_texts.length > 0 ? (
        <p className="mt-1 text-muted-foreground text-xs">
          Texts: {subject.required_texts.join(" · ")}
        </p>
      ) : (
        <p className="mt-1 text-muted-foreground text-xs">
          Modern curriculum — no classical TXT expected on volume
        </p>
      )}
      {subject.canonical_paths.length > 0 ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-muted-foreground text-xs hover:text-foreground">
            {subject.canonical_paths.length} Modal path(s)
          </summary>
          <ul className="mt-1 space-y-0.5 font-mono text-muted-foreground text-xs">
            {subject.canonical_paths.slice(0, 5).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </details>
      ) : null}
      {scopeHint ? (
        <Link
          className="mt-2 inline-block text-primary text-xs hover:underline"
          href={`${brand.appPath}?scope=${encodeURIComponent(scopeHint)}`}
        >
          Scope in chat →
        </Link>
      ) : null}
    </li>
  );
}
