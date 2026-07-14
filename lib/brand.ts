/**
 * AI² brand config — single source of truth for product chrome + marketing.
 * Company: QUAASX 108 PVT LTD. Never compare to other AI products in UI copy.
 */
export const brand = {
  name: "AI²",
  spokenName: "AI Square",
  fullName: "AI² Hybrid Engine",
  company: "QUAASX 108 PVT LTD",
  companyShort: "QUAASX",
  title: "AI² — Ancient Intelligence × Artificial Intelligence",
  description:
    "Grounded classical answers with Sanskrit citations — built by QUAASX 108 PVT LTD.",
  tagline: "Ancient Intelligence × Artificial Intelligence",
  headline: "Classical Ayurveda. Grounded answers.",
  equation: "Ancient Intelligence × Artificial Intelligence",
  greeting: "What can I help with?",
  greetingSubtitle:
    "Ask about shlokas, herbs, diagnosis, or any classical Ayurvedic text.",
  disclaimer:
    "AI² is a research assistant. Verify classical citations before clinical use.",
  claim:
    "Cite-first classical answers — Sanskrit, transliteration, English, and cross-text clarity.",
  metadataBase: "https://ai2.quaasx.com",
  appPath: "/app",
  logo: "/brand/ai2-logo.png",
  mark: "/brand/ai2-mark.svg",
  companyWordmark: "/brand/quaasx-wordmark.png",
  hybridArt: "/brand/ai2-hybrid-engine.png",
  headerCtaLabel: "",
  headerCtaHref: "",
} as const;

export const brandSuggestions = [
  "What does Charaka say about jwara?",
  "Explain the concept of Agni with citations",
  "Compare Sushruta and Charaka on raktamokshana",
  "List rasa and virya of Triphala",
] as const;

/** Query-ready corpus snapshot (update after rebuild) */
export const corpusCoverage = {
  queryReady: [
    { name: "Charaka Samhita", shlokas: 4653, translation: "gold" },
    { name: "Sushruta Samhita", shlokas: 5241, translation: "gold" },
    { name: "Ashtanga Hridayam", shlokas: 15439, translation: "missing" },
    { name: "Madhava Nidana", shlokas: 7734, translation: "missing" },
    { name: "Cakradatta", shlokas: 11278, translation: "missing" },
  ],
  rawOnly: [
    "Bhavaprakash",
    "Bhaishajya Ratnavali",
    "Nighantus",
    "Rasa Shastra texts",
    "Vedic roots",
  ],
} as const;

export const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/corpus", label: "Corpus" },
  { href: "/about", label: "About" },
] as const;
