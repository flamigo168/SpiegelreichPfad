# SPIEGELREICH · Pfad-App

Digitaler Prototyp der **Wegkomponente** von SPIEGELREICH. Kein Kartenspiel-Simulator,
kein Druckwerkzeug. Es geht darum, das Plättchen- und Wegsystem samt Belohnungen
spielbar und veränderbar zu machen, um es zu testen.

---

## Arbeitsweise mit Dany

Diese Punkte sind nicht verhandelbar, sie haben sich über mehrere Runden eingespielt.

- **Deutsch.** Immer.
- **Eine konkrete Frage, dann warten.** Keine Fragenlisten. Antwort abwarten,
  dann die nächste Frage.
- **Knapp.** Keine langen Begründungen für Entscheidungen, die schon gefallen sind.
  Kurze Bestätigungen genügen.
- **Ehrlich.** Wenn etwas nicht geht oder ungeprüft ist, direkt sagen. Nicht raten.
  Nicht so tun, als wäre etwas getestet, wenn es das nicht ist.
- **Abgelehnte Richtungen werden nicht verteidigt.** Wenn Dany etwas verwirft,
  kommentarlos annehmen und neu ansetzen.
- **Vor Layout- oder Designvorschlägen erst die vorhandenen Dateien lesen.**

---

## Was hier liegt

```
spiegelreich_pfad.html    die ganze App, eine Datei, keine Abhängigkeiten
sim.mjs                   Regelsimulation ohne Browser
manifest.json             PWA-Manifest (Name, Icons, standalone)
sw.js                     Service Worker fürs Offline-Cachen
index.html                Redirect-Stub auf spiegelreich_pfad.html (für GitHub Pages)
icon-192.png / icon-512.png / icon-180.png   App-Icons (Motiv von Dany)
CLAUDE.md                 diese Datei
```

Kein Buildschritt, kein npm, kein Framework. Reines HTML, CSS und JavaScript.
Die Datei läuft per Doppelklick und liegt genauso auf einem Server.
**Diese Einfachheit ist Absicht — nicht ohne Rückfrage ein Framework einführen.**

Speicher ist **IndexedDB** (`spiegelreich`, Stores `kv` und `img`). Grafiken liegen
als Blob, alles andere als JSON unter dem Schlüssel `stand`. Der `img`-Store ist
generisch: Plättchen-Grafiken (`K01` …), Bühnenhintergründe (`bg_`+brettId) und
Belohnungs-Subdeck-Bilder (`beldeck_`+deckId) liegen alle dort, nur der Schlüssel
unterscheidet sich.

**Wichtig beim lokalen Testen:** `file://` blockiert IndexedDB in manchen Browsern
bzw. isoliert den Speicher pro Aufruf. Zum Testen einen simplen lokalen Server
verwenden (z. B. `python -m http.server` falls vorhanden, sonst reicht auch ein
Ein-Datei-PowerShell-Server über `System.Net.HttpListener`), der Pfade auf Dateien
im Ordner abbildet — nicht einfach die Datei öffnen.

---

## Hosting · GitHub Pages

Repo: `github.com/flamigo168/SpiegelreichPfad` (öffentlich — GitHub Pages auf dem
kostenlosen Tarif kann nicht privat sein, auch nicht bei privatem Repo. Für einen
unveröffentlichten Prototyp ist das Risiko gering, solange die URL nirgends
verlinkt wird. Falls doch mal wichtig: Tailscale für ein wirklich privates Setup).

Live unter `https://flamigo168.github.io/SpiegelreichPfad/` (Branch `main`, Root).
Git-Identität und Credential Manager sind auf Danys Rechner eingerichtet, Push
läuft über den Windows Credential Manager (Browser-Login einmalig).

„Zum Home-Bildschirm hinzufügen" auf iPad/Android sollte darüber jetzt echtes
App-Verhalten geben (Vollbild, eigenes Icon). **Auf echtem Gerät noch nicht
verifiziert** — nur die PWA-Bausteine selbst (Manifest, Icon-Verlinkung) wurden
in der Sandbox-Vorschau geprüft. Die Service-Worker-Registrierung ließ sich dort
nicht testen (Sandbox blockiert das grundsätzlich), ist aber mit `.catch()`
defensiv abgesichert und bricht im Zweifel nichts.

---

## Geometrie — das Fundament, nicht anfassen ohne Grund

Flat-Top-Hexfelder, **feste Tischausrichtung, Plättchen werden nie gedreht**.

Kanten nach Uhrzeigersinn:

```
        12
   10        2
       HEX
    8        4
         6
```

- **Ausgänge:** nur 10, 12, 2 (also immer netto nach oben)
- **Eingänge:** 4, 6, 8 sind immer offen
- Ein Ausgang trifft immer auf eine Eingangskante des Nachbarn. Kanten passen
  dadurch automatisch. Es gibt keine Verbindungsprüfung und keine Drehung.

Achskoordinaten `(q, r)`, Bildschirmposition `x = 1.5·R·q`, `y = √3·R·(r + q/2)`.
y wächst nach unten.

```js
DIR = {12:[0,-1], 2:[1,-1], 4:[1,0], 6:[0,1], 8:[-1,1], 10:[-1,0]}
GEGENKANTE = {10:4, 12:6, 2:8, 4:10, 6:12, 8:2}
WINKEL = {4:30, 6:90, 8:150, 10:210, 12:270, 2:330}   // Grad, für Pfeile auf der Karte
```

Auf der Karte werden Ausgänge als **Pfeile** gezeichnet (kein Zahlentext mehr),
gedreht per `rotate(WINKEL[kante])` um den Kreis-Mittelpunkt. Ein Pfeil, der bei
0° nach rechts zeigt, zeigt nach der Rotation exakt in die reale Ausgangsrichtung —
das folgt direkt aus `kantenMitte()`, die dieselbe Winkelkonvention nutzt.

Plättchentypen ergeben sich **aus den Ausgängen**, nicht umgekehrt:

| Typ | Ausgänge | Name |
|---|---|---|
| I | 10, 2 | Gabelung |
| II | 10 | Linksknick |
| III | 2 | Rechtsknick |
| IV | 10, 12, 2 | Kreuzung |
| V | 12 | Durchgang |
| VI | 10, 12 | Linksgabel |
| VII | 12, 2 | Rechtsgabel |
| VIII | — | Sackgasse |

Physische Maße des Prototyps: 91,5 × 79,2 mm. Die Endgröße steht noch nicht fest,
sie wird eher kleiner. Für die App irrelevant.

---

## Spielregeln, wie sie umgesetzt sind

- Man steht auf einem Plättchen und wählt **einen** Ausgang.
- Für diesen Ausgang werden **3 gezogen, 1 gewählt** (Zahl je Stufe einstellbar).
  **Die Wahl ist bindend.** Ein aufgedecktes Angebot lässt sich nicht schließen,
  ohne eines zu nehmen — sonst könnte man den Sack abtasten, was am Tisch nicht
  geht. Auch der Rücklauf ist während eines offenen Angebots gesperrt.
- Die nicht gewählten kommen ab. **Ausnahme: der Mini-Boss** wandert zurück in
  den Sack und bleibt im Angebot, bis ihn jemand nimmt.
- Gabelungen ziehen **nicht** für alle Ausgänge gleichzeitig — nur für den, den
  man tatsächlich begeht. Der andere Ausgang bleibt für später offen.
- **Rücklauf:** von überall zu einem früheren Feld mit offenem Ausgang.
  Kostet 1 Plättchen aus dem Sack. Dort wählt man einen der freien Ausgänge und
  zieht dafür **neu** 3 aus dem Sack. Ein Angebot ist an den Zug gebunden, nicht
  an die Position — es gibt kein aufgehobenes altes Angebot. Rücklaufziele sind
  jetzt auch **direkt auf der Karte antippbar** (gestrichelter Goldring markiert
  gültige Ziele), nicht nur über die Liste im Panel.
- **Brettrand:** zeigt ein Ausgang aus dem Brett heraus, ist er gesperrt.
- Der Lauf endet, wenn kein offener Ausgang mehr erreichbar ist, der Sack leer
  ist, oder das Feld mit dem Endboss betreten wird.
- Stufenzähler: 1–4 Mob, 5–8 Normal, ab 9 Schwer. Zählt Kampf- und Bossplättchen.
- Besuchte Felder sind **antippbar für eine Infoanzeige** (Name, Typ, Rückseitentext
  — jetzt erlaubt, da schon aufgedeckt).

### Entscheidungen ohne Regelgrundlage

Diese hat Claude getroffen, weil sie gebraucht wurden. Sie stehen in **keinem**
Regeldokument und dürfen jederzeit umgeworfen werden:

1. Zeigt ein Ausgang auf ein bereits belegtes Feld, geht man einfach dorthin,
   ohne neu zu ziehen.
2. Der Endboss wird beim Betreten seines Feldes ausgelöst.

---

## Undo

Umgesetzt wie geplant: ein Stapel voriger `S.lauf`-Zustände (`VORHER`, max. 20,
nicht in IndexedDB gespeichert — nach Neuladen leer, das ist gewollt).

**Danys Entscheidung zur Tiefe:** `merken()` läuft in `ziehen()`, `waehlen()` und
`zurueckLaufen()` — ein Undo nach einer Wahl führt direkt zurück zum offenen
Angebot (ein Undo genügt, nicht zwei). `neuerLaufAus()` setzt `VORHER = []` statt
zu merken.

Undo und „Neuer Lauf" fragen jetzt vorher **„Sicher? Ja/Nein"** nach (eigener
Dialog im App-Stil, kein natives Browser-Popup) — auf Danys Wunsch, obwohl das
bei Undo an sich der Leichtgewichtigkeit widerspricht, die das Feature mal hatte.

Gegenprobe (Sack wird beim Undo nicht neu gemischt): ziehen, Undo, denselben
Ausgang nochmal ziehen → dieselben drei Plättchen. Verifiziert.

---

## Plättchentypen (Arten) — jetzt erweiterbar

`ARTEN`/`HEX`/`SYMBOL` waren früher feste Konstanten. Jetzt liegt das in
`S.arten = [{id, name, farbe, symbol}, …]`, mit `kampf/rast/ereignis/fest/boss`
als Startbestand (`standardArten()`). Neue Arten legt man **im
Plättchen-Dialog** über „＋ Typ" an (Name, Farbe, Symbol) — landet direkt in
`S.arten` und ist sofort im Art-Dropdown wählbar.

Zugriff über Helper, nicht mehr über die alten Konstanten:
`artFarbe(art)`, `artSymbol(art)`, `artInfo(art)` (mit Fallback `#888`/leer für
unbekannte Arten).

---

## Kampagnen

Eigenständig neben den einzelnen **Stufen** (Stufen bleiben für schnelles
Ad-hoc-Spielen bestehen, beide Systeme sind unabhängig).

```js
kampagne = { id, name, level:[{brettId, sackgroesse, zieh, notiz}, …], freischaltung }
freischaltung = { plaettchenId: levelNummer }   // ab welchem Level (1-basiert) verfügbar
```

**Kein Maximum für die Levelzahl.** Bretter aus dem Pool sind **mehrfach
nutzbar** über verschiedene Level (dieselbe Geometrie samt Bühnenhintergrund
taucht dann identisch wieder auf — bewusst, „ihr kehrt zum selben Ort zurück").

**Poolmodell (Danys Entscheidung):** kein eigener Sack je Level wie bei Stufen.
Stattdessen ein gemeinsamer Freischalt-Pool: jedes Plättchen bekommt eine
Levelnummer, ab der es verfügbar ist. Der Sack von Level N berechnet sich zur
Laufzeit als *alles, dessen Freischalt-Level ≤ N* — kumulativ, nichts fällt
wieder raus. `kampagneSack(K, levelIndex)` macht genau das.

Ein Kampagnen-Level erzeugt beim Start einen ganz normalen `lauf` — dafür wurde
`S.lauf.stufeId` zu `S.lauf.quelle` verallgemeinert:

```js
quelle = {typ:"stufe", id} | {typ:"kampagne", kid, lvl}
```

`laufKontext(quelle)` löst das in `{name, brettId, zieh, notiz, sackIds,
sackgroesse}` auf, egal ob Stufe oder Kampagnen-Level dahintersteckt. Alte
gespeicherte Läufe ohne `quelle` (nur `stufeId`) fallen automatisch darauf
zurück — kein Migrationscode nötig, `laufKontext()` fängt das per Fallback ab.

Editor unter **Bauen › Kampagnen**: Level per ↑/↓ sortierbar, „＋ Level" fügt an,
Freischaltung ist eine Liste aller Plättchen mit Zahlenfeld „ab Level" (0 = nicht
dabei). Bretter, Sackgröße und Ziehwert je Level direkt editierbar.

---

## Bühnenhintergrund & Gridfarbe

Pro Brett (nicht pro Level/Kampagne) ein optionales Hintergrundbild
(`URLS["bg_"+brettId]`, wie Plättchen-Grafiken über `grafikSetzen`/`imgDel`) plus
eine Gridfarbe (`F.gridfarbe`, Fallback auf die alten Hardcode-Farben).

**Wichtig:** wenn ein Hintergrund gesetzt ist, bekommen unbelegte Hexfelder
`fill="none"` (komplett durchsichtig) statt der bisherigen dunklen Füllung —
das Bild soll als **durchgehende Fläche** unter dem Gitter erscheinen, das Gitter
liegt nur noch als Linien darüber. Nicht wieder auf halbtransparente Füllungen
zurückfallen, das wurde explizit korrigiert (sah aus wie in Hex-Form
„zerschnittenes" Bild statt einer Fläche).

Editierbar unter **Bauen › Brett**.

---

## Spieler-Reiter

Dritter Reiter oben (neben Spielen/Bauen). Bis zu 4 Spieler, je mit Name, LP,
Geld, Marker (+/− Knöpfe oder direkte Zahleneingabe) und einer Liste der
gesammelten Belohnungskarten (`spieler.karten`, Array von Karten-IDs).

`S.spielerAnzahl` (1–4) steuert, wie viele aktiv sind. Slot-Daten für alle 4
bleiben immer erhalten, auch wenn gerade weniger aktiv sind.

---

## Belohnungen

Kartenbelohnungen nach Scharmützeln/Ereignissen — **kein** Kampfsystem-Nachbau.
Die App simuliert Kämpfe nicht, nur den Scharmützel-Zähler. Ki-Kosten, R-Marker,
Monsterwerte, Encounter-/Boss-Modifikatoren, Bossphasen, Klassendecks: **bewusst
nicht gebaut**, das wäre ein eigenes, großes Vorhaben.

### Datenmodell

```js
belohnungsdeck = { id, name, farbe, modus:"proSpieler"|"gemeinsam", karten:[...] }
karte = { id, name, ki, typ, werte, anzahl, wirkung, unikat }
```

Quelle der Kartendaten: `SPIEGELREICH_Karten_komplett.md` (transkribiert aus
`carddata.py` + `relikte_carddata.py`). Enthält die 8 Themendecks (Gift, Eisen,
Werkzeug, Fluss, Hain, Ofuda, Ibara, Shirushi) plus **Relikte** als neuntes
Subdeck. Kartenzahlen 1:1 geprüft (z. B. Gift 21 Karten/11 Einträge, Relikte 23).

**Relikte sind kein Sonderfall im Code** — einfach ein Subdeck mit
`modus:"gemeinsam"` und lauter Unikat-Karten. **Bewusst keine Obergrenze**
(die Quelle nennt „höchstens zwei je Run", das ist explizit nicht übernommen).

### Zieh-Logik — anders als bei Wegplättchen

**Nicht gewählte Karten kommen zurück in den Pool**, nicht in eine Ablage. Der
Pool je Subdeck lebt in `L.belohnungsPools[deckId]` (lazy initialisiert aus
`karte.anzahl` Kopien je Karte). Eine gewählte Karte verlässt den Pool dauerhaft,
die zwei nicht gewählten werden zurückgemischt (`shuffle`) — sie können in der
nächsten Runde wieder auftauchen.

**Pro Spieler eine eigene 3er-Auswahl**, nicht eine gemeinsame:
`S.lauf.belohnung.spielerIndex` läuft sequenziell durch `S.spielerAnzahl`.
Bei `modus:"gemeinsam"` (Relikte) dagegen **eine** Auswahl für die ganze Gruppe,
landet in `L.beute` statt bei einem Spieler.

### Drei Auslöse-Varianten je Plättchen

Feld `plaettchen.belohnung`, editierbar im Plättchen-Dialog:

```js
null                                  // keine Belohnung
{modus:"alle"}                        // alle proSpieler-Subdecks gemischt, 1 Pool
{modus:"subdeck", deckId}             // genau ein festgelegtes Subdeck
{modus:"wahlProSpieler"}              // jeder Spieler wählt sein Subdeck selbst frei
```

`"alle"` und `"wahlProSpieler"` schließen **gemeinsam-Subdecks aus** (Relikte
sind nur über die explizite `subdeck`-Zuweisung erreichbar, z. B. am
Schrein-Ereignis) — sonst würde ein einzelnes Relikt in der großen Mischung
untergehen, und der Party-Charakter (eine Auswahl für alle) würde brechen.

### Ablauf — „Bestanden"-Sperre

Die App simuliert den Kampf nicht, der passiert am Tisch. Deshalb startet die
Belohnung **nicht automatisch** beim Platzieren des Plättchens:

1. Weg wählen, Plättchen wird platziert (`waehlen()` setzt nur
   `L.bestehenAusstehend = plaettchen.belohnung`).
2. Overlay „Am Tisch ausgetragen?" mit Knopf **„Bestanden"** — Ausgänge,
   Ziehen und Rücklauf sind bis zum Klick gesperrt (`ziehen()` und die
   Ausgangsknöpfe prüfen `!L.bestehenAusstehend`).
3. Klick auf „Bestanden" → `bestehenBestaetigt()` → startet erst jetzt den
   eigentlichen Belohnungs-Draft (`starteBelohnung()`).
4. Nach Abschluss (aller Spieler bzw. der einen gemeinsamen Wahl) geht es
   normal mit der Wegwahl weiter.

Bei `"wahlProSpieler"` gibt es zusätzlich eine Zwischenphase (`L.belohnung.phase
= "deck"` vs `"karten"`): erst Subdeck-Auswahl (eigene kleine Kartenvorschau je
Subdeck, `vorschauBelohnungsdeck()`), dann der normale 3er-Draft daraus. Jeder
Spieler bekommt diese Deck-Wahl **neu**, nicht nur der erste.

### Darstellung

Anders als beim Wegplättchen-Draft (Name + Typ, **kein** Inhalt) zeigt der
Belohnungs-Draft **alle Infos**: Name, Ki, Typ, Werte, voller Wirkungstext,
★ für Unikate, Subdeck-Farbe als Kopfleiste, Subdeck-Bild als Hintergrund der
Kopfleiste (`vorschauBelohnungskarte()`, CSS-Klasse `.belkarte`). Das ist
Absicht — bei der Belohnung gibt es nichts zu verbergen.

Editor unter **Bauen › Belohnungen**: Subdecks anlegen/ändern (Name, Farbe,
Bild, Modus), Karten je Subdeck anlegen/ändern/löschen. Die Dialoge sind
**verschachtelt simuliert** — da nur ein `<dialog>`-Element existiert, schließt
der Karten-Dialog sich selbst und ruft beim Sichern/Abbrechen eine
Rückkehr-Callback auf, die den Deck-Dialog neu öffnet. Dieses Muster
(`zurueck`-Callback) bei Bedarf für weitere verschachtelte Editoren wiederverwenden.

---

## Datenmodell (Gesamtüberblick)

```js
plaettchen = { id, name, art, ausgaenge:[10,12,2], v:"A"|"B", rueck, belohnung? }
// art: Schlüssel in S.arten (erweiterbar, s. o.)
// belohnung: null | {modus:"alle"|"wahlProSpieler"} | {modus:"subdeck", deckId}

brett = { id, name, breite, hoehe, zellen, gridfarbe? }
zellen["q,r"] = { rolle: "frei" | "start" | "fest", plaettchen? }

stufe = { id, name, brettId, sack:[ids], sackgroesse, zieh, notiz }

kampagne = { id, name, level:[{brettId, sackgroesse, zieh, notiz}], freischaltung }

belohnungsdeck = { id, name, farbe, modus:"proSpieler"|"gemeinsam", karten:[...] }

lauf = {
  quelle,                              // {typ:"stufe",id} | {typ:"kampagne",kid,lvl}
  brettId, brett, pos, sack, ablage, angebot, scharmuetzel, ende, log,
  bestehenAusstehend,                  // belohnung-Config, wartet auf "Bestanden"
  belohnung,                           // aktiver Draft-Zustand, s. Belohnungen
  belohnungsPools,                     // { deckId: [kartenId, ...] }, run-lokal
  beute,                               // gemeinsame Relikt-Beute
}
brett["q,r"] = { id, von, fest? }

S.spieler = [{ name, lp, geld, marker, karten:[belohnungsKartenId] }]  // fix 4 Slots
S.arten = [{ id, name, farbe, symbol }]
```

Die Saatdaten in `saatPlaettchen()` entsprechen **Plättchen v1.2**:
18 Kampf, 9 Rast, 9 Ereignis, dazu S01 Grubeneingang, M01 Tatara-Ofen, B01 Die Esse.

**Bekannter Widerspruch in v1.2:** Abschnitt 1 nennt für die 24 A-Plättchen
13×I / 6×II / 5×III, die Tabellen ergeben aber 14 / 5 / 5. Die App folgt den
Tabellen. Nicht stillschweigend auf die andere Zahl ändern.

---

## Oberfläche

Drei Ebenen oben: **Spielen**, **Spieler**, **Bauen**. Daten und Sicherung
liegen hinter ≡ im Kopf.

- **Spielen** — Karte als Bühne. Ausgänge sind Kreise mit **Pfeil** (kein
  Zahlentext) zur realen Richtung, mit Hover-/Press-Highlight. Gefüllt = ziehen,
  umrandet = weitergehen, durchgestrichen = Brettrand. Besuchte Felder sind
  antippbar (Info-Dialog, oder Rücklaufziel während `RUECKLAUF`). Der
  Wegplättchen-Draft zeigt drei Sechsecke mit Name/Typ/Ausgangspfeilen, aber
  **ohne** Inhalt — Klick wählt. Der Belohnungs-Draft zeigt volle Karten
  inklusive Wirkungstext.
- **Spieler** — LP/Geld/Marker/Karten je Spieler, 1–4 aktiv, plus gemeinsame
  Beute-Liste oben.
- **Bauen › Brett** — Feldeditor, vier Pinsel, Formknöpfe, Bühnenhintergrund
  und Gridfarbe.
- **Bauen › Plättchen** — jedes Plättchen änderbar, Grafik je Plättchen, neue
  Arten anlegbar, Belohnungs-Auslöser (aus/alle/frei/bestimmtes Subdeck).
  Sammelimport ordnet über den Dateinamen zu: `K01.png` → K01.
- **Bauen › Stufen** — verbindet Brett mit Sack (Einzellauf, kein Kampagnenteil).
- **Bauen › Kampagnen** — Level-Liste, Freischaltung, Reihenfolge per ↑/↓.
- **Bauen › Belohnungen** — Subdecks samt Bild/Farbe/Modus, Karten darin.

Ab 900 px Breite Seitenleiste rechts, darunter Schublade mit Griff — und **jetzt
auch auf Desktop ein-/ausklappbar**: der Griff sitzt dort als schmaler,
senkrechter Balken am linken Rand des Panels, klappt auf 20 px zu (vorher gab
es dafür keinen sichtbaren Auslöser, der Griff war per Media Query komplett
ausgeblendet — das war der eigentliche Bug).

Bestätigungsdialoge im App-Stil (`bestaetigen(text, aufJa)`, kein natives
`confirm()`) für Undo und „Neuer Lauf". Die übrigen destruktiven Aktionen
(Brett/Stufe/Kampagne/Subdeck löschen, Alles löschen) nutzen weiterhin das
native `confirm()` — nicht vereinheitlicht, könnte man später angleichen.

---

## Testen

```
node sim.mjs 300
```

Lässt einen Zufallsspieler laufen und prüft: nichts außerhalb des Bretts,
Eingangskanten immer 4/6/8, keine Doppelbelegung, Sackbilanz stimmt.
Exitcode 1 bei Regelfehlern.

**Nach jeder Änderung an der Laufregel laufen lassen.** Das Skript schneidet sich
die Logik aus der HTML-Datei heraus; es hört beim Marker `(async function start()`
auf. Bleibt dieser Marker das letzte Element im Skriptblock, funktioniert es
weiter — deshalb steht die Service-Worker-Registrierung **innerhalb** dieser
IIFE, nicht davor (sonst würde sim.mjs, das in einer Node-Umgebung ohne
`navigator` läuft, daran zerbrechen).

Letzter Stand, 300 Läufe je Stufe (nach dem `stufeId`→`quelle`-Umbau, von Dany
selbst laufen lassen):

| | Stufe 1 · Netz | Stufe 2 · Labyrinth |
|---|---|---|
| Felder belegt Ø | 11,2 | 11,1 |
| Scharmützel Ø | 5,7 | 4,7 |
| Endboss erreicht | 24 / 300 | 12 / 300 |
| Sackgassen / Rückläufe | 0 / 73 | 154 / 1039 |
| Regelfehler | 0 | 0 |

**Das Belohnungssystem ist darin nicht geprüft** — die Katalog-Plättchen haben
noch kein `belohnung`-Feld gesetzt, der neue Code-Pfad in `waehlen()` bleibt für
den Zufallsspieler also inert. Sobald irgendwo in den Saatdaten ein `belohnung`
gesetzt wird, `sim.mjs` erneut laufen lassen — der Zufallsspieler kennt
`bestehenAusstehend`/`belohnung` nicht und würde dort hängen bleiben, das
harness müsste dafür erweitert werden.

---

## Nicht geprüft

Vieles wurde diese Runde per Browser-Automatisierung getestet (Tablet- und
Desktop-Breite, Tap-Interaktion, Undo, Kampagnen-Start, Belohnungs-Draft in
allen drei Modi). Weiterhin offen:

- **Echtes Gerät (iPad/Android).** Alles bisherige lief in einer
  Sandbox-Vorschau mit emulierten Viewports, nie auf echter Hardware.
- Export- und Importweg als echter Roundtrip (Datei raus, Datei wieder rein) —
  die neuen Felder (`arten`, `kampagnen`, `belohnungsdecks`, `spieler.karten`)
  sind zwar in `exportieren()`/`importieren()` verdrahtet, aber nie tatsächlich
  einmal exportiert und wieder importiert.
- Sammelimport für Plättchen-Grafiken (Mehrfachauswahl) im Speziellen.
- Service-Worker-Verhalten (Offline-Cache) auf einem echten Browser.

---

## Später: Reroll

Das ist **keine** Werkzeugfunktion, sondern eine Spielregel, und die steht noch
nicht. Aus der Metaprogression: der erste Sieg über den Mini-Boss schaltet ein
Reroll-Talisman frei. Ungeklärt ist alles Übrige — wie oft je Lauf, ob nur im
Draft oder auch im Kampf, ob es sich nachladen lässt.

**Nicht anfangen zu bauen, bevor die Regel steht.**

Wichtig für die Abgrenzung: **Undo darf nie wie ein Reroll wirken**, und das
Belohnungs-„Zurück in den Pool" ist auch kein Reroll — das ist die normale
Zieh-Logik der Belohnungskarten, kein Ressourcen-Einsatz. Wenn Reroll kommt,
sauber von beidem abgrenzen.

---

## Offene Fragen

**Ans Spiel gerichtet, nicht an den Code:**

- 42 Felder auf dem Raster bei ~11 belegten Räumen — das Brett ist deutlich zu
  groß. Welche Größe ist richtig?
- Der fest gesetzte Endboss wird selten erreicht. Soll die Gruppe ihn gezielt
  ansteuern können, oder soll er anders ausgelöst werden?
- Ist die Zahl der Ausgänge mechanisch noch relevant, wo breite Plättchen im
  Draft nicht mehr kosten?
- Die Kartendatei kennt drei Beute-Varianten je Kampfknoten („Freie Wahl aus
  allen Vorräten", „Wahl aus 2 zufälligen Vorräten", „1 zufällig gezogener
  Vorrat"). Gebaut sind „alle gemischt", „frei wählen" und „festes Subdeck" —
  die Variante „2 zufällige zur Auswahl" fehlt noch, falls sie gebraucht wird.

**Am Werkzeug:**

- Grafiken für die Wegplättchen fehlen noch komplett (Belohnungs-Subdecks haben
  jetzt Bildunterstützung, die Plättchen selbst weiterhin nicht befüllt).
- Die Bretter Raster und Sanduhr sind geraten. Die echten Layouts aus dem
  Plättchendokument sind nicht eingepflegt.

---

## Herkunft

Regelstand: `SPIEGELREICH_Plaettchen_v1_2.md`, dazu Modus v1.14 und Regelwerk v1.6.
Die Kartendateien (`build_cards.py`, `build_path.py`, `carddata.py`) gehören zum
Druckwerkzeug und sind von dieser App unabhängig — aber sie teilen die Plättchendaten.
Falls beides zusammenwachsen soll, ist `carddata.py` die andere Quelle der Wahrheit.

Belohnungsdaten: `SPIEGELREICH_Karten_komplett.md` (Transkript aus `carddata.py` +
`relikte_carddata.py`, Stand siehe Datei-Kopf — dort steht auch, welche
Kartentexte laut `VERALTETE_KARTENTEXTE.md` schon überholt sind. Nicht
stillschweigend die neueren Werte einpflegen, ohne das mit Dany abzugleichen).
