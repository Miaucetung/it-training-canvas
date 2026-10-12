import {
  getToolEngineStatus,
  isToolSupportedForSubject,
} from "@/lib/navigation-config";
import {
  LearningPath,
  ToolId,
  UserProgress,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowClockwise,
  BookOpen,
  Calculator,
  ChartLine,
  Compass,
  CurrencyDollar,
  Export,
  FileText,
  FolderOpen,
  GitFork,
  GraduationCap,
  Lightning,
  Notepad,
  Plugs,
  Plus,
  Pulse,
  Question,
  ShieldCheck,
  Stack,
  Stethoscope,
  Table,
  Target,
  Terminal,
  Timer,
  TreeStructure,
  X,
} from "@phosphor-icons/react";
import React from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  currentSubject: string;
  subjects: string[];
  onSelectSubject: (s: string) => void;
  canvasView: boolean;
  onToggleCanvasView: () => void;
  canvasEngine?: "v1" | "v2";

  // Actions
  onNavigateOverview: () => void;
  onAccount: () => void;
  learningPaths: Record<string, LearningPath>;
  userProgress: Record<string, UserProgress>;
  onStartLearningPath: (path: LearningPath) => void;
  onNewLearningPath: () => void;

  onOpenExamPrep: () => void;
  onOpenPrioritizedLearning: () => void;

  onSelectTool: (id: ToolId) => void;
  onOpenPing: () => void;
  isPacketFlowActive: boolean;
  onTogglePacketFlow: () => void;
  isSimulationHUDActive?: boolean;
  onToggleSimulationHUD?: () => void;

  onOpenTerminal: () => void;
  onOpenLabs: () => void;
  onAddDevice: () => void;
  onOpenTopologyValidator: () => void;
  isMetricsActive: boolean;
  onToggleMetrics: () => void;
  isAnnotationsActive: boolean;
  onToggleAnnotations: () => void;
  onOpenTemplates: () => void;
  onOpenShareExport: () => void;
  isCostCalculatorActive?: boolean;
  onToggleCostCalculator?: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  open,
  onClose,
  currentSubject,
  subjects: _subjects,
  onSelectSubject: _onSelectSubject,
  canvasView,
  onToggleCanvasView,
  canvasEngine = "v2",
  onNavigateOverview,
  onAccount,
  learningPaths,
  userProgress,
  onStartLearningPath,
  onNewLearningPath,
  onOpenExamPrep,
  onOpenPrioritizedLearning,
  onSelectTool,
  onOpenPing,
  isPacketFlowActive,
  onTogglePacketFlow,
  isSimulationHUDActive = false,
  onToggleSimulationHUD,
  onOpenTerminal,
  onOpenLabs,
  onAddDevice,
  onOpenTopologyValidator,
  isMetricsActive,
  onToggleMetrics,
  isAnnotationsActive,
  onToggleAnnotations,
  onOpenTemplates,
  onOpenShareExport,
  isCostCalculatorActive = false,
  onToggleCostCalculator,
}) => {
  if (!open) return null;

  const allPaths = Object.values(learningPaths);
  const currentSubjectPaths = allPaths.filter(
    (p) => p.subject === currentSubject || p.tags?.includes(currentSubject)
  );

  const handleEngineGatedAction = (toolId: string, action: () => void) => {
    const status = getToolEngineStatus(toolId, canvasEngine);
    if (!status.isAvailable) {
      toast.info(status.notice || "Dieses Werkzeug ist in dieser Canvas-Version nicht verfügbar.", {
        duration: 3500,
      });
      return;
    }
    action();
  };

  return createPortal(
    <div className="fixed inset-0 z-drawer flex justify-end select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation und Werkzeuge"
        className="relative z-drawer w-[320px] max-w-[85vw] h-full flex flex-col shadow-2xl border-l border-border-default bg-surface text-text-primary overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-elevated shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: "#0284C7" }}
            />
            <div className="min-w-0">
              <span className="text-sm font-bold text-text-primary block truncate">
                CCNA 200-301
              </span>
              <span className="text-[10px] text-text-muted block truncate">
                Lern- & Trainingsplattform
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Menü schließen"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Quick Flip Button between Lernen and Canvas */}
          <button
            onClick={() => {
              onClose();
              onToggleCanvasView();
            }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-3 min-h-[48px] rounded-xl font-semibold text-xs border transition-all shadow-xs",
              canvasView
                ? "border-accent-primary bg-accent-primary/15 text-accent-primary-fg"
                : "border-border-default bg-surface-elevated text-text-primary hover:border-accent-primary"
            )}
          >
            <div className="flex items-center gap-2">
              <ArrowClockwise size={18} weight="bold" />
              <span>{canvasView ? "Zurück zu Lektionen & Dashboard" : `Zum Canvas wechseln (${canvasEngine})`}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface font-bold border border-border-default">
              {canvasView ? "Lernen" : "Canvas"}
            </span>
          </button>

          {/* Sektion 2: Lernen */}
          <div>
            <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-primary-fg">
              Lernen & Pfade
            </p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onNavigateOverview();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
              >
                <BookOpen size={18} className="text-accent-primary-fg shrink-0" />
                <span>Themenübersicht & Module</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAccount();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
              >
                <ChartLine size={18} className="text-indigo-400 shrink-0" />
                <span>Mein Lernfortschritt</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNewLearningPath();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
              >
                <Plus size={18} className="text-emerald-400 shrink-0" />
                <span>Neuen Lernpfad anlegen</span>
              </button>

              {currentSubjectPaths.length > 0 && (
                <div className="pt-1.5 pl-2 border-l border-border-default space-y-1">
                  <div className="text-[10px] font-semibold text-text-muted uppercase">Lernpfade</div>
                  {currentSubjectPaths.slice(0, 3).map((p) => {
                    const prog = userProgress[p.id];
                    const done = prog
                      ? p.steps.filter((s) => prog.completedSteps.includes(s.id)).length
                      : 0;
                    const pct = p.steps.length ? Math.round((done / p.steps.length) * 100) : 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onClose();
                          onStartLearningPath(p);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 min-h-[40px] rounded-md text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-left"
                      >
                        <span className="truncate">{p.title}</span>
                        <span className="text-[10px] text-text-muted shrink-0 ml-2">{pct}% · {p.estimatedMinutes}m</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sektion 3: Üben & Prüfen */}
          <div>
            <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Üben & Prüfen
            </p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenExamPrep();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target size={18} weight="fill" className="text-sky-400 shrink-0" />
                  <span>Prüfungsfragen-Trainer</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                  1.081 Fragen
                </span>
              </button>

              {isToolSupportedForSubject("dragdrop-trainer", currentSubject) && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectTool("dragdrop-trainer");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Stack size={18} weight="fill" className="text-indigo-400 shrink-0" />
                    <span>Drag-and-Drop-Trainer</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                    81 Aufgaben
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenPrioritizedLearning();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
              >
                <ChartLine size={18} weight="fill" className="text-amber-400 shrink-0" />
                <span>Priorisiertes Lernen (Blueprint)</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenExamPrep();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
              >
                <Lightning size={18} weight="fill" className="text-rose-400 shrink-0" />
                <span>Gezielter Schwächen-Drill</span>
              </button>
            </div>
          </div>

          {/* Sektion 4: Simulatoren */}
          <div>
            <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Simulatoren
            </p>
            <div className="space-y-1">
              {isToolSupportedForSubject("vlan-simulator", currentSubject) && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectTool("vlan-simulator");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
                >
                  <TreeStructure size={18} className="text-sky-400 shrink-0" />
                  <span>VLAN- und Trunk-Simulator</span>
                </button>
              )}

              {isToolSupportedForSubject("stp-simulator", currentSubject) && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectTool("stp-simulator");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
                >
                  <GitFork size={18} className="text-emerald-400 shrink-0" />
                  <span>Spanning-Tree-Simulator (STP/RSTP)</span>
                </button>
              )}

              {isToolSupportedForSubject("osi-simulator", currentSubject) && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectTool("osi-simulator");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
                >
                  <Stack size={18} className="text-purple-400 shrink-0" />
                  <span>OSI- und TCP/IP-Simulator</span>
                </button>
              )}

              {isToolSupportedForSubject("routing-simulator", currentSubject) && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectTool("routing-simulator");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
                >
                  <Compass size={18} className="text-amber-400 shrink-0" />
                  <span>Routing- und OSPF-Simulator</span>
                </button>
              )}

              {isToolSupportedForSubject("ping-test", currentSubject) && (() => {
                const pingStatus = getToolEngineStatus("ping-test", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("ping-test", onOpenPing);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left",
                      !pingStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Lightning size={18} className="text-cyan-400 shrink-0" />
                      <span>Geführter Ping-Test</span>
                    </div>
                    {pingStatus.requiresV1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                        Nur v1
                      </span>
                    )}
                  </button>
                );
              })()}

              {isToolSupportedForSubject("packet-flow", currentSubject) && (
                <button
                  onClick={() => {
                    onClose();
                    onTogglePacketFlow();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Lightning size={18} className={isPacketFlowActive ? "text-emerald-400" : "text-text-muted"} />
                    <span>Paketfluss-Visualisierer (Canvas v2)</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-elevated text-text-muted border border-border-default">
                    In Vorbereitung
                  </span>
                </button>
              )}

              {onToggleSimulationHUD && isToolSupportedForSubject("simulation-hud", currentSubject) && (() => {
                const hudStatus = getToolEngineStatus("simulation-hud", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("simulation-hud", onToggleSimulationHUD);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-surface-elevated text-text-primary transition-colors text-left",
                      !hudStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Pulse size={18} className={isSimulationHUDActive ? "text-teal-400" : "text-text-muted"} />
                      <span>Topologie-Simulation (HUD)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hudStatus.requiresV1 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                          Nur v1
                        </span>
                      )}
                      {isSimulationHUDActive && <div className="w-2 h-2 rounded-full bg-teal-400" />}
                    </div>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Sektion: Packet Tracer Labs */}
          <div>
            <div className="flex items-center justify-between px-1 pb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                Praxis-Labs
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono font-semibold">
                55 Labs
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenLabs();
              }}
              className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen size={20} className="text-violet-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    Packet Tracer Labs
                  </span>
                  <span className="text-[10px] text-text-muted block">
                    Schritt-für-Schritt Topologien & CLI-Befehle
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-violet-400">
                Öffnen →
              </span>
            </button>
          </div>

          {/* Sektion 5: Werkzeuge */}
          <div>
            <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Werkzeuge & Rechner
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {isToolSupportedForSubject("subnetting-drill", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("subnetting-drill"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <Timer size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">Subnetting-Drill</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Gegen die Uhr</div>
                </button>
              )}
              {isToolSupportedForSubject("subnetting-quiz", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("subnetting-quiz"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <Question size={14} className="text-sky-400 shrink-0" />
                    <span className="truncate">Subnetting-Quiz</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Multiple-Choice</div>
                </button>
              )}
              {isToolSupportedForSubject("subnetting-cheatsheet", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("subnetting-cheatsheet"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <FileText size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Subnetting-Übersicht</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">VLSM & Masken</div>
                </button>
              )}
              {isToolSupportedForSubject("ipv4-subnet-table", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("ipv4-subnet-table"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <Table size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">IPv4-Tabelle</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">CIDR & Masken</div>
                </button>
              )}
              {isToolSupportedForSubject("ipv6-calculator", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("ipv6-calculator"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <Calculator size={14} className="text-cyan-400 shrink-0" />
                    <span className="truncate">IPv6-Rechner</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">EUI-64, Präfixe</div>
                </button>
              )}
              {isToolSupportedForSubject("cli-glossary", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("cli-glossary"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <BookOpen size={14} className="text-teal-400 shrink-0" />
                    <span className="truncate">CLI-Referenz</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">IOS-Befehle</div>
                </button>
              )}
              {isToolSupportedForSubject("terminal", currentSubject) && (
                <button
                  onClick={() => { onClose(); onOpenTerminal(); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <Terminal size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">IOS-Terminal</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Geräte-Konsole</div>
                </button>
              )}
              {isToolSupportedForSubject("labs", currentSubject) && (
                <button
                  onClick={() => { onClose(); onOpenLabs(); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <GraduationCap size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Praxis-Labs</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Geführte Übungen</div>
                </button>
              )}
              {isToolSupportedForSubject("verkabelung-trainer", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("verkabelung-trainer"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <Plugs size={14} className="text-yellow-400 shrink-0" />
                    <span className="truncate">Kabel-Trainer</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Medien & Ports</div>
                </button>
              )}
              {isToolSupportedForSubject("routing-drill", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("routing-drill"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <Compass size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">Routing-Trainer</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">ip route & Match</div>
                </button>
              )}
              {isToolSupportedForSubject("ospf-wildcard-drill", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("ospf-wildcard-drill"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <TreeStructure size={14} className="text-violet-400 shrink-0" />
                    <span className="truncate">OSPF-Trainer</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Wildcard & Area</div>
                </button>
              )}
              {isToolSupportedForSubject("acl-drill", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("acl-drill"); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                    <ShieldCheck size={14} className="text-rose-400 shrink-0" />
                    <span className="truncate">ACL-Trainer</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Access-Listen</div>
                </button>
              )}
              {isToolSupportedForSubject("cost-calculator", currentSubject) && onToggleCostCalculator && (
                <button
                  onClick={() => { onClose(); onToggleCostCalculator(); }}
                  className="p-2.5 min-h-[48px] rounded-lg border border-border-default bg-surface-elevated hover:bg-surface text-left transition-colors flex flex-col justify-center relative"
                >
                  <div className="flex items-center justify-between font-semibold text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <CurrencyDollar size={14} className="text-amber-400 shrink-0" />
                      <span className="truncate">Kosten-Rechner</span>
                    </div>
                    {isCostCalculatorActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-1" />}
                  </div>
                  <div className="text-[10px] text-text-muted truncate ml-5">Cloud-Kosten</div>
                </button>
              )}
            </div>
          </div>

          {/* Sektion 6: Canvas & Kollaboration */}
          <div>
            <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Topologie & Export
            </p>
            <div className="space-y-1">
              {(() => {
                const addDevStatus = getToolEngineStatus("add-device", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("add-device", onAddDevice);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 min-h-[40px] rounded-lg text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors text-left",
                      !addDevStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Plus size={16} className="text-sky-400 shrink-0" />
                      <span>Gerät hinzufügen</span>
                    </div>
                    {addDevStatus.requiresV1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                        Nur v1
                      </span>
                    )}
                  </button>
                );
              })()}

              {isToolSupportedForSubject("topology-validator", currentSubject) && (() => {
                const valStatus = getToolEngineStatus("topology-validator", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("topology-validator", onOpenTopologyValidator);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 min-h-[40px] rounded-lg text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors text-left",
                      !valStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Stethoscope size={16} className="text-blue-400 shrink-0" />
                      <span>Topologie-Diagnose</span>
                    </div>
                    {valStatus.requiresV1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                        Nur v1
                      </span>
                    )}
                  </button>
                );
              })()}

              {isToolSupportedForSubject("topologie-explorer", currentSubject) && (
                <button
                  onClick={() => { onClose(); onSelectTool("topologie-explorer"); }}
                  className="w-full flex items-center gap-3 px-3 py-2 min-h-[40px] rounded-lg text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors text-left"
                >
                  <Compass size={16} className="text-cyan-400 shrink-0" />
                  <span>Topologie-Explorer</span>
                </button>
              )}

              {(() => {
                const metStatus = getToolEngineStatus("metrics", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("metrics", onToggleMetrics);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 min-h-[40px] rounded-lg text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors text-left",
                      !metStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ChartLine size={16} className="text-teal-400 shrink-0" />
                      <span>Live-Metriken</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {metStatus.requiresV1 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                          Nur v1
                        </span>
                      )}
                      {isMetricsActive && <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                    </div>
                  </button>
                );
              })()}

              {(() => {
                const notStatus = getToolEngineStatus("annotations", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("annotations", onToggleAnnotations);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 min-h-[40px] rounded-lg text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors text-left",
                      !notStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Notepad size={16} className="text-pink-400 shrink-0" />
                      <span>Topologie-Notizen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {notStatus.requiresV1 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                          Nur v1
                        </span>
                      )}
                      {isAnnotationsActive && <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />}
                    </div>
                  </button>
                );
              })()}

              {(() => {
                const tplStatus = getToolEngineStatus("templates", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("templates", onOpenTemplates);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 min-h-[40px] rounded-lg text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors text-left",
                      !tplStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen size={16} className="text-purple-400 shrink-0" />
                      <span>Topologie-Vorlagen</span>
                    </div>
                    {tplStatus.requiresV1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                        Nur v1
                      </span>
                    )}
                  </button>
                );
              })()}

              {(() => {
                const expStatus = getToolEngineStatus("share-export", canvasEngine);
                return (
                  <button
                    onClick={() => {
                      onClose();
                      handleEngineGatedAction("share-export", onOpenShareExport);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 min-h-[40px] rounded-lg text-xs hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors text-left",
                      !expStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Export size={16} className="text-cyan-400 shrink-0" />
                      <span>Teilen und Exportieren</span>
                    </div>
                    {expStatus.requiresV1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal">
                        Nur v1
                      </span>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
