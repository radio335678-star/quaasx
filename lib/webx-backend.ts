export function getWebXBackendUrl(): string {
  return (
    process.env.WEBX_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000"
  );
}

export const WEBX_OFFLINE_MESSAGE =
  "Web-X engine offline. Start the local server on your laptop (port 5000) or set WEBX_BACKEND_URL to your tunnel URL.";
