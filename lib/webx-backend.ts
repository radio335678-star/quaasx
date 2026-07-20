/** Modal `ai2-web-x` production gateway (used when Vercel env is unset). */
export const WEBX_MODAL_PRODUCTION_URL =
  "https://quaasx--ai2-web-x-webxgateway-web.modal.run";

function isLocalOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }
  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
    return true;
  }
  return false;
}

export function getWebXBackendUrl(): string {
  const fromEnv = process.env.WEBX_BACKEND_URL?.replace(/\/$/, "");
  if (fromEnv) {
    try {
      const host = new URL(fromEnv).hostname;
      if (process.env.VERCEL && isLocalOrPrivateHost(host)) {
        return WEBX_MODAL_PRODUCTION_URL;
      }
      return fromEnv;
    } catch {
      /* fall through */
    }
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
  "Web-X search is temporarily unavailable. Please try again in a moment.";
