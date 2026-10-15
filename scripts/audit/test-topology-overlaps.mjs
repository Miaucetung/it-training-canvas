import { chromium } from "playwright-core";
import { ccnaQuestions } from "../../src/data/ccnaQuestions.ts";
import { ccnaQuestionsClassified } from "../../src/data/ccnaQuestionsClassified.ts";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Identify question indices with topology exhibits
function findTopologyIndices(pool) {
  const indices = [];
  for (let i = 0; i < pool.length; i++) {
    const q = pool[i];
    const exhibits = Array.isArray(q.exhibit)
      ? q.exhibit
      : q.exhibit && typeof q.exhibit === "object"
      ? [q.exhibit]
      : [];
    if (exhibits.some((e) => e.type === "topology")) {
      indices.push({ index: i, id: q.id });
    }
  }
  return indices;
}

const MEASURE_OVERLAPS_FN = () => {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return [];

  const findings = [];
  const svgs = Array.from(dialog.querySelectorAll("svg"));

  svgs.forEach((svg) => {
    let vb = svg.viewBox?.baseVal;
    if (!vb || (vb.width === 0 && vb.height === 0)) {
      const vbAttr = svg.getAttribute("viewBox");
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
          const transform = curr.getAttribute("transform");
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

      const texts = Array.from(svg.querySelectorAll("text"));
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
              cause: "Topologie-Layout: Überlappende Label-Positionen",
              labelA: textBoxes[i].text,
              labelB: textBoxes[j].text,
              area: parseFloat((overlapW * overlapH).toFixed(1)),
              boxA: a,
              boxB: b,
            });
          }
        }
      }
    }
  });

  return findings;
};

async function main() {
  console.log(`Starting targeted topology overlap check against ${BASE_URL}...`);
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem("it-canvas:onboarding:v1:dismissed", "true");
  });
  const page = await context.newPage();

  await page.goto(BASE_URL);
  await page.waitForFunction(() => !!window.__auditApp);

  const allFindings = [];

  // 1. ExamPrep
  const examIndices = findTopologyIndices(ccnaQuestions);
  console.log(`Checking ${examIndices.length} ExamPrep topology questions...`);
  await page.evaluate(() => window.__auditApp.closeDialogs());
  await page.waitForTimeout(100);
  await page.evaluate(() => window.__auditApp.openDialog("exam"));
  await page.waitForFunction(() => !!window.__examPrepState);
  await page.evaluate(() => {
    window.__AUDIT_NO_SHUFFLE__ = true;
    window.__examPrepState.startLearn();
  });
  await page.waitForTimeout(200);

  for (const { index, id } of examIndices) {
    await page.evaluate((idx) => {
      window.__examPrepState.setQIndex(idx);
    }, index);
    await page.waitForTimeout(15);

    const findings = await page.evaluate(MEASURE_OVERLAPS_FN);
    for (const f of findings) {
      allFindings.push({ pool: "ExamPrep", qid: id, ...f });
    }
  }

  // 2. QuizDialog (Prioritized Learning)
  const quizIndices = findTopologyIndices(ccnaQuestionsClassified);
  console.log(`Checking ${quizIndices.length} QuizDialog topology questions...`);
  await page.evaluate(() => window.__auditApp?.closeDialogs());
  await page.waitForTimeout(100);
  await page.evaluate(() => window.__auditApp?.openDialog("prioritized"));
  await page.waitForFunction(() => !!window.__prioritizedLearningState);
  await page.evaluate(() => window.__prioritizedLearningState.startAll());
  await page.waitForFunction(() => !!window.__quizDialogState);
  await page.waitForTimeout(200);

  for (const { index, id } of quizIndices) {
    await page.evaluate((idx) => {
      window.__quizDialogState.setIndex(idx);
    }, index);
    await page.waitForTimeout(15);

    const findings = await page.evaluate(MEASURE_OVERLAPS_FN);
    for (const f of findings) {
      allFindings.push({ pool: "QuizDialog", qid: id, ...f });
    }
  }

  await browser.close();

  const uniqueQuestions = new Set(allFindings.map((f) => f.qid));
  console.log(`\n========================================`);
  console.log(`Topology Overlap Summary:`);
  console.log(`Total Findings: ${allFindings.length}`);
  console.log(`Unique Questions with Overlaps: ${uniqueQuestions.size}`);
  console.log(`========================================\n`);

  // Group by pair
  const pairMap = new Map();
  for (const f of allFindings) {
    const pair = [f.labelA, f.labelB].sort().join(" <---> ");
    if (!pairMap.has(pair)) {
      pairMap.set(pair, { count: 0, questions: new Set(), sampleArea: f.area });
    }
    const entry = pairMap.get(pair);
    entry.count++;
    entry.questions.add(f.qid);
  }

  const sortedPairs = Array.from(pairMap.entries()).sort((a, b) => b[1].count - a[1].count);
  console.log(`Top Collisions:`);
  sortedPairs.slice(0, 30).forEach(([pair, info], idx) => {
    console.log(
      `${idx + 1}. [${info.count}x in ${info.questions.size} Qs] ${pair} (${Array.from(info.questions).slice(0, 3).join(", ")})`
    );
  });

  return allFindings;
}

if (process.argv[1]?.endsWith("test-topology-overlaps.mjs")) {
  main().catch(console.error);
}

export { main as checkTopologyOverlaps };
