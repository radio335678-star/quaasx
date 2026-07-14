export async function register() {
  try {
    const { OpenTelemetry } = await import("@ai-sdk/otel");
    const { registerOTel } = await import("@vercel/otel");
    const { registerTelemetry } = await import("ai");
    registerOTel({ serviceName: "ai2" });
    registerTelemetry(new OpenTelemetry());
  } catch {
    // Telemetry is optional in local preview
  }
}
