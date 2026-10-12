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

const tempProfileDir = path.join(os.tmpdir(), `dashboard-screenshots-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/redesign-r3-dashboard');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9235;
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

async function applyTheme(ws, theme) {
  await evalExpr(ws, `
    localStorage.setItem('canvas-theme', '${theme}');
    localStorage.setItem('ccna-theme-preference', '${theme}');
    if ('${theme}' === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  `);
  await delay(300);
}

async function setupNewUser(ws) {
  await evalExpr(ws, `
    localStorage.removeItem('ccna-completed-topics');
    localStorage.removeItem('ccna-recent-history');
    localStorage.removeItem('canvas-user-progress');
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', '1');
  `);
  await send(ws, 'Page.reload');
  await delay(1500);
}

async function setupProgressUser(ws) {
  await evalExpr(ws, `
    localStorage.setItem('it-canvas:onboarding:v1:dismissed', '1');
    localStorage.setItem('ccna-completed-topics', JSON.stringify([
      'networking-fundamentals',
      'ios-cli',
      'ipv4-addressing',
      'subnet-segmentation',
      'switching-vlans',
      'stp',
      'routing-ospf'
    ]));
    localStorage.setItem('ccna-recent-history', JSON.stringify([
      {
        id: 'routing-ospf',
        type: 'topic',
        title: 'OSPFv2 Single-Area Routing & Konfiguration',
        timestamp: Date.now() - 7200000
      },
      {
        id: 'switching-vlans',
        type: 'topic',
        title: 'VLANs, 802.1Q Trunks & Inter-VLAN Routing',
        timestamp: Date.now() - 18000000
      }
    ]));
    localStorage.setItem('canvas-user-progress', JSON.stringify({
      'ccna-full-path': {
        pathId: 'ccna-full-path',
        currentStepIndex: 8,
        completedSteps: [
          'step-1-netzwerkgrundlagen',
          'step-2-quiz-netzwerkgrundlagen',
          'step-3-ios-cli',
          'step-4-quiz-ios-cli',
          'step-5-ipv4',
          'step-6-quiz-ipv4',
          'step-7-subnetting'
        ],
        quizScores: {},
        hintsUsed: {},
        startedAt: Date.now() - 86400000 * 3,
        lastActivityAt: Date.now() - 7200000,
        totalTimeSpent: 14200,
        overallScore: 88
      }
    }));
  `);
  await send(ws, 'Page.reload');
  await delay(1500);
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

    // 1. Initial navigation
    await setViewport(pageWs, 1440, 900);
    await send(pageWs, 'Page.navigate', { url: APP_URL });
    await delay(2500);

    // Ensure dismiss onboarding
    await evalExpr(pageWs, `
      const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Überspringen'));
      if (skipBtn) skipBtn.click();
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', '1');
    `);
    await delay(500);

    // ==========================================
    // A) 1440px DESKTOP
    // ==========================================
    console.log('--- 1440px Desktop ---');
    await setViewport(pageWs, 1440, 900);

    // Neuer Nutzer - Dark
    await setupNewUser(pageWs);
    await applyTheme(pageWs, 'dark');
    await captureScreenshot(pageWs, '01_desktop_1440px_dark_new_user.png');

    // Nutzer mit Fortschritt - Dark
    await setupProgressUser(pageWs);
    await applyTheme(pageWs, 'dark');
    await captureScreenshot(pageWs, '02_desktop_1440px_dark_progress.png');

    // Neuer Nutzer - Light
    await setupNewUser(pageWs);
    await applyTheme(pageWs, 'light');
    await captureScreenshot(pageWs, '03_desktop_1440px_light_new_user.png');

    // Nutzer mit Fortschritt - Light
    await setupProgressUser(pageWs);
    await applyTheme(pageWs, 'light');
    await captureScreenshot(pageWs, '04_desktop_1440px_light_progress.png');

    // ==========================================
    // B) 1024px TABLET
    // ==========================================
    console.log('--- 1024px Tablet ---');
    await setViewport(pageWs, 1024, 768);

    // Neuer Nutzer - Dark
    await setupNewUser(pageWs);
    await applyTheme(pageWs, 'dark');
    await captureScreenshot(pageWs, '05_tablet_1024px_dark_new_user.png');

    // Nutzer mit Fortschritt - Dark
    await setupProgressUser(pageWs);
    await applyTheme(pageWs, 'dark');
    await captureScreenshot(pageWs, '06_tablet_1024px_dark_progress.png');

    // Neuer Nutzer - Light
    await setupNewUser(pageWs);
    await applyTheme(pageWs, 'light');
    await captureScreenshot(pageWs, '07_tablet_1024px_light_new_user.png');

    // Nutzer mit Fortschritt - Light
    await setupProgressUser(pageWs);
    await applyTheme(pageWs, 'light');
    await captureScreenshot(pageWs, '08_tablet_1024px_light_progress.png');

    // ==========================================
    // C) 390px MOBILE
    // ==========================================
    console.log('--- 390px Mobile ---');
    await setViewport(pageWs, 390, 844, true, 2);

    // Neuer Nutzer - Dark
    await setupNewUser(pageWs);
    await applyTheme(pageWs, 'dark');
    await captureScreenshot(pageWs, '09_mobile_390px_dark_new_user.png');

    // Nutzer mit Fortschritt - Dark
    await setupProgressUser(pageWs);
    await applyTheme(pageWs, 'dark');
    await captureScreenshot(pageWs, '10_mobile_390px_dark_progress.png');

    // Neuer Nutzer - Light
    await setupNewUser(pageWs);
    await applyTheme(pageWs, 'light');
    await captureScreenshot(pageWs, '11_mobile_390px_light_new_user.png');

    // Nutzer mit Fortschritt - Light
    await setupProgressUser(pageWs);
    await applyTheme(pageWs, 'light');
    await captureScreenshot(pageWs, '12_mobile_390px_light_progress.png');

    console.log('Alle 12 Screenshots erfolgreich aufgenommen!');
  } catch (err) {
    console.error('Fehler bei der Screenshot-Erstellung:', err);
    process.exit(1);
  } finally {
    browserProcess.kill();
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
    process.exit(0);
  }
}

run();
