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

const tempProfileDir = path.join(os.tmpdir(), `lab-topology-screenshots-profile-${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const outDir = path.resolve('docs/screenshots/lab-quality');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const DEBUG_PORT = 9250;
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
      // retry
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

  await sendCommand(pageWs, 'Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        localStorage.setItem('hasSeenOnboarding', 'true');
        localStorage.setItem('it-canvas:onboarding:v1:dismissed', 'true');
        localStorage.setItem('ccna-tour-completed', 'true');
        localStorage.setItem('ccna:welcome:dismissed', 'true');
        localStorage.setItem('hasSeenWelcomeModal', 'true');
      } catch (e) {}
    `,
  });

  async function captureLab({
    filename,
    width,
    height,
    labId,
    theme = 'dark',
    detailMode = false,
    presentation = false,
    mobile = false,
  }) {
    console.log(`Erzeuge Screenshot: ${filename} (${width}x${height}, ${theme}, detail=${detailMode})...`);
    await sendCommand(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile,
    });

    await sendCommand(pageWs, 'Page.navigate', { url: APP_URL });
    await new Promise((r) => setTimeout(r, 1600));

    const evalScript = `
      (async () => {
        // 1. Dismiss any open modal
        const skipBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent && (b.textContent.includes('Überspringen') || b.textContent.includes('Tour beenden'))
        );
        if (skipBtn) skipBtn.click();
        await new Promise((r) => setTimeout(r, 200));

        // 2. Set theme
        if ('${theme}' === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }

        // 3. Open Labs Dialog
        if (${mobile}) {
          const menuBtn = document.querySelector('button[aria-label="Menü: Navigation und Werkzeuge öffnen"]');
          if (menuBtn) {
            menuBtn.click();
            await new Promise((r) => setTimeout(r, 350));
            const mobileLabs = Array.from(document.querySelectorAll('button')).find(
              (b) => b.textContent && b.textContent.includes('Packet Tracer Labs')
            );
            if (mobileLabs) mobileLabs.click();
          } else {
            const labsBtn = document.getElementById('nav-btn-labs');
            if (labsBtn) labsBtn.click();
          }
        } else {
          const labsBtn = document.getElementById('nav-btn-labs');
          if (labsBtn) labsBtn.click();
        }
        await new Promise((r) => setTimeout(r, 500));

        // 4. Select specific lab
        const labBtn = document.querySelector('button[data-lab-id="${labId}"]');
        if (labBtn) {
          labBtn.click();
          await new Promise((r) => setTimeout(r, 400));
        }

        // 5. Toggle Detail Mode (IPs an) if requested
        if (${detailMode}) {
          const detailBtn = document.querySelector('button[aria-label="Detail-Modus umschalten"]');
          if (detailBtn) {
            detailBtn.click();
            await new Promise((r) => setTimeout(r, 350));
          }
        }

        // 6. Toggle Presentation Mode if requested
        if (${presentation}) {
          const presBtn = document.querySelector('button[aria-label="Präsentationsmodus umschalten"]');
          if (presBtn) {
            presBtn.click();
            await new Promise((r) => setTimeout(r, 450));
          }
        }
      })()
    `;

    await sendCommand(pageWs, 'Runtime.evaluate', {
      expression: evalScript,
      awaitPromise: true,
    });
    await new Promise((r) => setTimeout(r, 800));

    const screenshotData = await sendCommand(pageWs, 'Page.captureScreenshot', {
      format: 'png',
    });

    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, Buffer.from(screenshotData.data, 'base64'));
    console.log(`Gespeichert: ${filePath}`);
  }

  const labs = [
    { id: 'basic-ip', name: '01_basic_ip' },
    { id: 'vlan-trunking', name: '02_vlan_trunking' },
    { id: 'roas', name: '03_roas' },
    { id: 'ospf', name: '04_ospf' },
  ];

  for (const lab of labs) {
    // 1. Desktop 1440px - Dark Mode - Simple
    await captureLab({
      filename: `${lab.name}_1440px_dark_simple.png`,
      width: 1440,
      height: 960,
      labId: lab.id,
      theme: 'dark',
      detailMode: false,
    });

    // 2. Desktop 1440px - Dark Mode - Detail (IPs an)
    await captureLab({
      filename: `${lab.name}_1440px_dark_detail.png`,
      width: 1440,
      height: 960,
      labId: lab.id,
      theme: 'dark',
      detailMode: true,
    });

    // 3. Desktop 1440px - Light Mode - Detail
    await captureLab({
      filename: `${lab.name}_1440px_light_detail.png`,
      width: 1440,
      height: 960,
      labId: lab.id,
      theme: 'light',
      detailMode: true,
    });

    // 4. Mobile 390px - Dark Mode
    await captureLab({
      filename: `${lab.name}_390px_dark.png`,
      width: 390,
      height: 844,
      labId: lab.id,
      theme: 'dark',
      mobile: true,
    });
  }

  // 5. Beamer / Präsentationsmodus (OSPF Lab in Full Presentation Mode)
  await captureLab({
    filename: '05_presentation_mode_ospf_beamer.png',
    width: 1440,
    height: 900,
    labId: 'ospf',
    theme: 'dark',
    presentation: true,
  });

  browserProcess.kill();
  try {
    fs.rmSync(tempProfileDir, { recursive: true, force: true });
  } catch {}
  console.log('Alle Screenshots erfolgreich erstellt!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  browserProcess.kill();
  process.exit(1);
});
