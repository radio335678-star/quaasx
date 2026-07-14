# AI² Frontend

Branded chat UI + marketing site for **AI²** by **QUAASX 108 PVT LTD**.

Black / white / silver identity. Cite-first classical Ayurveda answers.

## Routes

| Path | Surface |
|---|---|
| `/` | Marketing home |
| `/product` | Hybrid Engine story |
| `/corpus` | Coverage map (query-ready vs raw) |
| `/about` | QUAASX 108 PVT LTD |
| `/app` | Chat product |
| `/app/chat/[id]` | Existing chat |

## Brand

See [BRAND.md](BRAND.md). Config: [`lib/brand.ts`](lib/brand.ts).

## Quick start

```powershell
cd c:\ayurAI-standalone\frontend
pnpm install
# Ensure AI2_BACKEND_URL points at the headless engine (default http://127.0.0.1:8090)
pnpm dev
```

## Chat history (local-first)

v1 history is **browser IndexedDB** (`lib/local-chat-history.ts`) — no login required to ask or revisit threads on the same device. Auth.js / Postgres sync is deferred.

## Backend

Headless agent: [`../backend/README.md`](../backend/README.md)

Corpus rebuild + trust tiers: `python ../scripts/build_ai2_unified_db.py`  
Machine translate missing (needs API key): `python ../scripts/translate_missing_batch.py --limit 25`  
Audit sample checklist: `python ../scripts/audit_translation_sample.py --per-text 5`
