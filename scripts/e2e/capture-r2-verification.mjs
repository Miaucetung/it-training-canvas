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

const tempProfileDir = path.join(os.tmpdir(), `r2-verify-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/redesign-r2-verification');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9248;
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

console.log(`[R2 Verify] Starte Browser: ${browserPath}`);

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
  console.log(`  ✓ Screenshot: ${filename} (${Math.round(buffer.length / 1024)} kB)`);
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
          console.log(`[R2 Verify] CDP verbunden bei Versuch ${attempt}`);
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

    console.log('[R2 Verify] Initialisiere Seite...');
    await delay(2000);

    // Initialisiere LocalStorage
    await evalExpr(pageWs, `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-canvas-version', '"v2"');
    `);

    // 1. Dashboard Desktop Dark & Light
    console.log('[R2 Verify] 1. Dashboard Desktop (1440x900)');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '01_dashboard_desktop_dark.png');

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '01_dashboard_desktop_light.png');

    // 2. Dashboard Mobile Dark & Light
    console.log('[R2 Verify] 2. Dashboard Mobile (390x844)');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '02_dashboard_mobile_dark.png');

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '02_dashboard_mobile_light.png');

    // 3. Canvas v2 Desktop Dark & Light
    console.log('[R2 Verify] 3. Canvas v2 Desktop (1440x900)');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await evalExpr(pageWs, `
      const btns = Array.from(document.querySelectorAll('button'));
      const canvasBtn = btns.find(b => b.textContent && b.textContent.includes('Canvas'));
      if (canvasBtn) canvasBtn.click();
    `);
    await delay(800);

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '03_canvas_desktop_dark.png');

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '03_canvas_desktop_light.png');

    // 4. Canvas v2 Mobile Dark & Light
    console.log('[R2 Verify] 4. Canvas v2 Mobile (390x844)');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '04_canvas_mobile_dark.png');

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '04_canvas_mobile_light.png');

    // 5. Exam Prep Dialog Desktop Dark & Light
    console.log('[R2 Verify] 5. Exam Prep Dialog Desktop (1440x900)');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    // Zurück zu Lernen
    await evalExpr(pageWs, `
      const lernenBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Lernen'));
      if (lernenBtn) lernenBtn.click();
    `);
    await delay(800);

    // Klick auf Prüfung
    await evalExpr(pageWs, `
      const examBtn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Prüfung'));
      if (examBtn) examBtn.click();
    `);
    await delay(1000);

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '05_exam_prep_desktop_dark.png');

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '05_exam_prep_desktop_light.png');

    // Dialog schließen via Escape
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27 });
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27 });
    await delay(600);

    // 6. Tools / Simulatoren via Menü-Drawer
    console.log('[R2 Verify] 6. Simulatoren (STP, VLAN, Drag&Drop)');
    // Menü öffnen
    await evalExpr(pageWs, `
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Menü'));
      if (menuBtn) menuBtn.click();
    `);
    await delay(800);

    // Klick auf STP Simulator
    await evalExpr(pageWs, `
      const stpBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.textContent && b.textContent.includes('Spanning Tree') || (b.textContent && b.textContent.includes('STP')));
      if (stpBtn) stpBtn.click();
    `);
    await delay(1000);

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '06_stp_sim_desktop_dark.png');

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '06_stp_sim_desktop_light.png');

    // Schließen
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27 });
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27 });
    await delay(600);

    // Menü öffnen für Drag & Drop
    await evalExpr(pageWs, `
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Menü'));
      if (menuBtn) menuBtn.click();
    `);
    await delay(800);

    await evalExpr(pageWs, `
      const ddBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.textContent && b.textContent.includes('Drag & Drop'));
      if (ddBtn) ddBtn.click();
    `);
    await delay(1200);

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '07_drag_drop_desktop_dark.png');

    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
    `);
    await delay(400);
    await captureScreenshot(pageWs, '07_drag_drop_desktop_light.png');

    // Schließen
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27 });
    await send(pageWs, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27 });
    await delay(600);

    console.log('[R2 Verify] Verifikation abgeschlossen.');
    pageWs.close();
    browserWs.close();
  } catch (err) {
    console.error('[R2 Verify Error]:', err);
  } finally {
    browserProcess.kill('SIGKILL');
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
  }
}

run();
