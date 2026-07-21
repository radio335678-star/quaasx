import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AI2_PUBLIC_URL,
  WEBX_PUBLIC_HOST,
  WEBX_PUBLIC_URL,
} from "@/lib/webx-public";

function hostName(request: NextRequest): string {
  return (request.headers.get("host") || "").split(":")[0].toLowerCase();
}

function isWebxHost(host: string): boolean {
  return host === WEBX_PUBLIC_HOST || host === `www.${WEBX_PUBLIC_HOST}`;
}

export function middleware(request: NextRequest) {
  const host = hostName(request);
  const { pathname } = request.nextUrl;
  const onWebx = isWebxHost(host);

  // AI² domain: no embedded Web-X — open standalone site
  if (!onWebx && (pathname === "/app/web-x" || pathname.startsWith("/app/web-x/"))) {
    return NextResponse.redirect(WEBX_PUBLIC_URL);
  }

  if (!onWebx) {
    return NextResponse.next();
  }

  // webx.quaasx108.com — search at /
  if (pathname === "/app/web-x" || pathname.startsWith("/app/web-x/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/app\/web-x\/?/, "/") || "/";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" || pathname === "") {
    return NextResponse.rewrite(new URL("/app/web-x", request.url));
  }

  // Chat and other AI² app routes on Web-X host → AI² domain
  if (pathname.startsWith("/app") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(`${AI2_PUBLIC_URL}${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app/:path*"],
};
