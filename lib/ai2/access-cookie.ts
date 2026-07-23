import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ACCESS_COOKIE_MAX_AGE_S,
  ACCESS_COOKIE_NAME,
  type AccessRole,
  isAccessRole,
} from "@/lib/ai2/access-role";

function signingSecret(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.AI2_ACCESS_COOKIE_SECRET?.trim() ||
    ""
  );
}

function sign(payload: string): string {
  const secret = signingSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET missing — cannot sign access cookie");
  }
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Cookie value: `role.exp.sig` */
export function encodeAccessCookie(role: AccessRole): string {
  const exp = Math.floor(Date.now() / 1000) + ACCESS_COOKIE_MAX_AGE_S;
  const payload = `${role}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function decodeAccessCookie(raw: string | undefined | null): AccessRole {
  if (!raw) {
    return "free";
  }
  const parts = raw.split(".");
  if (parts.length !== 3) {
    return "free";
  }
  const [role, expStr, sig] = parts;
  if (!isAccessRole(role) || !expStr || !sig) {
    return "free";
  }
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return "free";
  }
  const payload = `${role}.${expStr}`;
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return "free";
  }
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return "free";
    }
  } catch {
    return "free";
  }
  return role;
}

export function accessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE_S,
  };
}

export { ACCESS_COOKIE_NAME };

/** Timing-safe pass-key compare against server env. */
export function verifyValidatorPasskey(candidate: string): boolean {
  const expected = (process.env.AI2_VALIDATOR_PASSKEY || "").trim();
  if (!expected || !candidate) {
    return false;
  }
  const a = Buffer.from(candidate.trim());
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
