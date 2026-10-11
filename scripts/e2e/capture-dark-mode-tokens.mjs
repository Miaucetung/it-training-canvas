import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
  console.error('Kein geeigneter Chromium-Browser gefunden.');
  process.exit(1);
}

const tempProfileDir = path.join(os.tmpdir(), `dark-tokens-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/redesign-dark-tokens');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9251;
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

console.log(`[Dark Tokens Capture] Starte Browser: ${browserPath}`);

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
  const target = path.join(outDir, filename);
  fs.writeFileSync(target, buffer);
  console.log(`  ✓ Gespeichert: ${target} (${Math.round(buffer.length / 1024)} kB)`);
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
          console.log(`[Dark Tokens Capture] CDP verbunden bei Versuch ${attempt}`);
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

    console.log('[Dark Tokens Capture] Initialisiere Seite im Dark Mode...');
    await delay(1500);

    // Initialisiere LocalStorage im Dark Mode
    await evalExpr(pageWs, `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-canvas-version', '"v2"');
      document.documentElement.classList.add('dark');
    `);
    await delay(500);

    // 1. Dashboard Desktop Dark
    console.log('[Dark Tokens Capture] 1. Dashboard Desktop Dark (1440x900)...');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    // Sicherstellen, dass wir auf der Lernseite (Dashboard) sind
    await evalExpr(pageWs, `
      const lernenBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Lernen'));
      if (lernenBtn) lernenBtn.click();
    `);
    await delay(1000);
    await captureScreenshot(pageWs, 'dark_01_dashboard_desktop.png');

    // 2. Prüfungsvorbereitung (Dialog über Seite) Desktop Dark
    console.log('[Dark Tokens Capture] 2. Prüfungsvorbereitung Dialog über Seite Desktop Dark (1440x900)...');
    await evalExpr(pageWs, `
      const examBtn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('CCNA Prüfungsvorbereitung'));
      if (examBtn) examBtn.click();
    `);
    await delay(1500);
    await captureScreenshot(pageWs, 'dark_02_exam_prep_dialog.png');

    // Dialog wieder schließen via Klick auf den Schließen-Button (X)
    await evalExpr(pageWs, `
      const headerBtns = Array.from(document.querySelectorAll('div.fixed.inset-0 .shrink-0 button'));
      const closeBtn = headerBtns.pop();
      if (closeBtn) closeBtn.click();
    `);
    await delay(1000);

    // 2b. Modal-Dialog (STP-Simulator) über Dashboard Desktop Dark
    console.log('[Dark Tokens Capture] 2b. Modal-Dialog (STP-Simulator) über Seite Desktop Dark (1440x900)...');
    await evalExpr(pageWs, `
      const stpBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('STP-Simulator'));
      if (stpBtn) stpBtn.click();
    `);
    await delay(1200);
    await captureScreenshot(pageWs, 'dark_02b_stp_dialog_over_page.png');

    // Dialog wieder schließen
    await evalExpr(pageWs, `
      const closeBtns = Array.from(document.querySelectorAll('button'));
      const closeBtn = closeBtns.find(b => b.getAttribute('aria-label') === 'Close' || (b.textContent && b.textContent === 'Schließen') || b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    `);
    await delay(1000);

    // 3. Canvas v2 Desktop Dark
    console.log('[Dark Tokens Capture] 3. Canvas v2 Desktop Dark (1440x900)...');
    await evalExpr(pageWs, `
      const btns = Array.from(document.querySelectorAll('button'));
      const canvasBtn = btns.find(b => b.textContent && b.textContent.includes('Canvas'));
      if (canvasBtn) canvasBtn.click();
    `);
    await delay(1500);
    await captureScreenshot(pageWs, 'dark_03_canvas_v2_desktop.png');

    // 4. Canvas v2 Mobile Dark
    console.log('[Dark Tokens Capture] 4. Canvas v2 Mobile Dark (390x844)...');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await delay(1000);
    await captureScreenshot(pageWs, 'dark_04_canvas_v2_mobile.png');

    console.log('[Dark Tokens Capture] Alle 4 Screenshots erfolgreich erstellt!');

    await pageWs.close();
    await browserWs.close();
    browserProcess.kill();
  } catch (err) {
    console.error('[Dark Tokens Capture] Fehler:', err);
    browserProcess.kill();
    process.exit(1);
  }
}

run();
