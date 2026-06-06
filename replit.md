# Süper Lig Fantasy Manager

Automated Süper Lig fantasy football manager game using real football API data
(Sportmonks), transfer market logic, a scoring engine and private leagues.

## Current status

**Task 1 — project scaffold (complete).** This is the initial Next.js + TypeScript
structure only. The data chain, database, Sportmonks sync and scoring engine are
implemented in later tasks (see `docs/CODING_AGENT_TASKS.md`).

## Architecture

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Package manager:** npm
- **Dev server:** runs on `0.0.0.0:5000` (Replit webview)
- **Routes:** `/dashboard`, `/squad`, `/lineup`, `/transfer-market`, `/points`,
  `/table`, `/admin/sync` — all simple placeholders for now.

### Folder layout

```
src/
  app/                  App Router pages (one folder per route)
  components/           Shared UI (sidebar nav)
  config/constants.ts   Non-secret known IDs (league 600, season 25682, test fixture)
  lib/
    db/                 Placeholder database layer (real schema = Task 2)
    sportmonks/         Server-only Sportmonks API client (real calls = Task 3)
```

## Secrets

- `SPORTMONKS_API_TOKEN` — Sportmonks Football API V3 token. **Server-only.**
  Store it in Replit Secrets. It is read only on the server
  (`src/lib/sportmonks/client.ts`) and is never exposed to the frontend or
  committed to the repo. See `.env.example` for the placeholder.

## Source of truth

The `docs/` folder defines the product. Follow it; do not invent rules.

- `docs/PRODUCT_MASTERPLAN.md`, `docs/MVP_BUILD_PLAN.md`,
  `docs/DATABASE_SCHEMA.md`, `docs/API_SYNC_PLAN.md`,
  `docs/API_TEST_RESULTS.md`, `docs/TYPE_ID_MAPPING.md`,
  `docs/SCORING_RULES.md`, `docs/CODING_AGENT_TASKS.md`

## User preferences

- Build strictly task-by-task from `docs/CODING_AGENT_TASKS.md`. Do not jump
  ahead: no scoring, no full UI, no full MVP until the corresponding task.
- Never expose the Sportmonks API token in code, docs, or the frontend.
