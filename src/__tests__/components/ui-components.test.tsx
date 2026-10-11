// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CiscoTerminal } from "@/components/ui/cisco-terminal";
import { Callout } from "@/components/Callout";

describe("Phase R2: Standardisierte UI-Basiskomponenten & Design-Tokens", () => {
  describe("Button Komponente", () => {
    it("rendert Primary/Default Button mit Design-Tokens und 2px Fokus-Ring", () => {
      render(<Button variant="default">Speichern</Button>);
      const btn = screen.getByRole("button", { name: "Speichern" });
      expect(btn).toBeDefined();
      expect(btn.className).toContain("bg-[var(--accent-primary-fg)]");
      expect(btn.className).toContain("focus-visible:ring-2");
      expect(btn.className).toContain("focus-visible:ring-[var(--accent-primary)]");
    });

    it("rendert Secondary, Outline und Destructive Buttons mit semantischen Tokens", () => {
      const { rerender } = render(<Button variant="secondary">Abbrechen</Button>);
      expect(screen.getByRole("button").className).toContain("bg-[var(--surface-elevated)]");

      rerender(<Button variant="outline">Zurück</Button>);
      expect(screen.getByRole("button").className).toContain("border-[var(--border-default)]");

      rerender(<Button variant="destructive">Löschen</Button>);
      expect(screen.getByRole("button").className).toContain("bg-[var(--status-error-border)]");
    });
  });

  describe("Badge Komponente", () => {
    it("rendert alle Status-Varianten mit getrennten Text- und Hintergrund-Tokens", () => {
      const { rerender } = render(<Badge variant="success">Aktiv</Badge>);
      let badge = screen.getByText("Aktiv");
      expect(badge.className).toContain("text-[var(--status-success-fg)]");
      expect(badge.className).toContain("bg-[var(--status-success-bg)]");

      rerender(<Badge variant="warning">Achtung</Badge>);
      badge = screen.getByText("Achtung");
      expect(badge.className).toContain("text-[var(--status-warning-fg)]");
      expect(badge.className).toContain("bg-[var(--status-warning-bg)]");

      rerender(<Badge variant="destructive">Fehler</Badge>);
      badge = screen.getByText("Fehler");
      expect(badge.className).toContain("text-[var(--status-error-fg)]");
      expect(badge.className).toContain("bg-[var(--status-error-bg)]");

      rerender(<Badge variant="trunk">Trunk</Badge>);
      badge = screen.getByText("Trunk");
      expect(badge.className).toContain("text-[var(--status-trunk-fg)]");

      rerender(<Badge variant="blocking">Blocking</Badge>);
      badge = screen.getByText("Blocking");
      expect(badge.className).toContain("text-[var(--status-blocking-fg)]");
    });
  });

  describe("Card Komponente", () => {
    it("nutzt var(--surface) und var(--border-default)", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Topologie-Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>3 Switches aktiv</p>
          </CardContent>
        </Card>
      );
      const card = screen.getByText("3 Switches aktiv").closest("[data-slot='card']");
      expect(card?.className).toContain("bg-[var(--surface)]");
      expect(card?.className).toContain("border-[var(--border-default)]");
    });
  });

  describe("Tabs Komponente", () => {
    it("rendert TabsList und TabsTrigger mit barrierefreiem Styling", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Allgemein</TabsTrigger>
            <TabsTrigger value="tab2">Ports</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Inhalt 1</TabsContent>
          <TabsContent value="tab2">Inhalt 2</TabsContent>
        </Tabs>
      );
      const trigger = screen.getByRole("tab", { name: "Allgemein" });
      expect(trigger.className).toContain("data-[state=active]:bg-[var(--surface)]");
      expect(trigger.className).toContain("focus-visible:ring-2");
    });
  });

  describe("Input Komponente", () => {
    it("nutzt Oberflächen-Tokens und 2px Fokus-Ring", () => {
      render(<Input placeholder="IP-Adresse eingeben" />);
      const input = screen.getByPlaceholderText("IP-Adresse eingeben");
      expect(input.className).toContain("bg-[var(--surface)]");
      expect(input.className).toContain("focus-visible:ring-2");
      expect(input.className).toContain("focus-visible:ring-[var(--accent-primary)]");
    });
  });

  describe("Table Komponente", () => {
    it("rendert semantische Tabellenstruktur mit Token-Borders", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Interface</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Gi0/1</TableCell>
              <TableCell>up/up</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByText("Gi0/1");
      expect(cell.className).toContain("text-[var(--text-primary)]");
      const row = cell.closest("tr");
      expect(row?.className).toContain("border-[var(--border-subtle)]");
    });
  });

  describe("Alert Komponente", () => {
    it("unterstützt statusbasierte Varianten für didaktische Hinweise", () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Spanning Tree Notiz</AlertTitle>
          <AlertDescription>Root Bridge Priorität beachten</AlertDescription>
        </Alert>
      );
      const alertBox = screen.getByRole("alert");
      expect(alertBox.className).toContain("bg-[var(--status-warning-bg)]");
      expect(alertBox.className).toContain("text-[var(--status-warning-fg)]");
      expect(alertBox.className).toContain("border-[var(--status-warning-border)]");
    });
  });

  describe("CiscoTerminal Komponente (CLI & Code-Blöcke)", () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
    });

    it("bleibt in beiden Themes dunkel und trennt Prompt, Befehl und Ausgabe", () => {
      render(
        <CiscoTerminal
          title="Switch-A Konsole"
          prompt="SW-A#"
          command="show ip interface brief"
          output="GigabitEthernet0/1   192.168.1.1     YES manual up                    up"
        />
      );

      const terminal = screen.getByText("Switch-A Konsole").closest("[data-slot='cisco-terminal']");
      expect(terminal?.className).toContain("bg-[var(--terminal-bg)]");
      expect(terminal?.className).toContain("text-[var(--terminal-fg)]");
      expect(terminal?.className).toContain("border-[var(--terminal-border)]");

      const promptEl = screen.getByText("SW-A#");
      expect(promptEl.className).toContain("text-[var(--terminal-prompt)]");

      const cmdEl = screen.getByText("show ip interface brief");
      expect(cmdEl.className).toContain("text-[var(--terminal-cmd)]");

      const outputEl = screen.getByText(/GigabitEthernet0\/1/);
      expect(outputEl.className).toContain("text-[var(--terminal-fg)]");
    });

    it("kopiert ausschließlich den Befehl ohne den Cisco-Prompt", async () => {
      render(
        <CiscoTerminal
          prompt="Router#"
          command="show running-config"
        />
      );

      const copyBtn = screen.getByRole("button", { name: "Befehl kopieren" });
      fireEvent.click(copyBtn);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("show running-config");
      await waitFor(() => {
        expect(screen.getByText("Kopiert")).toBeDefined();
      });
    });
  });

  describe("Callout Komponente", () => {
    it("rendert alle 6 didaktischen Varianten mit semantischen Tokens in Dark und Light", () => {
      const { rerender } = render(
        <Callout
          variant="merke"
          title="Wichtige Regel"
          body="Switches leiten Broadcasts weiter."
          dark={false}
        />
      );
      expect(screen.getByText("Wichtige Regel")).toBeDefined();
      expect(screen.getByText("Switches leiten Broadcasts weiter.")).toBeDefined();

      rerender(
        <Callout
          variant="falle"
          title="Prüfungsfalle"
          body="Nicht alle Ports sind Designated."
          dark={true}
        />
      );
      expect(screen.getByText("Prüfungsfalle")).toBeDefined();
      expect(screen.getByText("Nicht alle Ports sind Designated.")).toBeDefined();
    });
  });
});
