import { initBotId } from "botid/client/core";

// Public AI² chat — do not BotID-protect /api/chat.
// Same Vercel deploy: desktop Chrome passes the invisible challenge; many
// mobile Safari / in-app browsers fail it, attach a bad x-is-human header,
// and get a hard failure ("Internal Server Error"). Re-enable only with
// matching checkBotId() + a user-visible fallback (CAPTCHA / retry).
initBotId({
  protect: [],
});
