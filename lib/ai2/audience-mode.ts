export const AUDIENCE_MODES = ["patient", "scholar", "clinician"] as const;

export type AudienceMode = (typeof AUDIENCE_MODES)[number];

export function isAudienceMode(value: string): value is AudienceMode {
  return (AUDIENCE_MODES as readonly string[]).includes(value);
}
