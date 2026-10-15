// axe-core (inkl. Farbkontrast) über alle Fragen mit Exhibit in Prüfungstrainer und Quiz/Priorisiertes Lernen.
// Voraussetzung: Dev-Server auf Port 5000 (npm run dev; Audit-Hooks aktiv), Edge installiert.
//   node scripts/e2e/exhibit-axe.mjs [1440|390] [dark|light] [exam|quiz]   (ohne Angaben: alle Kombinationen)
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const root = process.cwd();
const axeSource = fs.readFileSync(path.join(root, "node_modules", "axe-core", "axe.min.js"), "utf8");

const widths = process.argv[2] ? [Number(process.argv[2])] : [1440, 390];
const themes = process.argv[3] ? [process.argv[3]] : ["dark", "light"];
const dialogs = process.argv[4] ? [process.argv[4]] : ["exam", "quiz"];

const hasExhibit = (e) => {
  if (!e || e === true) return false;
  const list = Array.isArray(e) ? e : [e];
  return list.some((x) => x && x.type && x.type !== "none");
};

const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
const summary = [];
let failed = false;

for (const width of widths) {
  for (const theme of themes) {
    for (const dialog of dialogs) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
      const page = await context.newPage();
      await page.goto(BASE_URL);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true"));
      await page.evaluate((t) => window.__auditApp?.setTheme(t), theme);
      await page.waitForTimeout(150);
      await page.evaluate(() => window.__auditApp.closeDialogs());
      if (dialog === "exam") {
        await page.evaluate(() => window.__auditApp.openDialog("exam"));
        await page.waitForFunction(() => !!window.__examPrepState);
        await page.evaluate(() => {
          window.__AUDIT_NO_SHUFFLE__ = true;
          window.__examPrepState.startLearn();
        });
        await page.waitForFunction(() => window.__examPrepState.getQuestions().length > 0);
      } else {
        await page.evaluate(() => window.__auditApp.openDialog("prioritized"));
        await page.waitForFunction(() => !!window.__prioritizedLearningState);
        await page.evaluate(() => window.__prioritizedLearningState.startAll());
        await page.waitForFunction(() => !!window.__quizDialogState);
      }
      const questions = await page.evaluate((d) => (d === "exam" ? window.__examPrepState.getQuestions() : window.__quizDialogState.getQuestions()).map((q, i) => ({ i, id: q.id, exhibit: q.exhibit })), dialog);
      const withExhibit = questions.filter((q) => hasExhibit(q.exhibit));
      await page.evaluate(axeSource);
      // Übergänge abschalten: axe darf keine halb eingeblendeten Zustände messen
      await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });

      const byRule = new Map();
      let n = 0;
      for (const q of withExhibit) {
        await page.evaluate(([d, i]) => (d === "exam" ? window.__examPrepState.setQIndex(i) : window.__quizDialogState.setIndex(i)), [dialog, q.i]);
        await page.waitForTimeout(60);
        const v = await page.evaluate(async () => {
          const res = await window.axe.run(document, { resultTypes: ["violations"] });
          return res.violations.map((x) => ({ id: x.id, count: x.nodes.length, target: x.nodes[0].target.join(" "), detail: (x.nodes[0].any[0]?.message ?? "").slice(0, 160) + " | " + x.nodes[0].html.slice(0, 90) }));
        });
        for (const x of v) {
          const e = byRule.get(x.id) ?? { ids: [], nodes: 0, target: x.target, detail: x.detail };
          e.ids.push(q.id);
          e.nodes += x.count;
          byRule.set(x.id, e);
        }
        n++;
        if (n % 100 === 0) console.log(`  ${dialog} ${width} ${theme}: ${n}/${withExhibit.length}`);
      }
      const rules = [...byRule.entries()].map(([id, e]) => `${id}×${e.ids.length} Fragen (${e.target}; z. B. ${e.ids.slice(0, 5).join(", ")}) [${e.detail}]`);
      const ok = byRule.size === 0;
      if (!ok) failed = true;
      const line = `${ok ? "OK  " : "FAIL"} axe ${dialog === "exam" ? "Prüfungstrainer" : "Quiz"} ${width}px ${theme}: ${withExhibit.length} Fragen mit Exhibit geprüft — ${ok ? "0 Violations inkl. color-contrast" : rules.join("; ")}`;
      console.log(line);
      summary.push({ dialog, width, theme, questions: withExhibit.length, ok, rules });
      await context.close();
    }
  }
}
await browser.close();
fs.mkdirSync(path.join(root, ".local"), { recursive: true });
fs.writeFileSync(path.join(root, ".local", "exhibit-axe.json"), JSON.stringify(summary, null, 1));
console.log(`\n${summary.filter((s) => s.ok).length}/${summary.length} Kombinationen ohne Verstöße`);
if (failed) process.exitCode = 1;
