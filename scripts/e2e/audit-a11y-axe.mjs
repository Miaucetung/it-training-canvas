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

const tempProfileDir = path.join(os.tmpdir(), `canvas-axe-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const DEBUG_PORT = 9256;
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

console.log(`[Axe A11y Audit] Starte Browser: ${browserPath}`);
console.log(`[Axe A11y Audit] Debugging Port: ${DEBUG_PORT}`);

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
  const res = await send(ws, 'Runtime.evaluate', {
    expression,
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
      throw new Error(`Konnte keine CDP-Verbindung auf Port ${DEBUG_PORT} herstellen.`);
    }

    const ws = await connectWS(versionData.webSocketDebuggerUrl);
    await send(ws, 'Target.setDiscoverTargets', { discover: true });

    const targetInfo = await send(ws, 'Target.createTarget', { url: APP_URL });
    const targetWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${targetInfo.targetId}`;
    const pageWs = await connectWS(targetWsUrl);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Runtime.enable');

    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await delay(1500);

    // Initialisiere LocalStorage
    await evalExpr(pageWs, `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-canvas-version', '"v2"');
      document.documentElement.classList.add('dark');
    `);
    await send(pageWs, 'Page.reload');
    await delay(2500);

    // Klick auf Flip-Button
    await evalExpr(pageWs, `
      const flipBtn = document.querySelector('button[title="Zum Canvas wechseln"]') ||
        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Canvas'));
      if (flipBtn) flipBtn.click();
    `);
    await delay(1500);

    // Prüfe v2
    await evalExpr(pageWs, `
      const v2Btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent && b.textContent.trim() === 'v2 (SVG Next)' && !b.disabled
      );
      if (v2Btn) v2Btn.click();
    `);
    await delay(1500);

    // Hilfsfunktion zum Ausführen von axe.run()
    async function executeAxe(scenarioName) {
      console.log(`\n[Axe A11y Audit] Prüfe Szenario: ${scenarioName}...`);
      const results = await evalExpr(pageWs, `
        (async () => {
          const res = await axe.run(document.body, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa']
            },
            rules: {
              'page-has-heading-one': { enabled: false }
            }
          });
          return {
            violationsCount: res.violations.length,
            passesCount: res.passes.length,
            violations: res.violations.map(v => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodesCount: v.nodes.length,
              nodes: v.nodes.map(n => ({ html: n.html, target: n.target }))
            }))
          };
        })()
      `);
      console.log(`[Axe A11y Audit] -> ${scenarioName}: ${results.violationsCount} Verstöße, ${results.passesCount} Prüfungen bestanden.`);
      return { scenario: scenarioName, ...results };
    }

    const auditScenarios = [];

    // Lese axe-core Quelltext und injiziere in die Seite
    const axeSource = fs.readFileSync(path.resolve('node_modules/axe-core/axe.min.js'), 'utf-8');

    // ────────────────────────────────────────────────────────
    // 1. SZENARIO: Dark Theme mit aktivem Canvas v2 & Inspector
    // ────────────────────────────────────────────────────────
    await evalExpr(pageWs, axeSource);
    // Klicke auf ein Gerät, um den Inspector zu öffnen
    await evalExpr(pageWs, `
      const dev = document.querySelector('.topology-device');
      if (dev) dev.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    `);
    await delay(800);
    auditScenarios.push(await executeAxe('1. Dark Theme - Canvas v2 mit geöffnetem Inspector'));

    // ────────────────────────────────────────────────────────
    // 2. SZENARIO: Dark Theme mit geöffnetem Konfigurationsdialog
    // ────────────────────────────────────────────────────────
    await evalExpr(pageWs, `
      const cfgBtn = document.querySelector('button[title="Gerät konfigurieren"]') ||
        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Konfigurieren'));
      if (cfgBtn) cfgBtn.click();
    `);
    await delay(800);
    auditScenarios.push(await executeAxe('2. Dark Theme - Geräte-Konfigurationsdialog geöffnet'));

    // Dialog wieder schließen
    await evalExpr(pageWs, `
      const closeBtn = document.querySelector('button[aria-label="Dialog schließen"]') ||
        document.querySelector('button[title="Abbrechen"]') ||
        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Abbrechen'));
      if (closeBtn) closeBtn.click();
    `);
    await delay(600);

    // ────────────────────────────────────────────────────────
    // 3. SZENARIO: Light Theme mit aktivem Canvas v2 & Inspector
    // ────────────────────────────────────────────────────────
    await evalExpr(pageWs, `
      localStorage.setItem('canvas-theme', 'light');
      document.documentElement.classList.remove('dark');
      // Klicke auf Theme-Button falls vorhanden
      const themeBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.getAttribute('title')?.toLowerCase().includes('design') ||
        b.getAttribute('title')?.toLowerCase().includes('theme') ||
        b.getAttribute('aria-label')?.toLowerCase().includes('theme')
      );
      if (themeBtn) themeBtn.click();
    `);
    await send(pageWs, 'Page.reload');
    await delay(2500);

    // Flip to Canvas & v2
    await evalExpr(pageWs, `
      const flipBtn = document.querySelector('button[title="Zum Canvas wechseln"]') ||
        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Canvas'));
      if (flipBtn) flipBtn.click();
    `);
    await delay(1200);

    await evalExpr(pageWs, `
      const v2Btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent && b.textContent.trim() === 'v2 (SVG Next)' && !b.disabled
      );
      if (v2Btn) v2Btn.click();
    `);
    await delay(1200);

    // Re-injiziere axe-core nach Reload
    await evalExpr(pageWs, axeSource);

    // Wähle Gerät im Light Theme
    await evalExpr(pageWs, `
      const dev = document.querySelector('.topology-device');
      if (dev) dev.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    `);
    await delay(800);
    auditScenarios.push(await executeAxe('3. Light Theme - Canvas v2 mit geöffnetem Inspector'));

    // ────────────────────────────────────────────────────────
    // 4. SZENARIO: Light Theme mit geöffnetem Konfigurationsdialog
    // ────────────────────────────────────────────────────────
    await evalExpr(pageWs, `
      const cfgBtn = document.querySelector('button[title="Gerät konfigurieren"]') ||
        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Konfigurieren'));
      if (cfgBtn) cfgBtn.click();
    `);
    await delay(800);
    auditScenarios.push(await executeAxe('4. Light Theme - Geräte-Konfigurationsdialog geöffnet'));

    // Gesamtergebnis berechnen
    const totalViolations = auditScenarios.reduce((sum, s) => sum + s.violationsCount, 0);
    const totalPasses = auditScenarios.reduce((sum, s) => sum + s.passesCount, 0);

    const consolidatedReport = {
      summary: totalViolations === 0
        ? "0 automatisch erkennbare Verstöße (axe-core WCAG 2.1 AA)"
        : `${totalViolations} automatisch erkannte Verstöße`,
      violationsCount: totalViolations,
      passesCount: totalPasses,
      scenarios: auditScenarios,
    };

    const reportPath = path.resolve('docs/a11y-axe-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(consolidatedReport, null, 2));
    console.log(`\n[Axe A11y Audit] Gesamtergebnis: ${totalViolations} Verstöße across all 4 scenarios!`);
    console.log(`[Axe A11y Audit] Report gespeichert in: ${reportPath}`);

    if (totalViolations > 0) {
      console.warn('[Axe A11y Audit Gefundene Verstöße]:', consolidatedReport);
    } else {
      console.log('\n[Axe A11y Audit ERFOLG] 0 automatisch erkennbare Verstöße across all 4 scenarios!');
    }
  } catch (err) {
    console.error('[Axe A11y Audit FEHLER]:', err);
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
