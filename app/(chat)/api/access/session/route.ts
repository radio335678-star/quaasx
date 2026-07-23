import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  decodeAccessCookie,
} from "@/lib/ai2/access-cookie";

export async function GET() {
  const jar = await cookies();
  const role = decodeAccessCookie(jar.get(ACCESS_COOKIE_NAME)?.value);
  return NextResponse.json({ role });
}
