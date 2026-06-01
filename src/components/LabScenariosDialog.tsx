import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Check,
  Copy,
  Desktop,
  FilePdf,
  FileText,
  Globe,
  HardDrives,
  Info,
  Key,
  Lightning,
  Network,
  Router,
  Shield,
  Shuffle,
  Stack,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────

interface CommandBlock {
  device: string;      // z. B. "Router0"
  mode: string;        // z. B. "privileged" | "global" | "interface"
  modeLabel: string;   // z. B. "Router#" | "Router(config)#"
  commands: Array<{
    cmd: string;
    explanation: string;
  }>;
}

interface LabStep {
  title: string;
  blocks: CommandBlock[];
}

interface LabScenario {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  difficulty: "Anfänger" | "Mittel" | "Fortgeschritten";
  duration: string;
  topology: {
    description: string;
    devices: Array<{ type: string; label: string; count: number }>;
    connections: string[];
    hint: string;
  };
  steps: LabStep[];
  verifyCommands: Array<{ cmd: string; expected: string }>;
}

// ── Lab-Szenarien ─────────────────────────────────────────────

const LABS: LabScenario[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. IP-Grundkonfiguration
  // ─────────────────────────────────────────────────────────────
  {
    id: "basic-ip",
    icon: <Network size={20} />,
    title: "IP-Grundkonfiguration",
    subtitle: "Router · Switch · 2 PCs",
    difficulty: "Anfänger",
    duration: "10 min",
    topology: {
      description:
        "Die einfachste Netzwerktopologie: ein Router verbindet zwei PCs über einen Switch.",
      devices: [
        { type: "router", label: "Router0", count: 1 },
        { type: "switch", label: "Switch0", count: 1 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "PC0 → Switch0  (FastEthernet)",
        "PC1 → Switch0  (FastEthernet)",
        "Switch0 → Router0 GigabitEthernet0/0",
      ],
      hint: "Drag Router, Switch und 2 PCs auf das Canvas. Verbinde alle mit Copper Straight-Through.",
    },
    steps: [
      {
        title: "Router konfigurieren",
        blocks: [
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable",
                explanation:
                  "Wechselt in den Privileged EXEC Modus (# Prompt). Hier können show-Befehle und Konfigurationsmodus aktiviert werden.",
              },
            ],
          },
          {
            device: "Router0",
            mode: "global",
            modeLabel: "Router#",
            commands: [
              {
                cmd: "configure terminal",
                explanation:
                  "Öffnet den Global Configuration Mode. Alle folgenden Befehle ändern die laufende Konfiguration.",
              },
              {
                cmd: "hostname R1",
                explanation:
                  "Setzt den Hostnamen. Ändert den CLI-Prompt auf 'R1(config)#'. Wichtig für Übersicht in größeren Labs.",
              },
            ],
          },
          {
            device: "Router0",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0",
                explanation:
                  "Wählt das Interface GigabitEthernet0/0 aus (erste physische Schnittstelle). Prompt wechselt zu R1(config-if)#.",
              },
              {
                cmd: "ip address 192.168.1.1 255.255.255.0",
                explanation:
                  "Weist dem Interface die IP-Adresse 192.168.1.1/24 zu. Dies ist das Default Gateway der PCs.",
              },
              {
                cmd: "no shutdown",
                explanation:
                  "Aktiviert das Interface. Standardmäßig sind Router-Interfaces deaktiviert ('administratively down').",
              },
              {
                cmd: "end",
                explanation:
                  "Verlässt direkt jeden Konfigurationsmodus und geht zurück zum Privileged EXEC (#).",
              },
            ],
          },
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip interface brief",
                explanation:
                  "Zeigt alle Interfaces mit IP, Status (up/down) und Protokoll-Status. Erwartet: GigabitEthernet0/0 up/up mit 192.168.1.1.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs konfigurieren (GUI in Packet Tracer)",
        blocks: [
          {
            device: "PC0",
            mode: "gui",
            modeLabel: "PC0 Desktop → IP Configuration",
            commands: [
              {
                cmd: "IP Address:  192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1",
                explanation:
                  "PC0 erhält eine statische IP aus dem Subnetz 192.168.1.0/24. Das Default Gateway zeigt auf den Router.",
              },
            ],
          },
          {
            device: "PC1",
            mode: "gui",
            modeLabel: "PC1 Desktop → IP Configuration",
            commands: [
              {
                cmd: "IP Address:  192.168.1.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1",
                explanation:
                  "PC1 erhält eine andere IP im selben Subnetz. Beide PCs können sich nun gegenseitig und den Router anpingen.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 192.168.1.10", expected: "!!!!! (5/5 erfolgreich)" },
      { cmd: "show ip interface brief", expected: "GigabitEthernet0/0 up/up" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. VLANs & Trunking
  // ─────────────────────────────────────────────────────────────
  {
    id: "vlan-trunking",
    icon: <Stack size={20} />,
    title: "VLANs & Trunking",
    subtitle: "2 Switches · 4 PCs",
    difficulty: "Anfänger",
    duration: "15 min",
    topology: {
      description:
        "Zwei Switches teilen ein Netz in zwei VLANs auf. Trunk-Link verbindet die Switches.",
      devices: [
        { type: "switch", label: "SW1 / SW2", count: 2 },
        { type: "pc", label: "PC0–PC3", count: 4 },
      ],
      connections: [
        "PC0 → SW1 Fa0/1  (VLAN 10)",
        "PC1 → SW1 Fa0/2  (VLAN 20)",
        "PC2 → SW2 Fa0/1  (VLAN 10)",
        "PC3 → SW2 Fa0/2  (VLAN 20)",
        "SW1 Gi0/1 ↔ SW2 Gi0/1  (Trunk)",
      ],
      hint: "Drag 2 Switches + 4 PCs. Verbinde Switches mit Copper Cross-Over oder Auto.",
    },
    steps: [
      {
        title: "VLANs erstellen (SW1)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "vlan 10",
                explanation:
                  "Erstellt VLAN 10 in der VLAN-Datenbank. Prompt wechselt zu SW1(config-vlan)#.",
              },
              {
                cmd: "name SALES",
                explanation: "Gibt VLAN 10 den lesbaren Namen 'SALES'.",
              },
              {
                cmd: "vlan 20",
                explanation: "Erstellt VLAN 20.",
              },
              {
                cmd: "name HR",
                explanation: "Gibt VLAN 20 den Namen 'HR'.",
              },
              {
                cmd: "exit",
                explanation: "Zurück zum Global Config Mode.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "interface FastEthernet0/1",
                explanation: "Wählt Port Fa0/1 (PC0 ist hier angeschlossen).",
              },
              {
                cmd: "switchport mode access",
                explanation:
                  "Setzt den Port auf Access-Modus — er gehört genau einem VLAN.",
              },
              {
                cmd: "switchport access vlan 10",
                explanation:
                  "Weist den Port VLAN 10 zu. Nur Geräte in VLAN 10 dürfen hier kommunizieren.",
              },
              {
                cmd: "interface FastEthernet0/2",
                explanation: "Wählt Port Fa0/2 (PC1).",
              },
              {
                cmd: "switchport mode access",
                explanation: "Setzt auf Access-Modus.",
              },
              {
                cmd: "switchport access vlan 20",
                explanation: "Weist VLAN 20 zu.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "trunk",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/1",
                explanation:
                  "Wählt den Uplink-Port zum zweiten Switch (Trunk-Port).",
              },
              {
                cmd: "switchport mode trunk",
                explanation:
                  "Setzt den Port auf Trunk-Modus. Trägt alle VLANs via IEEE 802.1Q-Tags.",
              },
              {
                cmd: "switchport trunk allowed vlan 10,20",
                explanation:
                  "Beschränkt den Trunk auf VLAN 10 und 20 — Best Practice für Sicherheit.",
              },
              {
                cmd: "end",
                explanation: "Zurück zum Privileged EXEC.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2 identisch konfigurieren",
        blocks: [
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "vlan 10\nname SALES\nvlan 20\nname HR\nexit",
                explanation:
                  "Gleiche VLANs auf SW2 anlegen — VLANs werden NICHT automatisch über Trunks propagiert (ausser mit VTP, das hier deaktiviert ist).",
              },
              {
                cmd: "interface FastEthernet0/1\nswitchport mode access\nswitchport access vlan 10\ninterface FastEthernet0/2\nswitchport mode access\nswitchport access vlan 20",
                explanation: "Access-Ports für PC2 (VLAN 10) und PC3 (VLAN 20) setzen.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nswitchport mode trunk\nswitchport trunk allowed vlan 10,20",
                explanation: "Trunk zum SW1 konfigurieren.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief", expected: "VLAN 10 active, VLAN 20 active" },
      { cmd: "show interfaces trunk", expected: "Gi0/1 trunk, VLANs 10,20" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. Inter-VLAN Routing (Router-on-a-Stick)
  // ─────────────────────────────────────────────────────────────
  {
    id: "roas",
    icon: <Router size={20} />,
    title: "Inter-VLAN Routing (RoaS)",
    subtitle: "Router · Switch · 2 PCs",
    difficulty: "Mittel",
    duration: "20 min",
    topology: {
      description:
        "Ein Router mit einem einzigen Trunk-Port routet zwischen VLAN 10 und VLAN 20.",
      devices: [
        { type: "router", label: "Router0", count: 1 },
        { type: "switch", label: "Switch0", count: 1 },
        { type: "pc", label: "PC0 (VLAN10) / PC1 (VLAN20)", count: 2 },
      ],
      connections: [
        "PC0 → Switch0 Fa0/1",
        "PC1 → Switch0 Fa0/2",
        "Switch0 Gi0/1 → Router0 GigabitEthernet0/0  (Trunk)",
      ],
      hint: "Topologie sieht aus wie ein umgekehrtes T — Switch in der Mitte, Router oben, PCs unten.",
    },
    steps: [
      {
        title: "Switch konfigurieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "vlan 10\nname VLAN10\nvlan 20\nname VLAN20\nexit",
                explanation: "VLANs anlegen.",
              },
              {
                cmd: "interface Fa0/1\nswitchport mode access\nswitchport access vlan 10",
                explanation: "PC0 → VLAN 10.",
              },
              {
                cmd: "interface Fa0/2\nswitchport mode access\nswitchport access vlan 20",
                explanation: "PC1 → VLAN 20.",
              },
              {
                cmd: "interface Gi0/1\nswitchport mode trunk",
                explanation:
                  "Trunk zum Router. Überträgt Frames aller VLANs mit 802.1Q Tag.",
              },
            ],
          },
        ],
      },
      {
        title: "Router Subinterfaces konfigurieren",
        blocks: [
          {
            device: "Router0",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0",
                explanation:
                  "Wählt das physische Interface. Kein 'ip address' hier — das kommt auf Subinterfaces.",
              },
              {
                cmd: "no shutdown",
                explanation:
                  "Physisches Interface aktivieren! Subinterfaces erben den Status des physischen.",
              },
              {
                cmd: "interface GigabitEthernet0/0.10",
                explanation:
                  "Erstellt Subinterface .10 für VLAN 10. Der Punkt trennt physischen Port von Subinterface-Nummer.",
              },
              {
                cmd: "encapsulation dot1Q 10",
                explanation:
                  "Verknüpft dieses Subinterface mit VLAN-ID 10. Router entfernt/setzt den 802.1Q-Tag.",
              },
              {
                cmd: "ip address 192.168.10.1 255.255.255.0",
                explanation:
                  "Default Gateway für VLAN 10. Alle PCs in VLAN 10 verwenden diese Adresse als Gateway.",
              },
              {
                cmd: "interface GigabitEthernet0/0.20",
                explanation: "Subinterface für VLAN 20.",
              },
              {
                cmd: "encapsulation dot1Q 20",
                explanation: "Verknüpft mit VLAN 20.",
              },
              {
                cmd: "ip address 192.168.20.1 255.255.255.0",
                explanation: "Default Gateway für VLAN 20.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs konfigurieren",
        blocks: [
          {
            device: "PC0",
            mode: "gui",
            modeLabel: "PC0 IP Configuration",
            commands: [
              {
                cmd: "IP:      192.168.10.10\nMask:    255.255.255.0\nGateway: 192.168.10.1",
                explanation: "PC0 in VLAN 10 — Gateway ist das Subinterface .10 des Routers.",
              },
            ],
          },
          {
            device: "PC1",
            mode: "gui",
            modeLabel: "PC1 IP Configuration",
            commands: [
              {
                cmd: "IP:      192.168.20.10\nMask:    255.255.255.0\nGateway: 192.168.20.1",
                explanation: "PC1 in VLAN 20 — Gateway ist Subinterface .20.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 192.168.20.10 (von PC0)", expected: "5/5 erfolgreich — Inter-VLAN Routing funktioniert" },
      { cmd: "show ip route", expected: "C 192.168.10.0/24, C 192.168.20.0/24" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. Statisches Routing
  // ─────────────────────────────────────────────────────────────
  {
    id: "static-routing",
    icon: <Shuffle size={20} />,
    title: "Statisches Routing",
    subtitle: "2 Router · 2 Switches · 4 PCs",
    difficulty: "Mittel",
    duration: "20 min",
    topology: {
      description:
        "Zwei Router verbunden über ein WAN-Subnetz. Jeder Router hat ein LAN mit eigenen PCs.",
      devices: [
        { type: "router", label: "R1 / R2", count: 2 },
        { type: "switch", label: "SW1 / SW2", count: 2 },
        { type: "pc", label: "PC0–PC3", count: 4 },
      ],
      connections: [
        "PC0 / PC1 → SW1 → R1 Gi0/0  (LAN 192.168.1.0/24)",
        "R1 Gi0/1 ↔ R2 Gi0/1  (WAN 10.0.0.0/30)",
        "R2 Gi0/0 → SW2 → PC2 / PC3  (LAN 192.168.2.0/24)",
      ],
      hint: "Lineare Topologie: PC0-PC1 → SW1 → R1 — R2 → SW2 → PC2-PC3.",
    },
    steps: [
      {
        title: "R1 konfigurieren",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown",
                explanation:
                  "LAN-Interface von R1. Ist das Default Gateway für PC0 und PC1.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nip address 10.0.0.1 255.255.255.252\nno shutdown",
                explanation:
                  "/30 Subnetz = 2 nutzbare Adressen (10.0.0.1 und 10.0.0.2). Ideal für Punkt-zu-Punkt-Links.",
              },
            ],
          },
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "ip route 192.168.2.0 255.255.255.0 10.0.0.2",
                explanation:
                  "Statische Route: 'Um das Netz 192.168.2.0/24 zu erreichen, sende Pakete an 10.0.0.2 (R2).' Next Hop ist R2's WAN-IP.",
              },
            ],
          },
        ],
      },
      {
        title: "R2 konfigurieren",
        blocks: [
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip address 192.168.2.1 255.255.255.0\nno shutdown",
                explanation: "LAN-Interface von R2.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nip address 10.0.0.2 255.255.255.252\nno shutdown",
                explanation: "WAN-Interface von R2, gegenüber R1.",
              },
            ],
          },
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "ip route 192.168.1.0 255.255.255.0 10.0.0.1",
                explanation:
                  "Rückroute! Ohne diese Route können R2-PCs zwar Anfragen schicken, aber Antworten finden keinen Weg zurück (asymmetrisches Routing).",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 192.168.2.10 (von PC0)", expected: "Pakete kommen durch beide Router" },
      { cmd: "show ip route", expected: "S 192.168.2.0/24 via 10.0.0.2" },
      { cmd: "traceroute 192.168.2.10", expected: "Hops: R1 WAN → R2 → Ziel" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. OSPF Single Area
  // ─────────────────────────────────────────────────────────────
  {
    id: "ospf",
    icon: <Globe size={20} />,
    title: "OSPF — Single Area 0",
    subtitle: "3 Router · 3 LANs",
    difficulty: "Mittel",
    duration: "25 min",
    topology: {
      description:
        "Drei Router in Dreieck-Topologie, alle in OSPF Area 0. Kein manuelles Routing nötig.",
      devices: [
        { type: "router", label: "R1 / R2 / R3", count: 3 },
        { type: "pc", label: "PC pro Router-LAN", count: 3 },
      ],
      connections: [
        "R1 Gi0/1 ↔ R2 Gi0/1  (10.0.12.0/30)",
        "R2 Gi0/2 ↔ R3 Gi0/1  (10.0.23.0/30)",
        "R1 Gi0/2 ↔ R3 Gi0/2  (10.0.13.0/30)",
        "R1 Gi0/0 → PC-LAN1  (192.168.1.0/24)",
        "R2 Gi0/0 → PC-LAN2  (192.168.2.0/24)",
        "R3 Gi0/0 → PC-LAN3  (192.168.3.0/24)",
      ],
      hint: "Dreieck aus 3 Routern. Jeder Router hat zusätzlich ein LAN-Interface mit einem PC.",
    },
    steps: [
      {
        title: "Interfaces konfigurieren (R1)",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface Gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown",
                explanation: "LAN-Interface zu PC-LAN1.",
              },
              {
                cmd: "interface Gi0/1\nip address 10.0.12.1 255.255.255.252\nno shutdown",
                explanation: "Punkt-zu-Punkt-Link zu R2.",
              },
              {
                cmd: "interface Gi0/2\nip address 10.0.13.1 255.255.255.252\nno shutdown",
                explanation: "Punkt-zu-Punkt-Link zu R3.",
              },
            ],
          },
        ],
      },
      {
        title: "OSPF aktivieren (R1)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "router ospf 1",
                explanation:
                  "Startet OSPF-Prozess mit ID 1. Prozess-ID ist lokal, muss nicht auf allen Routern gleich sein.",
              },
              {
                cmd: "router-id 1.1.1.1",
                explanation:
                  "Manueller Router-ID. Wird im OSPF-Nachbarschaftsprozess zur Identifikation genutzt. Best Practice: Loopback-ähnliche IP setzen.",
              },
              {
                cmd: "network 192.168.1.0 0.0.0.255 area 0",
                explanation:
                  "Advertised 192.168.1.0/24 in Area 0. Wildcard-Maske ist das Gegenteil der Subnetzmaske (255.255.255.0 → 0.0.0.255).",
              },
              {
                cmd: "network 10.0.12.0 0.0.0.3 area 0",
                explanation:
                  "Advertised den /30-Link zu R2. 0.0.0.3 = Wildcard für /30.",
              },
              {
                cmd: "network 10.0.13.0 0.0.0.3 area 0",
                explanation: "Advertised den /30-Link zu R3.",
              },
              {
                cmd: "passive-interface GigabitEthernet0/0",
                explanation:
                  "LAN-Interface als passiv markieren — keine OSPF-Hello-Pakete ins LAN gesendet. Sicherer, weniger Traffic.",
              },
            ],
          },
        ],
      },
      {
        title: "R2 & R3 analog konfigurieren",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "interface Gi0/0\nip address 192.168.2.1 255.255.255.0\nno shutdown\ninterface Gi0/1\nip address 10.0.12.2 255.255.255.252\nno shutdown\ninterface Gi0/2\nip address 10.0.23.1 255.255.255.252\nno shutdown",
                explanation: "Interfaces von R2.",
              },
              {
                cmd: "router ospf 1\nrouter-id 2.2.2.2\nnetwork 192.168.2.0 0.0.0.255 area 0\nnetwork 10.0.12.0 0.0.0.3 area 0\nnetwork 10.0.23.0 0.0.0.3 area 0\npassive-interface Gi0/0",
                explanation: "OSPF auf R2.",
              },
            ],
          },
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              {
                cmd: "interface Gi0/0\nip address 192.168.3.1 255.255.255.0\nno shutdown\ninterface Gi0/1\nip address 10.0.13.2 255.255.255.252\nno shutdown\ninterface Gi0/2\nip address 10.0.23.2 255.255.255.252\nno shutdown",
                explanation: "Interfaces von R3.",
              },
              {
                cmd: "router ospf 1\nrouter-id 3.3.3.3\nnetwork 192.168.3.0 0.0.0.255 area 0\nnetwork 10.0.13.0 0.0.0.3 area 0\nnetwork 10.0.23.0 0.0.0.3 area 0\npassive-interface Gi0/0",
                explanation: "OSPF auf R3.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ospf neighbor", expected: "Alle Nachbarn im FULL-State" },
      { cmd: "show ip route ospf", expected: "O 192.168.2.0, O 192.168.3.0 in Routing-Tabelle" },
      { cmd: "ping 192.168.3.10 (von PC-LAN1)", expected: "Automatisch geroutet über OSPF" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. DHCP-Server auf Router
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp",
    icon: <HardDrives size={20} />,
    title: "DHCPv4 auf Router",
    subtitle: "Router · Switch · 2 PCs",
    difficulty: "Anfänger",
    duration: "10 min",
    topology: {
      description:
        "Der Router fungiert als DHCP-Server. PCs erhalten automatisch IP-Adressen.",
      devices: [
        { type: "router", label: "Router0", count: 1 },
        { type: "switch", label: "Switch0", count: 1 },
        { type: "pc", label: "PC0 / PC1 (DHCP)", count: 2 },
      ],
      connections: [
        "PC0 / PC1 → Switch0",
        "Switch0 → Router0 Gi0/0",
      ],
      hint: "Gleiche Topologie wie Basic-IP. PCs auf 'DHCP' stellen in IP Configuration.",
    },
    steps: [
      {
        title: "DHCP-Pool auf Router konfigurieren",
        blocks: [
          {
            device: "Router0",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown",
                explanation: "Router-Interface als Default Gateway.",
              },
            ],
          },
          {
            device: "Router0",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "ip dhcp excluded-address 192.168.1.1 192.168.1.10",
                explanation:
                  "Reserviert .1–.10 für statische Geräte (Router, Server). Diese IPs werden NICHT per DHCP vergeben.",
              },
              {
                cmd: "ip dhcp pool LAN_POOL",
                explanation:
                  "Erstellt einen DHCP-Pool namens LAN_POOL. Prompt wechselt zu R1(dhcp-config)#.",
              },
              {
                cmd: "network 192.168.1.0 255.255.255.0",
                explanation: "Definiert das Subnetz, aus dem IPs vergeben werden.",
              },
              {
                cmd: "default-router 192.168.1.1",
                explanation:
                  "Router teilt Clients das Default Gateway mit — wird mit DHCP-Option 3 übertragen.",
              },
              {
                cmd: "dns-server 8.8.8.8",
                explanation:
                  "DNS-Server-Adresse für Clients (DHCP-Option 6). Hier: Google DNS.",
              },
              {
                cmd: "lease 7",
                explanation:
                  "Lease-Dauer: 7 Tage. Nach Ablauf muss der Client die IP erneuern.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs auf DHCP setzen",
        blocks: [
          {
            device: "PC0",
            mode: "gui",
            modeLabel: "PC0 Desktop → IP Configuration",
            commands: [
              {
                cmd: "◉ DHCP  (Radio-Button anklicken)",
                explanation:
                  "PC schickt DHCP Discover-Broadcast. Router antwortet mit Offer → Request → Acknowledge (DORA-Prozess).",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip dhcp pool", expected: "LAN_POOL, Leases: 2" },
      { cmd: "show ip dhcp binding", expected: "192.168.1.11 → PC0 MAC" },
      { cmd: "ipconfig (auf PC)", expected: "IP aus Pool 192.168.1.11 oder .12" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. NAT / PAT (Overload)
  // ─────────────────────────────────────────────────────────────
  {
    id: "nat-pat",
    icon: <Desktop size={20} />,
    title: "NAT / PAT (Overload)",
    subtitle: "Router · Switch · 2 PCs · Cloud",
    difficulty: "Mittel",
    duration: "20 min",
    topology: {
      description:
        "PCs mit privaten IPs teilen sich eine öffentliche IP durch PAT (Port-Übersetung).",
      devices: [
        { type: "router", label: "R1 (NAT-Router)", count: 1 },
        { type: "switch", label: "SW1", count: 1 },
        { type: "pc", label: "PC0 / PC1 (privat)", count: 2 },
        { type: "server", label: "Web-Server (öffentlich)", count: 1 },
      ],
      connections: [
        "PC0 / PC1 → SW1 → R1 Gi0/0  (innen: 192.168.1.0/24)",
        "R1 Gi0/1 → Web-Server  (aussen: 200.0.0.0/30)",
      ],
      hint: "R1 trennt innen von außen. Gi0/0 = inside, Gi0/1 = outside.",
    },
    steps: [
      {
        title: "Interfaces & NAT-Richtungen setzen",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nip nat inside\nno shutdown",
                explanation:
                  "'ip nat inside' markiert dieses Interface als LAN-Seite. Pakete, die hier reinkommen, werden übersetzt.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nip address 200.0.0.1 255.255.255.252\nip nat outside\nno shutdown",
                explanation:
                  "'ip nat outside' markiert die WAN-Seite. Übersetzte Pakete verlassen das Netz hier mit der öffentlichen IP.",
              },
            ],
          },
        ],
      },
      {
        title: "Access-List + PAT konfigurieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "access-list 1 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Standard-ACL 1: Erlaubt alle Adressen aus 192.168.1.0/24. Nur diese werden übersetzt.",
              },
              {
                cmd: "ip nat inside source list 1 interface GigabitEthernet0/1 overload",
                explanation:
                  "'overload' = PAT. Viele private IPs teilen sich EINE öffentliche IP (200.0.0.1) durch unterschiedliche Portnummern. Ohne 'overload' wäre es 1:1-NAT.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip nat translations", expected: "Pro PC eine Zeile mit privat:port → öffentlich:port" },
      { cmd: "show ip nat statistics", expected: "Hits steigen bei ping" },
      { cmd: "ping 200.0.0.2 (von PC0)", expected: "Pakete werden übersetzt" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. SSH-Konfiguration
  // ─────────────────────────────────────────────────────────────
  {
    id: "ssh",
    icon: <Key size={20} />,
    title: "SSH Remote-Zugriff",
    subtitle: "Router · Admin-PC",
    difficulty: "Anfänger",
    duration: "10 min",
    topology: {
      description:
        "SSH verschlüsselt den Administrationszugriff (sicherer als Telnet).",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "pc", label: "Admin-PC", count: 1 },
      ],
      connections: ["Admin-PC → R1 Gi0/0 direkt oder via Switch"],
      hint: "Einfachste Topologie: Admin-PC direkt an Router.",
    },
    steps: [
      {
        title: "SSH auf Router aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "hostname R1",
                explanation:
                  "SSH benötigt zwingend einen Hostnamen — sonst kann kein RSA-Schlüssel generiert werden.",
              },
              {
                cmd: "ip domain-name lab.local",
                explanation:
                  "Domain-Name ist ebenfalls Pflicht für den RSA-Schlüssel-Generierungsprozess.",
              },
              {
                cmd: "crypto key generate rsa modulus 2048",
                explanation:
                  "Generiert ein RSA-Schlüsselpaar. Modulus 2048 = sicher. Kleinere Werte (768, 1024) sind veraltet. Dauert einen Moment.",
              },
              {
                cmd: "ip ssh version 2",
                explanation:
                  "Erzwingt SSHv2 (SSHv1 hat Sicherheitslücken). Best Practice: immer v2.",
              },
              {
                cmd: "username admin privilege 15 secret cisco123",
                explanation:
                  "Erstellt lokalen Benutzer 'admin' mit Privilege Level 15 (= voller Zugriff) und verschlüsseltem Passwort.",
              },
            ],
          },
          {
            device: "R1",
            mode: "line",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "line vty 0 4",
                explanation:
                  "Konfiguriert virtuelle Terminals 0–4 (5 gleichzeitige Verbindungen).",
              },
              {
                cmd: "login local",
                explanation:
                  "Authentifizierung über die lokale Datenbank (username/password oben definiert).",
              },
              {
                cmd: "transport input ssh",
                explanation:
                  "Erlaubt NUR SSH. Verhindert unsicheres Telnet. Ohne diese Zeile wäre Telnet noch möglich.",
              },
              {
                cmd: "exec-timeout 5 0",
                explanation:
                  "Session-Timeout nach 5 Minuten Inaktivität — Sicherheitsbest Practice.",
              },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown",
                explanation: "Management-Interface des Routers.",
              },
            ],
          },
        ],
      },
      {
        title: "SSH-Verbindung testen (Admin-PC)",
        blocks: [
          {
            device: "Admin-PC",
            mode: "gui",
            modeLabel: "Admin-PC Desktop → Terminal (oder Command Prompt)",
            commands: [
              {
                cmd: "ssh -l admin 192.168.1.1",
                explanation:
                  "-l admin = Login-Name. Passwort: cisco123. Nach erfolgreichem Login: Prompt R1#",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ssh", expected: "SSH Enabled - version 2.0" },
      { cmd: "show users", expected: "admin  vty0  SSH" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. Standard ACL
  // ─────────────────────────────────────────────────────────────
  {
    id: "acl-standard",
    icon: <Shield size={20} />,
    title: "Standard ACL",
    subtitle: "Router · 2 LANs",
    difficulty: "Mittel",
    duration: "15 min",
    topology: {
      description:
        "Standard-ACL filtert nach Quell-IP. Platzierung: so nah wie möglich am Ziel.",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "pc", label: "PC0 (erlaubt) / PC1 (geblockt)", count: 2 },
        { type: "server", label: "Server", count: 1 },
      ],
      connections: [
        "PC0 (192.168.1.10) → R1 Gi0/0",
        "PC1 (192.168.2.10) → R1 Gi0/1",
        "R1 Gi0/2 → Server (192.168.3.100)",
      ],
      hint: "R1 hat 3 Interfaces: LAN1 (PC0), LAN2 (PC1), Server-LAN.",
    },
    steps: [
      {
        title: "Standard-ACL erstellen und anwenden",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "access-list 10 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Erlaubt komplettes Netz 192.168.1.0/24 (PC0-LAN). Zahl 10 = Standard-ACL (1–99).",
              },
              {
                cmd: "access-list 10 deny 192.168.2.0 0.0.0.255",
                explanation:
                  "Blockiert PC1-LAN. Am Ende jeder ACL steht implizit 'deny any' — aber explizit ist klarer.",
              },
              {
                cmd: "access-list 10 permit any",
                explanation:
                  "Erlaubt alles andere (z. B. andere Netze). Optional — ohne diese Zeile gilt implicit deny.",
              },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2",
                explanation:
                  "Standard-ACLs am Ziel-Interface platzieren (so nah wie möglich am Ziel = Ausgangs-Interface Richtung Server).",
              },
              {
                cmd: "ip access-group 10 out",
                explanation:
                  "'out' = Pakete werden gefiltert, BEVOR sie dieses Interface verlassen (Richtung Server). 'in' würde am Eingangs-Interface filtern.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip access-lists", expected: "Permit-/Deny-Zähler steigen bei Traffic" },
      { cmd: "ping 192.168.3.100 (von PC0)", expected: "!!!!!  — erlaubt" },
      { cmd: "ping 192.168.3.100 (von PC1)", expected: "UUUUU — geblockt" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. Extended ACL
  // ─────────────────────────────────────────────────────────────
  {
    id: "acl-extended",
    icon: <Shield size={20} weight="fill" />,
    title: "Extended ACL",
    subtitle: "Router · 2 Hosts · Web-Server",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    topology: {
      description:
        "Extended ACL filtert nach Quelle, Ziel, Protokoll und Port. Platzierung: so nah wie möglich an der Quelle.",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
        { type: "server", label: "Web-Server (Port 80)", count: 1 },
      ],
      connections: ["PC0 / PC1 → R1 Gi0/0", "R1 Gi0/1 → Web-Server"],
      hint: "Gleiche Topologie wie Standard-ACL. Extended ACL am Quell-Interface (Gi0/0 in).",
    },
    steps: [
      {
        title: "Extended ACL erstellen",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "ip access-list extended BLOCK_PC1_HTTP",
                explanation:
                  "Erstellt benannte Extended ACL. Benannte ACLs sind besser wartbar als nummerierte. Prompt: R1(config-ext-nacl)#",
              },
              {
                cmd: "deny tcp host 192.168.1.20 host 192.168.2.100 eq 80",
                explanation:
                  "Blockiert TCP-Port 80 von PC1 (192.168.1.20) zum Web-Server (192.168.2.100). 'host' = exakte IP ohne Wildcard. 'eq 80' = HTTP.",
              },
              {
                cmd: "permit ip any any",
                explanation:
                  "Erlaubt alles andere. Ohne diese Zeile würde alles geblockt (implicit deny).",
              },
              {
                cmd: "exit",
                explanation: "Verlässt ACL-Konfigurationsmodus.",
              },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip access-group BLOCK_PC1_HTTP in",
                explanation:
                  "Extended ACL so nah wie möglich an der QUELLE. 'in' = Pakete werden beim Eingang auf Gi0/0 gefiltert — bevor sie geroutet werden. Spart Router-Ressourcen.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip access-lists BLOCK_PC1_HTTP", expected: "deny: Treffer-Zähler > 0" },
      { cmd: "ping 192.168.2.100 (von PC1)", expected: "ping funktioniert (ICMP, nicht HTTP)" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 11. EtherChannel (LACP)
  // ─────────────────────────────────────────────────────────────
  {
    id: "etherchannel",
    icon: <Lightning size={20} />,
    title: "EtherChannel (LACP)",
    subtitle: "2 Switches · gebündelte Links",
    difficulty: "Fortgeschritten",
    duration: "15 min",
    topology: {
      description:
        "Zwei physische Links zwischen Switches werden zu einem logischen Port-Channel gebündelt.",
      devices: [
        { type: "switch", label: "SW1 / SW2", count: 2 },
      ],
      connections: [
        "SW1 Fa0/1 ↔ SW2 Fa0/1  (Link 1)",
        "SW1 Fa0/2 ↔ SW2 Fa0/2  (Link 2)",
      ],
      hint: "Zwei Switches mit 2 parallelen Copper-Kabeln verbinden.",
    },
    steps: [
      {
        title: "EtherChannel auf SW1 konfigurieren",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "interface range FastEthernet0/1 - 2",
                explanation:
                  "'interface range' konfiguriert mehrere Interfaces gleichzeitig. Ports Fa0/1 und Fa0/2 gemeinsam.",
              },
              {
                cmd: "channel-group 1 mode active",
                explanation:
                  "'active' = LACP aktiv. SW1 sendet LACP-Pakete und wartet auf Antwort. 'passive' wartet nur. Für LACP braucht mindestens eine Seite 'active'.",
              },
              {
                cmd: "exit",
                explanation: "Verlässt Interface-Range-Modus.",
              },
              {
                cmd: "interface Port-channel1",
                explanation:
                  "Konfiguriert den logischen Port-Channel. Muss mit den Mitglieds-Interfaces übereinstimmen.",
              },
              {
                cmd: "switchport mode trunk",
                explanation:
                  "Port-Channel als Trunk konfigurieren. Die Mitglieds-Interfaces erben diese Einstellung.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2 spiegelgleich konfigurieren",
        blocks: [
          {
            device: "SW2",
            mode: "interface",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "interface range FastEthernet0/1 - 2\nchannel-group 1 mode active\nexit\ninterface Port-channel1\nswitchport mode trunk",
                explanation:
                  "Identische Konfiguration auf SW2. Beide Seiten 'active' ist OK bei LACP.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show etherchannel summary", expected: "Po1 (SU) — S=Layer2, U=in use" },
      { cmd: "show interfaces Port-channel1", expected: "Bandbreite = 2× Fa0 = 200Mbit/s" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 12. IPv6 Grundkonfiguration
  // ─────────────────────────────────────────────────────────────
  {
    id: "ipv6",
    icon: <Globe size={20} weight="fill" />,
    title: "IPv6 Grundkonfiguration",
    subtitle: "2 Router · 2 PCs",
    difficulty: "Mittel",
    duration: "15 min",
    topology: {
      description:
        "IPv6 unicast routing zwischen zwei Routern und ihren LANs.",
      devices: [
        { type: "router", label: "R1 / R2", count: 2 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "PC0 → R1 Gi0/0  (2001:db8:1::/64)",
        "R1 Gi0/1 ↔ R2 Gi0/1  (2001:db8:12::/64)",
        "R2 Gi0/0 → PC1  (2001:db8:2::/64)",
      ],
      hint: "Gleiche Topologie wie statisches Routing, aber mit IPv6-Adressen.",
    },
    steps: [
      {
        title: "IPv6 Unicast Routing aktivieren + R1",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "ipv6 unicast-routing",
                explanation:
                  "Aktiviert IPv6-Routing auf dem Router. Standardmäßig deaktiviert — ohne diesen Befehl routet der Router kein IPv6!",
              },
              {
                cmd: "interface GigabitEthernet0/0\nipv6 address 2001:db8:1::1/64\nno shutdown",
                explanation:
                  "Setzt IPv6-Adresse. ::1 = komprimierte Form von 0000:0000:0000:0001. /64 ist Standard-Präfixlänge für LANs.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nipv6 address 2001:db8:12::1/64\nno shutdown",
                explanation: "WAN-Link zu R2.",
              },
              {
                cmd: "ipv6 route 2001:db8:2::/64 2001:db8:12::2",
                explanation:
                  "Statische IPv6-Route. Syntax ähnlich wie IPv4: Zielnetz + Next-Hop. Next-Hop ist R2's WAN-IPv6.",
              },
            ],
          },
        ],
      },
      {
        title: "R2 konfigurieren",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "ipv6 unicast-routing",
                explanation: "Pflicht auf jedem IPv6-Router.",
              },
              {
                cmd: "interface GigabitEthernet0/0\nipv6 address 2001:db8:2::1/64\nno shutdown",
                explanation: "LAN-Interface von R2.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nipv6 address 2001:db8:12::2/64\nno shutdown",
                explanation: "WAN-Interface gegenüber R1.",
              },
              {
                cmd: "ipv6 route 2001:db8:1::/64 2001:db8:12::1",
                explanation: "Rückroute zu R1's LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs konfigurieren",
        blocks: [
          {
            device: "PC0",
            mode: "gui",
            modeLabel: "PC0 Desktop → IP Configuration",
            commands: [
              {
                cmd: "IPv6 Address:    2001:db8:1::10/64\nIPv6 Gateway:    2001:db8:1::1",
                explanation: "PC0 mit manueller IPv6-Adresse.",
              },
            ],
          },
          {
            device: "PC1",
            mode: "gui",
            modeLabel: "PC1 Desktop → IP Configuration",
            commands: [
              {
                cmd: "IPv6 Address:    2001:db8:2::10/64\nIPv6 Gateway:    2001:db8:2::1",
                explanation: "PC1 mit manueller IPv6-Adresse.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ipv6 route", expected: "S 2001:db8:2::/64 via Gi0/1" },
      { cmd: "ping ipv6 2001:db8:2::10", expected: "!!!!! von PC0 zu PC1" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 13. Spanning Tree (PortFast + BPDU Guard)
  // ─────────────────────────────────────────────────────────────
  {
    id: "stp",
    icon: <BookOpen size={20} />,
    title: "STP — PortFast & BPDU Guard",
    subtitle: "2 Switches · PCs",
    difficulty: "Mittel",
    duration: "15 min",
    topology: {
      description:
        "STP verhindert Loops. PortFast beschleunigt den Port-Übergang für Endgeräte.",
      devices: [
        { type: "switch", label: "SW1 (Root) / SW2", count: 2 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "SW1 Gi0/1 ↔ SW2 Gi0/1",
        "PC0 → SW1 Fa0/1",
        "PC1 → SW2 Fa0/1",
      ],
      hint: "SW1 wird Root Bridge durch niedrigere Priority.",
    },
    steps: [
      {
        title: "Root Bridge und PortFast konfigurieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "spanning-tree vlan 1 priority 4096",
                explanation:
                  "Setzt STP-Priority. Niedrigster Wert = Root Bridge. Standard ist 32768. Empfohlene Werte: Vielfache von 4096.",
              },
              {
                cmd: "interface FastEthernet0/1\nspanning-tree portfast\nspanning-tree bpduguard enable",
                explanation:
                  "PortFast: Port überspringt Listening/Learning-Phasen (spart ~30s Wartezeit). Nur für Endgeräte! BPDU Guard: Wenn ein Switch an diesem Port angeschlossen wird, wird der Port sofort deaktiviert (err-disabled) — schützt vor Loop-Einschleusung.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "interface FastEthernet0/1\nspanning-tree portfast\nspanning-tree bpduguard enable",
                explanation: "Gleiche Sicherheitskonfiguration für PC1-Port.",
              },
              {
                cmd: "spanning-tree portfast default",
                explanation:
                  "Aktiviert PortFast global für alle Access-Ports. Effizient wenn alle Non-Trunk-Ports zu Endgeräten gehen.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show spanning-tree", expected: "SW1: Root Bridge, SW2: Port blocked" },
      { cmd: "show spanning-tree vlan 1 detail", expected: "Root ID Priority 4096 SW1 MAC" },
    ],
  },
];

// ── Hilfsfunktionen ───────────────────────────────────────────

function difficultyColor(d: LabScenario["difficulty"]) {
  if (d === "Anfänger") return "text-emerald-400 bg-emerald-400/10";
  if (d === "Mittel") return "text-amber-400 bg-amber-400/10";
  return "text-red-400 bg-red-400/10";
}

// ── CopyButton ────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      title="Befehle kopieren"
    >
      {copied ? (
        <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Kopiert</span></>
      ) : (
        <><Copy size={13} /><span>Kopieren</span></>
      )}
    </button>
  );
}

// ── CommandBlock-Komponente ───────────────────────────────────

function CommandBlockView({ block }: { block: CommandBlock }) {
  const [expanded, setExpanded] = useState(true);
  const allCommands = block.commands.map((c) => c.cmd).join("\n");

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden mb-3">
      {/* Block-Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-cyan-400 font-mono">
            {block.device}
          </span>
          <span className="text-xs text-slate-500 font-mono">{block.modeLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <CopyButton text={allCommands} />
          <button
            className="text-xs text-slate-500 hover:text-white px-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Commands */}
      {expanded && (
        <div className="divide-y divide-slate-800">
          {block.commands.map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-0">
              {/* CLI-Befehl */}
              <div className="flex items-start gap-2 bg-slate-950 px-3 py-2 sm:w-[45%] min-w-0">
                <span className="text-slate-600 select-none mt-0.5">›</span>
                <pre className="text-green-300 font-mono text-xs whitespace-pre-wrap break-all flex-1 leading-relaxed">
                  {c.cmd}
                </pre>
                <CopyButton text={c.cmd} />
              </div>
              {/* Erklärung */}
              <div className="bg-slate-900/60 px-3 py-2 sm:flex-1 text-xs text-slate-300 leading-relaxed border-l border-slate-800">
                <span className="text-slate-500 mr-1">ℹ</span>
                {c.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Export-Funktionen ────────────────────────────────────────

function buildLabText(lab: LabScenario): string {
  const sep = "═".repeat(60);
  const line = "─".repeat(60);
  let out = `${sep}\nCisco IOS Lab-Szenario\n${sep}\n`;
  out += `Titel:       ${lab.title}\n`;
  out += `Geräte:      ${lab.subtitle}\n`;
  out += `Schwierigkeit: ${lab.difficulty}  |  Dauer: ${lab.duration}\n`;
  out += `${sep}\n\n`;

  // Topologie
  out += `① TOPOLOGIE (Drag & Drop in Packet Tracer)\n${line}\n`;
  out += `${lab.topology.description}\n\n`;
  out += `Geräte:\n`;
  lab.topology.devices.forEach((d) => {
    out += `  ${d.count}x ${d.type}  (${d.label})\n`;
  });
  out += `\nVerbindungen:\n`;
  lab.topology.connections.forEach((c) => out += `  ↳ ${c}\n`);
  out += `\nHinweis: ${lab.topology.hint}\n\n`;

  // CLI-Schritte
  out += `② CLI-KONFIGURATION\n${line}\n`;
  lab.steps.forEach((step, si) => {
    out += `\n[Schritt ${si + 1}] ${step.title}\n`;
    step.blocks.forEach((block) => {
      out += `\n  Gerät: ${block.device}  (${block.modeLabel})\n`;
      block.commands.forEach((c) => {
        const cmdLines = c.cmd.split("\n");
        cmdLines.forEach((cl) => out += `  ${block.modeLabel} ${cl}\n`);
        out += `  → ${c.explanation}\n\n`;
      });
    });
  });

  // Verifikation
  out += `③ VERIFIKATION\n${line}\n`;
  lab.verifyCommands.forEach((v) => {
    out += `  $ ${v.cmd}\n    → Erwartet: ${v.expected}\n\n`;
  });

  out += `${sep}\nGeneriert von IT Training Canvas – ${new Date().toLocaleDateString("de-DE")}\n${sep}\n`;
  return out;
}

function downloadText(lab: LabScenario) {
  const content = buildLabText(lab);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lab_${lab.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printLabAsPdf(lab: LabScenario) {
  const content = buildLabText(lab);
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>${lab.title} — Cisco IOS Lab</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.6;
      color: #111;
      padding: 20mm 18mm;
      background: #fff;
    }
    h1 { font-size: 16px; margin-bottom: 4px; }
    h2 { font-size: 13px; margin: 14px 0 4px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
    h3 { font-size: 11px; margin: 10px 0 3px; color: #444; }
    .meta { font-size: 10px; color: #555; margin-bottom: 12px; }
    .badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: bold;
      margin-right: 6px;
    }
    .badge-easy   { background:#d1fae5; color:#065f46; }
    .badge-medium { background:#fef3c7; color:#92400e; }
    .badge-hard   { background:#fee2e2; color:#991b1b; }
    .section { margin-top: 14px; }
    .topology-box {
      border: 1px solid #0891b2;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 12px;
      background: #f0f9ff;
    }
    .hint-box {
      border: 1px solid #d97706;
      border-radius: 4px;
      padding: 6px 10px;
      background: #fffbeb;
      font-size: 10px;
      margin-top: 8px;
      color: #78350f;
    }
    .device-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
    .device-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 2px 7px;
      font-size: 10px;
    }
    .conn-line { font-size: 10px; color: #475569; margin: 2px 0 2px 12px; }
    .step-header {
      background: #e0f2fe;
      border-left: 3px solid #0284c7;
      padding: 4px 8px;
      margin: 10px 0 6px;
      font-weight: bold;
      font-size: 11px;
    }
    .block {
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .block-header {
      background: #f8fafc;
      padding: 3px 8px;
      font-size: 10px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
    }
    .cmd-row {
      display: flex;
      border-bottom: 1px solid #f1f5f9;
    }
    .cmd-row:last-child { border-bottom: none; }
    .cmd-cell {
      width: 44%;
      padding: 4px 8px;
      background: #0f172a;
      color: #86efac;
      font-size: 10px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .exp-cell {
      flex: 1;
      padding: 4px 8px;
      font-size: 10px;
      color: #334155;
      background: #fff;
    }
    .verify-box {
      border: 1px solid #10b981;
      border-radius: 5px;
      padding: 8px 12px;
      background: #f0fdf4;
      margin-top: 10px;
    }
    .verify-row { margin: 4px 0; font-size: 10px; }
    .verify-cmd { font-family: monospace; color: #065f46; font-weight: bold; }
    .verify-exp { color: #374151; margin-left: 8px; }
    .footer {
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 9px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 15mm 12mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${lab.title}</h1>
  <div class="meta">
    <span class="badge ${lab.difficulty === 'Anfänger' ? 'badge-easy' : lab.difficulty === 'Mittel' ? 'badge-medium' : 'badge-hard'}">${lab.difficulty}</span>
    ${lab.subtitle} &nbsp;|&nbsp; ⏱ ${lab.duration}
  </div>

  <div class="section topology-box">
    <strong>① Topologie aufbauen (Drag &amp; Drop in Packet Tracer)</strong><br/>
    <span style="font-size:10px;color:#374151">${lab.topology.description}</span>
    <div class="device-list">
      ${lab.topology.devices.map(d => `<span class="device-badge"><strong>${d.count}×</strong> ${d.type} (${d.label})</span>`).join("")}
    </div>
    ${lab.topology.connections.map(c => `<div class="conn-line">↳ ${c}</div>`).join("")}
    <div class="hint-box">💡 ${lab.topology.hint}</div>
  </div>

  <h2>② CLI-Konfiguration</h2>
  ${lab.steps.map((step, si) => `
    <div class="step-header">Schritt ${si + 1}: ${step.title}</div>
    ${step.blocks.map(block => `
      <div class="block">
        <div class="block-header">
          <span><strong>${block.device}</strong></span>
          <span style="color:#64748b">${block.modeLabel}</span>
        </div>
        ${block.commands.map(c => `
          <div class="cmd-row">
            <div class="cmd-cell">${c.cmd.replace(/\n/g, "<br/>")}</div>
            <div class="exp-cell">${c.explanation}</div>
          </div>
        `).join("")}
      </div>
    `).join("")}
  `).join("")}

  <div class="verify-box">
    <strong style="color:#065f46">③ Verifikation — Lab erfolgreich wenn:</strong><br/>
    ${lab.verifyCommands.map(v => `
      <div class="verify-row">
        <span class="verify-cmd">${v.cmd}</span>
        <span class="verify-exp">→ ${v.expected}</span>
      </div>
    `).join("")}
  </div>

  <div class="footer">IT Training Canvas &mdash; ${new Date().toLocaleDateString("de-DE")} &mdash; ${lab.title}</div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

// ── Haupt-Dialog ──────────────────────────────────────────────

interface LabScenariosDialogProps {
  open: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
}

export function LabScenariosDialog({ open, onClose, theme = "dark" }: LabScenariosDialogProps) {
  const [selectedId, setSelectedId] = useState(LABS[0].id);
  const lab = LABS.find((l) => l.id === selectedId) ?? LABS[0];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "flex flex-col w-full max-w-6xl h-[90vh] rounded-2xl border shadow-2xl overflow-hidden",
          theme === "dark"
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-slate-200",
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 shrink-0 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Cisco IOS — Lab-Szenarien
              </h2>
              <p className="text-xs text-slate-400">
                Topologie per Drag & Drop erstellen → CLI-Befehle eingeben
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => downloadText(lab)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Als .txt herunterladen"
            >
              <FileText size={15} />
              TXT
            </button>
            <button
              onClick={() => printLabAsPdf(lab)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
              title="Als PDF drucken / speichern"
            >
              <FilePdf size={15} />
              PDF
            </button>
            <div className="w-px h-5 bg-slate-700 mx-1" />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">
          {/* ── Szenario-Liste ── */}
          <div className="w-56 shrink-0 border-r border-slate-700 overflow-y-auto bg-slate-900/50">
            {LABS.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={cn(
                  "w-full text-left px-3 py-3 border-b border-slate-800 transition-colors",
                  l.id === selectedId
                    ? "bg-cyan-500/15 border-l-2 border-l-cyan-400"
                    : "hover:bg-slate-800/50",
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn("shrink-0", l.id === selectedId ? "text-cyan-400" : "text-slate-400")}>
                    {l.icon}
                  </span>
                  <span className="text-xs font-semibold text-white leading-tight">
                    {l.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", difficultyColor(l.difficulty))}>
                    {l.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-500">{l.duration}</span>
                </div>
              </button>
            ))}
          </div>

          {/* ── Detail-Ansicht ── */}
          <ScrollArea className="flex-1 min-w-0">
            <div className="p-5 space-y-5">
              {/* Titel */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{lab.title}</h3>
                  <p className="text-sm text-slate-400">{lab.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs px-2 py-1 rounded font-medium", difficultyColor(lab.difficulty))}>
                    {lab.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    ⏱ {lab.duration}
                  </span>
                </div>
              </div>

              {/* ── Schritt 0: Topologie-Aufbau ── */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-cyan-400 text-sm font-bold">① Topologie im Canvas aufbauen (Drag & Drop)</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{lab.topology.description}</p>

                {/* Geräte */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {lab.topology.devices.map((d, i) => (
                    <span key={i} className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300">
                      <span className="text-cyan-400 font-bold">{d.count}×</span> {d.type} <span className="text-slate-500">({d.label})</span>
                    </span>
                  ))}
                </div>

                {/* Verbindungen */}
                <div className="space-y-1 mb-3">
                  {lab.topology.connections.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-slate-600 mt-0.5 shrink-0">↳</span>
                      <span className="font-mono">{c}</span>
                    </div>
                  ))}
                </div>

                {/* Hint */}
                <div className="flex items-start gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 text-xs text-amber-300">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>{lab.topology.hint}</span>
                </div>
              </div>

              {/* ── CLI-Schritte ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white text-sm font-bold">② CLI-Konfiguration</span>
                </div>

                {lab.steps.map((step, si) => (
                  <div key={si} className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold shrink-0">
                        {si + 1}
                      </span>
                      <span className="text-sm font-semibold text-white">{step.title}</span>
                    </div>
                    {step.blocks.map((block, bi) => (
                      <CommandBlockView key={bi} block={block} />
                    ))}
                  </div>
                ))}
              </div>

              {/* ── Verifikation ── */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-400 text-sm font-bold">③ Verifikation — Lab erfolgreich wenn:</span>
                </div>
                <div className="space-y-2">
                  {lab.verifyCommands.map((v, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2 bg-slate-950 rounded px-2 py-1">
                        <CopyButton text={v.cmd} />
                        <code className="text-green-300 font-mono text-xs">{v.cmd}</code>
                      </div>
                      <span className="text-xs text-slate-400">→ {v.expected}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
