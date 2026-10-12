// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CcnaDashboard } from "@/components/dashboard/CcnaDashboard";
import { SubnetQuickCalc } from "@/components/dashboard/SubnetQuickCalc";
import { TopologyHero } from "@/components/dashboard/TopologyHero";
import { BlueprintDomainsGrid } from "@/components/dashboard/BlueprintDomainsGrid";

// Mock content loader
vi.mock("@/lib/content/content-loader", () => ({
  loadModule: vi.fn().mockResolvedValue({
    id: "ccna",
    title: "Cisco CCNA 200-301",
    topics: [
      { id: "networking-fundamentals", title: "Netzwerkgrundlagen & OSI-Modell" },
      { id: "ios-cli", title: "Cisco IOS CLI" },
      { id: "ipv4-addressing", title: "IPv4-Adressierung" },
      { id: "subnet-segmentation", title: "Subnetz-Segmentierung & VLSM" },
      { id: "ipv6", title: "IPv6-Grundlagen" },
      { id: "switching-vlans", title: "Switching & VLANs" },
      { id: "stp", title: "Spanning Tree Protocol" },
      { id: "etherchannel", title: "EtherChannel" },
      { id: "routing-ospf", title: "Routing & OSPF" },
      { id: "dhcp-nat", title: "DHCP & IP-Dienste" },
      { id: "nat", title: "NAT & PAT" },
      { id: "security", title: "Sicherheitsgrundlagen" },
      { id: "acl", title: "Access Control Lists" },
      { id: "automation", title: "Automatisierung & REST" },
    ],
  }),
}));

describe("CcnaDashboard & Subcomponents", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("SubnetQuickCalc (Inline-Rechner)", () => {
    it("berechnet 192.168.10.77/27 sofort und zeigt Netz, Broadcast und Hosts ohne Dialog", () => {
      render(<SubnetQuickCalc />);
      expect(screen.getByText("Inline-Subnetzrechner")).toBeInTheDocument();

      // Default value is 192.168.10.77/27
      expect(screen.getByText("192.168.10.64")).toBeInTheDocument(); // Network
      expect(screen.getByText("192.168.10.95")).toBeInTheDocument(); // Broadcast
      expect(screen.getByText(/192.168.10.65 — 192.168.10.94/)).toBeInTheDocument(); // Hosts
      expect(screen.getByText("255.255.255.224")).toBeInTheDocument(); // Mask
      expect(screen.getByText("0.0.0.31")).toBeInTheDocument(); // Wildcard
    });

    it("aktualisiert die Werte bei Benutzereingabe", () => {
      render(<SubnetQuickCalc />);
      const input = screen.getByRole("textbox", { name: /IPv4-Adresse/i });
      fireEvent.change(input, { target: { value: "10.0.0.1/24" } });

      expect(screen.getByText("10.0.0.0")).toBeInTheDocument();
      expect(screen.getByText("10.0.0.255")).toBeInTheDocument();
      expect(screen.getByText("255.255.255.0")).toBeInTheDocument();
    });
  });

  describe("BlueprintDomainsGrid", () => {
    it("rendert alle 6 offiziellen Cisco Blueprint-Domänen mit exakter Gewichtung", () => {
      render(
        <BlueprintDomainsGrid
          completedTopicIds={["networking-fundamentals", "ios-cli"]}
          onSelectTopic={vi.fn()}
        />
      );

      expect(screen.getByText("1.0")).toBeInTheDocument();
      expect(screen.getByText("Network Fundamentals")).toBeInTheDocument();
      expect(screen.getAllByText("20 % Gewichtung")).toHaveLength(2); // Domain 1.0 & 2.0

      expect(screen.getByText("2.0")).toBeInTheDocument();
      expect(screen.getByText("Network Access")).toBeInTheDocument();

      expect(screen.getByText("3.0")).toBeInTheDocument();
      expect(screen.getByText("IP Connectivity")).toBeInTheDocument();
      expect(screen.getByText("25 % Gewichtung")).toBeInTheDocument();

      expect(screen.getByText("4.0")).toBeInTheDocument();
      expect(screen.getByText("IP Services")).toBeInTheDocument();
      expect(screen.getAllByText("10 % Gewichtung")).toHaveLength(2); // Domain 4.0 & 6.0

      expect(screen.getByText("5.0")).toBeInTheDocument();
      expect(screen.getByText("Security Fundamentals")).toBeInTheDocument();
      expect(screen.getByText("15 % Gewichtung")).toBeInTheDocument();

      expect(screen.getByText("6.0")).toBeInTheDocument();
      expect(screen.getByText("Automation and Programmability")).toBeInTheDocument();
    });

    it("klappt Unterthemen bei Klick auf Accordion auf", () => {
      const handleSelect = vi.fn();
      render(
        <BlueprintDomainsGrid
          completedTopicIds={[]}
          onSelectTopic={handleSelect}
        />
      );

      const accordionBtns = screen.getAllByRole("button", { name: /Unterthemen anzeigen/i });
      fireEvent.click(accordionBtns[0]); // Open 1.0 Network Fundamentals

      expect(screen.getByText("1.1")).toBeInTheDocument();
      expect(screen.getByText(/Rollen & Funktionen von Netzwerkkomponenten/i)).toBeInTheDocument();

      const openBtn = screen.getAllByRole("button", { name: /Öffnen/i })[0];
      fireEvent.click(openBtn);
      expect(handleSelect).toHaveBeenCalledWith("networking-fundamentals");
    });
  });

  describe("TopologyHero", () => {
    it("zeigt für Neunutzer 'Jetzt starten' und für Fortgeschrittene 'Weiterlernen'", () => {
      const handleSelect = vi.fn();
      const { rerender } = render(
        <TopologyHero
          onSelectTopic={handleSelect}
          onOpenSimulator={vi.fn()}
          onOpenCanvasV2={vi.fn()}
          onOpenCommandPalette={vi.fn()}
          isPresentationMode={false}
          onTogglePresentationMode={vi.fn()}
          hasProgress={false}
          completedTopicCount={0}
          totalTopicCount={26}
        />
      );

      expect(screen.getByText(/Jetzt starten: Network Fundamentals/i)).toBeInTheDocument();

      rerender(
        <TopologyHero
          onSelectTopic={handleSelect}
          onOpenSimulator={vi.fn()}
          onOpenCanvasV2={vi.fn()}
          onOpenCommandPalette={vi.fn()}
          isPresentationMode={false}
          onTogglePresentationMode={vi.fn()}
          hasProgress={true}
          lastActiveTopicTitle="OSPFv2 Routing"
          lastActiveTopicId="routing-ospf"
          completedTopicCount={5}
          totalTopicCount={26}
        />
      );

      expect(screen.getByText(/Weiterlernen: OSPFv2 Routing/i)).toBeInTheDocument();
    });

    it("führt bei Klick auf 'Ping testen' eine illustrative Animation aus", async () => {
      render(
        <TopologyHero
          onSelectTopic={vi.fn()}
          onOpenSimulator={vi.fn()}
          onOpenCanvasV2={vi.fn()}
          onOpenCommandPalette={vi.fn()}
          isPresentationMode={false}
          onTogglePresentationMode={vi.fn()}
          hasProgress={false}
          completedTopicCount={0}
          totalTopicCount={26}
        />
      );

      const pingBtn = screen.getByRole("button", { name: /Ping testen/i });
      fireEvent.click(pingBtn);

      expect(screen.getByText(/Ping läuft\.\.\./i)).toBeInTheDocument();
    });
  });

  describe("CcnaDashboard Hauptansicht", () => {
    it("rendert alle Bereiche: Hero, Blueprint, Heute üben, Simulatoren, Footer", async () => {
      render(<CcnaDashboard theme="dark" />);

      await waitFor(() => {
        expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument();
      });

      expect(screen.getByText("Die 6 Blueprint-Bereiche")).toBeInTheDocument();
      expect(screen.getByText("Heute üben")).toBeInTheDocument();
      expect(screen.getByText("Protokoll-Simulatoren & Praxis")).toBeInTheDocument();
      expect(screen.getByText("Zuletzt bearbeitet")).toBeInTheDocument();
      expect(screen.getByText(/Rechtlicher Hinweis:/i)).toBeInTheDocument();
    });

    it("schaltet Präsentationsmodus über Taste 'P' ein und aus", async () => {
      render(<CcnaDashboard theme="dark" />);

      await waitFor(() => {
        expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument();
      });

      // Press P key
      fireEvent.keyDown(window, { key: "p" });
      expect(screen.getByText(/Dozenten-Präsentationsmodus aktiv/i)).toBeInTheDocument();

      // Press Escape key
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText(/Dozenten-Präsentationsmodus aktiv/i)).not.toBeInTheDocument();
    });

    it("öffnet die Befehlspalette bei Klick auf den Strg+K Button", async () => {
      render(<CcnaDashboard theme="dark" />);

      await waitFor(() => {
        expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument();
      });

      const cmdBtn = screen.getByTitle(/Befehlspalette öffnen/i);
      fireEvent.click(cmdBtn);

      expect(screen.getByRole("dialog", { name: /CCNA Befehlspalette/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Thema, Simulator, Tool oder Cisco-Befehl suchen/i)).toBeInTheDocument();
    });
  });
});
