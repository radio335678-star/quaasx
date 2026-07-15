import type { ClinicalSafetyBannerData } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";

function isDangerLevel(level?: string) {
  const n = (level ?? "").trim().toLowerCase();
  return n === "danger" || n === "critical" || n === "high" || n === "severe";
}

export function ClinicalSafetyBanner({
  banner,
}: {
  banner: ClinicalSafetyBannerData;
}) {
  const danger = isDangerLevel(banner.level);
  const herbs = banner.herbs ?? [];

  return (
    <aside
      className={cn(
        "rounded-xl border-2 px-3.5 py-3",
        danger
          ? "border-red-500/70 bg-red-950/40 text-red-100"
          : "border-amber-500/60 bg-amber-950/35 text-amber-100"
      )}
      data-testid="clinical-safety-banner"
      role="alert"
    >
      {banner.title ? (
        <p
          className={cn(
            "mb-1 text-sm font-semibold tracking-tight",
            danger ? "text-red-200" : "text-amber-200"
          )}
        >
          {banner.title}
        </p>
      ) : null}
      {banner.body ? (
        <p className="text-[13px] leading-relaxed text-foreground/90">
          {banner.body}
        </p>
      ) : null}
      {herbs.length > 0 ? (
        <ul className="mt-2.5 space-y-1.5 border-t border-current/15 pt-2.5">
          {herbs.map((herb, index) => (
            <li
              className="text-[12px] leading-snug"
              key={`${herb.common ?? ""}-${herb.botanical ?? ""}-${herb.class ?? ""}-${index}`}
            >
              {herb.common ? (
                <span className="font-medium text-foreground">{herb.common}</span>
              ) : null}
              {herb.botanical ? (
                <span className="text-muted-foreground">
                  {herb.common ? " · " : ""}
                  <em>{herb.botanical}</em>
                </span>
              ) : null}
              {herb.class ? (
                <span className="text-muted-foreground/80">
                  {herb.common || herb.botanical ? " · " : ""}
                  {herb.class}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
