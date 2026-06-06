# API_SYNC_PLAN.md

## Projekt

Süper-Lig-Fantasy-Manager-Spiel

## Zweck

Diese Datei definiert, wie Sportmonks-Daten sauber in unsere eigene App-Datenbank synchronisiert werden.

Ziel:

```text
nicht pro User live die API abfragen
Daten zentral abrufen
Daten lokal speichern
Punkte aus lokaler Datenbank berechnen
API-Kosten und Rate Limits kontrollieren
```

---

# 1. Grundprinzip

Sportmonks ist die externe Datenquelle.

Unsere App arbeitet aber primär mit unserer eigenen Datenbank.

## Falsch

```text
User öffnet Dashboard
→ App ruft für jeden User live Sportmonks API auf
→ teuer, langsam, riskant
```

## Richtig

```text
Backend ruft Sportmonks zentral ab
→ speichert Daten in eigener Datenbank
→ User sieht Daten aus unserer Datenbank
→ Scoring Engine berechnet Punkte lokal
```

---

# 2. Warum Sync wichtig ist

Wir brauchen API-Sync für:

```text
Teams
Spieler
Saisons
Rounds / Spieltage
Fixtures
Participants
Events
Lineups
Lineup Details
Verletzungen
Sperren
```

Ohne Sync gibt es:

```text
zu viele API Calls
langsame App
instabile Punkteberechnung
schlechte Fehlerkontrolle
```

---

# 3. API-Anbieter

```text
Provider: Sportmonks
API: Football API V3
League: Super Lig
League ID: 600
Current Season ID: 25682
```

Wichtig:

```text
API Token niemals in GitHub speichern.
Token nur als Environment Variable / Secret speichern.
```

Beispiel:

```text
SPORTMONKS_API_TOKEN=...
```

---

# 4. Daten-Sync-Reihenfolge

Die Reihenfolge ist wichtig.

## Phase 1: Stammdaten

Zuerst holen:

```text
Seasons
Rounds
Teams
Players
```

Warum?

Diese Daten sind Grundlage für alles Weitere.

---

## Phase 2: Spielplan

Danach holen:

```text
Fixtures
Fixture Participants
```

Warum?

Fixtures bestimmen:

```text
Spieltag
Lock-Zeit
Home/Away
Spielstatus
Punkteberechnung
```

---

## Phase 3: Matchdaten

Kurz vor und während Spieltagen holen:

```text
Lineups
Events
Lineup Details
Statistics
```

Warum?

Diese Daten bestimmen:

```text
wer spielte
wer war Startelf
wer war Bank
wer schoss Tore
wer gab Assists
wer bekam Karten
wer bekam Rating
wie viele Minuten wurden gespielt
```

---

## Phase 4: Statusdaten

Regelmäßig holen:

```text
Injuries
Suspensions
Transfers
Player status
```

Warum?

Diese Daten beeinflussen:

```text
Aufstellungsempfehlungen
Marktwert
User-Entscheidungen
Transfermarkt
```

---

# 5. Sync-Arten

## 5.1 Initial Sync

Einmaliger Startimport.

Holt:

```text
aktuelles Süper-Lig-Teamset
aktuelle Spieler
aktuelle Saison
aktuelle Rounds
aktuelle Fixtures
```

Ziel:

```text
Datenbank erstmalig füllen
```

---

## 5.2 Daily Sync

Täglich ausführen.

Holt:

```text
Spielerupdates
Teamupdates
Verletzungen
Sperren
Fixture-Änderungen
Marktwertrelevante Daten
```

Empfohlene Uhrzeit:

```text
morgens 06:00 UTC
```

---

## 5.3 Matchday Pre-Lock Sync

Vor dem ersten Spiel eines Spieltags.

Holt:

```text
Fixture-Liste
Anstoßzeiten
Spielstatus
mögliche Lineup-Vorinfos
```

Ziel:

```text
Lock-Zeit korrekt setzen
```

Empfohlene Frequenz:

```text
alle 30 Minuten am Spieltag
bis zum ersten Anpfiff
```

---

## 5.4 Live Match Sync

Während laufender Spiele.

Holt:

```text
Events
Lineups
Lineup Details
Scores
State
```

Empfohlene Frequenz MVP:

```text
alle 5 Minuten während laufender Süper-Lig-Spiele
```

Später optimieren:

```text
alle 60–120 Sekunden
nur bei aktiven Fixtures
```

---

## 5.5 Post Match Sync

Nach Spielende.

Holt final:

```text
Events
Lineups
Lineup Details
Statistics
Result
State
```

Ziel:

```text
finale Punkte berechnen
```

Empfohlene Regel:

```text
15 Minuten nach Spielende
60 Minuten nach Spielende erneut
am nächsten Morgen finaler Kontroll-Sync
```

---

# 6. Welche Daten wohin gespeichert werden

## Teams

Sportmonks → `real_teams`

```text
sportmonks_team_id
name
short_code
logo_url
country_id
venue_id
```

---

## Players

Sportmonks → `players`

```text
sportmonks_player_id
name
display_name
current_team_id
position_id
image_url
date_of_birth
status
current_market_value
```

Wichtig:

```text
current_market_value ist unser eigener Fantasy-Wert.
Nicht blind von externer Quelle übernehmen.
```

---

## Seasons

Sportmonks → `seasons`

```text
sportmonks_season_id
league_id
name
is_current
starts_at
ends_at
```

---

## Rounds

Sportmonks → `rounds`

```text
sportmonks_round_id
season_id
name
round_number
starts_at
ends_at
status
```

---

## Fixtures

Sportmonks → `fixtures`

```text
sportmonks_fixture_id
league_id
season_id
round_id
home_team_id
away_team_id
starting_at
state_id
result_info
length
```

---

## Participants

Sportmonks → `fixture_participants`

```text
fixture_id
team_id
location
winner
position
```

---

## Events

Sportmonks → `fixture_events`

```text
sportmonks_event_id
fixture_id
team_id
player_id
related_player_id
type_id
minute
extra_minute
result
info
addition
```

---

## Lineups

Sportmonks → `fixture_lineups`

```text
sportmonks_lineup_id
fixture_id
player_id
team_id
position_id
formation_field
formation_position
type_id
player_name
jersey_number
```

---

## Lineup Details

Sportmonks → `fixture_lineup_details`

```text
sportmonks_detail_id
fixture_id
lineup_id
player_id
team_id
type_id
value
```

Wichtige Werte:

```text
type_id 118 = wahrscheinlich Rating
type_id 119 = wahrscheinlich gespielte Minuten
```

---

# 7. API Includes

Für ein Fixture brauchen wir meistens:

```text
participants
events
lineups
lineups.details
statistics
```

Getestete Includes:

```text
include=participants
include=events
include=lineups
include=lineups.details
include=statistics
```

Wichtigster Include für Punkte:

```text
lineups.details
```

Warum?

Dort kommen wahrscheinlich:

```text
Rating
Spielminuten
```

---

# 8. Caching-Regeln

## Stammdaten

Teams, Spieler, Saisons:

```text
1x täglich
```

## Fixtures

Vor Spieltag:

```text
mehrmals täglich
```

Während Spieltag:

```text
alle 5 Minuten für aktive Fixtures
```

Nach Spielende:

```text
finaler Sync nach 15 Minuten
erneuter Sync nach 60 Minuten
Kontroll-Sync am nächsten Morgen
```

## Events und Lineups

Nur für relevante Fixtures abrufen:

```text
aktuelle Süper-Lig-Saison
aktuelle und kürzlich beendete Spiele
```

Nicht für alle historischen Fixtures ständig abrufen.

---

# 9. Rate-Limit-Strategie

Grundregel:

```text
ein API-Call soll viele User bedienen
```

Nicht:

```text
ein User = ein API-Call
```

## Schutzmaßnahmen

```text
Datenbank-Cache
Sync-Jobs
Queue-System
Rate-Limit-Logging
Retry mit Backoff
keine unnötigen Live-Calls
```

## api_sync_logs speichern

Jeder Sync schreibt in:

```text
api_sync_logs
```

Mit:

```text
sync_type
status
started_at
finished_at
items_fetched
items_created
items_updated
error_message
```

---

# 10. Fehlerbehandlung

## Wenn Sportmonks nicht erreichbar ist

App soll nicht abstürzen.

Stattdessen:

```text
letzte gespeicherte Daten anzeigen
Admin-Warnung anzeigen
Sync später erneut versuchen
```

## Wenn Fixture-Daten unvollständig sind

Status:

```text
partial
```

Dann:

```text
keine finale Punkteberechnung
später erneut synchronisieren
Admin-Hinweis zeigen
```

## Wenn Lineups fehlen

Dann:

```text
Fixture nicht final scoren
Retry planen
Admin-Warnung
```

## Wenn Events fehlen

Dann:

```text
Fixture nicht final scoren
Retry planen
Admin-Warnung
```

## Wenn Rating fehlt

Dann erste Fallback-Regel:

```text
Rating-Punkte = 0
andere Events trotzdem berechnen
```

Aber:

```text
Fixture als partial markieren
```

---

# 11. Scoring-Auslöser

Die Punkte-Engine darf erst laufen, wenn:

```text
Fixture beendet
Lineups vorhanden
Events vorhanden
Lineup Details vorhanden oder bewusst als fehlend markiert
```

## MVP-Regel

```text
Punkteberechnung startet erst nach Spielende.
Keine Live-Punkte im MVP.
```

Warum?

```text
einfacher
stabiler
weniger API-Kosten
weniger Fehler
```

Live-Punkte kommen später.

---

# 12. Spieltags-Lock Sync

Spieltags-Lock wird aus Fixtures berechnet.

Regel:

```text
round_lock_time = earliest starting_at of all fixtures in that round
```

Wenn Round nicht sauber verfügbar ist:

```text
Lock aus allen Super-Lig-Fixtures des Wochenendes berechnen
```

Besser:

```text
Round sauber über Sportmonks abrufen
```

Offen:

```text
Rounds / Spieltage für Season 25682 testen
```

---

# 13. Erste technische Job-Struktur

## Jobs

```text
sync:seasons
sync:rounds
sync:teams
sync:players
sync:fixtures
sync:fixture-participants
sync:fixture-events
sync:fixture-lineups
sync:fixture-lineup-details
score:fixture
score:round
update:market-values
```

---

# 14. Initiale MVP-Sync-Reihenfolge

Für ersten Prototyp:

```text
1. sync teams
2. sync players
3. sync one test fixture
4. sync participants for fixture
5. sync events for fixture
6. sync lineups for fixture
7. sync lineups.details for fixture
8. calculate player_match_scores
9. simulate manager lineup
10. calculate manager_round_score
```

Testfixture:

```text
Fixture ID: 18903623
Galatasaray vs Beşiktaş
```

---

# 15. Erste Testdaten

Für MVP-Scoring-Test:

```text
Fixture ID: 18903623
Teams: Galatasaray vs Beşiktaş
League ID: 600
Season ID: 22057
```

Getestete Daten:

```text
participants: funktioniert
events: funktioniert
lineups: funktioniert
lineups.details: funktioniert
statistics: teilweise, eher Teamdaten
```

---

# 16. Nächste API-Tests

Noch offen:

```text
aktuelles Season-Fixture mit Season ID 25682 abrufen
Rounds für Season 25682 abrufen
aktuelle Kader pro Team abrufen
Player by Team testen
Injuries testen
Suspensions testen
Type-ID-Dokumentation offiziell gegenprüfen
```

---

# 17. Security-Regeln

## API Token

Nie in:

```text
GitHub
README
Markdown-Dokumente
Frontend-Code
Screenshots
```

Speichern nur in:

```text
.env.local
Replit Secrets
Vercel Secrets
Supabase Edge Secrets
Server-only Environment Variables
```

## Frontend

Frontend darf niemals direkt Sportmonks API mit Token aufrufen.

Richtig:

```text
Frontend → eigenes Backend → Datenbank
```

Nicht:

```text
Frontend → Sportmonks API
```

---

# 18. Admin-Dashboard für Sync

MVP-Admin soll später sehen:

```text
letzter Teams-Sync
letzter Players-Sync
letzter Fixtures-Sync
letzter Events-Sync
letzter Lineups-Sync
Fehlerstatus
Rate-Limit-Status
Fixture neu synchronisieren
Fixture neu berechnen
```

Admin soll nicht Punkte manuell pflegen.

Admin soll nur kontrollieren und Notfälle beheben.

---

# 19. Technische Empfehlung

Für den ersten Build:

```text
Next.js oder React + Backend
PostgreSQL
Prisma oder Drizzle
Sportmonks API über Backend-Service
Cron Jobs / Scheduled Jobs
```

Wenn Replit genutzt wird:

```text
API Token in Replit Secrets
PostgreSQL extern
Sync-Jobs über Backend-Routen oder Worker
```

---

# 20. MVP-Entscheidung

Für MVP:

```text
keine Live-Punkte
keine API-Calls pro User
kein Frontend-Zugriff auf Sportmonks
erst historisches Fixture scoren
dann aktuelle Saison automatisieren
```

Warum?

```text
schneller
günstiger
stabiler
besser testbar
```

---

# 21. Definition of Done für API-Sync MVP

Der API-Sync-Prototyp ist fertig, wenn:

```text
ein Fixture aus Sportmonks abgerufen wird
participants gespeichert werden
events gespeichert werden
lineups gespeichert werden
lineups.details gespeichert werden
player_match_scores berechnet werden
ein Testmanager daraus Punkte bekommt
```

Erst danach lohnt sich die komplette App-Oberfläche.

---

# 22. Status

Version: 0.1

Diese Datei definiert den ersten API-Sync-Plan für Sportmonks und unser Fantasy-Spiel.
