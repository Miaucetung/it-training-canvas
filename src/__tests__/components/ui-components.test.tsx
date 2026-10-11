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
import {
  CiscoTerminal,
  CISCO_PROMPT_REGEX,
  extractCiscoCommands,
} from "@/components/ui/cisco-terminal";
import { Callout } from "@/components/Callout";
import { mapLegacyFontToPlex, getFontStack } from "@/lib/canvas-utils";

describe("Phase R2: Standardisierte UI-Basiskomponenten & Design-Tokens", () => {
  describe("Button Komponente", () => {
    it("rendert Primary/Default Button mit Design-Tokens und 2px Fokus-Ring", () => {
      render(<Button variant="default">Speichern</Button>);
      const btn = screen.getByRole("button", { name: "Speichern" });
      expect(btn).toBeDefined();
      expect(btn.className).toContain("bg-accent-solid");
      expect(btn.className).toContain("text-on-accent-solid");
      expect(btn.className).toContain("focus-visible:ring-2");
      expect(btn.className).toContain("focus-visible:ring-accent-primary");
    });

    it("rendert Secondary, Outline und Destructive Buttons mit semantischen Tokens", () => {
      const { rerender } = render(<Button variant="secondary">Abbrechen</Button>);
      expect(screen.getByRole("button").className).toContain("bg-surface-elevated");

      rerender(<Button variant="outline">Zurück</Button>);
      expect(screen.getByRole("button").className).toContain("border-border-default");

      rerender(<Button variant="destructive">Löschen</Button>);
      expect(screen.getByRole("button").className).toContain("bg-status-error-solid");
      expect(screen.getByRole("button").className).toContain("text-on-status-error-solid");
    });
  });

  describe("Badge Komponente", () => {
    it("rendert alle Status-Varianten mit getrennten Text- und Hintergrund-Tokens", () => {
      const { rerender } = render(<Badge variant="default">Neu</Badge>);
      let badge = screen.getByText("Neu");
      expect(badge.className).toContain("bg-accent-solid");
      expect(badge.className).toContain("text-on-accent-solid");

      rerender(<Badge variant="success">Aktiv</Badge>);
      badge = screen.getByText("Aktiv");
      expect(badge.className).toContain("text-status-success-fg");
      expect(badge.className).toContain("bg-status-success-bg");

      rerender(<Badge variant="warning">Achtung</Badge>);
      badge = screen.getByText("Achtung");
      expect(badge.className).toContain("text-status-warning-fg");
      expect(badge.className).toContain("bg-status-warning-bg");

      rerender(<Badge variant="destructive">Fehler</Badge>);
      badge = screen.getByText("Fehler");
      expect(badge.className).toContain("text-status-error-fg");
      expect(badge.className).toContain("bg-status-error-bg");

      rerender(<Badge variant="trunk">Trunk</Badge>);
      badge = screen.getByText("Trunk");
      expect(badge.className).toContain("text-status-trunk-fg");

      rerender(<Badge variant="blocking">Blocking</Badge>);
      badge = screen.getByText("Blocking");
      expect(badge.className).toContain("text-status-blocking-fg");
    });
  });

  describe("Card Komponente", () => {
    it("nutzt bg-surface und border-border-default", () => {
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
      expect(card?.className).toContain("bg-surface");
      expect(card?.className).toContain("border-border-default");
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
      expect(trigger.className).toContain("data-[state=active]:bg-surface");
      expect(trigger.className).toContain("focus-visible:ring-2");
      expect(trigger.className).toContain("focus-visible:ring-accent-primary");
    });
  });

  describe("Input Komponente", () => {
    it("nutzt Oberflächen-Tokens und 2px Fokus-Ring", () => {
      render(<Input placeholder="IP-Adresse eingeben" />);
      const input = screen.getByPlaceholderText("IP-Adresse eingeben");
      expect(input.className).toContain("bg-surface");
      expect(input.className).toContain("focus-visible:ring-2");
      expect(input.className).toContain("focus-visible:ring-accent-primary");
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
      expect(cell.className).toContain("text-text-primary");
      const row = cell.closest("tr");
      expect(row?.className).toContain("border-border-subtle");
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
      expect(alertBox.className).toContain("bg-status-warning-bg");
      expect(alertBox.className).toContain("text-status-warning-fg");
      expect(alertBox.className).toContain("border-status-warning-border");
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

    describe("Prompt-Erkennung (CISCO_PROMPT_REGEX)", () => {
      const promptCases = [
        { raw: "R1> enable", prompt: "R1>", cmd: "enable", mode: "User EXEC" },
        { raw: "R1# configure terminal", prompt: "R1#", cmd: "configure terminal", mode: "Privileged EXEC" },
        { raw: "R1(config)# interface GigabitEthernet0/1", prompt: "R1(config)#", cmd: "interface GigabitEthernet0/1", mode: "Global Config" },
        { raw: "R1(config-if)# ip address 192.168.1.1 255.255.255.0", prompt: "R1(config-if)#", cmd: "ip address 192.168.1.1 255.255.255.0", mode: "Interface Config" },
        { raw: "R1(config-subif)# encapsulation dot1Q 10", prompt: "R1(config-subif)#", cmd: "encapsulation dot1Q 10", mode: "Sub-Interface Config" },
        { raw: "R1(config-router)# network 10.0.0.0 0.0.0.255 area 0", prompt: "R1(config-router)#", cmd: "network 10.0.0.0 0.0.0.255 area 0", mode: "Router Config" },
        { raw: "R1(config-line)# transport input ssh", prompt: "R1(config-line)#", cmd: "transport input ssh", mode: "Line Config" },
        { raw: "Switch(config-vlan)# name DATA_VLAN", prompt: "Switch(config-vlan)#", cmd: "name DATA_VLAN", mode: "VLAN Config" },
        { raw: "Core-SW-01(config-if)# channel-group 1 mode active", prompt: "Core-SW-01(config-if)#", cmd: "channel-group 1 mode active", mode: "Host mit Bindestrich & Ziffern" },
        { raw: "ISR-4331-GW1# show ip route", prompt: "ISR-4331-GW1#", cmd: "show ip route", mode: "Router mit Modellnummer" },
        { raw: "DS-3650-24PS(config-subif)# no shutdown", prompt: "DS-3650-24PS(config-subif)#", cmd: "no shutdown", mode: "Switch mit Catalyst-Modell" },
      ];

      promptCases.forEach(({ raw, prompt, cmd, mode }) => {
        it(`erkennt korrekt Modus '${mode}': ${raw}`, () => {
          const match = raw.match(CISCO_PROMPT_REGEX);
          expect(match).not.toBeNull();
          expect(match![1]).toBe(prompt);
          expect(match![2].trim()).toBe(cmd);
        });
      });
    });

    describe("extractCiscoCommands", () => {
      it("extrahiert ausschließlich Befehle ohne Prompts und ohne Ausgaben (1 Zeile pro Befehl)", () => {
        const transcript = `
SW-A# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW-A(config)# vlan 10
SW-A(config-vlan)# name MANAGEMENT
SW-A(config-vlan)# exit
SW-A(config)# interface GigabitEthernet0/1
SW-A(config-if)# switchport mode trunk
SW-A(config-if)# switchport trunk allowed vlan 10,20
SW-A(config-if)# end
SW-A# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/2, Gi0/3
10   MANAGEMENT                       active    
`;
        const expected = [
          "configure terminal",
          "vlan 10",
          "name MANAGEMENT",
          "exit",
          "interface GigabitEthernet0/1",
          "switchport mode trunk",
          "switchport trunk allowed vlan 10,20",
          "end",
          "show vlan brief",
        ].join("\n");

        const result = extractCiscoCommands(transcript);
        expect(result).toBe(expected);
      });

      it("filtert Kommentare und Leerzeilen bei Skripten ohne Prompts", () => {
        const rawScript = `
! Interface Konfiguration
interface Gi0/1
  description Uplink to Core
! Kommentarzeile
  no shutdown
`;
        const expected = [
          "interface Gi0/1",
          "description Uplink to Core",
          "no shutdown",
        ].join("\n");

        const result = extractCiscoCommands(rawScript);
        expect(result).toBe(expected);
      });

      it("erzeugt keine Leerzeilen bei Zeilen, die nur aus einem Prompt bestehen (z. B. 'R1#')", () => {
        const textWithNakedPrompts = `
R1#
R1# configure terminal
R1(config)#
R1(config)# interface Gi0/1
R1(config-if)# ip address 10.0.0.1 255.255.255.0
R1(config-if)#
R1(config-if)# no shutdown
R1#
`;
        const expected = [
          "configure terminal",
          "interface Gi0/1",
          "ip address 10.0.0.1 255.255.255.0",
          "no shutdown",
        ].join("\n");

        const result = extractCiscoCommands(textWithNakedPrompts);
        expect(result).toBe(expected);
      });

      it("behandelt '--More--' als Ausgabe und filtert es aus Befehlen heraus", () => {
        const textWithMore = `
SW1# show running-config
Building configuration...
Current configuration : 1240 bytes
!
version 15.2
--More--
interface GigabitEthernet0/1
 switchport mode access
--More-- (25% of file)
SW1# copy running-config startup-config
`;
        const expected = [
          "show running-config",
          "copy running-config startup-config",
        ].join("\n");

        const result = extractCiscoCommands(textWithMore);
        expect(result).toBe(expected);
      });

      it("behandelt nur '!' als IOS-Kommentar, während '#' kein Kommentar ist", () => {
        const scriptWithBanner = `
! Dies ist ein IOS-Kommentar
hostname Core-Router
banner motd # WARNING: Authorized Access Only! #
! Weiterer Kommentar
line vty 0 4
`;
        const expected = [
          "hostname Core-Router",
          "banner motd # WARNING: Authorized Access Only! #",
          "line vty 0 4",
        ].join("\n");

        const result = extractCiscoCommands(scriptWithBanner);
        expect(result).toBe(expected);
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
      expect(terminal?.className).toContain("bg-terminal-bg");
      expect(terminal?.className).toContain("text-terminal-fg");
      expect(terminal?.className).toContain("border-terminal-border");

      const promptEl = screen.getByText("SW-A#");
      expect(promptEl.className).toContain("text-terminal-prompt");

      const cmdEl = screen.getByText("show ip interface brief");
      expect(cmdEl.className).toContain("text-terminal-cmd");

      const outputEl = screen.getByText(/GigabitEthernet0\/1/);
      expect(outputEl.className).toContain("text-terminal-fg");
    });

    it("kopiert bei mehrzeiliger Session alle Befehle ohne Prompts und Ausgaben", async () => {
      const session = `
Core-SW-01# configure terminal
Core-SW-01(config)# interface Port-channel1
Core-SW-01(config-if)# switchport mode trunk
Core-SW-01(config-if)# end
Core-SW-01# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi1/0/1(P)    Gi1/0/2(P)
`;
      render(<CiscoTerminal>{session}</CiscoTerminal>);

      const copyBtn = screen.getByRole("button", { name: "Befehle kopieren" });
      fireEvent.click(copyBtn);

      const expectedCopied = [
        "configure terminal",
        "interface Port-channel1",
        "switchport mode trunk",
        "end",
        "show etherchannel summary",
      ].join("\n");

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedCopied);
      await waitFor(() => {
        expect(screen.getByText("Kopiert")).toBeDefined();
      });
    });
  });

  describe("Callout Komponente", () => {
    it("rendert alle didaktischen Varianten mit semantischen Tokens in Dark und Light", () => {
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

  describe("FontFamily Abwärtskompatibilität & Fallbacks", () => {
    it("mappt gespeicherte Legacy-Schriftarten (Arial, Helvetica, sans-serif) auf IBM Plex Sans", () => {
      expect(mapLegacyFontToPlex("Arial")).toBe("IBM Plex Sans");
      expect(mapLegacyFontToPlex("Helvetica")).toBe("IBM Plex Sans");
      expect(mapLegacyFontToPlex("sans-serif")).toBe("IBM Plex Sans");
      expect(mapLegacyFontToPlex("Segoe UI")).toBe("IBM Plex Sans");
      expect(mapLegacyFontToPlex("IBM Plex Sans")).toBe("IBM Plex Sans");
    });

    it("mappt Monospace- und Standard-Schriften (Courier, Terminal, monospace) auf IBM Plex Mono", () => {
      expect(mapLegacyFontToPlex("Courier New")).toBe("IBM Plex Mono");
      expect(mapLegacyFontToPlex("monospace")).toBe("IBM Plex Mono");
      expect(mapLegacyFontToPlex("IBM Plex Mono")).toBe("IBM Plex Mono");
      expect(mapLegacyFontToPlex(undefined)).toBe("IBM Plex Mono");
      expect(mapLegacyFontToPlex("")).toBe("IBM Plex Mono");
    });

    it("liefert saubere CSS Font-Stacks mit System-Fallbacks", () => {
      expect(getFontStack("Arial")).toContain("IBM Plex Sans");
      expect(getFontStack("Arial")).toContain("sans-serif");
      expect(getFontStack("Courier New")).toContain("IBM Plex Mono");
      expect(getFontStack("Courier New")).toContain("monospace");
    });
  });
});
