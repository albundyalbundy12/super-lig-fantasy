---
name: Sportmonks IDs can exceed 32-bit
description: Some Sportmonks v3 entity IDs overflow PostgreSQL INT4; affected ID columns must be BigInt.
---

# Sportmonks v3 IDs and Postgres integer width

Some Sportmonks-assigned IDs are larger than 2,147,483,647 (INT4 max). Observed:
fixture **lineup** IDs in the multi-billions (e.g. `5148410942`). Event and
lineup-detail IDs come from the same large ID space and can overflow too.

**Why:** Prisma `Int` maps to Postgres `INT4`. Storing a >2^31 value throws
`Unable to fit integer value '...' into an INT4`. The fixture sync's
`fixture_lineups` upsert failed on exactly this until the column was widened.

**How to apply:**
- Unique Sportmonks key columns at risk are stored as Prisma `BigInt`:
  `fixture_events.sportmonks_event_id`, `fixture_lineups.sportmonks_lineup_id`,
  `fixture_lineup_details.sportmonks_detail_id`. Pass `BigInt(x)` in upsert
  where/create and when building lookup `Set`/`Map` keys (a `bigint` key never
  equals a `number` key).
- Smaller ID spaces left as `Int` (fixture, season, round, team, player,
  position IDs) — fine for now, but widen if a future overflow appears.
- Caution: Prisma `BigInt` fields are **not** JSON-serializable by default —
  do not return raw bigint through an API/client boundary without converting.
