import Image from "next/image";
import Link from "next/link";
import { Ai2OpenCta } from "@/components/brand/Ai2AccessMenu";
import { brand } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `About ${brand.company} — Builders of AI² Ayurveda AI`,
  description: `${brand.name} (${brand.spokenName}) by ${brand.company}: classical Ayurvedic intelligence united with modern AI for cite-first answers.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28">
      <p className="mb-3 text-muted-foreground text-sm tracking-wide uppercase">
        About
      </p>
      <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
        {brand.company}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        We build {brand.name} — classical Ayurvedic intelligence united with
        modern AI — so the global Ayurveda community can ask any classical
        question and receive grounded, cite-first answers.
      </p>

      <div className="mt-12 flex justify-center rounded-xl border border-border/40 bg-black px-8 py-10">
        <Image
          alt={brand.company}
          className="h-auto w-full max-w-md object-contain"
          height={160}
          priority
          src={brand.companyWordmark}
          width={420}
        />
      </div>

      <div className="mt-12 space-y-4 text-muted-foreground text-sm leading-relaxed">
        <p>
          <span className="font-medium text-foreground">{brand.name}</span>{" "}
          (spoken: {brand.spokenName}) is our product.{" "}
          <span className="font-medium text-foreground">{brand.fullName}</span>{" "}
          is the research and reasoning layer behind it.
        </p>
        <p>
          Mission: build the iconic intelligence layer for classical Ayurveda —
          cite-first shlokas, cross-text clarity, and clinical caution.
        </p>
      </div>

      <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Ai2OpenCta />
        <Link
          className="inline-flex rounded-md border border-border/60 px-6 py-3 font-medium text-foreground text-sm transition-colors hover:bg-muted/40"
          href="/benchmark"
        >
          Benchmark validation
        </Link>
      </div>
    </div>
  );
}
