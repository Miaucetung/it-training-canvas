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
const tempProfileDir = path.join(os.tmpdir(), `verify-fixes-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/fixes-verification');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9265;
const APP_URL = 'http://localhost:5000';

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
        if (data.error) {
          reject(new Error(data.error.message));
        } else {
          resolve(data.result);
        }
      }
    };
  });
}

function sendCommand(ws, method, params = {}) {
  const id = reqId++;
  return new Promise((resolve, reject) => {
    callbacks.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function waitForHttp(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

async function main() {
  await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const verRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const verData = await verRes.json();
  const ws = await connectWS(verData.webSocketDebuggerUrl);

  const newTarget = await sendCommand(ws, 'Target.createTarget', { url: 'about:blank' });
  const targetWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${newTarget.targetId}`;
  const pageWs = await connectWS(targetWsUrl);

  await sendCommand(pageWs, 'Page.enable');
  await sendCommand(pageWs, 'Runtime.enable');
  await sendCommand(pageWs, 'DOM.enable');

  async function capture(filename, width, height, setupFn) {
    console.log(`Erzeuge Screenshot: ${filename} (${width}x${height})...`);
    await sendCommand(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 600,
    });

    await sendCommand(pageWs, 'Page.navigate', { url: APP_URL });
    await new Promise((r) => setTimeout(r, 2000));

    if (setupFn) {
      await sendCommand(pageWs, 'Runtime.evaluate', {
        expression: `(${setupFn.toString()})()`,
        awaitPromise: true,
      });
      await new Promise((r) => setTimeout(r, 1000));
    }

    const screenshotData = await sendCommand(pageWs, 'Page.captureScreenshot', {
      format: 'png',
    });

    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, Buffer.from(screenshotData.data, 'base64'));
    console.log(`Gespeichert: ${filePath}`);
  }

  // 1. Labs Dialog mit nach unten gescrolltem Inhalt
  await capture('01_labs_dialog_scrolled_dark.png', 1440, 900, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    for (let i = 0; i < 30; i++) {
      const b = document.getElementById('nav-btn-labs');
      if (b) {
        b.click();
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 800));
    const dialog = document.querySelector('[role="dialog"]');
    const viewport = dialog?.querySelector('main [data-slot="scroll-area-viewport"]');
    if (viewport) {
      viewport.scrollTop = 900;
    }
  });

  // 2. Subnetting-Quiz Dialog geöffnet (Header, Titel, Close-X & Content vollständig sichtbar)
  await capture('02_subnetting_quiz_dialog_fixed_dark.png', 1440, 900, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    // Open tools menu or click quiz
    for (let i = 0; i < 30; i++) {
      const b = document.getElementById('nav-btn-tools');
      if (b) {
        b.click();
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 500));
    // Click quiz item
    const menu = document.getElementById('nav-menu-tools');
    const quizBtn = Array.from(menu?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Subnetting-Quiz')
    );
    if (quizBtn) quizBtn.click();
  });

  // 3. Dropdown-Menü 'Üben & Prüfen' über Breadcrumbs (oberer Teil nicht mehr verdeckt)
  await capture('03_ueben_pruefen_dropdown_over_breadcrumbs.png', 1440, 900, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    for (let i = 0; i < 30; i++) {
      const b = document.getElementById('nav-btn-practice');
      if (b) {
        b.click();
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  });

  // 4. Mobile 390px: Subnetting Quiz Dialog Header & Controls
  await capture('04_subnetting_quiz_mobile_390px.png', 390, 844, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    // Open mobile menu drawer
    for (let i = 0; i < 30; i++) {
      const b = document.querySelector('button[aria-label="Menü: Navigation und Werkzeuge öffnen"]');
      if (b) {
        b.click();
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 600));
    const quizBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Subnetting-Quiz')
    );
    if (quizBtn) quizBtn.click();
  });

  // 5. Mobile 390px: Labs Dialog Details
  await capture('05_labs_dialog_mobile_390px.png', 390, 844, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    // Open mobile menu drawer
    for (let i = 0; i < 30; i++) {
      const b = document.querySelector('button[aria-label="Menü: Navigation und Werkzeuge öffnen"]');
      if (b) {
        b.click();
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 600));
    const labsBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Packet Tracer Labs')
    );
    if (labsBtn) labsBtn.click();
  });

  // 6. Mobile 390px: Labs Dialog Katalog (List view)
  await capture('06_labs_dialog_mobile_catalog_390px.png', 390, 844, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    for (let i = 0; i < 30; i++) {
      const b = document.querySelector('button[aria-label="Menü: Navigation und Werkzeuge öffnen"]');
      if (b) {
        b.click();
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 600));
    const labsBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Packet Tracer Labs')
    );
    if (labsBtn) labsBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    const katBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lab-Katalog')
    );
    if (katBtn) katBtn.click();
  });

  browserProcess.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  browserProcess.kill();
  process.exit(1);
});
