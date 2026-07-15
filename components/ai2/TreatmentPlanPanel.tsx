import type { TreatmentPlanData } from "@/lib/ai2/types";

export function TreatmentPlanPanel({
  treatment_plan,
}: {
  treatment_plan: TreatmentPlanData;
}) {
  const stages = treatment_plan.stages ?? [];
  if (!stages.length) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-border/50 bg-muted/15 px-3 py-3"
      data-testid="treatment-plan-panel"
    >
      <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Treatment plan
      </p>
      <ol className="space-y-2">
        {stages.map((stage, index) => (
          <li
            className="flex gap-2.5 rounded-lg border border-border/40 bg-background/60 px-2.5 py-2"
            key={stage.id}
          >
            <span
              aria-hidden
              className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/70 font-mono text-[11px] font-semibold text-foreground/80"
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-snug text-foreground">
                {stage.title}
              </p>
              {stage.summary ? (
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {stage.summary}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
