import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Check,
  Copy,
  FilePdf,
  FileText,
  Info,
  Package,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { exportLabForPacketTracer } from "@/lib/packet-tracer-export";
import { ExhibitRenderer } from "@/components/exhibits/ExhibitRenderer";
import { LABS, LABS_ORDERED } from "./labs";
import type { CommandBlock, LabScenario } from "./labs";

export { LABS, LABS_ORDERED };

// ── Hilfsfunktionen ───────────────────────────────────────────

function difficultyColor(d: LabScenario["difficulty"]) {
  if (d === "Drill") return "text-cyan-400 bg-cyan-400/10";
  if (d === "Anfänger") return "text-emerald-400 bg-emerald-400/10";
  if (d === "Mittel") return "text-amber-400 bg-amber-400/10";
  return "text-red-400 bg-red-400/10";
}

// ── CopyButton ────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      title="Befehle kopieren"
    >
      {copied ? (
        <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Kopiert</span></>
      ) : (
        <><Copy size={13} /><span>Kopieren</span></>
      )}
    </button>
  );
}

// ── CommandBlock-Komponente ───────────────────────────────────

function CommandBlockView({ block }: { block: CommandBlock }) {
  const [expanded, setExpanded] = useState(true);
  const allCommands = block.commands.map((c) => c.cmd).join("\n");

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden mb-3">
      {/* Block-Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-cyan-400 font-mono">
            {block.device}
          </span>
          <span className="text-xs text-slate-500 font-mono">{block.modeLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <CopyButton text={allCommands} />
          <button
            className="text-xs text-slate-500 hover:text-white px-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Commands */}
      {expanded && (
        <div className="divide-y divide-slate-800">
          {block.commands.map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-0">
              {/* CLI-Befehl */}
              <div className="flex items-start gap-2 bg-slate-950 px-3 py-2 sm:w-[45%] min-w-0">
                <span className="text-slate-600 select-none mt-0.5">›</span>
                <pre className="text-green-300 font-mono text-xs whitespace-pre-wrap break-all flex-1 leading-relaxed">
                  {c.cmd}
                </pre>
                <CopyButton text={c.cmd} />
              </div>
              {/* Erklärung */}
              <div className="bg-slate-900/60 px-3 py-2 sm:flex-1 text-xs text-slate-300 leading-relaxed border-l border-slate-800">
                <span className="text-slate-500 mr-1">ℹ</span>
                {c.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Export-Funktionen ────────────────────────────────────────

function buildLabText(lab: LabScenario): string {
  const sep = "═".repeat(60);
  const line = "─".repeat(60);
  let out = `${sep}\nCisco IOS Lab-Szenario\n${sep}\n`;
  out += `Titel:       ${lab.title}\n`;
  out += `Geräte:      ${lab.subtitle}\n`;
  out += `Schwierigkeit: ${lab.difficulty}  |  Dauer: ${lab.duration}\n`;
  out += `${sep}\n\n`;

  // Kontext
  if (lab.context) {
    out += `WORUM GEHT ES?\n${line}\n`;
    out += `Problem: ${lab.context.problem}\n`;
    out += `Zweck:   ${lab.context.purpose}\n\n`;
  }

  // Topologie
  out += `① TOPOLOGIE (Drag & Drop in Packet Tracer)\n${line}\n`;
  out += `${lab.topology.description}\n\n`;
  out += `Geräte:\n`;
  lab.topology.devices.forEach((d) => {
    out += `  ${d.count}x ${d.type}  (${d.label})\n`;
  });
  out += `\nVerbindungen:\n`;
  lab.topology.connections.forEach((c) => out += `  ↳ ${c}\n`);
  out += `\nHinweis: ${lab.topology.hint}\n\n`;

  // CLI-Schritte
  out += `② CLI-KONFIGURATION\n${line}\n`;
  lab.steps.forEach((step, si) => {
    out += `\n[Schritt ${si + 1}] ${step.title}\n`;
    step.blocks.forEach((block) => {
      out += `\n  Gerät: ${block.device}  (${block.modeLabel})\n`;
      block.commands.forEach((c) => {
        const cmdLines = c.cmd.split("\n");
        cmdLines.forEach((cl) => out += `  ${block.modeLabel} ${cl}\n`);
        out += `  → ${c.explanation}\n\n`;
      });
    });
  });

  // Verifikation
  out += `③ VERIFIKATION\n${line}\n`;
  lab.verifyCommands.forEach((v) => {
    out += `  $ ${v.cmd}\n    → Erwartet: ${v.expected}\n\n`;
  });

  // Glossar
  if (lab.glossary && lab.glossary.length > 0) {
    out += `④ GLOSSAR\n${line}\n`;
    lab.glossary.forEach((g) => {
      out += `  ${g.term} — ${g.def}\n`;
    });
    out += `\n`;
  }

  out += `${sep}\nGeneriert von ccna.ajti.online – ${new Date().toLocaleDateString("de-DE")}\n${sep}\n`;
  return out;
}

function downloadText(lab: LabScenario) {
  const content = buildLabText(lab);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lab_${lab.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printLabAsPdf(lab: LabScenario) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>${lab.title} — Cisco IOS Lab</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.6;
      color: #111;
      padding: 20mm 18mm;
      background: #fff;
    }
    h1 { font-size: 16px; margin-bottom: 4px; }
    h2 { font-size: 13px; margin: 14px 0 4px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
    h3 { font-size: 11px; margin: 10px 0 3px; color: #444; }
    .meta { font-size: 10px; color: #555; margin-bottom: 12px; }
    .badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: bold;
      margin-right: 6px;
    }
    .badge-easy   { background:#d1fae5; color:#065f46; }
    .badge-medium { background:#fef3c7; color:#92400e; }
    .badge-hard   { background:#fee2e2; color:#991b1b; }
    .section { margin-top: 14px; }
    .topology-box {
      border: 1px solid #0891b2;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 12px;
      background: #f0f9ff;
    }
    .hint-box {
      border: 1px solid #d97706;
      border-radius: 4px;
      padding: 6px 10px;
      background: #fffbeb;
      font-size: 10px;
      margin-top: 8px;
      color: #78350f;
    }
    .device-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
    .device-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 2px 7px;
      font-size: 10px;
    }
    .conn-line { font-size: 10px; color: #475569; margin: 2px 0 2px 12px; }
    .step-header {
      background: #e0f2fe;
      border-left: 3px solid #0284c7;
      padding: 4px 8px;
      margin: 10px 0 6px;
      font-weight: bold;
      font-size: 11px;
    }
    .block {
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .block-header {
      background: #f8fafc;
      padding: 3px 8px;
      font-size: 10px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
    }
    .cmd-row {
      display: flex;
      border-bottom: 1px solid #f1f5f9;
    }
    .cmd-row:last-child { border-bottom: none; }
    .cmd-cell {
      width: 44%;
      padding: 4px 8px;
      background: #0f172a;
      color: #86efac;
      font-size: 10px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .exp-cell {
      flex: 1;
      padding: 4px 8px;
      font-size: 10px;
      color: #334155;
      background: #fff;
    }
    .verify-box {
      border: 1px solid #10b981;
      border-radius: 5px;
      padding: 8px 12px;
      background: #f0fdf4;
      margin-top: 10px;
    }
    .verify-row { margin: 4px 0; font-size: 10px; }
    .verify-cmd { font-family: monospace; color: #065f46; font-weight: bold; }
    .verify-exp { color: #374151; margin-left: 8px; }
    .footer {
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 9px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 15mm 12mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${lab.title}</h1>
  <div class="meta">
    <span class="badge ${lab.difficulty === 'Anfänger' || lab.difficulty === 'Drill' ? 'badge-easy' : lab.difficulty === 'Mittel' ? 'badge-medium' : 'badge-hard'}">${lab.difficulty}</span>
    ${lab.subtitle} &nbsp;|&nbsp; ⏱ ${lab.duration}
  </div>

  ${lab.context ? `
  <div class="section topology-box" style="border-color:#c7d2fe;background:#eef2ff">
    <strong>Worum geht es?</strong><br/>
    <span style="font-size:10px;color:#374151"><strong>Problem:</strong> ${lab.context.problem}</span><br/>
    <span style="font-size:10px;color:#374151"><strong>Zweck:</strong> ${lab.context.purpose}</span>
  </div>` : ""}

  <div class="section topology-box">
    <strong>① Topologie aufbauen (Drag &amp; Drop in Packet Tracer)</strong><br/>
    <span style="font-size:10px;color:#374151">${lab.topology.description}</span>
    <div class="device-list">
      ${lab.topology.devices.map(d => `<span class="device-badge"><strong>${d.count}×</strong> ${d.type} (${d.label})</span>`).join("")}
    </div>
    ${lab.topology.connections.map(c => `<div class="conn-line">↳ ${c}</div>`).join("")}
    <div class="hint-box">💡 ${lab.topology.hint}</div>
  </div>

  <h2>② CLI-Konfiguration</h2>
  ${lab.steps.map((step, si) => `
    <div class="step-header">Schritt ${si + 1}: ${step.title}</div>
    ${step.blocks.map(block => `
      <div class="block">
        <div class="block-header">
          <span><strong>${block.device}</strong></span>
          <span style="color:#64748b">${block.modeLabel}</span>
        </div>
        ${block.commands.map(c => `
          <div class="cmd-row">
            <div class="cmd-cell">${c.cmd.replace(/\n/g, "<br/>")}</div>
            <div class="exp-cell">${c.explanation}</div>
          </div>
        `).join("")}
      </div>
    `).join("")}
  `).join("")}

  <div class="verify-box">
    <strong style="color:#065f46">③ Verifikation — Lab erfolgreich wenn:</strong><br/>
    ${lab.verifyCommands.map(v => `
      <div class="verify-row">
        <span class="verify-cmd">${v.cmd}</span>
        <span class="verify-exp">→ ${v.expected}</span>
      </div>
    `).join("")}
  </div>

  ${lab.glossary && lab.glossary.length > 0 ? `
  <div class="section">
    <strong>④ Glossar — Begriffe in diesem Lab</strong>
    ${lab.glossary.map(g => `<div style="font-size:10px;margin-top:3px"><strong style="font-family:monospace">${g.term}</strong> — ${g.def}</div>`).join("")}
  </div>` : ""}

  <div class="footer">ccna.ajti.online &mdash; ${new Date().toLocaleDateString("de-DE")} &mdash; ${lab.title}</div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

// ── Haupt-Dialog ──────────────────────────────────────────────

interface LabScenariosDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LabScenariosDialog({ open, onClose }: LabScenariosDialogProps) {
  const [selectedId, setSelectedId] = useState(LABS_ORDERED[0].id);
  const lab = LABS_ORDERED.find((l) => l.id === selectedId) ?? LABS_ORDERED[0];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          // Bewusst immer dunkel (Terminal-Konvention): das gesamte Innenleben
          // ist auf slate-800/900/950 gebaut und in einem hellen Shell unlesbar.
          "flex flex-col w-full max-w-6xl h-[90vh] rounded-2xl border shadow-2xl overflow-hidden",
          "bg-slate-900 border-slate-700",
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 shrink-0 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Cisco IOS — Lab-Szenarien
              </h2>
              <p className="text-xs text-slate-400">
                Topologie per Drag & Drop erstellen → CLI-Befehle eingeben
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => downloadText(lab)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Als .txt herunterladen"
            >
              <FileText size={15} />
              TXT
            </button>
            <button
              onClick={() => printLabAsPdf(lab)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
              title="Als PDF drucken / speichern"
            >
              <FilePdf size={15} />
              PDF
            </button>
            <button
              onClick={() => exportLabForPacketTracer(lab)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
              title="Packet-Tracer-Export: ZIP mit IOS-Konfigs pro Gerät + Aufbau-Anleitung"
            >
              <Package size={15} />
              PT-Export
            </button>
            <div className="w-px h-5 bg-slate-700 mx-1" />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">
          {/* ── Szenario-Liste ── */}
          <div className="w-56 shrink-0 border-r border-slate-700 overflow-y-auto bg-slate-900/50">
            {LABS_ORDERED.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={cn(
                  "w-full text-left px-3 py-3 border-b border-slate-800 transition-colors",
                  l.id === selectedId
                    ? "bg-cyan-500/15 border-l-2 border-l-cyan-400"
                    : "hover:bg-slate-800/50",
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn("shrink-0", l.id === selectedId ? "text-cyan-400" : "text-slate-400")}>
                    {l.icon}
                  </span>
                  <span className="text-xs font-semibold text-white leading-tight">
                    {l.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", difficultyColor(l.difficulty))}>
                    {l.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-500">{l.duration}</span>
                </div>
              </button>
            ))}
          </div>

          {/* ── Detail-Ansicht ── */}
          <ScrollArea className="flex-1 min-w-0">
            <div className="p-5 space-y-5">
              {/* Titel */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{lab.title}</h3>
                  <p className="text-sm text-slate-400">{lab.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs px-2 py-1 rounded font-medium", difficultyColor(lab.difficulty))}>
                    {lab.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    ⏱ {lab.duration}
                  </span>
                </div>
              </div>

              {/* ── Kontext: Warum dieses Lab? ── */}
              {lab.context && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-indigo-300 text-sm font-bold">Worum geht es in diesem Lab?</span>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div>
                      <span className="text-indigo-400 font-semibold">Problem: </span>
                      <span className="text-slate-300">{lab.context.problem}</span>
                    </div>
                    <div>
                      <span className="text-indigo-400 font-semibold">Zweck: </span>
                      <span className="text-slate-300">{lab.context.purpose}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Schritt 0: Topologie-Aufbau ── */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-cyan-400 text-sm font-bold">① Topologie im Canvas aufbauen (Drag & Drop)</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{lab.topology.description}</p>

                {/* Geräte */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {lab.topology.devices.map((d, i) => (
                    <span key={i} className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300">
                      <span className="text-cyan-400 font-bold">{d.count}×</span> {d.type} <span className="text-slate-500">({d.label})</span>
                    </span>
                  ))}
                </div>

                {/* Verbindungen */}
                <div className="space-y-1 mb-3">
                  {lab.topology.connections.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-slate-600 mt-0.5 shrink-0">↳</span>
                      <span className="font-mono">{c}</span>
                    </div>
                  ))}
                </div>

                {/* Hint */}
                <div className="flex items-start gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 text-xs text-amber-300">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>{lab.topology.hint}</span>
                </div>

                {/* Optionales visuelles Topologie-Diagramm */}
                {lab.topology.topologyDiagram && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-700/50">
                    {lab.topology.topologyDiagram}
                  </div>
                )}

                {/* Strukturierte Exhibits (Topologie / Adressplan / erwartete CLI-Ausgabe) */}
                {lab.exhibits && lab.exhibits.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {lab.exhibits.map((ex, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-slate-700/50">
                        <ExhibitRenderer exhibit={ex} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── CLI-Schritte ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white text-sm font-bold">② CLI-Konfiguration</span>
                </div>

                {lab.steps.map((step, si) => (
                  <div key={si} className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold shrink-0">
                        {si + 1}
                      </span>
                      <span className="text-sm font-semibold text-white">{step.title}</span>
                    </div>
                    {step.blocks.map((block, bi) => (
                      <CommandBlockView key={bi} block={block} />
                    ))}
                  </div>
                ))}
              </div>

              {/* ── Verifikation ── */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-400 text-sm font-bold">③ Verifikation — Lab erfolgreich wenn:</span>
                </div>
                <div className="space-y-2">
                  {lab.verifyCommands.map((v, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2 bg-slate-950 rounded px-2 py-1">
                        <CopyButton text={v.cmd} />
                        <code className="text-green-300 font-mono text-xs">{v.cmd}</code>
                      </div>
                      <span className="text-xs text-slate-400">→ {v.expected}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Glossar ── */}
              {lab.glossary && lab.glossary.length > 0 && (
                <div className="rounded-xl border border-slate-600/40 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-slate-300 text-sm font-bold">④ Glossar — Begriffe in diesem Lab</span>
                  </div>
                  <dl className="space-y-2">
                    {lab.glossary.map((g, i) => (
                      <div key={i} className="text-xs">
                        <dt className="inline font-mono font-semibold text-cyan-300">{g.term}</dt>
                        <dd className="inline text-slate-400"> — {g.def}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

