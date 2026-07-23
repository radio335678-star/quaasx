/** Free vs Benchmark Validator access roles for chat model gating. */

export type AccessRole = "free" | "validator";

export const ACCESS_COOKIE_NAME = "ai2-access-role";
export const ACCESS_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

export const GOD_MODEL_SLUG = "ai2-ayu-god";
export const FREE_DEFAULT_MODEL_SLUG = "ai2-ayu-pro";

export type ActiveValidator = {
  id: string;
  name: string;
  specialty: string;
};

/** Public roster — names only; no credentials. */
export const ACTIVE_VALIDATORS: ActiveValidator[] = [
  {
    id: "samudri",
    name: "Dr M D Samudri",
    specialty: "Shalya Tantra",
  },
  {
    id: "samai",
    name: "Dr Samai M A",
    specialty: "Kayachikitsa",
  },
];

export function isAccessRole(value: unknown): value is AccessRole {
  return value === "free" || value === "validator";
}

export function defaultModelForRole(role: AccessRole): string {
  return role === "validator" ? GOD_MODEL_SLUG : FREE_DEFAULT_MODEL_SLUG;
}

export function isModelAllowedForRole(role: AccessRole, slug: string): boolean {
  if (role === "validator") {
    return slug === GOD_MODEL_SLUG;
  }
  return slug !== GOD_MODEL_SLUG;
}

export function modelLockReason(role: AccessRole, slug: string): string | undefined {
  if (isModelAllowedForRole(role, slug)) {
    return undefined;
  }
  if (role === "free" && slug === GOD_MODEL_SLUG) {
    return "GOD mode is for benchmark validators only";
  }
  if (role === "validator" && slug !== GOD_MODEL_SLUG) {
    return "Validators use GOD mode only";
  }
  return "This model is not available for your access role";
}

/** Clamp a stored / requested slug to one allowed for the role. */
export function clampModelSlug(role: AccessRole, slug: string | undefined): string {
  if (slug && isModelAllowedForRole(role, slug)) {
    return slug;
  }
  return defaultModelForRole(role);
}
