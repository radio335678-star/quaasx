/** Public URLs for Web-X standalone vs AI² chat (same Vercel project, two domains). */
export const AI2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_AI2_URL?.replace(/\/$/, "") ||
  "https://ai2.quaasx108.com";

export const WEBX_PUBLIC_URL =
  process.env.NEXT_PUBLIC_WEBX_URL?.replace(/\/$/, "") ||
  "https://webx.quaasx108.com";

export const WEBX_PUBLIC_HOST =
  process.env.WEBX_PUBLIC_HOST?.toLowerCase() || "webx.quaasx108.com";

export const WEBX_API_PUBLIC_URL =
  process.env.WEBX_BACKEND_URL?.replace(/\/$/, "") ||
  "https://api.webx.quaasx108.com";
