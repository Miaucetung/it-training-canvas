import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

function findBrowserPath() {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

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
  } else if (isMac) {
    const candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  } else {
    const candidates = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/microsoft-edge',
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return null;
}

const browserPath = findBrowserPath();
if (!browserPath) {
  console.error('Kein geeigneter Chromium-Browser (Chrome / Edge) gefunden.');
  process.exit(1);
}

const tempProfileDir = path.join(os.tmpdir(), `canvas-2d3-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/canvas-v2');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9232;
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

console.log(`[E2E 2d-3] Starte Browser: ${browserPath}`);
console.log(`[E2E 2d-3] Debugging Port: ${DEBUG_PORT}`);
console.log(`[E2E 2d-3] Ziel-URL: ${APP_URL}`);

const browserProcess = spawn(browserPath, [
  '--headless=new',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--remote-allow-origins=*',
  `--user-data-dir=${tempProfileDir}`,
  'about:blank',
]);

browserProcess.stderr.on('data', (d) => {
  const str = d.toString();
  if (str.includes('ERROR') || str.includes('Fatal')) console.error('[Browser err]:', str);
});

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
          console.log(`[E2E 2d-3] CDP verbunden bei Versuch ${attempt}`);
          break;
        }
      } catch {}
    }

    if (!versionData?.webSocketDebuggerUrl) {
      throw new Error(`Konnte keine CDP-Verbindung auf Port ${DEBUG_PORT} herstellen.`);
    }

    const ws = await connectWS(versionData.webSocketDebuggerUrl);
    await send(ws, 'Target.setDiscoverTargets', { discover: true });
    
    const targetInfo = await send(ws, 'Target.createTarget', { url: APP_URL });
    const targetWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${targetInfo.targetId}`;
    const pageWs = await connectWS(targetWsUrl);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Runtime.enable');

    // ── 1. SETUP DESKTOP VIEWPORT 1440x900 ──
    console.log('[E2E 2d-3] Setze Desktop-Viewport 1440x900...');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await delay(1500);

    // Initialisiere LocalStorage mit Version v2
    await evalExpr(pageWs, `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-canvas-version', '"v2"');
      localStorage.setItem('canvas-engine-version', '"v2"');
      document.documentElement.classList.add('dark');
    `);
    await send(pageWs, 'Page.reload');
    await delay(2500);

    // Klick auf Flip-Button (Canvas öffnen)
    console.log('[E2E 2d-3] Klicke Flip-Button...');
    await evalExpr(pageWs, `
      const flipBtn = document.querySelector('button[title="Zum Canvas wechseln"]') ||
        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Canvas'));
      if (flipBtn) flipBtn.click();
      else throw new Error('Flip-Button Canvas nicht gefunden');
    `);
    await delay(1500);

    // Sicherstellen, dass v2 aktiv ist
    console.log('[E2E 2d-3] Prüfe v2 SVG Next Modus...');
    await evalExpr(pageWs, `
      const v2Btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent && b.textContent.trim() === 'v2 (SVG Next)' && !b.disabled
      );
      if (v2Btn) v2Btn.click();
    `);
    await delay(1200);

    // ── 2. SCREENSHOT 18: GERÄTE-KONFIGURATIONSDIALOG (Desktop) ──
    console.log('[E2E 2d-3] Wähle erstes Gerät auf dem Canvas aus...');
    await evalExpr(pageWs, `
      const dev = document.querySelector('.topology-device');
      if (!dev) throw new Error('Kein .topology-device auf dem Canvas gefunden');
      dev.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      dev.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    `);
    await delay(800);

    console.log('[E2E 2d-3] Klicke auf "Konfigurieren" im Detail-Panel...');
    await evalExpr(pageWs, `
      const btn = document.querySelector('button[title="Gerät konfigurieren"]');
      if (!btn) throw new Error('Konfigurieren-Button nicht gefunden');
      btn.click();
    `);
    await delay(800);

    console.log('[E2E 2d-3] Erstelle Screenshot 18: Desktop Device Config Dialog...');
    await captureScreenshot(pageWs, '18_desktop_device_config_dialog.png');

    // ── 3. SCREENSHOT 19: CISCO CLI LIVE INSPECTOR TAB ──
    console.log('[E2E 2d-3] Wechsle zu CLI-Tab im Dialog...');
    await evalExpr(pageWs, `
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) throw new Error('Config-Dialog nicht offen');
      const cliTab = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('CLI'));
      if (!cliTab) throw new Error('CLI Tab im Dialog nicht gefunden');
      cliTab.click();
    `);
    await delay(800);

    console.log('[E2E 2d-3] Erstelle Screenshot 19: Cisco CLI Live Inspector Tab...');
    await captureScreenshot(pageWs, '19_desktop_cisco_cli_inspector_tab.png');

    // Schließe Device Config Dialog
    console.log('[E2E 2d-3] Schließe Device Config Dialog...');
    await evalExpr(pageWs, `
      const closeBtn = document.querySelector('[aria-labelledby="device-dialog-title"] button');
      if (closeBtn) closeBtn.click();
      else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `);
    await delay(800);

    // ── 4. SCREENSHOT 20: TOPOLOGIE STORAGE & EXPORT DIALOG ──
    console.log('[E2E 2d-3] Öffne Speichern & Export Dialog...');
    await evalExpr(pageWs, `
      const storageBtn = document.querySelector('button[title*="Topologie speichern"]');
      if (!storageBtn) throw new Error('Speichern-Button in Toolbar nicht gefunden');
      storageBtn.click();
    `);
    await delay(800);

    // Wechsle auf Export-Tab im Storage-Dialog
    console.log('[E2E 2d-3] Wechsle auf Export-Tab im Storage-Dialog...');
    await evalExpr(pageWs, `
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) throw new Error('Storage-Dialog nicht offen');
      const exportTab = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Export'));
      if (!exportTab) throw new Error('Export Tab im Storage-Dialog nicht gefunden');
      exportTab.click();
    `);
    await delay(800);

    console.log('[E2E 2d-3] Erstelle Screenshot 20: Topology Storage Dialog (Export Tab)...');
    await captureScreenshot(pageWs, '20_desktop_topology_storage_dialog.png');

    // Schließe Storage Dialog
    console.log('[E2E 2d-3] Schließe Storage Dialog...');
    await evalExpr(pageWs, `
      const closeBtn = document.querySelector('[aria-labelledby="storage-dialog-title"] button');
      if (closeBtn) closeBtn.click();
      else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `);
    await delay(800);

    // ── 5. SCREENSHOT 21: MOBILE VIEWPORT 390x844 DEVICE CONFIG DIALOG ──
    console.log('[E2E 2d-3] Setze Mobile-Viewport 390x844 (iPhone 13/14)...');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    await delay(1200);

    // Ansicht einpassen auf Mobile
    console.log('[E2E 2d-3] Ansicht einpassen auf Mobile...');
    await evalExpr(pageWs, `
      const fitBtn = document.querySelector('button[title*="Ansicht einpassen"]');
      if (fitBtn) fitBtn.click();
    `);
    await delay(800);

    // Wähle ein Gerät auf Mobile aus
    console.log('[E2E 2d-3] Tippe auf Gerät auf Mobile...');
    await evalExpr(pageWs, `
      const dev = document.querySelector('.topology-device');
      if (!dev) throw new Error('Kein Gerät auf Mobile');
      dev.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      dev.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    `);
    await delay(800);

    // Klicke auf Konfigurieren im mobilen Detail-Panel
    console.log('[E2E 2d-3] Klicke Konfigurieren auf Mobile...');
    await evalExpr(pageWs, `
      const btn = document.querySelector('button[title="Gerät konfigurieren"]');
      if (!btn) throw new Error('Konfigurieren auf Mobile nicht gefunden');
      btn.click();
    `);
    await delay(800);

    console.log('[E2E 2d-3] Erstelle Screenshot 21: Mobile Device Config Dialog 390px...');
    await captureScreenshot(pageWs, '21_mobile_device_config_dialog_390px.png');

    console.log('\n[E2E 2d-3 ERFOLG] Alle Schritt 2d-3 Screenshots erfolgreich erstellt!');
  } catch (err) {
    console.error('[E2E 2d-3 FEHLER]:', err);
    process.exitCode = 1;
  } finally {
    try {
      browserProcess.kill();
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
    process.exit(process.exitCode || 0);
  }
}

run();
