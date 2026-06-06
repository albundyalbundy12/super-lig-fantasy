# CODING_AGENT_TASKS.md

## Projekt

Süper-Lig-Fantasy-Manager-Spiel

## Zweck

Diese Datei enthält konkrete Aufgaben für Coding-Agenten wie Replit Agent, Claude Code, Hermes oder andere Builder.

Regel:

```text id="0c5yrf"
Nicht frei interpretieren.
Nicht neu erfinden.
Nicht Design-first bauen.
Erst Datenkette und Punkte-Engine.
```

Der Coding-Agent muss die Dokumentation im `docs/`-Ordner beachten.

---

# 1. Wichtige Projektdateien

Vor jeder Coding-Aufgabe lesen:

```text id="zwsnjz"
docs/PRODUCT_MASTERPLAN.md
docs/MVP_BUILD_PLAN.md
docs/DATABASE_SCHEMA.md
docs/API_SYNC_PLAN.md
docs/API_TEST_RESULTS.md
docs/TYPE_ID_MAPPING.md
docs/SCORING_RULES.md
```

Diese Dateien sind die Produktquelle.

---

# 2. Absolute Regeln

```text id="8m5js7"
1. API-Token niemals ins GitHub Repo schreiben.
2. API-Token niemals ins Frontend schreiben.
3. Sportmonks-Aufrufe nur serverseitig.
4. Punkte nicht manuell pflegen.
5. Rohdaten und Fantasy-Daten getrennt speichern.
6. Keine unnötigen UI-Experimente.
7. Erst Testfixture 18903623 zum Laufen bringen.
8. Erst Datenkette, dann UI.
9. TL als sichtbare Spielwährung.
10. Dengeli Başlangıç als Pflicht-Startmodus.
```

---

# 3. Empfohlener Stack

Für MVP empfohlen:

```text id="zntt04"
Next.js App Router
TypeScript
PostgreSQL
Prisma oder Drizzle
Server-side API routes
Environment variable: SPORTMONKS_API_TOKEN
```

Wenn Replit genutzt wird:

```text id="eajgys"
Token nur in Replit Secrets speichern.
Nicht in Code.
Nicht in README.
Nicht in docs.
```

---

# 4. Task 1 — Projektgerüst erstellen

## Ziel

Initiales App-Gerüst bauen.

## Auftrag

```text id="fxur1z"
Create the initial Next.js + TypeScript project structure for the Süper Lig fantasy manager MVP.

Requirements:
- Use Next.js App Router.
- Use TypeScript.
- Add basic project structure.
- Add placeholder database layer.
- Add server-only Sportmonks API client folder.
- Add environment variable placeholder SPORTMONKS_API_TOKEN.
- Do not include any real API token.
- Add basic pages:
  - /dashboard
  - /squad
  - /lineup
  - /transfer-market
  - /points
  - /table
  - /admin/sync
- Keep UI simple.
- Do not implement full design yet.
- Do not invent product rules. Follow docs/.
```

## Definition of Done

```text id="g2zdo6"
App starts successfully.
Pages load.
No API token is exposed.
Project structure is clean.
```

---

# 5. Task 2 — Datenbankschema vorbereiten

## Ziel

Datenbankstruktur aus `DATABASE_SCHEMA.md` technisch anlegen.

## Auftrag

```text id="nv9dum"
Implement the initial database schema for the Süper Lig fantasy manager MVP.

Use:
- docs/DATABASE_SCHEMA.md

Create models/tables for MVP:
- users
- fantasy_leagues
- fantasy_league_members
- manager_teams
- real_teams
- players
- manager_squad_players
- manager_lineups
- manager_lineup_slots
- seasons
- rounds
- fixtures
- fixture_participants
- fixture_events
- fixture_lineups
- fixture_lineup_details
- player_match_scores
- manager_round_scores
- api_sync_logs
- scoring_runs

Requirements:
- Keep Sportmonks IDs in dedicated fields.
- Separate raw Sportmonks data from calculated fantasy data.
- Add timestamps.
- Make fixture/event/lineup sync idempotent.
```

## Definition of Done

```text id="lwfbg1"
Database schema exists.
Migration runs.
Tables are ready for Sportmonks sync.
```

---

# 6. Task 3 — Sportmonks API Client

## Ziel

Serverseitigen Sportmonks Client bauen.

## Auftrag

```text id="88qhdw"
Implement a server-only Sportmonks API client.

Requirements:
- Read SPORTMONKS_API_TOKEN from server-side environment.
- Never expose token to frontend.
- Add functions:
  - getFixtureById(fixtureId)
  - getFixtureWithParticipants(fixtureId)
  - getFixtureWithEvents(fixtureId)
  - getFixtureWithLineups(fixtureId)
  - getFixtureWithLineupDetails(fixtureId)
- Use Football API V3.
- Add basic error handling.
- Log rate-limit metadata if available.
- No real token in code.
```

## Testfixture

```text id="5mrbup"
Fixture ID: 18903623
Galatasaray vs Beşiktaş
```

## Definition of Done

```text id="b1u7lw"
Server can fetch fixture 18903623.
Server can fetch participants.
Server can fetch events.
Server can fetch lineups.
Server can fetch lineups.details.
```

---

# 7. Task 4 — Fixture Sync bauen

## Ziel

Sportmonks-Daten in eigene Datenbank speichern.

## Auftrag

```text id="uv4na6"
Implement syncFixture(fixtureId).

Use:
- docs/API_SYNC_PLAN.md
- docs/DATABASE_SCHEMA.md
- docs/API_TEST_RESULTS.md

Requirements:
- Fetch fixture detail.
- Fetch participants.
- Fetch events.
- Fetch lineups.
- Fetch lineups.details.
- Store data in:
  - fixtures
  - fixture_participants
  - fixture_events
  - fixture_lineups
  - fixture_lineup_details
- Use upsert logic.
- Running sync twice must not create duplicates.
- Write api_sync_logs.
- Handle partial failures.
```

## Definition of Done

```text id="ae6fqy"
Fixture 18903623 is stored locally.
Participants are stored.
Events are stored.
Lineups are stored.
Lineup details are stored.
Sync can run multiple times safely.
```

---

# 8. Task 5 — Player Match Score Engine

## Ziel

Spielerpunkte aus echten Rohdaten berechnen.

## Auftrag

```text id="d0himz"
Implement the first player scoring engine for fixture 18903623.

Use:
- docs/TYPE_ID_MAPPING.md
- docs/SCORING_RULES.md

Inputs:
- fixture_events
- fixture_lineups
- fixture_lineup_details

Output:
- player_match_scores

Rules:
- type_id 118 = rating, provisional.
- type_id 119 = minutes, provisional.
- event type_id 14 = goal.
- event type_id 16 = penalty goal.
- event type_id 19 = yellow card.
- event type_id 20 = red card.
- related_player_id on goal events = assist.
- position_id determines goal points.
- 60+ minutes = +1.
- empty user lineup slots are handled later at manager scoring level.

Store:
- minutes
- rating
- goals
- penalty_goals
- assists
- yellow_cards
- red_cards
- points_rating
- points_minutes
- points_goals
- points_assists
- points_cards
- points_total
```

## Definition of Done

```text id="rp606m"
Mauro Icardi gets points from goals, rating and minutes.
Yellow cards produce negative points.
Red cards produce negative points.
Assists are recognized through related_player_id.
player_match_scores are saved.
```

---

# 9. Task 6 — Testmanager-Scoring

## Ziel

Ein Fantasy-Manager bekommt Punkte aus echter Fixture-Auswertung.

## Auftrag

```text id="2gsl0y"
Create a simulated test manager scoring flow.

Requirements:
- Create test user.
- Create test fantasy league.
- Create test manager team.
- Create test squad using players from fixture 18903623.
- Create test lineup.
- Include at least:
  - Mauro Icardi
  - Fernando Muslera
  - Lucas Torreira
  - Barış Alper Yılmaz
- Add one empty lineup slot to test -4.
- Calculate manager_round_score from player_match_scores.
- Store manager_round_scores.
- Store slot-level point explanations if supported.
```

## Definition of Done

```text id="a7tpnc"
Test manager gets total points.
Empty slot gives -4.
User-bank player gives 0 if not in lineup.
Point breakdown is visible.
```

---

# 10. Task 7 — Admin Sync Page

## Ziel

Admin kann Sync und Scoring auslösen und sehen.

## Auftrag

```text id="w682x4"
Build a simple admin sync page.

Route:
- /admin/sync

Features:
- Button: Sync test fixture 18903623
- Button: Calculate player scores
- Button: Calculate test manager score
- Show latest api_sync_logs
- Show latest scoring_runs
- Show errors if any
- Do not expose API token
```

## Definition of Done

```text id="mnq884"
Admin can run sync.
Admin can run scoring.
Logs are visible.
Errors are visible.
Token is never shown.
```

---

# 11. Task 8 — Erste User-Seiten

## Ziel

Minimal sichtbare App.

## Auftrag

```text id="q58vc4"
Create simple MVP pages with placeholder data or real synced test data.

Pages:
- /dashboard
- /squad
- /lineup
- /points
- /table
- /transfer-market

Requirements:
- Keep design simple.
- Show TL values.
- Show squad players.
- Show lineup slots.
- Show points breakdown.
- Show table.
- Do not polish UI before backend works.
```

## Definition of Done

```text id="m9smmo"
User can navigate basic pages.
Points page can display test scoring result.
Squad page can display players.
Lineup page can show 4-4-2 slots.
```

---

# 12. Task 9 — Dengeli Başlangıç

## Ziel

Faire Startkader erzeugen.

## Auftrag

```text id="uh5fro"
Implement initial Dengeli Başlangıç squad generation.

Rules:
- Each manager starts with 15 players.
- Suggested distribution:
  - 2 GK
  - 5 DEF
  - 5 MID
  - 3 FWD
- Startbudget: 100 Mio. TL.
- Initial squad total value should be balanced across managers.
- Do not randomly give extreme topstar advantage.
- Remaining budget is calculated after squad assignment.
```

## Definition of Done

```text id="94l09e"
Each manager gets 15 players.
Each manager can build a legal 4-4-2 lineup.
Squad values are close.
Remaining budgets are calculated.
```

---

# 13. Task 10 — Transfermarkt MVP

## Ziel

Einfacher Transfermarkt.

## Auftrag

```text id="q9pp0t"
Implement first simple transfer market.

MVP version:
- Show unowned players in the league.
- User can buy player if budget is enough.
- Player joins manager squad.
- Budget decreases.
- User can sell player back to system.
- Budget increases.
- Player becomes unowned.
```

## Definition of Done

```text id="8px9uz"
User can buy a player.
Budget decreases.
Player appears in squad.
User can sell a player.
Budget increases.
Player leaves squad.
```

---

# 14. Task 11 — League Table

## Ziel

Ligatabelle anzeigen.

## Auftrag

```text id="fif9wz"
Implement league table.

Show:
- Rank
- Manager team name
- Round points
- Total points
- Squad value
- Budget
```

## Definition of Done

```text id="iyouba"
Table sorts by total points.
Manager scores update after scoring run.
```

---

# 15. Task 12 — Current Season Test

## Ziel

Von historischem Testfixture zur aktuellen Saison gehen.

## Auftrag

```text id="e5a8no"
Test current Super Lig season integration.

Known:
- League ID: 600
- Current Season ID: 25682

Requirements:
- Fetch current season info.
- Fetch rounds for season 25682.
- Fetch fixtures for season 25682.
- Identify next/current round.
- Calculate round lock time from earliest fixture starting_at.
- Document endpoint results in docs/API_TEST_RESULTS.md.
```

## Definition of Done

```text id="h1gtb0"
Current season fixtures can be fetched.
Rounds can be mapped.
Round lock time can be calculated.
```

---

# 16. Task 13 — Injury / Suspension Test

## Ziel

Pro-relevante Daten prüfen.

## Auftrag

```text id="nlsntv"
Test injuries and suspensions from Sportmonks.

Requirements:
- Find correct endpoints/includes for injuries.
- Find correct endpoints/includes for suspensions.
- Test with Süper Lig teams/players.
- Document whether data is available in current plan.
- Do not build Pro feature yet.
```

## Definition of Done

```text id="mw6h8z"
We know whether injuries are available.
We know whether suspensions are available.
We know whether these require a higher Sportmonks plan.
```

---

# 17. Reihenfolge für Coding-Agenten

Coding-Agenten sollen exakt diese Reihenfolge einhalten:

```text id="gcsjgv"
1. Task 1: Projektgerüst
2. Task 2: Datenbankschema
3. Task 3: Sportmonks API Client
4. Task 4: Fixture Sync
5. Task 5: Player Match Score Engine
6. Task 6: Testmanager-Scoring
7. Task 7: Admin Sync Page
8. Task 8: Erste User-Seiten
9. Task 9: Dengeli Başlangıç
10. Task 10: Transfermarkt MVP
11. Task 11: League Table
12. Task 12: Current Season Test
13. Task 13: Injury / Suspension Test
```

Nicht springen.

---

# 18. Was ein Agent nicht tun darf

```text id="8286eq"
Kein neues Spielkonzept erfinden.
Keine andere Währung nutzen.
Kein Wettprodukt bauen.
Keine API-Tokens committen.
Kein Frontend-Sportmonks-Call.
Keine Punkte manuell hardcoden.
Keine UI-Politur vor Datenkette.
Keine Premium-Funktionen vor MVP.
```

---

# 19. Erstes Copy-Paste-Prompt für Coding-Agent

```text id="39z5mg"
We are building a Süper Lig fantasy football manager game.

Before coding, read all files in docs/:
- PRODUCT_MASTERPLAN.md
- MVP_BUILD_PLAN.md
- DATABASE_SCHEMA.md
- API_SYNC_PLAN.md
- API_TEST_RESULTS.md
- TYPE_ID_MAPPING.md
- SCORING_RULES.md
- CODING_AGENT_TASKS.md

Implement Task 1 only:
Create the initial Next.js + TypeScript project structure.

Requirements:
- Next.js App Router
- TypeScript
- clean folder structure
- placeholder database layer
- server-only Sportmonks API client folder
- environment placeholder SPORTMONKS_API_TOKEN
- no real API token in code
- no real API token in docs
- basic routes:
  - /dashboard
  - /squad
  - /lineup
  - /transfer-market
  - /points
  - /table
  - /admin/sync

Do not implement full UI.
Do not implement scoring yet.
Do not invent rules.
Follow docs exactly.

After finishing:
- summarize changed files
- explain how to run locally
- confirm that no token is exposed
```

---

# 20. Status

Version: 0.1

Diese Datei ist die Aufgabenliste für Coding-Agenten.
