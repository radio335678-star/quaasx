import type { Metadata } from "next";
import { brand } from "@/lib/brand";

/** Canonical public origin for Google / Open Graph / sitemap. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_AI2_URL?.replace(/\/$/, "") ||
  "https://ai2.quaasx108.com";

export const SEO_KEYWORDS = [
  "AI²",
  "AI Square",
  "AI2 Hybrid Engine",
  "Ayurveda AI",
  "classical Ayurveda AI",
  "Sanskrit shloka AI",
  "Charaka Samhita AI",
  "Sushruta Samhita AI",
  "Ashtanga Hridayam AI",
  "cite-first Ayurveda",
  "Ayurveda research assistant",
  "Bhasha Bench Ayur",
  "QUAASX 108",
  "Ayurvedic knowledge graph",
  "Sanskrit citation AI",
] as const;

type PageSeoInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: readonly string[];
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = SEO_KEYWORDS,
  noIndex = false,
}: PageSeoInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const ogImage = `${SITE_URL}${brand.hybridArt}`;

  return {
    title,
    description,
    keywords: [...keywords],
    authors: [{ name: brand.company }],
    creator: brand.company,
    publisher: brand.company,
    category: "Health & Medical Technology",
    applicationName: brand.name,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: brand.fullName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brand.fullName} — ${brand.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** JSON-LD for Organization + SoftwareApplication + WebSite. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: brand.company,
        legalName: brand.company,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}${brand.logo}`,
        },
        email: "info@quaasx108.com",
        sameAs: [SITE_URL, "https://webx.quaasx108.com"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: brand.fullName,
        description: brand.description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "sa", "hi"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}${brand.appPath}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: brand.name,
        alternateName: [brand.spokenName, brand.fullName, "AI2", "AI Square"],
        applicationCategory: "HealthApplication",
        applicationSubCategory: "Ayurveda Research Assistant",
        operatingSystem: "Web",
        url: `${SITE_URL}${brand.appPath}`,
        image: `${SITE_URL}${brand.logo}`,
        description: brand.claim,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          description: "Free chat tiers; validator GOD mode by approval",
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
        featureList: [
          "Cite-first classical Ayurveda answers",
          "Sanskrit, transliteration, and English",
          "Charaka, Sushruta, Ashtanga, and related classics",
          "Bhasha Bench Ayur v1 benchmark validation",
        ],
      },
    ],
  };
}
