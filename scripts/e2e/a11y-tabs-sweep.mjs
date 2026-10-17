// axe-core (alle Regeln) über jeden Reiter/Modus einzeln: je Werkzeug-Dialog, Labs-Dialog, Prüfungstrainer und Priorisiertes Lernen.
// Voraussetzung: Dev-Server (Audit-Hooks aktiv), Edge installiert. Port über BASE_URL (Standard http://localhost:5000).
//   node scripts/e2e/a11y-tabs-sweep.mjs [1440|390] [dark|light]     (ohne Angaben: alle Kombinationen)
//   Umgebung: ONLY=<Teil des Ansichtsnamens>
// Reiter werden heuristisch gefunden: sichtbare Schaltflächen im oberen Bereich des Dialogs (ohne Schließen/Export).
// Jeder Reiter wird aus frischem Zustand geöffnet (Dialog neu öffnen, dann klicken). Ausgabe: .local/a11y-tabs.json
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const root = process.cwd();
const axeSource = fs.readFileSync(path.join(root, "node_modules", "axe-core", "axe.min.js"), "utf8");

const widths = process.argv[2] ? [Number(process.argv[2])] : [1440, 390];
const themes = process.argv[3] ? [process.argv[3]] : ["dark", "light"];

const TOOLS = [
  ["subnetting-drill", "Subnetting-Drill"], ["routing-drill", "Routing-Drill"], ["ospf-wildcard-drill", "OSPF-Wildcard-Drill"],
  ["acl-drill", "ACL-Drill"], ["subnetting-quiz", "Subnetting-Quiz"], ["subnetting-cheatsheet", "Subnetting-Cheatsheet"],
  ["ipv4-subnet-table", "IPv4-Subnetztabelle"], ["ipv6-calculator", "IPv6-Rechner"], ["vlan-simulator", "VLAN-Simulator"],
  ["stp-simulator", "STP-Simulator"], ["osi-simulator", "OSI-Simulator"], ["routing-simulator", "Routing-Simulator"],
  ["verkabelung-trainer", "Verkabelungs-Trainer"], ["dragdrop-trainer", "Drag-and-Drop-Trainer"],
  ["topologie-explorer", "Topologie-Erkunder"], ["cli-glossary", "CLI-Glossar"],
];

// Beschriftungen, die nicht angeklickt werden (Schließen, Export/Download, Navigation aus dem Dialog heraus)
const SKIP = /^(schließen|close|png|svg|handout|pdf|drucken|download|export|pt-export|alle befehle|topologie im canvas|zurück zur|konto|anmelden|abmelden)/i;

const VIEWS = [
  ...TOOLS.map(([id, label]) => ({ name: `Werkzeug: ${label}`, open: async (page) => { await page.evaluate(() => window.__auditApp.openTool(null)); await page.waitForTimeout(350); await page.evaluate((t) => window.__auditApp.openTool(t), id); await page.waitForSelector('[role="dialog"]', { timeout: 5000 }); await page.waitForTimeout(400); } })),
  { name: "Labs-Dialog (Liste)", open: async (page) => { await page.evaluate(() => window.__auditApp.closeDialogs()); await page.waitForTimeout(350); await page.evaluate(() => window.__auditApp.openDialog("labs")); await page.waitForTimeout(600); } },
  { name: "Prüfungstrainer: Menü", open: async (page) => { await page.evaluate(() => window.__auditApp.closeDialogs()); await page.waitForTimeout(350); await page.evaluate(() => window.__auditApp.openDialog("exam")); await page.waitForFunction(() => !!window.__examPrepState); await page.waitForTimeout(300); } },
  { name: "Priorisiertes Lernen: Menü", open: async (page) => { await page.evaluate(() => window.__auditApp.closeDialogs()); await page.waitForTimeout(350); await page.evaluate(() => window.__auditApp.openDialog("prioritized")); await page.waitForFunction(() => !!window.__prioritizedLearningState); await page.waitForTimeout(300); } },
];

const only = process.env.ONLY;

// Kandidaten für Reiter/Modi: sichtbare Schaltflächen im oberen Dialogbereich (Beschriftung und Index in der Liste)
const candidates = (page) =>
  page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return [];
    const top = dlg.getBoundingClientRect().top;
    const seen = new Set();
    const out = [];
    [...dlg.querySelectorAll('button, [role="tab"]')].forEach((b, idx) => {
      const r = b.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.top - top > 300 || r.top < 0 || b.disabled) return;
      const label = (b.getAttribute("aria-label") || b.textContent || "").replace(/\u00ad/g, "").replace(/\s+/g, " ").trim();
      if (!label || label.length > 60 || seen.has(label)) return;
      seen.add(label);
      out.push({ label, idx });
    });
    return out;
  });
const clickCandidate = (page, idx) => page.evaluate((i) => { const dlg = document.querySelector('[role="dialog"]'); [...dlg.querySelectorAll('button, [role="tab"]')][i].click(); }, idx);

const runAxe = (page) =>
  page.evaluate(async () => {
    const res = await window.axe.run(document, { resultTypes: ["violations"] });
    return res.violations.map((x) => ({
      id: x.id,
      impact: x.impact,
      count: x.nodes.length,
      samples: x.nodes.slice(0, 3).map((n) => ({ target: n.target.join(" ").slice(0, 120), html: n.html.replace(/\s+/g, " ").slice(0, 110), message: (n.any[0]?.message ?? n.all[0]?.message ?? "").slice(0, 140) })),
    }));
  });

const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
const results = [];

for (const width of widths) {
  for (const theme of themes) {
    for (const view of VIEWS.filter((v) => !only || v.name.includes(only))) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
      const page = await context.newPage();
      const base = { view: view.name, width, theme };
      try {
        await page.goto(BASE_URL);
        await page.waitForLoadState("networkidle");
        await page.evaluate((t) => { localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true"); localStorage.setItem("canvas-theme", t); }, theme);
        await page.evaluate((t) => window.__auditApp?.setTheme(t), theme);
        await page.waitForTimeout(200);
        await view.open(page);
        await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
        await page.evaluate(axeSource);
        const rawLabels = (await candidates(page)).map((c) => c); if (process.env.DEBUG) console.log("Kandidaten:", JSON.stringify(rawLabels), await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length)); const labels = rawLabels.filter((c) => !SKIP.test(c.label));
        // Standardzustand und jeder Reiter einzeln
        const states = [{ state: "Standard", label: null }, ...labels.map((c) => ({ state: `Reiter „${c.label.slice(0, 40)}“`, label: c.label, idx: c.idx }))];
        for (const s of states) {
          const entry = { ...base, state: s.state, violations: [], error: null };
          try {
            if (s.label) {
              await view.open(page);
              await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
              await clickCandidate(page, s.idx);
              await page.waitForTimeout(350);
            }
            entry.violations = await runAxe(page);
          } catch (e) {
            entry.error = String(e.message).split("\n")[0].slice(0, 140);
            // Seite bleibt benutzbar? sonst neu aufbauen
          }
          results.push(entry);
          const label = `${view.name} · ${s.state} · ${width}px ${theme}`;
          console.log(entry.error ? `FEHL ${label}: ${entry.error}` : entry.violations.length ? `FAIL ${label}: ${entry.violations.map((v) => `${v.id}×${v.count}`).join(", ")}` : `OK   ${label}`);
        }
      } catch (e) {
        results.push({ ...base, state: "Fehler", violations: [], error: String(e.message).split("\n")[0].slice(0, 140) });
        console.log(`FEHL ${view.name} · ${width}px ${theme}: ${String(e.message).split("\n")[0].slice(0, 120)}`);
      }
      await context.close();
    }
  }
}
await browser.close();
fs.mkdirSync(path.join(root, ".local"), { recursive: true });
fs.writeFileSync(path.join(root, ".local", "a11y-tabs.json"), JSON.stringify(results, null, 1));
const bad = results.filter((r) => r.error || r.violations.length);
console.log(`\n${results.length - bad.length}/${results.length} Zustände ohne Verstöße`);
