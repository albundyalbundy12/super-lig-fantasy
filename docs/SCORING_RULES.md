# SCORING_RULES.md

## Projekt

Süper-Lig-Fantasy-Manager-Spiel

## Zweck

Diese Datei definiert die erste Version des Punkte-Systems für unser Fantasy-Spiel.

Grundlage sind die getesteten Sportmonks-Daten:

* Fixtures
* Participants
* Events
* Lineups
* Lineups Details
* Spieler-Rating
* Spielminuten

Die technische Zuordnung der Sportmonks-IDs steht in:

```text
docs/TYPE_ID_MAPPING.md
```

---

# 1. Grundregel

Ein Manager bekommt nur Punkte für Spieler, die vor dem Spieltags-Lock in seiner Startelf stehen.

Bankspieler im User-Kader bekommen keine Punkte, auch wenn sie real gut spielen.

---

# 2. Spieltags-Lock

Der Spieltag wird gesperrt ab:

```text
Anpfiff des ersten echten Süper-Lig-Spiels des Spieltags
```

Nach dem Lock sind nicht mehr erlaubt:

* Aufstellung ändern
* Formation ändern
* Spieler für diesen Spieltag neu einsetzen
* Spieler aus der aktuellen Aufstellung verkaufen

---

# 3. User-Lineup-Regeln

| Situation                                                     |         Punkte |
| ------------------------------------------------------------- | -------------: |
| Spieler steht im User-Lineup und spielt real                  | normale Punkte |
| Spieler steht im User-Lineup, spielt real nicht               |              0 |
| Spieler sitzt beim User auf der Bank                          |              0 |
| Spieler macht viele Punkte, sitzt aber beim User auf der Bank |              0 |
| Position bleibt leer                                          |             -4 |

---

# 4. Leere Position

Wenn ein Manager eine Position leer lässt:

```text
-4 Punkte
```

Beispiele:

| Leere Positionen | Punkte |
| ---------------: | -----: |
|                1 |     -4 |
|                2 |     -8 |
|                3 |    -12 |

---

# 5. Positionen

Sportmonks Position IDs:

| position_id | Position   |
| ----------: | ---------- |
|          24 | Torwart    |
|          25 | Abwehr     |
|          26 | Mittelfeld |
|          27 | Sturm      |

---

# 6. Tore

Sportmonks:

```text
events.type_id = 14
```

Punkte nach Position:

| Position   | Punkte |
| ---------- | -----: |
| Torwart    |     +6 |
| Abwehr     |     +5 |
| Mittelfeld |     +4 |
| Sturm      |     +3 |

---

# 7. Elfmeter-Tor

Sportmonks:

```text
events.type_id = 16
```

Aktuelle Regel:

```text
Elfmeter-Tor = normales Tor
```

Später kann entschieden werden, ob Elfmeter-Tore niedriger bewertet werden.

---

# 8. Assists

Assists werden über Goal-Events erkannt:

```text
related_player_id
related_player_name
```

Wenn ein Goal-Event einen `related_player_id` hat:

```text
Assist = +2 Punkte
```

---

# 9. Karten

## Gelbe Karte

Sportmonks:

```text
events.type_id = 19
```

Punkte:

```text
-1
```

## Rote Karte

Sportmonks:

```text
events.type_id = 20
```

Punkte:

```text
-4
```

## Kartenkorrektur

Sportmonks kann Kartenkorrekturen liefern:

```text
events.type_id = 1697
```

Diese müssen später geprüft werden, damit keine falsche Doppelwertung entsteht.

---

# 10. Wechsel

Sportmonks:

```text
events.type_id = 18
```

Wechsel geben zunächst keine direkten Punkte.

Sie sind wichtig für:

* Einsatzprüfung
* Spielminuten
* Bankspieler wurde eingewechselt

---

# 11. Spielminuten

Sportmonks:

```text
lineups.details.type_id = 119
```

Erste Regel:

| Minuten | Punkte |
| ------: | -----: |
|       0 |      0 |
|    1–59 |      0 |
|     60+ |     +1 |

---

# 12. Rating

Sportmonks wahrscheinlich:

```text
lineups.details.type_id = 118
```

Erste Rating-Tabelle:

|    Rating | Punkte |
| --------: | -----: |
| unter 5.5 |     -2 |
|   5.5–5.9 |     -1 |
|   6.0–6.9 |      0 |
|   7.0–7.4 |     +1 |
|   7.5–7.9 |     +2 |
|   8.0–8.4 |     +3 |
|      8.5+ |     +4 |

---

# 13. Clean Sheet

Ein Spieler bekommt Clean-Sheet-Bonus, wenn:

```text
sein Team kein Gegentor kassiert
und der Spieler mindestens 60 Minuten gespielt hat
```

| Position   | Clean Sheet |
| ---------- | ----------: |
| Torwart    |          +3 |
| Abwehr     |          +2 |
| Mittelfeld |           0 |
| Sturm      |           0 |

---

# 14. Torwart-Sonderpunkte

Vorläufig:

| Aktion       | Punkte |
| ------------ | -----: |
| Clean Sheet  |     +3 |
| Gelbe Karte  |     -1 |
| Rote Karte   |     -4 |
| Rating-Bonus | normal |
| Minutenbonus | normal |

Noch offen:

* Paraden
* Elfmeter gehalten
* Gegentore

---

# 15. Eigentor

Noch nicht getestet.

Vorläufige Regel:

```text
Eigentor = -3 Punkte
```

---

# 16. Verschossener Elfmeter

Noch nicht getestet.

Vorläufige Regel:

```text
Verschossener Elfmeter = -3 Punkte
```

---

# 17. Beispielrechnung Mauro Icardi

Angenommen:

```text
Position: Sturm
Minuten: 90
Rating: 7.9
Tor: 1
Elfmeter-Tor: 1
Gelbe Karte: nein
```

Berechnung:

| Aktion       | Punkte |
| ------------ | -----: |
| Tor          |     +3 |
| Elfmeter-Tor |     +3 |
| Rating 7.9   |     +2 |
| 60+ Minuten  |     +1 |
| Gesamt       |      9 |

---

# 18. Beispiel leere Position

Manager stellt nur 10 Spieler auf:

```text
1 Position leer = -4 Punkte
```

---

# 19. Bankspieler beim User

Wenn ein Spieler beim User auf der Bank sitzt:

```text
0 Punkte
```

Auch wenn er real sehr gut spielt.

Der Marktwert darf trotzdem steigen.

---

# 20. Marktwert und Punkte getrennt halten

Punkte beeinflussen:

```text
Wochenwertung
Ligatabelle
Manager-Ergebnis
```

Marktwert beeinflusst:

```text
Transfermarkt
Spielerwert
Kauf-/Verkaufsstrategie
```

Ein Spieler kann beim User 0 Punkte bringen, aber im Marktwert steigen.

---

# 21. Pseudocode

```text
for each manager_lineup_slot:
    if slot_empty:
        points = -4

    else if player_not_played:
        points = 0

    else:
        points = 0
        points += rating_points
        points += minute_bonus
        points += goal_points_by_position
        points += assist_points
        points += card_points
        points += clean_sheet_points_if_eligible
```

---

# 22. Offene Prüfungen

Noch zu prüfen:

```text
offizielle Bedeutung type_id 118
offizielle Bedeutung type_id 119
Eigentor type_id
verschossener Elfmeter type_id
Elfmeter gehalten type_id
Torwart-Paraden type_id
Clean-Sheet-Erkennung aus Fixture Score
Player Stats vollständig mappen
Rating-Gewichtung feinjustieren
```

---

# Status

Version: 0.1

Diese Datei reicht für die erste technische Punkte-Engine.

Noch nicht final für Launch.
