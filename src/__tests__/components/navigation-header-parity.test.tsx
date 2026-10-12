// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import React from "react";
import type { LearningPath } from "@/lib/types";
import { AppHeader } from "@/components/navigation/AppHeader";
import { MobileNavDrawer } from "@/components/navigation/MobileNavDrawer";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Punkt 3: Vollständige Funktionsparität aller ehemaligen Header-Buttons vor R3", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  function createMockProps(overrides: Partial<React.ComponentProps<typeof AppHeader>> = {}) {
    return {
      currentSubject: "CCNA",
      subjects: ["CCNA", "FISI", "Azure"],
      onSelectSubject: vi.fn(),
      canvasView: false,
      onToggleCanvasView: vi.fn(),
      canvasEngine: "v1" as const,
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
      learningPaths: {
        lp1: {
          id: "lp1",
          title: "Netzwerkgrundlagen",
          subject: "CCNA",
          description: "Test",
          steps: [{ id: "s1", topicId: "t1" }],
          estimatedMinutes: 45,
          difficulty: "beginner" as const,
          createdAt: 0,
          updatedAt: 0,
          tags: [],
        },
      } as unknown as Record<string, LearningPath>,
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
      isSimulationHUDActive: false,
      onToggleSimulationHUD: vi.fn(),
      hasSelectedShape: true,
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
      ...overrides,
    };
  }

  const getMainNav = () => screen.getByRole("navigation", { name: "Hauptnavigation" });

  describe("1. Paritätsprüfung im Desktop-AppHeader (alle ehemaligen Header-Elemente)", () => {
    it("1. Lernpfade (ehemals 'Lernpfade'-Header-Button) ist unter 'Lernen' erreichbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const learnBtn = within(getMainNav()).getByRole("button", { name: /Lernen/i });
      fireEvent.click(learnBtn);

      const pathBtn = screen.getByText("Netzwerkgrundlagen");
      expect(pathBtn).toBeDefined();
      fireEvent.click(pathBtn);
      expect(props.onStartLearningPath).toHaveBeenCalledTimes(1);

      // Reopen menu for new path
      fireEvent.click(learnBtn);
      const newPathBtn = screen.getByText("+ Neuer Pfad");
      fireEvent.click(newPathBtn);
      expect(props.onNewLearningPath).toHaveBeenCalledTimes(1);
    });

    it("2. Themenübersicht ist unter 'Lernen' erreichbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const learnBtn = within(getMainNav()).getByRole("button", { name: /Lernen/i });
      fireEvent.click(learnBtn);

      const overviewBtn = screen.getByText("Themenübersicht & Module");
      fireEvent.click(overviewBtn);
      expect(props.onNavigateOverview).toHaveBeenCalledTimes(1);
    });

    it("3. Prüfungsfragen-Trainer & Schwächen-Drill sind unter 'Üben & Prüfen' erreichbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const practiceBtn = within(getMainNav()).getByRole("button", { name: /Üben & Prüfen/i });
      fireEvent.click(practiceBtn);

      const examPrepBtn = screen.getByText("Prüfungsfragen-Trainer");
      fireEvent.click(examPrepBtn);
      expect(props.onOpenExamPrep).toHaveBeenCalledTimes(1);

      fireEvent.click(practiceBtn);
      const prioBtn = screen.getByText("Priorisiertes Lernen (Blueprint)");
      fireEvent.click(prioBtn);
      expect(props.onOpenPrioritizedLearning).toHaveBeenCalledTimes(1);

      fireEvent.click(practiceBtn);
      const weakBtn = screen.getByText("Gezielter Schwächen-Drill");
      fireEvent.click(weakBtn);
      expect(props.onOpenExamPrep).toHaveBeenCalledTimes(2);
    });

    it("4. Drag-and-Drop-Trainer ist unter 'Üben & Prüfen' erreichbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const practiceBtn = within(getMainNav()).getByRole("button", { name: /Üben & Prüfen/i });
      fireEvent.click(practiceBtn);

      const dndBtn = screen.getByText("Drag-and-Drop-Trainer");
      fireEvent.click(dndBtn);
      expect(props.onSelectTool).toHaveBeenCalledWith("dragdrop-trainer");
    });

    it("5. Simulatoren (VLAN, STP, OSI, Routing, Ping, Paketfluss, HUD) sind unter 'Simulatoren' erreichbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const simBtn = within(getMainNav()).getByRole("button", { name: /Simulatoren/i });
      fireEvent.click(simBtn);

      fireEvent.click(screen.getByText("VLAN- und Trunk-Simulator"));
      expect(props.onSelectTool).toHaveBeenCalledWith("vlan-simulator");

      fireEvent.click(simBtn);
      fireEvent.click(screen.getByText("Spanning-Tree-Simulator (STP/RSTP)"));
      expect(props.onSelectTool).toHaveBeenCalledWith("stp-simulator");

      fireEvent.click(simBtn);
      fireEvent.click(screen.getByText("OSI- und TCP/IP-Simulator"));
      expect(props.onSelectTool).toHaveBeenCalledWith("osi-simulator");

      fireEvent.click(simBtn);
      fireEvent.click(screen.getByText("Routing- und OSPF-Simulator"));
      expect(props.onSelectTool).toHaveBeenCalledWith("routing-simulator");

      fireEvent.click(simBtn);
      fireEvent.click(screen.getByText("Geführter Ping-Test"));
      expect(props.onOpenPing).toHaveBeenCalledTimes(1);

      fireEvent.click(simBtn);
      fireEvent.click(screen.getByText("Paketfluss-Visualisierer (Canvas v2)"));
      expect(props.onTogglePacketFlow).toHaveBeenCalledTimes(1);

      fireEvent.click(simBtn);
      fireEvent.click(screen.getByText("Topologie-Simulation (HUD)"));
      expect(props.onToggleSimulationHUD).toHaveBeenCalledTimes(1);
    });

    it("6. Subnetting & Drills (Subnetting, IPv4, IPv6, OSPF, ACL, Routing) sind unter 'Werkzeuge' erreichbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const toolsBtn = within(getMainNav()).getByRole("button", { name: /Werkzeuge/i });
      fireEvent.click(toolsBtn);

      fireEvent.click(screen.getByText("Subnetting-Drill"));
      expect(props.onSelectTool).toHaveBeenCalledWith("subnetting-drill");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Subnetting-Quiz"));
      expect(props.onSelectTool).toHaveBeenCalledWith("subnetting-quiz");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Subnetting-Übersicht & Rechner"));
      expect(props.onSelectTool).toHaveBeenCalledWith("subnetting-cheatsheet");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("IPv4-Subnetz-Tabelle"));
      expect(props.onSelectTool).toHaveBeenCalledWith("ipv4-subnet-table");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("IPv6-Präfix- & EUI-64-Rechner"));
      expect(props.onSelectTool).toHaveBeenCalledWith("ipv6-calculator");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Routing-Trainer (ip route)"));
      expect(props.onSelectTool).toHaveBeenCalledWith("routing-drill");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("OSPF- und Wildcard-Trainer"));
      expect(props.onSelectTool).toHaveBeenCalledWith("ospf-wildcard-drill");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Access-List-Trainer (ACL)"));
      expect(props.onSelectTool).toHaveBeenCalledWith("acl-drill");
    });

    it("7. Cisco IOS Terminal, Labs, CLI-Glossar & Verkabelung sind unter 'Werkzeuge' erreichbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const toolsBtn = within(getMainNav()).getByRole("button", { name: /Werkzeuge/i });
      fireEvent.click(toolsBtn);

      fireEvent.click(screen.getByText("Cisco-IOS-Befehlsreferenz"));
      expect(props.onSelectTool).toHaveBeenCalledWith("cli-glossary");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Cisco-IOS-Terminal"));
      expect(props.onOpenTerminal).toHaveBeenCalledTimes(1);

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Geführte Praxis-Labs"));
      expect(props.onOpenLabs).toHaveBeenCalledTimes(1);

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Verkabelungs-Trainer"));
      expect(props.onSelectTool).toHaveBeenCalledWith("verkabelung-trainer");
    });

    it("8. Canvas-Werkzeuge (Gerät hinzufügen, Prüfen, Metriken, Notizen, Vorlagen, Teilen/Export) sind erreichbar", () => {
      const props = createMockProps({ canvasEngine: "v1" });
      render(<AppHeader {...props} />);

      const toolsBtn = within(getMainNav()).getByRole("button", { name: /Werkzeuge/i });
      fireEvent.click(toolsBtn);

      fireEvent.click(screen.getByText("Gerät hinzufügen"));
      expect(props.onAddDevice).toHaveBeenCalledTimes(1);

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Topologie-Diagnose"));
      expect(props.onOpenTopologyValidator).toHaveBeenCalledTimes(1);

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Topologie-Explorer"));
      expect(props.onSelectTool).toHaveBeenCalledWith("topologie-explorer");

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Live-Metriken"));
      expect(props.onToggleMetrics).toHaveBeenCalledTimes(1);

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Topologie-Notizen"));
      expect(props.onToggleAnnotations).toHaveBeenCalledTimes(1);

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Topologie-Vorlagen"));
      expect(props.onOpenTemplates).toHaveBeenCalledTimes(1);

      fireEvent.click(toolsBtn);
      fireEvent.click(screen.getByText("Teilen und Exportieren"));
      expect(props.onOpenShareExport).toHaveBeenCalledTimes(1);
    });

    it("9. Global Controls (Flip, Shortcuts, Theme) sind unverändert direkt im Header verfügbar", () => {
      const props = createMockProps();
      render(<AppHeader {...props} />);

      const flipBtn = screen.getByRole("button", { name: /Zum Canvas wechseln/i });
      fireEvent.click(flipBtn);
      expect(props.onToggleCanvasView).toHaveBeenCalledTimes(1);

      const helpBtn = screen.getByRole("button", { name: "Tastenkürzel und Hilfe anzeigen" });
      fireEvent.click(helpBtn);
      expect(props.onOpenKeyboardShortcuts).toHaveBeenCalledTimes(1);

      const themeLightBtn = screen.getByRole("button", { name: /Hell/i });
      fireEvent.click(themeLightBtn);
      expect(props.onSelectTheme).toHaveBeenCalledWith("light");
    });
  });

  describe("2. v1 vs v2 Verhalten: Nie stillschweigend wirkungslos", () => {
    it("zeigt bei aktivem v2 den Badge 'Nur v1' und toast.info bei Klick auf ein v1-exklusives Werkzeug", () => {
      const props = createMockProps({ canvasEngine: "v2" });
      render(<AppHeader {...props} />);

      const toolsBtn = within(getMainNav()).getByRole("button", { name: /Werkzeuge/i });
      fireEvent.click(toolsBtn);

      // Prüfe 'Gerät hinzufügen' im v2-Modus
      const addDevBtn = screen.getByText("Gerät hinzufügen").closest("button");
      expect(addDevBtn).toBeDefined();
      expect(within(addDevBtn!).getByText("Nur v1")).toBeDefined();

      fireEvent.click(addDevBtn!);
      expect(props.onAddDevice).not.toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining("Canvas v2"),
        expect.anything()
      );
    });

    it("zeigt bei Ping-Test in v2 den Badge 'Nur v1' und toast.info", () => {
      const props = createMockProps({ canvasEngine: "v2" });
      render(<AppHeader {...props} />);

      const simBtn = within(getMainNav()).getByRole("button", { name: /Simulatoren/i });
      fireEvent.click(simBtn);

      const pingBtn = screen.getByText("Geführter Ping-Test").closest("button");
      expect(within(pingBtn!).getByText("Nur v1")).toBeDefined();

      fireEvent.click(pingBtn!);
      expect(props.onOpenPing).not.toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining("Canvas-v1-Topologien"),
        expect.anything()
      );
    });
  });

  describe("3. Fachbezogenes Menü-Scoping (Punkt 4)", () => {
    it("zeigt Kosten-Rechner nur bei Cloud-Fächern (Azure / AWS) und verbirgt ihn bei CCNA", () => {
      // Unter CCNA: Kein Kosten-Rechner
      const ccnaProps = createMockProps({ currentSubject: "CCNA" });
      render(<AppHeader {...ccnaProps} />);

      const toolsBtn = within(getMainNav()).getByRole("button", { name: /Werkzeuge/i });
      fireEvent.click(toolsBtn);
      expect(screen.queryByText("Cloud-Kosten-Rechner")).toBeNull();

      cleanup();

      // Unter Azure: Kosten-Rechner ist vorhanden
      const azureProps = createMockProps({ currentSubject: "Azure" });
      render(<AppHeader {...azureProps} />);

      const toolsBtnAzure = within(getMainNav()).getByRole("button", { name: /Werkzeuge/i });
      fireEvent.click(toolsBtnAzure);
      const costBtn = screen.getByText("Cloud-Kosten-Rechner");
      expect(costBtn).toBeDefined();

      fireEvent.click(costBtn);
      expect(azureProps.onToggleCostCalculator).toHaveBeenCalledTimes(1);
    });

    it("verbirgt Cisco-spezifische Drills (OSPF/Wildcard, CLI-Glossar) bei Cloud-Fächern (Azure)", () => {
      const azureProps = createMockProps({ currentSubject: "Azure" });
      render(<AppHeader {...azureProps} />);

      const toolsBtn = within(getMainNav()).getByRole("button", { name: /Werkzeuge/i });
      fireEvent.click(toolsBtn);

      expect(screen.queryByText("OSPF- und Wildcard-Trainer")).toBeNull();
      expect(screen.queryByText("Cisco-IOS-Befehlsreferenz")).toBeNull();
    });
  });

  describe("4. MobileNavDrawer Parität", () => {
    it("stellt alle Kern-Werkzeuge und Simulatoren auch im Mobile Drawer bereit", () => {
      const props = {
        ...createMockProps(),
        open: true,
        onClose: vi.fn(),
      };
      render(<MobileNavDrawer {...props} />);

      expect(screen.getByText("Themenübersicht & Module")).toBeDefined();
      expect(screen.getByText("Prüfungsfragen-Trainer")).toBeDefined();
      expect(screen.getByText("VLAN- und Trunk-Simulator")).toBeDefined();
      expect(screen.getByText("Spanning-Tree-Simulator (STP/RSTP)")).toBeDefined();
      expect(screen.getByText("Subnetting-Drill")).toBeDefined();
      expect(screen.getByText("IPv6-Rechner")).toBeDefined();
      expect(screen.getByText("Topologie-Diagnose")).toBeDefined();
    });
  });
});
