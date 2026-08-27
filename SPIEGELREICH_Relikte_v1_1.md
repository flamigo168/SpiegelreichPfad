# SPIEGELREICH · Relikte v1.1

23 Relikte. Sechs aus Regelwerk v1.5, siebzehn neu.

**Regeln:** Relikte gehören der ganzen Gruppe und wirken für alle Spieler
gleichzeitig. Höchstens zwei je Run. Preis je Spieler 40 / 80.
Quellen: Verfallener Schrein · Mini-Boss · Shop (teure Stufe) ·
Ereigniskarte *Verlassene Schmiede*.

Farbgruppe `relikt` · `#2B2F38` · 宝 · RL · Mini-Euro 44 × 67 mm über `build_mini.py`.

---

## Mächtig

| Relikt | Wirkung |
|---|---|
| **Schleifstein** | Dein Ziehwert steigt um 1 |
| **Ki-Ader** | Du darfst pro Runde eine zweite Handkarte als Ki-Quelle auslegen |
| **Aschekrone** | Fällt ein Monster, zieht der Spieler, der den letzten Schaden zugefügt hat, 1 Karte |
| **Der zweite Atem** | Einmal je Kampf darf ein Spieler seine ganze Hand abwerfen und bis zum Handmaximum neu ziehen |
| **Ahnenharnisch** | Der erste Schaden, den ein Spieler je Kampf erleidet, wird auf 0 gesenkt |
| **Rostschicht** | Erhältst du R-Marker, erhalte 1 zusätzlichen |

## Nische

| Relikt | Wirkung |
|---|---|
| **Krämerbeutel** | Shoppreise gelten eine Deckstufe niedriger. Nicht auf Relikte |
| **Eisenwurzel** | Start-LP dauerhaft +3. Heilt sofort 3 LP |
| **Zweiter Blick** | Einmal je Belohnung darf jeder seine drei aufgedeckten Karten zurückmischen und neu aufdecken. Nur Belohnungen, nicht der Weg |
| **Salzschnur** | Gift auf Spielern tickt nur noch jede zweite Monsterphase |
| **Wetterstein** | Bei jeder Rast heilt ihr zusätzlich 2 LP |
| **Wendestein** | Einmal je Kampf dürft ihr einen aufgedeckten Encounter-Modifikator abwerfen und einen neuen ziehen |
| **Totenlicht** | Fällt ein Spieler auf 0 LP, bleibt er mit 1 LP stehen. Einmal je Run |
| **Prüfstein** | In Kämpfen der Stufe Schwer erhält jeder Spieler zu Kampfbeginn 2 R-Marker |
| **Zunderbüchse** | Brandmale, die ihr legt, halten eine Runde länger |

## Combo

| Relikt | Wirkung |
|---|---|
| **Gebetsstein** | Deine R-Marker verfallen nicht am Rundenende |
| **Spiegelscherbe** | Einmal je Runde: Hast du bereits zwei Karten gespielt, nimm eine Karte aus deinem Ablagestapel auf die Hand |
| **Wurzelgeflecht** | Deine Wesen kommen mit +0/+1 ins Spiel |
| **Schmiedemal** | Eine bereits aufgewertete Karte darf zusätzlich die jeweils andere Aufwertung erhalten. Höchstens eine Karte je Spieler |
| **Kettenglied** | Spielst du in einer Runde deine dritte Karte, erhältst du 2 R-Marker |
| **Opferschale** | Einmal je Runde: Wirf eine Handkarte ab, erhalte 1 Ki |
| **Vorzeichen** | Die erste Karte, die jeder Spieler im Kampf spielt, kostet 1 Ki weniger |
| **Erbstück** | Einmal je Kampf darf jeder Spieler eine getappte Ausrüstung enttappen |

---

## Offene Punkte

- **Ki-Ader** ist im Playtest als zu stark aufgefallen. Grund: Sie summiert sich
  auf. Eine zweite Quelle je Runde ist nach vier Runden keine +1, sondern eine
  andere Ki-Kurve, und sie enttappt weiter. Steht unverändert drin, bis eine
  Überarbeitung entschieden ist. Erster Hebel wäre, die zweite Quelle nicht
  automatisch enttappen zu lassen.
- **Rostschicht** wirkt auf jede R-Marker-Quelle. Bei vier Spielern mit
  Eisen-Deck ist das viel. Erster Hebel: „höchstens einmal je Runde".
- **Der zweite Atem** ist bei vier Spielern faktisch eine Extrarunde.
- **Ausweichen** steht im Regelwerk v1.5 noch als eigener Abschnitt 5.7 samt
  Reihenfolge in 5.8. Laut aktuellem Stand gibt es Ausweichen praktisch nicht
  mehr — Regelwerk und Kartentexte sind dazu noch nicht nachgezogen. Kein
  Relikt in dieser Liste nimmt darauf Bezug.
- `carddata.py` enthielt nur drei Relikte und war damit hinter Regelwerk v1.5
  zurück. Mit `relikte_carddata.py` ist der Stand wieder gleich.

---

## Bewusst nicht gebaut

- Kein Relikt, das die Kosten des Mini-Bosses aufhebt. Das belohnt keine
  Entscheidung, es entfernt eine.
- Kein Relikt, das den Wegstapel oder das Plättchenziehen verändert. Der Stapel
  ist die Uhr des Runs; daran zu drehen ändert die Runlänge statt das Spiel.
- Kein zweites Reroll-Relikt für Belohnungen. Das macht *Zweiter Blick* bereits.
