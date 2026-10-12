// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { MobileNavDrawer } from "@/components/navigation/MobileNavDrawer";
import type { LearningPath } from "@/lib/types";

describe("Fachauswahl-Entfernung (CCNA-Fokussierung)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const baseProps = {
    currentSubject: "CCNA",
    subjects: ["CCNA"],
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
    learningPaths: {} as Record<string, LearningPath>,
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

  it("AppHeader enthält keine Fachauswahl-Dropdowns oder Fach-Wechsel-Buttons für Fremdfächer", () => {
    render(<AppHeader {...baseProps} />);

    // Es darf kein Select oder Dropdown für Fremdfächer existieren
    expect(screen.queryByText("Fach wechseln")).toBeNull();
    expect(screen.queryByText("Fach hinzufügen")).toBeNull();
    expect(screen.queryByLabelText(/fach auswählen/i)).toBeNull();

    // Weder Azure, AWS, noch Linux dürfen als Fachoptionen gerendert werden
    expect(screen.queryByText("AZ-900")).toBeNull();
    expect(screen.queryByText("AWS Cloud Practitioner")).toBeNull();
    expect(screen.queryByText("Linux LPIC-1")).toBeNull();
    expect(screen.queryByText("Fach:")).toBeNull();

    // CCNA 200-301 Branding muss vorhanden sein
    expect(screen.getByText("CCNA 200-301")).toBeDefined();
  });

  it("MobileNavDrawer enthält keine Fremdfach-Auswahl oder Fach-Hinzufügen-Aktionen", () => {
    render(<MobileNavDrawer open={true} onClose={vi.fn()} {...baseProps} />);

    expect(screen.queryByText("Fach wechseln")).toBeNull();
    expect(screen.queryByText("Neues Fach")).toBeNull();
    expect(screen.queryByText("AZ-900")).toBeNull();
    expect(screen.queryByText("AWS")).toBeNull();
    expect(screen.queryByText("Linux")).toBeNull();
  });

  it("Es existiert keine alte schmale Seitenleiste (Sidebar) mit Icons für WLAN/Linux/Cloud mehr", () => {
    // Sicherstellen, dass weder im DOM noch als Komponente eine Sidebar existiert
    const { container } = render(<AppHeader {...baseProps} />);
    const sidebarElement = container.querySelector("aside.sidebar, [data-testid='subject-sidebar']");
    expect(sidebarElement).toBeNull();
  });
});
