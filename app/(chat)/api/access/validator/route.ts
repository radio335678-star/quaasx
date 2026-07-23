import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  accessCookieOptions,
  encodeAccessCookie,
  verifyValidatorPasskey,
} from "@/lib/ai2/access-cookie";

export async function POST(request: Request) {
  let passkey = "";
  try {
    const body = (await request.json()) as { passkey?: unknown };
    if (typeof body.passkey === "string") {
      passkey = body.passkey;
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!verifyValidatorPasskey(passkey)) {
    return NextResponse.json(
      { ok: false, error: "Invalid pass-key" },
      { status: 401 }
    );
  }

  try {
    const value = encodeAccessCookie("validator");
    const jar = await cookies();
    jar.set(ACCESS_COOKIE_NAME, value, accessCookieOptions());
    return NextResponse.json({ ok: true, role: "validator" as const });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not set validator access";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
