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
generisch: Plättchen-Grafiken (`KA01` …), Bühnenhintergründe (`bg_`+brettId) und
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

## ID-Schema der Plättchen

Seit v1.4/v1.6 durchgängig: **2-Buchstaben-Kürzel je Art + laufende Nummer**, damit auf
einen Blick erkennbar ist, was ein Plättchen ist, ohne nachschlagen zu müssen.

| Kürzel | Art |
|---|---|
| KA | Kampf (Mob/Normal/Schwer/Elite, s. Kampf-Tiers) |
| RA | Rast |
| ER | Ereignis |
| BE | Besonderes Ereignis |
| AW | Aufwertung |
| SC | Schrein |
| SH | Shop |
| ST | Start |
| MB | Miniboss |
| EB | Endboss |

Die alten IDs (K01, R01, E01, S01, M01, B01, …) gibt es nicht mehr.

**Migrationshinweis:** ein Browser mit altem Spielstand (IndexedDB) lädt beim Öffnen
weiter die alten Daten — `laden()` liest den gespeicherten Stand, nicht die neuen
Saatdaten. Der Knopf „Plättchen auf v1.7" (≡ → Daten) reicht **nicht**, weil alte
Stufen/Bretter/Kampagnen noch auf die alten IDs zeigen (Start-/Bossfeld auf dem
Brett, Sack-Listen der Stufen) — die würden dann ins Leere zeigen. Für einen
sauberen Umstieg auf das neue Schema: **„Alles löschen"** unter ≡ → Daten.
(„Plättchen auf v1.7" gleicht seit v1.7 immerhin `S.arten` gegen fehlende
Standard-Arten ab — sonst wären `kampf2`/`kampf3`/`elite` nach einem reinen
Plättchen-Reset ohne Farbe/Symbol geblieben, weil `S.arten` dabei sonst nicht
angefasst wird.)

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
`S.arten = [{id, name, farbe, symbol}, …]`, mit `kampf1/kampf2/kampf3/elite/
rast/ereignis/besonders/aufwertung/schrein/fest/boss/shop` als Startbestand
(`standardArten()`). **Kampf ist seit v1.7 in vier eigene Arten aufgeteilt**
(`kampf1`=Mob, `kampf2`=Normal, `kampf3`=Schwer, `elite`) statt einer
gemeinsamen `kampf`-Art — Danys Vorgabe, damit jede Härtestufe eine eigene
Farbe/Symbol **und ein eigenes Bild über „Gleiches Bild für alle Plättchen
einer Art"** bekommen kann (das war mit nur einer `kampf`-Art nicht trennbar).
`kampfTier()` liest die Stufe jetzt direkt aus `t.art` (`KAMPF_TIER_ART`-Tabelle),
keine ID-Bereichs-Logik mehr nötig. `istKampf(t)` prüft `KAMPF_ARTEN.includes
(t.art)` — überall verwenden, wo früher `t.art==="kampf"` stand (Scharmützel-
Zähler, „Bestanden"-Gate, Start-Kampf-Erkennung).

`besonders` (Besonderes Ereignis) und `ereignis` sind bewusst getrennte Arten,
nicht eine mit einem Flag — unterschiedliche Seltenheit/Wirkungsstärke soll auf
der Karte sofort unterscheidbar sein, nicht erst beim Antippen. Neue Arten legt
man **im Plättchen-Dialog** über „＋ Typ" an (Name, Farbe, Symbol) — landet
direkt in `S.arten` und ist sofort im Art-Dropdown wählbar.

Zugriff über Helper, nicht mehr über die alten Konstanten:
`artFarbe(art)`, `artSymbol(art)`, `artInfo(art)` (mit Fallback `#888`/leer für
unbekannte Arten).

---

## Kampagnen

Eigenständig neben den einzelnen **Stufen** (Stufen bleiben für schnelles
Ad-hoc-Spielen bestehen, beide Systeme sind unabhängig).

```js
kampagne = { id, name, level:[{brettId, sackgroesse, zieh, notiz}, …], freischaltung, fortschritt? }
freischaltung = { plaettchenId: levelNummer }   // ab welchem Level (1-basiert) verfügbar
// fortschritt: höchstes geschafftes Level, s. Levelende
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

## Levelende · Zielfelder + Endboss

Zwei Wege, einen Lauf erfolgreich zu beenden — **Zielfelder** (frei wählbarer
Kampf) und der **Endboss** (fest, ein Exemplar je Brett) — laufen über
dieselbe Maschinerie (`levelAbschliessen()`).

### Zielfelder deklarieren

Bauen › Brett, Pinsel „Ziel": funktioniert wie „Festes Plättchen", nur mit
einer nach Kampf1/Kampf2/Kampf3/Elite/Boss **gefilterten** Auswahlliste
(`zielTauglich()`) statt aller Plättchen — Miniboss/Endboss sind über ihre
`art:"boss"` mit drin, genauso wählbar wie ein normaler Kampf. Die Zelle
bekommt sofort ein konkretes Plättchen (`{rolle:"ziel", plaettchen:id}`),
liegt ab Lauf-Start fest auf dem Brett (`neuerLaufAus()` behandelt `"ziel"`
genau wie `"fest"`, zusätzlich mit `ziel:true` markiert). **Kein Zug mehr
nötig** — anders als in der ersten Fassung dieser Runde, wo die Zelle leer
blieb und irgendein normal gezogenes Plättchen zählte. Mehrere Zielfelder je
Brett sind weiterhin erlaubt.

### Auslösung

Beide Fälle laufen über `ziehen()`, nicht über `waehlen()` — Zielfeld wie
Endboss liegen ja von Lauf-Beginn an fest, man „zieht" beim Erreichen nie
neu, man wechselt nur die Position (`lage==="belegt"`-Zweig):

- **Zielfeld** (`f.ziel`): `L.bestehenAusstehend=t.belohnung||{}` (die
  eigene Belohnung des gewählten Kampf-Plättchens läuft ganz normal mit,
  Kampf-Gold über `vergibKampfGold()` ebenfalls), zusätzlich
  `L.zielAusstehend={relikte:zielRelikte(t), grund:t.name+" ist bezwungen"}`.
- **Endboss** (`f.fest`, `art:"boss"`, geprüft über die Brett-Zelle, nicht nur
  über das Laufzeit-Flag — sonst würde ein als Ziel gewählter Miniboss/Endboss
  fälschlich hier reinlaufen statt in den Zielfeld-Zweig):
  `L.bestehenAusstehend={}`, `L.zielAusstehend={relikte:2, grund:"Der Endboss ist besiegt"}`.

`zielRelikte(t)`: 2 bei Schwer/Elite/Boss, sonst 1 — Claudes Staffelung, kein
Regeldokument dahinter.

In beiden Fällen prüft `pruefeZielAbschluss()`, sobald `bestehenAusstehend`
**und** `belohnung` beide wieder leer sind (also nach Bestätigung plus einem
eventuellen Kartendraft/Kauf), und ruft `levelAbschliessen(relikte, grund)`
auf. Das läuft an jeder Stelle, an der diese beiden Felder final auf „fertig"
gehen (`bestehenBestaetigt()`, `waehleBelohnung()`, `shopSchliessen()`).

**Entscheidung ohne Regelgrundlage** (Claude, umwerfbar): die „2 Unikate"-
Rückseite des Endbosses wird als **2 zufällige Relikte** automatisiert
(Relikte sind im Datenmodell ohnehin die einzigen echten Unikate) — Claudes
Zuordnung, nicht wörtlich aus einem Regeldokument.

### Levelbelohnung

`levelAbschliessen(relikteAnzahl, grund)` zieht **zufällige Relikte** aus dem
`RL`-Pool (keine Wahl, anders als der übrige Belohnungs-Draft — Anzahl über
`zielRelikte()`/fest 2 beim Endboss) und legt sie in `L.beute`, **zusätzlich**
zur normalen Belohnung des Zielfeld-Plättchens selbst. Ist das Relikte-Subdeck
deaktiviert oder der Vorrat (teilweise) leer, gibt es entsprechend weniger
oder eine Logzeile statt Relikt — das Level endet trotzdem.

### Kampagne vs. Stufe — jetzt mit Wahl statt Automatik

- **Kampagne mit weiterem Level:** `L.ende` wird gesetzt, zusätzlich
  `L.kampagnenWahlAusstehend={kid, aktLevel, naechstesLevel}` — das öffnet ein
  Overlay „Level N geschafft!" mit zwei Knöpfen: **„Start Level N+1"**
  (`kampagneWeiter()`, ersetzt `S.lauf` sofort durch `neuerKampagnenLauf(...)`,
  das neue Level öffnet direkt sein eigenes Start-Kampf-Gate) oder
  **„Speichern & beenden"** (`kampagneSpeichernBeenden()`, räumt nur die Wahl
  weg — gespeichert ist ohnehin längst, IndexedDB speichert nach jeder
  Aktion; der Lauf bleibt im „Level N geschafft"-Endzustand stehen).
- **Letztes Level einer Kampagne oder eine einzelne Stufe:** `L.sieg=true` —
  eigenes **Sieg-Overlay** (groß, goldgerahmt, „SIEG") statt der kleinen
  Ende-Leiste, Knopf „Weiter" räumt nur `L.sieg` weg.

**Kampagnen-Fortschritt** (Danys Vorgabe, „Tracking ergänzen"):
`kampagne.fortschritt` (Zahl, höchstes je geschafftes Level) wird in
`levelAbschliessen()` aktualisiert, unabhängig davon, ob am Ende „weiter" oder
„speichern" gedrückt wird. Sichtbar auf **Bauen › Kampagnen** als
„Fortschritt: Level N geschafft" plus ✓-Häkchen auf den erledigten
Level-Knöpfen. Kein neuer Persistenzmechanismus nötig — `fortschritt` sitzt
direkt am Kampagnen-Objekt in `S.kampagnen`, das sowieso schon gespeichert
wird; `Object.assign` beim Kampagne-Ändern-Dialog überschreibt es nicht, weil
das Formular das Feld gar nicht anfasst.

**Ehemalige Lücke, jetzt behoben:** `beute` (und `belohnungsPools`) hingen am
`lauf`-Objekt, nicht an `S`. Beim Kampagnen-Sprung in ein neues Level wurde
`S.lauf` ersetzt — jedes gesammelte Relikt aus dem alten Level wäre danach
verloren gewesen. Auf Danys Vorgabe („Vorrat muss dauerhaft verschwinden")
sitzen beide jetzt auf `S`, s. Belohnungen › Zieh-Logik.

### Direkt zum Ziel/Boss + Malus

Zwei parallele Knöpfe, gleiches Prinzip: tauchen auf, wenn `L.ende` gesetzt
ist, das Level noch nicht abgeschlossen ist (`!L.sieg && !L.kampagnenWahlAusstehend`)
und das jeweilige Ziel existiert (`zielFeldKey()` bzw. `bossZiel()`). Klick
(`direktZumZiel()`/`direktZumBoss()`) springt dorthin, setzt `L.zielMalus=true`
und ruft **direkt** `levelAbschliessen(...)` auf — ohne Umweg über das
„Bestanden"-Gate und ohne die eigene Belohnung des Zielfeld-Plättchens (die
gibt's nur, wenn der Kampf tatsächlich ausgetragen wird, nicht beim
Überspringen). `direktZumZiel()` liest Name/Tier des dort liegenden
Plättchens für Grund-Text und `zielRelikte()`-Anzahl aus `L.brett`. Der
Levelende-Text bekommt den Zusatz „Malus: zieht 1 Handkarte weniger zu
Kampfbeginn." Reiner Text-Reminder, keine Kartensimulation. (Der frühere
separate `L.bossMalus`-Flag ist zugunsten von `L.zielMalus` entfallen, beide
Knöpfe teilen sich jetzt dasselbe Feld.)

---

## Eingebettete Art-Grafiken

Dany hat 13 Bilder geliefert (aus `Bushiod Card Game/plättchen/`), **eins je
Art** statt je Plättchen: kampf1/2/3, elite, rast, ereignis, besonders,
aufwertung, schrein, shop — plus drei Sonderfälle, weil die sich eine `art`
mit anderen Plättchen teilen, aber optisch eigenständig sein sollen: Start
(ST01–03, teilen sich `kampf1/2/3` mit den echten Kampf-Plättchen), Miniboss
und Endboss (teilen sich `art:"boss"`).

**Downscale, nicht im Original eingebettet:** Die Originale waren 1254×1254 px
PNG, 2,7–3,5 MB je Datei (~41 MB gesamt) — für eine einzelne portable
HTML-Datei nicht tragbar. Alle 13 wurden auf 400×400 px JPEG (Qualität 0,85)
verkleinert, ~60–105 KB je Bild, zusammen ~1,15 MB. Datei-Gesamtgröße jetzt
~1,3 MB statt ~135 KB. Downscale lief über einen Canvas im Browser (kein
ImageMagick/Python mit PIL auf der Maschine verfügbar), die fertigen Base64-
Strings wurden über einen lokalen Node-Server direkt auf die Platte geschrieben
und per Node-Skript in die HTML-Datei gespleißt — nie durch den
Modellkontext geschickt, dafür wären die ~1,17 MB Text zu groß gewesen.

**Datenmodell:** `SAAT_BILDER` (Objekt `{schlüssel: dataURI, …}`), Schlüssel
sind entweder `"art:"+artId` (10 Stück) oder eine konkrete Plättchen-ID
(`ST01/ST02/ST03` zeigen alle auf dieselbe `BILD_STARTFELD`-Konstante, `MB01`
und `EB01` je eigenes Bild). `saatBilderEinspielen()` läuft einmal beim Start
(innerhalb der `(async function start())`-IIFE, nach `laden()`) und schreibt
für jeden Schlüssel, der noch **nicht** im `img`-IndexedDB-Store existiert,
das eingebettete Bild hinein — idempotent, überschreibt nie ein eigenes
Hochladen. Rendering über neue Helper-Funktion `bildFuer(t)` = `URLS[t.id] ||
URLS["art:"+t.art]` — probiert erst das plättchen-eigene Bild (Sammelimport,
„Gleiches Bild für alle Plättchen einer Art", Einzel-Upload), fällt sonst auf
die eingebettete Art-Grafik zurück. Eingesetzt in `zeichnePlaettchen()`
(Spielbrett), `vorschauPlaettchen()` (Wegplättchen-Draft) und der
Bauen-›-Plättchen-Kachelliste. Die reinen Editor-Stellen (Bild hochladen/
entfernen in `dialogPlaettchen`, „X mit Grafik"-Zähler) bleiben bewusst bei
`URLS[t.id]` pur — die zeigen/verwalten die plättcheneigene Datei, nicht den
Fallback.

**Wichtig, falls `art:"boss"` oder die Kampf-Arten je weiter aufgeteilt
werden:** `bossZiel()` und der Boss-Zweig in `ziehen()`/`pruefeEnde()` prüfen
zusätzlich `zellen[k].rolle==="fest"` (nicht nur `f.fest`), damit ein über den
Ziel-Pinsel gewählter Miniboss/Endboss nicht fälschlich in die klassische
Endboss-Logik reinläuft — das war schon vor den Bildern nötig, gilt aber jetzt
genauso für die Bildzuordnung.

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

**Ecken-Bug (behoben):** im Brett-Editor umgeben „Erweiterungs"-Geisterzellen
(`erweiterung(F)` — die gestrichelten Felder, auf die man klickt, um das Brett
zu vergrößern) die eigentliche Form. Die hatten unabhängig vom Hintergrund
immer eine harte, deckende Füllung (`#0c0f10`) — bei einer unregelmäßig
zugeschnittenen Form (Felder aus/an) saß das direkt neben/in den Ecken des
Hintergrundbilds und sah wie ein hässlicher dunkler Rand aus. Fix: dieselbe
`fill="none"`-Behandlung wie bei den echten unbelegten Feldern, sobald ein
Hintergrund gesetzt ist (nur in `karteEditor()` betroffen, nicht im
Spielen-Modus — dort gibt es keine Erweiterungszellen).

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
belohnungsdeck = { id, name, farbe, modus:"proSpieler"|"gemeinsam", karten:[...], aktiv? }
karte = { id, name, ki, typ, werte, anzahl, wirkung, unikat }
```
`aktiv`: Boolean, Default `true` (fehlendes Feld = aktiv). Siehe „Subdecks
global deaktivieren" weiter unten.

Quelle der Kartendaten: `SPIEGELREICH_Karten_komplett.md` (transkribiert aus
`carddata.py` + `relikte_carddata.py`). Enthält die 8 Themendecks (Gift, Eisen,
Werkzeug, Fluss, Hain, Ofuda, Ibara, Shirushi) plus **Relikte** als neuntes
Subdeck. Kartenzahlen 1:1 geprüft (z. B. Gift 21 Karten/11 Einträge, Relikte 23).

**Relikte sind kein Sonderfall im Code** — einfach ein Subdeck mit
`modus:"gemeinsam"` und lauter Unikat-Karten. **Bewusst keine Obergrenze**
(die Quelle nennt „höchstens zwei je Run", das ist explizit nicht übernommen).

### Zieh-Logik — anders als bei Wegplättchen

**Nicht gewählte Karten kommen zurück in den Pool**, nicht in eine Ablage. Der
Pool je Subdeck lebt in **`S.belohnungsPools[deckId]`** (lazy initialisiert aus
`karte.anzahl` Kopien je Karte). Eine gewählte Karte verlässt den Pool dauerhaft,
die zwei nicht gewählten werden zurückgemischt (`shuffle`) — sie können in der
nächsten Runde wieder auftauchen.

**Auf `S` statt `L`, bewusst (Danys Vorgabe):** eine einmal gewählte Karte muss
für immer aus dem Vorrat verschwinden, nicht nur für den aktuellen Lauf.
`belohnungsPools` (und `beute`, die Relikt-Beute der Gruppe) hingen ursprünglich
am `lauf`-Objekt und wurden bei jedem `neuerLaufAus()` — auch beim automatischen
Kampagnen-Levelsprung — komplett neu aufgefüllt. Jetzt beides auf `S` verschoben,
übersteht `speichern()`/`laden()`/Export-Import und jeden Laufwechsel. Reset nur
noch explizit über ≡ → Daten → **„Vorrat auffüllen"** (setzt nur die Pools/Beute
zurück, lässt Plättchen/Bretter/Kampagnen/Spieler-Karten unberührt) oder
„Alles löschen". Sichtbarer **Zähler** dafür: Bauen › Belohnungen zeigt „X / Y
im Vorrat" je Subdeck (Kachel) und je Karte (im Subdeck-Dialog).

**Pro Spieler eine eigene 3er-Auswahl**, nicht eine gemeinsame:
`S.lauf.belohnung.spielerIndex` läuft sequenziell durch `S.spielerAnzahl`.
Bei `modus:"gemeinsam"` (Relikte) dagegen **eine** Auswahl für die ganze Gruppe,
landet in `S.beute` statt bei einem Spieler.

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

### Subdecks global deaktivieren

`belohnungsdeck.aktiv` (Boolean, Default `true` — fehlt das Feld an altem
Spielstand, gilt „aktiv", kein Migrationscode nötig). Checkbox im Subdeck-Dialog
(„Aktiv … deaktivieren, wenn nicht gedruckt oder nicht mitgespielt"), zusätzlich
abgedunkelt + „· deaktiviert" in der Kachel-Übersicht. Wirkung: `starteBelohnung()`
filtert deaktivierte Decks aus `alle`/`wahlProSpieler`/`kaufAlle` komplett raus;
zeigt ein Plättchen fest auf ein deaktiviertes Subdeck (`subdeck`/`kaufSubdeck`/
Schrein auf Relikte), passiert beim Betreten gar nichts außer einer Logzeile
(„Subdeck deaktiviert — keine Belohnung hier"). Kein Sonderfall für `gemeinsam`
(Relikte) — dieselbe Prüfung greift überall.

### Kampf-Tiers — Mob / Normal / Schwer / Elite

Aus `SPIEGELREICH_Plaettchen_App_v1_5_Kampftexte.md`. Die `kampf`-Plättchen sind
kein einheitlicher Topf mehr, sondern vier Härtestufen, rein an der Zahl in
`S.lauf.scharmuetzel` orientiert (Stufenzähler: 1–4 Mob, 5–8 Normal, ab 9 Schwer,
Elite ist optional/situativ). Die Rückseite zeigt jetzt **GEGNER** (z. B. „2
Normal + 1 Schwer je Spieler") und optional **Modifikatoren** (Zahl 0–3) —
beides reine Anzeige-Info, die App würfelt/zieht dafür nichts, genau wie
Ki-Kosten & Co. schon vorher nicht simuliert wurden.

**Gold automatisch bei Kampferfolg** (Danys Vorgabe): `KAMPF_GOLD =
{mob:10, normal:20, schwer:35, elite:50}`. Sobald ein `art:"kampf"`-Plättchen
mit „Bestanden" bestätigt wird, bekommt **jeder aktive Spieler** automatisch
das Gold seiner Stufe gutgeschrieben (`vergibKampfGold()`, Tier über
`kampfTier()` aus der ID-Nummer abgeleitet: `KA01–26` Mob, `27–34` Normal,
`35–40` Schwer, `41–43` Elite). Das gilt jetzt für **alle** Kampf-Plättchen,
nicht nur die mit Kartenbelohnung — deshalb öffnet `waehlen()` das
„Bestanden"-Gate seit dieser Runde bei jedem `art:"kampf"`, auch ohne
`belohnung`-Feld (vorher: nur wenn `belohnung` gesetzt war, die meisten
reinen Mob-Kämpfe ohne Kartenbelohnung liefen also bisher komplett ohne
Bestätigung durch). `bestehenBestaetigt()` vergibt zuerst das Gold, startet
danach nur bei vorhandenem `belohnung`-Feld zusätzlich den Karten-Draft.

**Das Startfeld ist jetzt selbst ein Kampf** (Danys Vorgabe): läuft über den
`K()`-Helper wie jedes andere Kampf-Plättchen. Seit v1.7 gibt es **drei
„Eingang"-Varianten** nach Härtestufe statt nur einer:

| ID | Name | Art | GEGNER | Belohnung |
|---|---|---|---|---|
| ST01 | Grubeneingang | `kampf1` | 2 Mobs je Spieler | `wahlProSpieler` |
| ST02 | Zwischenschacht | `kampf2` | 2 Normal je Spieler | `wahlProSpieler` |
| ST03 | Tiefeneingang | `kampf3` | 2 Schwer je Spieler | `subdeck`, deckId `RL` (Relikt) |

Welche Variante auf einem Brett aktiv ist, stellt man ganz normal über den
schon vorhandenen Dialog **„Startplättchen wählen"** (Bauen › Brett) ein —
der listet ohnehin alle Plättchen zur Auswahl, ST02/ST03 mussten dafür nicht
extra verdrahtet werden. Gedacht für Kampagnen mit mehreren Leveln/Brettern
(Level 1 → ST01, Level 2 → ST02, Level 3 → ST03), aber technisch unabhängig
einsetzbar auf jedem Brett.

Weil das Startfeld nie über `waehlen()` platziert wird (es liegt von Anfang an
auf dem Brett), triggert `neuerLaufAus()` das „Bestanden"-Gate direkt beim
Lauf-Start, nicht erst beim Betreten — inklusive Scharmützel-Zähler auf 1 von
Anfang an. `istKampf()` erkennt alle drei Start-Varianten automatisch über
ihre `kampf1`/`kampf2`/`kampf3`-Art, kein Sonderfall im Code nötig.

**Von den ursprünglich 18 v1.2-Mob-Plättchen sind nur noch `KA02/04/06/13`
übrig** (Danys Vorgabe) — die 14 übrigen (`KA01/03/05/07–12/14–18`) hatten nie
ein `belohnung`-Feld und sind raus. `KA19–26` sind die restlichen
Mob-Tier-Plättchen aus v1.4/v1.5 mit den dortigen Namen — zusammen mit
KA02/04/06/13 exakt die 12 aus der „Kampf 1 · Mob"-Tabelle. `KA27–34` (Normal),
`KA35–40` (Schwer, `KA40` Sackgasse) und `KA41–43` (Elite) sind komplett neu.
Alle neuen (27–43) haben `v:"B"` — erscheinen also nur im vollen Pool
(Stufe 2 / Labyrinth bzw. eine Kampagne mit entsprechender Freischaltung),
nicht in der kleinen Stufe 1.

**Eine Namenskollision aus dem Quelldokument bewusst mitgenommen, nicht
stillschweigend korrigiert:** `RA08` „Wetterloch" (Rast) vs. `KA25`
„Wetterloch (Kampf)" — Klammerzusatz von Claude, damit beide in der App
unterscheidbar bleiben. Falls das im echten Kartenset auch kollidiert, mit
Dany gegenklären statt hier weiter zu improvisieren. (Die zweite Kollision,
`KA17`/`KA31` „Glutspalte", ist mit der Streichung von `KA17` erledigt.)

`KA40` „Kernschacht" hat laut Doc zusätzlich „**+1 Karte extra je Spieler**"
analog zu `KA15`. **Nicht gebaut** — es gibt keinen belohnung-Modus, der die
Ziehmenge pro Karte erhöht, das bleibt reiner Rückseitentext, am Tisch
auszuführen.

**Immer noch nicht gebaut: „Vorschmiede"** (fest platzierter
Level-1-Abschlusskampf). Die Stats sind inzwischen bekannt (v1.7 §5: 2 Mobs +
1 Normal je Spieler, 1 Modifikator, subdeck zufällig, Typ V), aber die
Platzierungsmechanik ist offen — dritte Boss-artige Sonderrolle neben
Miniboss/Endboss, oder etwas anderes? Nicht gebaut, weil nicht beauftragt,
nicht weil die Daten fehlen. Mit Dany klären, bevor das gebaut wird.

### Shop

Aus `SPIEGELREICH_Plaettchen_App_v1_6_Shop.md`. Zwei Plättchen, `SH01`
„Wanderhändler" (günstig, Typ I) und `SH02` „Tiefenmarkt" (teuer, Typ IV) —
beide `art:"shop"`. Anders als der freie Belohnungs-Draft: **kostet Geld** aus
`spieler.geld`, Preis steigt gestaffelt mit der **eigenen Kartenzahl**
(`sp.karten.length` — Annahme, weil die App keine „Basis-Deckgröße" jenseits der
gesammelten Belohnungskarten kennt; falls im echten Spiel etwas anderes gemeint
ist, mit Dany abgleichen). Preistabelle `SHOP_PREISTABELLE` (`guenstig`/`teuer`,
5 Stufen nach Deckgröße, direkt aus dem Dokument übernommen) und `shopPreis
(stufe, deckgroesse)`.

Zwei neue `belohnung.modus`-Werte, **Codeentscheidung** (Dokument nennt das
explizit offen):

```js
{modus:"kaufSubdeck", deckId}   // SH01: wie "subdeck" (3 aufdecken), aber kostet Geld — 1 Kauf, dann zu
{modus:"kaufAlle"}              // SH02: 1 Karte je aktives proSpieler-Subdeck offen, freie Wahl,
                                 // mehrere Käufe möglich (je eigene Kasse), bis "Fertig"
```

Editor: im Plättchen-Dialog eine neue Auswahl „Shop teuer: je Subdeck 1 Karte…"
plus eine Checkbox „Kaufladen" bei jeder festen Subdeck-Zuweisung, die daraus
`kaufSubdeck` statt `subdeck` macht.

**Kauf-Mechanik (`kaufeBelohnung(kartenId, spielerIndex)`):** Geld ist
**persönlich** — jede Karte im Angebot bekommt einen „Kaufen"-Knopf **je
aktivem Spieler** mit dessen aktuellem Preis, disabled wenn das Geld nicht
reicht. SH01 (kaufSubdeck): nach einem Kauf schließt der Shop automatisch
(`shopSchliessen()`, 1-aus-3-Charakter wie im Dokument), Rest zurück in den
Pool. SH02 (kaufAlle): bleibt offen für weitere Käufe (unterschiedliche
Spieler können unterschiedliche Karten kaufen), bis „Fertig" geklickt wird.
„Nichts kaufen" (SH01) und „Fertig" (SH02) sind derselbe Code-Pfad
(`shopSchliessen()`) — nur das Knopflabel unterscheidet sich.

Relikte (`gemeinsam`) sind über `kaufAlle` ausgeschlossen (gleiche Logik wie
bei `alle`/`wahlProSpieler`), über `kaufSubdeck` mit `deckId:"RL"` aber
technisch möglich, falls das je gebraucht wird.

### „Direkt zum Boss"-Knopf + Malus

Taucht im Spielen-Panel auf, wenn `L.ende` gesetzt ist **und** der Grund nicht
„Endboss erreicht" ist **und** irgendwo auf dem Brett ein `fest`-platziertes
Plättchen mit `art:"boss"` liegt (`bossZiel()` — findet aktuell `EB01`, weil
das laut `saatBretter()` von Lauf-Start an als feste Zelle auf dem Brett liegt,
nur eben ggf. unerreichbar). Klick (`direktZumBoss()`) springt dorthin, setzt
`L.bossMalus = true` und ruft `pruefeEnde()` — die Endboss-Meldung bekommt dann
den Zusatz „Malus: zieht 1 Handkarte weniger zu Kampfbeginn." **Reiner
Text-Reminder**, keine Handkarten-Simulation — die App führt keine Kämpfe.
**Entscheidung ohne Regelgrundlage** (Claude, umwerfbar): der Malus ist
pauschal fürs ganze Team, nicht pro Spieler wählbar.

---

## Datenmodell (Gesamtüberblick)

```js
plaettchen = { id, name, art, ausgaenge:[10,12,2], v:"A"|"B", rueck, belohnung? }
// art: Schlüssel in S.arten (erweiterbar, s. o.)
// belohnung: null | {modus:"alle"|"wahlProSpieler"|"kaufAlle"}
//          | {modus:"subdeck"|"kaufSubdeck", deckId}

brett = { id, name, breite, hoehe, zellen, gridfarbe? }
zellen["q,r"] = { rolle: "frei" | "start" | "fest" | "ziel", plaettchen? }
// "ziel": Levelziel, fest zugewiesenes Kampf/Elite/Boss-Plättchen, s. Levelende

stufe = { id, name, brettId, sack:[ids], sackgroesse, zieh, notiz }

kampagne = { id, name, level:[{brettId, sackgroesse, zieh, notiz}], freischaltung, fortschritt? }

belohnungsdeck = { id, name, farbe, modus:"proSpieler"|"gemeinsam", karten:[...], aktiv? }

lauf = {
  quelle,                              // {typ:"stufe",id} | {typ:"kampagne",kid,lvl}
  brettId, brett, pos, sack, ablage, angebot, scharmuetzel, ende, log,
  bestehenAusstehend,                  // belohnung-Config (oder {} ohne Kartenbelohnung), wartet auf "Bestanden"
  bestehenTileId,                      // welches Plättchen das Gate geöffnet hat, für Gold/Tier bei Bestätigung
  belohnung,                           // aktiver Draft-/Kauf-Zustand, s. Belohnungen/Shop
  zielAusstehend,                      // {relikte, grund} | null — Levelende wartet auf "Bestanden"
  zielMalus,                           // true nach "Direkt zum Ziel"/"Direkt zum Boss", s. Levelende
  sieg,                                // true: Sieg-Overlay zeigen (Stufe/letztes Kampagnen-Level)
  kampagnenWahlAusstehend,             // {kid, aktLevel, naechstesLevel} | null, s. Levelende
}
brett["q,r"] = { id, von, fest? }

S.spieler = [{ name, lp, geld, marker, karten:[belohnungsKartenId] }]  // fix 4 Slots
S.arten = [{ id, name, farbe, symbol }]
S.belohnungsPools = { deckId: [kartenId, ...] }   // persistent, nicht am lauf — s. Belohnungen › Zieh-Logik
S.beute = [kartenId, ...]                         // gemeinsame Relikt-Beute, ebenfalls persistent
```

Die Saatdaten in `saatPlaettchen()` sind Stand **v1.7** (70 Plättchen, nach
Danys Streichung der 14 unverdrahteten v1.2-Mob-Plättchen):
29 Kampf (12 Mob-Tier, davon nur noch 4 aus v1.2 — s. u. — + 8 Normal + 6
Schwer + 3 Elite), 9 Rast, 12 Ereignis, 5 Besonderes Ereignis, 5 Aufwertung,
3 Schrein, 2 Shop, dazu MB01 Tatara-Ofen, EB01 Die Esse. `ST01`/`ST02`/`ST03`
(die drei Eingang-Varianten, s. Kampf-Tiers) zählen technisch als 30./31./32.
Kampf-Plättchen mit `art:"kampf1"/"kampf2"/"kampf3"` — bleiben aber weiterhin
Startfelder (`rolle:"start"` auf dem Brett), keine eigene Art mehr dafür.

**Bekannter Widerspruch in v1.2:** Abschnitt 1 nennt für die ursprünglich 24
A-Plättchen 13×I / 6×II / 5×III, die Tabellen ergeben aber 14 / 5 / 5. Betraf
`KA01–18` — seit der Streichung auf 2026-08-29 nur noch von historischem
Interesse, da nur noch `KA02/04/06/13` aus diesem Bereich existieren.

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
- **Bauen › Brett** — Feldeditor, fünf Pinsel (an/aus/Start/Festes Plättchen/
  Ziel), Formknöpfe, Bühnenhintergrund und Gridfarbe.
- **Bauen › Plättchen** — jedes Plättchen änderbar, Grafik je Plättchen, neue
  Arten anlegbar, Belohnungs-Auslöser (aus/alle/frei/bestimmtes Subdeck/Shop
  teuer, plus „Kaufladen"-Checkbox bei fester Subdeck-Zuweisung fürs teure/
  günstige Shop-Paar). Sammelimport ordnet über den Dateinamen zu: `KA01.png` → KA01.
  Zusätzlich „Gleiches Bild für alle Plättchen einer Art" (`grafikFuerArtSetzen()`)
  — ein Bild auf einen Schlag für z. B. alle 44 Kampf-Plättchen, als Platzhalter
  solange die echten Einzelgrafiken fehlen.
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

Letzter Stand, 300 Läufe je Stufe (nach v1.6: Kampf-Tiers + Shop, von Claude
laufen lassen):

| | Stufe 1 · Netz | Stufe 2 · Labyrinth |
|---|---|---|
| Felder belegt Ø | 14,8 | 11,0 |
| Scharmützel Ø | 8,6 | 5,9 |
| Endboss erreicht | 53 / 300 | 13 / 300 |
| Sackgassen / Rückläufe | 0 / 524 | 174 / 1049 |
| Regelfehler | 0 | 0 |

Scharmützel-Ø liegt jetzt höher als vorher, weil das Startfeld selbst ein
Kampf ist und von Anfang an mitzählt.

**Das Belohnungssystem inkl. Shop wird jetzt mitgeprüft.** `resolveBelohnung()`
im Harness löst `bestehenAusstehend`/`belohnung` automatisch auf: normaler
Draft zufällig, `wahlProSpieler`-Deckwahl zufällig, und für `kauf`-Belohnungen
(Shop) kauft der Zufallsspieler testweise, wenn das Geld reicht — die
Test-Spieler bekommen dafür im Harness pauschal 999 Geld (rein fürs Testen,
keine echte Balance-Aussage), sonst würde der Kaufpfad nie ausgelöst. Ohne
diese Erweiterung hätte `sim.mjs` seit dem `belohnung`-Feld an den
Kampf-1-/Schrein-Plättchen sonst beim ersten Treffer gehangen.

---

## Nicht geprüft

Vieles wurde diese Runde per Browser-Automatisierung getestet (Tablet- und
Desktop-Breite, Tap-Interaktion, Undo, Kampagnen-Start, Belohnungs-Draft in
allen drei Modi). Weiterhin offen:

- **Echtes Gerät (iPad/Android).** Alles bisherige lief in einer
  Sandbox-Vorschau mit emulierten Viewports, nie auf echter Hardware. Speziell
  offen: ob `file://`-Öffnen (z. B. aus Dropbox heraus) auf iOS Safari
  IndexedDB zuverlässig genug erlaubt, um dauerhaft zu speichern — bekanntes
  Risikofeld, siehe „Wichtig beim lokalen Testen" oben. Verlässlicher wäre der
  Weg über GitHub Pages (schon eingerichtet, aber Stand vor dieser Session —
  bräuchte einen `git push`, um aktuell zu sein).
- **Export/Import-Roundtrip jetzt verifiziert** (2026-08-29): echte
  `exportieren()`-Ausgabe (inkl. `belohnungsPools`, `beute`, eingebettete
  Art-Bilder) per `importieren()` wieder eingelesen, Plättchenzahl/Vorrat/
  Bild-URLs stimmten danach exakt mit dem Ausgangszustand überein. Geprüft war
  nur die Programmlogik (Datei-Objekt im Browser konstruiert) — nicht der
  tatsächliche Transport übers Dateisystem eines zweiten Geräts (Dropbox/
  AirDrop o. Ä.).
- Sammelimport für Plättchen-Grafiken (Mehrfachauswahl) im Speziellen.
- Service-Worker-Verhalten (Offline-Cache) auf einem echten Browser.
- Shop, Subdecks-Toggle und „Direkt zum Boss" wurden diese Runde per
  Browser-Automatisierung + direkten Funktionsaufrufen geprüft (Kauf,
  Mehrfachkauf bei `kaufAlle`, Pool-Rückgabe bei „Fertig"/„Nichts kaufen",
  Deaktivieren-Checkbox) — nicht aber über echte Klicks auf jeden einzelnen
  neuen UI-Knopf durchgeklickt. Grundsätzlich funktionsfähig, aber noch nicht
  am Tisch/mit echten Spielerzahlen gegengeprüft.

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
- „Vorschmiede" (fest platzierter Level-1-Abschlusskampf) ist nicht gebaut —
  Stats sind inzwischen bekannt (v1.7), Platzierungsmechanik noch offen.
  Siehe Kampf-Tiers.
- Zwei Namenskollisionen von Claude mit Klammerzusatz entschärft (`KA17`/`KA31`
  „Glutspalte", `RA08`/`KA25` „Wetterloch") — im echten Kartenset ggf. auch
  anpassen, falls die Namen von dort stammen.

**Am Werkzeug:**

- Grafiken für die Wegplättchen fehlen noch komplett (Belohnungs-Subdecks haben
  jetzt Bildunterstützung, die Plättchen selbst weiterhin nicht befüllt).
- Die Bretter Raster und Sanduhr sind geraten. Die echten Layouts aus dem
  Plättchendokument sind nicht eingepflegt.
- Shop-Preise sind nach „eigener Kartenzahl" (`sp.karten.length`) gestaffelt,
  weil die App keine „Basis-Deckgröße" kennt — falls das echte Spiel etwas
  anderes mit „Deckgröße" meint, muss `shopPreis()` umgestellt werden.

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

**Plättchen-Updates seit v1.2**, alle als Ergänzungsdokumente, jedes ändert nur
sein Thema, der Rest bleibt wie zuvor:

- `SPIEGELREICH_Plaettchen_App_v1_4_Ergaenzung.md` — Kampf-1-Pool revidiert,
  Aufwertung (neu), Schrein (konkretisiert), Ereignis/Besonderes Ereignis ohne
  Ereigniskarten-Bezug (Wirkung direkt aufgedruckt statt „Ziehe 1 Ereigniskarte").
- `SPIEGELREICH_Plaettchen_App_v1_5_Kampftexte.md` — GEGNER/MODIFIKATOREN/
  BELOHNUNG-Tabellen für alle Kampf-Tiers (Mob/Normal/Schwer/Elite).
- `SPIEGELREICH_Plaettchen_App_v1_6_Shop.md` — SH01/SH02, Preistabelle nach
  Deckgröße gestaffelt (aus `AENDERUNGEN_seit_v1_1.md` §11 übernommen).
- `SPIEGELREICH_Plaettchen_App_v1_7_Gesamt_1.md` — führt v1.4/v1.5/v1.6
  zusammen, dazu **jetzt bekannt, aber noch nicht eingepflegt:** vollständige
  Vorschmiede-Stats (2 Mobs + 1 Normal je Spieler, 1 Modifikator, subdeck
  zufällig, Typ V, „Hauptpfad ~6 Felder davor") und eine komplette
  Freischaltungs-Tabelle je Level (§13) für eine Kampagne mit 3 Leveln. Beides
  nicht gebaut, weil nicht explizit beauftragt — bei Bedarf ansprechen.

Referenziert, aber nicht vorgelegen: `SPIEGELREICH_Plaettchen_App_v1_3_Vorschlag.md`
(v1.4 baut darauf auf). Falls das noch auftaucht, gegen die App-Annahmen in
diesem Dokument prüfen.
