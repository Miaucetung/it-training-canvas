// ============================================================
// lesson-exporter — Export einer Lektion (Topic) als .md oder PDF
// ----------------------------------------------------------
// MD : direkter Blob-Download als "<topic-slug>.md"
// PDF: \u00f6ffnet ein druckfreundliches Fenster (window.print()),
//      User w\u00e4hlt im Druckdialog "Als PDF speichern".
// Keine externen Dependencies n\u00f6tig.
// ============================================================

import type { Concept, Topic } from "./types";

interface ExportInput {
  topic: Topic;
  concepts: Concept[];
  moduleLabel: string;
  /** Optional: Name/Untertitel f\u00fcr die Kopfzeile */
  org?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ── Markdown-Export ─────────────────────────────────────────

export function buildLessonMarkdown({ topic, concepts, moduleLabel, org }: ExportInput): string {
  const lines: string[] = [];
  lines.push(`# ${topic.title}`);
  lines.push("");
  lines.push(`> **Modul:** ${moduleLabel}  `);
  lines.push(`> **Dauer:** ${topic.estimatedMinutes} Min.  `);
  lines.push(`> **Konzepte:** ${concepts.length}  `);
  lines.push(`> **Exportiert:** ${todayIsoDate()}${org ? `  \n> **Quelle:** ${org}` : ""}`);
  lines.push("");

  if (topic.description) {
    lines.push(topic.description);
    lines.push("");
  }

  if (topic.tags && topic.tags.length > 0) {
    lines.push(`**Tags:** ${topic.tags.map((t) => `\`${t}\``).join(" \u00b7 ")}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  concepts.forEach((c, i) => {
    lines.push(`## ${i + 1}. ${c.title}`);
    lines.push("");
    lines.push(c.content);
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  lines.push(`_Generiert aus dem IT-Training-Canvas \u00b7 ${todayIsoDate()}_`);

  return lines.join("\n");
}

export function exportLessonAsMarkdown(input: ExportInput): void {
  const md = buildLessonMarkdown(input);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(input.moduleLabel)}_${slugify(input.topic.title)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── PDF-Export (via window.print) ───────────────────────────

/** Minimale, sichere Markdown-zu-HTML-Konvertierung f\u00fcr Druckansicht. */
function markdownToPrintHtml(md: string): string {
  // Schritt 1: HTML-Sonderzeichen escapen
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Fenced Code-Bl\u00f6cke isolieren
  const codeBlocks: string[] = [];
  let work = md.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    const idx = codeBlocks.length;
    codeBlocks.push(
      `<pre class="code"><code data-lang="${escape(lang || "")}">${escape(code.replace(/\n$/, ""))}</code></pre>`,
    );
    return `\u0000CODE${idx}\u0000`;
  });

  // Tabellen (sehr einfacher GFM-Parser)
  work = work.replace(
    /(^|\n)(\|[^\n]+\|)\n\|[ :\-|]+\|\n((?:\|[^\n]+\|\n?)+)/g,
    (_m, lead: string, header: string, body: string) => {
      const headCells = header.trim().slice(1, -1).split("|").map((c) => c.trim());
      const rows = body
        .trim()
        .split("\n")
        .map((r) => r.trim().slice(1, -1).split("|").map((c) => c.trim()));
      const th = headCells.map((c) => `<th>${inlineMd(escape(c))}</th>`).join("");
      const trs = rows
        .map((r) => `<tr>${r.map((c) => `<td>${inlineMd(escape(c))}</td>`).join("")}</tr>`)
        .join("");
      return `${lead}<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
    },
  );

  // \u00dcberschriften
  work = work
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Horizontal Rule
  work = work.replace(/^---+$/gm, "<hr/>");

  // Blockquotes
  work = work.replace(/(^> .*(?:\n> .*)*)/gm, (m) => {
    const inner = m
      .split("\n")
      .map((l) => l.replace(/^> ?/, ""))
      .join(" ");
    return `<blockquote>${inner}</blockquote>`;
  });

  // Listen
  work = work.replace(/(^(?:[-*] .*(?:\n(?:[-*] .*))*))/gm, (m) => {
    const items = m.split("\n").map((l) => l.replace(/^[-*] /, ""));
    return `<ul>${items.map((it) => `<li>${inlineMd(it)}</li>`).join("")}</ul>`;
  });
  work = work.replace(/(^(?:\d+\. .*(?:\n(?:\d+\. .*))*))/gm, (m) => {
    const items = m.split("\n").map((l) => l.replace(/^\d+\. /, ""));
    return `<ol>${items.map((it) => `<li>${inlineMd(it)}</li>`).join("")}</ol>`;
  });

  // Absatz-Trennung
  const blocks = work.split(/\n{2,}/);
  work = blocks
    .map((b) => {
      const trimmed = b.trim();
      if (!trimmed) return "";
      if (/^<(h\d|ul|ol|li|table|blockquote|hr|pre|p|div)/i.test(trimmed)) return trimmed;
      if (/\u0000CODE\d+\u0000/.test(trimmed) && trimmed.match(/^\u0000CODE\d+\u0000$/))
        return trimmed;
      return `<p>${inlineMd(trimmed)}</p>`;
    })
    .join("\n");

  // Code wieder einsetzen
  work = work.replace(/\u0000CODE(\d+)\u0000/g, (_m, i: string) => codeBlocks[Number(i)] ?? "");

  return work;
}

/** Inline-Markdown: **bold**, *italic*, `code`, [text](url) */
function inlineMd(s: string): string {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export function exportLessonAsPdf(input: ExportInput): void {
  const { topic, concepts, moduleLabel, org } = input;
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Pop-up blockiert. Bitte erlaube Pop-ups, um die PDF-Ansicht zu \u00f6ffnen.");
    return;
  }

  const conceptsHtml = concepts
    .map(
      (c, i) =>
        `<section class="concept">
           <h2 class="concept-title">${i + 1}. ${escapeHtml(c.title)}</h2>
           ${markdownToPrintHtml(c.content)}
         </section>`,
    )
    .join("\n");

  const tagsHtml =
    topic.tags && topic.tags.length > 0
      ? `<div class="tags">${topic.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(topic.title)} \u2014 ${escapeHtml(moduleLabel)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.55;
      padding: 32px 40px 48px;
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
    }
    h1 { font-size: 26px; margin: 0 0 4px; color: #0f172a; }
    h2.concept-title {
      font-size: 19px;
      margin: 32px 0 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #0ea5e9;
      color: #0c4a6e;
      page-break-after: avoid;
    }
    h2 { font-size: 17px; margin: 22px 0 8px; color: #0f172a; page-break-after: avoid; }
    h3 { font-size: 15px; margin: 18px 0 6px; color: #1e293b; page-break-after: avoid; }
    h4 { font-size: 13px; margin: 14px 0 4px; color: #334155; page-break-after: avoid; }
    p { margin: 8px 0; }
    ul, ol { margin: 8px 0 8px 22px; padding: 0; }
    li { margin: 3px 0; }
    code {
      background: #f1f5f9;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: "SF Mono", Menlo, Consolas, monospace;
      font-size: 12px;
      color: #be185d;
    }
    pre.code {
      background: #0f172a;
      color: #e2e8f0;
      padding: 12px 14px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 11.5px;
      line-height: 1.45;
      margin: 12px 0;
      page-break-inside: avoid;
    }
    pre.code code { background: transparent; color: inherit; padding: 0; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      font-size: 12.5px;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 9px;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f1f5f9; font-weight: 600; }
    blockquote {
      margin: 12px 0;
      padding: 10px 14px;
      background: #f8fafc;
      border-left: 3px solid #0ea5e9;
      color: #334155;
      font-style: italic;
    }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    a { color: #0369a1; text-decoration: none; }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      font-size: 12px;
      color: #475569;
      margin-top: 6px;
    }
    .meta span strong { color: #0f172a; }
    .desc { margin: 14px 0 0; color: #475569; font-size: 13px; }
    .tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    .tags span {
      background: #e0f2fe;
      color: #075985;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
    .concept { page-break-inside: auto; }
    @media print {
      body { padding: 0 18mm; }
      .no-print { display: none !important; }
      @page { margin: 18mm 14mm; size: A4; }
    }
    .print-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      background: #0ea5e9;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-btn:hover { background: #0284c7; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">\ud83d\udda8 Als PDF speichern / Drucken</button>

  <div class="header">
    <h1>${escapeHtml(topic.title)}</h1>
    <div class="meta">
      <span><strong>Modul:</strong> ${escapeHtml(moduleLabel)}</span>
      <span><strong>Dauer:</strong> ${topic.estimatedMinutes} Min.</span>
      <span><strong>Konzepte:</strong> ${concepts.length}</span>
      <span><strong>Stand:</strong> ${todayIsoDate()}</span>
      ${org ? `<span><strong>Quelle:</strong> ${escapeHtml(org)}</span>` : ""}
    </div>
    ${topic.description ? `<p class="desc">${escapeHtml(topic.description)}</p>` : ""}
    ${tagsHtml}
  </div>

  ${conceptsHtml}

  <div class="footer">
    Generiert aus dem IT-Training-Canvas \u00b7 ${todayIsoDate()}
  </div>

  <script>
    // Automatisch den Druck-Dialog \u00f6ffnen nach kurzer Verz\u00f6gerung,
    // damit der User es per Klick im selben Schritt zu PDF machen kann.
    setTimeout(function(){ window.focus(); }, 50);
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
