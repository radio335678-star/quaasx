# AI² Production (Vercel + Modal ai2-rust-env)

## Vercel environment

Set on the Vercel project:

```env
AI2_BACKEND_URL=https://quaasx--ai2-rust-env-rustenvgateway-web.modal.run
AUTH_SECRET=<openssl rand -base64 32>
```

Chat does **not** use the old Hybrid Engine `/v1/chat` SSE API. The frontend calls Modal `POST /exec` (runs `/workspace/agent_run.py`) and shows the agent's `answer` text. Warmup: `GET /api/warmup` → Modal `GET /health`.

**Stubbed for now (UI present, backend ignored):** `@` work scoping, patient/scholar audience, demo budgets, citation cards / CompareLayout (`AdaptiveAnswer` needs Hybrid `meta` SSE — wire later).

## Cold start + warmup

`ai2-rust-env` uses CPU memory snapshots; scales down after ~9s idle.

- Opening `/app` triggers `GET /api/warmup` → Modal `/health` (restores snapshot + starts cage-bro).
- First chat after idle may take ~50–90s (cold restore + agent ~44s).

Modal deploy (when backend changes — not required for frontend-only adapter):

```powershell
python -m modal deploy backend/deploy_ai2_rustenv.py
```

Smoke from repo root: `python scripts/smoke_rustenv.py`

## OpenRouter key (Modal only)

OpenRouter runs inside Modal (`openrouter-key` secret). Rotate on Modal if exposed; Vercel does not hold the key.

## Deploy checklist

1. Ensure `ai2-rust-env` is deployed on Modal.
2. Vercel deploy from `frontend/` with `AI2_BACKEND_URL` above.
3. Smoke: open `/app`, ask a fever/jwara question — wait for agent, verify answer text + IndexedDB sidebar history.
4. Citation cards will not appear until structured `meta` is wired (answers may still cite inline in markdown).

## Rate limiting

`/api/chat` applies a best-effort limit of 20 requests/minute per IP (in-memory per serverless instance).

## Clinical disclaimer

Answers should include classical research context. Not medical advice.
