import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  accessCookieOptions,
  encodeAccessCookie,
} from "@/lib/ai2/access-cookie";

export async function POST() {
  try {
    const value = encodeAccessCookie("free");
    const jar = await cookies();
    jar.set(ACCESS_COOKIE_NAME, value, accessCookieOptions());
    return NextResponse.json({ ok: true, role: "free" as const });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not set free access";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
