import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";
import {
  AI2_PUBLIC_URL,
  WEBX_PUBLIC_HOST,
  WEBX_PUBLIC_URL,
} from "./lib/webx-public";

function hostName(request: NextRequest): string {
  return (request.headers.get("host") || "").split(":")[0].toLowerCase();
}

function isWebxHost(host: string): boolean {
  return host === WEBX_PUBLIC_HOST || host === `www.${WEBX_PUBLIC_HOST}`;
}

/** webx.quaasx108.com vs ai2.quaasx108.com routing */
function applyWebxHostRouting(request: NextRequest): NextResponse | null {
  const host = hostName(request);
  const { pathname } = request.nextUrl;
  const onWebx = isWebxHost(host);

  if (!onWebx && (pathname === "/app/web-x" || pathname.startsWith("/app/web-x/"))) {
    return NextResponse.redirect(WEBX_PUBLIC_URL);
  }

  if (!onWebx) {
    return null;
  }

  if (pathname === "/app/web-x" || pathname.startsWith("/app/web-x/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/app\/web-x\/?/, "/") || "/";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" || pathname === "") {
    return NextResponse.rewrite(new URL("/app/web-x", request.url));
  }

  if (pathname.startsWith("/app") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(`${AI2_PUBLIC_URL}${pathname}`);
  }

  return null;
}

const PUBLIC_PATHS = new Set([
  "/",
  "/product",
  "/corpus",
  "/benchmark",
  "/developers",
  "/about",
  "/login",
  "/register",
  "/app",
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }
  if (pathname.startsWith("/app")) {
    return true;
  }
  // Public AI² chat brain — no Auth.js / guest / Postgres
  if (pathname === "/api/chat" || pathname.startsWith("/api/chat/")) {
    return true;
  }
  if (pathname === "/api/webx" || pathname.startsWith("/api/webx/")) {
    return true;
  }
  if (
    pathname.startsWith("/brand") ||
    pathname.startsWith("/web-x") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/opengraph-image")
  ) {
    return true;
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const webxRoute = applyWebxHostRouting(request);
  if (webxRoute) {
    return webxRoute;
  }

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  if (!token) {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.next();
    }

    const redirectUrl = encodeURIComponent(pathname + request.nextUrl.search);

    return NextResponse.redirect(
      new URL(`${base}/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
    );
  }

  const isGuest = guestRegex.test(token?.email ?? "");

  if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL(`${base}/app`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/product",
    "/corpus",
    "/benchmark",
    "/developers",
    "/about",
    "/app",
    "/app/:path*",
    "/api/:path*",
    "/login",
    "/register",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|brand).*)",
  ],
};
