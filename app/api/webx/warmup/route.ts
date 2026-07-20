import { getWebXBackendHeaders, getWebXBackendUrl } from "@/lib/webx-backend";

export const maxDuration = 300;

export async function GET() {
  const backend = getWebXBackendUrl();

  try {
    const response = await fetch(`${backend}/api/health`, {
      headers: getWebXBackendHeaders(),
      signal: AbortSignal.timeout(120_000),
    });

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Best-effort heartbeat: avoid 503 console noise while Modal cold-starts.
    return Response.json(
      { ok: false, service: "web-x-ai2", waking: true },
      { status: 200 }
    );
  }
}
