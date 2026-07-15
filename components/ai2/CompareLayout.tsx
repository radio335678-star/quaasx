"use client";

import { useMemo, useState } from "react";
import type { Ai2Citation } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";
import { ShlokaCard } from "./ShlokaCard";

function isCharaka(c: Ai2Citation) {
  const src = (c.source || "").toLowerCase();
  const id = (c.citation_id || "").toLowerCase();
  return src.includes("charaka") || src.includes("caraka") || id.startsWith("ca.");
}

function isSushruta(c: Ai2Citation) {
  const src = (c.source || "").toLowerCase();
  const id = (c.citation_id || "").toLowerCase();
  return (
    src.includes("sushruta") ||
    src.includes("sushrut") ||
    id.startsWith("su.")
  );
}

function bucketBySource(citations: Ai2Citation[]) {
  const charaka: Ai2Citation[] = [];
  const sushruta: Ai2Citation[] = [];
  const other: Ai2Citation[] = [];

  for (const c of citations) {
    if (isCharaka(c)) {
      charaka.push(c);
    } else if (isSushruta(c)) {
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
  compact,
  patientMode,
}: {
  title: string;
  citations: Ai2Citation[];
  defaultLang?: "en" | "hi";
  compact?: boolean;
  patientMode?: boolean;
}) {
  return (
    <section className="min-w-0 flex-1 space-y-3">
      <header className="sticky top-0 z-[1] flex items-center justify-between gap-2 border-b border-border/40 bg-background/95 py-2 backdrop-blur-md md:static md:border-0 md:bg-transparent md:py-0 md:backdrop-blur-none">
        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h4>
        <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {citations.length}
        </span>
      </header>
      {citations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-3 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            No grounded hits in corpus for this text.
          </p>
        </div>
      ) : (
        citations.map((c) => (
          <ShlokaCard
            citation={c}
            compact={compact}
            defaultLang={defaultLang}
            key={c.citation_id}
            patientMode={patientMode}
          />
        ))
      )}
    </section>
  );
}

type TabId = "charaka" | "sushruta" | "other";

export function CompareLayout({
  citations,
  defaultLang,
  patientMode,
}: {
  citations: Ai2Citation[];
  defaultLang?: "en" | "hi";
  patientMode?: boolean;
}) {
  const { charaka, sushruta, other } = useMemo(
    () => bucketBySource(citations),
    [citations]
  );
  const [tab, setTab] = useState<TabId>(
    charaka.length ? "charaka" : sushruta.length ? "sushruta" : "other"
  );

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "charaka", label: "Charaka", count: charaka.length },
    { id: "sushruta", label: "Sushruta", count: sushruta.length },
  ];
  if (other.length > 0) {
    tabs.push({ id: "other", label: "Other", count: other.length });
  }

  return (
    <div className="w-full space-y-4" data-testid="compare-layout">
      {/* Mobile: tabbed single column */}
      <div className="md:hidden">
        <div
          className="mb-3 flex gap-1 rounded-xl border border-border/40 bg-muted/30 p-1"
          role="tablist"
        >
          {tabs.map((t) => (
            <button
              aria-selected={tab === t.id}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors touch-manipulation",
                tab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              key={t.id}
              onClick={() => setTab(t.id)}
              role="tab"
              type="button"
            >
              {t.label}
              <span className="text-[10px] opacity-70">{t.count}</span>
            </button>
          ))}
        </div>
        {tab === "charaka" ? (
          <Column
            citations={charaka}
            compact
            defaultLang={defaultLang}
            patientMode={patientMode}
            title="Charaka Samhita"
          />
        ) : null}
        {tab === "sushruta" ? (
          <Column
            citations={sushruta}
            compact
            defaultLang={defaultLang}
            patientMode={patientMode}
            title="Sushruta Samhita"
          />
        ) : null}
        {tab === "other" ? (
          <Column
            citations={other}
            compact
            defaultLang={defaultLang}
            patientMode={patientMode}
            title="Other texts"
          />
        ) : null}
      </div>

      {/* Laptop+: equal two-column grid using full width */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-5 lg:gap-6">
        <Column
          citations={charaka}
          compact
          defaultLang={defaultLang}
          patientMode={patientMode}
          title="Charaka Samhita"
        />
        <Column
          citations={sushruta}
          compact
          defaultLang={defaultLang}
          patientMode={patientMode}
          title="Sushruta Samhita"
        />
      </div>
      {other.length > 0 ? (
        <div className="hidden space-y-3 md:block">
          <h4 className="text-sm font-semibold">Other texts</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {other.map((c) => (
              <ShlokaCard
                citation={c}
                compact
                defaultLang={defaultLang}
                key={c.citation_id}
                patientMode={patientMode}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
