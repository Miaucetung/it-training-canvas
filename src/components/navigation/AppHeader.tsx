import { AuthMenu } from "@/components/AuthMenu";
import type { User } from "@supabase/supabase-js";
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
  CaretDown,
  ChartLine,
  Compass,
  CurrencyDollar,
  Desktop,
  Export,
  FileText,
  FolderOpen,
  GitFork,
  GraduationCap,
  Keyboard,
  Lightning,
  List,
  Moon,
  Network,
  Notepad,
  Plugs,
  Plus,
  Pulse,
  Question,
  ShieldCheck,
  Stack,
  Stethoscope,
  Sun,
  Table,
  Target,
  Terminal,
  Timer,
  TreeStructure,
  Wrench,
} from "@phosphor-icons/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export type NavMenuId = "learn" | "practice" | "simulators" | "tools";

export interface AppHeaderProps {
  currentSubject: string;
  subjects: string[];
  onSelectSubject: (subject: string) => void;
  canvasView: boolean;
  onToggleCanvasView: () => void;
  canvasEngine?: "v1" | "v2";
  theme: "dark" | "light";
  themePreference: "system" | "light" | "dark";
  onSelectTheme: (t: "system" | "light" | "dark") => void;
  onCycleTheme: () => void;
  user: User | null;
  onLogin: () => void;
  onAccount: () => void;
  onOpenKeyboardShortcuts: () => void;
  onOpenMobileMenu: () => void;

  // Lernen
  onNavigateOverview: () => void;
  learningPaths: Record<string, LearningPath>;
  userProgress: Record<string, UserProgress>;
  onStartLearningPath: (path: LearningPath) => void;
  onNewLearningPath: () => void;

  // Üben & Prüfen
  onOpenExamPrep: () => void;
  onOpenPrioritizedLearning: () => void;

  // Simulatoren & Werkzeuge
  onSelectTool: (id: ToolId) => void;
  activeTool: ToolId | null;
  onOpenPing: () => void;
  isPacketFlowActive: boolean;
  onTogglePacketFlow: () => void;
  isSimulationHUDActive?: boolean;
  onToggleSimulationHUD?: () => void;

  // Werkzeuge / Tools & Canvas
  hasSelectedShape: boolean;
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
  isCostCalculatorActive: boolean;
  onToggleCostCalculator: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentSubject,
  subjects: _subjects,
  onSelectSubject: _onSelectSubject,
  canvasView,
  onToggleCanvasView,
  canvasEngine = "v2",
  theme,
  themePreference,
  onSelectTheme,
  onCycleTheme,
  user,
  onLogin,
  onAccount,
  onOpenKeyboardShortcuts,
  onOpenMobileMenu,
  onNavigateOverview,
  learningPaths,
  userProgress,
  onStartLearningPath,
  onNewLearningPath,
  onOpenExamPrep,
  onOpenPrioritizedLearning,
  onSelectTool,
  activeTool,
  onOpenPing,
  isPacketFlowActive,
  onTogglePacketFlow,
  isSimulationHUDActive = false,
  onToggleSimulationHUD,
  hasSelectedShape,
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
  isCostCalculatorActive,
  onToggleCostCalculator,
}) => {
  const [openMenu, setOpenMenu] = useState<NavMenuId | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left?: number; right?: number } | null>(null);

  // Button refs for anchoring
  const learnBtnRef = useRef<HTMLButtonElement | null>(null);
  const practiceBtnRef = useRef<HTMLButtonElement | null>(null);
  const simulatorsBtnRef = useRef<HTMLButtonElement | null>(null);
  const toolsBtnRef = useRef<HTMLButtonElement | null>(null);

  const getTriggerBtn = (menuId: NavMenuId | null): HTMLButtonElement | null => {
    switch (menuId) {
      case "learn":
        return learnBtnRef.current;
      case "practice":
        return practiceBtnRef.current;
      case "simulators":
        return simulatorsBtnRef.current;
      case "tools":
        return toolsBtnRef.current;
      default:
        return null;
    }
  };

  const closeMenu = useCallback((restoreFocus = false) => {
    const trigger = getTriggerBtn(openMenu);
    setOpenMenu(null);
    if (restoreFocus && trigger) {
      trigger.focus();
    }
  }, [openMenu]);

  const toggleMenu = (menuId: NavMenuId, btnRef: React.RefObject<HTMLButtonElement | null>) => {
    if (openMenu === menuId) {
      closeMenu(false);
      return;
    }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const isRightAligned = menuId === "tools" || rect.left > window.innerWidth / 2;
      if (isRightAligned) {
        setMenuPos({
          top: rect.bottom + 6,
          right: Math.max(12, window.innerWidth - rect.right),
        });
      } else {
        setMenuPos({
          top: rect.bottom + 6,
          left: Math.max(12, rect.left),
        });
      }
    }
    setOpenMenu(menuId);
  };

  // Keyboard navigation within open menu (Escape, ArrowDown, ArrowUp, Home, End)
  useEffect(() => {
    if (!openMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const menuEl = document.getElementById(`nav-menu-${openMenu}`);
      if (!menuEl) return;

      const items = Array.from(
        menuEl.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')
      );
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === "Tab") {
        closeMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openMenu, closeMenu]);

  // Learning paths for current subject
  const allPaths = Object.values(learningPaths);
  const currentSubjectPaths = allPaths.filter(
    (p) => p.subject === currentSubject || p.tags?.includes(currentSubject)
  );

  // Helper to handle tool click with engine verification
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

  return (
    <header className="flex items-center justify-between px-3 md:px-6 py-2.5 border-b border-border-default bg-surface/90 backdrop-blur-md select-none shrink-0 z-sticky">
      {/* Linke Seite: Logo / Brand (CCNA 200-301) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onNavigateOverview}
          className="flex items-center gap-2.5 px-2 py-1.5 -ml-1 rounded-lg text-left hover:bg-surface-elevated transition-colors border border-transparent hover:border-border-default group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          title="Zur CCNA-Startseite"
          aria-label="CCNA 200-301 Lern- & Trainingsplattform – Startseite"
        >
          <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary shadow-xs" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-text-primary tracking-tight">
                CCNA 200-301
              </span>
            </div>
            <p className="text-[11px] text-text-muted hidden sm:block truncate">
              Lern- & Trainingsplattform
            </p>
          </div>
        </button>
      </div>

      {/* Mitte: Die 4 logischen Navigations-Gruppen (Desktop >= xl / 1280px) */}
      <nav className="hidden xl:flex items-center gap-1" aria-label="Hauptnavigation">
        {/* Gruppe 1: Lernen */}
        <button
          id="nav-btn-learn"
          ref={learnBtnRef}
          onClick={() => toggleMenu("learn", learnBtnRef)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            openMenu === "learn"
              ? "bg-surface-elevated text-text-primary border-border-default shadow-xs"
              : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
          aria-haspopup="menu"
          aria-expanded={openMenu === "learn"}
          aria-controls="nav-menu-learn"
        >
          <GraduationCap size={16} weight={openMenu === "learn" ? "fill" : "regular"} className="text-accent-primary-fg" />
          <span>Lernen</span>
          <CaretDown
            size={11}
            className={cn("transition-transform duration-150", openMenu === "learn" && "rotate-180")}
          />
        </button>

        {/* Gruppe 2: Üben & Prüfen */}
        <button
          id="nav-btn-practice"
          ref={practiceBtnRef}
          onClick={() => toggleMenu("practice", practiceBtnRef)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            openMenu === "practice"
              ? "bg-surface-elevated text-text-primary border-border-default shadow-xs"
              : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
          aria-haspopup="menu"
          aria-expanded={openMenu === "practice"}
          aria-controls="nav-menu-practice"
        >
          <Target size={16} weight={openMenu === "practice" ? "fill" : "regular"} className="text-sky-500" />
          <span>Üben & Prüfen</span>
          <CaretDown
            size={11}
            className={cn("transition-transform duration-150", openMenu === "practice" && "rotate-180")}
          />
        </button>

        {/* Gruppe 3: Simulatoren */}
        <button
          id="nav-btn-simulators"
          ref={simulatorsBtnRef}
          onClick={() => toggleMenu("simulators", simulatorsBtnRef)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            openMenu === "simulators"
              ? "bg-surface-elevated text-text-primary border-border-default shadow-xs"
              : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
          aria-haspopup="menu"
          aria-expanded={openMenu === "simulators"}
          aria-controls="nav-menu-simulators"
        >
          <Pulse size={16} weight={openMenu === "simulators" ? "fill" : "regular"} className="text-teal-500" />
          <span>Simulatoren</span>
          <CaretDown
            size={11}
            className={cn("transition-transform duration-150", openMenu === "simulators" && "rotate-180")}
          />
        </button>

        {/* Gruppe 4: Labs (Packet Tracer) */}
        <button
          id="nav-btn-labs"
          onClick={() => {
            closeMenu();
            onOpenLabs();
          }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
          title="Packet Tracer Labs — 55 geführte Cisco IOS Praxisübungen"
          aria-label="Labs 55 – Packet Tracer Labs öffnen"
        >
          <BookOpen size={16} weight="regular" className="text-violet-400" />
          <span>Labs</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 font-mono font-semibold">
            55
          </span>
        </button>

        {/* Gruppe 5: Werkzeuge */}
        <button
          id="nav-btn-tools"
          ref={toolsBtnRef}
          onClick={() => toggleMenu("tools", toolsBtnRef)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            openMenu === "tools" || activeTool
              ? "bg-surface-elevated text-text-primary border-border-default shadow-xs"
              : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
          aria-haspopup="menu"
          aria-expanded={openMenu === "tools"}
          aria-controls="nav-menu-tools"
        >
          <Wrench size={16} weight={openMenu === "tools" ? "fill" : "regular"} className="text-amber-500" />
          <span>Werkzeuge</span>
          <CaretDown
            size={11}
            className={cn("transition-transform duration-150", openMenu === "tools" && "rotate-180")}
          />
        </button>
      </nav>

      {/* Rechte Seite: Global Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile/Tablet-Menü Button (< xl / 1280px) */}
        <button
          onClick={() => {
            closeMenu();
            onOpenMobileMenu();
          }}
          className="xl:hidden flex items-center justify-center min-h-[44px] min-w-[44px] px-2.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border-default transition-colors"
          title="Menü & Werkzeuge öffnen"
          aria-label="Navigation und Werkzeuge öffnen"
        >
          <List size={20} weight="bold" />
          <span className="ml-1 text-xs font-medium">Menü</span>
        </button>

        {/* Tastenkürzel & Hilfe (? on md+) */}
        <button
          onClick={() => {
            closeMenu();
            onOpenKeyboardShortcuts();
          }}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          title="Tastenkürzel & Hilfe (?)"
          aria-label="Tastenkürzel und Hilfe anzeigen"
        >
          <Keyboard size={16} />
        </button>

        <div className="w-px h-4 hidden sm:block bg-border-default" />

        {/* Theme-Schalter (Desktop: 3 Segmente) */}
        <div
          className="hidden sm:inline-flex items-center p-0.5 rounded-lg border border-border-default bg-surface text-xs"
          role="group"
          aria-label="Theme-Auswahl"
        >
          <button
            type="button"
            onClick={() => onSelectTheme("system")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
              themePreference === "system"
                ? "bg-surface-elevated font-semibold text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
            title="System-Einstellung folgen"
            aria-pressed={themePreference === "system"}
          >
            <Desktop size={14} weight={themePreference === "system" ? "bold" : "regular"} />
            <span>System</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTheme("light")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
              themePreference === "light"
                ? "bg-surface-elevated font-semibold text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
            title="Heller Modus"
            aria-pressed={themePreference === "light"}
          >
            <Sun size={14} weight={themePreference === "light" ? "bold" : "regular"} />
            <span>Hell</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTheme("dark")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
              themePreference === "dark"
                ? "bg-surface-elevated font-semibold text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
            title="Dunkler Modus"
            aria-pressed={themePreference === "dark"}
          >
            <Moon size={14} weight={themePreference === "dark" ? "bold" : "regular"} />
            <span>Dunkel</span>
          </button>
        </div>

        {/* Theme-Schalter (Mobile: 44x44px Button) */}
        <button
          type="button"
          onClick={onCycleTheme}
          className="sm:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors border border-border-default text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
          title={`Theme: ${themePreference} – Tippen zum Umschalten`}
          aria-label={`Theme umschalten. Aktuell: ${themePreference}`}
        >
          {themePreference === "system" ? (
            <Desktop size={18} weight="bold" />
          ) : themePreference === "light" ? (
            <Sun size={18} weight="bold" />
          ) : (
            <Moon size={18} weight="bold" />
          )}
        </button>

        <div className="w-px h-4 hidden sm:block bg-border-default" />

        {/* Auth / Account */}
        <AuthMenu
          user={user}
          dark={theme === "dark"}
          onLogin={() => {
            closeMenu();
            onLogin();
          }}
          onAccount={() => {
            closeMenu();
            onAccount();
          }}
        />

        <div className="w-px h-4 hidden sm:block bg-border-default" />

        {/* 3D-Flip Button (Lernen <-> Canvas) */}
        <button
          onClick={() => {
            closeMenu();
            onToggleCanvasView();
          }}
          className={cn(
            "shrink-0 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold border transition-all",
            canvasView
              ? "border-accent-primary bg-accent-primary/10 text-accent-primary-fg hover:bg-accent-primary/20 shadow-xs"
              : "border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
          title={canvasView ? "Zurück zur Lernoberfläche (Flip)" : "Zum Canvas wechseln (Flip)"}
          aria-label={canvasView ? "Zurück zur Lernoberfläche" : "Zum Canvas wechseln"}
        >
          <ArrowClockwise size={15} weight="bold" className={canvasView ? "rotate-180 transition-transform duration-300" : "transition-transform duration-300"} />
          <span className="font-semibold">{canvasView ? "Lernen" : "Canvas"}</span>
        </button>
      </div>

      {/* PORTAL-DROPDOWNS (--z-dropdown) */}
      {openMenu && menuPos && createPortal(
        <nav aria-label="Ausgeklapptes Navigationsmenü">
          {/* Transparent Backdrop */}
          <div
            className="fixed inset-0 z-dropdown"
            onClick={() => closeMenu(false)}
            aria-hidden="true"
          />

          {/* Menü: LERNEN */}
          {openMenu === "learn" && (
            <div
              id="nav-menu-learn"
              role="menu"
              aria-labelledby="nav-btn-learn"
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-dropdown w-80 rounded-xl border border-border-default bg-surface shadow-2xl overflow-hidden py-1.5 text-text-primary animate-in fade-in-0 zoom-in-95 duration-100"
            >
              <div role="presentation" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Themen & Wissen
              </div>
              <button
                role="menuitem"
                onClick={() => {
                  onNavigateOverview();
                  closeMenu();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
              >
                <BookOpen size={16} className="text-accent-primary-fg shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Themenübersicht & Module</div>
                  <div className="text-[10px] text-text-muted">Alle Lerneinheiten & Lektionen für CCNA 200-301</div>
                </div>
              </button>

              <div role="separator" className="my-1.5 mx-2 border-t border-border-default" />

              <div role="presentation" className="px-3 py-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Lernpfade ({currentSubjectPaths.length})
                </span>
                <button
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onNewLearningPath();
                  }}
                  className="text-[10px] text-accent-primary-fg hover:underline font-medium"
                >
                  + Neuer Pfad
                </button>
              </div>

              {currentSubjectPaths.length === 0 ? (
                <div role="presentation" className="px-3 py-2 text-[11px] text-text-muted italic">
                  Keine Pfade für dieses Fach. Erstelle den ersten!
                </div>
              ) : (
                <div role="group" aria-label="Lernpfade" className="max-h-48 overflow-y-auto">
                  {currentSubjectPaths.map((p) => {
                    const prog = userProgress[p.id];
                    const done = prog
                      ? p.steps.filter((s) => prog.completedSteps.includes(s.id)).length
                      : 0;
                    const pct = p.steps.length ? Math.round((done / p.steps.length) * 100) : 0;
                    return (
                      <button
                        role="menuitem"
                        key={p.id}
                        onClick={() => {
                          closeMenu();
                          onStartLearningPath(p);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-surface-elevated transition-colors"
                      >
                        <div className="text-xs font-medium text-text-primary truncate">{p.title}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          {p.estimatedMinutes} Min · {p.steps.length} Schritte · {pct}% fertig
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div role="separator" className="my-1.5 mx-2 border-t border-border-default" />

              <button
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onAccount();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
              >
                <ChartLine size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Mein Lernfortschritt</div>
                  <div className="text-[10px] text-text-muted">Absolvierte Schritte, Quizzes & Lerneffizienz</div>
                </div>
              </button>
            </div>
          )}

          {/* Menü: ÜBEN & PRÜFEN */}
          {openMenu === "practice" && (
            <div
              id="nav-menu-practice"
              role="menu"
              aria-labelledby="nav-btn-practice"
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-dropdown w-80 rounded-xl border border-border-default bg-surface shadow-2xl overflow-hidden py-1.5 text-text-primary animate-in fade-in-0 zoom-in-95 duration-100"
            >
              <div role="presentation" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Prüfungsvorbereitung
              </div>

              <button
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onOpenExamPrep();
                }}
                className="w-full flex items-start justify-between px-3 py-2 text-left hover:bg-surface-elevated transition-colors group"
              >
                <div className="flex items-start gap-2.5">
                  <Target size={16} weight="fill" className="text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-text-primary">Prüfungsfragen-Trainer</div>
                    <div className="text-[10px] text-text-muted">Lern- & Prüfungsmodus mit Erklärungen</div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-bold shrink-0">
                  1.055 Fragen
                </span>
              </button>

              {isToolSupportedForSubject("dragdrop-trainer", currentSubject) && (
                <button
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onSelectTool("dragdrop-trainer");
                  }}
                  className="w-full flex items-start justify-between px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <Stack size={16} weight="fill" className="text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-text-primary">Drag-and-Drop-Trainer</div>
                      <div className="text-[10px] text-text-muted">Zuordnungsfragen mit originalen Exhibits</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-bold shrink-0">
                    81 Aufgaben
                  </span>
                </button>
              )}

              <div role="separator" className="my-1.5 mx-2 border-t border-border-default" />

              <div role="presentation" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Gezieltes Training
              </div>

              <button
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onOpenPrioritizedLearning();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
              >
                <ChartLine size={16} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Priorisiertes Lernen (Blueprint)</div>
                  <div className="text-[10px] text-text-muted">Fragen nach Prüfungsgewichtung sortiert</div>
                </div>
              </button>

              <button
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onOpenExamPrep();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
              >
                <Lightning size={16} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Gezielter Schwächen-Drill</div>
                  <div className="text-[10px] text-text-muted">Gezielte Wiederholung falsch beantworteter Fragen</div>
                </div>
              </button>
            </div>
          )}

          {/* Menü: SIMULATOREN */}
          {openMenu === "simulators" && (
            <div
              id="nav-menu-simulators"
              role="menu"
              aria-labelledby="nav-btn-simulators"
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-dropdown w-84 rounded-xl border border-border-default bg-surface shadow-2xl overflow-hidden py-1.5 text-text-primary animate-in fade-in-0 zoom-in-95 duration-100"
            >
              <div role="presentation" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Interaktive Netzwerk-Simulatoren
              </div>

              {isToolSupportedForSubject("vlan-simulator", currentSubject) && (
                <button
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onSelectTool("vlan-simulator");
                  }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <TreeStructure size={16} className="text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-text-primary">VLAN- und Trunk-Simulator</div>
                    <div className="text-[10px] text-text-muted">Frames, Access-/Trunk-Ports & 802.1Q-Tags analysieren</div>
                  </div>
                </button>
              )}

              {isToolSupportedForSubject("stp-simulator", currentSubject) && (
                <button
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onSelectTool("stp-simulator");
                  }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <GitFork size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-text-primary">Spanning-Tree-Simulator (STP/RSTP)</div>
                    <div className="text-[10px] text-text-muted">Root-Bridge-Wahl, Port-Rollen & BPDUs Schritt für Schritt</div>
                  </div>
                </button>
              )}

              {isToolSupportedForSubject("osi-simulator", currentSubject) && (
                <button
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onSelectTool("osi-simulator");
                  }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <Stack size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-text-primary">OSI- und TCP/IP-Simulator</div>
                    <div className="text-[10px] text-text-muted">Kapselung durch alle 7 Schichten (L1–L7) & PDU-Header</div>
                  </div>
                </button>
              )}

              {isToolSupportedForSubject("routing-simulator", currentSubject) && (
                <button
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onSelectTool("routing-simulator");
                  }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <Compass size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-text-primary">Routing- und OSPF-Simulator</div>
                    <div className="text-[10px] text-text-muted">Routingtabellen, Pfadwahl & OSPF-Konvergenz</div>
                  </div>
                </button>
              )}

              {isToolSupportedForSubject("ping-test", currentSubject) && (() => {
                const pingStatus = getToolEngineStatus("ping-test", canvasEngine);
                return (
                  <button
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      handleEngineGatedAction("ping-test", onOpenPing);
                    }}
                    className={cn(
                      "w-full flex items-start justify-between px-3 py-2 text-left hover:bg-surface-elevated transition-colors",
                      !pingStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Lightning size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-text-primary">Geführter Ping-Test</div>
                        <div className="text-[10px] text-text-muted">ARP & ICMP Schritt für Schritt auf dem Canvas</div>
                      </div>
                    </div>
                    {pingStatus.requiresV1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal shrink-0">
                        Nur v1
                      </span>
                    )}
                  </button>
                );
              })()}

              <div role="separator" className="my-1.5 mx-2 border-t border-border-default" />

              <div role="presentation" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Topologie-Simulation
              </div>

              {isToolSupportedForSubject("packet-flow", currentSubject) && (
                <button
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onTogglePacketFlow();
                  }}
                  className="w-full flex items-start justify-between px-3 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <Lightning size={16} className={cn("shrink-0 mt-0.5", isPacketFlowActive ? "text-emerald-400" : "text-text-muted")} />
                    <div>
                      <div className="text-xs font-medium text-text-primary">Paketfluss-Visualisierer (Canvas v2)</div>
                      <div className="text-[10px] text-text-muted">Hop-by-Hop-Verfolgung über Kabelverbindungen</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-elevated text-text-muted border border-border-default">
                      In Vorbereitung
                    </span>
                    {isPacketFlowActive && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                </button>
              )}

              {onToggleSimulationHUD && isToolSupportedForSubject("simulation-hud", currentSubject) && (() => {
                const hudStatus = getToolEngineStatus("simulation-hud", canvasEngine);
                return (
                  <button
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      handleEngineGatedAction("simulation-hud", onToggleSimulationHUD);
                    }}
                    className={cn(
                      "w-full flex items-start justify-between px-3 py-2 text-left hover:bg-surface-elevated transition-colors",
                      !hudStatus.isAvailable && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Pulse size={16} className={cn("shrink-0 mt-0.5", isSimulationHUDActive ? "text-teal-400" : "text-text-muted")} />
                      <div>
                        <div className="text-xs font-medium text-text-primary">Topologie-Simulation (HUD)</div>
                        <div className="text-[10px] text-text-muted">Play/Pause, Step & Pakete senden</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
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
          )}

          {/* Menü: WERKZEUGE */}
          {openMenu === "tools" && (
            <div
              id="nav-menu-tools"
              role="menu"
              aria-labelledby="nav-btn-tools"
              style={{ top: menuPos.top, right: menuPos.right }}
              className="fixed z-dropdown w-[340px] sm:w-[480px] max-h-[85vh] overflow-y-auto rounded-xl border border-border-default bg-surface shadow-2xl py-2 text-text-primary animate-in fade-in-0 zoom-in-95 duration-100"
            >
              <div role="presentation" className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-3 px-2">
                {/* Spalte 1: Subnetting & Rechner */}
                <div role="presentation">
                  <div role="presentation" className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Subnetting & Rechner
                  </div>
                  <div role="presentation" className="space-y-0.5">
                    {isToolSupportedForSubject("subnetting-drill", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("subnetting-drill"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <Timer size={14} className="text-amber-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Subnetting-Drill</span>
                          <span className="block text-[10px] text-text-muted truncate">Gegen die Uhr rechnen</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("subnetting-quiz", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("subnetting-quiz"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <Question size={14} className="text-sky-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Subnetting-Quiz</span>
                          <span className="block text-[10px] text-text-muted truncate">Usable Range & Subnetze</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("subnetting-cheatsheet", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("subnetting-cheatsheet"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <FileText size={14} className="text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Subnetting-Übersicht & Rechner</span>
                          <span className="block text-[10px] text-text-muted truncate">VLSM, Blockgrößen & Rechner</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("ipv4-subnet-table", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("ipv4-subnet-table"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <Table size={14} className="text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">IPv4-Subnetz-Tabelle</span>
                          <span className="block text-[10px] text-text-muted truncate">CIDR, Masken, Binär-Tabelle</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("ipv6-calculator", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("ipv6-calculator"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <Calculator size={14} className="text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">IPv6-Präfix- & EUI-64-Rechner</span>
                          <span className="block text-[10px] text-text-muted truncate">Adressen kürzen, EUI-64</span>
                        </div>
                      </button>
                    )}
                  </div>

                  <div role="presentation" className="mt-3 px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Drills & Labs
                  </div>
                  <div role="presentation" className="space-y-0.5">
                    {isToolSupportedForSubject("routing-drill", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("routing-drill"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <Compass size={14} className="text-amber-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Routing-Trainer (ip route)</span>
                          <span className="block text-[10px] text-text-muted truncate">ip route & Longest-Match</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("ospf-wildcard-drill", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("ospf-wildcard-drill"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <TreeStructure size={14} className="text-violet-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">OSPF- und Wildcard-Trainer</span>
                          <span className="block text-[10px] text-text-muted truncate">Wildcards & DR/BDR</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("acl-drill", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("acl-drill"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <ShieldCheck size={14} className="text-rose-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Access-List-Trainer (ACL)</span>
                          <span className="block text-[10px] text-text-muted truncate">Access Control Lists üben</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Spalte 2: Cisco IOS, Cloud & Canvas */}
                <div role="presentation">
                  <div role="presentation" className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Praxis & Terminal
                  </div>
                  <div role="presentation" className="space-y-0.5">
                    {isToolSupportedForSubject("cli-glossary", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("cli-glossary"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <BookOpen size={14} className="text-teal-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Cisco-IOS-Befehlsreferenz</span>
                          <span className="block text-[10px] text-text-muted truncate">Befehlssyntax & Modi</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("terminal", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onOpenTerminal(); }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Terminal size={14} className="text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <span className="font-medium">Cisco-IOS-Terminal</span>
                            <span className="block text-[10px] text-text-muted truncate">
                              {hasSelectedShape ? "Selektiertes Gerät bereit" : "Konsole für aktives Gerät"}
                            </span>
                          </div>
                        </div>
                        {hasSelectedShape && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Gerät selektiert" />
                        )}
                      </button>
                    )}
                    {isToolSupportedForSubject("labs", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onOpenLabs(); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <GraduationCap size={14} className="text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Geführte Praxis-Labs</span>
                          <span className="block text-[10px] text-text-muted truncate">Schritt-für-Schritt IOS-Labs</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("verkabelung-trainer", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("verkabelung-trainer"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <Plugs size={14} className="text-yellow-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Verkabelungs-Trainer</span>
                          <span className="block text-[10px] text-text-muted truncate">Kabeltypen & Medien</span>
                        </div>
                      </button>
                    )}
                    {isToolSupportedForSubject("cost-calculator", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onToggleCostCalculator(); }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CurrencyDollar size={14} className="text-amber-400 shrink-0" />
                          <span className="font-medium truncate">Cloud-Kosten-Rechner</span>
                        </div>
                        {isCostCalculatorActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </button>
                    )}
                  </div>

                  <div role="presentation" className="mt-3 px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Canvas & Zusammenarbeit
                  </div>
                  <div role="presentation" className="space-y-0.5">
                    {(() => {
                      const addDevStatus = getToolEngineStatus("add-device", canvasEngine);
                      return (
                        <button
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            handleEngineGatedAction("add-device", onAddDevice);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors",
                            !addDevStatus.isAvailable && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Plus size={14} className="text-sky-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-medium">Gerät hinzufügen</span>
                              <span className="block text-[10px] text-text-muted truncate">Router, Switch, PC, Server</span>
                            </div>
                          </div>
                          {addDevStatus.requiresV1 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal shrink-0">
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
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            handleEngineGatedAction("topology-validator", onOpenTopologyValidator);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors",
                            !valStatus.isAvailable && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Stethoscope size={14} className="text-blue-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-medium">Topologie-Diagnose</span>
                              <span className="block text-[10px] text-text-muted truncate">Integrität & Fehlerdiagnose</span>
                            </div>
                          </div>
                          {valStatus.requiresV1 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal shrink-0">
                              Nur v1
                            </span>
                          )}
                        </button>
                      );
                    })()}

                    {isToolSupportedForSubject("topologie-explorer", currentSubject) && (
                      <button
                        role="menuitem"
                        onClick={() => { closeMenu(); onSelectTool("topologie-explorer"); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors"
                      >
                        <Network size={14} className="text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Topologie-Explorer</span>
                          <span className="block text-[10px] text-text-muted truncate">Referenz-Netzwerke</span>
                        </div>
                      </button>
                    )}

                    {(() => {
                      const metStatus = getToolEngineStatus("metrics", canvasEngine);
                      return (
                        <button
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            handleEngineGatedAction("metrics", onToggleMetrics);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors",
                            !metStatus.isAvailable && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ChartLine size={14} className="text-teal-400 shrink-0" />
                            <span className="font-medium truncate">Live-Metriken</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
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
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            handleEngineGatedAction("annotations", onToggleAnnotations);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors",
                            !notStatus.isAvailable && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Notepad size={14} className="text-pink-400 shrink-0" />
                            <span className="font-medium truncate">Topologie-Notizen</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
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
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            handleEngineGatedAction("templates", onOpenTemplates);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors",
                            !tplStatus.isAvailable && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FolderOpen size={14} className="text-purple-400 shrink-0" />
                            <span className="font-medium truncate">Topologie-Vorlagen</span>
                          </div>
                          {tplStatus.requiresV1 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal shrink-0">
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
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            handleEngineGatedAction("share-export", onOpenShareExport);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated text-left transition-colors",
                            !expStatus.isAvailable && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Export size={14} className="text-cyan-400 shrink-0" />
                            <span className="font-medium truncate">Teilen und Exportieren</span>
                          </div>
                          {expStatus.requiresV1 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-default font-normal shrink-0">
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
          )}
        </nav>,
        document.body
      )}
    </header>
  );
};
