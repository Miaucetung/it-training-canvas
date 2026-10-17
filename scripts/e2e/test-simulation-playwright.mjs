import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

function findBrowserPath() {
  const isWin = process.platform === "win32";
  if (isWin) {
    const candidates = [
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      path.join(process.env.LOCALAPPDATA || "", "Microsoft\\Edge\\Application\\msedge.exe"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return null;
}

const browserPath = findBrowserPath();
if (!browserPath) {
  console.error("Kein Browser gefunden (Edge/Chrome).");
  process.exit(1);
}

const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
const root = process.cwd();
const axeSource = fs.readFileSync(path.join(root, "node_modules", "axe-core", "axe.min.js"), "utf8");
const screenshotsDir = path.join(root, ".local", "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function navigateToCanvas(page) {
  // Onboarding überspringen falls offen
  await page.evaluate(() => {
    const skipBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent && b.textContent.includes("Überspringen")
    );
    if (skipBtn) skipBtn.click();
  });
  await page.waitForTimeout(300);

  // Flip-Button zum Canvas
  const flipBtn = page.locator('button[aria-label="Zum Canvas wechseln"]');
  if (await flipBtn.isVisible()) {
    await flipBtn.click();
    await page.waitForTimeout(600);
  }

  // Falls v1 aktiv, zu v2 umschalten (nur klicken wenn nicht bereits disabled/aktiv)
  const v2Btn = page.locator('button:has-text("v2 (SVG Next)"):not([disabled])');
  if (await v2Btn.isVisible()) {
    await v2Btn.click();
    await page.waitForTimeout(600);
  }
}

async function run() {
  console.log(`[Playwright Simulation Test] Starte Browser: ${browserPath}`);
  const browser = await chromium.launch({ executablePath: browserPath, headless: true });

  const auditResults = {
    desktop: { a11yViolations: 0, hopsCount: 0, linkAnimationFound: false },
    mobile: { a11yViolations: 0, hopsCount: 0 },
    reducedMotion: { motionSuppressed: false },
  };

  try {
    // ─── 1. Desktop 1440px Test ──────────────────────────────────────────────
    console.log("\n--- 1. Desktop Test (1440x900) ---");
    const context1440 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
    });
    const page1440 = await context1440.newPage();
    await page1440.goto(BASE_URL);
    await page1440.waitForLoadState("networkidle");

    // LocalStorage initialisieren für Canvas v2 & Dark Mode
    await page1440.evaluate(() => {
      localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
      localStorage.setItem("hasSeenOnboarding", "true");
      localStorage.setItem("canvas-theme", "dark");
      localStorage.setItem("ccna-canvas-version", '"v2"');
      document.documentElement.classList.add("dark");
    });
    await page1440.reload();
    await page1440.waitForLoadState("networkidle");
    await page1440.waitForTimeout(800);

    await navigateToCanvas(page1440);

    // Simulation Dock öffnen
    console.log("Öffne Simulation Dock...");
    const simButton = page1440.locator('button[aria-label="Netzwerksimulation öffnen oder schließen"]');
    await simButton.waitFor({ state: "visible", timeout: 8000 });
    await simButton.click();
    await page1440.waitForTimeout(500);

    const simDock = page1440.locator('aside[aria-label="Netzwerksimulation & Hop-Inspector"]');
    await simDock.waitFor({ state: "visible", timeout: 5000 });
    console.log("Simulation Dock geöffnet.");

    // Ping senden
    console.log("Klicke 'Ping senden'...");
    const pingBtn = page1440.locator('button:has-text("Ping senden")');
    await pingBtn.click();
    await page1440.waitForTimeout(800);

    // Prüfe Hop-Tabelle
    const hopRows = page1440.locator('table[aria-label="Hop-Tabelle der simulierten Netzwerk-Pfade"] tbody tr');
    const rowCount = await hopRows.count();
    console.log(`Hop-Tabelle Zeilenanzahl: ${rowCount}`);
    auditResults.desktop.hopsCount = rowCount;

    // Prüfe Link-Animation (SVG animateMotion oder animierter Kreis)
    const animCircle = page1440.locator("svg circle animateMotion");
    const animCircleCount = await animCircle.count();
    const activeLinkPulse = page1440.locator("svg path.text-primary");
    const activePulseCount = await activeLinkPulse.count();
    const hasAnimation = animCircleCount > 0 || activePulseCount > 0;
    console.log(`Link-Animation gefunden: ${hasAnimation} (animateMotion: ${animCircleCount}, link: ${activePulseCount})`);
    auditResults.desktop.linkAnimationFound = hasAnimation;

    // Screenshot speichern
    const screenshotPath1440 = path.join(screenshotsDir, "simulation-1440.png");
    await page1440.screenshot({ path: screenshotPath1440, fullPage: false });
    console.log(`Screenshot 1440px gespeichert: ${screenshotPath1440}`);

    // axe-core Accessibility Audit
    console.log("Führe axe-core Audit (1440px)...");
    await page1440.evaluate(axeSource);
    const axeResult1440 = await page1440.evaluate(async () => {
      const dock = document.querySelector('aside[aria-label="Netzwerksimulation & Hop-Inspector"]');
      // @ts-ignore
      return await window.axe.run(dock, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa"],
        },
      });
    });
    console.log(`axe Violations (1440px Dock): ${axeResult1440.violations.length}`);
    if (axeResult1440.violations.length > 0) {
      console.error("axe Violations Details:", JSON.stringify(axeResult1440.violations, null, 2));
    }
    auditResults.desktop.a11yViolations = axeResult1440.violations.length;
    await context1440.close();

    // ─── 2. prefers-reduced-motion Test ──────────────────────────────────────
    console.log("\n--- 2. prefers-reduced-motion Test (1440x900) ---");
    const contextReduced = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    const pageReduced = await contextReduced.newPage();
    await pageReduced.goto(BASE_URL);
    await pageReduced.waitForLoadState("networkidle");
    await pageReduced.evaluate(() => {
      localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
      localStorage.setItem("canvas-theme", "dark");
      localStorage.setItem("ccna-canvas-version", '"v2"');
    });
    await pageReduced.reload();
    await pageReduced.waitForLoadState("networkidle");
    await pageReduced.waitForTimeout(800);

    await navigateToCanvas(pageReduced);

    const simButtonRed = pageReduced.locator('button[aria-label="Netzwerksimulation öffnen oder schließen"]');
    await simButtonRed.waitFor({ state: "visible", timeout: 8000 });
    await simButtonRed.click();
    await pageReduced.waitForTimeout(500);

    const pingBtnRed = pageReduced.locator('button:has-text("Ping senden")');
    await pingBtnRed.click();
    await pageReduced.waitForTimeout(800);

    // animateMotion muss unterdrückt sein
    const reducedAnimCircleCount = await pageReduced.locator("svg circle animateMotion").count();
    console.log(`animateMotion Counts bei reduced-motion: ${reducedAnimCircleCount}`);
    auditResults.reducedMotion.motionSuppressed = reducedAnimCircleCount === 0;

    const screenshotPathReduced = path.join(screenshotsDir, "simulation-reduced-motion-1440.png");
    await pageReduced.screenshot({ path: screenshotPathReduced, fullPage: false });
    console.log(`Screenshot reduced-motion gespeichert: ${screenshotPathReduced}`);
    await contextReduced.close();

    // ─── 3. Mobile 390px Test ────────────────────────────────────────────────
    console.log("\n--- 3. Mobile Test (390x844) ---");
    const context390 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      colorScheme: "dark",
    });
    const page390 = await context390.newPage();
    await page390.goto(BASE_URL);
    await page390.waitForLoadState("networkidle");
    await page390.evaluate(() => {
      localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
      localStorage.setItem("canvas-theme", "dark");
      localStorage.setItem("ccna-canvas-version", '"v2"');
    });
    await page390.reload();
    await page390.waitForLoadState("networkidle");
    await page390.waitForTimeout(800);

    console.log("Wechsle zu Canvas auf Mobile...");
    await navigateToCanvas(page390);

    console.log("Öffne Simulation Dock auf Mobile...");
    const simButtonMobile = page390.locator('button[aria-label="Netzwerksimulation öffnen oder schließen"]');
    await simButtonMobile.waitFor({ state: "visible", timeout: 8000 });
    await simButtonMobile.click();
    await page390.waitForTimeout(500);

    // Ping senden
    const pingBtnMobile = page390.locator('button:has-text("Ping senden")');
    await pingBtnMobile.click();
    await page390.waitForTimeout(800);

    // Prüfe Hop-Tabelle auf Mobile
    const mobileRows = page390.locator('table[aria-label="Hop-Tabelle der simulierten Netzwerk-Pfade"] tbody tr');
    const mobileRowCount = await mobileRows.count();
    console.log(`Mobile Hop-Tabelle Zeilenanzahl: ${mobileRowCount}`);
    auditResults.mobile.hopsCount = mobileRowCount;

    // Screenshot speichern
    const screenshotPath390 = path.join(screenshotsDir, "simulation-390.png");
    await page390.screenshot({ path: screenshotPath390, fullPage: false });
    console.log(`Screenshot 390px gespeichert: ${screenshotPath390}`);

    // axe-core Accessibility Audit auf Mobile
    console.log("Führe axe-core Audit (390px)...");
    await page390.evaluate(axeSource);
    const axeResult390 = await page390.evaluate(async () => {
      const dock = document.querySelector('aside[aria-label="Netzwerksimulation & Hop-Inspector"]');
      // @ts-ignore
      return await window.axe.run(dock, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa"],
        },
      });
    });
    console.log(`axe Violations (390px Dock): ${axeResult390.violations.length}`);
    if (axeResult390.violations.length > 0) {
      console.error("axe Violations Details:", JSON.stringify(axeResult390.violations, null, 2));
    }
    auditResults.mobile.a11yViolations = axeResult390.violations.length;
    await context390.close();

    console.log("\n=== E2E AUDIT ZUSAMMENFASSUNG ===");
    console.log(JSON.stringify(auditResults, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Fehler im Playwright-Test:", err);
  process.exit(1);
});
