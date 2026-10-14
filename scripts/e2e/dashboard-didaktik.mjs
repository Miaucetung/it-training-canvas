// Anfänger-Weg und Barrierefreiheit des Dashboards (Lernpfad, Nächster Schritt, Dreiklang).
//
// Aufruf:  npm run build && node scripts/e2e/dashboard-didaktik.mjs
// Optional: AUDIT_BASE_URL=http://localhost:5000 (laufender Dev-Server), SHOT_OUT=<Ordner> (Standard: .local/screenshots/dashboard)
// Prüft: höchstens zwei Klicks je Etappe (Dashboard → Lektion → Fragen → Lab → zurück), axe-core (Hell/Dunkel, 1440/1024/390 px),
//        keine horizontale Seitenverschiebung, Screenshots für neue Nutzer und Nutzer mit Fortschritt.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.resolve(root, process.env.SHOT_OUT ?? ".local/screenshots/dashboard");
fs.mkdirSync(outDir, { recursive: true });

function findChrome() {
  const c = [];
  const pw = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".cache"), "ms-playwright");
  if (fs.existsSync(pw)) {
    for (const d of fs.readdirSync(pw).filter((x) => x.startsWith("chromium-")).sort().reverse()) {
      c.push(path.join(pw, d, "chrome-win64", "chrome.exe"), path.join(pw, d, "chrome-linux", "chrome"));
    }
  }
  c.push("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "/usr/bin/google-chrome", "/usr/bin/chromium");
  return c.find((x) => fs.existsSync(x));
}

const results = [];
function record(area, name, ok, detail = "") {
  results.push({ area, name, ok, detail });
  console.log(`${ok ? "OK  " : "FAIL"} [${area}] ${name}${detail ? " — " + detail : ""}`);
}

let server = null;
let baseUrl = process.env.AUDIT_BASE_URL;
if (!baseUrl) {
  const port = 5059;
  baseUrl = `http://localhost:${port}/`;
  server = spawn(process.execPath, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(port), "--strictPort"], { cwd: root, stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(baseUrl)).ok) break;
    } catch {
      /* noch nicht bereit */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

const exe = findChrome();
if (!exe) {
  console.error("Kein Chromium/Chrome gefunden.");
  server?.kill();
  process.exit(2);
}
const browser = await chromium.launch({ executablePath: exe, headless: true });
const axeSource = fs.readFileSync(path.join(root, "node_modules", "axe-core", "axe.min.js"), "utf8");

/** Mit Fortschritt: Schritt 1 abgeschlossen, Schritt 2 begonnen, ein Lab erledigt. */
const PROGRESS_SEED = {
  "ccna-learning-progress-v1": JSON.stringify({
    version: 1,
    lessons: { "networking-fundamentals": { openedAt: 1, read: true, readAt: 2 }, "ios-cli": { openedAt: 3 } },
    quizzes: {
      "ccna-quiz-netzwerkgrundlagen": { attempts: 2, completedAt: 4, lastPercent: 78, bestPercent: 83 },
      "ccna-quiz-tag1-grundlagen": { attempts: 1, completedAt: 5, lastPercent: 64, bestPercent: 64 },
    },
  }),
  "ccna-completed-labs-v1": JSON.stringify(["drill-grundkonfig"]),
};

async function newPage(width, height, theme, seed = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.addInitScript(
    ([t, s]) => {
      localStorage.setItem("canvas-theme", t);
      localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
    },
    [theme, seed],
  );
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("region", { name: "Nächster Schritt" }).waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  return { page, ctx };
}

// ───────────────────────── 1) Anfänger-Weg: höchstens zwei Klicks je Etappe ─────────────────────────
{
  const { page, ctx } = await newPage(1440, 900, "light");
  let clicks = 0;
  const click = async (locator) => {
    clicks++;
    await locator.click();
  };
  const etappe = (name, ok, detail) => record("Anfänger-Weg", `${name}: ${clicks} Klick(s)`, ok && clicks <= 2, detail);

  // Etappe 1: Dashboard → erste Lektion
  clicks = 0;
  await click(page.getByRole("button", { name: /Jetzt starten: Lektion lesen/ }));
  const lesson1 = await page.getByRole("region", { name: /Topic-Detail: Netzwerkgrundlagen/ }).waitFor({ timeout: 10000 }).then(() => true, () => false);
  etappe("Dashboard → erste Lektion", lesson1);

  // Etappe 2: Lektion → Übungsfragen
  clicks = 0;
  await click(page.getByRole("button", { name: /Weiter: Übungsfragen/ }));
  const quiz = await page.getByText(/Frage 1 von/).waitFor({ timeout: 10000 }).then(() => true, () => false);
  etappe("Lektion → Übungsfragen", quiz);
  await page.getByRole("button", { name: "Schließen" }).last().click();

  // Zurück zum Dashboard (Lektion schließen)
  clicks = 0;
  await click(page.getByRole("button", { name: "Panel schließen" }));
  const back1 = await page.getByRole("region", { name: "Lernpfad" }).waitFor({ timeout: 10000 }).then(() => true, () => false);
  etappe("Lektion → Dashboard", back1);

  // Etappe 3: Dashboard → Lektion eines Schritts mit Lab (Schritt 4) → Lab
  clicks = 0;
  await click(page.getByRole("button", { name: /^Schritt 4/ }));
  await click(page.getByRole("button", { name: /Lektion: IPv4-Adressierung/ }));
  const lesson4 = await page.getByRole("region", { name: /Topic-Detail: IPv4/ }).waitFor({ timeout: 10000 }).then(() => true, () => false);
  etappe("Dashboard → Lektion IPv4 (über den Lernpfad)", lesson4);

  clicks = 0;
  await click(page.getByRole("button", { name: /IP-Grundkonfiguration/ }).first());
  const labOpen = await page.getByText(/ID: basic-ip/).waitFor({ timeout: 15000 }).then(() => true, () => false);
  etappe("Lektion → passendes Lab", labOpen);

  // Lab → Lektion (Rückverweis) funktioniert
  clicks = 0;
  const lessonLink = page.getByRole("button", { name: /IPv4-Adressierung & Subnetting/ }).first();
  const hasLink = await lessonLink.waitFor({ timeout: 8000 }).then(() => true, () => false);
  record("Anfänger-Weg", "Lab zeigt „Lektion dazu“", hasLink);

  // Zurück zum Dashboard: Lab schließen, Lektion schließen
  clicks = 0;
  await click(page.getByRole("button", { name: "Dialog schließen" }));
  await click(page.getByRole("button", { name: "Panel schließen" }));
  const back2 = await page.getByRole("region", { name: "Nächster Schritt" }).waitFor({ timeout: 10000 }).then(() => true, () => false);
  etappe("Lab → Dashboard", back2);
  await ctx.close();
}

// ───────────────────────── 2) Fortschritt sichtbar, Zustand bleibt nach Neuladen ─────────────────────────
{
  const { page, ctx } = await newPage(1440, 900, "light", PROGRESS_SEED);
  const card = page.getByRole("region", { name: "Nächster Schritt" });
  const text = (await card.textContent()) ?? "";
  record("Fortschritt", "Nächster Schritt = Schritt 2 (Schritt 1 abgeschlossen)", /Schritt 2 · Cisco IOS CLI/.test(text), text.slice(0, 80));
  const path1 = await page.getByRole("region", { name: "Lernpfad" }).textContent();
  record("Fortschritt", "Lernpfad zählt 1 abgeschlossenen Schritt", /1 von 15 Schritten abgeschlossen/.test(path1 ?? ""));
  await ctx.close();
}

// ───────────────────────── 3) axe-core und Seitenbreite ─────────────────────────
const axeReport = [];
for (const theme of ["light", "dark"]) {
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
    for (const [label, seed] of [["neu", {}], ["mit Fortschritt", PROGRESS_SEED]]) {
      const { page, ctx } = await newPage(w, h, theme, seed);
      await page.screenshot({ path: path.join(outDir, `dashboard-${label === "neu" ? "neu" : "fortschritt"}-${theme}-${w}-oben.png`) });
      // Lernpfad-Schritt aufklappen, damit der Dreiklang mitgeprüft wird
      await page.getByRole("button", { name: /^Schritt 4/ }).click().catch(() => undefined);
      await page.waitForTimeout(250);
      await page.evaluate(axeSource);
      const v = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.map((x) => ({ id: x.id, impact: x.impact, count: x.nodes.length, sample: x.nodes[0]?.target?.join(" ") })));
      axeReport.push({ theme, w, label, violations: v });
      record("axe", `Dashboard ${label} ${w}px (${theme})`, v.length === 0, v.length ? v.map((x) => `${x.id}×${x.count} (${x.sample})`).join("; ") : "0 Violations inkl. color-contrast");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      record("Layout", `keine horizontale Seitenverschiebung ${w}px (${theme}, ${label})`, overflow <= 1, `Überstand ${overflow}px`);
      await page.screenshot({ path: path.join(outDir, `dashboard-${label === "neu" ? "neu" : "fortschritt"}-${theme}-${w}-pfad.png`) });
      await ctx.close();
    }
  }
}
fs.writeFileSync(path.join(outDir, "axe.json"), JSON.stringify(axeReport, null, 2));

await browser.close();
server?.kill();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden; Screenshots in ${outDir}`);
process.exit(failed.length ? 1 : 0);
