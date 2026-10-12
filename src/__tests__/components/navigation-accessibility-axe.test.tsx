// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, within, cleanup, act, fireEvent } from "@testing-library/react";
import React from "react";
import axe from "axe-core";
import { AppHeader } from "@/components/navigation/AppHeader";
import { MobileNavDrawer } from "@/components/navigation/MobileNavDrawer";
import { AppBreadcrumbs } from "@/components/navigation/AppBreadcrumbs";
import { TopicDetailPanel } from "@/components/TopicDetailPanel";
import type { CertificationModule, Topic } from "@/lib/content/types";

describe("Punkt 8: Automatisierte Barrierefreiheitsprüfung mit axe-core", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const defaultHeaderProps = {
    currentSubject: "CCNA",
    subjects: ["CCNA", "FISI", "Azure"],
    onSelectSubject: vi.fn(),
    canvasView: false,
    onToggleCanvasView: vi.fn(),
    canvasEngine: "v2" as const,
    theme: "dark" as const,
    themePreference: "dark" as const,
    onSelectTheme: vi.fn(),
    onCycleTheme: vi.fn(),
    user: null,
    onLogin: vi.fn(),
    onAccount: vi.fn(),
    onOpenKeyboardShortcuts: vi.fn(),
    onOpenMobileMenu: vi.fn(),
    onNavigateOverview: vi.fn(),
    learningPaths: {},
    userProgress: {},
    onStartLearningPath: vi.fn(),
    onNewLearningPath: vi.fn(),
    onOpenExamPrep: vi.fn(),
    onOpenPrioritizedLearning: vi.fn(),
    onSelectTool: vi.fn(),
    activeTool: null,
    onOpenPing: vi.fn(),
    isPacketFlowActive: false,
    onTogglePacketFlow: vi.fn(),
    hasSelectedShape: false,
    onOpenTerminal: vi.fn(),
    onOpenLabs: vi.fn(),
    onAddDevice: vi.fn(),
    onOpenTopologyValidator: vi.fn(),
    isMetricsActive: false,
    onToggleMetrics: vi.fn(),
    isAnnotationsActive: false,
    onToggleAnnotations: vi.fn(),
    onOpenTemplates: vi.fn(),
    onOpenShareExport: vi.fn(),
    isCostCalculatorActive: false,
    onToggleCostCalculator: vi.fn(),
  };

  const sampleTopic: Topic = {
    id: "net-fundamentals-1",
    title: "Netzwerk-Grundlagen & Topologien",
    description: "Einführung in LAN, WAN und das TCP/IP-Modell",
    conceptIds: [],
    quizIds: [],
    exerciseIds: [],
    estimatedMinutes: 20,
    tags: ["network", "ccna"],
  };

  const sampleModule: CertificationModule = {
    id: "ccna-mod-1",
    vendor: "cisco",
    title: "Netzwerkgrundlagen",
    subtitle: "CCNA 200-301",
    description: "Modul 1",
    difficulty: "beginner",
    examCode: "200-301",
    estimatedHours: 10,
    prerequisites: [],
    topics: [sampleTopic],
    concepts: {},
    quizzes: {},
    exercises: {},
    learningPaths: {},
    metadata: {
      slug: "ccna",
      tagline: "CCNA",
      objectives: [],
      targetAudience: [],
      priceCents: 0,
      lastUpdated: "2026-04-28",
      categories: ["networking"],
      previewImageUrl: "",
      certificationBody: "Cisco",
      featured: true,
    },
  };

  async function checkA11y(node: HTMLElement) {
    const results = await axe.run(node, {
      rules: {
        // In jsdom gibt es keine gerenderte Layout-Engine für echte Pixelkontrastberechnung
        "color-contrast": { enabled: false },
      },
    });
    return results.violations;
  }

  describe("1. Menü geöffnet (Desktop)", () => {
    it("geöffnetes Dropdown-Menü in Dark Mode erfüllt axe-core ohne Violations", async () => {
      document.documentElement.className = "dark";
      const { container } = render(<AppHeader {...defaultHeaderProps} theme="dark" />);

      const nav = within(container).getByRole("navigation", { name: "Hauptnavigation" });
      const learnBtn = within(nav).getByRole("button", { name: /Lernen/i });
      act(() => {
        fireEvent.click(learnBtn);
      });

      const violations = await checkA11y(document.body);
      expect(violations).toEqual([]);
    });

    it("geöffnetes Dropdown-Menü in Light Mode erfüllt axe-core ohne Violations", async () => {
      document.documentElement.className = "light";
      const { container } = render(<AppHeader {...defaultHeaderProps} theme="light" />);

      const nav = within(container).getByRole("navigation", { name: "Hauptnavigation" });
      const simBtn = within(nav).getByRole("button", { name: /Simulatoren/i });
      act(() => {
        fireEvent.click(simBtn);
      });

      const violations = await checkA11y(document.body);
      expect(violations).toEqual([]);
    });
  });

  describe("2. Drawer geöffnet (Mobile)", () => {
    it("geöffneter MobileNavDrawer in Dark Mode erfüllt axe-core ohne Violations", async () => {
      document.documentElement.className = "dark";
      render(
        <MobileNavDrawer
          open={true}
          onClose={vi.fn()}
          currentSubject="CCNA"
          subjects={["CCNA", "FISI", "Azure"]}
          onSelectSubject={vi.fn()}
          canvasView={false}
          onToggleCanvasView={vi.fn()}
          canvasEngine="v2"
          onNavigateOverview={vi.fn()}
          onAccount={vi.fn()}
          learningPaths={{}}
          userProgress={{}}
          onStartLearningPath={vi.fn()}
          onNewLearningPath={vi.fn()}
          onOpenExamPrep={vi.fn()}
          onOpenPrioritizedLearning={vi.fn()}
          onSelectTool={vi.fn()}
          onOpenPing={vi.fn()}
          isPacketFlowActive={false}
          onTogglePacketFlow={vi.fn()}
          onOpenTerminal={vi.fn()}
          onOpenLabs={vi.fn()}
          onAddDevice={vi.fn()}
          onOpenTopologyValidator={vi.fn()}
          isMetricsActive={false}
          onToggleMetrics={vi.fn()}
          isAnnotationsActive={false}
          onToggleAnnotations={vi.fn()}
          onOpenTemplates={vi.fn()}
          onOpenShareExport={vi.fn()}
        />
      );

      const violations = await checkA11y(document.body);
      expect(violations).toEqual([]);
    });

    it("geöffneter MobileNavDrawer in Light Mode erfüllt axe-core ohne Violations", async () => {
      document.documentElement.className = "light";
      render(
        <MobileNavDrawer
          open={true}
          onClose={vi.fn()}
          currentSubject="CCNA"
          subjects={["CCNA", "FISI", "Azure"]}
          onSelectSubject={vi.fn()}
          canvasView={false}
          onToggleCanvasView={vi.fn()}
          canvasEngine="v2"
          onNavigateOverview={vi.fn()}
          onAccount={vi.fn()}
          learningPaths={{}}
          userProgress={{}}
          onStartLearningPath={vi.fn()}
          onNewLearningPath={vi.fn()}
          onOpenExamPrep={vi.fn()}
          onOpenPrioritizedLearning={vi.fn()}
          onSelectTool={vi.fn()}
          onOpenPing={vi.fn()}
          isPacketFlowActive={false}
          onTogglePacketFlow={vi.fn()}
          onOpenTerminal={vi.fn()}
          onOpenLabs={vi.fn()}
          onAddDevice={vi.fn()}
          onOpenTopologyValidator={vi.fn()}
          isMetricsActive={false}
          onToggleMetrics={vi.fn()}
          isAnnotationsActive={false}
          onToggleAnnotations={vi.fn()}
          onOpenTemplates={vi.fn()}
          onOpenShareExport={vi.fn()}
        />
      );

      const violations = await checkA11y(document.body);
      expect(violations).toEqual([]);
    });
  });

  describe("3. Lektionsansicht (Dark und Light)", () => {
    it("Lektionsansicht mit Header, Breadcrumbs & Detail-Panel in Dark Mode erfüllt axe-core", async () => {
      document.documentElement.className = "dark";
      const { container } = render(
        <main className="bg-app-bg text-text-primary">
          <AppHeader {...defaultHeaderProps} theme="dark" />
          <AppBreadcrumbs
            currentSubject="CCNA"
            canvasView={false}
            canvasEngine="v2"
            selectedTopic={sampleTopic}
            onNavigateHome={vi.fn()}
          />
          <TopicDetailPanel
            topic={sampleTopic}
            module={sampleModule}
            onClose={vi.fn()}
            theme="dark"
          />
        </main>
      );

      const violations = await checkA11y(container);
      expect(violations).toEqual([]);
    });

    it("Lektionsansicht mit Header, Breadcrumbs & Detail-Panel in Light Mode erfüllt axe-core", async () => {
      document.documentElement.className = "light";
      const { container } = render(
        <main className="bg-app-bg text-text-primary">
          <AppHeader {...defaultHeaderProps} theme="light" />
          <AppBreadcrumbs
            currentSubject="CCNA"
            canvasView={false}
            canvasEngine="v2"
            selectedTopic={sampleTopic}
            onNavigateHome={vi.fn()}
          />
          <TopicDetailPanel
            topic={sampleTopic}
            module={sampleModule}
            onClose={vi.fn()}
            theme="light"
          />
        </main>
      );

      const violations = await checkA11y(container);
      expect(violations).toEqual([]);
    });
  });
});
