import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

function findBrowserPath() {
  const isWin = process.platform === "win32";
  const isMac = process.platform === "darwin";

  if (isWin) {
    const candidates = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      path.join(
        process.env.LOCALAPPDATA || "",
        "Microsoft\\Edge\\Application\\msedge.exe",
      ),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  } else if (isMac) {
    const candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  } else {
    const candidates = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/microsoft-edge",
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return null;
}

const browserPath = findBrowserPath();
if (!browserPath) {
  console.error("Kein geeigneter Chromium-Browser (Chrome / Edge) gefunden.");
  process.exit(1);
}

const tempProfileDir = path.join(
  os.tmpdir(),
  `canvas-diag-profile-${Date.now()}`,
);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve("docs/screenshots/canvas-v2");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9245;
const APP_URL = process.env.APP_URL || "http://localhost:5000";

console.log(`[E2E Diagnostics] Starte Browser: ${browserPath}`);
console.log(`[E2E Diagnostics] Debugging Port: ${DEBUG_PORT}`);
console.log(`[E2E Diagnostics] Ziel-URL: ${APP_URL}`);

const browserProcess = spawn(browserPath, [
  "--headless=new",
  `--remote-debugging-port=${DEBUG_PORT}`,
  "--remote-allow-origins=*",
  `--user-data-dir=${tempProfileDir}`,
  "about:blank",
]);

browserProcess.stderr.on("data", (d) => {
  const str = d.toString();
  if (str.includes("ERROR") || str.includes("Fatal"))
    console.error("[Browser err]:", str);
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
  const res = await send(ws, "Runtime.evaluate", {
    expression: wrapped,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(
      res.exceptionDetails.exception?.description || res.exceptionDetails.text,
    );
  }
  return res.result?.value;
}

async function captureScreenshot(ws, filename) {
  const res = await send(ws, "Page.captureScreenshot", { format: "png" });
  const buffer = Buffer.from(res.data, "base64");
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
          console.log(`[E2E Diagnostics] CDP verbunden bei Versuch ${attempt}`);
          break;
        }
      } catch {}
    }

    if (!versionData?.webSocketDebuggerUrl) {
      throw new Error(
        `Konnte keine CDP-Verbindung auf Port ${DEBUG_PORT} herstellen.`,
      );
    }

    const ws = await connectWS(versionData.webSocketDebuggerUrl);
    await send(ws, "Target.setDiscoverTargets", { discover: true });

    const targetInfo = await send(ws, "Target.createTarget", { url: APP_URL });
    const targetWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${targetInfo.targetId}`;
    const pageWs = await connectWS(targetWsUrl);

    await send(pageWs, "Page.enable");
    await send(pageWs, "Runtime.enable");

    console.log("[E2E Diagnostics] Setze Desktop-Viewport 1440x900...");
    await send(pageWs, "Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await delay(1500);

    // Initialisiere LocalStorage
    await evalExpr(
      pageWs,
      `
      localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
      localStorage.setItem('canvas-theme', 'dark');
      localStorage.setItem('ccna-canvas-version', '"v2"');
      localStorage.setItem('canvas-engine-version', '"v2"');
      document.documentElement.classList.add('dark');
    `,
    );
    await send(pageWs, "Page.reload");
    await delay(2500);

    // Klick auf Flip-Button (Canvas öffnen)
    console.log("[E2E Diagnostics] Klicke Flip-Button...");
    await evalExpr(
      pageWs,
      `
      const flipBtn = document.querySelector('button[title="Zum Canvas wechseln"]') ||
        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Canvas'));
      if (flipBtn) flipBtn.click();
      else throw new Error('Flip-Button Canvas nicht gefunden');
    `,
    );
    await delay(1500);

    // Prüfe v2 SVG Next Modus
    await evalExpr(
      pageWs,
      `
      const v2Btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent && b.textContent.trim() === 'v2 (SVG Next)' && !b.disabled
      );
      if (v2Btn) v2Btn.click();
    `,
    );
    await delay(1500);

    // ── 1. SCREENSHOT 22: GATEWAY MISMATCH WARNING ──
    console.log("[E2E Diagnostics] Wähle Host-Gerät (PC1) aus...");
    await evalExpr(
      pageWs,
      `
      const devices = Array.from(document.querySelectorAll('.topology-device'));
      // Finde PC
      let targetDev = devices.find(d => {
        const text = d.textContent || '';
        return text.includes('PC') || text.includes('Host');
      }) || devices[devices.length - 1]; // Fallback letztes Gerät

      if (!targetDev) throw new Error('Kein PC-Gerät gefunden');
      targetDev.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      targetDev.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    `,
    );
    await delay(800);

    console.log(
      '[E2E Diagnostics] Klicke auf "Konfigurieren" im Detail-Panel...',
    );
    await evalExpr(
      pageWs,
      `
      const btn = document.querySelector('button[title="Gerät konfigurieren"]');
      if (!btn) throw new Error('Konfigurieren-Button nicht gefunden');
      btn.click();
    `,
    );
    await delay(800);

    console.log(
      "[E2E Diagnostics] Setze ungültiges Gateway (10.99.99.1) zur Erzeugung der Warnung...",
    );
    await evalExpr(
      pageWs,
      `
      const inputs = Array.from(document.querySelectorAll('input'));
      // Default Gateway Input
      const gwInput = inputs.find(i => i.placeholder && i.placeholder.includes('192.168.1.1')) || inputs[2];
      if (!gwInput) throw new Error('Gateway Input nicht gefunden');

      // Setze Wert auf ein fremdes Subnetz
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(gwInput, '10.99.99.1');
      gwInput.dispatchEvent(new Event('input', { bubbles: true }));
      gwInput.dispatchEvent(new Event('change', { bubbles: true }));
    `,
    );
    await delay(800);

    console.log(
      "[E2E Diagnostics] Erstelle Screenshot 22: Desktop Validation Gateway Mismatch...",
    );
    await captureScreenshot(
      pageWs,
      "22_desktop_validation_gateway_mismatch.png",
    );

    // Schließe Dialog
    await evalExpr(
      pageWs,
      `
      const closeBtn = document.querySelector('[aria-labelledby="device-dialog-title"] button');
      if (closeBtn) closeBtn.click();
      else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `,
    );
    await delay(800);

    // ── 2. SCREENSHOT 23: ETHERCHANNEL MISMATCH WARNING (%EC-5-CANNOT_BUNDLE2) ──
    console.log("[E2E Diagnostics] Wähle Switch SW1 / SW2 aus...");
    await evalExpr(
      pageWs,
      `
      const devices = Array.from(document.querySelectorAll('.topology-device'));
      let switchDev = devices.find(d => {
        const text = d.textContent || '';
        return text.includes('SW') || text.includes('Switch');
      }) || devices[0];

      if (!switchDev) throw new Error('Kein Switch-Gerät gefunden');
      switchDev.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      switchDev.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    `,
    );
    await delay(800);

    console.log("[E2E Diagnostics] Klicke Konfigurieren für Switch...");
    await evalExpr(
      pageWs,
      `
      const btn = document.querySelector('button[title="Gerät konfigurieren"]');
      if (!btn) throw new Error('Konfigurieren-Button nicht gefunden');
      btn.click();
    `,
    );
    await delay(800);

    console.log("[E2E Diagnostics] Wechsle auf Schnittstellen-Tab...");
    await evalExpr(
      pageWs,
      `
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) throw new Error('Config-Dialog nicht offen');
      const ifaceTab = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Schnittstellen'));
      if (!ifaceTab) throw new Error('Schnittstellen-Tab nicht gefunden');
      ifaceTab.click();
    `,
    );
    await delay(800);

    console.log(
      "[E2E Diagnostics] Konfiguriere Port 1 und Port 2 in Channel 1 mit unterschiedlichen VLANs...",
    );
    await evalExpr(
      pageWs,
      `
      const dialog = document.querySelector('[role="dialog"]');
      const selects = Array.from(dialog.querySelectorAll('select'));

      // Finde EtherChannel Dropdowns (enthalten "Kein Channel" oder "Kein Channel-Group")
      const channelSelects = selects.filter(s => Array.from(s.options).some(o => o.text.includes('Channel-Group 1')));

      if (channelSelects.length >= 2) {
        // Setze Port 1 auf Channel 1
        channelSelects[0].value = '1';
        channelSelects[0].dispatchEvent(new Event('change', { bubbles: true }));

        // Setze Port 2 auf Channel 1
        channelSelects[1].value = '1';
        channelSelects[1].dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Suche nach den Access-VLAN Dropdowns
      const vlanSelects = selects.filter(s => Array.from(s.options).some(o => o.text.includes('VLAN 10')));
      if (vlanSelects.length >= 2) {
        // Port 1 VLAN 10
        vlanSelects[0].value = '10';
        vlanSelects[0].dispatchEvent(new Event('change', { bubbles: true }));
        // Port 2 VLAN 20 -> Mismatch!
        vlanSelects[1].value = '20';
        vlanSelects[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
    `,
    );
    await delay(1000);

    console.log(
      "[E2E Diagnostics] Erstelle Screenshot 23: EtherChannel Mismatch Warning...",
    );
    await captureScreenshot(pageWs, "23_desktop_validation_etherchannel.png");

    // ── 3. SCREENSHOT 24: CISCO CLI SHOW ETHERCHANNEL SUMMARY ──
    console.log("[E2E Diagnostics] Wechsle zu CLI-Tab...");
    await evalExpr(
      pageWs,
      `
      const dialog = document.querySelector('[role="dialog"]');
      const cliTab = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('CLI'));
      if (!cliTab) throw new Error('CLI Tab nicht gefunden');
      cliTab.click();
    `,
    );
    await delay(800);

    console.log('[E2E Diagnostics] Klicke auf "show etherchannel summary"...');
    await evalExpr(
      pageWs,
      `
      const dialog = document.querySelector('[role="dialog"]');
      const cmdBtns = Array.from(dialog.querySelectorAll('button'));
      const ethBtn = cmdBtns.find(b => b.textContent && b.textContent.includes('show etherchannel summary'));
      if (ethBtn) {
        ethBtn.click();
      }
    `,
    );
    await delay(800);

    console.log(
      "[E2E Diagnostics] Erstelle Screenshot 24: Cisco CLI Show EtherChannel Summary...",
    );
    await captureScreenshot(pageWs, "24_desktop_show_etherchannel_summary.png");

    console.log(
      "\n[E2E Diagnostics ERFOLG] Alle 3 Validierungs- und CLI-Screenshots erfolgreich erstellt!",
    );
  } catch (err) {
    console.error("[E2E Diagnostics FEHLER]:", err);
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
