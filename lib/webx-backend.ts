/** Modal `ai2-web-x` production gateway (used when Vercel env is unset). */
export const WEBX_MODAL_PRODUCTION_URL =
  "https://quaasx--ai2-web-x-webxgateway-web.modal.run";

export function getWebXBackendUrl(): string {
  const fromEnv = process.env.WEBX_BACKEND_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.VERCEL) {
    return WEBX_MODAL_PRODUCTION_URL;
  }
  return "http://127.0.0.1:5000";
}

export function getWebXBackendHeaders(
  contentType?: string
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  const secret = process.env.WEBX_API_SECRET?.trim();
  if (secret) {
    headers["X-WebX-Secret"] = secret;
  }
  return headers;
}

export const WEBX_OFFLINE_MESSAGE =
  "Web-X engine offline. Start the local server on your laptop (port 5000) or set WEBX_BACKEND_URL to your tunnel URL.";
