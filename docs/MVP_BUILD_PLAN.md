# MVP_BUILD_PLAN.md

## Projekt

Süper-Lig-Fantasy-Manager-Spiel

## Zweck

Diese Datei beschreibt die konkrete Bau-Reihenfolge für den ersten MVP.

Ziel:

```text
nicht diskutieren
nicht springen
nicht verzetteln
in klaren Blöcken bauen
```

Der MVP soll zuerst beweisen:

```text
Echte Sportmonks-Daten rein
Punkte automatisch berechnen
User kann Liga/Kader/Aufstellung nutzen
Tabelle wird automatisch aktualisiert
```

---

# 1. Grundregel für den Bau

Wir bauen nicht sofort das perfekte Produkt.

Wir bauen zuerst die funktionierende Kernkette:

```text
Sportmonks API
→ eigene Datenbank
→ Fixture-Daten speichern
→ Spielerpunkte berechnen
→ Manager-Lineup bewerten
→ Ligapunkte anzeigen
```

Erst wenn diese Kette funktioniert, bauen wir mehr UI, Premium, Mobile, Live-Punkte oder Marketing.

---

# 2. MVP-Kernkette

Der erste MVP ist fertig, wenn ein User:

```text
1. sich einloggen kann
2. eine Fantasy-Liga erstellen kann
3. einen fairen Startkader bekommt
4. eine Aufstellung setzen kann
5. echte Süper-Lig-Daten verarbeitet werden
6. automatische Punkte bekommt
7. die Ligatabelle sieht
```

---

# 3. Nicht verhandelbare Produktregeln

```text
1. Keine manuelle Punktepflege.
2. Sportmonks-Daten werden zentral synchronisiert.
3. API-Token kommt niemals ins Frontend.
4. API-Token kommt niemals ins GitHub-Repo.
5. Punkte werden aus lokaler Datenbank berechnet.
6. TL ist sichtbare Spielwährung.
7. Dengeli Başlangıç ist Pflicht.
8. Leere Position = -4 Punkte.
9. User-Bankspieler bekommen 0 Punkte.
10. Marktwert und Punkte sind getrennte Systeme.
```

---

# 4. Phase 0: Projektbasis

## Ziel

Repo und Dokumentation sauber machen.

## Status

Erledigt:

```text
GitHub Repo erstellt
docs/TYPE_ID_MAPPING.md erstellt
docs/SCORING_RULES.md erstellt
docs/API_TEST_RESULTS.md erstellt
docs/PRODUCT_MASTERPLAN.md erstellt
docs/DATABASE_SCHEMA.md erstellt
docs/API_SYNC_PLAN.md erstellt
```

## Noch offen

```text
docs/MVP_BUILD_PLAN.md erstellen
README.md später verbessern
```

## Ergebnis

Das Projekt hat ein klares Gedächtnis und kann von einem Coding-Agenten verstanden werden.

---

# 5. Phase 1: Technisches Setup

## Ziel

Eine lauffähige Web-App-Grundlage erstellen.

## Empfohlener Stack

```text
Next.js
TypeScript
PostgreSQL
Prisma oder Drizzle
Server-side Sportmonks API Service
```

## Alternative

```text
React + Vite Frontend
Express Backend
PostgreSQL
Drizzle ORM
```

## Empfehlung für MVP

```text
Next.js Fullstack + PostgreSQL + Prisma
```

Warum?

```text
weniger Projektteile
schneller MVP
Backend und Frontend in einem Repo
API-Routen für Sportmonks-Sync möglich
Deployment einfacher
```

## Tasks

```text
Next.js App erstellen
TypeScript aktivieren
Database ORM installieren
PostgreSQL anbinden
.env.local anlegen
SPORTMONKS_API_TOKEN als Secret verwenden
Basislayout erstellen
```

## Definition of Done

```text
App startet lokal oder in Replit
Startseite lädt
Datenbankverbindung funktioniert
Environment Secret wird serverseitig gelesen
```

---

# 6. Phase 2: Datenbankstruktur

## Ziel

Datenbanktabellen für MVP erstellen.

## Grundlage

```text
docs/DATABASE_SCHEMA.md
```

## MVP-Tabellen zuerst

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
seasons
rounds
fixtures
fixture_participants
fixture_events
fixture_lineups
fixture_lineup_details
player_match_scores
manager_round_scores
api_sync_logs
scoring_runs
```

## Später

```text
transfer_bids
player_market_values
admin_audit_logs
payments
notifications
```

## Tasks

```text
ORM Schema erstellen
Migration erzeugen
Migration ausführen
Seed/Testdaten vorbereiten
```

## Definition of Done

```text
Datenbanktabellen existieren
Migration läuft fehlerfrei
Basisdaten können gespeichert und gelesen werden
```

---

# 7. Phase 3: Sportmonks API Service

## Ziel

Sportmonks API über eigenes Backend abrufen.

## Grundregel

Frontend ruft niemals direkt Sportmonks auf.

Richtig:

```text
Frontend
→ eigenes Backend
→ eigene Datenbank
→ Sportmonks nur serverseitig
```

## Erste API-Funktionen

```text
getFixtureById(fixtureId)
getFixtureParticipants(fixtureId)
getFixtureEvents(fixtureId)
getFixtureLineups(fixtureId)
getFixtureLineupDetails(fixtureId)
```

## Testfixture

```text
Fixture ID: 18903623
Galatasaray vs Beşiktaş
League ID: 600
Season ID: 22057
```

## Tasks

```text
Sportmonks Client bauen
Token aus Environment lesen
Fixture Detail abrufen
participants abrufen
events abrufen
lineups abrufen
lineups.details abrufen
Fehlerhandling einbauen
Rate-Limit-Daten loggen
```

## Definition of Done

```text
Backend kann Fixture 18903623 abrufen
participants werden zurückgegeben
events werden zurückgegeben
lineups werden zurückgegeben
lineups.details werden zurückgegeben
kein Token im Frontend sichtbar
kein Token im GitHub Repo
```

---

# 8. Phase 4: API-Sync in Datenbank

## Ziel

Sportmonks-Daten lokal speichern.

## Grundlage

```text
docs/API_SYNC_PLAN.md
```

## MVP-Sync-Reihenfolge

```text
1. fixture detail abrufen
2. participants speichern
3. events speichern
4. lineups speichern
5. lineups.details speichern
6. sync log schreiben
```

## Tasks

```text
syncFixture(fixtureId) bauen
upsert fixture
upsert participants
upsert events
upsert lineups
upsert lineup_details
api_sync_logs schreiben
```

## Definition of Done

```text
Fixture 18903623 ist in eigener DB gespeichert
Events sind gespeichert
Lineups sind gespeichert
Lineup Details sind gespeichert
Sync kann mehrfach laufen ohne Duplikate
```

---

# 9. Phase 5: Player Match Score Engine

## Ziel

Aus Rohdaten automatische Spielerpunkte berechnen.

## Grundlage

```text
docs/TYPE_ID_MAPPING.md
docs/SCORING_RULES.md
```

## Eingaben

```text
fixture_events
fixture_lineups
fixture_lineup_details
players
```

## Ausgabe

```text
player_match_scores
```

## Erste Scoring-Regeln

```text
Tor nach Position
Assist
Gelbe Karte
Rote Karte
Spielminutenbonus
Ratingpunkte
Clean Sheet
Eigentor später
verschossener Elfmeter später
```

## Wichtig

Die Punkteberechnung muss nachvollziehbar sein.

Speichern:

```text
points_rating
points_minutes
points_goals
points_assists
points_cards
points_clean_sheet
points_total
```

## Tasks

```text
Rating aus type_id 118 lesen
Minuten aus type_id 119 lesen
Tore aus events.type_id 14 lesen
Elfmeter-Tore aus events.type_id 16 lesen
Assists aus related_player_id lesen
Gelbe Karten aus type_id 19 lesen
Rote Karten aus type_id 20 lesen
Punkte pro Spieler berechnen
player_match_scores speichern
```

## Definition of Done

```text
Mauro Icardi bekommt automatisch Punkte
Spieler mit Gelber Karte bekommen Abzug
Spieler mit Roter Karte bekommen Abzug
Spieler mit 60+ Minuten bekommen Minutenbonus
Ratingpunkte werden berechnet
```

---

# 10. Phase 6: Simulierter Manager-Test

## Ziel

Beweisen, dass ein Manager aus echten Daten Punkte bekommt.

## Vorgehen

Noch ohne User-UI.

Wir erstellen Testdaten:

```text
Test-User
Test-Liga
Test-Manager-Team
Test-Kader
Test-Aufstellung
```

Dann verwenden wir echte Spieler aus:

```text
Galatasaray vs Beşiktaş
Fixture ID: 18903623
```

## Tasks

```text
Testmanager erstellen
Kader mit 11 Spielern erstellen
Manager-Lineup erstellen
leere Positionen optional testen
player_match_scores zu Manager-Lineup zuordnen
manager_round_score berechnen
```

## Definition of Done

```text
Ein Testmanager bekommt automatisch Gesamtpunkte
Leere Position erzeugt -4
Nicht gespielter Spieler bekommt 0
Bankspieler im User-Kader bekommt 0
Punkteaufschlüsselung ist sichtbar
```

---

# 11. Phase 7: Auth und User-Grundlage

## Ziel

User können Accounts nutzen.

## MVP-Minimum

```text
E-Mail Login oder Magic Link
User-Profil
Session
geschützte Seiten
```

## Tasks

```text
Auth einbauen
User-Tabelle anbinden
Dashboard schützen
Logout
```

## Definition of Done

```text
User kann sich einloggen
User sieht eigenes Dashboard
fremde Daten werden nicht angezeigt
```

---

# 12. Phase 8: Liga erstellen und beitreten

## Ziel

User können private Ligen starten.

## Funktionen

```text
Liga erstellen
Einladungscode erzeugen
Liga beitreten
Manager-Team anlegen
Budget setzen
```

## MVP-Felder

```text
Liga-Name
Startbudget
Maximale Teilnehmer
Startmodus
```

## Default-Werte

```text
Startbudget: 100 Mio. TL
Startmodus: Dengeli Başlangıç
Formation: 4-4-2
```

## Definition of Done

```text
User erstellt Liga
User sieht Einladungscode
anderer User kann beitreten
beide haben Manager-Teams
```

---

# 13. Phase 9: Dengeli Başlangıç

## Ziel

Jeder Manager bekommt fairen Startkader.

## Problem

Zufall ist unfair.

## Lösung

Automatische Kaderverteilung mit Balancing.

## Erste Regeln

```text
ähnlicher Gesamtkaderwert
Pflichtpositionen abdecken
keine extreme Star-Häufung
Restbudget vergleichbar halten
```

## MVP-Kadergröße

```text
2 Torhüter
5 Abwehrspieler
5 Mittelfeldspieler
3 Stürmer
```

Gesamt:

```text
15 Spieler
```

## Aufstellung

```text
1 Torwart
4 Abwehr
4 Mittelfeld
2 Sturm
```

## Tasks

```text
Spieler nach Position gruppieren
Spielerwerte initial setzen
Manager reihum Spieler zuteilen
Kaderwert ausgleichen
Restbudget setzen
```

## Definition of Done

```text
jeder Manager hat 15 Spieler
jede Position ist ausreichend besetzt
Kaderwerte liegen nah beieinander
kein Manager startet extrem unfair
```

---

# 14. Phase 10: Kaderseite

## Ziel

User sieht seinen Kader.

## Anzeigen

```text
Spielername
Team
Position
Marktwert
Kaufpreis
Status
letzte Punkte
```

## Aktionen

```text
Spieler auswählen
Spieler verkaufen
Spieler in Aufstellung setzen
```

## Definition of Done

```text
User sieht eigenen Kader
Kaderwert wird berechnet
Budget wird angezeigt
```

---

# 15. Phase 11: Aufstellung

## Ziel

User kann seine Startelf setzen.

## MVP-Formation

```text
4-4-2
```

Slots:

```text
1 GK
4 DEF
4 MID
2 FWD
```

## Regeln

```text
nur eigene Spieler auswählbar
Position muss passen
leere Position erlaubt, aber -4 Punkte
nach Lock nicht mehr änderbar
```

## Definition of Done

```text
User kann 11 Slots befüllen
Positionen werden geprüft
Lineup kann gespeichert werden
Lock verhindert Änderungen
```

---

# 16. Phase 12: Transfermarkt MVP

## Ziel

User kann Spieler kaufen und verkaufen.

## Erste einfache Version

```text
freie Spieler anzeigen
direkter Kauf zum Marktwert
direkter Verkauf an System mit Abschlag
```

## Spätere Version

```text
Gebote
Auktionen
Deadline
höchstes Gebot gewinnt
```

## MVP-Regeln

```text
User kann nur kaufen, wenn Budget reicht
Spieler kann in einer Liga nur einem Manager gehören
verkaufte Spieler werden frei
gekaufte Spieler kommen in Kader
```

## Definition of Done

```text
User kauft Spieler
Budget sinkt
Spieler erscheint im Kader
User verkauft Spieler
Budget steigt
Spieler verschwindet aus Kader
```

---

# 17. Phase 13: Punkteübersicht

## Ziel

User sieht, warum er Punkte bekommen hat.

## Anzeigen

```text
Spieltag
Managerpunkte
Spielerpunkte
Punkteaufschlüsselung
leere Positionen
```

## Beispiel

```text
Mauro Icardi: 9 Punkte
Tor +3
Elfmeter-Tor +3
Rating +2
Minuten +1
```

## Definition of Done

```text
User sieht Gesamtpunkte
User sieht Spielerpunkte
User sieht Erklärung pro Spieler
```

---

# 18. Phase 14: Ligatabelle

## Ziel

Liga-Ranking anzeigen.

## Anzeigen

```text
Platz
Managername
Spieltagspunkte
Gesamtpunkte
Kaderwert
Budget
```

## Definition of Done

```text
Tabelle sortiert nach Gesamtpunkten
Spieltagspunkte sichtbar
Kaderwert sichtbar
```

---

# 19. Phase 15: Aktuelle Saison automatisieren

## Ziel

Nicht nur historisches Testfixture, sondern aktuelle Süper-Lig-Saison.

## Noch zu testen

```text
Season ID 25682 direkt abrufen
Rounds für Season 25682 abrufen
Fixtures pro Round abrufen
aktueller Spieltag erkennen
```

## Tasks

```text
sync current season
sync rounds
sync fixtures by season
calculate round lock time
run scoring after fixture end
```

## Definition of Done

```text
System erkennt aktuellen Spieltag
System erkennt Lock-Zeit
System kann aktuelle Fixtures speichern
System kann nach Spielende Punkte berechnen
```

---

# 20. Phase 16: Admin-Dashboard

## Ziel

Admin sieht Datenstatus und Fehler.

## Anzeigen

```text
letzter API Sync
aktive Fixtures
fehlende Lineups
fehlende Events
fehlende Ratings
Scoring-Status
Rate-Limit-Status
```

## Aktionen

```text
Fixture neu synchronisieren
Fixture neu berechnen
Round neu berechnen
```

## Wichtig

Admin soll nicht Punkte manuell pflegen.

Admin ist Kontrolle und Notfall.

---

# 21. MVP-Seiten

## User-Seiten

```text
/login
/dashboard
/leagues
/leagues/[id]
/squad
/lineup
/transfer-market
/points
/table
```

## Admin-Seiten

```text
/admin
/admin/sync
/admin/fixtures
/admin/scoring
```

---

# 22. MVP-Navigation

Für User:

```text
Dashboard
Kader
Aufstellung
Transfermarkt
Punkte
Tabelle
```

Für Admin:

```text
Datenstatus
API Sync
Scoring
```

---

# 23. Technische Priorität

## Zuerst Backend-Logik

```text
Sportmonks Sync
DB speichern
Scoring Engine
Manager Score berechnen
```

## Danach UI

```text
Dashboard
Kader
Aufstellung
Punkte
Tabelle
```

Warum?

```text
Ohne funktionierende Punkte-Engine ist die UI nur Dekoration.
```

---

# 24. Was wir bewusst nicht sofort bauen

```text
Live-Punkte
Mobile App
Payment
Premium
Push Notifications
Chat
komplexe Auktionen
öffentliche Ligen
KI-Berater
vollständige Designpolitur
```

Diese Dinge kommen erst, wenn der Kern funktioniert.

---

# 25. Erste Coding-Agent-Aufgabe

Wenn ein Coding-Agent startet, bekommt er zuerst diese Aufgabe:

```text
Create the initial Next.js + TypeScript project structure for the Süper Lig fantasy manager MVP.

Set up:
- Next.js App Router
- TypeScript
- PostgreSQL ORM placeholder
- server-only Sportmonks API client structure
- docs-aware README
- environment variable placeholder SPORTMONKS_API_TOKEN
- no real API token in code
- basic pages: dashboard, squad, lineup, transfer-market, points, table, admin/sync

Do not implement full UI yet.
Focus on clean structure and safe secret handling.
```

---

# 26. Zweite Coding-Agent-Aufgabe

Nach Setup:

```text
Implement Sportmonks fixture sync for test fixture 18903623.

Requirements:
- read SPORTMONKS_API_TOKEN from server-side environment
- fetch fixture detail
- fetch participants
- fetch events
- fetch lineups
- fetch lineups.details
- store raw data in database tables according to docs/DATABASE_SCHEMA.md
- write sync status to api_sync_logs
- do not expose token to frontend
- make sync idempotent
```

---

# 27. Dritte Coding-Agent-Aufgabe

Nach Sync:

```text
Implement the first scoring engine for fixture 18903623.

Use:
- docs/TYPE_ID_MAPPING.md
- docs/SCORING_RULES.md

Requirements:
- calculate player_match_scores
- use rating type_id 118
- use minutes type_id 119
- use goal events type_id 14
- use penalty goal type_id 16
- use yellow card type_id 19
- use red card type_id 20
- use related_player_id for assists
- save point breakdown
- create test manager lineup
- calculate manager_round_score
```

---

# 28. Definition of Done für MVP

MVP ist fertig, wenn:

```text
User kann Liga erstellen
User kann beitreten
Dengeli Başlangıç erzeugt faire Kader
User kann Aufstellung setzen
Sportmonks Sync läuft
Punkte werden automatisch berechnet
Ligatabelle aktualisiert sich
Admin kann Sync/Scoring prüfen
```

Noch nicht nötig:

```text
perfektes Design
Payment
Live-Punkte
Mobile App
öffentliche Skalierung
```

---

# 29. Aktueller nächster Schritt

Nach dieser Datei:

```text
1. README.md aktualisieren
2. GitHub Repo als Grundlage für Coding-Agent nutzen
3. ersten technischen Stack entscheiden
4. initiales Projektgerüst bauen
```

Empfohlene nächste Datei:

```text
docs/CODING_AGENT_TASKS.md
```

Diese Datei enthält dann copy-paste Aufgaben für Replit, Claude, Hermes oder andere Coding-Agenten.

---

# Status

Version: 0.1

Diese Datei ist der Bauplan für den MVP.
