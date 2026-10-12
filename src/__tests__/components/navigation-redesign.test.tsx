// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AppBreadcrumbs } from "@/components/navigation/AppBreadcrumbs";
import { AppHeader } from "@/components/navigation/AppHeader";
import { MobileNavDrawer } from "@/components/navigation/MobileNavDrawer";
import type { Topic } from "@/lib/content/types";

describe("Phase R3 Schritt 1: Navigation & Layout-Gerüst", () => {
  describe("AppBreadcrumbs Komponente", () => {
    it("rendert Fach als Root-Element und reagiert auf Klick im Untermodus", () => {
      const handleHome = vi.fn();
      render(
        <AppBreadcrumbs
          currentSubject="CCNA"
          canvasView={true}
          selectedTopic={null}
          onNavigateHome={handleHome}
        />
      );

      const subjectBtn = screen.getByText("CCNA 200-301");
      expect(subjectBtn).toBeDefined();

      fireEvent.click(subjectBtn);
      expect(handleHome).toHaveBeenCalledTimes(1);
    });

    it("rendert Lektionstitel, wenn ein Thema gewählt ist", () => {
      const dummyTopic: Topic = {
        id: "ospf-basics",
        title: "OSPF LSA-Typen & Konvergenz",
        description: "Grundlagen OSPF",
        conceptIds: [],
        quizIds: [],
        exerciseIds: [],
        estimatedMinutes: 30,
        tags: ["ospf"],
      };

      render(
        <AppBreadcrumbs
          currentSubject="CCNA"
          canvasView={false}
          selectedTopic={dummyTopic}
          onNavigateHome={vi.fn()}
        />
      );

      expect(screen.getByText("OSPF LSA-Typen & Konvergenz")).toBeDefined();
    });

    it("zeigt 'Topologie-Canvas (v2)' im Canvas-Modus", () => {
      render(
        <AppBreadcrumbs
          currentSubject="CCNA"
          canvasView={true}
          selectedTopic={null}
          onNavigateHome={vi.fn()}
        />
      );

      expect(screen.getByText("Topologie-Canvas (v2)")).toBeDefined();
    });
  });

  describe("AppHeader Komponente", () => {
    function makeHeaderProps() {
      return {
        currentSubject: "CCNA",
        subjects: ["CCNA", "AZ-900"],
        onSelectSubject: vi.fn(),
        canvasView: false,
        onToggleCanvasView: vi.fn(),
        theme: "dark" as const,
        themePreference: "system" as const,
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
    }

    it("rendert alle 4 Hauptgruppen-Buttons und den Canvas 3D-Flip Button", () => {
      const props = makeHeaderProps();
      render(<AppHeader {...props} />);

      const nav = screen.getByRole("navigation", { name: "Hauptnavigation" });
      expect(within(nav).getByRole("button", { name: /Lernen/i })).toBeDefined();
      expect(within(nav).getByRole("button", { name: /Üben & Prüfen/i })).toBeDefined();
      expect(within(nav).getByRole("button", { name: /Simulatoren/i })).toBeDefined();
      expect(within(nav).getByRole("button", { name: /Werkzeuge/i })).toBeDefined();

      const flipBtn = screen.getByRole("button", { name: /Canvas/i });
      expect(flipBtn).toBeDefined();
      fireEvent.click(flipBtn);
      expect(props.onToggleCanvasView).toHaveBeenCalledTimes(1);
    });

    it("öffnet das Simulatoren-Menü und führt Aktionen aus", () => {
      const props = makeHeaderProps();
      render(<AppHeader {...props} />);

      const nav = screen.getByRole("navigation", { name: "Hauptnavigation" });
      const simBtn = within(nav).getByRole("button", { name: /Simulatoren/i });
      fireEvent.click(simBtn);

      const vlanItem = screen.getByText(/VLAN- und Trunk-Simulator/i);
      expect(vlanItem).toBeDefined();
      fireEvent.click(vlanItem);
      expect(props.onSelectTool).toHaveBeenCalledWith("vlan-simulator");
    });
  });

  describe("MobileNavDrawer Komponente", () => {
    function makeDrawerProps(open = true) {
      return {
        open,
        onClose: vi.fn(),
        currentSubject: "CCNA",
        subjects: ["CCNA", "AZ-900"],
        onSelectSubject: vi.fn(),
        canvasView: false,
        onToggleCanvasView: vi.fn(),
        onNavigateOverview: vi.fn(),
        onAccount: vi.fn(),
        learningPaths: {},
        userProgress: {},
        onStartLearningPath: vi.fn(),
        onNewLearningPath: vi.fn(),
        onOpenExamPrep: vi.fn(),
        onOpenPrioritizedLearning: vi.fn(),
        onSelectTool: vi.fn(),
        onOpenPing: vi.fn(),
        isPacketFlowActive: false,
        onTogglePacketFlow: vi.fn(),
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
      };
    }

    it("rendert nicht wenn open=false", () => {
      const props = makeDrawerProps(false);
      const { container } = render(<MobileNavDrawer {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it("rendert permanentes CCNA 200-301 Branding und schließt bei Klick auf Schließen", () => {
      const props = makeDrawerProps(true);
      render(<MobileNavDrawer {...props} />);

      expect(screen.getByText("CCNA 200-301")).toBeDefined();
      expect(screen.getByText("Lern- & Trainingsplattform")).toBeDefined();
      expect(screen.queryByText("Fach / Lehrgang")).toBeNull();

      const closeBtn = screen.getByRole("button", { name: "Menü schließen" });
      fireEvent.click(closeBtn);
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
