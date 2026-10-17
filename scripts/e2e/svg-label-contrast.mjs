// Rechnet den Kontrast von SVG-Beschriftungen (<text>) gegen die Füllung der darunterliegenden Form nach (Ziel 4,5:1).
// Nur lesend. Voraussetzung: Dev-Server auf Port 5000 (Audit-Hooks aktiv), Edge installiert.
//   node scripts/e2e/svg-label-contrast.mjs        Ausgabe: Konsole und .local/svg-label-contrast.json
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const MIN = 4.5;

const TOOLS = [
  "subnetting-drill", "routing-drill", "ospf-wildcard-drill", "acl-drill", "subnetting-quiz", "subnetting-cheatsheet",
  "ipv4-subnet-table", "ipv6-calculator", "vlan-simulator", "stp-simulator", "osi-simulator", "routing-simulator",
  "verkabelung-trainer", "dragdrop-trainer", "topologie-explorer", "cli-glossary",
];

// Läuft im Browser: liefert je <text> Füllfarbe, Hintergrundfarbe und Kontrast
function measure() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,/ ]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (top, bottom) => {
    const a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
      g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
      b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
      a,
    };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const shapeFill = (el) => {
    const cs = getComputedStyle(el);
    const f = parse(cs.fill);
    if (!f || cs.fill === "none") return null;
    const fo = parseFloat(cs.fillOpacity || "1") * parseFloat(cs.opacity || "1");
    return { ...f, a: f.a * fo };
  };
  const htmlBg = (el) => {
    const layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n instanceof SVGElement && n.tagName.toLowerCase() !== "svg") continue;
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) layers.push(c);
      if (c && c.a === 1) break;
    }
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc);
    return acc;
  };
  const out = [];
  for (const t of document.querySelectorAll("svg text")) {
    const text = (t.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const r = t.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(t);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const fg0 = parse(cs.fill);
    if (!fg0 || cs.fill === "none") continue;
    const fgOp = parseFloat(cs.fillOpacity || "1") * parseFloat(cs.opacity || "1");
    const svg = t.ownerSVGElement;
    const svgRoot = svg ? svg.closest("svg") : null;
    // Stapel der Formen unter dem Textmittelpunkt, von unten nach oben
    const stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).filter((e) => e !== t && svgRoot && svgRoot.contains(e) && e instanceof SVGElement && /^(rect|circle|ellipse|path|polygon)$/.test(e.tagName.toLowerCase()) && shapeFill(e));
    // elementsFromPoint liefert oben zuerst: ab dem ersten Element unter dem Text zusammensetzen
    let bg = htmlBg(svgRoot || t);
    for (let i = stack.length - 1; i >= 0; i--) bg = over(shapeFill(stack[i]), bg);
    const fg = over({ ...fg0, a: fg0.a * fgOp }, bg);
    const size = parseFloat(cs.fontSize);
    out.push({
      text: text.slice(0, 40),
      fg: hex(fg),
      bg: hex(bg),
      ratio: Math.round(ratio(fg, bg) * 100) / 100,
      fontSize: size,
      onShape: stack.length > 0,
      shape: stack[0] ? stack[0].tagName.toLowerCase() : null,
      textClass: (t.getAttribute("class") || "").slice(0, 60),
    });
  }
  return out;
}

const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
const results = [];

async function runView(name, themeName, width, open) {
  const clickTabs = name.startsWith("Werkzeug");
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  const page = await context.newPage();
  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate((t) => { localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true"); localStorage.setItem("canvas-theme", t); }, themeName);
    await page.evaluate((t) => window.__auditApp?.setTheme(t), themeName);
    await page.waitForTimeout(250);
    await open(page);
    await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
    await page.waitForTimeout(150);
    const states = [{ state: "Standard", items: await page.evaluate(measure) }];
    // Reiter durchklicken: Buttons-Gruppen mit mindestens drei Geschwistern im oberen Dialogbereich
    const tabs = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return [];
      const top = dlg.getBoundingClientRect().top;
      const groups = new Map();
      for (const b of dlg.querySelectorAll("button")) {
        const r = b.getBoundingClientRect();
        if (r.height === 0 || r.top - top > 220) continue;
        const p = b.parentElement;
        groups.set(p, [...(groups.get(p) ?? []), (b.textContent || "").replace(/\s+/g, " ").trim()]);
      }
      return [...groups.values()].filter((g) => g.length >= 3 && g.length <= 8).flat().filter((t) => t && t !== "Schließen");
    });
    for (const label of clickTabs ? [...new Set(tabs)] : []) {
      try {
        await page.getByRole("button", { name: label, exact: true }).last().click({ timeout: 2000 });
        await page.waitForTimeout(250);
        states.push({ state: `Reiter „${label}“`, items: await page.evaluate(measure) });
      } catch { /* Schaltfläche nicht klickbar: überspringen */ }
    }
    for (const s of states) results.push({ view: name, state: s.state, theme: themeName, width, items: s.items });
  } catch (e) {
    results.push({ view: name, state: "Fehler", theme: themeName, width, error: String(e.message).split("\n")[0].slice(0, 160), items: [] });
  }
  await context.close();
}

const VIEWS = [
  { name: "Dashboard", open: async () => {} },
  ...TOOLS.map((id) => ({ name: `Werkzeug: ${id}`, open: async (page) => { await page.evaluate((t) => window.__auditApp.openTool(t), id); await page.waitForTimeout(700); } })),
  {
    name: "Labs-Dialog (OSPF-Lab)",
    alwaysDark: true, // Dialog ist bewusst immer dunkel; im hellen Thema würde nur die halbtransparente Fläche falsch gerechnet
    open: async (page) => {
      await page.evaluate(() => window.__auditApp.openDialog("labs"));
      await page.waitForTimeout(600);
      await page.getByText("OSPF — Single Area 0").first().click();
      await page.waitForTimeout(800);
    },
  },
  {
    name: "Prüfungstrainer: Frage mit Grafik (q0109)",
    open: async (page) => {
      await page.evaluate(() => window.__auditApp.openDialog("exam"));
      await page.waitForFunction(() => !!window.__examPrepState);
      await page.evaluate(() => { window.__AUDIT_NO_SHUFFLE__ = true; window.__examPrepState.startLearn(); });
      await page.waitForFunction(() => window.__examPrepState.getQuestions().length > 0);
      const i = await page.evaluate(() => window.__examPrepState.getQuestions().findIndex((q) => q.id === "q0109"));
      await page.evaluate((n) => window.__examPrepState.setQIndex(n), i);
      await page.waitForTimeout(300);
    },
  },
];


// Alle Prüfungsfragen mit Grafik (Exhibits), Lernmodus ohne Mischen
async function runExhibits(themeName) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.evaluate((t) => { localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true"); localStorage.setItem("canvas-theme", t); }, themeName);
  await page.evaluate((t) => window.__auditApp?.setTheme(t), themeName);
  await page.waitForTimeout(250);
  await page.evaluate(() => window.__auditApp.openDialog("exam"));
  await page.waitForFunction(() => !!window.__examPrepState);
  await page.evaluate(() => { window.__AUDIT_NO_SHUFFLE__ = true; window.__examPrepState.startLearn(); });
  await page.waitForFunction(() => window.__examPrepState.getQuestions().length > 0);
  await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
  const list = await page.evaluate(() => window.__examPrepState.getQuestions().map((q, i) => (q.exhibit ? { i, id: q.id } : null)).filter(Boolean));
  for (const { i, id } of list) {
    await page.evaluate((n) => window.__examPrepState.setQIndex(n), i);
    await page.waitForTimeout(120);
    results.push({ view: `Prüfungsfrage ${id}`, state: "Standard", theme: themeName, width: 1440, items: await page.evaluate(measure) });
  }
  await context.close();
}
for (const theme of ["dark", "light"]) {
  for (const v of VIEWS) if (!(v.alwaysDark && theme === "light")) await runView(v.name, theme, 1440, v.open);
}
if (process.env.EXHIBITS === "1") for (const theme of ["dark", "light"]) await runExhibits(theme);
await browser.close();

fs.mkdirSync(path.join(process.cwd(), ".local"), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), ".local", "svg-label-contrast.json"), JSON.stringify(results, null, 1));
let total = 0;
let bad = 0;
for (const r of results) {
  total += r.items.length;
  const low = r.items.filter((i) => i.ratio < MIN);
  bad += low.length;
  if (r.error) console.log(`FEHL ${r.view} (${r.theme}): ${r.error}`);
  else if (low.length) console.log(`LOW  ${r.view} · ${r.state} · ${r.theme}: ${low.length}/${r.items.length}`);
}
console.log(`\n${total} SVG-Beschriftungen geprüft, ${bad} unter ${MIN}:1`);
