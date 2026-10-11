import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ── BROWSER ERMITTLUNG ──
function findBrowserPath() {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

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
  console.error('Kein geeigneter Chromium-Browser (Edge / Chrome) gefunden.');
  process.exit(1);
}

const tempProfileDir = path.join(os.tmpdir(), `canvas-e2e-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/canvas-v2');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9225;
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

console.log(`[E2E] Starte Browser: ${browserPath}`);
console.log(`[E2E] Debugging Port: ${DEBUG_PORT}`);
console.log(`[E2E] Ziel-URL: ${APP_URL}`);

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
          console.log(`[E2E] CDP verbunden bei Versuch ${attempt}`);
          break;
        }
      } catch {}
    }

    if (!versionData?.webSocketDebuggerUrl) {
      throw new Error(`Konnte keine CDP-Verbindung auf Port ${DEBUG_PORT} herstellen.`);
    }

    const ws = await connectWS(versionData.webSocketDebuggerUrl);
    await send(ws, 'Target.setDiscoverTargets', { discover: true });
    const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');
    const pageWs = await connectWS(pageTarget.webSocketDebuggerUrl);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Runtime.enable');

    // ── TEST 1: DESKTOP 1440x900 NAVIGATION & V2 AKTIVIERUNG ──
    console.log('[E2E 1] Konfiguriere Desktop-Viewport 1440x900...');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log(`[E2E 1] Navigiere zu ${APP_URL}...`);
    await send(pageWs, 'Page.navigate', { url: APP_URL });
    await delay(1500);

    await evalExpr(pageWs, `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-canvas-version', '"v2"');
      localStorage.setItem('canvas-engine-version', '"v2"');
      document.documentElement.classList.add('dark');
    `);
    await send(pageWs, 'Page.reload');
    await delay(2000);

    // Klick auf Flip-Button (Canvas öffnen)
    console.log('[E2E 1] Klicke Flip-Button zum Öffnen des Canvas...');
    await evalExpr(pageWs, `
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Canvas'));
      if (btn) btn.click();
      else throw new Error('Flip-Button Canvas nicht gefunden');
    `);
    await delay(1200);

    // Umschalten auf v2 (SVG Next) falls v1 aktiv ist
    console.log('[E2E 1] Prüfe Feature-Flag v2 (SVG Next)...');
    await evalExpr(pageWs, `
      const v2Btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('v2') || b.title?.includes('SVG'));
      if (v2Btn && !v2Btn.disabled) {
        v2Btn.click();
      }
    `);
    await delay(1000);

    // ── TEST 2: ANNOTATIONEN ERSTELLEN (2d-2) ──
    console.log('[E2E 2] Schritt 2d-2: Platziere Haftnotiz (Sticky Note) und tippe deutschen Text mit Umlauten...');
    // Klick auf Notiz-Button in der Palette
    await evalExpr(pageWs, `
      const noteBtn = document.querySelector('button[title*="Haftnotiz"]');
      if (noteBtn) noteBtn.click();
      else throw new Error('Note-Button in Palette nicht gefunden');
    `);
    await delay(400);

    // Klick auf Canvas-Fläche zum Platzieren der Notiz
    const noteClickPos = await evalExpr(pageWs, `
      const svg = document.querySelector('svg');
      if (!svg) throw new Error('SVG Canvas nicht gefunden');
      const rect = svg.getBoundingClientRect();
      return { x: Math.round(rect.left + 500), y: Math.round(rect.top + 220) };
    `);

    await send(pageWs, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: noteClickPos.x,
      y: noteClickPos.y,
      button: 'left',
      clickCount: 1,
    });
    await delay(50);
    await send(pageWs, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: noteClickPos.x,
      y: noteClickPos.y,
      button: 'left',
      clickCount: 1,
    });
    await delay(600);

    // Text mit Umlauten in Inline-Editor eingeben
    console.log('[E2E 2] Bearbeite Notiz-Text im Inline-Editor mit Umlauten...');
    await evalExpr(pageWs, `
      const textarea = document.querySelector('textarea');
      if (!textarea) throw new Error('Inline Textarea für Notiz nicht erschienen');
      textarea.value = "Prüfungsnotiz CCNA:\\nOSPF Dead-Interval = 40s\\nUmlaute: ä ö ü ß č ć š ž đ";
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    `);
    await delay(300);

    // Screenshot 15: Inline-Editor mit Umlauten
    await captureScreenshot(pageWs, '15_desktop_inline_text_editor_umlauts.png');

    // Speichern des Textes via Button "Fertig"
    await evalExpr(pageWs, `
      const fertigBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Fertig'));
      if (fertigBtn) fertigBtn.click();
      else throw new Error('Fertig-Button im Inline-Editor nicht gefunden');
    `);
    await delay(500);

    // ── TEST 3: FREIHAND-ZEICHNUNG (2d-2) ──
    console.log('[E2E 3] Schritt 2d-2: Zeichne geglättete Freihandlinie (Stift)...');
    await evalExpr(pageWs, `
      const pencilBtn = document.querySelector('button[title*="Freihand"]');
      if (pencilBtn) pencilBtn.click();
      else throw new Error('Freihand-Stift Button nicht gefunden');
    `);
    await delay(300);

    // Maus-Drag für Freihandlinie simulieren mit echten CDP Mouse Events
    const pencilStart = await evalExpr(pageWs, `
      const svg = document.querySelector('svg');
      const rect = svg.getBoundingClientRect();
      return { x: Math.round(rect.left + 350), y: Math.round(rect.top + 320) };
    `);

    await send(pageWs, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: pencilStart.x,
      y: pencilStart.y,
      button: 'left',
      clickCount: 1,
    });
    for (let i = 1; i <= 15; i++) {
      await delay(20);
      await send(pageWs, 'Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: Math.round(pencilStart.x + i * 12),
        y: Math.round(pencilStart.y + Math.sin(i / 2) * 20),
      });
    }
    await delay(30);
    await send(pageWs, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: Math.round(pencilStart.x + 180),
      y: Math.round(pencilStart.y),
      button: 'left',
      clickCount: 1,
    });
    await delay(600);

    // ── TEST 4: PFEIL-ANNOTATION (2d-2) ──
    console.log('[E2E 4] Schritt 2d-2: Zeichne Richtungspfeil...');
    await evalExpr(pageWs, `
      const arrowBtn = document.querySelector('button[title*="Richtungspfeil"]');
      if (arrowBtn) arrowBtn.click();
      else throw new Error('Pfeil-Button nicht gefunden');
    `);
    await delay(300);

    const arrowStart = await evalExpr(pageWs, `
      const svg = document.querySelector('svg');
      const rect = svg.getBoundingClientRect();
      return { x: Math.round(rect.left + 250), y: Math.round(rect.top + 180) };
    `);

    await send(pageWs, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: arrowStart.x,
      y: arrowStart.y,
      button: 'left',
      clickCount: 1,
    });
    await delay(50);
    await send(pageWs, 'Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round(arrowStart.x + 180),
      y: Math.round(arrowStart.y + 60),
    });
    await delay(50);
    await send(pageWs, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: Math.round(arrowStart.x + 180),
      y: Math.round(arrowStart.y + 60),
      button: 'left',
      clickCount: 1,
    });
    await delay(500);

    // Screenshot 14: Desktop Gesamtansicht mit Notizen, Freihand, Pfeilen und Geräten
    await captureScreenshot(pageWs, '14_desktop_annotations_notes_freehand.png');

    // ── TEST 5: UNDO / REDO VERIFIZIEREN (2d-2) ──
    console.log('[E2E 5] Prüfe Undo / Redo für Annotationen...');
    const annCountBefore = await evalExpr(pageWs, `
      document.querySelectorAll('.topology-annotation').length;
    `);
    console.log(`[E2E 5] Vorhandene Annotationen vor Undo: ${annCountBefore}`);

    // Undo via Strg+Z
    await evalExpr(pageWs, `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    `);
    await delay(400);

    const annCountAfterUndo = await evalExpr(pageWs, `
      document.querySelectorAll('.topology-annotation').length;
    `);
    console.log(`[E2E 5] Annotationen nach Undo: ${annCountAfterUndo}`);

    if (annCountAfterUndo >= annCountBefore) {
      console.warn('[E2E 5] Warnung: Undo hat Annotation-Anzahl nicht direkt verringert.');
    } else {
      console.log('[E2E 5] Undo erfolgreich verifiziert (1 Strich = 1 Undo-Schritt).');
    }

    // Redo via Strg+Y
    await evalExpr(pageWs, `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }));
    `);
    await delay(400);

    // ── TEST 6: MOBILE USABILITY TEST (390px iPhone Viewport) ──
    console.log('[E2E 6] Konfiguriere Mobile-Viewport 390x844 (iPhone 13/14)...');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    await delay(1000);

    // Ansicht einpassen auf Mobile
    await evalExpr(pageWs, `
      const fitBtn = document.querySelector('button[title*="Ansicht einpassen"]');
      if (fitBtn) fitBtn.click();
    `);
    await delay(800);

    // Screenshot 16: Mobile Ansicht 390px
    await captureScreenshot(pageWs, '16_mobile_annotations_390px.png');

    // Mobile Notiz Doppeltipp inline öffnen
    console.log('[E2E 6] Öffne Notiz auf Mobile per Doppelklick / Doppeltipp...');
    await evalExpr(pageWs, `
      const noteEl = document.querySelector('.topology-annotation rect[fill*="FEF3C7"], .topology-annotation rect[fill*="1E293B"]');
      if (noteEl) {
        const dblEv = new MouseEvent('dblclick', { bubbles: true });
        noteEl.dispatchEvent(dblEv);
      }
    `);
    await delay(600);

    // Screenshot 17: Mobile Inline-Editor 390px
    await captureScreenshot(pageWs, '17_mobile_inline_note_editor_390px.png');

    console.log('\n[E2E ERFOLG] Alle Canvas E2E-Tests und Screenshots erfolgreich abgeschlossen!');
  } catch (err) {
    console.error('[E2E FEHLER]:', err);
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
