import Link from "next/link";
import { Ai2OpenCta } from "@/components/brand/Ai2AccessMenu";
import { brand } from "@/lib/brand";
import {
  DEVELOPER_API_BASE,
  DEVELOPER_MODELS,
} from "@/lib/ai2/developer-models";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `Developers — ${brand.name} Ayurveda AI API (Flash, Pro, Max, GOD)`,
  description:
    "AI² API for Ayurveda apps: AI²-ayu-flash, pro, max, and GOD mode — cite-first classical intelligence, token pricing, and six-classic scope.",
  path: "/developers",
});

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28">
      <p className="mb-3 text-muted-foreground text-sm tracking-wide uppercase">
        Developers
      </p>
      <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
        Power any Ayurveda app with {brand.spokenName}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        The {brand.fullName} API brings cite-first classical intelligence to your
        product — verse-level grounding, six-classic scope, and token-metered
        models built for Ayurveda.
      </p>

      {/* Models + pricing */}
      <section className="mt-12">
        <h2 className="font-medium text-foreground text-xl">Models</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Native {brand.name} model family. Thinking depth controls how deeply
          the engine reasons before it responds — no third-party model names
          exposed in your product.
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Thinking</th>
                <th className="px-4 py-3 font-medium">Input / 1M</th>
                <th className="px-4 py-3 font-medium">Output / 1M</th>
                <th className="px-4 py-3 font-medium">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {DEVELOPER_MODELS.map((model) => (
                <tr
                  className={
                    model.available ? "bg-transparent" : "bg-muted/10 opacity-80"
                  }
                  key={model.id}
                >
                  <td className="px-4 py-4 align-top">
                    <div className="font-medium text-foreground font-mono text-xs md:text-sm">
                      {model.name}
                    </div>
                    <p className="mt-1 max-w-xs text-muted-foreground text-xs leading-relaxed">
                      {model.description}
                    </p>
                    {model.badge ? (
                      <span
                        className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          model.available
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {model.badge}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top text-foreground">
                    {model.thinking}
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground font-mono text-xs">
                    {model.inputPer1M ?? "—"}
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground font-mono text-xs">
                    {model.outputPer1M ?? "—"}
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground font-mono text-xs">
                    {model.context}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* API keys — locked */}
      <section className="mt-14">
        <h2 className="font-medium text-foreground text-xl">API keys</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Generate keys to call {brand.name} models from your backend. Early
          access is rolling out to partners.
        </p>

        <div className="mt-6 rounded-xl border border-border/50 bg-muted/10 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label
                className="mb-1.5 block text-muted-foreground text-xs uppercase tracking-wide"
                htmlFor="api-key-placeholder"
              >
                Secret key
              </label>
              <input
                className="w-full cursor-not-allowed rounded-md border border-border/60 bg-background/50 px-3 py-2.5 font-mono text-muted-foreground text-sm"
                disabled
                id="api-key-placeholder"
                readOnly
                type="text"
                value="sk-ai2-••••••••••••••••••••••••"
              />
            </div>
            <button
              className="shrink-0 cursor-not-allowed rounded-md border border-border/60 bg-muted/30 px-5 py-2.5 font-medium text-muted-foreground text-sm"
              disabled
              type="button"
            >
              Generate key
            </button>
          </div>
          <p className="mt-4 flex items-start gap-2 text-muted-foreground text-xs leading-relaxed">
            <span
              className="mt-0.5 shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-200/90 uppercase tracking-wide"
              aria-hidden
            >
              Locked
            </span>
            <span>
              API key creation is{" "}
              <span className="text-foreground">currently unavailable</span>.
              GOD mode and high-volume tiers require a paid plan — contact{" "}
              <a
                className="text-primary underline-offset-2 hover:underline"
                href="mailto:hello@quaasx.com"
              >
                hello@quaasx.com
              </a>{" "}
              for early access.
            </span>
          </p>
        </div>
      </section>

      {/* Quick start */}
      <section className="mt-14">
        <h2 className="font-medium text-foreground text-xl">Quick start</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          OpenAI-compatible chat completions. Scope classics with{" "}
          <code className="text-foreground text-xs">@Charaka</code> in the
          user message or via{" "}
          <code className="text-foreground text-xs">metadata.scoped_works</code>
          .
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-border/50 bg-[#050505] p-4 font-mono text-foreground/90 text-xs leading-relaxed md:text-sm">
          {`curl ${DEVELOPER_API_BASE}/chat/completions \\
  -H "Authorization: Bearer $AI2_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "ai2-ayu-pro",
    "messages": [
      {"role": "user", "content": "@Charaka @Sushruta Compare jwara nidana with citations"}
    ]
  }'`}
        </pre>
      </section>

      {/* Features row */}
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {[
          {
            title: "Cite-first by default",
            body: "Responses anchor to classical verse IDs — built for regulated wellness and education apps.",
          },
          {
            title: "Token metering",
            body: "Pay per input and output token. Flash for volume; max for depth; GOD mode for partners.",
          },
          {
            title: "Cite-first classical core",
            body: `${brand.equation} — proprietary ${brand.name}, not a generic LLM wrapper.`,
          },
        ].map((item) => (
          <div key={item.title}>
            <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Ai2OpenCta label={`Try ${brand.name} free`} />
        <Link
          className="inline-flex justify-center rounded-md border border-border/60 px-6 py-3 font-medium text-foreground text-sm transition-colors hover:bg-muted/40"
          href="/benchmark"
        >
          Benchmark validation
        </Link>
      </div>
    </div>
  );
}
