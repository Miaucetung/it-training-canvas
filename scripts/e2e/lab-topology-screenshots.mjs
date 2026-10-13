// Screenshots der Lab-Topologien: Lab-Dialog und Canvas v2, Dark/Light, 1440/390 px, Simple/Detail.
//
// Aufruf:  npm run build && node scripts/e2e/lab-topology-screenshots.mjs stp vtp-dtp etherchannel ivr-svi
// Optional: AUDIT_BASE_URL=http://localhost:5000, SHOT_OUT=docs/lab-topologien/screenshots
// Ergebnis: <out>/<lab>/<ort>-<theme>-<breite>-<modus>.jpg und eine Prüfung der Rücksprung-Navigation.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outRoot = path.resolve(root, process.env.SHOT_OUT ?? "docs/lab-topologien/screenshots");
const labIds = process.argv.slice(2);
if (labIds.length === 0) {
  console.error("Bitte Lab-IDs angeben, z. B. stp vtp-dtp");
  process.exit(2);
}

function findChrome() {
  const pw = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".cache"), "ms-playwright");
  const c = [];
  if (fs.existsSync(pw)) {
    for (const d of fs.readdirSync(pw).filter((x) => x.startsWith("chromium-")).sort().reverse()) {
      c.push(path.join(pw, d, "chrome-win64", "chrome.exe"), path.join(pw, d, "chrome-linux", "chrome"));
    }
  }
  c.push("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "/usr/bin/google-chrome", "/usr/bin/chromium");
  return c.find((x) => fs.existsSync(x));
}

let server = null;
let baseUrl = process.env.AUDIT_BASE_URL;
if (!baseUrl) {
  const port = 5058;
  baseUrl = `http://localhost:${port}/`;
  server = spawn(process.execPath, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(port), "--strictPort"], { cwd: root, stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(baseUrl)).ok) break;
    } catch {
      /* warten */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
const results = [];
const note = (lab, name, ok, detail = "") => {
  results.push({ lab, name, ok, detail });
  console.log(`${ok ? "OK  " : "FAIL"} [${lab}] ${name}${detail ? " — " + detail : ""}`);
};

async function openLab(page, labId, width) {
  await page.getByRole("button", { name: /Packet Tracer Labs/ }).first().click();
  await page.waitForSelector('[role="dialog"]');
  if (width < 700) await page.getByRole("button", { name: /Lab-Katalog/ }).click();
  const item = page.locator(`button[data-lab-id="${labId}"]`).first();
  await item.scrollIntoViewIfNeeded();
  await item.click();
  await page.waitForTimeout(500);
  if (width < 700) await page.getByRole("button", { name: /^Details:/ }).click();
  await page.waitForTimeout(400);
}

for (const labId of labIds) {
  const dir = path.join(outRoot, labId);
  fs.mkdirSync(dir, { recursive: true });
  for (const theme of ["dark", "light"]) {
    for (const width of [1440, 390]) {
      const height = width === 1440 ? 900 : 844;
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      await page.addInitScript((t) => {
        localStorage.setItem("canvas-theme", t);
        localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
      }, theme);
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      try {
        await openLab(page, labId, width);
        const svg = page.locator('[role="dialog"] svg[aria-label="Cisco Netzwerk-Topologiediagramm"]').first();
        await svg.scrollIntoViewIfNeeded();
        for (const mode of ["detail", "simple"]) {
          const toggle = page.getByRole("button", { name: /Detail: IPs aktiv|Kompakt/ }).first();
          const label = (await toggle.textContent()) ?? "";
          const wantDetail = mode === "detail";
          if (wantDetail !== /Detail: IPs aktiv/.test(label)) await toggle.click();
          await page.waitForTimeout(250);
          await svg.scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(dir, `lab-${theme}-${width}-${mode}.jpg`), type: "jpeg", quality: 72 });
        }
        note(labId, `Lab-Dialog ${theme} ${width}px (Detail+Kompakt)`, true);

        // Canvas v2 aus dem Lab öffnen (nur Desktop: Detail + Simple)
        await page.getByRole("button", { name: /Topologie im Canvas öffnen/ }).first().click();
        await page.waitForSelector('#topology-selector', { timeout: 8000 });
        await page.waitForTimeout(900);
        for (const dens of ["Detail", "Simple"]) {
          await page.getByRole("button", { name: dens, exact: true }).first().click().catch(() => undefined);
          await page.waitForTimeout(300);
          await page.screenshot({ path: path.join(dir, `canvas-${theme}-${width}-${dens.toLowerCase()}.jpg`), type: "jpeg", quality: 72 });
        }
        const sel = await page.locator("#topology-selector").inputValue();
        note(labId, `Canvas ${theme} ${width}px: Vorlage geladen`, sel === `lab:${labId}`, `Auswahl: ${sel}`);

        if (theme === "dark" && width === 1440) {
          // Zielzustand/Startzustand und Rücksprung
          await page.getByRole("button", { name: "Startzustand" }).click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(dir, `canvas-${theme}-${width}-startzustand.jpg`), type: "jpeg", quality: 72 });
          const pressed = await page.getByRole("button", { name: "Startzustand" }).getAttribute("aria-pressed");
          note(labId, "Startzustand umschaltbar", pressed === "true");
          await page.getByRole("button", { name: "Zurück zum Lab" }).click();
          await page.waitForTimeout(700);
          const heading = await page.locator('[role="dialog"] h3').first().textContent().catch(() => "");
          note(labId, "Rücksprung öffnet das Lab", !!(await page.locator('[role="dialog"]').count()), String(heading).slice(0, 60));
        }
      } catch (e) {
        note(labId, `${theme} ${width}px`, false, String(e.message).split("\n")[0]);
      } finally {
        await ctx.close();
      }
    }
  }
}

await browser.close();
server?.kill();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden; Screenshots in ${outRoot}`);
process.exit(failed.length ? 1 : 0);
