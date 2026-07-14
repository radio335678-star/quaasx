"use client";

import type { Ai2Citation } from "@/lib/ai2/types";
import { ShlokaCard } from "./ShlokaCard";

function bucketBySource(citations: Ai2Citation[]) {
  const charaka: Ai2Citation[] = [];
  const sushruta: Ai2Citation[] = [];
  const other: Ai2Citation[] = [];

  for (const c of citations) {
    const src = (c.source || "").toLowerCase();
    if (src.includes("charaka")) {
      charaka.push(c);
    } else if (src.includes("sushruta")) {
      sushruta.push(c);
    } else {
      other.push(c);
    }
  }
  return { charaka, sushruta, other };
}

function Column({
  title,
  citations,
  defaultLang,
}: {
  title: string;
  citations: Ai2Citation[];
  defaultLang?: "en" | "hi";
}) {
  return (
    <div className="min-w-0 flex-1 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {citations.length === 0 ? (
        <p className="text-xs text-muted-foreground">No grounded hits in corpus.</p>
      ) : (
        citations.map((c) => (
          <ShlokaCard citation={c} defaultLang={defaultLang} key={c.citation_id} />
        ))
      )}
    </div>
  );
}

export function CompareLayout({
  citations,
  defaultLang,
}: {
  citations: Ai2Citation[];
  defaultLang?: "en" | "hi";
}) {
  const { charaka, sushruta, other } = bucketBySource(citations);

  return (
    <div className="space-y-4" data-testid="compare-layout">
      <div className="grid gap-4 md:grid-cols-2">
        <Column citations={charaka} defaultLang={defaultLang} title="Charaka Samhita" />
        <Column citations={sushruta} defaultLang={defaultLang} title="Sushruta Samhita" />
      </div>
      {other.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Other texts</h4>
          {other.map((c) => (
            <ShlokaCard citation={c} defaultLang={defaultLang} key={c.citation_id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
