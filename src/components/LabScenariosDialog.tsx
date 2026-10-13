import { ScrollArea } from "@/components/ui/scroll-area";
import { ModalPortal } from "@/components/ui/modal-portal";
import { escapeHtml } from "@/lib/escape";
import { shouldIgnoreSingleKeyShortcut } from "@/lib/keyboard-shortcuts";
import { getLabDeviceCli } from "./labs/lab-to-network";
import { downloadBlob } from "@/lib/topology/storage-manager";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle,
  Copy,
  DownloadSimple,
  Eye,
  FilePdf,
  FileText,
  Info,
  MagnifyingGlass,
  Package,
  Slideshow,
  Terminal,
  X,
} from "@phosphor-icons/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportLabForPacketTracer } from "@/lib/packet-tracer-export";
import { ExhibitRenderer } from "@/components/exhibits/ExhibitRenderer";
import { LABS, LABS_ORDERED } from "./labs";
import type { CommandBlock, LabScenario } from "./labs";
import { ProfessionalTopologyDiagram } from "./labs/ProfessionalTopologyDiagram";
import { LabAddressingTable } from "./labs/LabAddressingTable";
import {
  exportTopologyAsPng,
  exportTopologyAsSvg,
  printLabHandoutPdf,
} from "./labs/LabDiagramExport";

import { DRILL_LABS } from "./labs/drills";
import { LAYER2_LABS } from "./labs/layer2";
import { ROUTING_LABS } from "./labs/routing";
import { IPV6_LABS } from "./labs/ipv6";
import { SERVICES_LABS } from "./labs/services";
import { SECURITY_LABS } from "./labs/security";
import { AUTOMATION_LABS } from "./labs/automation";
import { OPERATIONS_LABS } from "./labs/operations";
import { CAMPUS_LABS } from "./labs/campus";

export { LABS, LABS_ORDERED };
export type { CommandBlock, LabStep, LabScenario } from "./labs";

// ── Kategorisierung ──────────────────────────────────────────

type LabCategory =
  | "all"
  | "drills"
  | "layer2"
  | "routing"
  | "ipv6"
  | "services"
  | "security"
  | "automation"
  | "operations"
  | "campus";

interface CategoryMeta {
  id: LabCategory;
  label: string;
  badge: string;
  count: number;
}

const CATEGORY_DEFINITIONS: { id: LabCategory; label: string; badge: string; ids: Set<string> }[] = [
  { id: "drills", label: "Drills & Grundlagen", badge: "Drills", ids: new Set(DRILL_LABS.map((l) => l.id)) },
  { id: "layer2", label: "Layer 2 & Switching", badge: "Layer 2", ids: new Set(LAYER2_LABS.map((l) => l.id)) },
  { id: "routing", label: "Layer 3 Routing & OSPF", badge: "Routing", ids: new Set(ROUTING_LABS.map((l) => l.id)) },
  { id: "ipv6", label: "IPv6 Routing", badge: "IPv6", ids: new Set(IPV6_LABS.map((l) => l.id)) },
  { id: "services", label: "IP-Services & VPN", badge: "Services", ids: new Set(SERVICES_LABS.map((l) => l.id)) },
  { id: "security", label: "Security & ACLs", badge: "Security", ids: new Set(SECURITY_LABS.map((l) => l.id)) },
  { id: "automation", label: "Automation & Programmability", badge: "Automation", ids: new Set(AUTOMATION_LABS.map((l) => l.id)) },
  { id: "operations", label: "Betrieb & Troubleshooting", badge: "Betrieb", ids: new Set(OPERATIONS_LABS.map((l) => l.id)) },
  { id: "campus", label: "Campus & Integration", badge: "Campus", ids: new Set(CAMPUS_LABS.map((l) => l.id)) },
];

function getLabCategory(labId: string): { id: LabCategory; label: string; badge: string } {
  for (const cat of CATEGORY_DEFINITIONS) {
    if (cat.ids.has(labId)) {
      return { id: cat.id, label: cat.label, badge: cat.badge };
    }
  }
  return { id: "drills", label: "Allgemein", badge: "Lab" };
}

// ── Hilfsfunktionen ───────────────────────────────────────────

function difficultyColor(d: LabScenario["difficulty"]) {
  if (d === "Drill") return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
  if (d === "Anfänger") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
  if (d === "Mittel") return "text-amber-400 bg-amber-400/10 border-amber-400/30";
  return "text-rose-400 bg-rose-400/10 border-rose-400/30";
}

// ── CopyButton ────────────────────────────────────────────────

function CopyButton({ text, label = "Kopieren" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors shrink-0"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      title="In die Zwischenablage kopieren"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-400" />
          <span className="text-emerald-400 font-medium">Kopiert!</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ── CommandBlock-Komponente ───────────────────────────────────

function CommandBlockView({ block }: { block: CommandBlock }) {
  const [expanded, setExpanded] = useState(true);
  const allCommands = block.commands.map((c) => c.cmd).join("\n");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden mb-4 shadow-sm">
      {/* Block Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal size={15} className="text-emerald-400 shrink-0" />
          <span className="font-bold text-xs text-white truncate font-mono">
            {block.device}
          </span>
          <span className="text-[11px] font-mono text-cyan-400/90 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
            {block.modeLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <CopyButton text={allCommands} label="Geräte-Befehle kopieren" />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
          >
            {expanded ? "Einklappen" : "Ausklappen"}
          </button>
        </div>
      </div>

      {/* Block Body */}
      {expanded && (
        <div className="divide-y divide-slate-900 font-mono text-xs">
          {block.commands.map((c, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-start md:items-start justify-between gap-3 px-3.5 py-2.5 hover:bg-slate-900/60 transition-colors group"
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <span className="text-slate-600 select-none text-[11px] pt-0.5 shrink-0 font-mono">
                  {i + 1}.
                </span>
                <code className="text-emerald-300 font-bold whitespace-pre-wrap break-words selection:bg-emerald-800 selection:text-white">
                  {c.cmd}
                </code>
              </div>
              <div className="flex items-start gap-3 w-full md:w-auto justify-between md:justify-end min-w-0 md:max-w-[50%] shrink-0 pl-5 md:pl-0 pt-0.5">
                <span className="text-[11px] text-slate-400 font-sans italic text-left md:text-right leading-relaxed">
                  → {c.explanation}
                </span>
                <div className="opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                  <CopyButton text={c.cmd} label="" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Text- & PDF-Export-Helfer ─────────────────────────────────

function buildLabText(lab: LabScenario): string {
  const sep = "=".repeat(60);
  const line = "-".repeat(60);
  let out = "";

  out += `${sep}\n`;
  out += `CISCO CCNA 200-301 LAB: ${lab.title.toUpperCase()}\n`;
  out += `${sep}\n`;
  out += `Schwierigkeit: ${lab.difficulty}  |  Dauer: ${lab.duration}\n`;
  out += `${lab.subtitle}\n\n`;

  if (lab.context) {
    out += `WARUM DIESES LAB?\n${line}\n`;
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
  lab.topology.connections.forEach((c) => (out += `  ↳ ${c}\n`));
  out += `\nHinweis: ${lab.topology.hint}\n\n`;

  // CLI-Schritte
  out += `② CLI-KONFIGURATION\n${line}\n`;
  lab.steps.forEach((step, si) => {
    out += `\n[Schritt ${si + 1}] ${step.title}\n`;
    step.blocks.forEach((block) => {
      out += `\n  Gerät: ${block.device}  (${block.modeLabel})\n`;
      block.commands.forEach((c) => {
        const cmdLines = c.cmd.split("\n");
        cmdLines.forEach((cl) => (out += `  ${block.modeLabel} ${cl}\n`));
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
  <title>${escapeHtml(lab.title)} — Cisco IOS Lab (Packet Tracer)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #111;
      padding: 15mm 15mm;
      background: #fff;
    }
    h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: #0f172a; }
    h2 { font-size: 13px; font-weight: 700; margin: 16px 0 6px; border-bottom: 2px solid #0284c7; padding-bottom: 3px; color: #0369a1; }
    .meta { font-size: 11px; color: #475569; margin-bottom: 12px; }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      margin-right: 6px;
    }
    .badge-easy   { background:#d1fae5; color:#065f46; }
    .badge-medium { background:#fef3c7; color:#92400e; }
    .badge-hard   { background:#fee2e2; color:#991b1b; }
    .section { margin-top: 14px; }
    .topology-box {
      border: 1px solid #0284c7;
      border-radius: 6px;
      padding: 10px 14px;
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
      background: #fff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 10px;
    }
    .conn-line { font-family: monospace; font-size: 10px; color: #334155; margin: 2px 0 2px 12px; }
    .step-header {
      background: #e0f2fe;
      border-left: 3px solid #0284c7;
      padding: 5px 10px;
      margin: 12px 0 6px;
      font-weight: bold;
      font-size: 12px;
      color: #0c4a6e;
    }
    .block {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .block-header {
      background: #f1f5f9;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: bold;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
    }
    .cmd-row {
      display: flex;
      border-bottom: 1px solid #f1f5f9;
    }
    .cmd-row:last-child { border-bottom: none; }
    .cmd-cell {
      width: 48%;
      padding: 5px 10px;
      background: #0f172a;
      color: #86efac;
      font-family: monospace;
      font-size: 10px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .exp-cell {
      flex: 1;
      padding: 5px 10px;
      font-size: 10px;
      color: #334155;
      background: #fff;
    }
    .verify-box {
      border: 1px solid #10b981;
      border-radius: 6px;
      padding: 10px 14px;
      background: #f0fdf4;
      margin-top: 14px;
    }
    .verify-row { margin: 4px 0; font-size: 10px; }
    .verify-cmd { font-family: monospace; color: #065f46; font-weight: bold; }
    .verify-exp { color: #1f2937; margin-left: 8px; }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      font-size: 9px;
      color: #64748b;
      text-align: center;
    }
    @media print {
      body { padding: 10mm 10mm; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(lab.title)}</h1>
  <div class="meta">
    <span class="badge ${
      lab.difficulty === "Anfänger" || lab.difficulty === "Drill"
        ? "badge-easy"
        : lab.difficulty === "Mittel"
          ? "badge-medium"
          : "badge-hard"
    }">${escapeHtml(lab.difficulty)}</span>
    ${escapeHtml(lab.subtitle)} &nbsp;|&nbsp; ⏱ ${escapeHtml(lab.duration)} &nbsp;|&nbsp; Cisco CCNA 200-301
  </div>

  ${
    lab.context
      ? `
  <div class="section topology-box" style="border-color:#818cf8;background:#eef2ff">
    <strong style="color:#3730a3">Worum geht es in diesem Lab?</strong><br/>
    <span style="font-size:10px;color:#1e1b4b"><strong>Problem:</strong> ${escapeHtml(lab.context.problem)}</span><br/>
    <span style="font-size:10px;color:#1e1b4b"><strong>Zweck:</strong> ${escapeHtml(lab.context.purpose)}</span>
  </div>`
      : ""
  }

  <div class="section topology-box">
    <strong>① Topologie aufbauen (Drag &amp; Drop in Packet Tracer)</strong><br/>
    <span style="font-size:10px;color:#0f172a">${escapeHtml(lab.topology.description)}</span>
    <div class="device-list">
      ${lab.topology.devices
        .map(
          (d) =>
            `<span class="device-badge"><strong>${d.count}×</strong> ${escapeHtml(d.type)} (${escapeHtml(d.label)})</span>`,
        )
        .join("")}
    </div>
    ${lab.topology.connections
      .map((c) => `<div class="conn-line">↳ ${escapeHtml(c)}</div>`)
      .join("")}
    <div class="hint-box">💡 ${escapeHtml(lab.topology.hint)}</div>
  </div>

  <h2>② CLI-Konfiguration</h2>
  ${lab.steps
    .map(
      (step, si) => `
    <div class="step-header">Schritt ${si + 1}: ${escapeHtml(step.title)}</div>
    ${step.blocks
      .map(
        (block) => `
      <div class="block">
        <div class="block-header">
          <span>${escapeHtml(block.device)}</span>
          <span style="color:#64748b;font-family:monospace">${escapeHtml(block.modeLabel)}</span>
        </div>
        ${block.commands
          .map(
            (c) => `
          <div class="cmd-row">
            <div class="cmd-cell">${c.cmd.replace(/\n/g, "<br/>")}</div>
            <div class="exp-cell">${escapeHtml(c.explanation)}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    `,
      )
      .join("")}
  `,
    )
    .join("")}

  <div class="verify-box">
    <strong style="color:#065f46">③ Verifikation — Lab erfolgreich wenn:</strong><br/>
    ${lab.verifyCommands
      .map(
        (v) => `
      <div class="verify-row">
        <span class="verify-cmd">${escapeHtml(v.cmd)}</span>
        <span class="verify-exp">→ ${escapeHtml(v.expected)}</span>
      </div>
    `,
      )
      .join("")}
  </div>

  ${
    lab.glossary && lab.glossary.length > 0
      ? `
  <div class="section">
    <h2 style="margin-top:12px">④ Glossar — Fachbegriffe</h2>
    ${lab.glossary
      .map(
        (g) =>
          `<div style="font-size:10px;margin-top:3px"><strong style="font-family:monospace">${escapeHtml(g.term)}</strong> — ${escapeHtml(g.def)}</div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  <div class="footer">ccna.ajti.online &mdash; ${new Date().toLocaleDateString(
    "de-DE",
  )} &mdash; ${escapeHtml(lab.title)}</div>

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
  initialLabId?: string;
  /** Öffnet die Topologie des Labs als neue Vorlage im Canvas v2 */
  onOpenInCanvas?: (labId: string) => void;
}

const STORAGE_KEY_COMPLETED_LABS = "ccna-completed-labs-v1";

export function LabScenariosDialog({
  open,
  onClose,
  initialLabId,
  onOpenInCanvas,
}: LabScenariosDialogProps) {
  const [selectedId, setSelectedId] = useState(
    initialLabId || LABS_ORDERED[0].id,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<LabCategory>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPLETED_LABS);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("detail");
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [printWithoutSolution, setPrintWithoutSolution] = useState<boolean>(false);
  const diagramContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts (Escape for exit/close, P for Presentation / Beamer)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (presentationMode) {
          setPresentationMode(false);
        } else {
          onClose();
        }
      } else if (e.key === "p" || e.key === "P") {
        if (!shouldIgnoreSingleKeyShortcut(e, { allowInModal: true })) {
          e.preventDefault();
          setPresentationMode((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, presentationMode]);

  // Reset selected device when switching labs
  useEffect(() => {
    setSelectedDevice(null);
  }, [selectedId]);

  // Update selection if initialLabId changes
  useEffect(() => {
    if (initialLabId && LABS_ORDERED.some((l) => l.id === initialLabId)) {
      setSelectedId(initialLabId);
    }
  }, [initialLabId]);

  // Toggle completed status
  const toggleLabCompleted = useCallback((id: string) => {
    setCompletedLabs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(
          STORAGE_KEY_COMPLETED_LABS,
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Filter categories with counts
  const categoryMetas: CategoryMeta[] = useMemo(() => {
    return [
      { id: "all", label: "Alle Labs", badge: "Alle", count: LABS_ORDERED.length },
      ...CATEGORY_DEFINITIONS.map((c) => ({
        id: c.id,
        label: c.label,
        badge: c.badge,
        count: LABS_ORDERED.filter((l) => c.ids.has(l.id)).length,
      })),
    ];
  }, []);

  // Filtered labs list
  const filteredLabs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LABS_ORDERED.filter((lab) => {
      // Category filter
      if (selectedCategory !== "all") {
        const cat = CATEGORY_DEFINITIONS.find((c) => c.id === selectedCategory);
        if (cat && !cat.ids.has(lab.id)) return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && lab.difficulty !== selectedDifficulty) {
        return false;
      }

      // Only open filter
      if (onlyOpen && completedLabs.has(lab.id)) {
        return false;
      }

      // Query filter
      if (q) {
        const matchTitle = lab.title.toLowerCase().includes(q);
        const matchSub = lab.subtitle.toLowerCase().includes(q);
        const matchId = lab.id.toLowerCase().includes(q);
        const matchProblem =
          lab.context?.problem?.toLowerCase().includes(q) ?? false;
        const matchPurpose =
          lab.context?.purpose?.toLowerCase().includes(q) ?? false;
        const matchCommands = lab.steps.some((s) =>
          s.blocks.some((b) =>
            b.commands.some(
              (c) =>
                c.cmd.toLowerCase().includes(q) ||
                c.explanation.toLowerCase().includes(q),
            ),
          ),
        );
        const matchGlossary =
          lab.glossary?.some(
            (g) =>
              g.term.toLowerCase().includes(q) ||
              g.def.toLowerCase().includes(q),
          ) ?? false;

        return (
          matchTitle ||
          matchSub ||
          matchId ||
          matchProblem ||
          matchPurpose ||
          matchCommands ||
          matchGlossary
        );
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, onlyOpen, completedLabs]);

  // Selected Lab
  const currentLab =
    LABS_ORDERED.find((l) => l.id === selectedId) ??
    filteredLabs[0] ??
    LABS_ORDERED[0];

  const currentCategory = getLabCategory(currentLab.id);

  // Prev / Next Lab navigation
  const currentIndex = LABS_ORDERED.findIndex((l) => l.id === currentLab.id);
  const prevLab = currentIndex > 0 ? LABS_ORDERED[currentIndex - 1] : null;
  const nextLab =
    currentIndex < LABS_ORDERED.length - 1
      ? LABS_ORDERED[currentIndex + 1]
      : null;

  // Copy all commands of current lab
  const handleCopyAllCommands = useCallback(() => {
    let text = `! ========================================================\n`;
    text += `! Cisco Packet Tracer Lab: ${currentLab.title}\n`;
    text += `! ${currentLab.subtitle}\n`;
    text += `! ========================================================\n\n`;

    currentLab.steps.forEach((step, si) => {
      text += `! --- [Schritt ${si + 1}] ${step.title} ---\n`;
      step.blocks.forEach((block) => {
        text += `! Gerät: ${block.device} (${block.modeLabel})\n`;
        block.commands.forEach((c) => {
          text += `${c.cmd}\n`;
        });
        text += `\n`;
      });
    });

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [currentLab]);

  // Export callbacks for professional topology diagram
  const handleExportPng = useCallback(() => {
    const svgEl = diagramContainerRef.current?.querySelector("svg");
    if (svgEl) {
      exportTopologyAsPng(svgEl, `lab_${currentLab.id}_topology.png`);
    }
  }, [currentLab.id]);

  const handleExportSvg = useCallback(() => {
    const svgEl = diagramContainerRef.current?.querySelector("svg");
    if (svgEl) {
      exportTopologyAsSvg(svgEl, `lab_${currentLab.id}_topology.svg`);
    }
  }, [currentLab.id]);

  const handlePrintHandout = useCallback(() => {
    const svgEl = diagramContainerRef.current?.querySelector("svg");
    printLabHandoutPdf(currentLab, svgEl, { withoutSolution: printWithoutSolution });
  }, [currentLab, printWithoutSolution]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-scenarios-title"
        className={cn(
          "fixed inset-0 z-dialog flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-150",
          presentationMode ? "p-0" : "p-2 sm:p-4 md:p-6",
        )}
      >
        <div
          className={cn(
            "flex flex-col w-full h-full rounded-2xl border shadow-2xl overflow-hidden transition-all",
            presentationMode
              ? "max-w-none max-h-none rounded-none border-0 bg-slate-950 text-slate-100"
              : "max-w-7xl max-h-[calc(100dvh-1.5rem)] md:max-h-[92dvh] bg-slate-900 border-slate-700/80 text-slate-100",
          )}
        >
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 shadow-xs">
              <BookOpen size={20} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="lab-scenarios-title"
                  className="text-sm sm:text-base font-bold text-white tracking-tight truncate font-sans"
                >
                  Packet Tracer Labs
                </h2>
                {presentationMode ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30 animate-pulse">
                    Beamer-Modus aktiv (Taste P / Esc zum Beenden)
                  </span>
                ) : (
                  <>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono font-bold border border-violet-500/30">
                      {LABS_ORDERED.length} Labs
                    </span>
                    <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      PT 9.0 ready
                    </span>
                    <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 font-mono border border-sky-800/50">
                      CCNA 200-301
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate mt-0.5">
                Schritt-für-Schritt Topologien aufbauen, Cisco IOS konfigurieren & verifizieren
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {/* Structured Topology Actions (wenn Cisco Press Topologie vorhanden) */}
            {currentLab.structuredTopology && (
              <>
                {/* Detail Mode Toggle */}
                <button
                  onClick={() => setDetailMode((d) => !d)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    detailMode
                      ? "bg-cyan-950/70 text-cyan-300 border-cyan-800/70"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200",
                  )}
                  title="Schaltet Interface-IPs und Subnetzangaben im Diagramm ein/aus"
                  aria-label="Detail-Modus umschalten"
                >
                  <Eye size={14} className={detailMode ? "text-cyan-400" : "text-terminal-muted"} />
                  <span className="hidden md:inline">{detailMode ? "IPs an" : "Kompakt"}</span>
                </button>

                {/* Presentation Mode Toggle */}
                <button
                  onClick={() => setPresentationMode((p) => !p)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    presentationMode
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs"
                      : "bg-slate-800 text-slate-300 hover:text-white border-slate-700",
                  )}
                  title="Präsentationsmodus für Beamer (Taste P)"
                  aria-label="Präsentationsmodus umschalten"
                >
                  <Slideshow size={14} className={presentationMode ? "text-amber-400" : "text-slate-400"} />
                  <span className="hidden sm:inline">Beamer (P)</span>
                </button>

                {/* PNG 2x Export */}
                <button
                  onClick={handleExportPng}
                  className="hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Topologie in 2x Retina-Auflösung als PNG herunterladen"
                >
                  <DownloadSimple size={13} />
                  <span>PNG 2×</span>
                </button>

                {/* SVG Export */}
                <button
                  onClick={handleExportSvg}
                  className="hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Skalierbare Vektorgrafik (SVG) herunterladen"
                >
                  <span>SVG</span>
                </button>

                {/* Handout PDF */}
                <button
                  onClick={handlePrintHandout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 transition-colors"
                  title="A4 Querformat Handout drucken oder als PDF speichern"
                >
                  <FilePdf size={14} />
                  <span className="hidden sm:inline">Handout</span>
                </button>

                {/* Toggle Ohne Lösung */}
                <label
                  className="hidden 2xl:flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer select-none px-1"
                  title="Handout ohne CLI-Lösungsbefehle als Übungsblatt drucken"
                >
                  <input
                    type="checkbox"
                    checked={printWithoutSolution}
                    onChange={(e) => setPrintWithoutSolution(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-violet-500 w-3 h-3"
                  />
                  <span>ohne Lösung</span>
                </label>

                <div className="w-px h-5 bg-slate-800 mx-1 hidden sm:block" />
              </>
            )}

            {/* Completed Count Pill */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 font-mono"
              title="Ihr Lernfortschritt bei den Praxis-Labs"
            >
              <CheckCircle size={14} className="text-emerald-400" weight="fill" />
              <span>
                {completedLabs.size}/{LABS_ORDERED.length} erledigt
              </span>
            </div>

            <div className="w-px h-5 bg-slate-800 mx-1 hidden sm:block" />

            {/* Copy All Button */}
            <button
              onClick={handleCopyAllCommands}
              aria-label="Alle Befehle kopieren"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Alle CLI-Befehle dieses Labs kopieren"
            >
              {copiedAll ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Alle kopiert!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="hidden md:inline">Alle Befehle</span>
                </>
              )}
            </button>

            {/* Packet Tracer Export ZIP */}
            <button
              onClick={() => exportLabForPacketTracer(currentLab)}
              aria-label="PT-Export: Packet-Tracer-Export herunterladen"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 transition-colors shadow-xs"
              title="Packet-Tracer-Export: ZIP mit IOS-Konfigurationen pro Gerät + README-Aufbauanleitung"
            >
              <Package size={15} weight="bold" />
              <span className="hidden sm:inline">PT-Export</span>
            </button>

            {/* Standard PDF Print (falls kein structuredTopology) */}
            {!currentLab.structuredTopology && (
              <button
                onClick={() => printLabAsPdf(currentLab)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 transition-colors"
                title="Druckoptimiertes Lab-Sheet als PDF öffnen / drucken"
              >
                <FilePdf size={15} />
                <span className="hidden md:inline">PDF</span>
              </button>
            )}

            {/* TXT Download */}
            <button
              onClick={() => downloadText(currentLab)}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Als Textdatei (.txt) herunterladen"
            >
              <FileText size={15} />
              <span>TXT</span>
            </button>

            <div className="w-px h-5 bg-slate-800 mx-1" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Dialog schließen"
              title="Schließen (Esc)"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Mobile Tab-Switcher (< md / 768px) */}
        <div className="md:hidden flex items-center border-b border-slate-800 bg-slate-950 px-2 py-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors",
              mobileTab === "list"
                ? "bg-violet-600 text-white shadow-xs"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            )}
          >
            <span>Lab-Katalog ({filteredLabs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("detail")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors min-w-0",
              mobileTab === "detail"
                ? "bg-violet-600 text-white shadow-xs"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            )}
          >
            <span className="truncate">Details: {currentLab.title}</span>
          </button>
        </div>

        {/* ── Main Container: Sidebar + Details ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ── Linke Sidebar: Katalog & Filter ── */}
          <aside
            className={cn(
              "w-full md:w-80 lg:w-88 md:shrink-0 border-r border-slate-800 flex-col bg-slate-950/50",
              mobileTab === "list" ? "flex" : "hidden md:flex"
            )}
          >
            {/* Filter-Header */}
            <div className="p-3 border-b border-slate-800 space-y-2.5 shrink-0 bg-slate-900/40">
              {/* Suchleiste */}
              <div className="relative">
                <MagnifyingGlass
                  size={15}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Thema, OSPF, VLAN, NAT suchen…"
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    title="Suche leeren"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Kategorie-Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                {categoryMetas.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-2 py-0.5 rounded-md whitespace-nowrap transition-colors font-medium",
                      selectedCategory === cat.id
                        ? "bg-violet-600 text-white font-semibold"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800",
                    )}
                  >
                    {cat.badge} ({cat.count})
                  </button>
                ))}
              </div>

              {/* Zusätzliche Filter: Schwierigkeit & Status */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  aria-label="Nach Schwierigkeitsgrad filtern"
                  className="bg-slate-800 border border-slate-700/80 text-slate-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                >
                  <option value="all">Alle Level</option>
                  <option value="Drill">Drill</option>
                  <option value="Anfänger">Anfänger</option>
                  <option value="Mittel">Mittel</option>
                  <option value="Fortgeschritten">Fortgeschritten</option>
                </select>

                <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyOpen}
                    onChange={(e) => setOnlyOpen(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-0 w-3 h-3"
                  />
                  <span>Nur offene</span>
                </label>

                <span className="text-terminal-muted font-mono text-[10px]">
                  {filteredLabs.length} Treffer
                </span>
              </div>
            </div>

            {/* Scrollbare Liste der gefilterten Labs */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="divide-y divide-slate-800/60 p-1">
                {filteredLabs.length === 0 ? (
                  <div className="p-6 text-center text-terminal-muted text-xs">
                    Keine Labs für diese Filterkombination gefunden.
                  </div>
                ) : (
                  filteredLabs.map((l, idx) => {
                    const isSelected = l.id === currentLab.id;
                    const isDone = completedLabs.has(l.id);
                    const catMeta = getLabCategory(l.id);

                    return (
                      <button
                        key={l.id}
                        data-lab-id={l.id}
                        onClick={() => {
                          setSelectedId(l.id);
                          setMobileTab("detail");
                        }}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg transition-all group relative mb-0.5",
                          isSelected
                            ? "bg-violet-600/15 border-l-3 border-l-violet-400 shadow-xs"
                            : "hover:bg-slate-800/40 border-l-3 border-l-transparent",
                        )}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[10px] text-terminal-muted shrink-0">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-semibold leading-snug line-clamp-1",
                                isSelected ? "text-white" : "text-slate-200 group-hover:text-white",
                              )}
                            >
                              {l.title}
                            </span>
                          </div>

                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLabCompleted(l.id);
                            }}
                            className="shrink-0 text-terminal-muted hover:text-emerald-400 transition-colors p-0.5"
                            title={isDone ? "Als nicht erledigt markieren" : "Als erledigt markieren"}
                          >
                            <CheckCircle
                              size={15}
                              className={isDone ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"}
                              weight={isDone ? "fill" : "regular"}
                            />
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                          {l.subtitle}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded border font-semibold",
                              difficultyColor(l.difficulty),
                            )}
                          >
                            {l.difficulty}
                          </span>
                          <span className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                            ⏱ {l.duration}
                          </span>
                          <span className="text-[9px] text-violet-300/80 bg-violet-950/60 px-1.5 py-0.5 rounded ml-auto">
                            {catMeta.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </aside>

          {/* ── Rechte Hauptspalte: Detail-Ansicht des ausgewählten Labs ── */}
          <div
            className={cn(
              "flex-1 min-w-0 flex-col bg-slate-900/60 overflow-hidden",
              mobileTab === "detail" ? "flex" : "hidden md:flex"
            )}
          >
            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
              <div
                className={cn(
                  "p-3 sm:p-6 md:p-8 space-y-6 mx-auto",
                  currentLab.structuredTopology ? "max-w-7xl" : "max-w-5xl",
                )}
              >
                {/* ── Lab Hero / Header ── */}
                <div className="space-y-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span className="text-violet-400 font-semibold">
                      {currentCategory.label}
                    </span>
                    <span>›</span>
                    <span className="font-mono text-slate-400">ID: {currentLab.id}</span>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
                        {currentLab.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {currentLab.subtitle}
                      </p>
                    </div>

                    {/* Quick Completion Button */}
                    <button
                      onClick={() => toggleLabCompleted(currentLab.id)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all",
                        completedLabs.has(currentLab.id)
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700",
                      )}
                    >
                      <CheckCircle
                        size={16}
                        className={completedLabs.has(currentLab.id) ? "text-emerald-400" : "text-slate-400"}
                        weight={completedLabs.has(currentLab.id) ? "fill" : "regular"}
                      />
                      <span>
                        {completedLabs.has(currentLab.id) ? "Lab abgeschlossen" : "Als erledigt markieren"}
                      </span>
                    </button>
                  </div>

                  {/* Badges Bar */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md border font-semibold",
                        difficultyColor(currentLab.difficulty),
                      )}
                    >
                      {currentLab.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      ⏱ {currentLab.duration}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {currentLab.topology.devices.reduce((acc, d) => acc + d.count, 0)} Geräte
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {currentLab.steps.length} CLI-Schritte
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {currentLab.verifyCommands.length} Tests
                    </span>
                  </div>
                </div>

                {/* ── Hauptbereich: Topologie, Aufgaben & CLI ── */}
                {currentLab.structuredTopology ? (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Linke Spalte: Professionelle Topologie & Adressierungstabelle (Desktop) */}
                    <div className="xl:col-span-7 space-y-5 min-w-0">
                      {/* Cisco Press Topologie Diagramm */}
                      <section className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
                              Netzwerk-Topologie (Cisco Press Standard)
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {onOpenInCanvas && (
                              <button
                                type="button"
                                onClick={() => onOpenInCanvas(currentLab.id)}
                                className="px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 bg-indigo-500/20 border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/30"
                                title="Lädt die Topologie als neue Vorlage im Canvas v2 (überschreibt keine gespeicherten Daten)"
                              >
                                <Slideshow size={13} />
                                <span>Topologie im Canvas öffnen</span>
                              </button>
                            )}
                            <button
                              onClick={() => setDetailMode((d) => !d)}
                              className={cn(
                                "px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition-colors flex items-center gap-1.5",
                                detailMode
                                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200",
                              )}
                              title="Interface-IPs im Diagramm ein- oder ausblenden"
                            >
                              <Eye size={13} />
                              <span>{detailMode ? "Detail: IPs aktiv" : "Kompakt"}</span>
                            </button>
                          </div>
                        </div>

                        <div ref={diagramContainerRef}>
                          <ProfessionalTopologyDiagram
                            topology={currentLab.structuredTopology}
                            detailMode={detailMode}
                            selectedDevice={selectedDevice}
                            onSelectDevice={setSelectedDevice}
                          />
                        </div>
                      </section>

                      {/* Adressierungstabelle mit bidirektionalem Highlighting */}
                      <LabAddressingTable
                        entries={currentLab.structuredTopology.addressingTable}
                        selectedDevice={selectedDevice}
                        onSelectDevice={setSelectedDevice}
                      />

                      {/* CLI-Export pro Gerät (nur Befehle, ohne Prompt) */}
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-terminal-muted">
                          CLI pro Gerät (Packet Tracer):
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentLab.structuredTopology.devices
                            .filter((d) => d.type === "router" || d.type === "switch-l2" || d.type === "switch-l3" || d.type === "firewall")
                            .map((d) => {
                              const cli = getLabDeviceCli(currentLab, d.name);
                              if (!cli) return null;
                              return (
                                <span key={d.id} className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 text-xs font-mono overflow-hidden">
                                  <span className="px-2 py-1 text-slate-200">{d.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => void navigator.clipboard?.writeText(cli)}
                                    className="px-2 py-1 border-l border-slate-700 text-emerald-300 hover:bg-slate-800"
                                    aria-label={`CLI von ${d.name} kopieren`}
                                  >
                                    <Copy size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadBlob(new Blob([cli], { type: "text/plain;charset=utf-8" }), `${d.name}-cli.txt`)}
                                    className="px-2 py-1 border-l border-slate-700 text-emerald-300 hover:bg-slate-800"
                                    aria-label={`CLI von ${d.name} als Textdatei speichern`}
                                  >
                                    <DownloadSimple size={13} />
                                  </button>
                                </span>
                              );
                            })}
                        </div>
                      </div>

                      {/* Aufbau-Hinweise & Kabel-Zuordnungen */}
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-terminal-muted">
                          Kabel- & Port-Zuordnungen:
                        </h4>
                        <div className="space-y-1.5 font-mono text-xs">
                          {currentLab.topology.connections.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-300">
                              <span className="text-cyan-500 font-bold">↳</span>
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200/90 mt-2">
                          <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-amber-300 mr-1">Praxis-Tipp:</strong>
                            {currentLab.topology.hint}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rechte Spalte: Aufgabenstellung & Konfiguration */}
                    <div className="xl:col-span-5 space-y-5 min-w-0">
                      {/* Didaktischer Kontext */}
                      {currentLab.context && (
                        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            <h3 className="text-xs font-bold text-indigo-300 font-sans tracking-wide uppercase">
                              Didaktischer Kontext
                            </h3>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/20">
                              <span className="text-indigo-400 font-bold block text-[11px] uppercase tracking-wider mb-0.5">
                                Ausgangslage & Problem:
                              </span>
                              <p className="text-slate-300 leading-relaxed font-sans">
                                {currentLab.context.problem}
                              </p>
                            </div>
                            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/20">
                              <span className="text-emerald-400 font-bold block text-[11px] uppercase tracking-wider mb-0.5">
                                Praxis-Zweck & Lernziel:
                              </span>
                              <p className="text-slate-300 leading-relaxed font-sans">
                                {currentLab.context.purpose}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Schritt 2: CLI-Konfiguration */}
                      <section className="space-y-3">
                        <div className="flex items-center justify-between pb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                              ②
                            </span>
                            <h3 className="text-sm font-bold text-white font-sans">
                              Schritt-für-Schritt CLI-Konfiguration
                            </h3>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            {currentLab.steps.length} Schritte
                          </span>
                        </div>

                        {currentLab.steps.map((step, si) => (
                          <div key={si} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                                Schritt {si + 1}
                              </span>
                              <h4 className="text-xs font-bold text-white font-sans">
                                {step.title}
                              </h4>
                            </div>

                            {step.blocks.map((block, bi) => (
                              <CommandBlockView key={bi} block={block} />
                            ))}
                          </div>
                        ))}
                      </section>

                      {/* Schritt 3: Verifikation */}
                      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                            ③
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-white font-sans">
                            Verifikation — Lab erfolgreich wenn:
                          </h3>
                        </div>

                        <div className="space-y-2 font-mono text-xs">
                          {currentLab.verifyCommands.map((v, i) => (
                            <div
                              key={i}
                              className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1"
                            >
                              <div className="flex items-center gap-2">
                                <CopyButton text={v.cmd} label="" />
                                <code className="text-emerald-300 font-bold truncate">
                                  {v.cmd}
                                </code>
                              </div>
                              <div className="text-slate-300 font-sans text-xs pl-7">
                                <span className="text-terminal-muted font-mono mr-1">Erwartet:</span>
                                <span className="text-emerald-400 font-medium">
                                  {v.expected}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Schritt 4: Glossar */}
                      {currentLab.glossary && currentLab.glossary.length > 0 && (
                        <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs border border-slate-700">
                              ④
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-white font-sans">
                              Glossar: Fachbegriffe
                            </h3>
                          </div>

                          <div className="space-y-2 text-xs">
                            {currentLab.glossary.map((g, i) => (
                              <div
                                key={i}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-0.5"
                              >
                                <span className="font-mono font-bold text-cyan-300 block text-xs">
                                  {g.term}
                                </span>
                                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                  {g.def}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ── Standard-Ansicht für Labs ohne structuredTopology ── */}
                    {/* ── Kontext: Warum dieses Lab? ── */}
                    {currentLab.context && (
                      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          <h3 className="text-sm font-bold text-indigo-300 font-sans tracking-wide uppercase">
                            Didaktischer Kontext: Worum geht es in diesem Lab?
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-indigo-500/20">
                            <span className="text-indigo-400 font-bold block text-xs uppercase tracking-wider">
                              Ausgangslage & Problem:
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">
                              {currentLab.context.problem}
                            </p>
                          </div>
                          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-indigo-500/20">
                            <span className="text-emerald-400 font-bold block text-xs uppercase tracking-wider">
                              Praxis-Zweck & Lernziel:
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">
                              {currentLab.context.purpose}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Schritt 1: Topologie-Aufbau (Packet Tracer) ── */}
                    <section className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs border border-cyan-500/30">
                            ①
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                            Topologie im Packet Tracer aufbauen
                          </h3>
                        </div>
                        <span className="text-[11px] text-cyan-300/80 font-mono hidden sm:inline">
                          Drag & Drop
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {currentLab.topology.description}
                      </p>

                      {/* Geräte-Übersicht */}
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-terminal-muted mb-2">
                          Benötigte Netzwerkgeräte:
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {currentLab.topology.devices.map((d, i) => (
                            <div
                              key={i}
                              className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-xs"
                            >
                              <span className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/30 font-mono">
                                {d.count}×
                              </span>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white block truncate">
                                  {d.type}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono truncate block">
                                  {d.label}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Verbindungen */}
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-terminal-muted mb-2">
                          Kabel & Port-Zuordnungen:
                        </h4>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5 font-mono text-xs">
                          {currentLab.topology.connections.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-300">
                              <span className="text-cyan-500 font-bold">↳</span>
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Wichtiger Aufbau-Tipp */}
                      <div className="flex items-start gap-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                        <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-bold text-amber-300 mr-1.5">Praxis-Tipp:</span>
                          {currentLab.topology.hint}
                        </div>
                      </div>

                      {/* Optionales visuelles Topologie-Diagramm */}
                      {currentLab.topology.topologyDiagram && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                          {currentLab.topology.topologyDiagram}
                        </div>
                      )}

                      {/* Strukturierte Exhibits */}
                      {currentLab.exhibits && currentLab.exhibits.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {currentLab.exhibits.map((ex, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-slate-800">
                              <ExhibitRenderer exhibit={ex} />
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* ── Schritt 2: CLI-Konfiguration ── */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                            ②
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                            Schritt-für-Schritt CLI-Konfiguration
                          </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {currentLab.steps.length} Einzelschritte
                        </span>
                      </div>

                      {currentLab.steps.map((step, si) => (
                        <div key={si} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                              Schritt {si + 1}
                            </span>
                            <h4 className="text-sm font-bold text-white font-sans">
                              {step.title}
                            </h4>
                          </div>

                          {step.blocks.map((block, bi) => (
                            <CommandBlockView key={bi} block={block} />
                          ))}
                        </div>
                      ))}
                    </section>

                    {/* ── Schritt 3: Verifikation ── */}
                    <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                          ③
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                          Verifikation — Lab erfolgreich, wenn:
                        </h3>
                      </div>

                      <div className="space-y-2 pt-1 font-mono text-xs">
                        {currentLab.verifyCommands.map((v, i) => (
                          <div
                            key={i}
                            className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CopyButton text={v.cmd} label="" />
                              <code className="text-emerald-300 font-bold truncate">
                                {v.cmd}
                              </code>
                            </div>
                            <div className="text-slate-300 font-sans text-xs md:text-right pl-7 md:pl-0">
                              <span className="text-terminal-muted font-mono mr-1">Erwartung:</span>
                              <span className="text-emerald-400 font-medium">{v.expected}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* ── Schritt 4: Glossar ── */}
                    {currentLab.glossary && currentLab.glossary.length > 0 && (
                      <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs border border-slate-700">
                            ④
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                            Glossar: Fachbegriffe in diesem Lab
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                          {currentLab.glossary.map((g, i) => (
                            <div
                              key={i}
                              className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-0.5"
                            >
                              <span className="font-mono font-bold text-cyan-300 block text-xs">
                                {g.term}
                              </span>
                              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                {g.def}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}

                {/* ── Footer Navigation: Vorheriges / Nächstes Lab ── */}
                <div className="pt-4 pb-6 flex items-center justify-between gap-3 border-t border-slate-800">
                  {prevLab ? (
                    <button
                      onClick={() => setSelectedId(prevLab.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span className="truncate max-w-[180px] sm:max-w-[280px]">
                        Zurück: {prevLab.title}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextLab ? (
                    <button
                      onClick={() => setSelectedId(nextLab.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition-colors ml-auto"
                    >
                      <span className="truncate max-w-[180px] sm:max-w-[280px]">
                        Weiter: {nextLab.title}
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}
