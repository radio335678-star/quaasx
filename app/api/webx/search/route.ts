import { getWebXBackendHeaders, getWebXBackendUrl, WEBX_OFFLINE_MESSAGE } from "@/lib/webx-backend";

export const maxDuration = 300;

export async function POST(request: Request) {
  const backend = getWebXBackendUrl();
  const body = await request.text();

  try {
    const response = await fetch(`${backend}/api/search`, {
      method: "POST",
      headers: getWebXBackendHeaders("application/json"),
      body,
      signal: AbortSignal.timeout(300_000),
    });

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      { ok: false, error: WEBX_OFFLINE_MESSAGE },
      { status: 503 }
    );
  }
}
