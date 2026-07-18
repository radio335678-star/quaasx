const BACKEND_URL =
  process.env.AI2_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8090";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      next: { revalidate: 0 },
    });
    const body = await res.json().catch(() => ({}));
    return Response.json(body, { status: res.ok ? 200 : res.status });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "warmup failed",
      },
      { status: 503 }
    );
  }
}
