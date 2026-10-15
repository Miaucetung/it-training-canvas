// Erzeugt docs/a11y/AXE-SWEEP.md aus .local/a11y-sweep.json (Ausgabe von scripts/e2e/a11y-sweep.mjs).
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, ".local", "a11y-sweep.json"), "utf8"));
const COMBOS = [
  [1440, "dark", "1440 dunkel"],
  [1440, "light", "1440 hell"],
  [390, "dark", "390 dunkel"],
  [390, "light", "390 hell"],
];
const views = [...new Map(data.map((d) => [d.view, d.area])).entries()];
const cell = (d) => (!d ? "–" : d.error ? `Skriptfehler` : d.violations.length === 0 ? "✓" : d.violations.map((v) => `${v.id}×${v.count}`).join(", "));
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/`/g, "'");

const md = [];
md.push("# axe-Lauf über alle Hauptansichten und Dialoge", "");
md.push("Erzeugt von `scripts/e2e/a11y-sweep.mjs` und `scripts/e2e/a11y-sweep-report.mjs` (nur lesend; axe-core mit allen Regeln inkl. Farbkontrast, Dev-Server, Edge). Es wurde nichts geändert; im Canvas-Code (`src/components/canvas-v2/`, `src/lib/topology/`) bleiben Befunde reine Liste.", "");
const total = data.length;
const clean = data.filter((d) => !d.error && d.violations.length === 0).length;
const errors = data.filter((d) => d.error).length;
md.push(`**${total} Läufe (${views.length} Ansichten × 4 Kombinationen): ${clean} ohne Verstöße, ${total - clean - errors} mit Verstößen${errors ? `, ${errors} Skriptfehler` : ""}.**`, "");

md.push("## Ergebnis je Ansicht", "");
md.push(`| Ansicht | Bereich | ${COMBOS.map((c) => c[2]).join(" | ")} |`, `|---|---|${COMBOS.map(() => "---").join("|")}|`);
for (const [view, area] of views) {
  const cells = COMBOS.map(([w, t]) => cell(data.find((d) => d.view === view && d.width === w && d.theme === t)));
  md.push(`| ${esc(view)} | ${esc(area)} | ${cells.map(esc).join(" | ")} |`);
}
md.push("");

// Regeln
const rules = new Map();
for (const d of data) {
  for (const v of d.violations) {
    const r = rules.get(v.id) ?? { id: v.id, impact: v.impact, nodes: 0, runs: 0, views: new Set(), samples: new Map() };
    r.nodes += v.count;
    r.runs += 1;
    r.views.add(d.view);
    for (const s of v.samples) {
      const key = s.target + "|" + s.html;
      if (!r.samples.has(key)) r.samples.set(key, { ...s, view: d.view, area: d.area });
    }
    rules.set(v.id, r);
  }
}
md.push("## Nach Regel", "");
md.push("| Regel | Schwere | Ansichten | Läufe | Elemente |", "|---|---|---:|---:|---:|");
for (const r of [...rules.values()].sort((a, b) => b.views.size - a.views.size)) md.push(`| ${r.id} | ${r.impact} | ${r.views.size} | ${r.runs} | ${r.nodes} |`);
md.push("");
for (const r of [...rules.values()].sort((a, b) => b.views.size - a.views.size)) {
  md.push(`### ${r.id} (${r.impact})`, "");
  md.push(`Betroffene Ansichten (${r.views.size}): ${[...r.views].map(esc).join("; ")}`, "");
  md.push("Beispiele (Selektor, Element, Meldung):", "");
  for (const s of [...r.samples.values()].slice(0, 6)) md.push(`- ${esc(s.view)}: \`${esc(s.target)}\` — \`${esc(s.html)}\` — ${esc(s.message)}`);
  md.push("");
}

// Canvas v2 separat
const c2 = data.filter((d) => d.view === "Canvas v2");
md.push("## Canvas v2 (nur aufgelistet)", "");
for (const d of c2) {
  md.push(`- ${d.width} px ${d.theme === "dark" ? "dunkel" : "hell"}: ${d.error ? "Skriptfehler: " + esc(d.error) : d.violations.length === 0 ? "keine Verstöße" : d.violations.map((v) => `${v.id}×${v.count} (${esc(v.samples[0]?.target ?? "")})`).join("; ")}`);
}
md.push("");
fs.mkdirSync(path.join(root, "docs", "a11y"), { recursive: true });
fs.writeFileSync(path.join(root, "docs", "a11y", "AXE-SWEEP.md"), md.join("\n"), "utf8");
console.log(`docs/a11y/AXE-SWEEP.md: ${total} Läufe, ${clean} sauber, ${rules.size} Regeln`);
