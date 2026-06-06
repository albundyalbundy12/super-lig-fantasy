# PRODUCT_MASTERPLAN.md

## Projekt

Süper-Lig-Fantasy-Manager-Spiel

## Kurzbeschreibung

Wir bauen ein automatisiertes Fantasy-Football-Manager-Spiel für die türkische Süper Lig.

Das Produkt orientiert sich vom Grundgefühl an Spielen wie Comunio:

* private Ligen
* automatische Startkader
* Spieler kaufen und verkaufen
* Marktwerte
* Aufstellung setzen
* echte Süper-Lig-Leistungen zählen
* automatische Punkteauswertung
* Ligatabelle unter Freunden oder öffentlichen Gruppen

Währung im Spiel:

```text
TL
```

Beispiele:

```text
3,8 Mio. TL
800.000 TL
```

---

# 1. Produktziel

Ziel ist ein spielbares, automatisiertes Süper-Lig-Fantasy-Manager-Produkt.

Wichtig:

```text
Keine manuelle Punktepflege.
Keine halbautomatische Lösung.
Daten müssen über API kommen.
```

Der User soll nicht merken, dass im Hintergrund komplizierte Datenlogik arbeitet.

Für ihn soll es einfach sein:

```text
Liga erstellen
Freunde einladen
Kader bekommen
Spieler kaufen
Aufstellung setzen
Punkte bekommen
Tabelle anschauen
```

---

# 2. Kernversprechen

```text
Baue dein Süper-Lig-Team, kaufe Spieler clever, stelle jede Woche richtig auf und gewinne deine Liga mit echten Leistungsdaten.
```

Kurz:

```text
Süper Lig wie ein Manager spielen.
```

---

# 3. Zielgruppe

## Primäre Zielgruppe

Türkische Fußballfans, die:

* Süper Lig verfolgen
* Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor usw. kennen
* gerne mit Freunden konkurrieren
* Transfermarkt- und Kaderthemen mögen
* Fantasy-/Manager-Spiele verstehen oder schnell lernen

## Sekundäre Zielgruppe

* türkische Diaspora in Deutschland, Österreich, Niederlande, Schweiz
* Fußballgruppen auf WhatsApp, Telegram, Discord
* YouTube-/TikTok-Fußball-Communities
* Sportwetten-affine Nutzer, aber ohne Wettfunktion im Produkt

---

# 4. Positionierung

Das Produkt ist kein Wettanbieter.

Das Produkt ist:

```text
Fantasy Manager Game
```

Nicht:

```text
Betting App
Casino
Tippspiel
Nur Statistikseite
```

Wichtiger Unterschied:

| Bereich                  | Unser Produkt |
| ------------------------ | ------------- |
| Geldwetten               | nein          |
| Private Ligen            | ja            |
| Spieler kaufen/verkaufen | ja            |
| Reale Leistungsdaten     | ja            |
| Punkte pro Spieltag      | ja            |
| Manager-Strategie        | ja            |
| TL-Spielwährung          | ja            |

---

# 5. Hauptanbieter für Daten

Aktueller Hauptkandidat:

```text
Sportmonks Football API
```

Bisher technisch bestätigt:

```text
Süper Lig vorhanden
League ID 600 vorhanden
Teams vorhanden
Spieler vorhanden
Fixtures vorhanden
Participants vorhanden
Events vorhanden
Lineups vorhanden
Lineup Details vorhanden
Spieler-Rating wahrscheinlich vorhanden
Spielminuten wahrscheinlich vorhanden
```

Dokumentation im Repo:

```text
docs/API_TEST_RESULTS.md
docs/TYPE_ID_MAPPING.md
```

---

# 6. Wichtige bekannte IDs

```text
League: Super Lig
Country: Türkiye
League ID: 600
Current Season ID: 25682
```

Getestetes Fixture:

```text
Fixture ID: 18903623
Galatasaray vs Beşiktaş
Season ID: 22057
```

---

# 7. MVP-Ziel

Der MVP muss nicht alles können.

Der MVP muss beweisen:

```text
Ein User kann eine Liga erstellen.
Jeder Manager bekommt einen fairen Startkader.
User können Spieler kaufen/verkaufen.
User können eine Aufstellung setzen.
Das System holt echte Süper-Lig-Daten.
Das System berechnet Punkte automatisch.
Die Ligatabelle aktualisiert sich automatisch.
```

Wenn diese Kette funktioniert, ist das Produkt echt.

---

# 8. MVP-Funktionen

## 8.1 Registrierung / Login

Minimal:

* User kann Account erstellen
* User kann sich einloggen
* User sieht sein Dashboard

Später:

* Google Login
* Apple Login
* E-Mail Magic Link

---

## 8.2 Liga erstellen

Ein User kann eine private Liga erstellen.

Daten:

```text
Liga-Name
Einladungscode
Maximale Teilnehmerzahl
Startmodus
Budget
```

Beispiel:

```text
Liga: Bizim Süper Lig
Code: ABC123
Teilnehmer: 8
Startmodus: Dengeli Başlangıç
Budget: 100 Mio. TL
```

---

## 8.3 Liga beitreten

Ein User kann mit Einladungscode einer Liga beitreten.

Regel:

```text
Ein User kann in mehreren Ligen sein.
Jede Liga hat eigene Kader, Budgets und Tabelle.
```

---

## 8.4 Dengeli Başlangıç

Sehr wichtig.

Problem bei alten Fantasy-Spielen:

```text
Zufallsstartkader kann unfair sein.
Ein User bekommt Stars, anderer bekommt Müll.
```

Unsere Lösung:

```text
Dengeli Başlangıç
```

Bedeutung:

Jeder Manager bekommt automatisch einen Startkader mit ungefähr gleichem Gesamtwert.

Regeln:

```text
ähnlicher Gesamtmarktwert
ähnliche Positionsverteilung
maximal 1–2 Topspieler pro Team
keine extrem unfairen Kader
Startbudget bleibt vergleichbar
```

Beispiel:

| Manager   |  Kaderwert | Restbudget |
| --------- | ---------: | ---------: |
| Manager A | 82 Mio. TL | 18 Mio. TL |
| Manager B | 80 Mio. TL | 20 Mio. TL |
| Manager C | 83 Mio. TL | 17 Mio. TL |

Ziel:

```text
Fairer Start, trotzdem unterschiedliche Teams.
```

---

## 8.5 Kader

Jeder Manager hat einen Kader.

Kader enthält:

```text
Spieler-ID
Name
Team
Position
Marktwert
Status
gekauft am
Kaufpreis
```

Positionsgruppen:

```text
Torwart
Abwehr
Mittelfeld
Sturm
```

---

## 8.6 Aufstellung

User kann vor dem Spieltags-Lock seine Startelf setzen.

Mögliche erste Formation:

```text
1 Torwart
4 Abwehr
4 Mittelfeld
2 Sturm
```

Später weitere Formationen:

```text
3-5-2
4-4-2
4-3-3
3-4-3
5-3-2
```

MVP kann erstmal nur eine feste Formation nutzen.

---

## 8.7 Spieltags-Lock

Der Spieltag wird gesperrt ab:

```text
Anpfiff des ersten echten Süper-Lig-Spiels des Spieltags
```

Nach dem Lock nicht mehr erlaubt:

```text
Aufstellung ändern
Formation ändern
Spieler aus aktueller Startelf verkaufen
neu gekaufte Spieler für laufenden Spieltag einsetzen
```

---

## 8.8 Transfermarkt

Der Transfermarkt ist das Herz des Spiels.

MVP-Regeln:

```text
System bietet täglich Spieler an
User können bieten
höchstes Gebot gewinnt
Spieler wechseln nach Fristablauf
Budget wird geprüft
```

Einfache erste Version:

```text
Transfermarkt zeigt freie Spieler
User kauft direkt zum Marktwert
```

Bessere Version danach:

```text
Gebotsphase
Deadline
höchstes gültiges Gebot gewinnt
```

---

## 8.9 Marktwerte

Marktwerte werden intern berechnet.

Wichtig:

```text
Sportmonks liefert Performance-Daten.
Wir berechnen daraus eigene Spiel-Marktwerte.
```

Währung:

```text
TL
```

Beispiele:

```text
Mauro Icardi: 18 Mio. TL
Junger Ersatzspieler: 800.000 TL
Solider Stammspieler: 4,5 Mio. TL
```

Erste Marktwertlogik:

```text
Startwert manuell/systemisch setzen
Performance beeinflusst Wert
Spielzeit beeinflusst Wert
Rating beeinflusst Wert
Tore/Assists beeinflussen Wert
Formkurve beeinflusst Wert
Nachfrage auf Transfermarkt beeinflusst Wert
```

Marktwert und Punkte bleiben getrennt.

---

## 8.10 Punkte-Engine

Punkte werden automatisch berechnet.

Grundlage:

```text
docs/SCORING_RULES.md
docs/TYPE_ID_MAPPING.md
```

Erste Punktequellen:

```text
Tore
Assists
Gelbe Karten
Rote Karten
Spielminuten
Rating
Clean Sheet
leere Position
```

---

## 8.11 Ligatabelle

Jede Liga hat eine Tabelle.

Anzeigen:

```text
Manager
Spieltagspunkte
Gesamtpunkte
Kaderwert
Budget
Platzierung
```

---

## 8.12 Dashboard

Dashboard zeigt:

```text
nächster Spieltag
Aufstellungstatus
freie Positionen
Topspieler
Transfermarkt
letzte Punkte
Tabellenplatz
```

---

# 9. Nicht-MVP

Diese Dinge kommen später, nicht sofort:

```text
Mobile App
Push Notifications
Chat
komplexe Auktionen
KI-Managerberater
öffentliche Ligen
Premium-Abos
Payment
Achievements
Badges
Live Match Center
vollständige Admin-Konsole
```

Erst Kern bauen, dann erweitern.

---

# 10. Technische Kernmodule

## 10.1 User Module

Zuständig für:

```text
Registrierung
Login
Profil
User-Ligen
```

---

## 10.2 League Module

Zuständig für:

```text
Liga erstellen
Liga beitreten
Einladungscode
Ligakonfiguration
Teilnehmer
```

---

## 10.3 Squad Module

Zuständig für:

```text
Manager-Kader
Spielerbesitz
Kaufpreis
Verkaufspreis
Budget
```

---

## 10.4 Lineup Module

Zuständig für:

```text
Aufstellung setzen
Formation prüfen
Lock prüfen
leere Position erkennen
```

---

## 10.5 Transfer Module

Zuständig für:

```text
freie Spieler
Kaufen
Verkaufen
Gebote
Transferhistorie
```

---

## 10.6 Sportmonks Integration

Zuständig für:

```text
Fixtures abrufen
Teams abrufen
Spieler abrufen
Lineups abrufen
Events abrufen
lineups.details abrufen
Ratings und Minuten auslesen
```

---

## 10.7 Scoring Engine

Zuständig für:

```text
Sportmonks-Daten lesen
User-Lineups prüfen
Punkte pro Spieler berechnen
Punkte pro Manager berechnen
Spieltag abschließen
Ligatabelle aktualisieren
```

---

## 10.8 Market Value Engine

Zuständig für:

```text
Spielerwerte aktualisieren
Performance bewerten
Nachfrage bewerten
Formkurve berechnen
Wertänderung begrenzen
```

---

## 10.9 Admin Module

Zuständig für:

```text
Datenstatus prüfen
API-Fehler sehen
Spieltag manuell neu berechnen
Spieler prüfen
Liga prüfen
```

Admin soll nicht dauerhaft Punkte manuell eintragen müssen.

Admin ist nur Kontrolle und Notfall.

---

# 11. Datenmodell grob

## User

```text
id
email
name
created_at
```

## FantasyLeague

```text
id
name
invite_code
owner_user_id
budget_start
start_mode
created_at
```

## FantasyTeam / ManagerTeam

```text
id
league_id
user_id
name
budget
points_total
created_at
```

## Player

```text
id
sportmonks_player_id
name
team_id
position_id
image_path
current_market_value
status
```

## RealTeam

```text
id
sportmonks_team_id
name
short_code
logo_url
```

## ManagerSquadPlayer

```text
id
manager_team_id
player_id
purchase_price
current_value_at_purchase
created_at
```

## ManagerLineup

```text
id
manager_team_id
round_id
formation
locked_at
```

## ManagerLineupSlot

```text
id
lineup_id
slot_position
player_id
is_empty
```

## Fixture

```text
id
sportmonks_fixture_id
league_id
season_id
round_id
home_team_id
away_team_id
starting_at
state_id
result_info
```

## PlayerMatchScore

```text
id
fixture_id
player_id
minutes
rating
goals
assists
yellow_cards
red_cards
clean_sheet
points
```

## ManagerRoundScore

```text
id
manager_team_id
round_id
points
calculated_at
```

---

# 12. Bau-Reihenfolge

## Phase 1: Projektfundament

Ziel:

```text
GitHub-Struktur
Dokumentation
Datenanbieter validieren
Produktlogik festlegen
```

Status:

```text
Repo erstellt
TYPE_ID_MAPPING.md erstellt
SCORING_RULES.md erstellt
API_TEST_RESULTS.md erstellt
```

Nächste Datei:

```text
PRODUCT_MASTERPLAN.md
```

---

## Phase 2: Datenimport-Prototyp

Ziel:

```text
Sportmonks-Daten in eigener Datenbank speichern
```

Tasks:

```text
Sportmonks API Token als Secret speichern
Teams importieren
Players importieren
Fixtures importieren
Lineups importieren
Events importieren
lineups.details importieren
```

Ergebnis:

```text
Wir haben echte Süper-Lig-Daten lokal in unserer App-Datenbank.
```

---

## Phase 3: Punkte-Engine-Prototyp

Ziel:

```text
Ein reales Fixture automatisch auswerten.
```

Testfixture:

```text
Galatasaray vs Beşiktaş
Fixture ID: 18903623
```

Tasks:

```text
Lineups lesen
Events lesen
lineups.details lesen
Spielerpunkte berechnen
Manager-Lineup simulieren
Gesamtpunkte berechnen
```

Ergebnis:

```text
Ein Testmanager bekommt automatisch Punkte aus echten Daten.
```

---

## Phase 4: MVP App

Ziel:

```text
User kann Liga erstellen und spielen.
```

Tasks:

```text
Login
Liga erstellen
Liga beitreten
Dengeli Başlangıç
Kaderseite
Aufstellung
Transfermarkt
Punkteübersicht
Ligatabelle
```

---

## Phase 5: Spieltagsautomatisierung

Ziel:

```text
Spieltag läuft automatisch.
```

Tasks:

```text
Round erkennen
Fixture-Liste pro Round
Lock-Zeit berechnen
nach Spielende Daten abrufen
Punkte berechnen
Tabelle aktualisieren
Fehlerstatus anzeigen
```

---

## Phase 6: Marktwert-Engine

Ziel:

```text
Spielerwerte leben dynamisch.
```

Tasks:

```text
Startwerte setzen
Performance-Faktor
Spielzeit-Faktor
Form-Faktor
Transfernachfrage-Faktor
Wertänderung pro Tag begrenzen
```

---

## Phase 7: Launch-Vorbereitung

Ziel:

```text
Produkt öffentlich testbar machen.
```

Tasks:

```text
Design verbessern
Mobile Ansicht
Onboarding
Fehlerfälle
Datenschutz
AGB
Lizenzklärung Sportmonks
Kostenmodell
Monitoring
```

---

# 13. Risiken

## 13.1 Datenlizenz

Technisch funktioniert Sportmonks.

Noch offen:

```text
kommerzielles Fantasy-Nutzungsrecht schriftlich klären
```

Regel:

```text
Vor öffentlichem Launch oder Payment muss Lizenzfrage geklärt sein.
```

---

## 13.2 API-Kosten

Sportmonks kostet je nach Plan Geld.

Risiko:

```text
Viele User = viele API-Aufrufe
```

Lösung:

```text
Daten cachen
Fixtures nicht unnötig oft abrufen
Scores zeitgesteuert berechnen
keine API-Aufrufe pro User
zentrale Daten-Synchronisierung
```

---

## 13.3 Marktwertlogik

Marktwerte sind nicht direkt echte Transfermarkt-Werte.

Wir bauen eigene Spielwerte.

Regel:

```text
Marktwert im Spiel ist ein Fantasy-Marktwert, kein realer Transfermarktwert.
```

---

## 13.4 Fairness Startkader

Dengeli Başlangıç ist kritisch.

Wenn Startkader unfair sind, verlieren User schnell Interesse.

Regel:

```text
Startkader müssen wertmäßig und positionsmäßig balanciert sein.
```

---

## 13.5 Punkte-System

Punkte dürfen nicht zu chaotisch sein.

Regel:

```text
Ein User muss verstehen können, warum ein Spieler Punkte bekommen hat.
```

Deshalb:

```text
Punkteaufschlüsselung pro Spieler anzeigen.
```

---

# 14. Design-Prinzipien

Das Produkt soll nicht wie ein langweiliges Adminpanel aussehen.

Es soll wirken wie:

```text
Fußballmanager
Transfermarkt
Ligaspiel
Sport-App
```

Nicht wie:

```text
Buchhaltung
CRM
Excel-Tabelle
```

Wichtig:

```text
klare Kaderkarten
Spielerwerte sichtbar
Transfermarkt lebendig
Punkte transparent
mobile-first
```

---

# 15. Erstes MVP-Menü

Mögliche Navigation:

```text
Dashboard
Meine Liga
Kader
Aufstellung
Transfermarkt
Punkte
Tabelle
Spieler
Admin
```

Für den User:

```text
Dashboard
Kader
Aufstellung
Transfermarkt
Tabelle
```

Für Admin:

```text
Datenstatus
API Sync
Punkte neu berechnen
```

---

# 16. Erste klare Produktregeln

```text
1. TL ist die sichtbare Spielwährung.
2. Dengeli Başlangıç ist Pflicht.
3. Punkte werden automatisch berechnet.
4. Admin soll nicht manuell Punkte eintragen.
5. Sportmonks ist Hauptanbieter, solange Lizenz und Kosten passen.
6. User-Bankspieler bekommen keine Punkte.
7. Leere Position kostet -4 Punkte.
8. Marktwert und Punkte sind getrennte Systeme.
9. Spieltags-Lock schützt Fairness.
10. Erst MVP, dann Premium und öffentliche Skalierung.
```

---

# 17. Aktueller Stand

Erledigt:

```text
GitHub Repo erstellt
Sportmonks Trial aktiviert
API Token erstellt
Süper Lig ID gefunden
Teams getestet
Fixtures getestet
Participants getestet
Events getestet
Lineups getestet
lineups.details getestet
TYPE_ID_MAPPING.md erstellt
SCORING_RULES.md erstellt
API_TEST_RESULTS.md erstellt
```

Offen:

```text
PRODUCT_MASTERPLAN.md erstellen
aktuelle Saison 25682 direkt abrufen
Rounds / Spieltage abrufen
aktuelle Kader abrufen
Verletzungen / Sperren testen
erste Datenbankstruktur planen
erste Punkte-Engine bauen
Lizenzfrage Sportmonks klären
```

---

# 18. Nächster konkreter Schritt

Nach dieser Datei:

```text
docs/DATABASE_SCHEMA.md
```

Danach:

```text
docs/API_SYNC_PLAN.md
```

Danach:

```text
docs/MVP_BUILD_PLAN.md
```

Diese drei Dateien machen das Projekt umsetzbar für Replit, Claude, Hermes oder jeden Coding-Agenten.

---

# Status

Version: 0.1

Diese Datei ist der Masterplan für das Produkt.
