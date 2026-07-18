/** Canonical 35 classical works — keep in sync with backend/ai2_scoped_works.py */
export type LibraryWork = {
  id: string;
  name: string;
  groupId: string;
  agentId: string;
  shortGroup: string;
  dbReady: boolean;
};

const GROUP_META: Record<
  string,
  { agentId: string; shortGroup: string }
> = {
  "01_brihat_trayi": { agentId: "brihat-trayi-acharya", shortGroup: "Brihat Trayi" },
  "02_laghu_trayi": { agentId: "laghu-trayi-vaidya", shortGroup: "Laghu Trayi" },
  "03_other_samhitas": { agentId: "samhita-minor-scholar", shortGroup: "Other Samhitas" },
  "04_chikitsa_granthas": { agentId: "chikitsa-yoga-expert", shortGroup: "Chikitsa" },
  "05_nighantus": { agentId: "nighantu-dravyaguna", shortGroup: "Nighantus" },
  "06_rasa_shastra": { agentId: "rasa-shastra-acharya", shortGroup: "Rasa Shastra" },
  "07_vedic_jyotisha": { agentId: "vedic-jyotisha-rishi", shortGroup: "Vedic & Jyotisha" },
  "08_reference": { agentId: "reference-kosha", shortGroup: "Reference" },
};

const RAW_WORKS: Array<{ name: string; groupId: string; dbReady: boolean }> = [
  { name: "Charaka Samhita", groupId: "01_brihat_trayi", dbReady: true },
  { name: "Sushruta Samhita", groupId: "01_brihat_trayi", dbReady: true },
  { name: "Ashtanga Hridayam", groupId: "01_brihat_trayi", dbReady: true },
  { name: "Ashtanga Sangraha", groupId: "01_brihat_trayi", dbReady: true },
  { name: "Madhava Nidana", groupId: "02_laghu_trayi", dbReady: true },
  { name: "Sharangadhara Samhita", groupId: "02_laghu_trayi", dbReady: true },
  { name: "Bhava Prakasha", groupId: "02_laghu_trayi", dbReady: true },
  { name: "Cakradatta", groupId: "03_other_samhitas", dbReady: true },
  { name: "Kashyapa Samhita", groupId: "03_other_samhitas", dbReady: true },
  { name: "Harita Samhita", groupId: "03_other_samhitas", dbReady: true },
  { name: "Bhela Samhita", groupId: "03_other_samhitas", dbReady: true },
  { name: "Bhaishajya Ratnavali", groupId: "04_chikitsa_granthas", dbReady: true },
  { name: "Dhanvantari Nighantu", groupId: "05_nighantus", dbReady: true },
  { name: "Madanapala Nighantu", groupId: "05_nighantus", dbReady: true },
  { name: "Raja Nighantu", groupId: "05_nighantus", dbReady: true },
  { name: "Shaligram Nighantu", groupId: "05_nighantus", dbReady: true },
  { name: "Yogaratnakara", groupId: "06_rasa_shastra", dbReady: true },
  { name: "Rasendra Sara Sangraha", groupId: "06_rasa_shastra", dbReady: true },
  { name: "Atharva Veda Samhita", groupId: "07_vedic_jyotisha", dbReady: true },
  { name: "Rig Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Rik Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Taittiriya Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Bhrigu Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Brihat Samhita", groupId: "07_vedic_jyotisha", dbReady: true },
  { name: "Garga Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Dhanurveda", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Dhanurveda Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Sandilya Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Lakshminarayana Samhita", groupId: "07_vedic_jyotisha", dbReady: false },
  { name: "Ayurveda Shabdarnava", groupId: "08_reference", dbReady: true },
  { name: "Ayurveda Ka Itihas", groupId: "08_reference", dbReady: false },
  { name: "Library catalogs", groupId: "08_reference", dbReady: false },
  { name: "Periodicals", groupId: "08_reference", dbReady: false },
  { name: "Modern product treatises", groupId: "08_reference", dbReady: false },
  { name: "Modern reinterpretations", groupId: "08_reference", dbReady: false },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const LIBRARY_WORKS: LibraryWork[] = RAW_WORKS.map((w) => {
  const meta = GROUP_META[w.groupId];
  return {
    id: slugify(w.name),
    name: w.name,
    groupId: w.groupId,
    agentId: meta.agentId,
    shortGroup: meta.shortGroup,
    dbReady: w.dbReady,
  };
});

export const MAX_SCOPED_WORKS = 5;

export function filterWorks(query: string): LibraryWork[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return LIBRARY_WORKS;
  }
  return LIBRARY_WORKS.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.shortGroup.toLowerCase().includes(q) ||
      w.agentId.toLowerCase().includes(q)
  );
}

export function findWorkByName(name: string): LibraryWork | undefined {
  const key = name.trim().toLowerCase();
  return LIBRARY_WORKS.find((w) => w.name.toLowerCase() === key);
}
