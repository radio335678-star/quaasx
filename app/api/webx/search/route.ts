import { getWebXBackendHeaders, getWebXBackendUrl, WEBX_OFFLINE_MESSAGE } from "@/lib/webx-backend";

export const maxDuration = 300;

export async function POST(request: Request) {
  const backend = getWebXBackendUrl();
  const requestBody = await request.text();

  try {
    const backendResponse = await fetch(`${backend}/api/search`, {
      method: "POST",
      headers: getWebXBackendHeaders("application/json"),
      body: requestBody,
      signal: AbortSignal.timeout(300_000),
    });

    const responseBody = await backendResponse.text();
    return new Response(responseBody, {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      { ok: false, error: WEBX_OFFLINE_MESSAGE },
      { status: 503 }
    );
  }
}
