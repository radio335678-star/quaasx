# AI² Production (Vercel + Modal)

## Vercel environment

Set on the Vercel project only:

```env
AI2_BACKEND_URL=https://quaasx--ai2-hybrid-engine-chatgateway-web.modal.run
AUTH_SECRET=<openssl rand -base64 32>
AI2_HOBBY_SAFE=1
```

`AI2_HOBBY_SAFE=1` caps synthesis for Vercel Hobby's 60s limit (3 citations, 40s Gemini timeout). Omit or set `0` on Pro/self-hosted for full shloka mode.

## Cold start + warmup

Modal chat uses **CPU memory snapshots**; L4 reranker uses **GPU memory snapshots**. Both scale to zero after ~10s idle.

- Opening `/app` triggers `GET /api/warmup` → Modal `/v1/warmup` (restores chat + wakes L4).
- Each chat request also spawns a non-blocking L4 `ping` in parallel with CPU retrieval.

Deploy both Modal apps after backend changes:

```powershell
python -m modal deploy backend/deploy_bge_quaasx.py
python -m modal deploy backend/deploy_ai2_modal.py
```

Measure cold start: `python tests/test_cold_start.py`

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
