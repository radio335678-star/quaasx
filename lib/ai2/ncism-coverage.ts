import coverage from "./ncism-coverage.json";

export type NcismCoverageStatus = "green" | "amber" | "red" | "modern_na";

export type NcismSubject = {
  code: string;
  subject: string;
  level: string;
  professional_year: string;
  required_texts: string[];
  corpus_groups: string[];
  text_ids: string[];
  canonical_paths: string[];
  coverage_status: NcismCoverageStatus;
  query_tier: string;
  tier?: string;
};

export type NcismCoverage = {
  version: number;
  generated_at: string;
  total_subjects: number;
  summary: Record<NcismCoverageStatus, number>;
  classical_subjects: number;
  modern_na_subjects: number;
  subjects: NcismSubject[];
};

export const ncismCoverage = coverage as NcismCoverage;

export const NCISM_TABS = [
  { id: "I", label: "I Prof", match: (s: NcismSubject) => s.professional_year === "I" },
  { id: "II", label: "II Prof", match: (s: NcismSubject) => s.professional_year === "II" },
  { id: "III", label: "III Prof", match: (s: NcismSubject) => s.professional_year === "III" },
  { id: "PG", label: "PG", match: (s: NcismSubject) => s.professional_year === "PG" },
] as const;

export function statusLabel(status: NcismCoverageStatus): string {
  switch (status) {
    case "green":
      return "Covered";
    case "amber":
      return "Partial";
    case "red":
      return "Gap";
    case "modern_na":
      return "Modern N/A";
    default:
      return status;
  }
}

export function statusClass(status: NcismCoverageStatus): string {
  switch (status) {
    case "green":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "amber":
      return "bg-amber-500/15 text-amber-800 dark:text-amber-400";
    case "red":
      return "bg-red-500/15 text-red-700 dark:text-red-400";
    case "modern_na":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}
