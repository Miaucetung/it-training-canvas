// axe-core (inkl. Farbkontrast) über alle Hauptansichten und Dialoge der App.
// Voraussetzung: Dev-Server auf Port 5000 (npm run dev; Audit-Hooks aktiv), Edge installiert.
//   node scripts/e2e/a11y-sweep.mjs [1440|390] [dark|light]    (ohne Angaben: alle Kombinationen)
// Ausgabe: Liste je Ansicht auf der Konsole und .local/a11y-sweep.json
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
  ["subnetting-drill", "Subnetting-Drill"],
  ["routing-drill", "Routing-Drill"],
  ["ospf-wildcard-drill", "OSPF-Wildcard-Drill"],
  ["acl-drill", "ACL-Drill"],
  ["subnetting-quiz", "Subnetting-Quiz"],
  ["subnetting-cheatsheet", "Subnetting-Cheatsheet"],
  ["ipv4-subnet-table", "IPv4-Subnetztabelle"],
  ["ipv6-calculator", "IPv6-Rechner"],
  ["vlan-simulator", "VLAN-Simulator"],
  ["stp-simulator", "STP-Simulator"],
  ["osi-simulator", "OSI-Simulator"],
  ["routing-simulator", "Routing-Simulator"],
  ["verkabelung-trainer", "Verkabelungs-Trainer"],
  ["dragdrop-trainer", "Drag-and-Drop-Trainer"],
  ["topologie-explorer", "Topologie-Erkunder"],
  ["cli-glossary", "CLI-Glossar"],
];

const examPrepare = async (page) => {
  await page.evaluate(() => window.__auditApp.openDialog("exam"));
  await page.waitForFunction(() => !!window.__examPrepState);
  await page.waitForTimeout(300);
};

const VIEWS = [
  { name: "Dashboard", area: "App", open: async () => {} },
  { name: "Header: Lernen-Menü", area: "App", open: async (page) => { const b = page.getByRole("button", { name: /Lernen/ }).first(); if (await b.isVisible()) { await b.click(); await page.waitForTimeout(300); } } },
  { name: "Header: Navigation/Werkzeuge-Menü", area: "App", open: async (page) => { const b = page.getByRole("button", { name: /Menü: Navigation und Werkzeuge/ }).first(); if (await b.isVisible()) { await b.click(); await page.waitForTimeout(400); } } },
  { name: "Lektion", area: "Lektion", open: async (page) => { await page.getByRole("button", { name: /Jetzt starten|Weiterlernen/ }).first().click(); await page.waitForTimeout(900); } },
  { name: "Prüfungstrainer: Menü", area: "Trainer", open: examPrepare },
  {
    name: "Prüfungstrainer: Frage mit Grafik (Lernmodus)",
    area: "Trainer",
    open: async (page) => {
      await examPrepare(page);
      await page.evaluate(() => { window.__AUDIT_NO_SHUFFLE__ = true; window.__examPrepState.startLearn(); });
      await page.waitForFunction(() => window.__examPrepState.getQuestions().length > 0);
      const i = await page.evaluate(() => window.__examPrepState.getQuestions().findIndex((q) => q.id === "q0109"));
      await page.evaluate((n) => window.__examPrepState.setQIndex(n), i);
      await page.waitForTimeout(250);
    },
  },
  {
    name: "Prüfungstrainer: Ergebnis (Prüfungsmodus)",
    area: "Trainer",
    open: async (page) => {
      await examPrepare(page);
      await page.getByText("Prüfungsmodus").click();
      await page.waitForTimeout(200);
      const total = await page.evaluate(() => window.__examPrepState.getQuestions().length);
      await page.evaluate((n) => window.__examPrepState.setQIndex(n - 1), total);
      await page.waitForTimeout(150);
      await page.getByText("Auswertung").first().click();
      await page.waitForTimeout(300);
    },
  },
  { name: "Priorisiertes Lernen: Menü", area: "Trainer", open: async (page) => { await page.evaluate(() => window.__auditApp.openDialog("prioritized")); await page.waitForFunction(() => !!window.__prioritizedLearningState); await page.waitForTimeout(300); } },
  {
    name: "Priorisiertes Lernen: Quiz-Frage",
    area: "Trainer",
    open: async (page) => {
      await page.evaluate(() => window.__auditApp.openDialog("prioritized"));
      await page.waitForFunction(() => !!window.__prioritizedLearningState);
      await page.evaluate(() => window.__prioritizedLearningState.startAll());
      await page.waitForFunction(() => !!window.__quizDialogState);
      await page.waitForTimeout(300);
    },
  },
  ...TOOLS.map(([id, label]) => ({ name: `Werkzeug: ${label}`, area: "Werkzeuge/Simulatoren", open: async (page) => { await page.evaluate((t) => window.__auditApp.openTool(t), id); await page.waitForTimeout(600); } })),
  { name: "Labs-Dialog (Liste)", area: "Labs", open: async (page) => { await page.evaluate(() => window.__auditApp.openDialog("labs")); await page.waitForTimeout(700); } },
  {
    name: "Labs-Dialog (Lab geöffnet)",
    area: "Labs",
    open: async (page) => {
      await page.evaluate(() => window.__auditApp.openDialog("labs"));
      await page.waitForTimeout(600);
      const target = page.getByText("OSPF — Single Area 0").first();
      if (!(await target.isVisible())) {
        await page.getByRole("button", { name: /Lab-Katalog/ }).first().click();
        await page.waitForTimeout(300);
      }
      await target.click();
      await page.waitForTimeout(800);
    },
  },
  { name: "Canvas v1", area: "Canvas", open: async (page) => { await page.getByRole("button", { name: "Zum Canvas wechseln" }).click(); await page.waitForTimeout(1200); } },
  {
    name: "Canvas v2",
    area: "Canvas v2 (nur auflisten)",
    open: async (page) => {
      await page.evaluate(() => localStorage.setItem("ccna-canvas-version", JSON.stringify("v2")));
      await page.reload({ waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Zum Canvas wechseln" }).click();
      await page.waitForTimeout(1500);
    },
  },
];

const only = process.env.ONLY;
const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
const results = [];

for (const width of widths) {
  for (const theme of themes) {
    for (const view of VIEWS.filter((v) => !only || v.name.includes(only))) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
      const page = await context.newPage();
      const entry = { view: view.name, area: view.area, width, theme, violations: [], error: null };
      try {
        await page.goto(BASE_URL);
        await page.waitForLoadState("networkidle");
        await page.evaluate((t) => {
          localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
          localStorage.setItem("canvas-theme", t);
        }, theme);
        await page.evaluate((t) => window.__auditApp?.setTheme(t), theme);
        await page.waitForTimeout(150);
        await view.open(page);
        await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
        await page.waitForTimeout(100);
        await page.evaluate(axeSource);
        entry.violations = await page.evaluate(async () => {
          const res = await window.axe.run(document, { resultTypes: ["violations"] });
          return res.violations.map((x) => ({
            id: x.id,
            impact: x.impact,
            count: x.nodes.length,
            samples: x.nodes.slice(0, 3).map((n) => ({ target: n.target.join(" ").slice(0, 120), html: n.html.replace(/\s+/g, " ").slice(0, 110), message: (n.any[0]?.message ?? n.all[0]?.message ?? "").slice(0, 140) })),
          }));
        });
      } catch (e) {
        entry.error = String(e.message).split("\n")[0].slice(0, 160);
      }
      results.push(entry);
      const label = `${view.name} · ${width}px ${theme}`;
      console.log(entry.error ? `FEHL ${label}: ${entry.error}` : entry.violations.length ? `FAIL ${label}: ${entry.violations.map((v) => `${v.id}×${v.count}`).join(", ")}` : `OK   ${label}`);
      await context.close();
    }
  }
}
await browser.close();
fs.mkdirSync(path.join(root, ".local"), { recursive: true });
fs.writeFileSync(path.join(root, ".local", "a11y-sweep.json"), JSON.stringify(results, null, 1));
const bad = results.filter((r) => r.error || r.violations.length);
console.log(`\n${results.length - bad.length}/${results.length} Ansichten ohne Verstöße`);
