// Layout- und a11y-Prüfung des Simulations-Docks in Canvas v2 (Lab nat-pat) bei 1440x900 und 390x844.
// Voraussetzung: Dev-Server, Edge installiert. Port über BASE_URL (Standard http://localhost:5000).
//   node scripts/e2e/sim-layout.mjs [vorher|nachher] [dark|light]
// Misst: Höhenanteil der Topologie an der Fensterhöhe, überlappende Textzeilen der Hop-Tabelle, Kontextmenü, Tastaturweg
// und axe-core (alle Regeln). Screenshots: .local/screenshots/sim-<phase>-<breite>-<zustand>.png, Ergebnis: .local/sim-layout.json
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const phase = process.argv[2] || "nachher";
const theme = process.argv[3] || "dark";
const root = process.cwd();
const shotDir = path.join(root, ".local", "screenshots");
fs.mkdirSync(shotDir, { recursive: true });
const axeSource = fs.readFileSync(path.join(root, "node_modules", "axe-core", "axe.min.js"), "utf8");

const SIZES = [
  { name: "1440", width: 1440, height: 900, mobile: false },
  { name: "390", width: 390, height: 844, mobile: true },
];
const results = [];
const record = (r) => {
  results.push(r);
  console.log(`${r.ok ? "OK  " : "FAIL"} [${r.size}] ${r.check}: ${r.detail}`);
};

const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });

async function openCanvas(size) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    isMobile: size.mobile,
    hasTouch: size.mobile,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.addInitScript((t) => {
    localStorage.setItem("canvas-theme", t);
    localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
    localStorage.setItem("ccna-canvas-version", '"v2"');
  }, theme);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  // Canvas öffnen (Flip-Schaltfläche)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Canvas") || (b.getAttribute("aria-label") || "").includes("Canvas"));
    if (btn) btn.click();
  });
  await page.waitForSelector("#topology-selector", { timeout: 8000 });
  await page.selectOption("#topology-selector", "lab:nat-pat");
  await page.waitForTimeout(900);
  return { context, page };
}

// Sichtbare Topologie: Viewport abzüglich eines darüberliegenden, volle Breite einnehmenden Docks (Overlay am unteren Rand)
const viewportBox = (page) =>
  page.evaluate(() => {
    const vp = [...document.querySelectorAll("div")].find((d) => typeof d.className === "string" && d.className.includes("cursor-grab"));
    const r = vp.getBoundingClientRect();
    let height = r.height;
    const aside = document.querySelector('aside[aria-label^="Netzwerksimulation"]');
    if (aside && getComputedStyle(aside).display !== "none") {
      const a = aside.getBoundingClientRect();
      if (a.width > 0 && a.left <= r.left + 1 && a.right >= r.right - 1 && a.top < r.bottom) height = Math.max(0, Math.min(r.bottom, a.top) - r.top);
    }
    return { top: r.top, height, width: r.width, left: r.left };
  });

async function shot(page, size, state) {
  await page.screenshot({ path: path.join(shotDir, `sim-${phase}-${theme}-${size.name}-${state}.png`) });
}

async function overlapReport(page) {
  // Zeilen der Hop-Tabelle: Kopfzeile darf keine Datenzeile überdecken, Zeilen dürfen sich nicht überlappen
  return page.evaluate(() => {
    const table = document.querySelector('table[aria-label^="Hop-Tabelle"]');
    if (!table) return { found: false, overlaps: [] };
    const rows = [...table.querySelectorAll("tbody > tr")].map((r) => r.getBoundingClientRect()).filter((r) => r.height > 0);
    const overlaps = [];
    for (let i = 1; i < rows.length; i++) if (rows[i].top < rows[i - 1].bottom - 1) overlaps.push(i);
    const scroller = [...document.querySelectorAll("*")].find((e) => e.contains(table) && getComputedStyle(e).overflowY === "auto" || getComputedStyle(e).overflowY === "scroll" ? e.contains(table) : false);
    const head = table.querySelector("thead")?.getBoundingClientRect();
    const sc = scroller?.getBoundingClientRect();
    const headInsideScroller = !!(head && sc && head.top >= sc.top - 1 && head.bottom <= sc.bottom + 1);
    // Kopfzeile fixiert: sticky
    const sticky = getComputedStyle(table.querySelector("thead")).position === "sticky" || getComputedStyle(table.querySelector("thead th")).position === "sticky";
    return { found: true, rows: rows.length, overlaps, headInsideScroller, sticky };
  });
}

async function axe(page, size, state) {
  await page.evaluate(axeSource);
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ["violations"] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(" ").slice(0, 140) }));
  });
  record({ size: size.name, check: `axe (${state})`, ok: res.length === 0, detail: res.length === 0 ? "keine Verstöße" : JSON.stringify(res) });
}

for (const size of SIZES) {
  const { context, page } = await openCanvas(size);
  const winH = size.height;
  const base = await viewportBox(page);
  record({ size: size.name, check: "Hinweis: Topologie ohne Simulation (Palette sichtbar, nicht Teil der Anforderung)", ok: true, detail: `${Math.round(base.height)}px = ${Math.round((base.height / winH) * 100)} % der Fensterhöhe` });
  await shot(page, size, "ohne-simulation");

  // Simulation öffnen und Ping starten (Quelle PC0, Ziel-IP 47.11.8.15 hinter PAT)
  await page.click('button[aria-label="Simulation öffnen oder schließen"]');
  await page.waitForTimeout(500);
  const open = await viewportBox(page);
  record({ size: size.name, check: "Topologie bei geöffneter Simulation", ok: open.height >= winH * 0.55, detail: `${Math.round(open.height)}px = ${Math.round((open.height / winH) * 100)} % der Fensterhöhe` });
  await shot(page, size, "sim-offen");

  const sourceSel = await page.$("#sim-source-select");
  if (sourceSel) {
    const pc0 = await page.evaluate(() => [...document.querySelectorAll("#sim-source-select option")].find((o) => o.textContent.startsWith("PC0"))?.value);
    if (pc0) await page.selectOption("#sim-source-select", pc0);
  }
  await page.getByRole("button", { name: "IP", exact: true }).click();
  await page.fill('[aria-label="Ziel-IP eingeben"]', "47.11.8.15");
  await page.getByRole("button", { name: "Ping senden" }).click();
  await page.waitForTimeout(1200);
  const ping = await viewportBox(page);
  record({ size: size.name, check: "Topologie nach Ping", ok: ping.height >= winH * 0.55, detail: `${Math.round(ping.height)}px = ${Math.round((ping.height / winH) * 100)} % der Fensterhöhe` });
  const ov = await overlapReport(page);
  record({ size: size.name, check: "Hop-Tabelle ohne Überlappung, Kopfzeile fixiert", ok: ov.found && ov.overlaps.length === 0 && ov.sticky, detail: JSON.stringify(ov) });
  await shot(page, size, "nach-ping");
  await axe(page, size, "Simulation nach Ping");

  // Höhenstufen (Mobil: Bottom Sheet) bzw. Einklappen (Desktop: Seitenleiste)
  if (size.mobile) {
    await page.getByRole("button", { name: "Eingeklappt" }).click();
    await page.waitForTimeout(350);
    const c = await viewportBox(page);
    record({ size: size.name, check: "Sheet eingeklappt: Topologie", ok: c.height >= winH * 0.55, detail: `${Math.round(c.height)}px = ${Math.round((c.height / winH) * 100)} %` });
    await shot(page, size, "sheet-eingeklappt");
    await page.getByRole("button", { name: "Volle Höhe" }).click();
    await page.waitForTimeout(350);
    await shot(page, size, "sheet-voll");
    const fullBox = await page.evaluate(() => { const a = document.querySelector('aside[aria-label^="Netzwerksimulation"]').getBoundingClientRect(); return { top: a.top, height: a.height }; });
    record({ size: size.name, check: "Sheet voll: überdeckt die Topologie nur auf Wunsch (Höhe aus CSS-Variable)", ok: fullBox.height > winH * 0.5 && fullBox.height < winH, detail: `${Math.round(fullBox.height)}px` });
    await axe(page, size, "Sheet voll");
    await page.getByRole("button", { name: "Halbe Höhe" }).click();
    await page.waitForTimeout(350);
  } else {
    const before = await viewportBox(page);
    await page.getByRole("button", { name: "Seitenleiste einklappen" }).click();
    await page.waitForTimeout(350);
    const after = await viewportBox(page);
    const rail = await page.evaluate(() => document.querySelector('aside[aria-label^="Netzwerksimulation"]').getBoundingClientRect().width);
    record({ size: size.name, check: "Seitenleiste einklappbar (Rail)", ok: after.width > before.width + 300 && rail < 80, detail: `Topologie ${Math.round(before.width)} → ${Math.round(after.width)}px, Rail ${Math.round(rail)}px` });
    await shot(page, size, "seitenleiste-eingeklappt");
    await axe(page, size, "Seitenleiste eingeklappt");
    await page.getByRole("button", { name: "Seitenleiste ausklappen" }).click();
    await page.waitForTimeout(350);
  }

  // Rechtsklick-Menü einer Verbindung
  const linkId = await page.evaluate(() => document.querySelector("[data-link-id]")?.getAttribute("data-link-id"));
  const linkSel = `[data-link-id="${linkId}"]`;
  await page.locator(linkSel).first().dispatchEvent("contextmenu", { clientX: 300, clientY: 300, bubbles: true, cancelable: true });
  const menu = page.getByRole("menu");
  const menuVisible = await menu.isVisible().catch(() => false);
  record({ size: size.name, check: "Rechtsklick-Menü der Verbindung", ok: menuVisible, detail: menuVisible ? "sichtbar" : "nicht sichtbar" });
  if (menuVisible) {
    await shot(page, size, "link-menue");
    await axe(page, size, "Link-Menü");
    await page.getByRole("menuitem", { name: "Verbindung trennen" }).click();
    await page.waitForTimeout(500);
    const tabSelected = await page.getByRole("tab", { name: /Ausfall/ }).getAttribute("aria-selected").catch(() => null);
    const floating = await page.getByRole("region", { name: "Ausfall-Analyse" }).isVisible().catch(() => false);
    record({ size: size.name, check: "Ausfall-Analyse in der Seitenleiste (Reiter), kein schwebendes Panel", ok: tabSelected === "true" && !floating, detail: `Reiter aktiv: ${tabSelected}, schwebendes Panel: ${floating}` });
    await shot(page, size, "ausfall");
    await axe(page, size, "Ausfall-Analyse");
    await page.getByRole("tab", { name: /Konvergenz/ }).click();
    await page.getByRole("radio", { name: "realistische Zeiten" }).click();
    await page.waitForTimeout(300);
    const note = await page.getByTestId("convergence-endstate-note").textContent().catch(() => "");
    record({ size: size.name, check: "Konvergenz-Reiter mit Hinweis zum Endzustand", ok: /Endzustand/.test(note ?? ""), detail: note ?? "" });
    await shot(page, size, "konvergenz");
    await axe(page, size, "Konvergenz-Reiter");
    await page.getByRole("tab", { name: "Ping" }).click();
    const ov2 = await viewportBox(page);
    record({ size: size.name, check: "Topologie bei Ausfall-Analyse", ok: ov2.height >= winH * 0.55, detail: `${Math.round(ov2.height)}px = ${Math.round((ov2.height / winH) * 100)} % der Fensterhöhe` });
  }

  // Tastaturweg: Link per Enter wählen, Shift+F10, Pfeiltaste, Enter
  await page.locator(linkSel).first().focus().catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
  await page.locator(linkSel).first().dispatchEvent("keydown", { key: "Enter", bubbles: true }).catch(() => {});
  await page.keyboard.press("Shift+F10");
  await page.waitForTimeout(300);
  const kbMenu = await page.getByRole("menu").isVisible().catch(() => false);
  record({ size: size.name, check: "Tastaturweg Shift+F10 öffnet das Menü", ok: kbMenu, detail: kbMenu ? "Menü sichtbar" : "kein Menü" });
  if (kbMenu) {
    await page.keyboard.press("ArrowDown");
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    record({ size: size.name, check: "Pfeiltaste im Menü", ok: !!focused, detail: String(focused) });
    await page.keyboard.press("Escape");
  }
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(root, ".local", `sim-layout-${phase}.json`), JSON.stringify(results, null, 1));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen erfüllt`);
process.exit(failed.length ? 1 : 0);
