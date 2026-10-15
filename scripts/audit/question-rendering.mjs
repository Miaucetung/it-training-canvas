import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const SCREENSHOTS_DIR = path.resolve(".local/screenshots");
const RESULTS_FILE = path.resolve(".local/rendering_audit_results.json");
const APP_DUMP_FILE = path.resolve(".local/app_questions_dump.json");
const PDF_REPORT_FILE = path.resolve(".local/pdf_comparison_report.json");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "1440px", width: 1440, height: 900 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "390px", width: 390, height: 844 }
];

const THEMES = ["dark", "light"];

/** In-Browser DOM audit measurement function */
const MEASURE_DOM_FN = ({ state, vpName, themeName }) => {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return [{ defectType: "Dialog fehlt", metric: "Kein Element mit role=dialog gefunden", cause: "Portal/Modal" }];

  const findings = [];
  const winW = window.innerWidth;

  // 1. Horizontales Scrollen (Check 3)
  const docScrollW = document.documentElement.scrollWidth;
  if (docScrollW > winW + 1) {
    findings.push({
      defectType: "3. Horizontales Scrollen der Seite",
      metric: `document.scrollWidth (${docScrollW}px) > innerWidth (${winW}px) um ${(docScrollW - winW).toFixed(1)}px`,
      cause: "Globales Layout oder unbegrenztes Element erzeugt horizontales Scrollen"
    });
  }
  if (dialog.scrollWidth > dialog.clientWidth + 2) {
    findings.push({
      defectType: "3. Horizontales Scrollen des Dialogs",
      metric: `dialog.scrollWidth (${dialog.scrollWidth}px) > clientWidth (${dialog.clientWidth}px) um ${(dialog.scrollWidth - dialog.clientWidth).toFixed(1)}px`,
      cause: "Dialog-Container oder Kind-Element ohne min-w-0"
    });
  }

  // 2. Verdeckte Inhalte durch fixierte Leisten (Check 1)
  const header = dialog.querySelector('header, [class*="border-b shrink-0"], [class*="flex items-center justify-between border-b"]');
  const footer = dialog.querySelector('[class*="shrink-0 border-t"], [class*="border-t shrink-0"]');
  const hRect = header ? header.getBoundingClientRect() : null;
  const fRect = footer ? footer.getBoundingClientRect() : null;

  const scrollContainer = dialog.querySelector('.overflow-y-auto, [class*="overflow-y-auto"]');
  if (scrollContainer && fRect) {
    const originalScroll = scrollContainer.scrollTop;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    
    // Check buttons, options, explanations INSIDE the scroll container ONLY
    const targets = Array.from(scrollContainer.querySelectorAll('button[class*="items-start"], button[class*="rounded-xl border"], button[class*="cursor-pointer"], [class*="leading-relaxed"], [role="img"], pre, .font-mono, [class*="bg-green-900"], [class*="bg-red-900"], [class*="bg-green-50"], [class*="bg-red-50"]'));
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.bottom > fRect.top + 1 && r.top < fRect.bottom) {
        const overlap = (r.bottom - fRect.top).toFixed(1);
        findings.push({
          defectType: "1. Verdeckte Inhalte",
          metric: `Element ("${t.textContent.slice(0, 25).trim()}...") wird am Scroll-Ende um ${overlap}px von Aktionsleiste überdeckt`,
          cause: "Scroll-Container fehlt unteres Padding (z. B. pb-20) oder Dialoghöhe stößt an Footer"
        });
      }
    });

    scrollContainer.scrollTop = 0;
    targets.slice(0, 5).forEach((t) => {
      const r = t.getBoundingClientRect();
      if (hRect && r.top < hRect.bottom - 1 && r.bottom > hRect.top) {
        const overlap = (hRect.bottom - r.top).toFixed(1);
        findings.push({
          defectType: "1. Verdeckte Inhalte",
          metric: `Element ("${t.textContent.slice(0, 25).trim()}...") wird oben um ${overlap}px von Kopfzeile überdeckt`,
          cause: "Scroll-Container liegt hinter fixiertem Header"
        });
      }
    });

    scrollContainer.scrollTop = originalScroll;
  }

  // 3. Abgeschnittener Text & SVG-Texte außerhalb viewBox (Check 2)
  const svgs = Array.from(dialog.querySelectorAll('svg'));
  svgs.forEach((svg) => {
    let vb = svg.viewBox?.baseVal;
    if (!vb || (vb.width === 0 && vb.height === 0)) {
      const vbAttr = svg.getAttribute('viewBox');
      if (vbAttr) {
        const parts = vbAttr.split(/[\s,]+/).map(Number);
        if (parts.length === 4) vb = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
      }
    }
    if (vb && vb.width > 0) {
      const getBBoxInSvg = (txt) => {
        const b = txt.getBBox();
        let x = b.x;
        let y = b.y;
        let curr = txt.parentElement;
        while (curr && curr !== svg) {
          const transform = curr.getAttribute('transform');
          if (transform) {
            const match = transform.match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/);
            if (match) {
              x += parseFloat(match[1]);
              y += parseFloat(match[2]);
            }
          }
          curr = curr.parentElement;
        }
        return { x, y, width: b.width, height: b.height };
      };

      const texts = Array.from(svg.querySelectorAll('text'));
      texts.forEach((txt) => {
        try {
          const b = getBBoxInSvg(txt);
          const tText = txt.textContent.trim();
          if (b.x < vb.x - 1) {
            findings.push({
              defectType: "2. Abgeschnittener Text (SVG viewBox)",
              metric: `"${tText.slice(0, 30)}" ragt um ${(vb.x - b.x).toFixed(1)}px links aus viewBox (${vb.x}, ${vb.y}, ${vb.width}, ${vb.height})`,
              cause: "TopologyExhibit viewBox-Berechnung ignoriert Text-Bounding-Boxen"
            });
          }
          if (b.x + b.width > vb.x + vb.width + 1) {
            findings.push({
              defectType: "2. Abgeschnittener Text (SVG viewBox)",
              metric: `"${tText.slice(0, 30)}" ragt um ${(b.x + b.width - (vb.x + vb.width)).toFixed(1)}px rechts aus viewBox`,
              cause: "TopologyExhibit viewBox-Berechnung ignoriert Text-Bounding-Boxen"
            });
          }
          if (b.y < vb.y - 1) {
            findings.push({
              defectType: "2. Abgeschnittener Text (SVG viewBox)",
              metric: `"${tText.slice(0, 30)}" ragt um ${(vb.y - b.y).toFixed(1)}px oben aus viewBox`,
              cause: "TopologyExhibit viewBox-Berechnung ignoriert Text-Bounding-Boxen"
            });
          }
          if (b.y + b.height > vb.y + vb.height + 1) {
            findings.push({
              defectType: "2. Abgeschnittener Text (SVG viewBox)",
              metric: `"${tText.slice(0, 30)}" ragt um ${(b.y + b.height - (vb.y + vb.height)).toFixed(1)}px unten aus viewBox`,
              cause: "TopologyExhibit viewBox-Berechnung ignoriert Text-Bounding-Boxen"
            });
          }
        } catch {}
      });

      // 4. Überlappungen in Topologie-Grafiken (Check 4)
      const textBoxes = [];
      texts.forEach((t) => {
        try {
          const b = getBBoxInSvg(t);
          if (b.width > 0 && b.height > 0) {
            textBoxes.push({ text: t.textContent.trim(), bbox: b });
          }
        } catch {}
      });

      for (let i = 0; i < textBoxes.length; i++) {
        for (let j = i + 1; j < textBoxes.length; j++) {
          const a = textBoxes[i].bbox;
          const b = textBoxes[j].bbox;
          const overlapW = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
          const overlapH = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
          if (overlapW > 4 && overlapH > 4) {
            findings.push({
              defectType: "4. Überlappung in Topologie-Grafik",
              metric: `Label "${textBoxes[i].text}" überlappt mit "${textBoxes[j].text}" (Kollisionsfläche: ${(overlapW * overlapH).toFixed(1)}px²)`,
              cause: "Topologie-Layout: Überlappende Label-Positionen"
            });
          }
        }
      }
    }
  });

  // 5. Hinweise vor der Antwort (Check 5)
  if (state === "pre") {
    const hotLines = Array.from(dialog.querySelectorAll('.bg-green-900\\/40, [class*="bg-green-900"], [class*="bg-emerald-900"]'));
    if (hotLines.length > 0) {
      findings.push({
        defectType: "5. Hinweis vor der Antwort",
        metric: `${hotLines.length} Zeile(n) mit grünem Hintergrund vor dem Prüfen: "${hotLines[0].textContent.slice(0, 40).trim()}"`,
        cause: "CLIExhibit.tsx rendert exhibit.highlight statisch ohne Prüfung auf revealed-Status"
      });
    }
  }

  // 7. Fehlende / leere / Platzhalter-Exhibits (Check 7)
  const placeholderBanner = Array.from(dialog.querySelectorAll('div, p')).find((el) =>
    el.textContent.includes("Topologie/Grafik wird nachgereicht") ||
    el.textContent.includes("Topologie wird nachgereicht") ||
    el.textContent.includes("Grafik fehlt") ||
    el.textContent.includes("Exhibit fehlt")
  );
  if (placeholderBanner) {
    findings.push({
      defectType: "7. Fehlendes / Platzhalter-Exhibit",
      metric: `Platzhalter-Banner "${placeholderBanner.textContent.trim().slice(0, 45)}" wird gerendert`,
      cause: "Exhibit nicht implementiert (needsExhibit / Platzhalter)"
    });
  }

  const imgs = Array.from(dialog.querySelectorAll('img'));
  imgs.forEach((img) => {
    if (!img.complete || img.naturalWidth === 0) {
      findings.push({
        defectType: "7. Kaputtes oder fehlendes Bild",
        metric: `Bild src="${img.src.slice(0, 40)}" konnte nicht geladen werden`,
        cause: "Ungültige Bildquelle oder fehlende Asset-Datei"
      });
    }
  });

  return findings;
};

async function main() {
  console.log("==================================================================");
  console.log("Starte Phase 1 Playwright-Audit aller CCNA-Fragen");
  console.log("==================================================================");

  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const allFindings = [];
  const screenshotSet = new Set();

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`\n>>> AUDIT-DURCHLAUF: Viewport ${vp.name} (${vp.width}x${vp.height}) · Theme: ${theme.toUpperCase()} <<<`);
      
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto(BASE_URL);
      await page.waitForLoadState("networkidle");

      // Dismiss onboarding tour
      await page.evaluate(() => {
        localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
      });

      // Set theme
      await page.evaluate((t) => window.__auditApp?.setTheme(t), theme);
      await page.waitForTimeout(100);

      // ==========================================================
      // 1. POOL: Prüfungstrainer (ExamPrepDialog, 1.081 Fragen)
      // ==========================================================
      console.log(`--- [1/3] Prüfungsfragen-Trainer (ExamPrepDialog) ---`);
      await page.evaluate(() => window.__auditApp.closeDialogs());
      await page.waitForTimeout(100);
      await page.evaluate(() => window.__auditApp.openDialog("exam"));
      await page.waitForFunction(() => !!window.__examPrepState);
      await page.evaluate(() => {
        window.__AUDIT_NO_SHUFFLE__ = true;
        window.__examPrepState.startLearn();
      });
      await page.waitForTimeout(200);

      const examCount = await page.evaluate(() => window.__examPrepState.getQuestions().length);
      console.log(`ExamPrepDialog initialisiert mit ${examCount} Fragen.`);

      for (let i = 0; i < examCount; i++) {
        // Step to question
        const qMeta = await page.evaluate(async (idx) => {
          window.__examPrepState.setQIndex(idx);
          await new Promise((r) => setTimeout(r, 20));
          const q = window.__examPrepState.getCurrentQ();
          return { id: q?.id, text: q?.text?.slice(0, 60) };
        }, i);

        // Audit pre-check
        const preFindings = await page.evaluate(MEASURE_DOM_FN, { state: "pre", vpName: vp.name, themeName: theme });
        if (preFindings.length > 0) {
          for (const f of preFindings) {
            allFindings.push({
              qid: qMeta.id,
              pool: "ExamPrep (ccnaQuestions)",
              viewport: vp.name,
              theme,
              state: "pre-check",
              defectType: f.defectType,
              metric: f.metric,
              cause: f.cause
            });
          }
          const shotKey = `ExamPrep_${qMeta.id}_${vp.name}_${theme}_pre`;
          if (!screenshotSet.has(shotKey)) {
            screenshotSet.add(shotKey);
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${shotKey}.png`) });
          }
        }

        // Reveal answer (post-check)
        await page.evaluate(() => window.__examPrepState.revealAnswer());
        await page.waitForTimeout(20);

        // Audit post-check
        const postFindings = await page.evaluate(MEASURE_DOM_FN, { state: "post", vpName: vp.name, themeName: theme });
        if (postFindings.length > 0) {
          for (const f of postFindings) {
            allFindings.push({
              qid: qMeta.id,
              pool: "ExamPrep (ccnaQuestions)",
              viewport: vp.name,
              theme,
              state: "post-check",
              defectType: f.defectType,
              metric: f.metric,
              cause: f.cause
            });
          }
          const shotKey = `ExamPrep_${qMeta.id}_${vp.name}_${theme}_post`;
          if (!screenshotSet.has(shotKey)) {
            screenshotSet.add(shotKey);
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${shotKey}.png`) });
          }
        }

        if ((i + 1) % 200 === 0 || i === examCount - 1) {
          console.log(`  ExamPrep: ${i + 1}/${examCount} Fragen geprüft.`);
        }
      }

      // ==========================================================
      // 2. POOL: Priorisiertes Lernen (QuizDialog, 1.055 Fragen)
      // ==========================================================
      console.log(`--- [2/3] Priorisiertes Lernen (QuizDialog / ccnaQuestionsClassified) ---`);
      await page.evaluate(() => window.__auditApp.closeDialogs());
      await page.waitForTimeout(100);
      await page.evaluate(() => window.__auditApp.openDialog("prioritized"));
      await page.waitForFunction(() => !!window.__prioritizedLearningState);
      await page.evaluate(() => window.__prioritizedLearningState.startAll());
      await page.waitForFunction(() => !!window.__quizDialogState);
      await page.waitForTimeout(200);

      const quizCount = await page.evaluate(() => window.__quizDialogState.getQuestions().length);
      console.log(`QuizDialog initialisiert mit ${quizCount} klassifizierten Fragen.`);

      for (let i = 0; i < quizCount; i++) {
        const qMeta = await page.evaluate(async (idx) => {
          window.__quizDialogState.setIndex(idx);
          await new Promise((r) => setTimeout(r, 20));
          const q = window.__quizDialogState.getCurrentQ();
          return { id: q?.id, text: q?.text?.slice(0, 60) };
        }, i);

        // Audit pre-check
        const preFindings = await page.evaluate(MEASURE_DOM_FN, { state: "pre", vpName: vp.name, themeName: theme });
        if (preFindings.length > 0) {
          for (const f of preFindings) {
            allFindings.push({
              qid: qMeta.id,
              pool: "Prioritized (ccnaQuestionsClassified)",
              viewport: vp.name,
              theme,
              state: "pre-check",
              defectType: f.defectType,
              metric: f.metric,
              cause: f.cause
            });
          }
          const shotKey = `Quiz_${qMeta.id}_${vp.name}_${theme}_pre`;
          if (!screenshotSet.has(shotKey)) {
            screenshotSet.add(shotKey);
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${shotKey}.png`) });
          }
        }

        // Confirm answer (post-check)
        await page.evaluate(() => window.__quizDialogState.confirmCurrent());
        await page.waitForTimeout(20);

        // Audit post-check
        const postFindings = await page.evaluate(MEASURE_DOM_FN, { state: "post", vpName: vp.name, themeName: theme });
        if (postFindings.length > 0) {
          for (const f of postFindings) {
            allFindings.push({
              qid: qMeta.id,
              pool: "Prioritized (ccnaQuestionsClassified)",
              viewport: vp.name,
              theme,
              state: "post-check",
              defectType: f.defectType,
              metric: f.metric,
              cause: f.cause
            });
          }
          const shotKey = `Quiz_${qMeta.id}_${vp.name}_${theme}_post`;
          if (!screenshotSet.has(shotKey)) {
            screenshotSet.add(shotKey);
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${shotKey}.png`) });
          }
        }

        if ((i + 1) % 200 === 0 || i === quizCount - 1) {
          console.log(`  QuizDialog: ${i + 1}/${quizCount} Fragen geprüft.`);
        }
      }

      // ==========================================================
      // 3. POOL: Drag-and-Drop-Trainer (81 Fragen)
      // ==========================================================
      console.log(`--- [3/3] Drag-and-Drop-Trainer (ccnaDragDrop) ---`);
      await page.evaluate(() => window.__auditApp.closeDialogs());
      await page.waitForTimeout(100);
      await page.evaluate(() => window.__auditApp.openDialog("dragdrop"));
      await page.waitForFunction(() => !!window.__dragDropState);
      await page.waitForTimeout(200);

      const ddCount = await page.evaluate(() => window.__dragDropState.getCount());
      console.log(`DragDropTrainerDialog initialisiert mit ${ddCount} Fragen.`);

      for (let i = 0; i < ddCount; i++) {
        const qMeta = await page.evaluate(async (idx) => {
          window.__dragDropState.setIndex(idx);
          await new Promise((r) => setTimeout(r, 20));
          const q = window.__dragDropState.getCurrentQ();
          return { id: q?.id, text: q?.instruction?.slice(0, 60) };
        }, i);

        // Audit pre-check
        const preFindings = await page.evaluate(MEASURE_DOM_FN, { state: "pre", vpName: vp.name, themeName: theme });
        if (preFindings.length > 0) {
          for (const f of preFindings) {
            allFindings.push({
              qid: qMeta.id,
              pool: "DragDrop (ccnaDragDrop)",
              viewport: vp.name,
              theme,
              state: "pre-check",
              defectType: f.defectType,
              metric: f.metric,
              cause: f.cause
            });
          }
          const shotKey = `DragDrop_${qMeta.id}_${vp.name}_${theme}_pre`;
          if (!screenshotSet.has(shotKey)) {
            screenshotSet.add(shotKey);
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${shotKey}.png`) });
          }
        }

        // Check (post-check)
        await page.evaluate(() => window.__dragDropState.checkCurrent());
        await page.waitForTimeout(20);

        // Audit post-check
        const postFindings = await page.evaluate(MEASURE_DOM_FN, { state: "post", vpName: vp.name, themeName: theme });
        if (postFindings.length > 0) {
          for (const f of postFindings) {
            allFindings.push({
              qid: qMeta.id,
              pool: "DragDrop (ccnaDragDrop)",
              viewport: vp.name,
              theme,
              state: "post-check",
              defectType: f.defectType,
              metric: f.metric,
              cause: f.cause
            });
          }
          const shotKey = `DragDrop_${qMeta.id}_${vp.name}_${theme}_post`;
          if (!screenshotSet.has(shotKey)) {
            screenshotSet.add(shotKey);
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${shotKey}.png`) });
          }
        }
      }

      await context.close();
    }
  }

  await browser.close();

  // Save audit findings to JSON
  console.log(`\nGesamtzahl registrierter Fundstellen: ${allFindings.length}`);
  console.log(`Gesamtzahl Screenshots: ${screenshotSet.size}`);
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(allFindings, null, 2), "utf-8");
  console.log(`Ergebnisse gespeichert in: ${RESULTS_FILE}`);
}

main().catch((err) => {
  console.error("Audit-Fehler:", err);
  process.exit(1);
});
