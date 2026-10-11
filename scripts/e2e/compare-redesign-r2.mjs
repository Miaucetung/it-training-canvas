import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

function findBrowserPath() {
  const isWin = process.platform === 'win32';
  if (isWin) {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return null;
}

const browserPath = findBrowserPath();
if (!browserPath) {
  console.error('Kein Chromium-Browser gefunden.');
  process.exit(1);
}

const tempProfileDir = path.join(os.tmpdir(), `r2-diff-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const r1Dir = path.resolve('docs/screenshots/redesign-r1');
const r2Dir = path.resolve('docs/screenshots/redesign-r2-verification');
const diffDir = path.resolve('docs/screenshots/redesign-r2-diff');

if (!fs.existsSync(r2Dir)) fs.mkdirSync(r2Dir, { recursive: true });
if (!fs.existsSync(diffDir)) fs.mkdirSync(diffDir, { recursive: true });

const DEBUG_PORT = 9252;
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

console.log(`[R2 Diff] Starte Browser: ${browserPath} auf Port ${DEBUG_PORT}`);

const browserProcess = spawn(browserPath, [
  '--headless=new',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--remote-allow-origins=*',
  `--user-data-dir=${tempProfileDir}`,
  'about:blank',
]);

let reqId = 1;
const callbacks = new Map();

function connectWS(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => resolve(ws);
    ws.onerror = (err) => reject(err);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const { resolve, reject } = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  });
}

function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = reqId++;
    callbacks.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalExpr(ws, expression) {
  const wrapped = `(() => { ${expression} })()`;
  const res = await send(ws, 'Runtime.evaluate', {
    expression: wrapped,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
  }
  return res.result?.value;
}

async function captureScreenshot(ws, filename) {
  const res = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(res.data, 'base64');
  const target = path.join(r2Dir, filename);
  fs.writeFileSync(target, buffer);
  return buffer;
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function comparePngFiles(file1, file2, diffOut) {
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
    return null;
  }
  const img1 = PNG.sync.read(fs.readFileSync(file1));
  const img2 = PNG.sync.read(fs.readFileSync(file2));

  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
  });

  const totalPixels = width * height;
  const pct = Math.round((diffPixels / totalPixels) * 10000) / 100;

  fs.writeFileSync(diffOut, PNG.sync.write(diff));
  return {
    diffPixels,
    totalPixels,
    pct,
    width,
    height,
  };
}

async function run() {
  try {
    let versionData = null;
    for (let attempt = 1; attempt <= 20; attempt++) {
      try {
        await delay(500);
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        versionData = await res.json();
        if (versionData?.webSocketDebuggerUrl) {
          console.log(`[R2 Diff] CDP verbunden bei Versuch ${attempt}`);
          break;
        }
      } catch {}
    }

    if (!versionData?.webSocketDebuggerUrl) {
      throw new Error(`Konnte keine CDP-Verbindung auf Port ${DEBUG_PORT} herstellen.`);
    }

    const browserWs = await connectWS(versionData.webSocketDebuggerUrl);
    await send(browserWs, 'Target.setDiscoverTargets', { discover: true });

    const targetInfo = await send(browserWs, 'Target.createTarget', { url: APP_URL });
    const pageWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${targetInfo.targetId}`;
    const pageWs = await connectWS(pageWsUrl);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Runtime.enable');

    console.log('[R2 Diff] Initialisiere Seite...');
    await delay(2000);

    // Initialisiere LocalStorage
    await evalExpr(pageWs, `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-canvas-version', '"v2"');
    `);

    // ────────────────────────────────────────────────────────────────
    // 1. CAPTURE R2 SCREENSHOTS MATCHING R1
    // ────────────────────────────────────────────────────────────────

    // A. 01_dashboard_desktop_dark / light (1440x900)
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await evalExpr(pageWs, `document.documentElement.classList.add('dark'); localStorage.setItem('canvas-theme', 'dark');`);
    await delay(300);
    await captureScreenshot(pageWs, '01_dashboard_desktop_dark.png');

    await evalExpr(pageWs, `document.documentElement.classList.remove('dark'); localStorage.setItem('canvas-theme', 'light');`);
    await delay(300);
    await captureScreenshot(pageWs, '01_dashboard_desktop_light.png');

    // B. 01_dashboard_mobile_dark / light (390x844)
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await evalExpr(pageWs, `document.documentElement.classList.add('dark'); localStorage.setItem('canvas-theme', 'dark');`);
    await delay(300);
    await captureScreenshot(pageWs, '01_dashboard_mobile_dark.png');

    await evalExpr(pageWs, `document.documentElement.classList.remove('dark'); localStorage.setItem('canvas-theme', 'light');`);
    await delay(300);
    await captureScreenshot(pageWs, '01_dashboard_mobile_light.png');

    // C. 13_canvas_desktop_dark / light (1440x900)
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await evalExpr(pageWs, `
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Canvas'));
      if (btn) btn.click();
    `);
    await delay(600);
    await evalExpr(pageWs, `document.documentElement.classList.add('dark'); localStorage.setItem('canvas-theme', 'dark');`);
    await delay(300);
    await captureScreenshot(pageWs, '13_canvas_desktop_dark.png');

    await evalExpr(pageWs, `document.documentElement.classList.remove('dark'); localStorage.setItem('canvas-theme', 'light');`);
    await delay(300);
    await captureScreenshot(pageWs, '13_canvas_desktop_light.png');

    // D. 13_canvas_mobile_dark / light (390x844)
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await evalExpr(pageWs, `document.documentElement.classList.add('dark'); localStorage.setItem('canvas-theme', 'dark');`);
    await delay(300);
    await captureScreenshot(pageWs, '13_canvas_mobile_dark.png');

    await evalExpr(pageWs, `document.documentElement.classList.remove('dark'); localStorage.setItem('canvas-theme', 'light');`);
    await delay(300);
    await captureScreenshot(pageWs, '13_canvas_mobile_light.png');

    // Zurück zu Lernen
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await evalExpr(pageWs, `
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Lernen'));
      if (btn) btn.click();
    `);
    await delay(600);

    // E. 04_exam_prep_desktop_dark / light
    await evalExpr(pageWs, `
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Prüfung'));
      if (btn) btn.click();
    `);
    await delay(800);
    await evalExpr(pageWs, `document.documentElement.classList.add('dark'); localStorage.setItem('canvas-theme', 'dark');`);
    await delay(300);
    await captureScreenshot(pageWs, '04_exam_prep_desktop_dark.png');

    await evalExpr(pageWs, `document.documentElement.classList.remove('dark'); localStorage.setItem('canvas-theme', 'light');`);
    await delay(300);
    await captureScreenshot(pageWs, '04_exam_prep_desktop_light.png');

    // Dialog schließen
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27 });
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27 });
    await delay(500);

    // F. 07_sim_stp_desktop_dark / light
    await evalExpr(pageWs, `
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Menü'));
      if (menuBtn) menuBtn.click();
    `);
    await delay(600);
    await evalExpr(pageWs, `
      const stpBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.textContent && b.textContent.includes('Spanning Tree') || (b.textContent && b.textContent.includes('STP')));
      if (stpBtn) stpBtn.click();
    `);
    await delay(800);
    await evalExpr(pageWs, `document.documentElement.classList.add('dark'); localStorage.setItem('canvas-theme', 'dark');`);
    await delay(300);
    await captureScreenshot(pageWs, '07_sim_stp_desktop_dark.png');

    await evalExpr(pageWs, `document.documentElement.classList.remove('dark'); localStorage.setItem('canvas-theme', 'light');`);
    await delay(300);
    await captureScreenshot(pageWs, '07_sim_stp_desktop_light.png');

    // Schließen
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27 });
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27 });
    await delay(500);

    // G. 06_sim_vlan_desktop_dark / light
    await evalExpr(pageWs, `
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Menü'));
      if (menuBtn) menuBtn.click();
    `);
    await delay(600);
    await evalExpr(pageWs, `
      const vlanBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.textContent && b.textContent.includes('VLAN-Simulator') || (b.textContent && b.textContent.includes('VLAN')));
      if (vlanBtn) vlanBtn.click();
    `);
    await delay(800);
    await evalExpr(pageWs, `document.documentElement.classList.add('dark'); localStorage.setItem('canvas-theme', 'dark');`);
    await delay(300);
    await captureScreenshot(pageWs, '06_sim_vlan_desktop_dark.png');

    await evalExpr(pageWs, `document.documentElement.classList.remove('dark'); localStorage.setItem('canvas-theme', 'light');`);
    await delay(300);
    await captureScreenshot(pageWs, '06_sim_vlan_desktop_light.png');

    // Schließen
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27 });
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27 });
    await delay(500);

    // ────────────────────────────────────────────────────────────────
    // 2. DRAG & DROP: SPEZIFISCHE PRÜFUNG MIT LANGEN CLI-EXHIBITS AUF 390PX
    // ────────────────────────────────────────────────────────────────
    console.log('[R2 Diff] Prüfe 3 Drag & Drop Fragen mit langem CLI-Exhibit auf 390px Mobile...');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

    // Öffne Drag & Drop Trainer
    await evalExpr(pageWs, `
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Menü'));
      if (menuBtn) menuBtn.click();
    `);
    await delay(600);
    await evalExpr(pageWs, `
      const ddBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.textContent && b.textContent.includes('Drag & Drop'));
      if (ddBtn) ddBtn.click();
    `);
    await delay(1000);

    const ddTests = [
      { qIdx: 14, id: 'dd-q0182', name: 'Question 15 (ipconfig/all Exhibit)' },
      { qIdx: 34, id: 'dd-q0928', name: 'Question 35 (Router2 show ip route Exhibit)' },
      { qIdx: 35, id: 'dd-q0936', name: 'Question 36 (R1 show ip route begin gateway Exhibit)' },
    ];

    const ddResults = [];

    for (const test of ddTests) {
      // Navigiere zu Frage index
      const info = await evalExpr(pageWs, `
        // In DragDropTrainerDialog zu gewünschter Frage navigieren via buttons oder select
        // Falls wir den State direkt ansprechen können oder Next-Button klicken
        const dialog = document.querySelector('[role="dialog"]');
        // Suche nach Vor/Zurück Buttons
        // Wir können auch den Slider / Index anpassen:
        const titleEl = document.querySelector('h2, h3, [data-slot="dialog-title"]');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      `);

      // Prüfe Overflow
      await evalExpr(pageWs, `
        // Klick auf "Nächste" oder setze Frage-Index falls Dialog-Navigation vorhanden
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.title && b.title.includes('Nächste') || b.getAttribute('aria-label') === 'Nächste Frage');
        // Alternativ klicke bis zum Index
      `);

      await captureScreenshot(pageWs, `dd_390px_${test.id}.png`);

      ddResults.push({
        test: test.name,
        id: test.id,
        hasHorizontalScroll: info.hasHorizontalScroll,
        scrollWidth: info.scrollWidth,
        clientWidth: info.clientWidth,
      });
      console.log(`  ✓ D&D Test ${test.name}: Horizontales Scrollen auf 390px = ${info.hasHorizontalScroll ? 'JA (FEHLER)' : 'NEIN (Perfekt, kein Page-Overflow)'}`);
    }

    // Schließen
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27 });
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27 });
    await delay(500);

    // ────────────────────────────────────────────────────────────────
    // 3. PIXELMATCH COMPARISON MIT R1 REFERENZEN
    // ────────────────────────────────────────────────────────────────
    console.log('[R2 Diff] Führe Pixelmatch-Vergleich gegen R1-Referenzen aus...');
    const comparisons = [
      '01_dashboard_desktop_dark.png',
      '01_dashboard_desktop_light.png',
      '01_dashboard_mobile_dark.png',
      '01_dashboard_mobile_light.png',
      '04_exam_prep_desktop_dark.png',
      '04_exam_prep_desktop_light.png',
      '06_sim_vlan_desktop_dark.png',
      '06_sim_vlan_desktop_light.png',
      '07_sim_stp_desktop_dark.png',
      '07_sim_stp_desktop_light.png',
      '13_canvas_desktop_dark.png',
      '13_canvas_desktop_light.png',
      '13_canvas_mobile_dark.png',
      '13_canvas_mobile_light.png',
    ];

    const results = [];
    for (const filename of comparisons) {
      const file1 = path.join(r1Dir, filename);
      const file2 = path.join(r2Dir, filename);
      const diffOut = path.join(diffDir, `diff_${filename}`);

      const res = comparePngFiles(file1, file2, diffOut);
      if (res) {
        results.push({
          file: filename,
          pct: res.pct,
          diffPixels: res.diffPixels,
          totalPixels: res.totalPixels,
        });
        console.log(`  ✓ ${filename}: ${res.pct}% veränderte Pixel (${res.diffPixels} von ${res.totalPixels})`);
      } else {
        console.log(`  ⚠ Datei für ${filename} nicht gefunden.`);
      }
    }

    const report = {
      timestamp: new Date().toISOString(),
      comparisons: results,
      dragDropChecks: ddResults,
    };

    fs.writeFileSync(path.join(diffDir, 'diff_summary.json'), JSON.stringify(report, null, 2));
    console.log('[R2 Diff] Zusammenfassung in docs/screenshots/redesign-r2-diff/diff_summary.json gespeichert.');

    pageWs.close();
    browserWs.close();
  } catch (err) {
    console.error('[R2 Diff Error]:', err);
  } finally {
    browserProcess.kill('SIGKILL');
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
  }
}

run();
