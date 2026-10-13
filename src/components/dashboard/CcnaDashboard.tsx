import React, { useState, useEffect, useMemo, useCallback } from "react";
import { loadModule } from "@/lib/content/content-loader";
import type { CertificationModule, Topic } from "@/lib/content/types";
import type { UserProgress } from "@/lib/types";
import { TopologyHero } from "./TopologyHero";
import { BlueprintDomainsGrid } from "./BlueprintDomainsGrid";
import { TodayPracticeSection } from "./TodayPracticeSection";
import { SimulatorCards } from "./SimulatorCards";
import { RecentActivitySection, RecentActivityItem } from "./RecentActivitySection";
import { CommandPalette } from "./CommandPalette";
import { DashboardFooter } from "./DashboardFooter";
import { Presentation, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CcnaDashboardProps {
  moduleId?: string;
  theme: "light" | "dark";
  userProgress?: Record<string, UserProgress>;
  onTopicClick?: (topic: Topic, module: CertificationModule) => void;
  onLaunchTool?: (toolId: string) => void;
  onToggleCanvasView?: () => void;
  onOpenExamPrep?: () => void;
  onOpenPrioritizedLearning?: () => void;
  onOpenLabs?: () => void;
}

const STORAGE_KEY_RECENT = "ccna-recent-history";
const STORAGE_KEY_COMPLETED = "ccna-completed-topics";

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
}: CcnaDashboardProps) {
  const [module, setModule] = useState<CertificationModule | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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

  // Read completed topics from UserProgress and local storage
  const completedTopicIds = useMemo(() => {
    const list = new Set<string>();

    // From userProgress (learning path completed steps)
    const fullPathProgress = userProgress["ccna-full-path"];
    if (fullPathProgress?.completedSteps) {
      fullPathProgress.completedSteps.forEach((s) => list.add(s));
    }

    // From dedicated completed topics storage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => list.add(id));
        }
      }
    } catch {
      // Ignore storage errors
    }

    return Array.from(list);
  }, [userProgress]);

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
    (topicId: string) => {
      if (!module) return;
      const found = module.topics.find((t) => t.id === topicId);
      if (found && onTopicClick) {
        recordRecentActivity({
          id: found.id,
          type: "topic",
          title: found.title,
          timestamp: Date.now(),
        });
        onTopicClick(found, module);
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
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (!isInput && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setIsPresentationMode((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isPresentationMode) setIsPresentationMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationMode]);

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
        {/* 1. Hero with Interactive Topology */}
        <TopologyHero
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

        {/* 2. Blueprint Domains Grid (6 Domains with Weightings & Lesson Progress) */}
        <BlueprintDomainsGrid
          completedTopicIds={completedTopicIds}
          onSelectTopic={handleSelectTopicById}
        />

        {/* 3. Today Practice Section (Inline Subnet Calculator, Weakness Drill, D&D, Labs) */}
        <TodayPracticeSection
          onOpenWeaknessDrill={() => onOpenPrioritizedLearning?.()}
          onOpenDragDropTrainer={() => onLaunchTool?.("dragdrop-trainer")}
          onOpenSubnetDrill={() => onLaunchTool?.("subnetting-drill")}
          onOpenLabs={onOpenLabs}
        />

        {/* 4. Simulatoren Kacheln */}
        <SimulatorCards
          onOpenSimulator={handleOpenSimulator}
          onOpenCanvasV2={() => onToggleCanvasView?.()}
        />

        {/* 5. Zuletzt bearbeitet */}
        <RecentActivitySection
          recentItems={recentItems}
          onSelectItem={(item) => handleSelectTopicById(item.id)}
          onStartFirstTopic={() => handleSelectTopicById("networking-fundamentals")}
        />

        {/* 6. Footer mit rechtlichem Disclaimer */}
        <DashboardFooter />
      </div>

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
