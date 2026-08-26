#!/usr/bin/env node
/* ============================================================
   sim.mjs — Regelsimulation für spiegelreich_pfad.html
   Braucht keinen Browser. Schneidet die Logik aus der HTML-Datei
   heraus, hängt einen Zufallsspieler an und lässt ihn N Läufe machen.

   Aufruf:  node sim.mjs [Anzahl Läufe je Stufe]
   Beispiel: node sim.mjs 500

   Prüft nach jedem Lauf:
   - liegt ein Plättchen außerhalb des Bretts?          -> Regelfehler
   - ist eine Eingangskante nicht 4, 6 oder 8?          -> Regelfehler
   - liegt ein Plättchen doppelt?                       -> Regelfehler
   - passt die Zahl der Plättchen zu Sack und Ablage?   -> Regelfehler
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HIER = dirname(fileURLToPath(import.meta.url));
const DATEI = process.env.SP_HTML || join(HIER, "spiegelreich_pfad.html");
const LAEUFE = Number(process.argv[2]) || 300;

const html = readFileSync(DATEI, "utf-8");
const skripte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!skripte.length) { console.error("Kein <script> in", DATEI); process.exit(1); }
const voll = skripte[skripte.length - 1];

// Alles ab dem Startaufruf abschneiden — der braucht einen Browser.
const schnitt = voll.lastIndexOf("(async function start()");
if (schnitt < 0) { console.error("Startaufruf nicht gefunden. Wurde die Datei umgebaut?"); process.exit(1); }
const kern = voll.slice(0, schnitt);

const harness = `
// --- Ersatz für alles, was einen Browser braucht ---
function render(){} function speichern(){} function meldung(){} 
function zentrieren(){} function zentrierenBrett(){}

const AUSGABE = [];
const log = (...a) => AUSGABE.push(a.join(" "));

const p = saatPlaettchen();
const stufenIds = saatStufen(p, saatBretter()).map(s => s.id);
let gesamtFehler = 0;

for (const stId of stufenIds) {
  const felder = [], scharm = [];
  let boss = 0, fehler = 0, sackgassen = 0, ruecklaeufe = 0;
  const enden = {};

  for (let n = 0; n < ${LAEUFE}; n++) {
    S = { plaettchen: p, bretter: saatBretter(), stufen: null, lauf: null };
    S.stufen = saatStufen(p, S.bretter);
    S.lauf = neuerLauf(stId);
    const startSack = S.lauf.sack.length;
    let schritte = 0;

    while (schritte < 500) {
      const L = S.lauf, hier = key(L.pos[0], L.pos[1]);
      const feld = L.brett[hier]; if (!feld) break;
      const t = byId(feld.id);
      if (L.ende) break;
      if (!t.ausgaenge.length) sackgassen++;

      const lagen = t.ausgaenge.map(k => ({ k, ...kantenLage(k) }));
      const frei = lagen.filter(l => l.lage === "frei");
      const belegt = lagen.filter(l => l.lage === "belegt");

      // Zufallsspieler: geht gelegentlich auf bekannte Felder zurück,
      // damit auch fest gelegte Plättchen wie der Endboss erreichbar sind.
      if (belegt.length && Math.random() < 0.35) { ziehen(belegt[0].k); schritte++; continue; }

      if (!frei.length || !L.sack.length) {
        const z = rueckZiele();
        if (!z.length || !L.sack.length) { L.ende = L.ende || "Sack leer oder kein Ausgang"; break; }
        zurueckLaufen(z[Math.floor(Math.random() * z.length)].k);
        ruecklaeufe++; schritte++; continue;
      }
      ziehen(frei[Math.floor(Math.random() * frei.length)].k);
      if (L.angebot) waehlen(L.angebot.ids[Math.floor(Math.random() * L.angebot.ids.length)]);
      schritte++;
    }

    const L = S.lauf;
    felder.push(Object.keys(L.brett).length);
    scharm.push(L.scharmuetzel);
    if ((L.ende || "").includes("Endboss")) boss++;
    const e = L.ende || "offen"; enden[e] = (enden[e] || 0) + 1;

    // --- Prüfungen ---
    const gelegt = [];
    for (const [k, f] of Object.entries(L.brett)) {
      if (!brettAktiv().zellen[k]) { fehler++; log("FEHLER: außerhalb des Bretts", k); }
      if (f.von != null && ![4,6,8].includes(f.von)) { fehler++; log("FEHLER: Eingangskante", k, f.von); }
      gelegt.push(f.id);
    }
    const doppelt = gelegt.filter((x,i) => gelegt.indexOf(x) !== i);
    if (doppelt.length) { fehler++; log("FEHLER: doppelt gelegt", doppelt.join(",")); }

    // Buchhaltung: gezogene Plättchen = Sack vorher - Sack nachher
    const ausSack = gelegt.filter(id => id !== L.brett[Object.keys(L.brett)[0]].id);
    const bilanz = startSack - L.sack.length - L.ablage.length;
    if (bilanz < 0) { fehler++; log("FEHLER: mehr abgelegt als gezogen"); }
  }

  const m = a => (a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
  const st = S.stufen.find(s => s.id === stId);
  log("");
  log("### " + st.name);
  log("  Felder belegt   Ø " + m(felder) + "   min " + Math.min(...felder) + "   max " + Math.max(...felder));
  log("  Scharmützel     Ø " + m(scharm));
  log("  Endboss         " + boss + " von ${LAEUFE}");
  log("  Sackgassen      " + sackgassen + "   Rückläufe " + ruecklaeufe);
  log("  Enden           " + Object.entries(enden).map(([k,v]) => v + "× " + k).join("  |  "));
  log("  Regelfehler     " + fehler);
  gesamtFehler += fehler;
}

log("");
log(gesamtFehler === 0 ? "Keine Regelfehler." : "ACHTUNG: " + gesamtFehler + " Regelfehler.");
globalThis.__ausgabe = AUSGABE;
globalThis.__fehler = gesamtFehler;
`;

new Function(kern + harness)();
console.log(globalThis.__ausgabe.join("\n"));
process.exit(globalThis.__fehler === 0 ? 0 : 1);
