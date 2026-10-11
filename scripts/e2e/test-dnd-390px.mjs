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
  console.error('Kein Browser gefunden.');
  process.exit(1);
}

const tempProfileDir = path.join(os.tmpdir(), `dnd-test-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const diffDir = path.resolve('docs/screenshots/redesign-r2-diff');
const r2Dir = path.resolve('docs/screenshots/redesign-r2-verification');
if (!fs.existsSync(diffDir)) fs.mkdirSync(diffDir, { recursive: true });
if (!fs.existsSync(r2Dir)) fs.mkdirSync(r2Dir, { recursive: true });

const DEBUG_PORT = 9260;
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

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureScreenshot(ws, filename) {
  const res = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(res.data, 'base64');
  const target = path.join(r2Dir, filename);
  fs.writeFileSync(target, buffer);
  return buffer;
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

    const browserWs = await connectWS(versionData.webSocketDebuggerUrl);
    await send(browserWs, 'Target.setDiscoverTargets', { discover: true });
    const targetInfo = await send(browserWs, 'Target.createTarget', { url: APP_URL });
    const pageWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${targetInfo.targetId}`;
    const pageWs = await connectWS(pageWsUrl);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Runtime.enable');
    await delay(2000);

    // Initialisiere LocalStorage
    await evalExpr(pageWs, `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      document.documentElement.classList.add('dark');
    `);

    // Mobile Viewport: 390 x 844
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await delay(500);

    // Schließe Tour falls offen
    await evalExpr(pageWs, `
      const tourBtn = document.querySelector('button[aria-label="Tour schließen"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Überspringen'));
      if (tourBtn) tourBtn.click();
    `);
    await delay(500);

    // Öffne Mobile-Menü
    await evalExpr(pageWs, `
      const menuBtn = document.querySelector('button[aria-label*="Menü"]') || Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Menü'));
      if (menuBtn) menuBtn.click();
    `);
    await delay(800);

    // Klick auf Drag & Drop Trainer
    await evalExpr(pageWs, `
      const ddBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Drag-&-Drop') || b.textContent.includes('Drag & Drop')));
      if (ddBtn) ddBtn.click();
    `);
    await delay(1200);

    // Ziel-Fragen
    const targetQuestions = [
      { targetIdx: 14, id: 'dd-q0182', label: 'Frage 15 (Windows ipconfig /all)' },
      { targetIdx: 34, id: 'dd-q0928', label: 'Frage 35 (Router2 show ip route)' },
      { targetIdx: 35, id: 'dd-q0936', label: 'Frage 36 (R1 show ip route begin gateway)' },
    ];

    let currentIdx = 0;
    const detailedResults = [];

    for (const t of targetQuestions) {
      const stepsToAdvance = t.targetIdx - currentIdx;
      if (stepsToAdvance > 0) {
        await evalExpr(pageWs, `
          return (async () => {
            for (let i = 0; i < ${stepsToAdvance}; i++) {
              const footer = document.querySelector('div.max-w-4xl div.border-t');
              if (footer) {
                const btns = footer.querySelectorAll('button');
                btns[btns.length - 1].click();
                await new Promise(r => setTimeout(r, 60));
              }
            }
          })();
        `);
        currentIdx = t.targetIdx;
        await delay(300);
      }

      // Prüfe Messwerte im DOM
      const metrics = await evalExpr(pageWs, `
        const docScrollWidth = document.documentElement.scrollWidth;
        const docClientWidth = document.documentElement.clientWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const bodyClientWidth = document.body.clientWidth;

        // Finde den Dialog-Container
        const dialogCard = document.querySelector('div.max-w-4xl');
        const cardScrollWidth = dialogCard ? dialogCard.scrollWidth : 0;
        const cardClientWidth = dialogCard ? dialogCard.clientWidth : 0;

        // Finde den CLI-Exhibit-Block (<pre>)
        const preEl = dialogCard ? dialogCard.querySelector('pre') : null;
        const preOverflowX = preEl ? window.getComputedStyle(preEl).overflowX : 'none';
        const preScrollWidth = preEl ? preEl.scrollWidth : 0;
        const preClientWidth = preEl ? preEl.clientWidth : 0;
        const preTextSnippet = preEl ? preEl.textContent.trim().slice(0, 60) : 'none';

        // Header info im Dialog
        const headerTitle = dialogCard?.querySelector('h2')?.textContent || '';
        const headerSub = dialogCard?.querySelector('p.text-xs')?.textContent || '';
        const headerText = headerTitle + ' · ' + headerSub;

        return {
          headerText,
          hasPageHorizontalScroll: docScrollWidth > docClientWidth + 1 || bodyScrollWidth > bodyClientWidth + 1,
          docScrollWidth,
          docClientWidth,
          cardScrollWidth,
          cardClientWidth,
          hasCardOverflow: cardScrollWidth > cardClientWidth + 1,
          preOverflowX,
          preScrollWidth,
          preClientWidth,
          preTextSnippet,
        };
      `);

      const screenshotFilename = `dd_390px_${t.id}.png`;
      await captureScreenshot(pageWs, screenshotFilename);

      detailedResults.push({
        id: t.id,
        label: t.label,
        metrics,
        screenshot: screenshotFilename,
      });

      console.log(`[D&D Test 390px] ${t.label}:`);
      console.log(`  - Header: ${metrics.headerText}`);
      console.log(`  - Page Scroll: ${metrics.docScrollWidth}px / Client: ${metrics.docClientWidth}px (Horiz Scroll: ${metrics.hasPageHorizontalScroll ? 'JA - FEHLER' : 'NEIN - OK'})`);
      console.log(`  - Card Width: ${metrics.cardClientWidth}px (Overflow: ${metrics.hasCardOverflow ? 'JA' : 'NEIN'})`);
      console.log(`  - CLI <pre> Overflow-X: ${metrics.preOverflowX} (ScrollWidth: ${metrics.preScrollWidth}px, ClientWidth: ${metrics.preClientWidth}px)`);
      console.log(`  - Snippet: "${metrics.preTextSnippet}..."`);
      console.log(`  - Screenshot: ${screenshotFilename}\n`);
    }

    // Speichere Resultate
    const outJson = path.join(diffDir, 'dnd_mobile_audit.json');
    fs.writeFileSync(outJson, JSON.stringify(detailedResults, null, 2));
    console.log(`Ergebnisse gespeichert in ${outJson}`);

    pageWs.close();
    browserWs.close();
  } catch (err) {
    console.error('[D&D Test Error]:', err);
  } finally {
    browserProcess.kill('SIGKILL');
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
  }
}

run();
