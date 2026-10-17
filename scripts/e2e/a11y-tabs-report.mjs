// Erzeugt docs/a11y/AXE-TABS.md aus .local/a11y-tabs.json (Ausgabe von scripts/e2e/a11y-tabs-sweep.mjs).
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, ".local", "a11y-tabs.json"), "utf8"));
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/`/g, "'");
const combo = (r) => `${r.width} ${r.theme === "dark" ? "dunkel" : "hell"}`;

const states = new Map();
for (const r of data) {
  const k = `${r.view}\u0000${r.state}`;
  if (!states.has(k)) states.set(k, []);
  states.get(k).push(r);
}
const total = states.size;
const runs = data.length;
const bad = data.filter((r) => !r.error && r.violations.length > 0);
const errors = data.filter((r) => r.error);
const cleanStates = [...states.values()].filter((rs) => rs.every((r) => !r.error && r.violations.length === 0)).length;

const md = [];
md.push("# axe-Lauf über jeden Reiter einzeln (alle Regeln)", "");
md.push("Erzeugt von `scripts/e2e/a11y-tabs-sweep.mjs` und `scripts/e2e/a11y-tabs-report.mjs`. Je Werkzeug-Dialog, Labs-Dialog, Prüfungstrainer-Menü und Priorisiertes Lernen wird jeder gefundene Reiter (role=\"tab\"; in den Drills die Modus-Schalter mit aria-pressed) aus frischem Zustand geöffnet und mit allen axe-Regeln geprüft (1440/390 px, hell/dunkel). Canvas v1 und v2 sind nicht Teil dieses Laufs (siehe `AXE-SWEEP.md`, nur aufgelistet). Es wurde nichts geändert.", "");
md.push(`**${total} Zustände (Ansicht × Reiter) in ${runs} Läufen: ${cleanStates} Zustände in allen vier Kombinationen sauber, ${total - cleanStates} mit Verstößen oder Skriptfehlern${errors.length ? ` (${errors.length} Läufe mit Skriptfehler)` : ""}.**`, "");

// Übersicht je Ansicht
md.push("## Übersicht je Ansicht", "", "| Ansicht | Zustände | davon mit Verstößen |", "|---|---:|---:|");
const views = [...new Set(data.map((r) => r.view))];
for (const v of views) {
  const keys = [...states.keys()].filter((k) => k.startsWith(v + "\u0000"));
  const badKeys = keys.filter((k) => states.get(k).some((r) => r.error || r.violations.length));
  md.push(`| ${esc(v)} | ${keys.length} | ${badKeys.length} |`);
}
md.push("");

// Befunde je Ansicht und Reiter
md.push("## Befunde je Werkzeug und Reiter", "");
let any = false;
for (const v of views) {
  const rows = [];
  for (const k of states.keys()) {
    if (!k.startsWith(v + "\u0000")) continue;
    const state = k.split("\u0000")[1];
    const byRule = new Map();
    for (const r of states.get(k)) {
      if (r.error) continue;
      for (const x of r.violations) {
        const e = byRule.get(x.id) ?? { impact: x.impact, combos: new Set(), max: 0, sample: x.samples[0] };
        e.combos.add(combo(r));
        e.max = Math.max(e.max, x.count);
        byRule.set(x.id, e);
      }
    }
    for (const [id, e] of byRule) rows.push({ state, id, ...e });
  }
  if (!rows.length) continue;
  any = true;
  md.push(`### ${esc(v)}`, "");
  md.push("| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |", "|---|---|---|---|---:|---|");
  for (const r of rows) {
    md.push(`| ${esc(r.state)} | ${r.id} | ${r.impact} | ${[...r.combos].join(", ")} | ${r.max} | \`${esc(r.sample?.target ?? "")}\` — \`${esc(r.sample?.html ?? "")}\` |`);
  }
  md.push("");
}
if (!any) md.push("Keine Verstöße.", "");

// Nach Regel
const rules = new Map();
for (const r of bad) for (const x of r.violations) {
  const e = rules.get(x.id) ?? { impact: x.impact, states: new Set(), nodes: 0 };
  e.states.add(`${r.view} · ${r.state}`);
  e.nodes += x.count;
  rules.set(x.id, e);
}
md.push("## Nach Regel", "", "| Regel | Schwere | Betroffene Zustände | Elemente (Summe über Läufe) |", "|---|---|---:|---:|");
for (const [id, e] of [...rules].sort((a, b) => b[1].states.size - a[1].states.size)) md.push(`| ${id} | ${e.impact} | ${e.states.size} | ${e.nodes} |`);
md.push("");

if (errors.length) {
  md.push("## Skriptfehler (Zustand nicht geprüft)", "");
  const seen = new Set();
  for (const r of errors) {
    const k = `${r.view} · ${r.state}: ${r.error}`;
    if (seen.has(k)) continue;
    seen.add(k);
    md.push(`- ${esc(k)}`);
  }
  md.push("");
}

md.push("## Grenzen des Laufs", "");
md.push("- Reiter werden über role=\"tab\" gefunden. Dialoge ohne Tabs (Drills) werden über ihre Modus-Schalter (button mit aria-pressed) geprüft; Labs, Prüfungstrainer und Priorisiertes Lernen nur im Standardzustand (Labs zusätzlich mit geöffnetem Lab).");
md.push("- Der Vorgängerlauf (`AXE-TABS-VORHER.md`) fand Reiter heuristisch und zählte dabei auch Schaltflächen, die keine Reiter sind; deshalb unterscheidet sich die Zahl der Zustände.");
md.push("- Zustände nach Eingaben (Quiz beantworten, Drill prüfen, Ergebnisbildschirme) sind nicht Teil dieses Laufs.");
md.push("");
fs.mkdirSync(path.join(root, "docs", "a11y"), { recursive: true });
fs.writeFileSync(path.join(root, "docs", "a11y", "AXE-TABS.md"), md.join("\n"), "utf8");
console.log(`docs/a11y/AXE-TABS.md: ${total} Zustände, ${cleanStates} sauber, ${rules.size} Regeln, ${errors.length} Fehlerläufe`);
