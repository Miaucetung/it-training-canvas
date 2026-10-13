// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LabScenariosDialog, LABS_ORDERED } from "@/components/LabScenariosDialog";
import { AppHeader } from "@/components/navigation/AppHeader";

describe("LabScenariosDialog & Header Navigation Button", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("LabScenariosDialog Komponente", () => {
    it("rendert nicht wenn open=false", () => {
      const { container } = render(
        <LabScenariosDialog open={false} onClose={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("rendert alle 55 Labs und den Dialog-Header wenn open=true", () => {
      render(<LabScenariosDialog open={true} onClose={vi.fn()} />);

      expect(screen.getByRole("heading", { name: /Packet Tracer Labs/i })).toBeDefined();
      expect(screen.getByText("55 Labs")).toBeDefined();
      expect(screen.getByText("PT 9.0 ready")).toBeDefined();
      expect(screen.getByText("CCNA 200-301")).toBeDefined();
    });

    it("filtert Labs über das Suchfeld nach Suchbegriff (z. B. 'OSPF')", () => {
      render(<LabScenariosDialog open={true} onClose={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/Thema, OSPF, VLAN, NAT suchen/i);
      fireEvent.change(searchInput, { target: { value: "OSPF" } });

      // OSPF-Labs sollten sichtbar sein
      expect(screen.getByText("OSPF — Single Area 0")).toBeDefined();
    });

    it("filtert Labs nach Kategorie-Pills (z. B. 'Drills')", () => {
      render(<LabScenariosDialog open={true} onClose={vi.fn()} />);

      const drillPill = screen.getByRole("button", { name: /Drills \(4\)/i });
      fireEvent.click(drillPill);

      // Grundkonfig-Drill sollte sichtbar sein
      const matching = screen.getAllByText(/Grundkonfiguration/i);
      expect(matching.length).toBeGreaterThan(0);
    });

    it("markiert ein Lab als erledigt und persistiert im localStorage", () => {
      render(<LabScenariosDialog open={true} onClose={vi.fn()} />);

      const toggleBtn = screen.getByRole("button", { name: /Als erledigt markieren/i });
      fireEvent.click(toggleBtn);

      expect(screen.getByText("Lab abgeschlossen")).toBeDefined();
      const stored = localStorage.getItem("ccna-completed-labs-v1");
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toContain(LABS_ORDERED[0].id);

      // Klick erneut schaltet wieder zurück
      fireEvent.click(screen.getByRole("button", { name: /Lab abgeschlossen/i }));
      expect(screen.getByText("Als erledigt markieren")).toBeDefined();
    });

    it("kopiert alle Befehle des Labs in die Zwischenablage", () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<LabScenariosDialog open={true} onClose={vi.fn()} />);

      const copyAllBtn = screen.getByRole("button", { name: "Alle Befehle kopieren" });
      fireEvent.click(copyAllBtn);

      expect(writeTextMock).toHaveBeenCalledTimes(1);
      expect(writeTextMock.mock.calls[0][0]).toContain("Cisco Packet Tracer Lab");
    });

    it("wechselt zum nächsten Lab über die Footer-Navigation", () => {
      render(<LabScenariosDialog open={true} onClose={vi.fn()} />);

      const nextLab = LABS_ORDERED[1];
      const nextBtn = screen.getByRole("button", { name: new RegExp(`Weiter: ${nextLab.title}`, "i") });
      fireEvent.click(nextBtn);

      // Titel des nächsten Labs sollte nun die Hauptüberschrift sein
      expect(screen.getByRole("heading", { name: nextLab.title, level: 1 })).toBeDefined();
    });

    it("schließt den Dialog bei Escape-Taste", () => {
      const handleClose = vi.fn();
      render(<LabScenariosDialog open={true} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("AppHeader Dedicated Labs Button", () => {
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

    it("rendert den 'Labs' Button mit '55'-Badge direkt in der Hauptnavigation", () => {
      const props = makeHeaderProps();
      render(<AppHeader {...props} />);

      const labsBtn = screen.getByRole("button", { name: /Packet Tracer Labs öffnen/ });
      expect(labsBtn).toBeDefined();
      expect(labsBtn.textContent).toContain("Labs");
      expect(labsBtn.textContent).toContain("55");

      fireEvent.click(labsBtn);
      expect(props.onOpenLabs).toHaveBeenCalledTimes(1);
    });
  });
});
