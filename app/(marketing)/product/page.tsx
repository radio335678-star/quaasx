import Image from "next/image";
import { Ai2OpenCta } from "@/components/brand/Ai2AccessMenu";
import { brand } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `${brand.fullName} — Cite-First Classical Ayurveda AI Product`,
  description: `${brand.claim} Explore Charaka, Sushruta, Ashtanga, and more with grounded Sanskrit citations.`,
  path: "/product",
});

export default function ProductPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28">
      <p className="mb-3 text-muted-foreground text-sm tracking-wide uppercase">
        Product
      </p>
      <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
        {brand.fullName}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {brand.equation}. Cite-first answers for scholars and practitioners —
        Sanskrit, transliteration, English, and cross-text context.
      </p>

      <div className="mt-12 overflow-hidden rounded-xl border border-border/50 bg-card/40">
        <Image
          alt={brand.fullName}
          className="h-auto w-full object-cover"
          height={520}
          priority
          src={brand.hybridArt}
          width={960}
        />
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {[
          {
            title: "Cite-first",
            body: "Every answer leads with classical shlokas and source labels — not free-form speculation.",
          },
          {
            title: "Cross-text",
            body: "Compare Charaka, Sushruta, Ashtanga, Nighantus, and more when Acharyas disagree.",
          },
          {
            title: "Grounded",
            body: brand.claim,
          },
        ].map((item) => (
          <div key={item.title}>
            <h2 className="font-medium text-foreground">{item.title}</h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <Ai2OpenCta />
      </div>
    </div>
  );
}
