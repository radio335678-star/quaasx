import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `About — ${brand.company}`,
  description: `${brand.name} by ${brand.company}.`,
};

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
        We build {brand.name} — the Hybrid Engine that unites ancient Ayurvedic
        intelligence with modern AI — so the global Ayurveda community can ask
        any classical question and receive grounded, cite-first answers.
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

      <div className="mt-14">
        <Link
          className="inline-flex rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
          href={brand.appPath}
        >
          Open {brand.name}
        </Link>
      </div>
    </div>
  );
}
