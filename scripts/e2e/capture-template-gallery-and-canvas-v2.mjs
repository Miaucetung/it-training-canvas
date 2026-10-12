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

const tempProfileDir = path.join(os.tmpdir(), `v2-templates-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/canvas-v2-fixes');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9257;
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
  return new Promise((resolve, reject) => {
    const id = reqId++;
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
  const ready = await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  if (!ready) {
    console.error('Browser CDP nicht erreichbar');
    browserProcess.kill();
    process.exit(1);
  }

  const verRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const verData = await verRes.json();
  const ws = await connectWS(verData.webSocketDebuggerUrl);

  const newTarget = await sendCommand(ws, 'Target.createTarget', { url: 'about:blank' });
  const targetWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${newTarget.targetId}`;
  const pageWs = await connectWS(targetWsUrl);

  await sendCommand(pageWs, 'Page.enable');
  await sendCommand(pageWs, 'Runtime.enable');
  await sendCommand(pageWs, 'DOM.enable');

  let scriptIdentifier = null;

  async function captureItem({ filename, width, height, engine = 'v2', theme = 'dark', openTemplates = true, isMobile = false }) {
    console.log(`Erzeuge Screenshot: ${filename} (${width}x${height}, engine=${engine}, theme=${theme})...`);

    if (scriptIdentifier) {
      await sendCommand(pageWs, 'Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptIdentifier });
    }

    const scriptRes = await sendCommand(pageWs, 'Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          localStorage.setItem('hasSeenOnboarding', 'true');
          localStorage.setItem('ccna-canvas-version', JSON.stringify('${engine}'));
          localStorage.setItem('canvas-theme', '${theme}');
          if ('${theme}' === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
          }
        } catch (e) {}
      `,
    });
    scriptIdentifier = scriptRes.identifier;

    await sendCommand(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile,
    });

    await sendCommand(pageWs, 'Page.navigate', { url: APP_URL });
    await new Promise((r) => setTimeout(r, 2000));

    // Flip to Canvas & open modal if required
    await sendCommand(pageWs, 'Runtime.evaluate', {
      expression: `(async () => {
        // Skip onboarding if present
        const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Überspringen'));
        if (skipBtn) skipBtn.click();

        ${
          isMobile
            ? `
          const hamburger = document.querySelector('button[aria-label*="Navigation"], button[aria-label*="Menü"]');
          if (hamburger) hamburger.click();
          await new Promise(r => setTimeout(r, 300));

          const canvasMobile = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Canvas'));
          if (canvasMobile) canvasMobile.click();
          await new Promise(r => setTimeout(r, 300));

          if (${openTemplates}) {
            const hamburger2 = document.querySelector('button[aria-label*="Navigation"], button[aria-label*="Menü"]');
            if (hamburger2) hamburger2.click();
            await new Promise(r => setTimeout(r, 300));

            const tplMobile = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Vorlagen'));
            if (tplMobile) tplMobile.click();
            await new Promise(r => setTimeout(r, 400));
          }
        `
            : `
          const canvasBtn = document.querySelector('button[aria-label*="Canvas"], button[title*="Canvas"]');
          if (canvasBtn) canvasBtn.click();
          await new Promise(r => setTimeout(r, 400));

          if (${openTemplates}) {
            const werkzeugeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Werkzeuge'));
            if (werkzeugeBtn) werkzeugeBtn.click();
            await new Promise(r => setTimeout(r, 300));

            const tplBtn = Array.from(document.querySelectorAll('button, div[role="menuitem"]')).find(b => b.textContent && b.textContent.includes('Topologie-Vorlagen'));
            if (tplBtn) tplBtn.click();
            await new Promise(r => setTimeout(r, 400));
          }
        `
        }
      })()`,
      awaitPromise: true,
    });

    await new Promise((r) => setTimeout(r, 1000));

    const screenshotData = await sendCommand(pageWs, 'Page.captureScreenshot', {
      format: 'png',
    });

    const buffer = Buffer.from(screenshotData.data, 'base64');
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Gespeichert: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  try {
    // 1. Canvas v2 Übersicht (ohne Seitenleiste) - 1440px Dark
    await captureItem({
      filename: '01-canvas-v2-1440px-no-sidebar-dark.png',
      width: 1440,
      height: 900,
      engine: 'v2',
      theme: 'dark',
      openTemplates: false,
    });

    // 2. Canvas v2 mit Vorlagen-Dialog - 1440px Dark
    await captureItem({
      filename: '02-v2-templates-dialog-1440px-dark.png',
      width: 1440,
      height: 900,
      engine: 'v2',
      theme: 'dark',
      openTemplates: true,
    });

    // 3. Canvas v2 mit Vorlagen-Dialog - 1024px Dark
    await captureItem({
      filename: '03-v2-templates-dialog-1024px-dark.png',
      width: 1024,
      height: 768,
      engine: 'v2',
      theme: 'dark',
      openTemplates: true,
    });

    // 4. Canvas v2 mit Vorlagen-Dialog - 390px Dark
    await captureItem({
      filename: '04-v2-templates-dialog-390px-dark.png',
      width: 390,
      height: 844,
      engine: 'v2',
      theme: 'dark',
      openTemplates: true,
      isMobile: true,
    });

    // 5. Canvas v2 mit Vorlagen-Dialog - 1440px Light
    await captureItem({
      filename: '05-v2-templates-dialog-1440px-light.png',
      width: 1440,
      height: 900,
      engine: 'v2',
      theme: 'light',
      openTemplates: true,
    });

    // 6. v1 Vorlagen-Galerie - 1440px Dark (nur CCNA, keine Sterne)
    await captureItem({
      filename: '06-v1-template-gallery-1440px-dark.png',
      width: 1440,
      height: 900,
      engine: 'v1',
      theme: 'dark',
      openTemplates: true,
    });

    // 7. v1 Vorlagen-Galerie - 1440px Light
    await captureItem({
      filename: '07-v1-template-gallery-1440px-light.png',
      width: 1440,
      height: 900,
      engine: 'v1',
      theme: 'light',
      openTemplates: true,
    });

    console.log('Alle 7 Screenshots erfolgreich und sauber erzeugt!');
  } finally {
    browserProcess.kill();
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error('Fehler bei Screenshot-Erstellung:', err);
  browserProcess.kill();
  process.exit(1);
});
