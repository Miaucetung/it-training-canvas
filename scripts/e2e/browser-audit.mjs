// Browser-Prüfung (Phase 1b): Schließen-Buttons bei 390 px, Zurück-Navigation,
// Webfonts im SVG→PNG-Export, axe-core inkl. Farbkontrast in Hell/Dunkel.
//
// Aufruf:  npm run build && node scripts/e2e/browser-audit.mjs
// Optional: AUDIT_BASE_URL=http://localhost:5000 (laufender Dev-Server) statt eigenem `vite preview`.
// Ergebnis: Konsolenbericht + scripts/e2e/out/browser-audit.json, Exit-Code 1 bei Fehlschlägen.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.join(here, "out");
fs.mkdirSync(outDir, { recursive: true });

function findChrome() {
  const candidates = [];
  const pw = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".cache"), "ms-playwright");
  if (fs.existsSync(pw)) {
    for (const d of fs.readdirSync(pw).filter((x) => x.startsWith("chromium-")).sort().reverse()) {
      candidates.push(path.join(pw, d, "chrome-win64", "chrome.exe"), path.join(pw, d, "chrome-linux", "chrome"));
    }
  }
  candidates.push(
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium"
  );
  return candidates.find((c) => fs.existsSync(c));
}

const results = [];
function record(area, name, ok, detail = "") {
  results.push({ area, name, ok, detail });
  console.log(`${ok ? "OK  " : "FAIL"} [${area}] ${name}${detail ? " — " + detail : ""}`);
}

let server = null;
let baseUrl = process.env.AUDIT_BASE_URL;
if (!baseUrl) {
  const port = 5057;
  baseUrl = `http://localhost:${port}/`;
  const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");
  server = spawn(process.execPath, [vite, "preview", "--port", String(port), "--strictPort"], { cwd: root, stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(baseUrl);
      if (r.ok) break;
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

async function newPage(width, height, theme = "light") {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.addInitScript((t) => {
    localStorage.setItem("canvas-theme", t);
    localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
  }, theme);
  const hosts = new Set();
  page.on("request", (r) => {
    try {
      const u = new URL(r.url());
      if (u.protocol === "http:" || u.protocol === "https:") hosts.add(u.host);
    } catch {
      /* data:/blob: */
    }
  });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  return { page, ctx, hosts };
}

// ───────────────────────── 1) Schließen-Button bei 390 px ─────────────────────────
{
  const openers = [
    ["Packet Tracer Labs", /Packet Tracer Labs/],
    ["D&D-Trainer", /D&D-Trainer öffnen/],
    ["Subnetting-Drill", /Subnetting-Drill/],
    ["VLAN-Simulator", /VLAN-Simulator öffnen/],
    ["Schwächen-Drill", /Schwächen-Drill starten/],
  ];
  for (const [label, rx] of openers) {
    const { page, ctx } = await newPage(390, 844);
    try {
      await page.getByRole("button", { name: rx }).first().click({ timeout: 5000 });
      await page.waitForTimeout(600);
      const dlg = page.locator('[role="dialog"]').last();
      if ((await dlg.count()) === 0) {
        record("close-390", label, false, "kein role=dialog nach dem Öffnen");
        continue;
      }
      const info = await page.evaluate(() => {
        const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const nameOf = (b) => (b.getAttribute("aria-label") || b.getAttribute("title") || b.textContent || "").trim();
        const btns = [...dlg.querySelectorAll("button")]
          .map((b) => ({ el: b, r: b.getBoundingClientRect(), name: nameOf(b) }))
          .filter((x) => x.r.width > 0 && x.r.height > 0);
        const inView = btns.filter((x) => x.r.left >= 0 && x.r.right <= vw && x.r.top >= 0 && x.r.bottom <= vh);
        const named = inView.filter((x) => /schlie(ß|ss)en|close|abbrechen/i.test(x.name));
        const headerIcons = inView
          .filter((x) => x.r.top < 300 && x.name.length <= 2)
          .sort((a, b) => a.r.top - b.r.top || b.r.left - a.r.left);
        const pick = named[0] ?? headerIcons[0] ?? null;
        if (pick) pick.el.setAttribute("data-audit-close", "1");
        return {
          parentIsBody: dlg.parentElement === document.body,
          hasName: !!(dlg.getAttribute("aria-label") || dlg.getAttribute("aria-labelledby")),
          overflowX: document.documentElement.scrollWidth > vw,
          closeFound: !!pick,
          closeNamed: named.length > 0,
          closeSize: pick ? `${Math.round(pick.r.width)}x${Math.round(pick.r.height)}` : "",
        };
      });
      let closed = false;
      if (info.closeFound) {
        await page.locator('[data-audit-close="1"]').click({ timeout: 3000 });
        await page.waitForTimeout(400);
        closed = (await page.locator('[role="dialog"]').count()) === 0;
      }
      const notes = [
        info.closeNamed ? "" : "Schließen-Button ohne zugänglichen Namen",
        info.parentIsBody ? "" : "Dialog nicht an body",
        info.hasName ? "" : "Dialog ohne Namen",
        info.overflowX ? "horizontaler Seitenüberlauf" : "",
        info.closeFound ? `Button ${info.closeSize}` : "kein sichtbarer Schließen-Button",
        info.closeFound && !closed ? "Klick schließt den Dialog nicht" : "",
      ].filter(Boolean);
      record("close-390", label, info.closeFound && closed, notes.join("; "));
    } catch (e) {
      record("close-390", label, false, String(e.message).split("\n")[0]);
    } finally {
      await ctx.close();
    }
  }
}

// ───────────────────────── 2) Zurück-Navigation zum Dashboard ─────────────────────────
{
  const dashboardVisible = (page) => page.getByText("CCNA 200-301 Lernplattform").first().isVisible();
  const tests = [
    ["Lektion → Startseite (Logo)", async (page) => {
      await page.getByRole("button", { name: /Jetzt starten|Weiterlernen/ }).first().click();
      await page.waitForTimeout(800);
      if (await dashboardVisible(page)) throw new Error("Lektion wurde nicht geöffnet");
      await page.getByRole("button", { name: /Startseite/ }).click();
    }],
    ["Lektion → Startseite (Breadcrumb)", async (page) => {
      await page.getByRole("button", { name: /Jetzt starten|Weiterlernen/ }).first().click();
      await page.waitForTimeout(800);
      const crumb = page.locator('nav[aria-label="Brotkrumen"] a, nav[aria-label="Brotkrumen"] button').first();
      await crumb.click({ timeout: 3000 });
    }],
    ["Canvas → Startseite (Breadcrumb)", async (page) => {
      await page.getByRole("button", { name: "Zum Canvas wechseln" }).click();
      await page.waitForTimeout(900);
      const crumb = page.locator('nav[aria-label="Brotkrumen"] a, nav[aria-label="Brotkrumen"] button').first();
      await crumb.click({ timeout: 3000 });
    }],
    ["Schwächen-Drill → Dialog schließen → Dashboard", async (page) => {
      await page.getByRole("button", { name: /Schwächen-Drill starten/ }).click();
      await page.waitForTimeout(800);
      await page.keyboard.press("Escape");
    }],
    ["D&D-Trainer → Escape → Dashboard", async (page) => {
      await page.getByRole("button", { name: /D&D-Trainer öffnen/ }).click();
      await page.waitForTimeout(600);
      await page.keyboard.press("Escape");
    }],
  ];
  for (const [name, fn] of tests) {
    for (const [w, h] of [[1280, 800], [390, 844]]) {
      const { page, ctx } = await newPage(w, h);
      try {
        await fn(page);
        await page.waitForTimeout(700);
        const ok = await dashboardVisible(page);
        record("back-nav", `${name} @${w}px`, ok, ok ? "" : "Dashboard nicht sichtbar");
      } catch (e) {
        record("back-nav", `${name} @${w}px`, false, String(e.message).split("\n")[0]);
      } finally {
        await ctx.close();
      }
    }
  }
}

// ───────────────────────── 3) Webfonts in SVG→PNG (Image-Rendering) ─────────────────────────
{
  const { page, ctx, hosts } = await newPage(1280, 800);
  try {
    const measure = async (pg, mode) => pg.evaluate(async (mode) => {
      await document.fonts.load('700 24px "IBM Plex Sans"');
      await document.fonts.load('400 24px "IBM Plex Mono"');
      await document.fonts.ready;
      const loaded = {
        sans: document.fonts.check('700 24px "IBM Plex Sans"'),
        mono: document.fonts.check('400 24px "IBM Plex Mono"'),
      };
      const text = "Illinois WMmg 0O 10.0.12.1/30";
      const W = 420;
      const H = 60;
      const bbox = (ctx) => {
        const d = ctx.getImageData(0, 0, W, H).data;
        let minX = W, maxX = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 40) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
        return maxX - minX;
      };
      // Referenz: Canvas-Text mit geladener Schrift
      const ref = document.createElement("canvas");
      ref.width = W; ref.height = H;
      const rctx = ref.getContext("2d");
      rctx.font = '700 24px "IBM Plex Sans"';
      rctx.fillText(text, 4, 36);
      const refW = bbox(rctx);
      // Fallback-Referenz
      const fb = document.createElement("canvas");
      fb.width = W; fb.height = H;
      const fctx = fb.getContext("2d");
      fctx.font = '700 24px "Times New Roman"';
      fctx.fillText(text, 4, 36);
      const fbW = bbox(fctx);
      // SVG als <img> (so exportiert die App PNGs)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><text x="4" y="36" font-family="'IBM Plex Sans'" font-weight="700" font-size="24">${text}</text></svg>`;
      let svgW = -1;
      if (mode === "plain") {
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        const c = document.createElement("canvas");
        c.width = W; c.height = H;
        const cctx = c.getContext("2d");
        cctx.drawImage(img, 0, 0);
        svgW = bbox(cctx);
      }
      // Wie die App seit B-31 (src/lib/svg-font-embed.ts): Schrift als data:-URI ins SVG einbetten
      let embW = -1;
      if (mode === "embedded") try {
        let fontUrl = null;
        for (const sheet of document.styleSheets) {
          for (const rule of sheet.cssRules) {
            if (rule.constructor.name === "CSSFontFaceRule" && /IBM Plex Sans/.test(rule.style.fontFamily) && rule.style.fontWeight === "700") {
              const m = /url\("?([^")]+\.woff2)"?\)/.exec(rule.style.getPropertyValue("src"));
              if (m) fontUrl = new URL(m[1], location.href).href;
            }
          }
        }
        const bytes = new Uint8Array(await (await fetch(fontUrl)).arrayBuffer());
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        const css = `@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:700;src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2');}`;
        const injected = svg.replace(/<svg\b[^>]*>/, (open) => `${open}<defs><style type="text/css">${css}</style></defs>`);
        const img2 = new Image();
        img2.src = URL.createObjectURL(new Blob([injected], { type: "image/svg+xml;charset=utf-8" }));
        await new Promise((res, rej) => { img2.onload = res; img2.onerror = rej; });
        const c2 = document.createElement("canvas");
        c2.width = W; c2.height = H;
        const c2ctx = c2.getContext("2d");
        c2ctx.drawImage(img2, 0, 0);
        embW = bbox(c2ctx);
      } catch {
        embW = -1;
      }
      return { loaded, refW, fbW, svgW, embW };
    }, mode);
    const res = await measure(page, "plain");
    // Eingebettete Schrift in frischer Seite messen: ein vorheriges Rendering ohne Einbettung vergiftet den Font-Cache
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page2 = await ctx2.newPage();
    await page2.goto(baseUrl, { waitUntil: "networkidle" });
    const resEmb = await measure(page2, "embedded");
    await ctx2.close();
    res.embW = resEmb.embW;
    record("fonts", "IBM Plex Sans/Mono im Dokument geladen", res.loaded.sans && res.loaded.mono, JSON.stringify(res.loaded));
    const usesPlex = Math.abs(res.svgW - res.refW) <= 2 && Math.abs(res.svgW - res.fbW) > 4;
    record(
      "fonts",
      "Diagnose: SVG ohne Einbettung fällt als <img> auf die Fallback-Schrift zurück (Grund für die Einbettung)",
      !usesPlex && res.svgW === res.fbW,
      `Textbreite: Plex-Referenz ${res.refW}px, Fallback ${res.fbW}px, SVG-Image ohne Einbettung ${res.svgW}px`
    );
    record(
      "fonts",
      "SVG mit eingebetteter Schrift (App-Verfahren) rendert mit IBM Plex",
      res.embW > 0 && Math.abs(res.embW - res.refW) <= 2,
      `Textbreite: Plex-Referenz ${res.refW}px, mit Einbettung ${res.embW}px`
    );
    const external = [...hosts].filter((h) => !/^localhost(:\d+)?$/.test(h));
    record("fonts", "Dashboard-Start ohne externe Hosts", external.length === 0, external.join(", "));
  } finally {
    await ctx.close();
  }
}

// ───────────────────────── 4) axe-core inkl. Farbkontrast ─────────────────────────
{
  const axeSource = fs.readFileSync(path.join(root, "node_modules", "axe-core", "axe.min.js"), "utf8");
  const states = [
    ["Dashboard", async () => {}],
    ["Dashboard + Lernen-Menü", async (page) => {
      await page.getByRole("button", { name: /Lernen/ }).first().click();
      await page.waitForTimeout(300);
    }],
    ["Packet-Tracer-Labs-Dialog", async (page) => {
      await page.getByRole("button", { name: /Packet Tracer Labs/ }).first().click();
      await page.waitForTimeout(700);
    }],
    ["D&D-Trainer", async (page) => {
      await page.getByRole("button", { name: /D&D-Trainer öffnen/ }).click();
      await page.waitForTimeout(600);
    }],
    ["Lektion", async (page) => {
      await page.getByRole("button", { name: /Jetzt starten|Weiterlernen/ }).first().click();
      await page.waitForTimeout(900);
    }],
    ["Canvas v1", async (page) => {
      await page.getByRole("button", { name: "Zum Canvas wechseln" }).click();
      await page.waitForTimeout(1200);
    }],
  ];
  const axeReport = [];
  for (const theme of ["light", "dark"]) {
    for (const [name, prepare] of states) {
      const { page, ctx } = await newPage(1440, 900, theme);
      try {
        await prepare(page);
        await page.evaluate(axeSource);
        const r = await page.evaluate(async () => {
          const res = await window.axe.run(document, { resultTypes: ["violations"] });
          return res.violations.map((v) => ({ id: v.id, impact: v.impact, count: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(" "), summary: (n.failureSummary || "").split("\n").slice(1, 3).join(" ").slice(0, 200) })) }));
        });
        axeReport.push({ theme, state: name, violations: r });
        const total = r.reduce((a, v) => a + v.count, 0);
        record("axe", `${name} (${theme})`, r.length === 0, r.length ? `${r.length} Regeln / ${total} Elemente: ${r.map((v) => `${v.id}×${v.count}`).join(", ")}` : "0 Violations inkl. color-contrast");
      } catch (e) {
        record("axe", `${name} (${theme})`, false, String(e.message).split("\n")[0]);
      } finally {
        await ctx.close();
      }
    }
  }
  fs.writeFileSync(path.join(outDir, "axe-details.json"), JSON.stringify(axeReport, null, 2));
}

await browser.close();
server?.kill();
fs.writeFileSync(path.join(outDir, "browser-audit.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
process.exit(failed.length ? 1 : 0);
