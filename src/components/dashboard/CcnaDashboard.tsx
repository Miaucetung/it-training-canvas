import { shouldIgnoreSingleKeyShortcut } from "@/lib/keyboard-shortcuts";
import React, { Suspense, lazy, useState, useEffect, useMemo, useCallback } from "react";
import { loadModule } from "@/lib/content/content-loader";
import type { CertificationModule, Topic } from "@/lib/content/types";
import type { Quiz, ScoreResult, ToolId, UserProgress } from "@/lib/types";
import { TopologyHero } from "./TopologyHero";
import { BlueprintDomainsGrid } from "./BlueprintDomainsGrid";
import { TodayPracticeSection } from "./TodayPracticeSection";
import { SimulatorCards } from "./SimulatorCards";
import { RecentActivitySection, RecentActivityItem } from "./RecentActivitySection";
import { CommandPalette } from "./CommandPalette";
import { DashboardFooter } from "./DashboardFooter";
import { LearningPathSection } from "./LearningPathSection";
import { IntroCard, isIntroDismissed } from "./IntroCard";
import { NextStepCard, type NextStepLookups } from "./NextStepCard";
import { MagnifyingGlass, Presentation, Question, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { recordQuizResult, useLearningProgress } from "@/lib/learning-progress";
import { LEARNING_STEPS } from "@/lib/learning-path-config";
import { computeNextAction } from "@/lib/learning-path-logic";
import { useCompletedLabs } from "@/lib/completed-labs";
import { useLabInfos } from "@/lib/lab-infos";

const QuizDialog = lazy(() => import("@/components/QuizDialog").then((m) => ({ default: m.QuizDialog })));

interface CcnaDashboardProps {
  moduleId?: string;
  theme: "light" | "dark";
  userProgress?: Record<string, UserProgress>;
  onTopicClick?: (topic: Topic, module: CertificationModule, anchor?: string) => void;
  onLaunchTool?: (toolId: string) => void;
  onToggleCanvasView?: () => void;
  onOpenExamPrep?: () => void;
  onOpenPrioritizedLearning?: () => void;
  onOpenLabs?: () => void;
  /** Lab direkt öffnen (Lab-Dialog mit diesem Lab) */
  onOpenLab?: (labId: string) => void;
}

const STORAGE_KEY_RECENT = "ccna-recent-history";

export function CcnaDashboard({
  moduleId = "ccna",
  theme: _theme,
  userProgress = {},
  onTopicClick,
  onLaunchTool,
  onToggleCanvasView,
  onOpenExamPrep,
  onOpenPrioritizedLearning,
  onOpenLabs,
  onOpenLab,
}: CcnaDashboardProps) {
  const [module, setModule] = useState<CertificationModule | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [introOpen, setIntroOpen] = useState<boolean>(() => !isIntroDismissed());
  const labInfos = useLabInfos();
  const completedLabs = useCompletedLabs();
  // Load CCNA module topics
  useEffect(() => {
    let isMounted = true;
    loadModule(moduleId)
      .then((mod) => {
        if (isMounted) {
          setModule(mod);
        }
      })
      .catch((err) => {
        console.error("Failed to load CCNA module:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [moduleId]);

  // Fortschritt: gelesene Lektionen aus dem Lernfortschritt (inkl. Altdaten des Lernpfads)
  const { progress: learningProgress } = useLearningProgress({
    completedStepIds: userProgress["ccna-full-path"]?.completedSteps,
  });
  const completedTopicIds = useMemo(() => Array.from(learningProgress.readTopicIds), [learningProgress]);

  // Read recent activity history from local storage
  const [recentItems, setRecentItems] = useState<RecentActivityItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }

    return [];
  });

  const recordRecentActivity = useCallback((item: RecentActivityItem) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  // Selection handlers
  const handleSelectTopicById = useCallback(
    (topicId: string, anchor?: string) => {
      if (!module) return;
      const found = module.topics.find((t) => t.id === topicId);
      if (found && onTopicClick) {
        recordRecentActivity({
          id: found.id,
          type: "topic",
          title: found.title,
          timestamp: Date.now(),
        });
        onTopicClick(found, module, anchor);
      }
    },
    [module, onTopicClick, recordRecentActivity]
  );

  const handleOpenSimulator = useCallback(
    (simId: "vlan" | "stp" | "routing" | "osi") => {
      const toolMap: Record<string, string> = {
        vlan: "vlan-simulator",
        stp: "stp-simulator",
        routing: "routing-simulator",
        osi: "osi-simulator",
      };
      const toolName = toolMap[simId];
      if (toolName && onLaunchTool) {
        onLaunchTool(toolName);
      }
    },
    [onLaunchTool]
  );

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Presentation Mode 'P')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (!shouldIgnoreSingleKeyShortcut(e) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setIsPresentationMode((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isPresentationMode) setIsPresentationMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationMode]);

  // Nächster Schritt und Nachschlage-Funktionen (nur echte Daten, sonst IDs)
  const nextAction = useMemo(() => computeNextAction(LEARNING_STEPS, learningProgress, completedLabs), [learningProgress, completedLabs]);
  const lookups: NextStepLookups = useMemo(
    () => ({
      topicTitle: (id) => module?.topics.find((t) => t.id === id)?.title ?? id,
      topicMinutes: (id) => module?.topics.find((t) => t.id === id)?.estimatedMinutes,
      quizTitle: (id) => module?.quizzes?.[id]?.title ?? id,
      quizQuestionCount: (id) => module?.quizzes?.[id]?.questions?.length,
      labTitle: (id) => labInfos[id]?.title ?? id,
    }),
    [module, labInfos],
  );
  const startQuiz = useCallback(
    (quizId: string) => {
      const quiz = module?.quizzes?.[quizId];
      if (quiz) setActiveQuiz(quiz);
    },
    [module],
  );
  const openLab = useCallback((labId: string) => (onOpenLab ? onOpenLab(labId) : onOpenLabs?.()), [onOpenLab, onOpenLabs]);
  const nextStepId = nextAction.kind === "done" ? undefined : nextAction.evaluation.step.id;

  // Last active topic calculation
  const totalTopicCount = module?.topics.length ?? 0;
  const lastActiveItem = recentItems[0];
  const hasProgress = completedTopicIds.length > 0 || recentItems.length > 0;

  return (
    <main
      className={cn(
        "min-h-full bg-app-bg text-foreground transition-all duration-300",
        isPresentationMode && "presentation-mode text-base sm:text-lg"
      )}
    >
      {/* Presentation Mode Banner */}
      {isPresentationMode && (
        <div className="sticky top-0 z-40 bg-amber-500 text-slate-950 font-semibold px-4 py-2 flex items-center justify-between text-xs sm:text-sm shadow-md">
          <div className="flex items-center gap-2">
            <Presentation className="h-4 w-4" weight="bold" />
            <span>Dozenten-Präsentationsmodus aktiv — optimiert für Beamer (+20 % Schriftgröße)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPresentationMode(false)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-950 text-white text-xs font-mono hover:bg-slate-800 transition-colors"
          >
            <span>Beenden (Esc / P)</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Kopf: Titel, Suche und Präsentationsmodus */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">CCNA 200-301 Lernplattform</h1>
            <p className="text-sm text-muted-foreground mt-1">Lernen in der richtigen Reihenfolge: verstehen, üben, anwenden.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIntroOpen((v) => !v)}
              aria-expanded={introOpen}
              aria-label="Hilfe: So funktioniert die App"
              title="Hilfe: So funktioniert die App"
              className="inline-flex items-center justify-center h-7 w-7 rounded border border-border bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground transition-colors"
            >
              <Question className="h-4 w-4" weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground transition-colors font-mono text-[11px]"
              title="Befehlspalette öffnen (Strg+K)"
            >
              <MagnifyingGlass className="h-3.5 w-3.5" />
              <span>Strg+K</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPresentationMode((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors text-[11px] font-medium",
                isPresentationMode
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold"
                  : "border-border bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground"
              )}
              title="Dozenten-Präsentationsmodus umschalten (P)"
            >
              <Presentation className="h-3.5 w-3.5" />
              <span>{isPresentationMode ? "Präsentation an" : "Beamer (P)"}</span>
            </button>
          </div>
        </header>

        <IntroCard open={introOpen} onClose={() => setIntroOpen(false)} />

        {/* A. Nächster Schritt */}
        <NextStepCard
          action={nextAction}
          lookups={lookups}
          onOpenLesson={handleSelectTopicById}
          onStartQuiz={startQuiz}
          onOpenLab={openLab}
          onOpenExamPrep={onOpenExamPrep}
        />

        {/* B. Lernpfad mit Verstehen → Üben → Anwenden */}
        <LearningPathSection
          steps={LEARNING_STEPS}
          progress={learningProgress}
          completedLabs={completedLabs}
          labs={labInfos}
          lookups={lookups}
          initialOpenStepId={nextStepId}
          onOpenLesson={handleSelectTopicById}
          onStartQuiz={startQuiz}
          onOpenLab={openLab}
          onLaunchTool={(toolId: ToolId) => onLaunchTool?.(toolId)}
        />

        {/* C. Prüfungsbereiche (zweite Sicht) */}
        <BlueprintDomainsGrid
          completedTopicIds={completedTopicIds}
          onSelectTopic={handleSelectTopicById}
        />

        {/* D. Werkzeuge und Referenzen */}
        <div className="space-y-6 pt-2 border-t border-border/60">
          <div>
            <h2 className="text-lg font-bold text-foreground font-sans">Werkzeuge und Referenzen</h2>
            <p className="text-xs text-muted-foreground">Zum Nachschlagen und Ausprobieren, jederzeit auch über die Kopfzeile erreichbar.</p>
          </div>
        <TopologyHero
          compact
          onSelectTopic={handleSelectTopicById}
          onOpenSimulator={handleOpenSimulator}
          onOpenCanvasV2={() => onToggleCanvasView?.()}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isPresentationMode={isPresentationMode}
          onTogglePresentationMode={() => setIsPresentationMode((prev) => !prev)}
          hasProgress={hasProgress}
          lastActiveTopicTitle={lastActiveItem?.title}
          lastActiveTopicId={lastActiveItem?.id || module?.topics[0]?.id}
          completedTopicCount={completedTopicIds.length}
          totalTopicCount={totalTopicCount}
        />

        <TodayPracticeSection
          onOpenWeaknessDrill={() => onOpenPrioritizedLearning?.()}
          onOpenDragDropTrainer={() => onLaunchTool?.("dragdrop-trainer")}
          onOpenSubnetDrill={() => onLaunchTool?.("subnetting-drill")}
          onOpenLabs={onOpenLabs}
        />

        {/* Simulatoren */}
        <SimulatorCards
          onOpenSimulator={handleOpenSimulator}
          onOpenCanvasV2={() => onToggleCanvasView?.()}
        />
        </div>

        {/* E. Zuletzt bearbeitet */}
        <RecentActivitySection
          recentItems={recentItems}
          onSelectItem={(item) => handleSelectTopicById(item.id)}
          onStartFirstTopic={() => handleSelectTopicById("networking-fundamentals")}
        />

        {/* 6. Footer mit rechtlichem Disclaimer */}
        <DashboardFooter />
      </div>

      {activeQuiz && (
        <Suspense fallback={null}>
          <QuizDialog
            quiz={activeQuiz}
            theme={_theme}
            onComplete={(result: ScoreResult) => {
              recordQuizResult(activeQuiz.id, result.percentage);
              setActiveQuiz(null);
            }}
            onClose={() => setActiveQuiz(null)}
          />
        </Suspense>
      )}

      {/* Global Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTopic={handleSelectTopicById}
        onOpenSimulator={handleOpenSimulator}
        onOpenCanvasV2={() => onToggleCanvasView?.()}
        onOpenWeaknessDrill={() => onOpenPrioritizedLearning?.()}
        onOpenDragDropTrainer={() => onLaunchTool?.("dragdrop-trainer")}
        onOpenSubnetDrill={() => onLaunchTool?.("subnetting-drill")}
        onOpenExamPrep={() => onOpenExamPrep?.()}
      />
    </main>
  );
}
