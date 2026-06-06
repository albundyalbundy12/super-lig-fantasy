# Süper Lig Fantasy Manager

Automated Süper Lig fantasy football manager game using real football API data
(Sportmonks), transfer market logic, a scoring engine and private leagues.

## Current status

**Task 12 — current-season integration tested (complete).** The current Süper
Lig season (league 600, season 25682) is fetched from Sportmonks and stored
idempotently: season info, 34 rounds and 306 fixtures. Round lock time (earliest
fixture `starting_at`) is computed on read. A "Current season" card on
`/admin/sync` triggers the sync and shows the stored report. Tested endpoints
recorded in `docs/API_TEST_RESULTS.md` §12. Build strictly task-by-task; see
`docs/CODING_AGENT_TASKS.md`.

Done so far: Tasks 1–12.

## Architecture

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL via Prisma 6 ORM (Replit built-in database)
- **Package manager:** npm
- **Dev server:** runs on `0.0.0.0:5000` (Replit webview)
- **Routes:** `/dashboard`, `/squad`, `/lineup`, `/transfer-market`, `/points`,
  `/table`, `/admin/sync` — all simple placeholders for now.

### Database

- Schema lives in `prisma/schema.prisma`, modelled from `docs/DATABASE_SCHEMA.md`.
- Only the **MVP tables** from Task 2 are implemented (20 tables). Later tables
  (transfers, transfer_bids, player_market_values, admin_audit_logs, etc.) are
  intentionally deferred.
- **Raw vs fantasy separation:** raw Sportmonks tables (`fixtures`,
  `fixture_events`, `fixture_lineups`, `fixture_lineup_details`,
  `fixture_participants`, `real_teams`, `players`, `seasons`, `rounds`) store
  Sportmonks IDs in dedicated `sportmonks*` fields. Calculated fantasy data
  (`player_match_scores`, `manager_round_scores`) lives in separate tables.
- **Idempotent sync:** every importable entity has a unique Sportmonks key
  (and composite uniques like `fixture_participants(fixture_id, team_id)`), so
  running a sync twice creates no duplicates.
- Prisma client is a server-only singleton in `src/lib/db/index.ts`.
- `npm run build` runs `prisma generate` first; a `postinstall` hook also
  generates the client (needed for deployment installs).
- Dev migrations: `npm run db:migrate`. Inspect data: `npm run db:studio`.

### Folder layout

```
prisma/
  schema.prisma         Prisma schema (MVP tables, Task 2)
  migrations/           Generated SQL migrations
src/
  app/                  App Router pages (one folder per route)
  components/           Shared UI (sidebar nav)
  config/constants.ts   Non-secret known IDs (league 600, season 25682, test fixture)
  lib/
    db/                 Prisma client singleton (server-only)
    sportmonks/         Server-only Sportmonks API client (real calls = Task 3)
```

## Secrets

- `DATABASE_URL` — PostgreSQL connection string. Provided automatically by the
  Replit built-in database; stored in Replit Secrets, never committed. Read only
  on the server by Prisma. See `.env.example` for the placeholder.
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
