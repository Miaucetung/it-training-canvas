import { chromium } from "playwright-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  console.log("Starte Verifikation von Phase 2 Korrekturen...");
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:5000");
  await page.evaluate(() => localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true"));
  await page.evaluate(() => window.__auditApp?.openDialog("exam"));
  await page.waitForFunction(() => !!window.__examPrepState);
  await page.evaluate(() => {
    window.__AUDIT_NO_SHUFFLE__ = true;
    window.__examPrepState.startLearn();
  });
  await page.waitForTimeout(200);

  // 1. Prüfe q0001 (CLI Highlight & SVG ViewBox)
  const q0001Pre = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const hotLines = Array.from(dialog.querySelectorAll('.bg-green-900\\/40, [class*="bg-green-900"]'));
    const svg = dialog.querySelector("svg");
    let vbCutoffs = 0;
    if (svg) {
      const vb = svg.viewBox.baseVal;
      const texts = Array.from(svg.querySelectorAll("text"));
      texts.forEach((t) => {
        const b = t.getBBox();
        let x = b.x, y = b.y;
        let p = t.parentElement;
        while (p && p !== svg) {
          const tr = p.getAttribute("transform");
          if (tr) {
            const m = tr.match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/);
            if (m) { x += parseFloat(m[1]); y += parseFloat(m[2]); }
          }
          p = p.parentElement;
        }
        if (x < vb.x || x + b.width > vb.x + vb.width || y < vb.y || y + b.height > vb.y + vb.height) {
          vbCutoffs++;
        }
      });
    }
    return {
      hotLinesCount: hotLines.length,
      vbCutoffs,
    };
  });
  console.log("q0001 Pre-Check:", q0001Pre);

  // Post-reveal q0001
  await page.evaluate(() => window.__examPrepState.revealAnswer());
  await page.waitForTimeout(100);
  const q0001Post = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const hotLines = Array.from(dialog.querySelectorAll('.bg-green-900\\/40, [class*="bg-green-900"]'));
    return { hotLinesCount: hotLines.length };
  });
  console.log("q0001 Post-Reveal:", q0001Post);

  // 2. Prüfe q0089 (Kein { type: "none" } Exhibit)
  await page.evaluate(() => {
    const qs = window.__examPrepState.getQuestions();
    const idx = qs.findIndex((q) => q.id === "q0089");
    window.__examPrepState.setQIndex(idx);
  });
  await page.waitForTimeout(100);
  const q0089Check = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const exhibits = dialog.querySelectorAll('[class*="rounded-xl border"]');
    const placeholder = Array.from(dialog.querySelectorAll("p, div")).find((el) => el.textContent.includes("Topologie/Grafik wird nachgereicht"));
    return { hasExhibitBlock: exhibits.length > 0, hasPlaceholder: !!placeholder };
  });
  console.log("q0089 Check:", q0089Check);

  // 3. Prüfe q0964 (Hinweis 'Original-Exhibit nicht verfügbar')
  await page.evaluate(() => {
    const qs = window.__examPrepState.getQuestions();
    const idx = qs.findIndex((q) => q.id === "q0964");
    window.__examPrepState.setQIndex(idx);
  });
  await page.waitForTimeout(100);
  const q0964Check = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const banner = Array.from(dialog.querySelectorAll("div, p")).find((el) => el.textContent.includes("Original-Exhibit nicht verfügbar"));
    return { foundMissingExhibitHint: !!banner, text: banner?.textContent?.trim() };
  });
  console.log("q0964 Check:", q0964Check);

  await browser.close();
  console.log("Verifikation abgeschlossen.");
}

main().catch(console.error);
