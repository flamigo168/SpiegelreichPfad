# -*- coding: utf-8 -*-
"""SPIEGELREICH - Relikte, Stand v1.1 (23 Stueck)

Ersetzt den Block "# ---------------- RELIKTE ----------------"
in carddata.py vollstaendig.

Relikte gehoeren der ganzen Gruppe und wirken fuer alle Spieler
gleichzeitig. Hoechstens zwei je Run. Preis je Spieler: 40 / 80.
Quellen: Verfallener Schrein, Mini-Boss, Shop (teure Stufe),
Ereigniskarte "Verlassene Schmiede".
"""

# ---------------- RELIKTE ----------------

# --- Bestand aus Regelwerk v1.5 ---
add("relikt", "Gebetsstein", None, "Relikt",
    "Deine R-Marker verfallen nicht am Rundenende.", "", 1)
add("relikt", "Schleifstein", None, "Relikt",
    "Dein Ziehwert steigt um 1.", "", 1)
add("relikt", "Ki-Ader", None, "Relikt",
    "Du darfst pro Runde eine zweite Handkarte als Ki-Quelle auslegen.", "", 1)
add("relikt", "Krämerbeutel", None, "Relikt",
    "Shoppreise gelten eine Deckstufe niedriger. Nicht auf Relikte.", "", 1)
add("relikt", "Eisenwurzel", None, "Relikt",
    "Start-LP dauerhaft +3. Heilt sofort 3 LP.", "", 1)
add("relikt", "Zweiter Blick", None, "Relikt",
    "Einmal je Belohnung darf jeder seine drei aufgedeckten Karten "
    "zurückmischen und neu aufdecken. Nur Belohnungen, nicht der Weg.", "", 1)

# --- Neu, mächtig ---
add("relikt", "Aschekrone", None, "Relikt",
    "Fällt ein Monster, zieht der Spieler, der den letzten Schaden "
    "zugefügt hat, 1 Karte.", "", 1)
add("relikt", "Der zweite Atem", None, "Relikt",
    "Einmal je Kampf darf ein Spieler seine ganze Hand abwerfen und "
    "bis zum Handmaximum neu ziehen.", "", 1)
add("relikt", "Ahnenharnisch", None, "Relikt",
    "Der erste Schaden, den ein Spieler je Kampf erleidet, wird auf 0 gesenkt.", "", 1)
add("relikt", "Rostschicht", None, "Relikt",
    "Erhältst du R-Marker, erhalte 1 zusätzlichen.", "", 1)

# --- Neu, Nische ---
add("relikt", "Salzschnur", None, "Relikt",
    "Gift auf Spielern tickt nur noch jede zweite Monsterphase.", "", 1)
add("relikt", "Wetterstein", None, "Relikt",
    "Bei jeder Rast heilt ihr zusätzlich 2 LP.", "", 1)
add("relikt", "Wendestein", None, "Relikt",
    "Einmal je Kampf dürft ihr einen aufgedeckten Encounter-Modifikator "
    "abwerfen und einen neuen ziehen.", "", 1)
add("relikt", "Totenlicht", None, "Relikt",
    "Fällt ein Spieler auf 0 LP, bleibt er mit 1 LP stehen. Einmal je Run.", "", 1)
add("relikt", "Prüfstein", None, "Relikt",
    "In Kämpfen der Stufe Schwer erhält jeder Spieler zu Kampfbeginn 2 R-Marker.", "", 1)
add("relikt", "Zunderbüchse", None, "Relikt",
    "Brandmale, die ihr legt, halten eine Runde länger.", "", 1)

# --- Neu, Combo ---
add("relikt", "Spiegelscherbe", None, "Relikt",
    "Einmal je Runde: Hast du bereits zwei Karten gespielt, nimm eine "
    "Karte aus deinem Ablagestapel auf die Hand.", "", 1)
add("relikt", "Wurzelgeflecht", None, "Relikt",
    "Deine Wesen kommen mit +0/+1 ins Spiel.", "", 1)
add("relikt", "Schmiedemal", None, "Relikt",
    "Eine bereits aufgewertete Karte darf zusätzlich die jeweils andere "
    "Aufwertung erhalten. Höchstens eine Karte je Spieler.", "", 1)
add("relikt", "Kettenglied", None, "Relikt",
    "Spielst du in einer Runde deine dritte Karte, erhältst du 2 R-Marker.", "", 1)
add("relikt", "Opferschale", None, "Relikt",
    "Einmal je Runde: Wirf eine Handkarte ab, erhalte 1 Ki.", "", 1)
add("relikt", "Vorzeichen", None, "Relikt",
    "Die erste Karte, die jeder Spieler im Kampf spielt, kostet 1 Ki weniger.", "", 1)
add("relikt", "Erbstück", None, "Relikt",
    "Einmal je Kampf darf jeder Spieler eine getappte Ausrüstung enttappen.", "", 1)
