import { getWebXBackendUrl } from "@/lib/webx-backend";

export async function GET() {
  const backend = getWebXBackendUrl();

  try {
    const response = await fetch(`${backend}/api/config`, {
      signal: AbortSignal.timeout(15_000),
    });

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json({ ai_configured: false }, { status: 200 });
  }
}
