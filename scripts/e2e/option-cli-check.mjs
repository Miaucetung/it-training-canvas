// Prüft die Darstellung von Antwortoptionen mit CLI-Block (Prüfungstrainer und Quiz/Priorisiertes Lernen).
// Voraussetzung: Dev-Server auf Port 5000 (npm run dev), Edge installiert, .local/option-cli-findings.json
// (erzeugt von scripts/audit/option-cli-analysis.audit.ts).
//
//   node scripts/e2e/option-cli-check.mjs shots <vorher|nachher>   Screenshots nach .local/screenshots/option-cli/
//   node scripts/e2e/option-cli-check.mjs check                    Seitenbreite, Scrollen innerhalb der Option, axe
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const root = process.cwd();
const outDir = path.join(root, ".local", "screenshots", "option-cli");
const mode = process.argv[2] || "check";
const label = process.argv[3] || "nachher";

const EXAMPLES = [
  { id: "q0109", title: "Mehrfach-Prompts mit Konfiguration", marker: "R7#" },
  { id: "q0942", title: "show-Ausgabe (Routing-Tabelle)", marker: "Gateway of last resort" },
  { id: "q0014", title: "Konfiguration ohne Prompt", marker: "description to XX-AXXX" },
];
const VIEWS = [
  { name: "1440-dark", width: 1440, height: 900, theme: "dark" },
  { name: "390-light", width: 390, height: 844, theme: "light" },
];

const findings = JSON.parse(fs.readFileSync(path.join(root, ".local", "option-cli-findings.json"), "utf8"));
const blockIds = [...new Set(Object.values(findings.exam.ids).flat())];

async function openPage(browser, view) {
  const context = await browser.newContext({ viewport: { width: view.width, height: view.height } });
  const page = await context.newPage();
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true"));
  await page.evaluate((t) => window.__auditApp?.setTheme(t), view.theme);
  await page.waitForTimeout(150);
  return { context, page };
}

async function openExam(page) {
  await page.evaluate(() => window.__auditApp.closeDialogs());
  await page.evaluate(() => window.__auditApp.openDialog("exam"));
  await page.waitForFunction(() => !!window.__examPrepState);
  await page.evaluate(() => {
    window.__AUDIT_NO_SHUFFLE__ = true;
    window.__examPrepState.startLearn();
  });
  await page.waitForFunction(() => window.__examPrepState.getQuestions().length > 0);
}

async function openQuiz(page) {
  await page.evaluate(() => window.__auditApp.closeDialogs());
  await page.evaluate(() => window.__auditApp.openDialog("prioritized"));
  await page.waitForFunction(() => !!window.__prioritizedLearningState);
  await page.evaluate(() => window.__prioritizedLearningState.startAll());
  await page.waitForFunction(() => !!window.__quizDialogState);
}

const examIndex = (page, id) => page.evaluate((x) => window.__examPrepState.getQuestions().findIndex((q) => q.id === x), id);
const quizIndex = (page, id) => page.evaluate((x) => window.__quizDialogState.getQuestions().findIndex((q) => q.id === x), id);

async function shots(browser) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const view of VIEWS) {
    const { context, page } = await openPage(browser, view);
    await openExam(page);
    for (const ex of EXAMPLES) {
      const idx = await examIndex(page, ex.id);
      await page.evaluate((i) => window.__examPrepState.setQIndex(i), idx);
      await page.waitForTimeout(200);
      const first = page.locator("button", { hasText: ex.marker }).first();
      await first.scrollIntoViewIfNeeded();
      // Fragetext und alle Antwortoptionen (Elternelement der Options-Buttons)
      await first.locator("xpath=..").screenshot({ path: path.join(outDir, `${label}-pruefungstrainer-${ex.id}-${view.name}.png`) });
    }
    // Quiz-Dialog (Priorisiertes Lernen) mit q0109
    await openQuiz(page);
    const qi = await quizIndex(page, "Q0109");
    await page.evaluate((i) => window.__quizDialogState.setIndex(i), qi);
    await page.waitForTimeout(250);
    const qOpt = page.locator("button", { hasText: "R7#" }).first();
    await qOpt.scrollIntoViewIfNeeded();
    await qOpt.locator("xpath=..").screenshot({ path: path.join(outDir, `${label}-quiz-Q0109-${view.name}.png`) });
    await context.close();
  }
  console.log(`Screenshots (${label}) nach ${outDir}`);
}

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
};

async function measure(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const dialog = document.querySelector('[role="dialog"]');
    const blocks = [...document.querySelectorAll("[data-cli-option]")];
    const vw = window.innerWidth;
    return {
      pageOverflow: doc.scrollWidth > vw + 1,
      dialogOverflow: dialog ? dialog.scrollWidth > dialog.clientWidth + 1 : false,
      blocks: blocks.length,
      blocksOutside: blocks.filter((b) => b.getBoundingClientRect().right > vw + 1).length,
      blocksScrolling: blocks.filter((b) => b.scrollWidth > b.clientWidth + 1).length,
    };
  });
}

async function checks(browser) {
  const axeSource = fs.readFileSync(path.join(root, "node_modules", "axe-core", "axe.min.js"), "utf8");
  for (const view of [...VIEWS, { name: "390-dark", width: 390, height: 844, theme: "dark" }, { name: "1440-light", width: 1440, height: 900, theme: "light" }]) {
    const { context, page } = await openPage(browser, view);
    for (const [dialogName, open, indexOf, setIdx, ids] of [
      ["Prüfungstrainer", openExam, examIndex, (p, i) => p.evaluate((n) => window.__examPrepState.setQIndex(n), i), blockIds],
      ["Quiz", openQuiz, quizIndex, (p, i) => p.evaluate((n) => window.__quizDialogState.setIndex(n), i), blockIds.map((x) => x.toUpperCase())],
    ]) {
      await open(page);
      let blocks = 0, scrolling = 0, pageOverflow = 0, dialogOverflow = 0, outside = 0, questions = 0;
      for (const id of ids) {
        const idx = await indexOf(page, id);
        if (idx < 0) continue;
        await setIdx(page, idx);
        await page.waitForTimeout(40);
        const m = await measure(page);
        questions++;
        blocks += m.blocks;
        scrolling += m.blocksScrolling;
        outside += m.blocksOutside;
        if (m.pageOverflow) pageOverflow++;
        if (m.dialogOverflow) dialogOverflow++;
      }
      record(`${dialogName} ${view.name}: ${questions} Fragen, ${blocks} CLI-Optionen: kein horizontales Scrollen der Seite/des Dialogs`, pageOverflow === 0 && dialogOverflow === 0 && outside === 0, `Seite ${pageOverflow}, Dialog ${dialogOverflow}, Block außerhalb ${outside}; ${scrolling} Blöcke scrollen innerhalb`);

      // axe an einer Frage mit breiten Zeilen
      const idx = await indexOf(page, ids[0] === undefined ? "q0109" : dialogName === "Quiz" ? "Q0109" : "q0109");
      await setIdx(page, idx);
      await page.waitForTimeout(150);
      await page.evaluate(axeSource);
      const v = await page.evaluate(async () => {
        const res = await window.axe.run(document, { resultTypes: ["violations"] });
        const inOption = (target) => {
          try {
            const el = document.querySelector(target.join(" "));
            const btn = el?.closest("button");
            return !!btn && (!!btn.querySelector("[data-cli-option]") || el.hasAttribute("data-cli-option"));
          } catch {
            return false;
          }
        };
        return res.violations.map((x) => ({
          id: x.id,
          total: x.nodes.length,
          inOptions: x.nodes.filter((n) => inOption(n.target)).length,
          target: x.nodes.slice(0, 1).map((n) => n.target.join(" ")),
        }));
      });
      const own = v.filter((x) => x.inOptions > 0);
      const other = v.filter((x) => x.inOptions === 0);
      record(
        `axe ${dialogName} ${view.name} (q0109): keine Verstöße in den CLI-Optionen`,
        own.length === 0,
        own.length ? own.map((x) => `${x.id}×${x.inOptions}`).join(", ") : `0 in den Optionen; bereits vorhanden außerhalb der Optionen: ${other.length ? other.map((x) => `${x.id}×${x.total}`).join(", ") : "keine"}`
      );
    }

    // Klick und Tastatur im Prüfungstrainer
    await openExam(page);
    await page.evaluate((i) => window.__examPrepState.setQIndex(i), await examIndex(page, "q0109"));
    await page.waitForTimeout(100);
    const opt = page.locator("button", { hasText: "R7#" }).first();
    const before = await opt.evaluate((b) => b.className);
    await opt.focus();
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    await page.keyboard.press("Enter");
    const after = await opt.evaluate((b) => b.className);
    record(`Tastatur ${view.name}: Option ist fokussierbar (Button) und per Enter wählbar`, focused === "BUTTON" && before !== after);
    await context.close();
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
  fs.writeFileSync(path.join(root, ".local", "option-cli-check.json"), JSON.stringify(results, null, 1));
  if (failed.length) process.exitCode = 1;
}

const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
try {
  if (mode === "shots") await shots(browser);
  else await checks(browser);
} finally {
  await browser.close();
}
