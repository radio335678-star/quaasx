import Image from "next/image";
import { Ai2OpenCta } from "@/components/brand/Ai2AccessMenu";
import { brand } from "@/lib/brand";

const APPLY_MAIL = "info@quaasx108.com";
const APPLY_SUBJECT = encodeURIComponent(
  "AI² Benchmark Validation — Free Access Request"
);
const APPLY_BODY = encodeURIComponent(
  [
    "Hello QUAASX team,",
    "",
    "I would like free third-party validation access for Bhasha Bench Ayur v1 / AI².",
    "",
    "Full name:",
    "Degree (e.g. BAMS, BAMS MD/MS, MBBS, BHMS, BUMS, BSMS, other):",
    "Specialty (if any):",
    "",
    "I understand access is for educational and research validation, not clinical advice,",
    "and that Q/A logs may be used for audit and expert review.",
    "",
    "Thank you.",
  ].join("\n")
);
const APPLY_HREF = `mailto:${APPLY_MAIL}?subject=${APPLY_SUBJECT}&body=${APPLY_BODY}`;

export const metadata = {
  title: `Bhasha Bench Ayur v1 — 92.8% · Benchmark Validation — ${brand.name}`,
  description:
    "Bhasha Bench Ayur v1 scored 92.8%. Free third-party validation is open to graduated doctors across Ayurveda, allopathy, Siddha, Unani, and homeopathy. Apply via info@quaasx108.com.",
};

export default function BenchmarkPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28">
      {/* Hero */}
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${brand.name} mark — GOD mode for validators`}
          className="size-16 shrink-0 rounded-2xl border border-border/40"
          height={64}
          src={brand.mark}
          width={64}
        />
        <div>
          <p className="mb-2 text-muted-foreground text-sm tracking-wide uppercase">
            Benchmark Validation
          </p>
          <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
            Bhasha Bench Ayur v1
          </h1>
          <p className="mt-3 font-medium text-2xl text-foreground tracking-tight md:text-3xl">
            92.8%
          </p>
          <p className="mt-3 max-w-xl text-muted-foreground text-base leading-relaxed">
            A cite-first classical Ayurveda AI milestone — now open to free
            third-party validation by real doctors.
          </p>
        </div>
      </div>

      {/* Why open */}
      <section className="mt-16">
        <h2 className="font-medium text-foreground text-lg tracking-tight">
          Why we opened third-party validation
        </h2>
        <div className="mt-4 space-y-4 text-muted-foreground text-sm leading-relaxed md:text-base">
          <p>
            Internal benchmarks matter. A curated set of roughly fifteen
            thousand MCQs helped us measure progress on Bhasha Bench Ayur v1 —
            and the headline result is{" "}
            <span className="text-foreground">92.8%</span>.
          </p>
          <p>
            But a closed MCQ suite is not enough for a historically significant
            step in Ayurveda AI. True validation requires clinicians who can
            challenge answers, inspect reasoning, and judge whether classical
            grounding holds under real scholarly and clinical scrutiny.
          </p>
          <p>
            So we opened the process freely to credentialed doctors: not as a
            marketing exercise, but as an invitation to co-validate a milestone
            with transparent logs and expert-reviewable trails.
          </p>
        </div>
      </section>

      {/* Who */}
      <section className="mt-14">
        <h2 className="font-medium text-foreground text-lg tracking-tight">
          Who can validate
        </h2>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed md:text-base">
          Any graduated doctor from a recognized medical tradition may apply —
          including (not limited to):
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground text-sm leading-relaxed md:text-base">
          <li>Ayurveda — BAMS, BAMS MD / MS, and related postgraduate paths</li>
          <li>Allopathy — MBBS and specialty qualifications</li>
          <li>Siddha, Unani, Homeopathy, and other medical fields with a named degree</li>
          <li>Optional specialty (e.g. Kayachikitsa, pediatrics, medicine) if relevant</li>
        </ul>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed md:text-base">
          We do <span className="text-foreground">not</span> require a
          registration number or phone number for the initial request.
        </p>
      </section>

      {/* What validators get */}
      <section className="mt-14">
        <h2 className="font-medium text-foreground text-lg tracking-tight">
          What approved validators receive
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground text-sm leading-relaxed md:text-base">
          <li>
            <span className="text-foreground">Free access</span> to third-party
            validation workflows — no fee for the validator tier.
          </li>
          <li>
            <span className="text-foreground">
              {brand.name} GOD mode
            </span>{" "}
            ({brand.spokenName} high-performance classical model) enabled by
            default for registered validators after approval.
          </li>
          <li>
            Membership in the validation community helping stress-test a
            historically significant Ayurveda-AI benchmark.
          </li>
          <li>
            Logged Q/A and reasoning steps — suitable for audit trails and
            IEC-style expert review submissions, not for casual screenshots alone.
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/50 bg-muted/15 px-4 py-4">
          <Image
            alt={brand.name}
            className="size-10 rounded-lg"
            height={40}
            src={brand.mark}
            width={40}
          />
          <div>
            <p className="font-medium text-foreground text-sm">
              GOD mode · {brand.name}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Highest classical depth available to approved validators by
              default — free for validation use.
            </p>
          </div>
        </div>
      </section>

      {/* How to apply */}
      <section className="mt-14" id="apply">
        <h2 className="font-medium text-foreground text-lg tracking-tight">
          How to get free validation access
        </h2>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed md:text-base">
          Email{" "}
          <a
            className="text-foreground underline-offset-4 hover:underline"
            href={APPLY_HREF}
          >
            {APPLY_MAIL}
          </a>{" "}
          with:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground text-sm leading-relaxed md:text-base">
          <li>Your full name</li>
          <li>Your degree name (BAMS, BAMS MD/MS, MBBS, BHMS, or other medical degree)</li>
          <li>Specialty, if any</li>
        </ol>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed md:text-base">
          Our team reviews each request manually. Expect a response within{" "}
          <span className="text-foreground">24 hours</span>, or sooner depending
          on traffic. No registration number or phone number is required in the
          first email.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            className="inline-flex justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
            href={APPLY_HREF}
          >
            Apply by email
          </a>
          <Ai2OpenCta variant="outline" />
        </div>
      </section>

      {/* Terms */}
      <section className="mt-14 border-t border-border/40 pt-12">
        <h2 className="font-medium text-foreground text-lg tracking-tight">
          Terms for validators
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground text-sm leading-relaxed">
          <li>
            Access is for educational and research validation — not a substitute
            for professional medical advice or clinical decision-making.
          </li>
          <li>
            Questions, answers, and intermediate AI steps may be logged and used
            for validation, audit, and IEC-style expert review.
          </li>
          <li>
            Treat classical citations and patient-like scenarios with professional
            confidentiality and scholarly care.
          </li>
          <li>
            {brand.companyShort} may grant, pause, or revoke validator access at
            its discretion.
          </li>
          <li>There is no charge for the approved validator tier.</li>
        </ul>
      </section>

      {/* Footer CTA */}
      <section className="mt-16 flex flex-col gap-3 border-t border-border/40 pt-12 sm:flex-row sm:items-center">
        <a
          className="inline-flex justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
          href={APPLY_HREF}
        >
          Request free validation access
        </a>
        <Ai2OpenCta variant="outline" />
      </section>
    </div>
  );
}
