# AI² Production (Vercel + Modal)

## Vercel environment

Set on the Vercel project only:

```env
AI2_BACKEND_URL=https://quaasx--ai2-hybrid-engine-web.modal.run
AUTH_SECRET=<openssl rand -base64 32>
```

Do **not** put `OPENROUTER_API_KEY` on Vercel. The key lives in Modal secret `openrouter-key` only.

## OpenRouter key rotation (required before public launch)

The key was exposed in chat during development. Before launch:

1. Revoke the old key in [OpenRouter dashboard](https://openrouter.ai/keys).
2. Create a new key.
3. On your machine: `$env:OPENROUTER_API_KEY="sk-or-v1-..."`
4. Run: `python scripts/enable_openrouter_secret.py`
5. Redeploy Modal: `python -m modal deploy backend/deploy_ai2_modal.py`

## Deploy checklist

1. Modal deploy (backend structured SSE + full shloka mode).
2. Vercel deploy from `frontend/` with env above.
3. Smoke: jwara, raktamokshana, agni — verify citation cards + stream + IndexedDB history.
4. First request after idle may cold-start Modal (2–3 min); UI shows cold-start copy.

## Rate limiting

`/api/chat` applies a best-effort limit of 20 requests/minute per IP (in-memory per serverless instance).

## Clinical disclaimer

Every answer includes a research disclaimer under citation cards. Not medical advice.
