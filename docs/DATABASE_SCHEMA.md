# DATABASE_SCHEMA.md

## Projekt

Süper-Lig-Fantasy-Manager-Spiel

## Zweck

Diese Datei beschreibt die erste Datenbankstruktur für das Fantasy-Spiel.

Ziel:

```text
klare Tabellen
saubere Beziehungen
keine chaotische Datenlogik
bereit für MVP-Entwicklung
```

Diese Struktur ist Version 0.1 und kann später technisch angepasst werden.

---

# 1. Grundidee der Datenbank

Das System besteht aus zwei Welten:

## 1.1 Echte Fußballwelt

Daten aus Sportmonks:

```text
echte Teams
echte Spieler
echte Fixtures
echte Lineups
echte Events
echte Spielerstatistiken
```

## 1.2 Fantasy-Spielwelt

Unsere eigenen Spieldaten:

```text
User
private Ligen
Manager-Teams
Kader
Aufstellungen
Transfers
Punkte
Marktwerte
```

Wichtig:

```text
Sportmonks-Daten sind Quelle.
Fantasy-Daten gehören uns.
```

---

# 2. Tabellenübersicht

## Echte Fußballtabellen

```text
real_teams
players
fixtures
fixture_participants
fixture_events
fixture_lineups
fixture_lineup_details
rounds
seasons
```

## Fantasy-Spieltabellen

```text
users
fantasy_leagues
fantasy_league_members
manager_teams
manager_squad_players
manager_lineups
manager_lineup_slots
transfers
transfer_bids
player_market_values
player_match_scores
manager_round_scores
```

## Systemtabellen

```text
api_sync_logs
scoring_runs
admin_audit_logs
```

---

# 3. users

Speichert App-User.

```text
id
email
name
avatar_url
created_at
updated_at
```

## Hinweise

Ein User kann in mehreren Fantasy-Ligen sein.

---

# 4. fantasy_leagues

Eine private Fantasy-Liga.

```text
id
name
invite_code
owner_user_id
season_id
start_mode
budget_start
max_members
status
created_at
updated_at
```

## Beispielwerte

```text
name: Bizim Süper Lig
invite_code: ABC123
start_mode: dengeli_baslangic
budget_start: 100000000
max_members: 8
status: active
```

## start_mode

Mögliche Werte:

```text
dengeli_baslangic
manual_draft
random_basic
```

Für MVP wichtig:

```text
dengeli_baslangic
```

---

# 5. fantasy_league_members

Verknüpft User mit Fantasy-Ligen.

```text
id
fantasy_league_id
user_id
role
joined_at
status
```

## role

```text
owner
member
admin
```

## status

```text
active
left
banned
```

---

# 6. manager_teams

Das Fantasy-Team eines Users innerhalb einer Liga.

```text
id
fantasy_league_id
user_id
name
budget
points_total
squad_value
created_at
updated_at
```

## Wichtig

Ein User kann in mehreren Ligen unterschiedliche Manager-Teams haben.

Beispiel:

```text
User Ertan
Liga A: Aslanlar FC
Liga B: Urla United
```

---

# 7. real_teams

Echte Süper-Lig-Teams aus Sportmonks.

```text
id
sportmonks_team_id
name
short_code
country_id
venue_id
logo_url
founded
last_played_at
created_at
updated_at
```

## Beispiel

```text
sportmonks_team_id: 34
name: Galatasaray
short_code: GAL
```

---

# 8. players

Echte Spieler aus Sportmonks plus Fantasy-Marktwert.

```text
id
sportmonks_player_id
current_team_id
name
display_name
date_of_birth
position_id
image_url
nationality_country_id
current_market_value
status
created_at
updated_at
```

## position_id

Sportmonks Position IDs:

```text
24 = Torwart
25 = Abwehr
26 = Mittelfeld
27 = Sturm
```

## status

```text
active
injured
suspended
unknown
left_league
```

## current_market_value

Unser interner Fantasy-Marktwert in TL.

Beispiel:

```text
18000000
```

Anzeige:

```text
18 Mio. TL
```

---

# 9. manager_squad_players

Welche Spieler gehören zu welchem Manager-Team?

```text
id
manager_team_id
player_id
purchase_price
current_value_at_purchase
acquired_via
acquired_at
sold_at
status
```

## acquired_via

```text
initial_squad
transfer_market
admin_adjustment
```

## status

```text
active
sold
removed
```

## Wichtig

Ein Spieler kann in einer Fantasy-Liga nur einem Manager gehören.

In einer anderen Fantasy-Liga kann derselbe echte Spieler aber einem anderen Manager gehören.

---

# 10. manager_lineups

Eine Aufstellung pro Manager pro Spieltag/Round.

```text
id
manager_team_id
round_id
formation
locked_at
status
created_at
updated_at
```

## formation

MVP:

```text
4-4-2
```

Später:

```text
3-5-2
4-3-3
3-4-3
5-3-2
```

## status

```text
draft
locked
scored
```

---

# 11. manager_lineup_slots

Ein einzelner Slot in einer User-Aufstellung.

```text
id
manager_lineup_id
slot_index
slot_position
player_id
is_empty
created_at
updated_at
```

## slot_position

```text
GK
DEF
MID
FWD
```

## Beispiel 4-4-2

```text
1 GK
4 DEF
4 MID
2 FWD
```

## Leere Position

Wenn `is_empty = true`, bekommt der Manager:

```text
-4 Punkte
```

Regel steht in:

```text
docs/SCORING_RULES.md
```

---

# 12. seasons

Sportmonks-Saisons.

```text
id
sportmonks_season_id
league_id
name
is_current
starts_at
ends_at
created_at
updated_at
```

## Bekannte Werte

```text
Super Lig League ID: 600
Current Season ID: 25682
```

---

# 13. rounds

Spieltage / Rounds.

```text
id
sportmonks_round_id
season_id
name
round_number
starts_at
ends_at
status
created_at
updated_at
```

## status

```text
scheduled
running
finished
scored
```

## Wichtig

Round ist entscheidend für:

```text
Spieltags-Lock
Aufstellung
Punkteberechnung
Ligatabelle
```

---

# 14. fixtures

Echte Spiele aus Sportmonks.

```text
id
sportmonks_fixture_id
sport_id
league_id
season_id
stage_id
round_id
state_id
venue_id
home_team_id
away_team_id
name
starting_at
starting_at_timestamp
result_info
length
has_odds
created_at
updated_at
```

## Beispiel

```text
sportmonks_fixture_id: 18903623
name: Galatasaray vs Beşiktaş
league_id: 600
season_id: 22057
starting_at: 2023-10-21 16:00:00
```

---

# 15. fixture_participants

Teams innerhalb eines Fixtures.

```text
id
fixture_id
team_id
location
winner
position
created_at
updated_at
```

## location

```text
home
away
```

## Beispiel

```text
Galatasaray
location: home
winner: true
```

---

# 16. fixture_events

Spielereignisse aus Sportmonks.

```text
id
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
created_at
updated_at
```

## Wichtige type_id-Werte

```text
14 = Tor
16 = Elfmeter-Tor
18 = Wechsel
19 = Gelbe Karte
20 = Rote Karte
1697 = Kartenkorrektur
```

Details stehen in:

```text
docs/TYPE_ID_MAPPING.md
```

---

# 17. fixture_lineups

Lineups aus Sportmonks.

```text
id
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
created_at
updated_at
```

## type_id

```text
11 = Startelf
12 = Ersatzbank
```

## Wichtig

Diese Tabelle sagt:

```text
War ein Spieler Startelf?
War er auf der Bank?
Welche Position hatte er?
```

---

# 18. fixture_lineup_details

Spielerstatistiken pro Match aus `lineups.details`.

```text
id
sportmonks_detail_id
fixture_id
lineup_id
player_id
team_id
type_id
value
created_at
updated_at
```

## Wichtige type_id-Werte

```text
118 = wahrscheinlich Rating
119 = wahrscheinlich gespielte Minuten
```

## Beispiel

```text
player: Mauro Icardi
type_id: 118
value: 7.9
```

```text
player: Mauro Icardi
type_id: 119
value: 90
```

---

# 19. player_match_scores

Berechnete Fantasy-Punkte pro Spieler pro Fixture.

```text
id
fixture_id
player_id
team_id
position_id
minutes
rating
goals
penalty_goals
assists
yellow_cards
red_cards
clean_sheet
own_goals
missed_penalties
points_rating
points_minutes
points_goals
points_assists
points_cards
points_clean_sheet
points_total
calculated_at
created_at
updated_at
```

## Warum eigene Tabelle?

Damit wir Sportmonks-Rohdaten nicht jedes Mal neu berechnen müssen.

Diese Tabelle ist das Ergebnis der Scoring Engine.

---

# 20. manager_round_scores

Punkte eines Managers pro Spieltag.

```text
id
manager_team_id
round_id
points_lineup
points_empty_slots
points_total
rank_in_round
calculated_at
created_at
updated_at
```

## Beispiel

```text
manager_team_id: 7
round_id: 12
points_total: 48
rank_in_round: 2
```

---

# 21. manager_lineup_slot_scores

Punkte pro einzelner Aufstellungsposition.

```text
id
manager_lineup_slot_id
player_match_score_id
player_id
points
reason_summary
created_at
updated_at
```

## Beispiel reason_summary

```text
Rating +2, Tor +3, Minuten +1, Gelb -1 = 5 Punkte
```

Diese Tabelle ist wichtig für Transparenz im UI.

---

# 22. transfers

Transferaktionen.

```text
id
fantasy_league_id
player_id
from_manager_team_id
to_manager_team_id
transfer_type
price
status
created_at
completed_at
```

## transfer_type

```text
market_buy
market_sell
direct_buy
auction_win
admin_adjustment
```

## status

```text
pending
completed
cancelled
failed
```

---

# 23. transfer_bids

Gebote auf Spieler.

```text
id
transfer_id
manager_team_id
bid_amount
status
created_at
updated_at
```

## status

```text
active
winning
outbid
cancelled
won
lost
```

Für MVP kann dieses Modul später kommen.

Die erste einfache Version kann Direktkauf nutzen.

---

# 24. player_market_values

Historie der Marktwerte.

```text
id
player_id
market_value
change_amount
change_percent
reason
calculated_at
created_at
```

## reason

```text
initial_value
performance_update
demand_update
manual_adjustment
```

## Wichtig

Marktwerte sind unsere internen Fantasy-Spielwerte.

Sie sind keine offiziellen realen Transfermarkt-Werte.

---

# 25. api_sync_logs

Protokoll für API-Synchronisierung.

```text
id
provider
sync_type
status
started_at
finished_at
items_fetched
items_created
items_updated
error_message
created_at
```

## provider

```text
sportmonks
```

## sync_type

```text
teams
players
fixtures
events
lineups
lineup_details
injuries
suspensions
```

## status

```text
running
success
failed
partial
```

---

# 26. scoring_runs

Protokoll für Punkteberechnung.

```text
id
round_id
fixture_id
status
started_at
finished_at
players_scored
managers_scored
error_message
created_at
```

## status

```text
running
success
failed
partial
```

---

# 27. admin_audit_logs

Admin-Aktionen.

```text
id
admin_user_id
action
target_type
target_id
details
created_at
```

## Beispiele

```text
manual_rescore_fixture
manual_market_value_adjustment
force_sync_fixture
update_player_status
```

---

# 28. Wichtige Beziehungen

## User zu Liga

```text
users.id
-> fantasy_league_members.user_id
-> fantasy_leagues.id
```

## User zu Manager-Team

```text
users.id
-> manager_teams.user_id
```

## Manager-Team zu Kader

```text
manager_teams.id
-> manager_squad_players.manager_team_id
-> players.id
```

## Manager-Team zu Aufstellung

```text
manager_teams.id
-> manager_lineups.manager_team_id
-> manager_lineup_slots.manager_lineup_id
```

## Fixture zu echten Daten

```text
fixtures.id
-> fixture_events.fixture_id
-> fixture_lineups.fixture_id
-> fixture_lineup_details.fixture_id
```

## Spieler zu Punkteberechnung

```text
players.id
-> player_match_scores.player_id
```

## Manager zu Spieltagspunkten

```text
manager_teams.id
-> manager_round_scores.manager_team_id
```

---

# 29. MVP-Priorität

Für den ersten funktionierenden MVP brauchen wir zuerst:

```text
users
fantasy_leagues
fantasy_league_members
manager_teams
real_teams
players
manager_squad_players
manager_lineups
manager_lineup_slots
fixtures
fixture_events
fixture_lineups
fixture_lineup_details
player_match_scores
manager_round_scores
```

Später:

```text
transfer_bids
player_market_values
admin_audit_logs
injuries
suspensions
notifications
payments
```

---

# 30. Datenbank-Regeln

## Keine API-Tokens speichern

API-Token niemals in normalen Tabellen speichern.

Richtig:

```text
.env
secrets manager
deployment secrets
```

## Sportmonks IDs behalten

Jede importierte Entität muss ihre Sportmonks-ID behalten.

Beispiele:

```text
sportmonks_player_id
sportmonks_team_id
sportmonks_fixture_id
sportmonks_lineup_id
```

## Rohdaten und Fantasy-Daten trennen

Sportmonks-Daten nicht mit Fantasy-Daten vermischen.

Richtig:

```text
fixture_events = Rohdaten
player_match_scores = berechnete Fantasy-Daten
```

## Punkte nachvollziehbar speichern

Nicht nur Gesamtpunkte speichern.

Auch speichern:

```text
points_rating
points_goals
points_assists
points_cards
points_clean_sheet
reason_summary
```

Der User muss verstehen können, warum er Punkte bekommen hat.

---

# 31. Erste technische Empfehlung

Für MVP reicht PostgreSQL.

Empfohlen:

```text
PostgreSQL
Supabase oder Neon
Prisma oder Drizzle ORM
Next.js oder React + API Backend
```

Wenn Replit genutzt wird:

```text
PostgreSQL extern nutzen
API-Key als Secret speichern
keine echten Secrets ins GitHub Repo
```

---

# 32. Offene Entscheidungen

Noch zu entscheiden:

```text
Supabase oder Neon?
Prisma oder Drizzle?
Next.js Fullstack oder separates Backend?
Auktion direkt im MVP oder zuerst Direktkauf?
mehrere Formationen sofort oder erst 4-4-2?
öffentliche Ligen sofort oder später?
```

---

# 33. Status

Version: 0.1

Diese Datei beschreibt die erste Datenbankstruktur und ist Grundlage für die spätere technische Umsetzung.
