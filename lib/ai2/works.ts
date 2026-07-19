/** Six gold classics for @-scope — keep in sync with backend SCOPED_CLASSICS. */
export type LibraryWork = {
  id: string;
  name: string;
  abbrev: string;
  groupId: string;
  agentId: string;
  shortGroup: string;
  dbReady: boolean;
};

const GROUP_META: Record<
  string,
  { agentId: string; shortGroup: string }
> = {
  "01_brihat_trayi": {
    agentId: "brihat-trayi-acharya",
    shortGroup: "Brihat Trayi",
  },
  "02_laghu_trayi": {
    agentId: "laghu-trayi-vaidya",
    shortGroup: "Laghu Trayi",
  },
  "03_other_samhitas": {
    agentId: "samhita-minor-scholar",
    shortGroup: "Chikitsa",
  },
};

/** Closed set for composer @ mentions and picker. */
const RAW_CLASSICS: Array<{
  name: string;
  abbrev: string;
  groupId: string;
}> = [
  { name: "Charaka Samhita", abbrev: "Ca", groupId: "01_brihat_trayi" },
  { name: "Sushruta Samhita", abbrev: "Su", groupId: "01_brihat_trayi" },
  { name: "Ashtanga Hridayam", abbrev: "AH", groupId: "01_brihat_trayi" },
  { name: "Ashtanga Sangraha", abbrev: "AS", groupId: "01_brihat_trayi" },
  {
    name: "Siddhayoga (Vrindamadhava)",
    abbrev: "Sy",
    groupId: "02_laghu_trayi",
  },
  { name: "Cakradatta", abbrev: "Ck", groupId: "03_other_samhitas" },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const LIBRARY_WORKS: LibraryWork[] = RAW_CLASSICS.map((w) => {
  const meta = GROUP_META[w.groupId];
  return {
    id: slugify(w.name),
    name: w.name,
    abbrev: w.abbrev,
    groupId: w.groupId,
    agentId: meta.agentId,
    shortGroup: meta.shortGroup,
    dbReady: true,
  };
});

export const MAX_SCOPED_WORKS = 3;
export const MIN_SCOPED_WORKS = 1;

/** Default classic for demos / suggested actions under the min-1 rule. */
export const DEFAULT_SCOPED_WORK: LibraryWork = LIBRARY_WORKS[0];

const ABBREV_BY_NAME = new Map(
  LIBRARY_WORKS.map((w) => [w.name.toLowerCase(), w.abbrev] as const)
);
const NAME_BY_ABBREV = new Map(
  LIBRARY_WORKS.map((w) => [w.abbrev, w.name] as const)
);

export function filterWorks(query: string): LibraryWork[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return LIBRARY_WORKS;
  }
  return LIBRARY_WORKS.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.abbrev.toLowerCase().includes(q) ||
      w.shortGroup.toLowerCase().includes(q) ||
      w.agentId.toLowerCase().includes(q)
  );
}

export function findWorkByName(name: string): LibraryWork | undefined {
  const key = name.trim().toLowerCase();
  return LIBRARY_WORKS.find((w) => w.name.toLowerCase() === key);
}

export function abbrevForWorkName(name: string): string | undefined {
  return ABBREV_BY_NAME.get(name.trim().toLowerCase());
}

export function nameForAbbrev(abbrev: string): string | undefined {
  return NAME_BY_ABBREV.get(abbrev);
}

export function abbrevsForWorkNames(names: string[]): string[] {
  const out: string[] = [];
  for (const name of names) {
    const ab = abbrevForWorkName(name);
    if (ab && !out.includes(ab)) {
      out.push(ab);
    }
  }
  return out;
}

export function isValidClassicName(name: string): boolean {
  return Boolean(findWorkByName(name));
}
