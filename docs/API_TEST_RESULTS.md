# API_TEST_RESULTS.md

## Projekt

Süper-Lig-Fantasy-Manager-Spiel

## Zweck dieser Datei

Diese Datei dokumentiert die bisherigen echten Sportmonks-API-Tests.

Ziel war zu prüfen, ob Sportmonks als Datenanbieter für ein automatisches Süper-Lig-Fantasy-Spiel technisch geeignet ist.

---

# 1. Anbieter

```text
Provider: Sportmonks
API: Football API V3
Plan: Starter Trial
Sport: Football
```

Wichtig:

```text
API-Token niemals in GitHub speichern.
API-Token nur lokal, in .env oder in sicheren Secret-Systemen speichern.
```

---

# 2. Gefundene Haupt-IDs

## Süper Lig

```text
League Name: Super Lig
Country: Türkiye
League ID: 600
```

## Current Season

```text
Current Season ID: 25682
```

Hinweis:

Die Current Season ID wurde im Sportmonks ID Finder angezeigt. Der direkte Abruf aktueller Saison-Fixtures muss noch separat getestet werden.

---

# 3. Getestetes Haupt-Fixture

Für die meisten Tests wurde folgendes Fixture verwendet:

```text
Fixture ID: 18903623
Name: Galatasaray vs Beşiktaş
League ID: 600
Season ID: 22057
Starting at: 2023-10-21 16:00:00 UTC
Result: Galatasaray won after full-time.
```

Dieses Fixture ist historisch, aber geeignet zum Prüfen von Events, Lineups, Ratings und Spielerstatistiken.

---

# 4. Erfolgreich getestete Endpoints / Includes

## 4.1 Fixture Detail

Getestet:

```text
GET /v3/football/fixtures/18903623
```

Ergebnis:

```text
Fixture Detail funktioniert.
```

Gelieferte Daten:

```text
fixture_id
league_id
season_id
stage_id
round_id
state_id
venue_id
name
starting_at
result_info
length
```

Status:

```text
Bestanden
```

---

## 4.2 Participants

Getestet:

```text
GET /v3/football/fixtures/18903623?include=participants
```

Ergebnis:

```text
Participants funktionieren.
```

Gelieferte Teams:

```text
Galatasaray
Team ID: 34
Location: home
Winner: true

Beşiktaş
Team ID: 554
Location: away
Winner: false
```

Zusätzlich geliefert:

```text
team name
short_code
image_path
founded
country_id
venue_id
home/away
winner
position
```

Status:

```text
Bestanden
```

---

## 4.3 Events

Getestet:

```text
GET /v3/football/fixtures/18903623?include=events
```

Ergebnis:

```text
Events funktionieren.
```

Gelieferte Ereignisse:

```text
Tore
Elfmeter-Tor
Assists über related_player_id
Einwechslungen
Gelbe Karten
Rote Karten
Kartenkorrekturen
Minuten
Spieler-ID
Team-ID
```

Beispiele:

```text
Mauro Icardi
type_id: 14
minute: 26
result: 1-0
=> Tor
```

```text
Alex Oxlade-Chamberlain
type_id: 14
related_player_name: Valentin Rosier
minute: 69
result: 1-1
=> Tor + möglicher Assist
```

```text
Mauro Icardi
type_id: 16
minute: 82
result: 2-1
=> Elfmeter-Tor
```

```text
Mert Günok
type_id: 20
minute: 30
addition: 1st Redcard
=> Rote Karte
```

```text
Daniel Amartey
type_id: 19
addition: Yellowcard
=> Gelbe Karte
```

Status:

```text
Bestanden
```

---

## 4.4 Lineups

Getestet:

```text
GET /v3/football/fixtures/18903623?include=lineups
```

Ergebnis:

```text
Lineups funktionieren.
```

Gelieferte Daten:

```text
player_id
team_id
position_id
formation_field
type_id
formation_position
player_name
jersey_number
```

Wichtige Erkenntnis:

```text
lineups.type_id = 11
=> Startelf

lineups.type_id = 12
=> Ersatzbank
```

Beispiele:

```text
Fernando Muslera
team_id: 34
position_id: 24
type_id: 11
formation_field: 1:1
=> Startelf, Torwart
```

```text
Kerem Demirbay
team_id: 34
position_id: 26
type_id: 12
formation_field: null
=> Bank, Mittelfeld
```

Status:

```text
Bestanden
```

---

## 4.5 Statistics

Getestet:

```text
GET /v3/football/fixtures/18903623?include=statistics
```

Ergebnis:

```text
Statistics funktionieren, aber auf Fixture-/Team-Ebene.
```

Gelieferte Daten:

```text
fixture_id
type_id
participant_id
data.value
location
```

Wichtige Erkenntnis:

```text
Diese Statistikdaten beziehen sich hauptsächlich auf Teams, nicht direkt auf einzelne Spieler.
```

Status:

```text
Teilweise bestanden
```

Bewertung:

```text
Gut für Match-Statistiken.
Nicht ausreichend für detaillierte Spielerpunkte.
Für Spielerpunkte ist lineups.details wichtiger.
```

---

## 4.6 Lineups Details

Getestet:

```text
GET /v3/football/fixtures/18903623?include=lineups.details
```

Ergebnis:

```text
Lineups Details funktionieren.
```

Das ist der wichtigste Test für die Fantasy-Punkte-Engine.

Gelieferte Daten pro Spieler:

```text
player_id
team_id
lineup_id
type_id
data.value
```

Wichtige Erkenntnisse:

```text
type_id 118
=> sehr wahrscheinlich Spieler-Rating

type_id 119
=> sehr wahrscheinlich gespielte Minuten
```

Beispiele:

```text
Mauro Icardi
lineups.details type_id: 118
value: 7.9
=> wahrscheinliches Rating
```

```text
Mauro Icardi
lineups.details type_id: 119
value: 90
=> wahrscheinliche Spielminuten
```

```text
Barış Alper Yılmaz
lineup type_id: 12
lineups.details type_id: 119
value: 25
=> Bankspieler, eingewechselt, 25 Minuten gespielt
```

Status:

```text
Bestanden
```

---

# 5. Gefundene Team-IDs

| Team        | Team ID | Status    |
| ----------- | ------: | --------- |
| Galatasaray |      34 | bestätigt |
| Fenerbahçe  |      88 | bestätigt |
| Beşiktaş    |     554 | bestätigt |
| Antalyaspor |      81 | bestätigt |

---

# 6. Gefundene Position IDs

| position_id | Bedeutung  | Status      |
| ----------: | ---------- | ----------- |
|          24 | Torwart    | sehr sicher |
|          25 | Abwehr     | sehr sicher |
|          26 | Mittelfeld | sehr sicher |
|          27 | Sturm      | sehr sicher |

---

# 7. Gefundene wichtige Event Type IDs

| type_id | Bedeutung                    | Status      |
| ------: | ---------------------------- | ----------- |
|      14 | Tor                          | sehr sicher |
|      16 | Elfmeter-Tor                 | sehr sicher |
|      18 | Wechsel                      | sehr sicher |
|      19 | Gelbe Karte                  | sehr sicher |
|      20 | Rote Karte                   | sehr sicher |
|      10 | Elfmeter zurückgenommen      | beobachtet  |
|    1697 | Kartenentscheidung angepasst | beobachtet  |

Die vollständige Type-ID-Zuordnung steht in:

```text
docs/TYPE_ID_MAPPING.md
```

---

# 8. Bedeutung für unser Fantasy-Spiel

Mit den bisher getesteten Daten können wir eine erste automatische Punkte-Engine bauen.

Sicher möglich:

```text
Spieler im User-Lineup prüfen
Startelf / Bank erkennen
gespielte Minuten erkennen
Tore erkennen
Elfmeter-Tore erkennen
Assists über related_player_id erkennen
Gelbe Karten erkennen
Rote Karten erkennen
Rating-Punkte berechnen
Clean Sheet wahrscheinlich ableiten
```

Damit ist Sportmonks technisch für den Kern des Produkts geeignet.

---

# 9. Was noch offen ist

Noch zu testen:

```text
aktuelle Season ID 25682 direkt abrufen
Fixtures für aktuelle Saison nach Season ID abrufen
Rounds / Spieltage abrufen
Player Squads für aktuelle Saison abrufen
Verletzungen abrufen
Sperren abrufen
Transfers abrufen
Market-value-Logik intern definieren
offizielle Type-ID-Dokumentation prüfen
Fantasy-/Commercial-Lizenz schriftlich klären
```

---

# 10. Kritische offene Frage

Die wichtigste nicht-technische Frage:

```text
Darf Sportmonks Football API kommerziell für ein öffentliches Fantasy-Football-Manager-Spiel genutzt werden?
```

Technische Tests sagen:

```text
Ja, Sportmonks ist geeignet.
```

Lizenzstatus sagt:

```text
Noch schriftlich klären, bevor Launch oder Payment aktiviert wird.
```

---

# 11. Technische Entscheidung

Aktuelle Entscheidung:

```text
Sportmonks bleibt Hauptkandidat als Datenanbieter.
```

Grund:

```text
Süper Lig vorhanden
Teams vorhanden
Spieler vorhanden
Fixtures vorhanden
Events vorhanden
Lineups vorhanden
Lineups Details vorhanden
Ratings wahrscheinlich vorhanden
Minuten wahrscheinlich vorhanden
```

---

# 12. Nächster technischer Schritt

Nächste Tests:

```text
1. Aktuelle Saison 25682 sauber abrufen
2. Spieltage / Rounds finden
3. Aktuelle Kader pro Team abrufen
4. Verletzungen/Sperren prüfen
5. Type-ID-Liste offiziell gegenprüfen
```

Danach:

```text
erste Punkte-Engine bauen
```

---

# Status

Version: 0.1

Diese Datei dokumentiert die bisher bestandenen Sportmonks-API-Tests und dient als Projektgedächtnis.
