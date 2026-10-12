import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

function findBrowserPath() {
  const isWin = process.platform === 'win32';
  if (isWin) {
    const candidates = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
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
  console.error('Kein Browser gefunden.');
  process.exit(1);
}

const tempProfileDir = path.join(os.tmpdir(), `nav-screenshots-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/redesign-r3-navigation');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9230;
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

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
  const fullPath = path.join(outDir, filename);
  fs.writeFileSync(fullPath, buffer);
  console.log(`[Screenshot] ${filename} (${buffer.length} Bytes) gespeichert.`);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function setViewport(ws, width, height, mobile = false, scale = 1) {
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile,
  });
  await delay(400);
}

async function run() {
  try {
    let versionData = null;
    for (let attempt = 1; attempt <= 20; attempt++) {
      try {
        await delay(500);
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        versionData = await res.json();
        if (versionData?.webSocketDebuggerUrl) break;
      } catch {}
    }

    if (!versionData?.webSocketDebuggerUrl) {
      throw new Error(`CDP connection failed on port ${DEBUG_PORT}`);
    }

    const ws = await connectWS(versionData.webSocketDebuggerUrl);
    await send(ws, 'Target.setDiscoverTargets', { discover: true });
    const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');
    const pageWs = await connectWS(pageTarget.webSocketDebuggerUrl);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Runtime.enable');

    // Initial navigation
    await setViewport(pageWs, 1440, 900);
    await send(pageWs, 'Page.navigate', { url: APP_URL });
    await delay(2500);

    // Initial setup: dismiss onboarding tour & set dark theme
    await evalExpr(pageWs, `
      const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Überspringen'));
      if (skipBtn) skipBtn.click();
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', '1');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-theme-preference', 'dark');
    `);
    await delay(300);

    // Helper functions for theme switching
    const setDark = async () => {
      await evalExpr(pageWs, `
        const darkBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Dunkel');
        if (darkBtn) darkBtn.click();
        else {
          const cycleBtn = Array.from(document.querySelectorAll('header button')).find(b => b.title && b.title.includes('Theme'));
          if (cycleBtn && !document.documentElement.classList.contains('dark')) cycleBtn.click();
        }
      `);
      await delay(500);
    };

    const setLight = async () => {
      await evalExpr(pageWs, `
        const lightBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Hell');
        if (lightBtn) lightBtn.click();
        else {
          const cycleBtn = Array.from(document.querySelectorAll('header button')).find(b => b.title && b.title.includes('Theme'));
          if (cycleBtn && document.documentElement.classList.contains('dark')) cycleBtn.click();
        }
      `);
      await delay(500);
    };

    // 1. DESKTOP 1440px
    console.log('[1/14] Desktop 1440px Dark Dashboard...');
    await setViewport(pageWs, 1440, 900);
    await setDark();
    await captureScreenshot(pageWs, '01_desktop_1440px_dark_dashboard.png');

    console.log('[2/14] Desktop 1440px Light Dashboard...');
    await setLight();
    await captureScreenshot(pageWs, '02_desktop_1440px_light_dashboard.png');

    // 2. DESKTOP 1280px (Breakpoint xl: volle 4 Gruppen Navigation einzeilig)
    console.log('[3/14] Desktop 1280px Dark Dashboard (Breakpoint xl)...');
    await setViewport(pageWs, 1280, 800);
    await setDark();
    await captureScreenshot(pageWs, '03_desktop_1280px_dark_dashboard.png');

    console.log('[4/14] Desktop 1280px Light Dashboard...');
    await setLight();
    await captureScreenshot(pageWs, '04_desktop_1280px_light_dashboard.png');

    // 3. TABLET LANDSCAPE 1024px (Breakpoint: Schaltet nahtlos auf Drawer-Menü um)
    console.log('[5/14] Tablet 1024px Dark Dashboard (Drawer-Modus)...');
    await setViewport(pageWs, 1024, 768);
    await setDark();
    await captureScreenshot(pageWs, '05_tablet_1024px_dark_dashboard.png');

    console.log('[6/14] Tablet 1024px Light Dashboard...');
    await setLight();
    await captureScreenshot(pageWs, '06_tablet_1024px_light_dashboard.png');

    // 4. TABLET PORTRAIT 768px (Drawer-Modus)
    console.log('[7/14] Tablet 768px Dark Dashboard...');
    await setViewport(pageWs, 768, 1024);
    await setDark();
    await captureScreenshot(pageWs, '07_tablet_768px_dark_dashboard.png');

    console.log('[8/14] Tablet 768px Light Dashboard...');
    await setLight();
    await captureScreenshot(pageWs, '08_tablet_768px_light_dashboard.png');

    // 5. MOBILE 390px (Smartphone)
    console.log('[9/14] Mobile 390px Dark Dashboard...');
    await setViewport(pageWs, 390, 844, true, 2);
    await setDark();
    await captureScreenshot(pageWs, '09_mobile_390px_dark_dashboard.png');

    console.log('[10/14] Mobile 390px Light Dashboard...');
    await setLight();
    await captureScreenshot(pageWs, '10_mobile_390px_light_dashboard.png');

    // 6. MOBILE DRAWER GEÖFFNET
    console.log('[11/14] Mobile 390px Navigation Drawer geöffnet (Dark)...');
    await setDark();
    await evalExpr(pageWs, `
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Menü'));
      if (menuBtn) menuBtn.click();
    `);
    await delay(600);
    await captureScreenshot(pageWs, '11_mobile_390px_dark_drawer_open.png');

    // Schließe Drawer
    await evalExpr(pageWs, `
      const closeBtn = document.querySelector('button[aria-label="Menü schließen"]');
      if (closeBtn) closeBtn.click();
    `);
    await delay(500);

    // 7. DESKTOP SIMULATOREN MENÜ GEÖFFNET (Dark & Light)
    console.log('[12/14] Desktop 1440px Simulatoren Menü geöffnet (Dark)...');
    await setViewport(pageWs, 1440, 900);
    await setDark();
    await evalExpr(pageWs, `
      const nav = document.querySelector('nav[aria-label="Hauptnavigation"]');
      if (nav) {
        const simBtn = Array.from(nav.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Simulatoren'));
        if (simBtn) simBtn.click();
      }
    `);
    await delay(600);
    await captureScreenshot(pageWs, '12_desktop_1440px_dark_simulators_menu.png');

    // Schließe Menü
    await evalExpr(pageWs, `document.body.click();`);
    await delay(400);

    // 8. CANVAS VIEW MIT BREADCRUMB "Topologie-Canvas (v2)"
    console.log('[13/14] Desktop 1440px Canvas Ansicht mit Breadcrumbs (Dark)...');
    await evalExpr(pageWs, `
      const flipBtn = document.querySelector('button[aria-label="Zum Canvas wechseln"]');
      if (flipBtn) flipBtn.click();
    `);
    await delay(1200);
    await captureScreenshot(pageWs, '13_desktop_1440px_dark_canvas_v2.png');

    console.log('[14/14] Desktop 1440px Canvas Ansicht (Light)...');
    await setLight();
    await delay(600);
    await captureScreenshot(pageWs, '14_desktop_1440px_light_canvas_v2.png');

    console.log('Alle 14 Screenshots erfolgreich aufgenommen!');
  } catch (err) {
    console.error('Fehler bei Screenshot-Erstellung:', err);
  } finally {
    try {
      browserProcess.kill();
    } catch {}
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
    process.exit(0);
  }
}

run();
