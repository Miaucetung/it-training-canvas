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

const tempProfileDir = path.join(os.tmpdir(), `labs-screenshots-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/redesign-labs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9245;
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
    } catch {
      // wait
    }
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
      await pageWs.send(
        JSON.stringify({
          id: reqId++,
          method: 'Runtime.evaluate',
          params: {
            expression: `(${setupFn.toString()})()`,
            awaitPromise: true,
          },
        })
      );
      await new Promise((r) => setTimeout(r, 1200));
    }

    const screenshotData = await sendCommand(pageWs, 'Page.captureScreenshot', {
      format: 'png',
    });

    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, Buffer.from(screenshotData.data, 'base64'));
    console.log(`Gespeichert: ${filePath}`);
  }

  // 1. Desktop Header mit Labs [55] Button
  await capture('01_desktop_1440px_header_labs_button.png', 1440, 900, () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
  });

  // 2. Desktop mit geöffnetem LabScenariosDialog (Dark)
  await capture('02_desktop_1440px_labs_dialog_open_dark.png', 1440, 900, () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    const labsBtn = document.getElementById('nav-btn-labs');
    if (labsBtn) labsBtn.click();
  });

  // 3. Desktop mit geöffnetem LabScenariosDialog (Light)
  await capture('03_desktop_1440px_labs_dialog_open_light.png', 1440, 900, () => {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.remove('dark');
    const labsBtn = document.getElementById('nav-btn-labs');
    if (labsBtn) labsBtn.click();
  });

  // 4. Desktop gefiltert nach OSPF
  await capture('04_desktop_1440px_labs_dialog_ospf_filtered.png', 1440, 900, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    const labsBtn = document.getElementById('nav-btn-labs');
    if (labsBtn) labsBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const input = document.querySelector('input[placeholder*="Thema, OSPF"]');
    if (input) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, 'OSPF');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    await new Promise((r) => setTimeout(r, 400));
    // Click on the second OSPF lab in sidebar
    const items = Array.from(document.querySelectorAll('aside button')).filter(b => b.textContent?.includes('OSPF'));
    if (items[1]) items[1].click();
  });

  // 5. Mobile Drawer mit Packet Tracer Labs Card
  await capture('05_mobile_390px_drawer_labs_card.png', 390, 844, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    const menuBtn = document.querySelector('button[aria-label="Navigation und Werkzeuge öffnen"]');
    if (menuBtn) menuBtn.click();
    await new Promise((r) => setTimeout(r, 300));
    const scrollContainer = document.querySelector('[role="dialog"] .overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 520;
    }
  });

  // 6. Mobile Ansicht mit geöffnetem Dialog
  await capture('06_mobile_390px_labs_dialog.png', 390, 844, async () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
    document.documentElement.classList.add('dark');
    const menuBtn = document.querySelector('button[aria-label="Navigation und Werkzeuge öffnen"]');
    if (menuBtn) menuBtn.click();
    await new Promise((r) => setTimeout(r, 300));
    const openLabsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Packet Tracer Labs'));
    if (openLabsBtn) openLabsBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  });

  console.log('Alle Labs-Screenshots erfolgreich erstellt!');
  browserProcess.kill();
  try {
    fs.rmSync(tempProfileDir, { recursive: true, force: true });
  } catch {}
  process.exit(0);
}

main().catch((err) => {
  console.error('Fehler:', err);
  browserProcess.kill();
  process.exit(1);
});
