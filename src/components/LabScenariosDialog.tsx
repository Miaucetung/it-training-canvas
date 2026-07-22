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
  Package,
  Shield,
  Shuffle,
  Stack,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { exportLabForPacketTracer } from "@/lib/packet-tracer-export";
import { ExhibitRenderer } from "@/components/exhibits/ExhibitRenderer";
import type { ExhibitData } from "@/types/exhibit";

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
  difficulty: "Drill" | "Anfänger" | "Mittel" | "Fortgeschritten";
  duration: string;
  /** Warum dieses Lab? Welches Problem es löst und wofür das Szenario gebraucht wird. */
  context?: { problem: string; purpose: string };
  topology: {
    description: string;
    devices: Array<{ type: string; label: string; count: number }>;
    connections: string[];
    hint: string;
    /** Optionales visuelles Netzwerkdiagramm (SVG/JSX), wird unter dem Hint angezeigt. */
    topologyDiagram?: React.ReactNode;
  };
  steps: LabStep[];
  verifyCommands: Array<{ cmd: string; expected: string; explanation?: string }>;
  /** Kurz-Glossar der im Lab verwendeten Fachbegriffe. */
  glossary?: Array<{ term: string; def: string }>;
  /** Strukturierte Exhibits (Topologie/Adressplan/CLI), gerendert über ExhibitRenderer. */
  exhibits?: ExhibitData[];
}

// ── Lab-Szenarien ─────────────────────────────────────────────

export const LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // DRILL-LABS — stumpfe Wiederholung für Muskelgedächtnis
  // ─────────────────────────────────────────────────────────────
  {
    id: "drill-grundkonfig",
    icon: <Check size={20} />,
    title: "Drill: Grundkonfiguration ×3",
    subtitle: "Identischer Basis-Block auf R1, SW1 und SW2",
    difficulty: "Drill",
    duration: "15 min",
    context: {
      problem:
        "Auf jedem neuen Cisco-Gerät müssen dieselben Grundeinstellungen gesetzt werden — Name, Passwörter, Banner, Speichern. Vergessene oder vertauschte Schritte sind die häufigste Anfänger-Fehlerquelle.",
      purpose:
        "Reines Wiederholungstraining, damit die Grundkonfig-Sequenz blind sitzt. Sie ist die Voraussetzung für jedes weitere Lab und jede Praxisaufgabe an realen Geräten.",
    },
    topology: {
      description:
        "Reines Wiederholungstraining: Derselbe Grundkonfigurations-Block wird dreimal hintereinander eingetippt — auf einem Router und zwei Switches. Ziel: die Sequenz sitzt blind.",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "switch", label: "SW1 / SW2", count: 2 },
      ],
      connections: [
        "Keine Verkabelung nötig — jedes Gerät wird einzeln konfiguriert",
      ],
      hint: "Nicht kopieren! Jeden Block von Hand tippen — genau darum geht es. Reihenfolge laut sagen: Hostname → Secret → Console → VTY → Banner → Speichern.",
    },
    steps: [
      {
        title: "Runde 1: R1 komplett durchkonfigurieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "Router(config)#",
            commands: [
              {
                cmd: "hostname R1\nenable secret class\nno ip domain-lookup",
                explanation:
                  "Die ersten drei Handgriffe auf JEDEM Cisco-Gerät: Name, Privileged-Passwort (gehasht), und kein nerviges DNS-Lookup bei Tippfehlern.",
              },
              {
                cmd: "line console 0\npassword cisco\nlogin\nexit",
                explanation:
                  "Konsolen-Zugang absichern. `login` aktiviert die Passwort-Abfrage — ohne `login` fragt niemand nach dem Passwort!",
              },
              {
                cmd: "line vty 0 4\npassword cisco\nlogin\nexit",
                explanation:
                  "Dasselbe für die ersten 5 virtuellen Terminal-Lines (Telnet/SSH).",
              },
              {
                cmd: "banner motd #Unbefugter Zugriff verboten!#\nservice password-encryption",
                explanation:
                  "Rechtlicher Warnhinweis + Klartext-Passwörter in der Config verschleiern.",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "copy running-config startup-config",
                explanation:
                  "Speichern! Enter bei der Dateinamen-Abfrage. Ohne diesen Schritt ist nach `reload` alles weg.",
              },
            ],
          },
        ],
      },
      {
        title: "Runde 2: SW1 — exakt dieselbe Sequenz",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "Switch(config)#",
            commands: [
              {
                cmd: "hostname SW1\nenable secret class\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit\nbanner motd #Unbefugter Zugriff verboten!#\nservice password-encryption",
                explanation:
                  "Identisch zu R1 — nur der Hostname ändert sich. Diesmal ohne auf die Erklärungen zu schauen.",
              },
              {
                cmd: "do copy running-config startup-config",
                explanation:
                  "Mit `do` direkt aus dem Config-Modus speichern — spart das `exit`.",
              },
            ],
          },
        ],
      },
      {
        title: "Runde 3: SW2 — aus dem Gedächtnis",
        blocks: [
          {
            device: "SW2",
            mode: "global",
            modeLabel: "Switch(config)#",
            commands: [
              {
                cmd: "hostname SW2\n... (komplette Sequenz aus dem Kopf)",
                explanation:
                  "Letzte Runde: Bildschirm mit den Befehlen abdecken und die komplette Sequenz frei tippen. Erst danach mit Runde 1 vergleichen.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show running-config | include hostname|secret|banner", expected: "Alle drei Geräte zeigen identische Struktur" },
      { cmd: "show startup-config", expected: "Gespeicherte Config vorhanden (kein 'startup-config is not present')" },
      { cmd: "exit + neu einloggen", expected: "Banner erscheint, Console-Passwort wird abgefragt" },
    ],
    glossary: [
      { term: "hostname", def: "Setzt den Gerätenamen und ändert den CLI-Prompt — wichtig zur Orientierung in größeren Netzen." },
      { term: "enable secret", def: "Passwort für den Privileged-EXEC-Modus, als MD5-Hash gespeichert (nicht umkehrbar). Sicherer als enable password." },
      { term: "line console 0", def: "Konfiguriert den physischen Konsolen-Port; mit password + login wird der Zugang abgesichert." },
      { term: "line vty 0 4", def: "Die ersten 5 virtuellen Terminal-Leitungen für Telnet/SSH-Fernzugriff." },
      { term: "login", def: "Aktiviert die Passwortabfrage auf einer Line — ohne login wird trotz gesetztem Passwort nichts abgefragt." },
      { term: "banner motd", def: "Message of the Day — rechtlicher Warnhinweis, der vor dem Login erscheint." },
      { term: "service password-encryption", def: "Verschleiert Klartext-Passwörter in der Konfiguration (schwache Type-7-Verschlüsselung)." },
      { term: "copy running-config startup-config", def: "Speichert die laufende Konfiguration ins NVRAM, damit sie einen Reload übersteht." },
    ],
  },

  {
    id: "drill-pc-ips",
    icon: <Desktop size={20} />,
    title: "Drill: 6 PCs durchnummerieren",
    subtitle: "Statische IPs im Akkord vergeben",
    difficulty: "Drill",
    duration: "10 min",
    context: {
      problem:
        "Ein Endgerät ohne korrekte IP, Subnetzmaske und Gateway kann nicht kommunizieren. In größeren Netzen müssen viele Hosts schnell und fehlerfrei adressiert werden.",
      purpose:
        "Trainiert das stumpfe, schnelle Vergeben statischer IPs nach einem festen Schema — und das Lesen von ipconfig zur Selbstkontrolle.",
    },
    topology: {
      description:
        "Sechs PCs an einem Switch, alle im selben /24-Netz. Die IPs werden stur durchnummeriert (.11 bis .16) — bis der Ablauf Desktop → IP Configuration → Eintragen automatisch abläuft.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "pc", label: "PC0–PC5", count: 6 },
      ],
      connections: [
        "PC0–PC5 → SW1 Fa0/1–Fa0/6 (Copper Straight-Through)",
      ],
      hint: "Schema: PC-Nummer + 11 = letztes Oktett. PC0 → .11, PC1 → .12, … PC5 → .16. Gateway immer .1.",
    },
    steps: [
      {
        title: "Alle 6 PCs nach Schema konfigurieren",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IP Address: 192.168.50.11\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.50.1",
                explanation:
                  "PT: PC anklicken → Desktop-Tab → IP Configuration → Static. Die drei Felder ausfüllen, Fenster schließen, nächster PC.",
              },
            ],
          },
          {
            device: "PC1-PC5",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "PC1: .12  |  PC2: .13  |  PC3: .14  |  PC4: .15  |  PC5: .16\n(Maske und Gateway überall identisch)",
                explanation:
                  "Stumpf durcharbeiten. Ziel: unter 60 Sekunden pro PC. Wer schneller will: Tab-Taste statt Maus zwischen den Feldern.",
              },
            ],
          },
        ],
      },
      {
        title: "Nachbarschafts-Pingrunde",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.50.12\nping 192.168.50.16",
                explanation:
                  "Von PC0 den direkten Nachbarn und den letzten PC anpingen. Erster Ping verliert oft 1 Paket (ARP) — das ist normal und eine beliebte Prüfungsfrage!",
              },
              {
                cmd: "ipconfig",
                explanation:
                  "Eigene Einstellungen prüfen — Tippfehler im Gateway sind der häufigste Fehler in dieser Übung.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping zwischen beliebigen PCs", expected: "0% Verlust (außer erstem ARP-Ping)" },
      { cmd: "ipconfig auf jedem PC", expected: "IP nach Schema, Maske /24, Gateway .1" },
      { cmd: "show mac address-table (SW1)", expected: "6 MAC-Adressen auf Fa0/1–Fa0/6 gelernt" },
    ],
    glossary: [
      { term: "Statische IP", def: "Manuell fest vergebene Adresse (Gegenstück zu DHCP) — üblich für Server, Drucker und Laborübungen." },
      { term: "Subnetzmaske /24", def: "255.255.255.0 — trennt Netz- von Hostanteil; alle .x im selben /24 sind direkt erreichbar." },
      { term: "Default Gateway", def: "Router-IP, an die ein Host Pakete für andere Netze schickt. Fehlt sie, bleibt der Host im eigenen Subnetz gefangen." },
      { term: "ipconfig", def: "Windows-Befehl, der IP, Maske und Gateway eines Hosts anzeigt — erster Schritt jeder Fehlersuche." },
      { term: "ping", def: "ICMP-Erreichbarkeitstest zwischen zwei Hosts." },
      { term: "ARP", def: "Address Resolution Protocol — löst eine IP in die zugehörige MAC auf. Der allererste Ping verliert oft 1 Paket, weil zuerst ARP läuft." },
      { term: "MAC-Adresstabelle", def: "Liste im Switch, welche MAC an welchem Port hängt — Grundlage der L2-Weiterleitung." },
    ],
  },

  {
    id: "drill-interfaces",
    icon: <Network size={20} />,
    title: "Drill: Router-Interfaces hochziehen",
    subtitle: "6 Interfaces · 2 Router · ip address + no shutdown",
    difficulty: "Drill",
    duration: "12 min",
    context: {
      problem:
        "Router-Interfaces sind ab Werk abgeschaltet (administratively down) — das ist der häufigste „warum-geht-nichts\"-Fehler überhaupt.",
      purpose:
        "Trainiert den Vierschritt interface → ip address → no shutdown → description, bis er automatisch kommt, inklusive show ip interface brief als Kontrolle.",
    },
    topology: {
      description:
        "Zwei Router mit je drei Interfaces. Jedes bekommt stur dieselbe Behandlung: interface → ip address → no shutdown → description. Router-Interfaces sind ab Werk AUS — das vergisst man nie wieder.",
      devices: [
        { type: "router", label: "R1 / R2", count: 2 },
      ],
      connections: [
        "R1 Gi0/1 ↔ R2 Gi0/1 (optional, für den Schluss-Ping)",
      ],
      hint: "Der Vierschritt: interface — ip address — no shut — description. Bei 'no shutdown' auf die Konsolenmeldung 'changed state to up' achten.",
    },
    steps: [
      {
        title: "R1: drei Interfaces konfigurieren",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config-if)#",
            commands: [
              {
                cmd: "interface gi0/0\nip address 192.168.10.1 255.255.255.0\nno shutdown\ndescription LAN-BUERO",
                explanation:
                  "Interface 1 von 6. Die Konsolenmeldung '%LINK-5-CHANGED: ... changed state to up' bestätigt den no shutdown.",
              },
              {
                cmd: "interface gi0/1\nip address 10.0.0.1 255.255.255.252\nno shutdown\ndescription WAN-ZU-R2",
                explanation: "Interface 2: /30 für den Punkt-zu-Punkt-Link.",
              },
              {
                cmd: "interface gi0/2\nip address 192.168.20.1 255.255.255.0\nno shutdown\ndescription LAN-LABOR",
                explanation: "Interface 3 — dieselbe Sequenz, drittes Mal.",
              },
            ],
          },
        ],
      },
      {
        title: "R2: identisch wiederholen + prüfen",
        blocks: [
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config-if)#",
            commands: [
              {
                cmd: "gi0/0: 192.168.30.1/24\ngi0/1: 10.0.0.2/30\ngi0/2: 192.168.40.1/24\n(jeweils + no shutdown + description)",
                explanation:
                  "Runde 2 ohne Spickzettel. Der Vierschritt muss automatisch kommen.",
              },
            ],
          },
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2#",
            commands: [
              {
                cmd: "show ip interface brief",
                explanation:
                  "DER Kontrollbefehl: alle drei Interfaces müssen 'up/up' zeigen. 'administratively down' = no shutdown vergessen — der Klassiker.",
              },
              {
                cmd: "ping 10.0.0.1",
                explanation: "Schluss-Ping über den WAN-Link zu R1.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip interface brief", expected: "Alle konfigurierten Interfaces: Status up, Protocol up" },
      { cmd: "show interfaces description", expected: "Jedes Interface hat eine Description" },
      { cmd: "ping 10.0.0.2 (von R1)", expected: "!!!!! — 100% Erfolg über den /30-Link" },
    ],
    glossary: [
      { term: "ip address <ip> <maske>", def: "Weist einem Interface eine IPv4-Adresse zu — macht es zum Gateway seines Subnetzes." },
      { term: "no shutdown", def: "Aktiviert ein Interface administrativ. Fehlt es, bleibt das Interface down — egal wie korrekt der Rest ist." },
      { term: "administratively down", def: "Statusanzeige eines Interfaces, das per shutdown deaktiviert ist (Gegenteil: up/up)." },
      { term: "/30", def: "Maske 255.255.255.252 — genau 2 nutzbare Adressen, ideal für Punkt-zu-Punkt-Links zwischen Routern." },
      { term: "description", def: "Klartext-Notiz am Interface zur Dokumentation (z. B. WAN-ZU-R2)." },
      { term: "show ip interface brief", def: "Kompakte Übersicht aller L3-Interfaces mit IP, Status und Protokoll — DER Kontrollbefehl." },
      { term: "up/up", def: "Interface ist administrativ aktiv (Status up) UND das Line-Protocol läuft (Protocol up)." },
    ],
  },

  {
    id: "drill-access-ports",
    icon: <Stack size={20} />,
    title: "Drill: Access-Ports im Akkord",
    subtitle: "16 Ports · 2 VLANs · 2 Switches",
    difficulty: "Drill",
    duration: "12 min",
    context: {
      problem:
        "In jedem Switch müssen viele Ports dem richtigen VLAN zugeordnet werden. Einzeln ist das langsam und fehleranfällig.",
      purpose:
        "Trainiert den Dreierschritt range → mode access → access vlan samt PortFast im Akkord, damit VLAN-Zuweisung zur Routine wird.",
    },
    topology: {
      description:
        "Auf zwei Switches werden jeweils 16 Ports in zwei VLANs aufgeteilt — mit interface range immer im selben Dreierschritt: range → mode access → access vlan.",
      devices: [
        { type: "switch", label: "SW1 / SW2", count: 2 },
      ],
      connections: [
        "Keine Verkabelung nötig — reines Konfigurationstraining",
      ],
      hint: "Der Dreierschritt sitzt, wenn du ihn sprechen kannst: 'range — access — vlan'. Portfast obendrauf, weil es Access-Ports sind.",
    },
    steps: [
      {
        title: "SW1: VLANs anlegen + Ports zuweisen",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "vlan 10\nname BUERO\nvlan 20\nname LABOR",
                explanation: "VLANs zuerst — sonst landet die Port-Zuweisung in einem nicht existierenden VLAN.",
              },
              {
                cmd: "interface range fa0/1 - 8\nswitchport mode access\nswitchport access vlan 10\nspanning-tree portfast",
                explanation:
                  "Der Dreierschritt + Portfast für die ersten 8 Ports. `interface range` ist der wichtigste Zeitsparer der Prüfung.",
              },
              {
                cmd: "interface range fa0/9 - 16\nswitchport mode access\nswitchport access vlan 20\nspanning-tree portfast",
                explanation: "Dieselbe Sequenz für VLAN 20 — ohne nachzudenken.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2: identisch wiederholen",
        blocks: [
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "(komplette Sequenz von SW1 wiederholen)",
                explanation:
                  "Runde 2 aus dem Gedächtnis: 2 VLANs, 2× Dreierschritt. Stoppuhr: unter 90 Sekunden ist das Ziel.",
              },
              {
                cmd: "do show vlan brief",
                explanation:
                  "Sofort-Kontrolle ohne den Config-Modus zu verlassen: Fa0/1–8 in VLAN 10, Fa0/9–16 in VLAN 20?",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief", expected: "VLAN 10 BUERO: Fa0/1-8, VLAN 20 LABOR: Fa0/9-16 (auf beiden Switches)" },
      { cmd: "show interfaces fa0/1 switchport", expected: "Administrative Mode: static access, Access Mode VLAN: 10" },
      { cmd: "show running-config | section interface", expected: "Jeder Port: mode access + access vlan + portfast" },
    ],
    glossary: [
      { term: "VLAN", def: "Virtual LAN — logische Aufteilung eines Switches in getrennte Broadcast-Domänen." },
      { term: "Access-Port", def: "Switch-Port, der genau zu EINEM VLAN gehört und ungetaggte Frames eines Endgeräts überträgt." },
      { term: "switchport mode access", def: "Setzt den Port fest in den Access-Modus (kein Trunk, keine DTP-Verhandlung)." },
      { term: "switchport access vlan <id>", def: "Weist den Access-Port dem angegebenen VLAN zu." },
      { term: "interface range", def: "Konfiguriert mehrere Interfaces gleichzeitig — der wichtigste Zeitsparer der Prüfung." },
      { term: "PortFast", def: "Überspringt die STP-Phasen, sodass ein Access-Port sofort forwardet. Nur für Endgeräte-Ports!" },
      { term: "show vlan brief", def: "Zeigt alle VLANs mit Namen, Status und zugeordneten Access-Ports." },
    ],
  },

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
    context: {
      problem:
        "Geräte können erst kommunizieren, wenn jedes Interface eine IP hat und Endgeräte ihr Default-Gateway kennen — das ist das absolute Fundament jedes Netzes.",
      purpose:
        "Die einfachste Topologie (Router–Switch–3 PCs) end-to-end aufbauen, adressieren und per Ping verifizieren. Grundlage für alle weiteren Labs.",
    },
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
    glossary: [
      { term: "enable", def: "Wechsel in den Privileged-EXEC-Modus (# Prompt), Voraussetzung für configure terminal." },
      { term: "configure terminal", def: "Öffnet den globalen Konfigurationsmodus." },
      { term: "hostname", def: "Setzt den Gerätenamen." },
      { term: "ip address <ip> <maske>", def: "Weist dem Interface eine IPv4-Adresse zu." },
      { term: "no shutdown", def: "Aktiviert das Interface — Router-Ports sind ab Werk down." },
      { term: "Default Gateway", def: "Router-IP, an die ein PC Pakete für andere Netze sendet." },
      { term: "show ip interface brief", def: "Übersicht aller Interfaces mit IP und up/up-Status." },
      { term: "ping", def: "ICMP-Test, ob ein Ziel erreichbar ist." },
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
    context: {
      problem:
        "Ein flaches LAN ist eine einzige große Broadcast-Domäne — jedes Gerät hört jeden Broadcast. Das ist schlecht für Sicherheit und Performance.",
      purpose:
        "Den Verkehr per VLANs in getrennte Broadcast-Domänen aufteilen und diese VLANs über einen 802.1Q-Trunk zwischen Switches transportieren — die Basis jeder Campus-Verkabelung.",
    },
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
    glossary: [
      { term: "VLAN", def: "Virtual LAN — logische Aufteilung eines Switches in mehrere getrennte Broadcast-Domänen." },
      { term: "Broadcast-Domäne", def: "Bereich, in dem ein Broadcast alle Geräte erreicht. Jedes VLAN ist eine eigene." },
      { term: "Access-Port", def: "Port, der zu genau einem VLAN gehört (Endgerät-Anschluss, ungetaggt)." },
      { term: "Trunk", def: "Link, der mehrere VLANs getaggt überträgt — zwischen Switches/Router. Auf ISL-fähigen Switches zuerst switchport trunk encapsulation dot1q, auf reinen 802.1Q-Switches (PT 2960) direkt switchport mode trunk." },
      { term: "802.1Q", def: "IEEE-Standard, der jedem Frame ein 4-Byte VLAN-Tag voranstellt." },
      { term: "switchport access vlan <id>", def: "Weist einem Access-Port sein VLAN zu." },
      { term: "switchport trunk allowed vlan", def: "Schränkt ein, welche VLANs ein Trunk überträgt." },
    ],
  },


  // ─────────────────────────────────────────────────────────────
  // VTP & DTP (CIS1 — Prüfungsklassiker)
  // ─────────────────────────────────────────────────────────────
  {
    id: "vtp-dtp",
    icon: <Stack size={20} />,
    title: "VTP & DTP",
    subtitle: "VLAN-Verteilung & Trunk-Verhandlung · 3 Switches",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "VLANs auf jedem Switch einzeln zu pflegen ist mühsam und fehleranfällig — und falsch verhandelte Trunks öffnen VLAN-Hopping-Angriffe.",
      purpose:
        "VTP verteilt die VLAN-Datenbank automatisch vom Server an die Client-Switches; DTP zeigt die Trunk-Verhandlung und wird per nonegotiate abgesichert. CCNA-Standardthema.",
    },
    topology: {
      description:
        "Drei Switches in Reihe. SW1 ist VTP-Server und verteilt VLANs automatisch an die Clients SW2 und SW3. DTP verhandelt die Trunks.",
      devices: [
        { type: "switch", label: "SW1 (Server) / SW2 / SW3 (Clients)", count: 3 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "SW1 Gi0/1 ↔ SW2 Gi0/1  (Trunk)",
        "SW2 Gi0/2 ↔ SW3 Gi0/1  (Trunk)",
        "PC0 → SW1 Fa0/1 (VLAN 10), PC1 → SW3 Fa0/1 (VLAN 10)",
      ],
      hint: "VTP verteilt nur die VLAN-Datenbank — die Port-Zuweisung (access vlan) bleibt lokal auf jedem Switch!",
    },
    steps: [
      {
        title: "SW1 als VTP-Server konfigurieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "vtp domain CCNA-LAB\nvtp mode server\nvtp password cisco",
                explanation:
                  "Domain-Name und Passwort müssen auf allen Switches identisch sein, sonst werden VTP-Advertisements ignoriert. Server ist der Default-Modus.",
              },
              {
                cmd: "vlan 10\nname VERWALTUNG\nvlan 20\nname TECHNIK",
                explanation:
                  "VLANs werden NUR auf dem Server angelegt — VTP verteilt sie automatisch an alle Clients in der Domain.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2 und SW3 als VTP-Clients",
        blocks: [
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "vtp domain CCNA-LAB\nvtp mode client\nvtp password cisco",
                explanation:
                  "Clients übernehmen die VLAN-Datenbank vom Server, können selbst aber keine VLANs anlegen oder löschen. SW3 identisch konfigurieren.",
              },
            ],
          },
        ],
      },
      {
        title: "Trunks per DTP verhandeln",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config-if)#",
            commands: [
              {
                cmd: "interface gi0/1\nswitchport mode dynamic desirable",
                explanation:
                  "DTP desirable verhandelt aktiv einen Trunk. Gegenseite kann desirable, auto oder trunk sein — alles ergibt einen Trunk. Achtung Prüfung: auto + auto = KEIN Trunk!",
              },
            ],
          },
          {
            device: "SW2",
            mode: "interface",
            modeLabel: "SW2(config-if)#",
            commands: [
              {
                cmd: "interface range gi0/1 - 2\nswitchport mode trunk\nswitchport nonegotiate",
                explanation:
                  "Best Practice: Trunk statisch setzen und DTP mit nonegotiate abschalten — verhindert VLAN-Hopping über gefälschte DTP-Frames.",
              },
            ],
          },
        ],
      },
      {
        title: "VLAN-Verteilung prüfen + Nachbarn entdecken",
        blocks: [
          {
            device: "SW3",
            mode: "privileged",
            modeLabel: "SW3#",
            commands: [
              {
                cmd: "show vtp status",
                explanation:
                  "Revision-Nummer muss der des Servers entsprechen. Prüfungsfalle: ein gebrauchter Switch mit HÖHERER Revision überschreibt die Server-Datenbank!",
              },
              {
                cmd: "show cdp neighbors detail",
                explanation:
                  "CDP (Cisco-proprietär, Default an) zeigt Nachbargerät, Port, IOS-Version und IP. LLDP wäre die herstellerneutrale Alternative (lldp run).",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief (auf SW3)", expected: "VLAN 10 VERWALTUNG und VLAN 20 TECHNIK vorhanden — ohne lokale Konfiguration" },
      { cmd: "show vtp status", expected: "VTP Operating Mode: Client, gleiche Configuration Revision wie SW1" },
      { cmd: "show interfaces trunk", expected: "Gi0/1 mode: desirable, status: trunking, encapsulation 802.1q" },
      { cmd: "show dtp interface gi0/1", expected: "TOS/TAS/TNS: ACCESS/DESIRABLE/TRUNK" },
    ],
    glossary: [
      { term: "VTP", def: "VLAN Trunking Protocol — synchronisiert die VLAN-Datenbank zwischen Switches einer Domain." },
      { term: "VTP-Domain", def: "Gemeinsamer Name (+ Passwort), den alle Switches teilen müssen, damit VTP greift." },
      { term: "VTP-Modus", def: "Server (anlegen + verteilen), Client (nur übernehmen), Transparent (lokal, leitet nur durch)." },
      { term: "Revision", def: "Versionszähler der VLAN-Datenbank. Achtung: ein Switch mit höherer Revision überschreibt die Server-DB!" },
      { term: "DTP", def: "Dynamic Trunking Protocol — verhandelt automatisch, ob ein Link Trunk wird." },
      { term: "dynamic desirable", def: "DTP-Modus, der aktiv versucht, einen Trunk aufzubauen (auto = passiv abwartend)." },
      { term: "switchport nonegotiate", def: "Schaltet DTP ab — Best Practice auf statisch gesetzten Trunks (gegen VLAN-Hopping)." },
      { term: "CDP", def: "Cisco Discovery Protocol — zeigt direkt verbundene Cisco-Nachbarn (Gerät, Port, IOS, IP)." },
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
    context: {
      problem:
        "Ein einzelner Link zwischen zwei Switches ist Flaschenhals und Single Point of Failure — und STP würde einen zweiten, parallelen Link blockieren statt nutzen.",
      purpose:
        "Mehrere physische Links zu EINEM logischen Port-Channel bündeln: mehr Bandbreite und Redundanz, und STP sieht nur einen logischen Link (blockiert nichts).",
    },
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
        title: "SW2 konfigurieren (dieselben Befehle wie SW1)",
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
    glossary: [
      { term: "EtherChannel", def: "Bündelung mehrerer physischer Links zu einem logischen — Link Aggregation." },
      { term: "Port-Channel", def: "Das logische Interface (Port-channel1), das die Mitglieds-Ports zusammenfasst." },
      { term: "LACP", def: "Link Aggregation Control Protocol (IEEE 802.3ad, offen) — Modi active/passive." },
      { term: "PAgP", def: "Port Aggregation Protocol (Cisco-proprietär) — Modi desirable/auto." },
      { term: "channel-group <n> mode <mode>", def: "Fügt ein Interface einem EtherChannel hinzu: active/passive (LACP), desirable/auto (PAgP), on (statisch)." },
      { term: "show etherchannel summary", def: "Status aller Port-Channels (P = in-use/gebündelt, D = down)." },
      { term: "Single Point of Failure", def: "Eine Komponente, deren Ausfall die ganze Verbindung lahmlegt — durch Bündelung vermieden." },
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
    context: {
      problem:
        "Redundante Verbindungen zwischen Switches erzeugen ohne Schutz Layer-2-Loops. Ein Frame kreist endlos, ein Broadcast-Sturm legt binnen Sekunden das ganze Netz lahm.",
      purpose:
        "STP wählt automatisch eine Root-Bridge und blockiert überflüssige Pfade, sodass genau ein loopfreier Baum bleibt. PortFast + BPDU-Guard sichern dabei die Access-Ports ab.",
    },
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
    glossary: [
      { term: "STP", def: "Spanning Tree Protocol (802.1D) — verhindert Layer-2-Loops, indem es redundante Pfade blockiert." },
      { term: "Root-Bridge", def: "Der zentrale Referenz-Switch des Baums — gewählt über die niedrigste Bridge-ID." },
      { term: "Bridge-Priority", def: "Erster Teil der Bridge-ID (Default 32768). Niedriger gewinnt; bei Gleichstand entscheidet die MAC." },
      { term: "BPDU", def: "Bridge Protocol Data Unit — STP-Nachricht, mit der Switches die Topologie aushandeln." },
      { term: "Root Port (RP)", def: "Der Port eines Switches mit dem günstigsten Pfad zur Root-Bridge." },
      { term: "Designated Port (DP)", def: "Pro Segment der weiterleitende Port; an der Root-Bridge sind alle Ports DP." },
      { term: "Blocking", def: "Zustand eines Ports, der zur Loop-Vermeidung keine Daten weiterleitet." },
      { term: "PortFast", def: "Bringt einen Access-Port sofort in Forwarding (überspringt STP-Phasen). Nur für Endgeräte!" },
      { term: "BPDU-Guard", def: "Deaktiviert einen PortFast-Port (err-disabled), sobald dort eine BPDU eintrifft — schützt vor fremden Switches." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. Inter-VLAN Routing (Router-on-a-Stick)
  // ─────────────────────────────────────────────────────────────
  {
    id: "roas",
    icon: <Network size={20} />,
    title: "Inter-VLAN Routing (RoaS)",
    subtitle: "Router · Switch · 2 PCs",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "VLANs sind Layer-2-Inseln: ohne ein Layer-3-Gerät erreicht ein PC in VLAN 10 keinen PC in VLAN 20.",
      purpose:
        "Mit Router-on-a-Stick routet EIN Router über logische Subinterfaces zwischen mehreren VLANs — die klassische, günstige Inter-VLAN-Lösung mit nur einem Trunk-Link.",
    },
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
    glossary: [
      { term: "Inter-VLAN-Routing", def: "Routing zwischen verschiedenen VLANs über ein Layer-3-Gerät." },
      { term: "Router-on-a-Stick", def: "Inter-VLAN-Routing über EIN physisches Router-Interface, aufgeteilt in Subinterfaces." },
      { term: "Subinterface", def: "Logisches Unter-Interface (z. B. Gi0/0.10) mit eigenem VLAN-Tag und IP — Gateway eines VLANs." },
      { term: "encapsulation dot1Q <id>", def: "Bindet ein Subinterface an ein VLAN-Tag. Pflicht, sonst routet es nicht." },
      { term: "Parent-Interface", def: "Das physische Interface (Gi0/0): bekommt KEINE IP, muss aber no shutdown sein." },
      { term: "Trunk", def: "Switch-Link zum Router, der alle VLANs getaggt überträgt." },
      { term: "Default Gateway", def: "Für die Hosts die Subinterface-IP ihres VLANs." },
    ],
  },


  // ---------------------------------------------------------------
  // Inter-VLAN Routing via SVI (L3-Switch) -- Roter Faden / PDF
  // ---------------------------------------------------------------
  {
    id: "ivr-svi",
    icon: <Network size={20} />,
    title: "Inter-VLAN Routing (L3-Switch / SVI)",
    subtitle: "Multilayer-Switch routet zwischen VLANs -- ohne Router",
    difficulty: "Mittel",
    duration: "18 min",
    context: {
      problem:
        "Router-on-a-Stick hat einen Engpass: aller Inter-VLAN-Verkehr teilt sich einen Trunk-Link. In größeren Netzen routet man lieber direkt im Switch.",
      purpose:
        "Ein Layer-3-Switch routet per SVIs (interface vlan) at Wire-Speed in Hardware zwischen VLANs — der moderne Campus-Standard. Zeigt die häufige Falle „ip routing vergessen\".",
    },
    topology: {
      description:
        "Statt Router-on-a-Stick übernimmt ein Layer-3-Switch das Routing zwischen den VLANs über SVIs (interface vlan). Moderner Standard im Campus-Netz.",
      devices: [
        { type: "switch", label: "MLS1 (Layer-3)", count: 1 },
        { type: "pc", label: "PC-Sales / PC-Mrkt", count: 2 },
      ],
      connections: [
        "PC-Sales → MLS1 Gi1/0/1  (VLAN 10)",
        "PC-Mrkt  → MLS1 Gi1/0/2  (VLAN 20)",
      ],
      hint: "Das SVI (interface vlan 10) ist das Gateway der Hosts. Ohne 'ip routing' bleibt es ein reiner L2-Switch -- häufigster Fehler!",
    },
    steps: [
      {
        title: "VLANs anlegen + Access-Ports zuweisen",
        blocks: [
          {
            device: "MLS1",
            mode: "global",
            modeLabel: "MLS1(config)#",
            commands: [
              {
                cmd: "vlan 10\nname SALES\nvlan 20\nname MRKT",
                explanation:
                  "VLANs zuerst in der Datenbank anlegen -- sonst landet die Port-Zuweisung im Leeren.",
              },
              {
                cmd: "interface gi1/0/1\nswitchport mode access\nswitchport access vlan 10\ninterface gi1/0/2\nswitchport mode access\nswitchport access vlan 20",
                explanation:
                  "Jeder PC-Port ist ein Access-Port in seinem VLAN -- wie beim normalen L2-Switch.",
              },
            ],
          },
        ],
      },
      {
        title: "Routing aktivieren + SVIs als Gateways",
        blocks: [
          {
            device: "MLS1",
            mode: "global",
            modeLabel: "MLS1(config)#",
            commands: [
              {
                cmd: "ip routing",
                explanation:
                  "DER entscheidende Befehl: erst damit wird aus dem Switch ein Router. Vergisst man ihn, pingen sich nur Hosts im selben VLAN.",
              },
              {
                cmd: "interface vlan 10\nip address 192.168.10.254 255.255.255.0\nno shutdown",
                explanation:
                  "Das SVI für VLAN 10. Diese IP trägst du bei PC-Sales als Default Gateway ein.",
              },
              {
                cmd: "interface vlan 20\nip address 192.168.20.254 255.255.255.0\nno shutdown",
                explanation:
                  "SVI für VLAN 20 -- Gateway für PC-Mrkt. Beide SVIs gehen 'up', sobald je ein aktiver Access-Port im VLAN ist.",
              },
            ],
          },
        ],
      },
      {
        title: "Endgeräte konfigurieren + testen",
        blocks: [
          {
            device: "PC-Sales / PC-Mrkt",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "PC-Sales: 192.168.10.1 /24  GW 192.168.10.254\nPC-Mrkt : 192.168.20.1 /24  GW 192.168.20.254",
                explanation:
                  "Gateway = die SVI-IP des eigenen VLANs. Ohne korrektes Gateway scheitert das Inter-VLAN-Routing trotz richtiger Switch-Konfig.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip route (auf MLS1)", expected: "C 192.168.10.0/24 + C 192.168.20.0/24 über Vlan10/Vlan20 (connected)" },
      { cmd: "show ip interface brief | include Vlan", expected: "Vlan10 + Vlan20: up/up mit ihren SVI-IPs" },
      { cmd: "ping 192.168.20.1 (von PC-Sales)", expected: "Erfolgreich -- Routing zwischen den VLANs über den L3-Switch" },
    ],
    glossary: [
      { term: "Layer-3-Switch", def: "Multilayer-Switch mit integrierter Routing-Engine — kein externer Router nötig." },
      { term: "SVI", def: "Switch Virtual Interface (interface vlan X) — virtuelles L3-Interface, das als Gateway eines VLANs dient." },
      { term: "ip routing", def: "Aktiviert IPv4-Routing auf dem L3-Switch. OHNE diesen Befehl bleibt es ein reiner L2-Switch — häufigster Fehler." },
      { term: "interface vlan <id>", def: "Erstellt/öffnet das SVI eines VLANs zur IP-Konfiguration." },
      { term: "Inter-VLAN-Routing", def: "Routing zwischen VLANs — hier in Switch-Hardware statt über einen Router." },
      { term: "Connected Route", def: "Route (C in show ip route), die ein Gerät für ein direkt anliegendes Netz automatisch kennt." },
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
    context: {
      problem:
        "Ein Router kennt von sich aus nur direkt angeschlossene Netze. Pakete an entfernte Netze verwirft er, solange ihm der Weg dorthin nicht beigebracht wird.",
      purpose:
        "Mit statischen Routen den Pfad zu fernen Netzen von Hand eintragen — volle Kontrolle, kein Protokoll-Overhead. Wichtig ist auch die Rückroute, sonst kommt nur die Hinrichtung an.",
    },
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
    glossary: [
      { term: "Statische Route", def: "Manuell eingetragener Pfad zu einem Zielnetz (ip route)." },
      { term: "ip route <netz> <maske> <next-hop>", def: "Definiert Zielnetz, Maske und die IP des nächsten Routers." },
      { term: "Next-Hop", def: "IP des nächsten Routers auf dem Weg zum Ziel." },
      { term: "Routingtabelle", def: "Liste aller bekannten Netze und ihrer Wege (show ip route)." },
      { term: "Administrative Distanz", def: "Vertrauenswürdigkeit einer Routenquelle — statische Route hat AD 1." },
      { term: "Rückroute", def: "Die Gegenroute für den Rückweg. Ohne sie scheitert die Antwort (asymmetrisches Problem)." },
      { term: "/30", def: "Maske 255.255.255.252 — 2 nutzbare Hosts, typisch für Router-zu-Router-Links." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 20. Floating Static Route
  // ─────────────────────────────────────────────────────────────
  {
    id: "floating-static",
    icon: <Network size={20} />,
    title: "Floating Static Route",
    subtitle: "Backup-Route über Admin-Distance",
    difficulty: "Mittel",
    duration: "10 min",
    context: {
      problem:
        "Eine einzelne statische Default-Route hat keinen Ersatz: fällt der Uplink aus, ist das Internet weg, bis jemand von Hand umkonfiguriert.",
      purpose:
        "Eine zweite Default-Route mit höherer Administrativer Distanz (Floating Static) als Reserve hinterlegen. Sie wird erst aktiv, wenn die primäre Route verschwindet — automatisches Failover, optional per IP SLA Tracking.",
    },
    topology: {
      description:
        "Branch-Router R1 hat einen primären MPLS-Uplink und einen Backup-Internet-DSL-Link. Floating Static aktiviert den Backup nur, wenn der primäre Pfad ausfällt.",
      devices: [{ type: "router", label: "R1 (Branch)", count: 1 }],
      connections: [
        "R1 Gi0/0 → ISP-MPLS  (Next-Hop 10.1.1.1, AD 1)",
        "R1 Gi0/1 → DSL-Modem (Next-Hop 10.2.2.1, AD 200 = Floating)",
      ],
      hint: "Die Backup-Route hat eine höhere Administrative Distance — sie 'floats' über der primären und wird nur eingesetzt, wenn die primäre verschwindet.",
    },
    steps: [
      {
        title: "Primäre & Backup-Route",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ip route 0.0.0.0 0.0.0.0 10.1.1.1", explanation: "Default-Route via MPLS, Default-AD = 1 (Static)." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 10.2.2.1 200", explanation: "FLOATING: gleiche Route, aber AD 200 → wird NUR aktiv, wenn die AD-1-Route verschwindet (Interface down)." },
            ],
          },
        ],
      },
      {
        title: "IP-SLA für aktives Failover (Bonus)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ip sla 1", explanation: "Anlegen eines SLA-Probes." },
              { cmd: "icmp-echo 8.8.8.8 source-interface Gi0/0", explanation: "Pingt 8.8.8.8 über MPLS — fällt der Ping aus, wird die Route entfernt." },
              { cmd: "frequency 5", explanation: "Alle 5 Sek." },
              { cmd: "exit", explanation: "" },
              { cmd: "ip sla schedule 1 life forever start-time now", explanation: "Sofort starten, dauerhaft laufen." },
              { cmd: "track 1 ip sla 1 reachability", explanation: "Track-Objekt 1 verfolgt Erreichbarkeit." },
              { cmd: "no ip route 0.0.0.0 0.0.0.0 10.1.1.1", explanation: "Alte Route weg." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 10.1.1.1 track 1", explanation: "Route nur aktiv, wenn track 1 'up' ist → echtes End-to-End-Failover." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip route", expected: "S* 0.0.0.0/0 [1/0] via 10.1.1.1 (nur primär sichtbar)" },
      { cmd: "show ip sla statistics", expected: "Return Code: OK, Latest RTT: 12ms" },
      { cmd: "show track", expected: "Track 1 IP SLA 1 reachability  Reachability is Up" },
    ],
    glossary: [
      { term: "Default-Route", def: "ip route 0.0.0.0 0.0.0.0 <next-hop> — Weg für alle Ziele, die sonst nirgends passen (Gateway of Last Resort)." },
      { term: "Floating Static Route", def: "Statische Backup-Route mit absichtlich höherer AD; floatet inaktiv, bis die primäre ausfällt." },
      { term: "Administrative Distanz (AD)", def: "Je niedriger, desto bevorzugter. Standard-Statik = 1; Floating z. B. 200." },
      { term: "IP SLA", def: "Misst aktiv die Erreichbarkeit (z. B. per Ping) und meldet Ausfälle an das Tracking." },
      { term: "track", def: "Objekt, das eine Route an ein IP-SLA-Ergebnis koppelt — fällt der Ping aus, fällt die Route." },
      { term: "Failover", def: "Automatischer Wechsel auf den Backup-Pfad bei Ausfall des primären." },
    ],
  },


  // ─────────────────────────────────────────────────────────────
  // RIPv1 (CIS2 — klassisches classful Distance-Vector)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rip-v1",
    icon: <Shuffle size={20} />,
    title: "RIPv1 — Classful Distance-Vector",
    subtitle: "3 Router · classful · Broadcast · keine VLSM",
    difficulty: "Anfänger",
    duration: "20 min",
    context: {
      problem:
        "Das älteste dynamische Routing-Protokoll: RIPv1 (RFC 1058) verteilt Routen automatisch — aber CLASSFUL. In seinen Updates fehlt die Subnetzmaske, es sendet per Broadcast und kennt weder VLSM noch CIDR oder Authentifizierung.",
      purpose:
        "Verstehen, wie RIPv1 funktioniert UND warum es heute fast immer durch RIPv2 ersetzt wird. Das Lab zeigt eine saubere classful-Konfiguration (einheitliche /24-Masken) und macht die RIPv1-Grenzen sichtbar.",
    },
    topology: {
      description:
        "Drei Router in Reihe (R1 — R2 — R3), jeder mit eigenem /24-LAN. WICHTIG für RIPv1: ALLE Subnetze eines Major-Netzes nutzen dieselbe Maske (hier durchgehend /24), sonst scheitert RIPv1.",
      devices: [
        { type: "router", label: "R1 / R2 / R3", count: 3 },
        { type: "switch", label: "SW1–SW3", count: 3 },
        { type: "pc", label: "PC0–PC2", count: 3 },
      ],
      connections: [
        "R1 Gi0/1 ↔ R2 Gi0/1  (10.0.12.0/24)",
        "R2 Gi0/2 ↔ R3 Gi0/1  (10.0.23.0/24)",
        "LANs: R1=192.168.1.0/24, R2=192.168.2.0/24, R3=192.168.3.0/24",
      ],
      hint: "RIPv1 ist classful: keine Masken in Updates, Broadcast 255.255.255.255, keine VLSM/CIDR, keine Auth. AD = 120, Metrik = Hop-Count (max 15).",
    },
    steps: [
      {
        title: "1) R1 — komplett (alle Masken /24!)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nenable secret class\nno ip domain-lookup",
                explanation: "Basis: Hostname, Enable-Secret, no ip domain-lookup gegen Tippfehler-Hänger.",
              },
              {
                cmd: "interface gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown\nexit\ninterface gi0/1\nip address 10.0.12.1 255.255.255.0\nno shutdown\nexit",
                explanation:
                  "Gi0/0 = LAN 192.168.1.0/24, Gi0/1 = WAN-Link zu R2. WICHTIG bei RIPv1: auch der WAN-Link ist /24 (nicht /30!) — gemischte Masken im selben Major-Netz sind unmöglich.",
              },
              {
                cmd: "router rip\nnetwork 192.168.1.0\nnetwork 10.0.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "Ohne 'version 2' läuft RIP im Default = Version 1. network nimmt das CLASSFUL-Netz (10.0.0.0, nicht 10.0.12.0). passive-interface Gi0/0 = keine Broadcasts ins LAN (RIPv1 broadcastet auf 255.255.255.255).",
              },
            ],
          },
        ],
      },
      {
        title: "2) R2 — komplett (eigenes LAN + zwei WAN-Links)",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface gi0/0\nip address 192.168.2.1 255.255.255.0\nno shutdown\nexit\ninterface gi0/1\nip address 10.0.12.2 255.255.255.0\nno shutdown\nexit\ninterface gi0/2\nip address 10.0.23.1 255.255.255.0\nno shutdown\nexit",
                explanation:
                  "Gi0/0 = LAN 192.168.2.0/24, Gi0/1 = Link zu R1 (10.0.12.2), Gi0/2 = Link zu R3 (10.0.23.1). Alle /24, alle no shutdown.",
              },
              {
                cmd: "router rip\nnetwork 192.168.2.0\nnetwork 10.0.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "R2 hat ein eigenes LAN (192.168.2.0) und beide WAN-Links im 10er-Netz → network 192.168.2.0 + classful 10.0.0.0 (deckt 10.0.12.0 UND 10.0.23.0). passive nur Gi0/0 (LAN).",
              },
            ],
          },
        ],
      },
      {
        title: "3) R3 — komplett (LAN 192.168.3.0/24)",
        blocks: [
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R3\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface gi0/1\nip address 10.0.23.2 255.255.255.0\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.3.1 255.255.255.0\nno shutdown\nexit",
                explanation:
                  "Gi0/1 = WAN-Link zu R2 (10.0.23.2), Gi0/0 = LAN 192.168.3.0/24. Beide /24, beide no shutdown.",
              },
              {
                cmd: "router rip\nnetwork 192.168.3.0\nnetwork 10.0.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "network 192.168.3.0 (LAN) + classful 10.0.0.0 (WAN). passive-interface Gi0/0 ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "4) Konvergenz prüfen & v1 nachweisen (pro Router)",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip route rip\nshow ip protocols\ndebug ip rip",
                explanation:
                  "Erwartet: 'R 192.168.2.0/24 [120/1] via 10.0.12.2' und 'R 192.168.3.0/24 [120/2] via 10.0.12.2'. show ip protocols → 'send version 1, receive 1', Timer 30/180/240 s. debug ip rip beweist v1: 'sending v1 update via 255.255.255.255' (Broadcast, OHNE Maske). Danach 'undebug all'.",
              },
            ],
          },
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2#",
            commands: [
              {
                cmd: "show ip route rip",
                explanation:
                  "R2 sieht 'R 192.168.1.0/24 [120/1] via 10.0.12.1' und 'R 192.168.3.0/24 [120/1] via 10.0.23.2'.",
              },
            ],
          },
          {
            device: "R3",
            mode: "privileged",
            modeLabel: "R3#",
            commands: [
              {
                cmd: "show ip route rip",
                explanation:
                  "R3 sieht 'R 192.168.2.0/24 [120/1] via 10.0.23.1' und 'R 192.168.1.0/24 [120/2] via 10.0.23.1'.",
              },
            ],
          },
        ],
      },
      {
        title: "Die RIPv1-Grenzen (Stolperfallen)",
        blocks: [
          {
            device: "R1",
            mode: "router",
            modeLabel: "R1(config-router)#",
            commands: [
              {
                cmd: "! VLSM-Test (scheitert mit RIPv1):\n! interface gi0/1 → ip address 10.0.12.1 255.255.255.252 (/30)\n! → R2 lernt das Netz NICHT korrekt: keine Maske im Update",
                explanation:
                  "RIPv1 trägt keine Subnetzmaske → VLSM (z. B. /30-WAN + /24-LAN im selben Major-Netz) ist unmöglich. Discontiguous Networks werden an Klassengrenzen falsch zu 10.0.0.0/8 zusammengefasst (auto-summary, nicht abschaltbar in v1).",
              },
              {
                cmd: "version 2\nno auto-summary",
                explanation:
                  "Die Lösung für ALLE diese Grenzen: auf RIPv2 wechseln. v2 sendet Masken mit (classless), nutzt Multicast 224.0.0.9, unterstützt VLSM/CIDR und Authentifizierung. → siehe Lab 'RIPv2'.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip route rip", expected: "R 192.168.3.0/24 [120/2] via 10.0.12.2 (auf R1)" },
      { cmd: "show ip protocols", expected: "default version control: send version 1, receive version 1" },
      { cmd: "debug ip rip", expected: "sending v1 update ... via 255.255.255.255 (Broadcast, ohne Maske)" },
      { cmd: "ping 192.168.3.10 (von PC0)", expected: "Erfolgreich — solange alle Masken /24 sind" },
    ],
    glossary: [
      { term: "RIPv1", def: "Routing Information Protocol Version 1 (RFC 1058) — classful Distance-Vector, AD 120." },
      { term: "classful", def: "Routing nach Adressklassen (A/B/C) OHNE Subnetzmaske in den Updates." },
      { term: "Broadcast-Update", def: "RIPv1 sendet Updates an 255.255.255.255 (jeder im Segment hört mit) — v2 nutzt Multicast 224.0.0.9." },
      { term: "keine VLSM", def: "Weil die Maske fehlt, muss ein Major-Netz überall dieselbe Maske haben — kein /30-WAN neben /24-LAN." },
      { term: "auto-summary", def: "RIPv1 fasst an Klassengrenzen IMMER zusammen (nicht abschaltbar) → Probleme bei discontiguous networks." },
      { term: "Hop-Count", def: "RIP-Metrik = Anzahl Router bis zum Ziel. Maximum 15 (16 = unerreichbar)." },
      { term: "Timer", def: "Update 30s · Invalid 180s · Holddown 180s · Flush 240s." },
      { term: "version 2", def: "Behebt alle v1-Grenzen: classless (Masken), Multicast, VLSM/CIDR, Authentifizierung." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // RIPv2 (CIS2 — dynamisches Routing Grundlagen)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rip-v2",
    icon: <Shuffle size={20} />,
    title: "RIPv2 — Dynamisches Routing",
    subtitle: "3 Router · Distance Vector · max. 15 Hops",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "Statische Routen skalieren nicht: in einem Netz mit vielen Routern müsste man jede Route auf jedem Gerät von Hand pflegen und bei jeder Änderung anfassen.",
      purpose:
        "RIPv2 verteilt Routen automatisch (Distance-Vector, Metrik = Hop-Count). Das Lab zeigt classless RIP mit den Pflicht-Schritten version 2 und no auto-summary.",
    },
    topology: {
      description:
        "Drei Router in Reihe (R1 — R2 — R3), jeder mit eigenem LAN. Statt statischer Routen tauschen die Router ihre Netze alle 30 Sekunden per RIPv2 aus.",
      devices: [
        { type: "router", label: "R1 / R2 / R3", count: 3 },
        { type: "switch", label: "SW1–SW3", count: 3 },
        { type: "pc", label: "PC0–PC2", count: 3 },
      ],
      connections: [
        "R1 Gi0/1 ↔ R2 Gi0/1  (10.0.12.0/30)",
        "R2 Gi0/2 ↔ R3 Gi0/1  (10.0.23.0/30)",
        "LANs: R1=192.168.1.0/24, R2=192.168.2.0/24, R3=192.168.3.0/24",
      ],
      hint: "RIP ist ein Distance-Vector-Protokoll: Metrik = Hop-Count, Maximum 15 Hops (16 = unreachable). AD = 120.",
    },
    steps: [
      {
        title: "1) R1 — komplett (LAN + WAN + RIPv2)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nenable secret class\nno ip domain-lookup",
                explanation: "Basis: Hostname, Enable-Secret, no ip domain-lookup.",
              },
              {
                cmd: "interface gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown\nexit\ninterface gi0/1\nip address 10.0.12.1 255.255.255.252\nno shutdown\nexit",
                explanation: "Gi0/0 = LAN 192.168.1.0/24 (Gateway .1), Gi0/1 = WAN-/30 zu R2 (.1).",
              },
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 192.168.1.0\nnetwork 10.0.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "version 2 = classless (Masken mit, Multicast 224.0.0.9), no auto-summary verhindert die Zusammenfassung an Klassengrenzen. network classful für 192.168.1.0 (LAN) und 10.0.0.0 (WAN). passive-interface Gi0/0 ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "2) R2 — komplett (LAN + zwei WAN-Links)",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface gi0/0\nip address 192.168.2.1 255.255.255.0\nno shutdown\nexit\ninterface gi0/1\nip address 10.0.12.2 255.255.255.252\nno shutdown\nexit\ninterface gi0/2\nip address 10.0.23.1 255.255.255.252\nno shutdown\nexit",
                explanation:
                  "Gi0/0 = LAN 192.168.2.0/24, Gi0/1 = /30 zu R1 (.2), Gi0/2 = /30 zu R3 (.1).",
              },
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 192.168.2.0\nnetwork 10.0.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "network 192.168.2.0 (LAN) + classful 10.0.0.0 (deckt 10.0.12.0/30 UND 10.0.23.0/30). passive nur Gi0/0 (LAN); beide WAN-Interfaces bleiben aktiv.",
              },
            ],
          },
        ],
      },
      {
        title: "3) R3 — komplett (LAN 192.168.3.0/24)",
        blocks: [
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R3\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface gi0/1\nip address 10.0.23.2 255.255.255.252\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.3.1 255.255.255.0\nno shutdown\nexit",
                explanation: "Gi0/1 = /30 zu R2 (.2), Gi0/0 = LAN 192.168.3.0/24 (Gateway .1).",
              },
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 192.168.3.0\nnetwork 10.0.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation: "network 192.168.3.0 (LAN) + classful 10.0.0.0 (WAN). passive-interface Gi0/0 ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "4) Switches (SW1–SW3) + Endgeräte (PC0–PC2)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1",
                explanation: "Reiner Layer-2-Access-Switch im R1-LAN — alle Ports Default-VLAN 1, keine IP nötig. SW2 und SW3 identisch mit 'hostname SW2' bzw. 'hostname SW3'.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW2", explanation: "Access-Switch im R2-LAN." },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW3", explanation: "Access-Switch im R3-LAN." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.2.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.2.1", explanation: "Gateway = R2 Gi0/0." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.3.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.3.1", explanation: "Gateway = R3 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "5) Konvergenz & Verifikation (pro Gerät)",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip route rip\nshow ip protocols",
                explanation:
                  "Erwartet: 'R 192.168.2.0/24 [120/1] via 10.0.12.2' und 'R 192.168.3.0/24 [120/2] via 10.0.12.2'. show ip protocols zeigt Version 2, passive Gi0/0, Timer 30/180/240 s.",
              },
            ],
          },
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2#",
            commands: [
              {
                cmd: "show ip route rip",
                explanation: "R2 sieht 'R 192.168.1.0/24 [120/1] via 10.0.12.1' und 'R 192.168.3.0/24 [120/1] via 10.0.23.2'.",
              },
            ],
          },
          {
            device: "R3",
            mode: "privileged",
            modeLabel: "R3#",
            commands: [
              {
                cmd: "show ip route rip",
                explanation: "R3 sieht 'R 192.168.2.0/24 [120/1] via 10.0.23.1' und 'R 192.168.1.0/24 [120/2] via 10.0.23.1'.",
              },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0> (Command Prompt)",
            commands: [
              {
                cmd: "ping 192.168.3.10\ntracert 192.168.3.10",
                explanation: "Ende-zu-Ende über 2 Router-Hops; tracert zeigt PC0 → R1 → R2 → R3 → PC2.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip route rip", expected: "R 192.168.3.0/24 [120/2] via 10.0.12.2 (auf R1)" },
      { cmd: "show ip protocols", expected: "Routing Protocol is rip, Sending updates every 30 seconds" },
      { cmd: "ping 192.168.3.10 (von PC0)", expected: "Erfolgreich über 2 Router-Hops" },
      { cmd: "debug ip rip (kurz!)", expected: "v2 updates via Multicast 224.0.0.9, danach undebug all" },
    ],
    glossary: [
      { term: "Dynamisches Routing", def: "Router tauschen Routen automatisch aus, statt sie manuell zu pflegen." },
      { term: "Distance-Vector", def: "Protokollfamilie, die Routen nach Richtung + Entfernung lernt (RIP, EIGRP)." },
      { term: "RIP", def: "Routing Information Protocol — einfaches Distance-Vector-Protokoll, AD 120." },
      { term: "Hop-Count", def: "RIP-Metrik = Anzahl Router bis zum Ziel. Maximum 15 (16 = unerreichbar)." },
      { term: "version 2", def: "Macht RIP classless (überträgt Subnetzmasken, Multicast 224.0.0.9)." },
      { term: "no auto-summary", def: "Verhindert die Zusammenfassung an Klassengrenzen — fast immer nötig." },
      { term: "network (classful)", def: "Bei RIP wird das Netz CLASSFUL angegeben (ohne Wildcard-Maske)." },
      { term: "passive-interface", def: "Sendet auf diesem Interface keine Updates (z. B. ins LAN ohne Nachbar-Router)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // RIPv2 + Passive Interface (CIS4-Übung 25.06.2026, 4 Router)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rip-v2-passive",
    icon: <Shuffle size={20} />,
    title: "RIPv2 + Passive Interface (4 Router)",
    subtitle: "version 2 · no auto-summary · passive-interface · [120/3]",
    difficulty: "Mittel",
    duration: "30 min",
    context: {
      problem:
        "Vier Router, zwei entfernte Server-LANs, ein gemeinsames Transit-Segment. Statische Routen wären mühsam — und RIP soll keine Updates in die LANs schicken, wo keine Router stehen.",
      purpose:
        "RIPv2 auf allen vier Routern aktivieren (classless, no auto-summary), LAN-Interfaces als passive-interface setzen und die erwartete Metrik [120/3] verifizieren — exakt die CIS4-Übung.",
    },
    topology: {
      description:
        "R1 (LAN 172.16.0.0/24, PC0) → R2 → gemeinsames Transit 10.0.0.8/29 über SW1 → R3 (LAN 192.168.0.0/24, Server0) und R4 (LAN 192.168.1.0/24, Server1).",
      devices: [
        { type: "router", label: "R1 / R2 / R3 / R4", count: 4 },
        { type: "switch", label: "SW1 (2960)", count: 1 },
        { type: "pc", label: "PC0 + Server0/1", count: 3 },
      ],
      connections: [
        "R1 Gi0/0 172.16.0.254/24 (PC0 .101) — R1 Gi0/1 10.1.0.1/30 ↔ R2 Gi0/1 10.1.0.2/30",
        "R2 Gi0/0 10.0.0.9/29 — SW1 — R3 Fa/Gi 10.0.0.10/29 · R4 10.0.0.11/29  (Segment 10.0.0.8/29)",
        "R3 Gi0/0 192.168.0.254/24 (Server0 .11) · R4 Gi0/0 192.168.1.254/24 (Server1 .11)",
      ],
      hint: "RIP nimmt CLASSFUL-network-Angaben (10.0.0.0 deckt 10.1.0.0/30 UND 10.0.0.8/29). version 2 + no auto-summary sind Pflicht, sonst werden die Subnetze falsch zusammengefasst.",
    },
    steps: [
      {
        title: "1) R1 — komplett (hostname → Interfaces → RIPv2 → passive)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nenable secret class\nno ip domain-lookup",
                explanation:
                  "Basis: Privileged-Mode, Hostname, verschlüsseltes Enable-Passwort, und no ip domain-lookup gegen Tippfehler-Hänger.",
              },
              {
                cmd: "interface GigabitEthernet0/0\nip address 172.16.0.254 255.255.255.0\nno shutdown\nexit\ninterface GigabitEthernet0/1\nip address 10.1.0.1 255.255.255.252\nno shutdown\nexit",
                explanation:
                  "Gi0/0 = PC0-LAN (.254 Gateway), Gi0/1 = WAN-/30 zu R2 (.1). Beide mit no shutdown aktivieren.",
              },
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 172.16.0.0\nnetwork 10.0.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "version 2 = classless, no auto-summary verhindert die Zusammenfassung an der Klassengrenze. network für BEIDE direkt verbundenen classful-Netze (172.16.0.0 LAN, 10.0.0.0 WAN). passive-interface Gi0/0 = keine RIP-Updates ins PC-LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "2) R2 — komplett (Transit-Router, kein LAN)",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nip address 10.1.0.2 255.255.255.252\nno shutdown\nexit\ninterface GigabitEthernet0/0\nip address 10.0.0.9 255.255.255.248\nno shutdown\nexit",
                explanation:
                  "Gi0/1 = WAN-/30 zu R1 (.2), Gi0/0 = Transit-Segment 10.0.0.8/29 zu SW1 (.9). Beide no shutdown.",
              },
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 10.0.0.0\nexit",
                explanation:
                  "R2 hat NUR 10er-Netze (10.1.0.0/30 + 10.0.0.8/29) → eine classful network-Zeile 10.0.0.0 genügt. KEIN passive-interface — beide Interfaces zeigen zu Routern.",
              },
            ],
          },
        ],
      },
      {
        title: "3) R3 — komplett (LAN 192.168.0.0/24, Server0)",
        blocks: [
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R3\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nip address 10.0.0.10 255.255.255.248\nno shutdown\nexit\ninterface GigabitEthernet0/0\nip address 192.168.0.254 255.255.255.0\nno shutdown\nexit",
                explanation:
                  "Gi0/1 = Transit-Segment (.10), Gi0/0 = Server0-LAN (.254 Gateway). Beide no shutdown.",
              },
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 10.0.0.0\nnetwork 192.168.0.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "network für beide classful-Netze (10.0.0.0 Transit, 192.168.0.0 LAN). passive-interface Gi0/0 = keine Updates ins Server-LAN; das Transit-Interface bleibt aktiv.",
              },
            ],
          },
        ],
      },
      {
        title: "4) R4 — komplett (LAN 192.168.1.0/24, Server1)",
        blocks: [
          {
            device: "R4",
            mode: "global",
            modeLabel: "R4(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R4\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface GigabitEthernet0/1\nip address 10.0.0.11 255.255.255.248\nno shutdown\nexit\ninterface GigabitEthernet0/0\nip address 192.168.1.254 255.255.255.0\nno shutdown\nexit",
                explanation:
                  "Gi0/1 = Transit-Segment (.11), Gi0/0 = Server1-LAN (.254 Gateway). Beide no shutdown.",
              },
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 10.0.0.0\nnetwork 192.168.1.0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "network für 10.0.0.0 (Transit) und 192.168.1.0 (LAN). passive-interface Gi0/0 ins Server-LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "5) SW1 + Endgeräte (PC0, Server0, Server1)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1",
                explanation:
                  "Der 2960 ist reiner Layer-2-Transit für das Segment 10.0.0.8/29 — alle Ports bleiben im Default-VLAN 1 (Access), keine IP nötig. Nur Hostname zur Wiedererkennung.",
              },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              {
                cmd: "IP-Adresse:    172.16.0.101\nSubnetzmaske:  255.255.255.0\nGateway:       172.16.0.254",
                explanation: "Statisch am PC0. Gateway = R1 Gi0/0.",
              },
            ],
          },
          {
            device: "Server0",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              {
                cmd: "IP-Adresse:    192.168.0.11\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.0.254",
                explanation: "Gateway = R3 Gi0/0.",
              },
            ],
          },
          {
            device: "Server1",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              {
                cmd: "IP-Adresse:    192.168.1.11\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.254",
                explanation: "Gateway = R4 Gi0/0.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Verifikation — jedes Gerät einzeln",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip route rip\nshow ip protocols",
                explanation:
                  "Erwartet: 'R 192.168.0.0/24 [120/2] via 10.1.0.2' und 'R 192.168.1.0/24 [120/2] via 10.1.0.2' — [120/2] = AD 120, 2 Hops (über R2 → R3/R4). show ip protocols zeigt send/receive version 2, passive interface Gi0/0, Timer 30/180/240 s.",
              },
            ],
          },
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2#",
            commands: [
              {
                cmd: "show ip route rip\nshow ip rip database",
                explanation:
                  "R2 lernt 172.16.0.0/24 [120/1] (von R1) sowie 192.168.0.0/24 und 192.168.1.0/24 je [120/1] (von R3/R4). Die RIP-Datenbank listet jedes Subnetz mit Metrik/Quelle.",
              },
            ],
          },
          {
            device: "R3",
            mode: "privileged",
            modeLabel: "R3#",
            commands: [
              {
                cmd: "show ip route rip",
                explanation:
                  "R3 sieht 172.16.0.0/24 [120/2] (via R2) und 192.168.1.0/24 [120/2] (R4 über dasselbe Segment, via R2).",
              },
            ],
          },
          {
            device: "R4",
            mode: "privileged",
            modeLabel: "R4#",
            commands: [
              {
                cmd: "show ip route rip",
                explanation:
                  "R4 sieht 172.16.0.0/24 [120/2] und 192.168.0.0/24 [120/2].",
              },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0> (Command Prompt)",
            commands: [
              {
                cmd: "ping 192.168.0.11\nping 192.168.1.11\ntracert 192.168.0.11",
                explanation:
                  "Beide Server müssen erreichbar sein. tracert zeigt den Pfad PC0 → R1 → R2 → R3/R4 → Server.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip route rip (R1)", expected: "R 192.168.0.0/24 [120/2] via 10.1.0.2 + R 192.168.1.0/24 [120/2] via 10.1.0.2" },
      { cmd: "show ip protocols (R1/R3/R4)", expected: "send version 2 / receive 2, passive interfaces: Gi0/0" },
      { cmd: "ping 192.168.0.11 / 192.168.1.11 (PC0)", expected: "Beide erfolgreich" },
    ],
    glossary: [
      { term: "version 2", def: "Macht RIP classless (Subnetzmasken werden mitgesendet, Multicast 224.0.0.9)." },
      { term: "no auto-summary", def: "Verhindert die Zusammenfassung an Klassengrenzen — bei /30+/29 im 10er-Netz Pflicht." },
      { term: "passive-interface", def: "Kein RIP-Senden/Empfangen auf dem Interface — für LAN-Seiten ohne Nachbar-Router." },
      { term: "network (classful)", def: "RIP nimmt das classful-Netz (10.0.0.0) ohne Wildcard — aktiviert alle Interfaces darin." },
      { term: "[120/2]", def: "AD 120 (RIP), Metrik 2 Hops bis zum Zielnetz (R1 → R2 → R3/R4)." },
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
    context: {
      problem:
        "RIP konvergiert langsam und ist auf 15 Hops begrenzt. Größere Netze brauchen ein schnelleres, skalierbares Protokoll, das Pfade nach echter Leitungsqualität wählt.",
      purpose:
        "OSPF (Link-State) berechnet kürzeste Pfade per Cost, konvergiert schnell und skaliert über Areas. Hier die Single-Area-0-Grundkonfiguration.",
    },
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
        title: "R2 und R3 vollständig konfigurieren",
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
    glossary: [
      { term: "OSPF", def: "Open Shortest Path First — Link-State-Protokoll, AD 110, nutzt Dijkstra/SPF." },
      { term: "Link-State", def: "Jeder Router kennt die komplette Topologie und rechnet selbst den besten Pfad." },
      { term: "Area 0", def: "Backbone-Area; in Single-Area liegen alle Netze hier." },
      { term: "router-id", def: "Eindeutige 32-Bit-Kennung eines OSPF-Routers (sonst höchste Loopback-/Interface-IP)." },
      { term: "Wildcard-Maske", def: "Invertierte Maske im network-Befehl (z. B. /24 → 0.0.0.255, /30 → 0.0.0.3)." },
      { term: "network <netz> <wildcard> area <n>", def: "Aktiviert OSPF auf passenden Interfaces und ordnet sie einer Area zu." },
      { term: "Cost", def: "OSPF-Metrik, abgeleitet aus der Bandbreite (niedriger = besser)." },
      { term: "Adjacency", def: "Voll ausgehandelte OSPF-Nachbarschaft, über die Routen ausgetauscht werden." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // OSPF Single-Area: Loopback-RID & Wildcard (CIS4-Übung)
  // ─────────────────────────────────────────────────────────────
  {
    id: "ospf-rid-wildcard",
    icon: <Globe size={20} />,
    title: "OSPF Single-Area — Loopback-RID & Wildcard",
    subtitle: "3 Router · alle in Area 0 · Wildcard-Drill · Troubleshooting",
    difficulty: "Mittel",
    duration: "30 min",
    context: {
      problem:
        "Drei Router in Reihe, zwei End-LANs. OSPF soll alle Netze in einer einzigen Area verteilen — mit stabilen Router-IDs und korrekten Wildcard-Masken im network-Befehl.",
      purpose:
        "OSPF Single-Area (Area 0) sauber aufsetzen: Loopbacks als stabile RID, network mit der richtigen Wildcard, Nachbarschaften bis FULL prüfen und die typischen Adjacency-Fehler verstehen.",
    },
    topology: {
      description:
        "PC-links — R1 — R2 — R3 — PC-rechts. Zwei /24-LANs an den Enden, zwei /30-Punkt-zu-Punkt-Links zwischen den Routern. Jeder Router hat ein Loopback für die RID.",
      devices: [
        { type: "router", label: "R1 / R2 / R3", count: 3 },
        { type: "pc", label: "PC-links / PC-rechts", count: 2 },
      ],
      connections: [
        "R1 Gi0/0 192.168.1.254/24 (PC-links .11) — R1 Gi0/1 192.168.10.1/30 ↔ R2 Gi0/2 192.168.10.2/30",
        "R2 Gi0/1 192.168.20.1/30 ↔ R3 Gi0/2 192.168.20.2/30",
        "R3 Gi0/0 192.168.4.254/24 (PC-rechts .11) · Loopbacks: R1 1.1.1.1 · R2 2.2.2.2 · R3 3.3.3.3",
      ],
      hint: "Wildcard = invertierte Maske: /24 → 0.0.0.255, /30 → 0.0.0.3. Im network-Befehl steht die WILDCARD, nicht die Subnetzmaske.",
    },
    steps: [
      {
        title: "1) R1 — komplett (Loopback-RID, Interfaces, OSPF)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nenable secret class\nno ip domain-lookup",
                explanation: "Basis: Hostname, Enable-Secret, no ip domain-lookup.",
              },
              {
                cmd: "interface loopback 0\nip address 1.1.1.1 255.255.255.255\nexit",
                explanation:
                  "Loopback ist immer up/up → stabile RID. RID-Auswahl: manuell > höchste Loopback-IP > höchste physische IP.",
              },
              {
                cmd: "interface gi0/0\nip address 192.168.1.254 255.255.255.0\nno shutdown\nexit\ninterface gi0/1\nip address 192.168.10.1 255.255.255.252\nno shutdown\nexit",
                explanation: "Gi0/0 = LAN 192.168.1.0/24 (PC-links, Gateway .254), Gi0/1 = /30-Link zu R2 (.1).",
              },
              {
                cmd: "router ospf 1\nrouter-id 1.1.1.1\nnetwork 192.168.1.0 0.0.0.255 area 0\nnetwork 192.168.10.0 0.0.0.3 area 0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "router-id explizit. LAN /24 → Wildcard 0.0.0.255, Link /30 → 0.0.0.3, alle in area 0. passive-interface Gi0/0 (LAN ohne Nachbar-Router).",
              },
            ],
          },
        ],
      },
      {
        title: "2) R2 — komplett (Transit, zwei /30-Links)",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface loopback 0\nip address 2.2.2.2 255.255.255.255\nexit",
                explanation: "Loopback-RID 2.2.2.2.",
              },
              {
                cmd: "interface gi0/2\nip address 192.168.10.2 255.255.255.252\nno shutdown\nexit\ninterface gi0/1\nip address 192.168.20.1 255.255.255.252\nno shutdown\nexit",
                explanation: "Gi0/2 = /30 zu R1 (.2), Gi0/1 = /30 zu R3 (.1). R2 hat kein LAN.",
              },
              {
                cmd: "router ospf 1\nrouter-id 2.2.2.2\nnetwork 192.168.10.0 0.0.0.3 area 0\nnetwork 192.168.20.0 0.0.0.3 area 0\nexit",
                explanation: "Beide /30-Links in area 0. Kein passive-interface — beide Interfaces zeigen zu Routern.",
              },
            ],
          },
        ],
      },
      {
        title: "3) R3 — komplett (LAN 192.168.4.0/24, PC-rechts)",
        blocks: [
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R3\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface loopback 0\nip address 3.3.3.3 255.255.255.255\nexit",
                explanation: "Loopback-RID 3.3.3.3.",
              },
              {
                cmd: "interface gi0/2\nip address 192.168.20.2 255.255.255.252\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.4.254 255.255.255.0\nno shutdown\nexit",
                explanation: "Gi0/2 = /30 zu R2 (.2), Gi0/0 = LAN 192.168.4.0/24 (PC-rechts, Gateway .254).",
              },
              {
                cmd: "router ospf 1\nrouter-id 3.3.3.3\nnetwork 192.168.20.0 0.0.0.3 area 0\nnetwork 192.168.4.0 0.0.0.255 area 0\npassive-interface GigabitEthernet0/0\nexit",
                explanation: "Link /30 + LAN /24 in area 0. passive-interface Gi0/0 ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "4) Endgeräte (PC-links, PC-rechts)",
        blocks: [
          {
            device: "PC-links",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.11\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.254", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC-rechts",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.4.11\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.4.254", explanation: "Gateway = R3 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "5) Verifikation (pro Gerät) + Wildcard-Drill",
        blocks: [
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2#",
            commands: [
              {
                cmd: "show ip ospf neighbor\nshow ip ospf interface brief",
                explanation:
                  "R2 sieht R1 (1.1.1.1) UND R3 (3.3.3.3) als FULL. interface brief zeigt die OSPF-Interfaces + Cost.",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip ospf neighbor\nshow ip route ospf",
                explanation: "R1 sieht nur R2 (2.2.2.2) als FULL. route ospf zeigt 'O 192.168.4.0/24 [110/x] via 192.168.10.2'.",
              },
            ],
          },
          {
            device: "R3",
            mode: "privileged",
            modeLabel: "R3#",
            commands: [
              {
                cmd: "show ip route ospf",
                explanation: "R3 sieht 'O 192.168.1.0/24 [110/x] via 192.168.20.1'.",
              },
            ],
          },
          {
            device: "PC-links",
            mode: "desktop",
            modeLabel: "PC-links> (Command Prompt)",
            commands: [
              {
                cmd: "ping 192.168.4.11\ntracert 192.168.4.11",
                explanation:
                  "Ende-zu-Ende über R1 → R2 → R3. Wildcard-Übung zum Mitrechnen: /24→0.0.0.255 · /25→0.0.0.127 · /16→0.0.255.255 · /30→0.0.0.3 · /8→0.255.255.255.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ospf neighbor (R2)", expected: "R1 (1.1.1.1) FULL und R3 (3.3.3.3) FULL" },
      { cmd: "show ip route ospf (R1)", expected: "O 192.168.4.0/24 [110/x] via 192.168.10.2" },
      { cmd: "ping 192.168.4.11 (PC-links)", expected: "Erfolgreich, tracert-Pfad R1 → R2 → R3" },
    ],
    glossary: [
      { term: "Router-ID", def: "Eindeutige 32-Bit-ID: manuell > höchste Loopback-IP > höchste physische IP." },
      { term: "Loopback", def: "Logisches Interface, immer up/up — stabile Basis für die RID." },
      { term: "Wildcard-Maske", def: "Invertierte Subnetzmaske; 1-Bit = 'egal'. Im OSPF-network-Befehl statt der Maske." },
      { term: "Single-Area", def: "Alle Netze in Area 0 (Backbone) — keine ABRs nötig." },
      { term: "FULL", def: "Endzustand der Adjacency: alle LSAs synchronisiert." },
      { term: "Adjacency-Voraussetzung", def: "Gleiches Subnetz, gleiche Maske, gleiches Hello-/Dead-Intervall, gleiche Area." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // OSPF DR/BDR-Wahl auf Multi-Access (Broadcast-Segment via Switch)
  // ─────────────────────────────────────────────────────────────
  {
    id: "ospf-dr-bdr-election",
    icon: <Globe size={20} />,
    title: "OSPF DR/BDR-Wahl (Multi-Access)",
    subtitle: "Election · Priority · RID-/Loopback-Tiebreaker · DROTHER",
    difficulty: "Fortgeschritten",
    duration: "35 min",
    context: {
      problem:
        "Auf einem gemeinsamen Broadcast-Segment (mehrere Router an einem Switch) würde jeder Router mit jedem eine Full-Adjacency bilden — n·(n-1)/2 Beziehungen und LSA-Fluten. Das skaliert nicht.",
      purpose:
        "OSPF wählt pro Multi-Access-Segment einen Designated Router (DR) und Backup (BDR) als zentrale Sammelstelle. Dieses Lab zeigt die Wahl, wie Priority sie steuert und warum der RID (höchste Loopback) der Tiebreaker ist.",
    },
    topology: {
      description:
        "Vier Router R1–R4 hängen über Switch Sw1 am selben Broadcast-Segment 10.1.0.0/29 (.1–.4). Jeder hat ein eigenes /24-LAN und ein Loopback Lo0 (192.168.254.1–4/32) als RID-Quelle. Alles in Area 0.",
      devices: [
        { type: "router", label: "R1 / R2 / R3 / R4", count: 4 },
        { type: "switch", label: "Sw1 (Broadcast-Domäne)", count: 1 },
        { type: "pc", label: "PC0 + Server0/1/2", count: 4 },
      ],
      connections: [
        "R1..R4 Gi0/1 → Sw1 → gemeinsames Segment 10.1.0.0/29 (R1 .1 · R2 .2 · R3 .3 · R4 .4)",
        "LANs: R1 192.168.1.0/24 (PC0) · R2 192.168.2.0/24 · R3 192.168.3.0/24 · R4 192.168.4.0/24 (alle .254, Hosts .11)",
        "Loopbacks Lo0: R1 192.168.254.1/32 · R2 .2 · R3 .3 · R4 .4  (= Router-ID)",
      ],
      hint: "DR/BDR-Wahl nur auf Multi-Access (Broadcast). Reihenfolge: höchste PRIORITY gewinnt, bei Gleichstand höchste ROUTER-ID. Priority 0 = nie DR/BDR. Die Wahl ist NICHT preemptiv.",
    },
    steps: [
      {
        title: "1) R1 — komplett (Loopback-RID, Segment, LAN, OSPF)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nenable secret class\nno ip domain-lookup",
                explanation: "Basis: Hostname, Enable-Secret, no ip domain-lookup.",
              },
              {
                cmd: "interface loopback 0\nip address 192.168.254.1 255.255.255.255\nexit\ninterface gi0/1\nip address 10.1.0.1 255.255.255.248\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.1.254 255.255.255.0\nno shutdown\nexit",
                explanation:
                  "Loopback (= RID-Quelle), Gi0/1 = Broadcast-Segment 10.1.0.0/29 (.1), Gi0/0 = LAN 192.168.1.0/24 (Gateway .254).",
              },
              {
                cmd: "router ospf 1\nnetwork 10.1.0.0 0.0.0.7 area 0\nnetwork 192.168.1.0 0.0.0.255 area 0\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "Segment (/29 → Wildcard 0.0.0.7) und LAN in Area 0. Ohne manuelle router-id nimmt OSPF die höchste Loopback-IP als RID (192.168.254.1). passive-interface Gi0/0 ins LAN — das Segment-Interface bleibt aktiv (dort läuft die Wahl).",
              },
            ],
          },
        ],
      },
      {
        title: "2) R2 — komplett",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface loopback 0\nip address 192.168.254.2 255.255.255.255\nexit\ninterface gi0/1\nip address 10.1.0.2 255.255.255.248\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.2.254 255.255.255.0\nno shutdown\nexit",
                explanation: "Loopback-RID .2, Segment .2, LAN 192.168.2.0/24.",
              },
              {
                cmd: "router ospf 1\nnetwork 10.1.0.0 0.0.0.7 area 0\nnetwork 192.168.2.0 0.0.0.255 area 0\npassive-interface GigabitEthernet0/0\nexit",
                explanation: "Segment + LAN in Area 0, passive ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "3) R3 — komplett",
        blocks: [
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R3\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface loopback 0\nip address 192.168.254.3 255.255.255.255\nexit\ninterface gi0/1\nip address 10.1.0.3 255.255.255.248\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.3.254 255.255.255.0\nno shutdown\nexit",
                explanation: "Loopback-RID .3, Segment .3, LAN 192.168.3.0/24.",
              },
              {
                cmd: "router ospf 1\nnetwork 10.1.0.0 0.0.0.7 area 0\nnetwork 192.168.3.0 0.0.0.255 area 0\npassive-interface GigabitEthernet0/0\nexit",
                explanation: "Segment + LAN in Area 0, passive ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "4) R4 — komplett",
        blocks: [
          {
            device: "R4",
            mode: "global",
            modeLabel: "R4(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R4\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface loopback 0\nip address 192.168.254.4 255.255.255.255\nexit\ninterface gi0/1\nip address 10.1.0.4 255.255.255.248\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.4.254 255.255.255.0\nno shutdown\nexit",
                explanation: "Loopback-RID .4 (höchste!), Segment .4, LAN 192.168.4.0/24.",
              },
              {
                cmd: "router ospf 1\nnetwork 10.1.0.0 0.0.0.7 area 0\nnetwork 192.168.4.0 0.0.0.255 area 0\npassive-interface GigabitEthernet0/0\nexit",
                explanation: "Segment + LAN in Area 0, passive ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Sw1 (Broadcast-Domäne) + Endgeräte",
        blocks: [
          {
            device: "Sw1",
            mode: "global",
            modeLabel: "Sw1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname Sw1",
                explanation: "Reiner Layer-2-Switch für das Segment 10.1.0.0/29 (alle 4 Router hängen dran) — Default-VLAN 1, keine IP nötig.",
              },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.11\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.254", explanation: "R1-LAN." },
            ],
          },
          {
            device: "Server0 / Server1 / Server2",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              {
                cmd: "Server0:  192.168.2.11  / 255.255.255.0 / GW 192.168.2.254\nServer1:  192.168.3.11  / 255.255.255.0 / GW 192.168.3.254\nServer2:  192.168.4.11  / 255.255.255.0 / GW 192.168.4.254",
                explanation: "Je ein Host in den LANs von R2/R3/R4.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Default-Wahl beobachten (vor Priority)",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip ospf neighbor",
                explanation:
                  "Alle Priority 1 (Default) → höchste RID gewinnt: DR = R4 (192.168.254.4), BDR = R3 (192.168.254.3). R1 sieht R4 als FULL/DR, R3 als FULL/BDR, R2 als 2-WAY/DROTHER. Das ist der Loopback-Tiebreaker.",
              },
            ],
          },
        ],
      },
      {
        title: "7) Election per Priority steuern (pro Router)",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config-if)#",
            commands: [
              {
                cmd: "interface gi0/1\nip ospf priority 255\nexit",
                explanation: "Priority 255 = stärkster DR-Kandidat → R1 soll DR werden. Priority (0–255) wird PRO Segment-Interface gesetzt und schlägt die RID.",
              },
            ],
          },
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config-if)#",
            commands: [
              { cmd: "interface gi0/1\nip ospf priority 100\nexit", explanation: "Priority 100 → R2 soll BDR werden." },
            ],
          },
          {
            device: "R3",
            mode: "interface",
            modeLabel: "R3(config-if)#",
            commands: [
              { cmd: "interface gi0/1\nip ospf priority 0\nexit", explanation: "Priority 0 = dauerhaft DROTHER (nie wählbar)." },
            ],
          },
          {
            device: "R4",
            mode: "interface",
            modeLabel: "R4(config-if)#",
            commands: [
              { cmd: "! R4 behält Priority 1 (Default) — keine Änderung nötig", explanation: "R4 bleibt auf Default-Priority 1 → wird nach der Neuwahl DROTHER." },
            ],
          },
        ],
      },
      {
        title: "8) Neuwahl erzwingen (Wahl ist NICHT preemptiv!)",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "clear ip ospf process\n(Bestätigen mit: yes)",
                explanation:
                  "Ein bestehender DR bleibt DR, auch wenn später ein Router mit höherer Priority dazukommt (non-preemptive). 'clear ip ospf process' erzwingt die Neuwahl.",
              },
            ],
          },
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2#",
            commands: [
              { cmd: "clear ip ospf process\n(Bestätigen mit: yes)", explanation: "Auf JEDEM Router des Segments ausführen." },
            ],
          },
          {
            device: "R3",
            mode: "privileged",
            modeLabel: "R3#",
            commands: [
              { cmd: "clear ip ospf process\n(Bestätigen mit: yes)", explanation: "Auch auf R3." },
            ],
          },
          {
            device: "R4",
            mode: "privileged",
            modeLabel: "R4#",
            commands: [
              { cmd: "clear ip ospf process\n(Bestätigen mit: yes)", explanation: "Auch auf R4. Ergebnis nach Neuwahl: DR = R1 (Priority 255), BDR = R2 (Priority 100), R3/R4 = DROTHER." },
            ],
          },
        ],
      },
      {
        title: "9) Verifikation — DR/BDR/DROTHER & States",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip ospf neighbor",
                explanation:
                  "Spalte 'State' zeigt FULL/DR und FULL/BDR zu DR und BDR, aber 2-WAY/DROTHER zwischen zwei DROTHERn — DROTHER bilden untereinander BEWUSST keine Full-Adjacency (normal, kein Fehler!).",
              },
              {
                cmd: "show ip ospf interface gi0/1",
                explanation:
                  "Zeigt 'Designated Router (ID) 192.168.254.1', 'Backup Designated Router (ID) 192.168.254.2', die eigene 'Router Priority' und 'State DR/BDR/DROTHER'. Der zentrale Nachweis der Wahl.",
              },
              {
                cmd: "show ip ospf neighbor detail | include Priority",
                explanation:
                  "Bestätigt die wirksame Priority je Nachbar — gut, um einen versehentlich auf 0 gesetzten Router zu finden.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ospf interface gi0/1 (R1)", expected: "State DR, Designated Router (ID) 192.168.254.1, Backup DR 192.168.254.2" },
      { cmd: "show ip ospf neighbor (R1)", expected: "Nachbarn als FULL/BDR bzw. FULL/DROTHER; zwischen DROTHERn 2-WAY/DROTHER" },
      { cmd: "Default ohne Priority", expected: "DR = R4 (RID 192.168.254.4), BDR = R3 — höchste/zweithöchste Router-ID" },
      { cmd: "clear ip ospf process", expected: "Erzwingt Neuwahl nach Priority-Änderung (non-preemptive)" },
    ],
    glossary: [
      { term: "DR (Designated Router)", def: "Zentrale Sammelstelle auf einem Multi-Access-Segment; jeder Router bildet Full-Adjacency nur mit DR und BDR." },
      { term: "BDR", def: "Backup Designated Router — übernimmt sofort, wenn der DR ausfällt." },
      { term: "DROTHER", def: "Router, der weder DR noch BDR ist; bleibt mit anderen DROTHERn im Zustand 2-WAY." },
      { term: "Priority", def: "ip ospf priority 0–255 (Default 1), pro Interface. Höchste gewinnt DR; 0 = nie DR/BDR." },
      { term: "Router-ID (Tiebreaker)", def: "Bei gleicher Priority gewinnt die höchste RID = höchste Loopback-IP (sonst höchste physische IP)." },
      { term: "non-preemptive", def: "Ein gewählter DR wird NICHT verdrängt; Neuwahl nur per 'clear ip ospf process' oder Ausfall." },
      { term: "224.0.0.6", def: "AllDRouters-Multicast: DROTHER sprechen DR/BDR darüber an (DR flutet auf 224.0.0.5)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 18. OSPF Multi-Area
  // ─────────────────────────────────────────────────────────────
  {
    id: "ospf-multiarea",
    icon: <Stack size={20} />,
    title: "OSPF Multi-Area",
    subtitle: "Area 0 + Area 1 mit ABR, LSA-Typen, Stub-Area",
    difficulty: "Fortgeschritten",
    duration: "25 min",
    context: {
      problem:
        "Ein einziges großes OSPF-Area zwingt jeden Router, die vollständige Topologie-Datenbank zu halten und bei jeder Änderung neu zu rechnen — das skaliert schlecht.",
      purpose:
        "OSPF in mehrere Areas aufteilen, die alle an Area 0 hängen. ABRs fassen zwischen den Areas zusammen und begrenzen so den Rechen-/Speicheraufwand. Grundprinzip hierarchischer OSPF-Netze.",
    },
    topology: {
      description:
        "3 Router: R1 in Area 0, R2 ist ABR (Area Border Router) zwischen Area 0 und Area 1, R3 in Area 1. Area 1 wird als Stub konfiguriert.",
      devices: [{ type: "router", label: "R1, R2, R3", count: 3 }],
      connections: ["R1 ↔ R2 Gi0/0 (10.0.0.0/30, Area 0)", "R2 ↔ R3 Gi0/1 (10.0.0.4/30, Area 1)"],
      hint: "ABR (R2) hat Interfaces in MEHREREN Areas. Er generiert LSA Type 3 (Summary), um Routen zwischen Areas zu propagieren.",
    },
    steps: [
      {
        title: "R1 — Backbone (Area 0)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "router ospf 1", explanation: "Process-ID 1 (lokal bedeutsam, muss nicht überall gleich sein)." },
              { cmd: "router-id 1.1.1.1", explanation: "Explizite Router-ID — sonst wählt OSPF die höchste Loopback-IP." },
              { cmd: "network 10.0.0.0 0.0.0.3 area 0", explanation: "Backbone-Link in Area 0 (Wildcard-Maske 0.0.0.3 = /30)." },
              { cmd: "network 192.168.1.0 0.0.0.255 area 0", explanation: "Lokales User-Netz auch in Area 0." },
              { cmd: "passive-interface Gi0/2", explanation: "Kein OSPF-Hello auf User-Interface — Sicherheit." },
            ],
          },
        ],
      },
      {
        title: "R2 — ABR (Area 0 + Area 1)",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "router ospf 1", explanation: "" },
              { cmd: "router-id 2.2.2.2", explanation: "" },
              { cmd: "network 10.0.0.0 0.0.0.3 area 0", explanation: "Link zu R1 in Area 0." },
              { cmd: "network 10.0.0.4 0.0.0.3 area 1", explanation: "Link zu R3 in Area 1. R2 ist jetzt ABR." },
              { cmd: "area 1 stub", explanation: "Area 1 als Stub: keine externen Routen (LSA 5) — R2 sendet stattdessen Default-Route nach Area 1." },
            ],
          },
        ],
      },
      {
        title: "R3 — Stub Area 1",
        blocks: [
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              { cmd: "router ospf 1", explanation: "" },
              { cmd: "router-id 3.3.3.3", explanation: "" },
              { cmd: "network 10.0.0.4 0.0.0.3 area 1", explanation: "Eigenes Backbone-Interface in Area 1." },
              { cmd: "area 1 stub", explanation: "PFLICHT: Stub-Konfiguration muss auf ALLEN Routern der Area gleich sein, sonst keine Adjacency." },
              { cmd: "network 192.168.3.0 0.0.0.255 area 1", explanation: "Lokales User-Netz in Area 1." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ospf neighbor", expected: "R1: FULL/BDR (auf R2), R3: FULL/BDR" },
      { cmd: "show ip ospf database", expected: "Type-1 (Router), Type-2 (Network), Type-3 (Summary) sichtbar" },
      { cmd: "show ip route ospf", expected: "O IA 192.168.1.0/24 (Inter-Area), O*IA 0.0.0.0/0 (Default in Stub)" },
    ],
    glossary: [
      { term: "Multi-Area OSPF", def: "Aufteilung der OSPF-Domäne in mehrere Areas zur besseren Skalierung." },
      { term: "Area 0 (Backbone)", def: "Zentrale Area; jede andere Area muss direkt mit ihr verbunden sein." },
      { term: "ABR", def: "Area Border Router — Router mit Interfaces in mehreren Areas; verbindet sie mit Area 0." },
      { term: "LSA", def: "Link State Advertisement — Bausteine der OSPF-Topologie-Datenbank." },
      { term: "Backbone-Regel", def: "Alle Nicht-Backbone-Areas müssen an Area 0 angebunden sein." },
      { term: "Summarization", def: "Zusammenfassung mehrerer Netze zu einer Route am ABR — entlastet andere Areas." },
      { term: "router-id", def: "Eindeutige Router-Kennung, hier je Router manuell gesetzt (1.1.1.1 …)." },
    ],
  },


  // ─────────────────────────────────────────────────────────────
  // EIGRP (CIS3 — Advanced Distance Vector)
  // ─────────────────────────────────────────────────────────────
  {
    id: "eigrp",
    icon: <Lightning size={20} />,
    title: "EIGRP Grundlagen",
    subtitle: "3 Router · DUAL · Successor & Feasible Successor",
    difficulty: "Fortgeschritten",
    duration: "25 min",
    context: {
      problem:
        "Man will OSPF-schnelle Konvergenz, aber einfacher zu konfigurieren — und mit einem Backup-Pfad, der ohne Neuberechnung sofort bereitsteht.",
      purpose:
        "EIGRP (Advanced Distance-Vector) nutzt den DUAL-Algorithmus mit Successor + Feasible Successor für Failover im Sub-Sekunden-Bereich. Das Lab zeigt AS-Nummer, Wildcard-network und no auto-summary.",
    },
    topology: {
      description:
        "Drei Router im Dreieck (Redundanz!). EIGRP berechnet per DUAL-Algorithmus den besten Pfad (Successor) und hält einen Backup-Pfad (Feasible Successor) sofort bereit.",
      devices: [
        { type: "router", label: "R1 / R2 / R3", count: 3 },
        { type: "switch", label: "SW1 / SW3", count: 2 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "R1 Gi0/1 ↔ R2 Gi0/1  (10.0.12.0/30)",
        "R2 Gi0/2 ↔ R3 Gi0/2  (10.0.23.0/30)",
        "R1 Gi0/2 ↔ R3 Gi0/1  (10.0.13.0/30) — Dreieck!",
        "LANs: R1=192.168.1.0/24, R3=192.168.3.0/24",
      ],
      hint: "EIGRP: Cisco-proprietär (heute teils offen), AD 90 intern / 170 extern, Multicast 224.0.0.10, Metrik aus Bandbreite + Delay.",
    },
    steps: [
      {
        title: "1) R1 — komplett (LAN + 2 WAN-Links + EIGRP)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nenable secret class\nno ip domain-lookup",
                explanation: "Basis: Hostname, Enable-Secret, no ip domain-lookup.",
              },
              {
                cmd: "interface gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown\nexit\ninterface gi0/1\nip address 10.0.12.1 255.255.255.252\nno shutdown\nexit\ninterface gi0/2\nip address 10.0.13.1 255.255.255.252\nno shutdown\nexit",
                explanation: "Gi0/0 = LAN 192.168.1.0/24 (Gateway .1), Gi0/1 = /30 zu R2 (.1), Gi0/2 = /30 zu R3 (.1) — das Dreieck.",
              },
              {
                cmd: "router eigrp 100\nnetwork 192.168.1.0 0.0.0.255\nnetwork 10.0.12.0 0.0.0.3\nnetwork 10.0.13.0 0.0.0.3\nno auto-summary\npassive-interface GigabitEthernet0/0\nexit",
                explanation:
                  "AS-Nummer 100 MUSS auf allen Routern identisch sein (sonst keine Nachbarschaft). EIGRP nutzt Wildcard-Masken (/30 → 0.0.0.3). no auto-summary + passive ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "2) R2 — komplett (Transit, zwei /30-Links)",
        blocks: [
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface gi0/1\nip address 10.0.12.2 255.255.255.252\nno shutdown\nexit\ninterface gi0/2\nip address 10.0.23.1 255.255.255.252\nno shutdown\nexit",
                explanation: "Gi0/1 = /30 zu R1 (.2), Gi0/2 = /30 zu R3 (.1). R2 hat kein LAN.",
              },
              {
                cmd: "router eigrp 100\nnetwork 10.0.12.0 0.0.0.3\nnetwork 10.0.23.0 0.0.0.3\nno auto-summary\nexit",
                explanation: "Gleiche AS 100. Beide /30-Links. Kein passive-interface — beide Interfaces zeigen zu Routern.",
              },
            ],
          },
        ],
      },
      {
        title: "3) R3 — komplett (LAN + 2 WAN-Links)",
        blocks: [
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R3\nenable secret class\nno ip domain-lookup",
                explanation: "Basiskonfiguration wie auf R1.",
              },
              {
                cmd: "interface gi0/1\nip address 10.0.13.2 255.255.255.252\nno shutdown\nexit\ninterface gi0/2\nip address 10.0.23.2 255.255.255.252\nno shutdown\nexit\ninterface gi0/0\nip address 192.168.3.1 255.255.255.0\nno shutdown\nexit",
                explanation: "Gi0/1 = /30 zu R1 (.2), Gi0/2 = /30 zu R2 (.2), Gi0/0 = LAN 192.168.3.0/24 (Gateway .1).",
              },
              {
                cmd: "router eigrp 100\nnetwork 192.168.3.0 0.0.0.255\nnetwork 10.0.13.0 0.0.0.3\nnetwork 10.0.23.0 0.0.0.3\nno auto-summary\npassive-interface GigabitEthernet0/0\nexit",
                explanation: "Gleiche AS 100. LAN + beide /30-Links. no auto-summary + passive ins LAN.",
              },
            ],
          },
        ],
      },
      {
        title: "4) Switches (SW1, SW3) + Endgeräte (PC0, PC1)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW1", explanation: "Access-Switch im R1-LAN, Default-VLAN 1." },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW3", explanation: "Access-Switch im R3-LAN, Default-VLAN 1." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop → IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.3.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.3.1", explanation: "Gateway = R3 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "Nachbarschaften & Topologie analysieren",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip eigrp neighbors",
                explanation:
                  "Nachbartabelle: Hello alle 5s über 224.0.0.10, Hold-Time 15s. Beide Nachbarn (R2 direkt, R3 direkt) müssen erscheinen.",
              },
              {
                cmd: "show ip eigrp topology",
                explanation:
                  "Die Topologie-Tabelle ist das EIGRP-Herzstück: P = Passive (stabil), zeigt Successor UND Feasible Successor mit FD/AD. Feasibility Condition: Backup-AD < Successor-FD.",
              },
              {
                cmd: "show ip route eigrp",
                explanation:
                  "D-Einträge mit [90/...]: AD 90, zusammengesetzte Metrik aus Bandbreite + Delay (K1/K3 default).",
              },
            ],
          },
        ],
      },
      {
        title: "DUAL-Failover testen",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config-if)#",
            commands: [
              {
                cmd: "interface gi0/2\nshutdown",
                explanation:
                  "Direkten Link zu R3 kappen. DUAL schaltet SOFORT auf den Feasible Successor über R2 um — ohne Neuberechnung, das ist EIGRPs Konvergenz-Vorteil gegenüber RIP/OSPF.",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip route eigrp",
                explanation:
                  "192.168.3.0/24 zeigt jetzt den Pfad über 10.0.12.2 (R2) — Failover in unter einer Sekunde. Danach: no shutdown.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip eigrp neighbors", expected: "2 Nachbarn mit Hold-Time < 15s, Interface Gi0/1 + Gi0/2" },
      { cmd: "show ip eigrp topology", expected: "P 192.168.3.0/24: 1 Successor, FD + Feasible Successor sichtbar" },
      { cmd: "show ip route eigrp", expected: "D 192.168.3.0/24 [90/...] — AD 90 für internes EIGRP" },
      { cmd: "ping 192.168.3.10 nach shutdown Gi0/2", expected: "Weiterhin erfolgreich — DUAL-Failover über R2" },
    ],
    glossary: [
      { term: "EIGRP", def: "Enhanced Interior Gateway Routing Protocol — Cisco, AD 90 (intern), Multicast 224.0.0.10." },
      { term: "Advanced Distance-Vector", def: "Hybrid aus Distance-Vector und Link-State-Eigenschaften." },
      { term: "DUAL", def: "Diffusing Update Algorithm — berechnet schleifenfreie Pfade und hält Backups bereit." },
      { term: "Successor", def: "Der aktuell beste, in die Routingtabelle eingetragene Pfad zum Ziel." },
      { term: "Feasible Successor", def: "Vorberechneter Backup-Pfad; bei Ausfall des Successors sofort aktiv (kein Neuberechnen)." },
      { term: "AS-Nummer", def: "Autonomous-System-Nummer (hier 100) — muss auf allen EIGRP-Routern gleich sein." },
      { term: "no auto-summary", def: "Schaltet die Zusammenfassung an Klassengrenzen ab (wie bei RIPv2)." },
      { term: "show ip eigrp topology", def: "Zeigt Successor + Feasible Successor mit FD/AD je Ziel." },
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
    context: {
      problem:
        "Die IPv4-Adressen sind weltweit aufgebraucht. Moderne Netze brauchen den riesigen IPv6-Adressraum — und Router müssen IPv6 erst explizit aktivieren, sonst routen sie es nicht.",
      purpose:
        "IPv6 auf Interfaces vergeben, IPv6-Routing einschalten und zwei Netze mit statischen IPv6-Routen verbinden. Grundlage jedes Dual-Stack-Netzes.",
    },
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
    glossary: [
      { term: "IPv6", def: "128-Bit-Adressierung als Nachfolger von IPv4 — praktisch unbegrenzter Adressraum." },
      { term: "ipv6 unicast-routing", def: "Schaltet IPv6-Routing global ein. Ohne diesen Befehl leitet der Router kein IPv6 weiter." },
      { term: "/64", def: "Standard-Präfixlänge eines IPv6-Subnetzes (64 Bit Netz, 64 Bit Interface-ID)." },
      { term: "2001:db8::/32", def: "Reservierter Dokumentations-Präfix (RFC 3849) — wie 192.0.2.0 bei IPv4." },
      { term: "ipv6 address", def: "Weist einem Interface eine globale IPv6-Adresse zu." },
      { term: "ipv6 route", def: "Statische IPv6-Route: Zielpräfix + Next-Hop." },
      { term: "Link-Local (fe80::)", def: "Automatische, nur im Segment gültige Adresse jedes IPv6-Interfaces." },
      { term: "Dual-Stack", def: "Gerät betreibt IPv4 und IPv6 parallel." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // IPv6 Static Routing — aus Cisco Practice Lab (Appendix B Bonus)
  // ─────────────────────────────────────────────────────────────
  {
    id: "ipv6-static",
    icon: <Network size={20} />,
    title: "IPv6 Static Routing",
    subtitle: "Statische + Default-Routen mit IPv6",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "IPv4-Routen reichen nicht — viele Netze laufen Dual-Stack. Statische IPv6-Routen funktionieren analog zu IPv4, aber mit eigener Syntax (ipv6 route) und der Pflicht, IPv6-Routing erst zu aktivieren.",
      purpose:
        "Statische IPv6-Routen, eine IPv6-Default-Route und Loopback-Ziele konfigurieren und testen — inklusive der Unterschiede zu IPv4 (ipv6 unicast-routing, Link-Local vs. Global).",
    },
    topology: {
      description:
        "Ein Internet-Router ist über serielle Links mit den Site-Routern R1 und R2 verbunden. Jeder Site-Router hat eine Loopback (Global Unicast), die der Internet-Router per statischer IPv6-Route erreichen soll und umgekehrt.",
      devices: [
        { type: "router", label: "Internet-Router", count: 1 },
        { type: "router", label: "R1-1 / R2-1", count: 2 },
      ],
      connections: [
        "Internet S0/0/0 ↔ R1-1   2001:DB8:CCA1:1::/64",
        "Internet S0/1/0 ↔ R2-1   2001:DB8:CCA2:2::/64",
        "Loopbacks: R1-1 2001:DB8:CCA1:254::1:1/128 · R2-1 2001:DB8:CCA2:254::2:1/128",
      ],
      hint: "Ohne 'ipv6 unicast-routing' leitet der Router KEINE IPv6-Pakete weiter (nur Host). Syntax: ipv6 route <ziel>/<präfix> <next-hop|interface>.",
    },
    steps: [
      {
        title: "1) IPv6-Routing + Interfaces aktivieren (R1-1)",
        blocks: [
          {
            device: "R1-1",
            mode: "global",
            modeLabel: "R1-1(config)#",
            commands: [
              {
                cmd: "ipv6 unicast-routing",
                explanation:
                  "Schaltet die IPv6-Weiterleitung global ein — Pflicht, sonst ist der Router nur ein IPv6-Host. Gegenstück zu IPv4, wo Routing per Default an ist.",
              },
              {
                cmd: "interface se0/0/0\nipv6 address 2001:DB8:CCA1:1::2/64\nno shutdown\ninterface loopback0\nipv6 address 2001:DB8:CCA1:254::1:1/128",
                explanation:
                  "Globale Unicast-Adressen setzen. Eine Link-Local-Adresse (fe80::) entsteht automatisch — sie wird als Next-Hop in Routen oft genutzt.",
              },
            ],
          },
        ],
      },
      {
        title: "2) Statische Route + Default-Route auf R1-1",
        blocks: [
          {
            device: "R1-1",
            mode: "global",
            modeLabel: "R1-1(config)#",
            commands: [
              {
                cmd: "ipv6 route 2001:DB8:CCAF:254::1/128 2001:DB8:CCA1:1::1",
                explanation:
                  "Statische Host-Route (/128) zum Loopback des Internet-Routers über dessen Global-Unicast-Next-Hop. Syntax exakt wie IPv4, nur mit 'ipv6 route'.",
              },
              {
                cmd: "ipv6 route ::/0 2001:DB8:CCA1:1::1",
                explanation:
                  "IPv6-Default-Route: ::/0 ist das Pendant zu 0.0.0.0/0. Schickt alles Unbekannte zum Internet-Router (Gateway of last resort).",
              },
            ],
          },
        ],
      },
      {
        title: "3) Gegenrouten auf dem Internet-Router",
        blocks: [
          {
            device: "Internet",
            mode: "global",
            modeLabel: "Internet(config)#",
            commands: [
              {
                cmd: "ipv6 unicast-routing\nipv6 route 2001:DB8:CCA1:254::1:1/128 2001:DB8:CCA1:1::2\nipv6 route 2001:DB8:CCA2:254::2:1/128 2001:DB8:CCA2:2::2",
                explanation:
                  "Der Internet-Router braucht für jede Site-Loopback eine statische Route über den jeweiligen Link-Next-Hop. Ohne Rückroute kommt der Ping-Antwortweg nicht zurück.",
              },
            ],
          },
        ],
      },
      {
        title: "4) IPv6-Routing prüfen & testen",
        blocks: [
          {
            device: "R1-1",
            mode: "privileged",
            modeLabel: "R1-1#",
            commands: [
              {
                cmd: "show ipv6 route static",
                explanation:
                  "Statische Routen erscheinen mit 'S'. ::/0 ist die Default-Route. AD steht in [1/0] (statisch = AD 1).",
              },
              {
                cmd: "ping 2001:DB8:CCAF:254::1",
                explanation:
                  "Test zum Loopback des Internet-Routers. Erfolgreich nur, wenn Hin- UND Rückroute existieren — typischer Fehler ist die fehlende Gegenroute.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ipv6 route static", expected: "S 2001:DB8:CCAF:254::1/128 [1/0] via ... + S ::/0" },
      { cmd: "show ipv6 interface brief", expected: "Se0/0/0 mit Global-Unicast + fe80:: Link-Local, Status up/up" },
      { cmd: "ping 2001:DB8:CCAF:254::1", expected: "!!!!! — Erfolg (Hin- und Rückroute vorhanden)" },
    ],
    glossary: [
      { term: "ipv6 unicast-routing", def: "Aktiviert die IPv6-Weiterleitung — ohne den Befehl routet das Gerät kein IPv6." },
      { term: "ipv6 route", def: "Statische IPv6-Route: ipv6 route <präfix>/<länge> <next-hop|interface> [AD]." },
      { term: "::/0", def: "IPv6-Default-Route (Pendant zu 0.0.0.0/0) — Gateway of last resort." },
      { term: "/128", def: "Host-Route auf genau eine IPv6-Adresse (meist Loopback)." },
      { term: "Link-Local (fe80::)", def: "Automatisch erzeugte Adresse pro Interface, nur im lokalen Segment gültig — oft Next-Hop." },
      { term: "Global Unicast", def: "Routbare öffentliche IPv6-Adresse (2000::/3), hier 2001:DB8::/32 (Doku-Präfix)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 19. OSPFv3 für IPv6
  // ─────────────────────────────────────────────────────────────
  {
    id: "ospfv3-ipv6",
    icon: <Globe size={20} />,
    title: "OSPFv3 für IPv6",
    subtitle: "Separater Process, link-local Neighborships",
    difficulty: "Fortgeschritten",
    duration: "15 min",
    context: {
      problem:
        "Das klassische OSPF für IPv4 kennt keine IPv6-Routen. Für dynamisches Routing im IPv6-Netz braucht es OSPFv3.",
      purpose:
        "OSPFv3 für IPv6 einrichten: Area-Zuweisung direkt am Interface, manuelle Router-ID (Pflicht ohne IPv4) und passive-interface. Dynamisches IPv6-Routing statt statischer Routen.",
    },
    topology: {
      description:
        "2 Router, beide IPv6-only. OSPFv3 läuft als eigener Prozess parallel zu OSPFv2 (IPv4).",
      devices: [{ type: "router", label: "R1, R2", count: 2 }],
      connections: ["R1 Gi0/0 ↔ R2 Gi0/0  (2001:db8::/64)"],
      hint: "OSPFv3 nutzt link-local fe80::/10 für Neighborships — nicht die globale Unicast-Adresse.",
    },
    steps: [
      {
        title: "IPv6 routing aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ipv6 unicast-routing", explanation: "PFLICHT: aktiviert IPv6-Forwarding auf dem Router." },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "" },
              { cmd: "ipv6 address 2001:db8::1/64", explanation: "Globale Unicast-Adresse." },
              { cmd: "ipv6 ospf 1 area 0", explanation: "OSPFv3 direkt am Interface aktivieren — keine 'network'-Statements wie bei OSPFv2!" },
            ],
          },
        ],
      },
      {
        title: "OSPFv3 Prozess",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ipv6 router ospf 1", explanation: "Separater Process für IPv6 (kann gleiche oder andere Process-ID wie IPv4 haben)." },
              { cmd: "router-id 1.1.1.1", explanation: "Router-ID ist trotz IPv6 ein 32-Bit-Wert (IPv4-Notation) — muss manuell gesetzt werden, falls keine IPv4-Adresse vorhanden!" },
              { cmd: "passive-interface default", explanation: "Alle Interfaces passiv per Default." },
              { cmd: "no passive-interface Gi0/0", explanation: "Nur auf Gi0/0 aktiv." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ipv6 ospf neighbor", expected: "Neighbor ID 2.2.2.2 — FULL, Interface ID, Address fe80::..." },
      { cmd: "show ipv6 route ospf", expected: "O   2001:db8:1::/64 [110/2] via FE80::..." },
      { cmd: "show ipv6 ospf interface brief", expected: "Gi0/0 1 0 fe80::... 1" },
    ],
    glossary: [
      { term: "OSPFv3", def: "OSPF-Version für IPv6 (RFC 5340) — Link-State, AD 110." },
      { term: "ipv6 ospf <pid> area <n>", def: "Aktiviert OSPFv3 direkt am Interface und ordnet es einer Area zu (statt network-Befehl)." },
      { term: "ipv6 router ospf", def: "Öffnet den OSPFv3-Prozess für globale Parameter (router-id, passive-interface)." },
      { term: "router-id", def: "32-Bit-Kennung — bei reinem IPv6 MANUELL nötig, da keine IPv4-Adresse als ID dient." },
      { term: "passive-interface default", def: "Setzt alle Interfaces passiv; mit no passive-interface gezielt freigeben." },
      { term: "Link-Local-Nachbarschaft", def: "OSPFv3-Nachbarn kommunizieren über ihre fe80::-Adressen." },
      { term: "Area 0", def: "Backbone-Area, hier am Interface zugewiesen." },
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
    context: {
      problem:
        "Jeden PC von Hand mit IP, Maske, Gateway und DNS zu versorgen ist mühsam und fehleranfällig — und bei Netzänderungen muss man alles erneut anfassen.",
      purpose:
        "Ein Router als DHCP-Server vergibt diese Parameter automatisch per DORA. Das Lab zeigt Pool, ausgenommene Adressen und die Client-Seite.",
    },
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
    glossary: [
      { term: "DHCP", def: "Dynamic Host Configuration Protocol — vergibt IP, Maske, Gateway und DNS automatisch (UDP 67/68)." },
      { term: "DORA", def: "Discover, Offer, Request, Ack — die vier Schritte der DHCP-Adressvergabe." },
      { term: "ip dhcp pool", def: "Legt einen Adresspool an und öffnet den DHCP-Config-Modus." },
      { term: "network", def: "Definiert den Adressbereich, den der Pool vergibt." },
      { term: "default-router", def: "Gateway, das der Server den Clients mitteilt." },
      { term: "dns-server", def: "DNS-Server-Adresse für die Clients." },
      { term: "ip dhcp excluded-address", def: "Nimmt Adressen aus dem Pool heraus (Gateway, Server, Drucker) — verhindert Konflikte." },
      { term: "Lease", def: "Geliehene Adresse mit Ablaufzeit; wird per Renewal/Rebinding verlängert." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // DHCP Relay über VLAN-Grenzen (Router-on-a-Stick + ip helper-address)
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp-relay",
    icon: <Network size={20} />,
    title: "DHCP Relay über VLAN-Grenzen",
    subtitle: "Router-on-a-Stick · 3 VLANs · zentraler DHCP-Server · ip helper-address",
    difficulty: "Fortgeschritten",
    duration: "30 min",
    context: {
      problem:
        "DHCP-Clients suchen ihren Server per Broadcast. Router leiten Broadcasts aber NICHT zwischen Subnetzen weiter — ein zentraler DHCP-Server in VLAN 71 würde die Discover-Pakete aus VLAN 51 und 61 also nie sehen. Ohne Lösung bekäme jeder Client nur eine APIPA-Adresse (169.254.x.x).",
      purpose:
        "In echten Netzen will man EINEN zentralen DHCP-Server für viele VLANs statt einen Pool pro Router. Dieses Szenario zeigt den Standardweg dafür: Der Router wird mit 'ip helper-address' zum DHCP-Relay, das die Broadcasts als gezielten Unicast an den Server weiterreicht — genau so läuft es in Unternehmens- und Campus-Netzen.",
    },
    topology: {
      description:
        "Drei VLANs auf zwei Switches, Inter-VLAN-Routing per Router-on-a-Stick. Ein einziger DHCP-Server (192.168.2.11) im VLAN 71 versorgt die Clients in VLAN 51 und 61 — der Router leitet die DHCP-Broadcasts per ip helper-address als Unicast weiter.",
      devices: [
        { type: "router", label: "R1 (RoaS, Gi0/0.51/.61/.71)", count: 1 },
        { type: "switch", label: "SW1 (VTP-Server)", count: 1 },
        { type: "switch", label: "SW2 (VTP-Client, downstream)", count: 1 },
        { type: "server", label: "DHCP-Server 192.168.2.11", count: 1 },
        { type: "pc", label: "Clients Rot/Blau/Gelb", count: 3 },
      ],
      connections: [
        "R1 Gi0/0 ↔ SW1 Gi0/1  (Trunk 802.1Q, alle VLANs)",
        "SW1 Gi0/2 ↔ SW2 Gi0/1  (Trunk, downstream)",
        "DHCP-Server → SW1 Fa0/24  (VLAN 71 Gelb)",
        "Client-Rot → SW1 Fa0/1 (VLAN 51) · Client-Blau → SW1 Fa0/11 (VLAN 61)",
      ],
      hint: "ip helper-address gehört auf die CLIENT-Subinterfaces (.51 und .61). VLAN 71 (Server) braucht keinen Helper — der Server steht dort lokal.",
    },
    steps: [
      {
        title: "SW1 als VTP-Server + VLANs anlegen",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "vtp domain FSG57\nvtp password geheim!\nvtp mode server",
                explanation:
                  "VTP-Domain FSG57 mit Passwort 'geheim!'. SW1 ist Server und verteilt die VLAN-Datenbank an SW2 — Domain und Passwort müssen auf beiden Switches identisch sein.",
              },
              {
                cmd: "vlan 51\nname Rot\nvlan 61\nname Blau\nvlan 71\nname Gelb",
                explanation:
                  "Drei VLANs: 51 Rot (172.16.51.0/24), 61 Blau (172.16.61.0/24), 71 Gelb (192.168.2.0/24 — DHCP-Server). VTP überträgt sie automatisch an SW2.",
              },
            ],
          },
        ],
      },
      {
        title: "SW1 Access-Ports + Trunks",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "interface range fa0/1-10\nswitchport mode access\nswitchport access vlan 51",
                explanation: "Fa0/1-10 = VLAN 51 Rot.",
              },
              {
                cmd: "interface range fa0/11-20\nswitchport mode access\nswitchport access vlan 61",
                explanation: "Fa0/11-20 = VLAN 61 Blau.",
              },
              {
                cmd: "interface range fa0/21-24\nswitchport mode access\nswitchport access vlan 71",
                explanation: "Fa0/21-24 = VLAN 71 Gelb (DHCP-Server an Fa0/24).",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\ninterface gi0/2\nswitchport mode trunk",
                explanation: "Gi0/1 = Trunk zum Router (RoaS), Gi0/2 = Trunk zu SW2.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2 als VTP-Client + Access-Ports",
        blocks: [
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "vtp domain FSG57\nvtp password geheim!\nvtp mode client",
                explanation:
                  "SW2 übernimmt die VLAN-Datenbank von SW1 — keine lokale VLAN-Erstellung nötig. Prüfung: 'show vtp status' muss gleiche Revision wie SW1 zeigen.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\ninterface range fa0/1-10\nswitchport mode access\nswitchport access vlan 51",
                explanation: "Uplink-Trunk zu SW1, Access-Ports z. B. für weitere Rot-Clients.",
              },
            ],
          },
        ],
      },
      {
        title: "R1 Router-on-a-Stick + ip helper-address",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface gi0/0\nno ip address\nno shutdown",
                explanation: "Physisches Parent-Interface: KEINE IP, aber aktivieren — sonst sind alle Subinterfaces down.",
              },
              {
                cmd: "interface gi0/0.51\nencapsulation dot1q 51\nip address 172.16.51.1 255.255.255.0\nip helper-address 192.168.2.11",
                explanation:
                  "VLAN-51-Gateway. Der Helper leitet DHCP-Broadcasts der Rot-Clients als Unicast an 192.168.2.11 weiter und trägt 172.16.51.1 ins giaddr-Feld → der Server wählt den Rot-Pool.",
              },
              {
                cmd: "interface gi0/0.61\nencapsulation dot1q 61\nip address 172.16.61.1 255.255.255.0\nip helper-address 192.168.2.11",
                explanation: "VLAN-61-Gateway + Helper für die Blau-Clients (giaddr 172.16.61.1 → Blau-Pool).",
              },
              {
                cmd: "interface gi0/0.71\nencapsulation dot1q 71\nip address 192.168.2.1 255.255.255.0",
                explanation:
                  "VLAN-71-Gateway. KEIN Helper nötig — der DHCP-Server steht in diesem VLAN lokal.",
              },
            ],
          },
        ],
      },
      {
        title: "DHCP-Server (192.168.2.11) — Pools je VLAN",
        blocks: [
          {
            device: "DHCP-Server",
            mode: "service",
            modeLabel: "Server > Services > DHCP",
            commands: [
              {
                cmd: "Pool Rot:  Default Gateway 172.16.51.1 · DNS 192.168.2.11 · Start 172.16.51.10 · Maske 255.255.255.0",
                explanation:
                  "Der Pool für die Rot-Clients. Das Default-Gateway ist die Router-Subinterface-IP (172.16.51.1) — NICHT die Server-IP.",
              },
              {
                cmd: "Pool Blau: Default Gateway 172.16.61.1 · DNS 192.168.2.11 · Start 172.16.61.10 · Maske 255.255.255.0",
                explanation:
                  "Analog für Blau. Wichtig: pro Client-Subnetz ein eigener Pool, dessen Netz zur giaddr passt — sonst antwortet der Server nicht.",
              },
              {
                cmd: "Server-NIC: statisch 192.168.2.11/24, Gateway 192.168.2.1",
                explanation: "Der Server selbst bekommt eine statische IP im VLAN 71.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ipconfig (Client Rot)", expected: "IP aus 172.16.51.10+, Gateway 172.16.51.1" },
      { cmd: "ipconfig (Client Blau)", expected: "IP aus 172.16.61.10+, Gateway 172.16.61.1" },
      { cmd: "show ip dhcp binding (Server)", expected: "Leases in 172.16.51.x UND 172.16.61.x" },
      { cmd: "show vlans (R1)", expected: "Gi0/0.51→VLAN51, .61→VLAN61, .71→VLAN71 + Paketzähler" },
      { cmd: "show vtp status (SW2)", expected: "Mode: Client, Domain FSG57, gleiche Revision wie SW1" },
    ],
    glossary: [
      { term: "DHCP Relay", def: "Funktion eines Routers, die DHCP-Broadcasts aus einem Client-VLAN als Unicast an einen entfernten Server weiterleitet. Aktiviert mit ip helper-address." },
      { term: "ip helper-address", def: "Befehl auf dem Client-seitigen Interface, der die Ziel-IP des DHCP-Servers setzt. Macht den Router zum Relay-Agent." },
      { term: "giaddr", def: "Gateway IP Address — Feld im DHCP-Paket, in das der Relay seine Interface-IP einträgt. Der Server wählt daran den passenden Adresspool." },
      { term: "Router-on-a-Stick", def: "Inter-VLAN-Routing über EIN physisches Interface, das per Subinterfaces (encapsulation dot1q) in mehrere VLAN-Gateways aufgeteilt wird." },
      { term: "Subinterface", def: "Logisches Unter-Interface (z. B. Gi0/0.51) mit eigener VLAN-Zuordnung und IP — dient als Default-Gateway eines VLANs." },
      { term: "encapsulation dot1q <id>", def: "Bindet ein Subinterface an ein VLAN-Tag nach IEEE 802.1Q. Pflicht, sonst weiß das Subinterface nicht, welches VLAN es bedient." },
      { term: "VTP", def: "VLAN Trunking Protocol — verteilt die VLAN-Datenbank automatisch vom Server- an die Client-Switches derselben Domain." },
      { term: "Trunk", def: "Switch-Link, der mehrere VLANs getaggt (802.1Q) überträgt — hier zwischen Switch und Router bzw. zwischen den Switches." },
      { term: "APIPA", def: "169.254.x.x — Adresse, die ein Client sich selbst gibt, wenn KEIN DHCP-Server antwortet. Sicheres Zeichen für ein DHCP-/Relay-Problem." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. NAT / PAT (Overload)
  // Topologie: PC0/PC0(1)/PC0(2) → SW1 → NAT → ISP → INTERNET → Webserver
  // ─────────────────────────────────────────────────────────────
  {
    id: "nat-pat",
    icon: <Desktop size={20} />,
    title: "NAT / PAT (Overload)",
    subtitle: "3 PCs · SW1 · NAT-Router · ISP · INTERNET · Webserver",
    difficulty: "Mittel",
    duration: "25 min",
    context: {
      problem:
        "Drei PCs mit privaten Adressen (192.168.1.0/24) sollen das Internet erreichen — aber es steht nur EINE öffentliche IP zur Verfügung (200.0.0.1 auf Gig0/1 des NAT-Routers).",
      purpose:
        "PAT (Port Address Translation, auch 'NAT Overload') löst das Problem: Alle internen Hosts teilen sich eine einzige öffentliche IP, unterschieden per Portnummer. Das ist das Verfahren, das in 99 % aller Heimrouter und kleinen Büros läuft.",
    },
    topology: {
      description:
        "Drei PCs hängen via SW1 am NAT-Router (Gig0/0 = inside). Die WAN-Strecke zum ISP ist ein /30-Subnetz (200.0.0.0/30): NAT=.1, ISP=.2. Dahinter verbindet ein INTERNET-Router (Transit 1.1.1.0/30) den ISP mit dem Webserver-Segment (47.11.8.0/24).",
      devices: [
        { type: "pc",     label: "PC0 (192.168.1.10/24)",   count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW1 (Fa0/1–3, Gig0/1)",   count: 1 },
        { type: "router", label: "NAT-Router (Gig0/0 inside, Gig0/1 outside)", count: 1 },
        { type: "router", label: "ISP (Gig0/2 ↔ NAT, Gig0/1 ↔ INTERNET)",    count: 1 },
        { type: "router", label: "INTERNET (Gig0/2 ↔ ISP, Gi0/0 ↔ Webserver)", count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0/PC0(1)/PC0(2) → SW1 Fa0/1–3 → SW1 Gig0/1 → NAT Gig0/0  (192.168.1.0/24)",
        "NAT Gig0/1 (200.0.0.1) ↔ ISP Gig0/2 (200.0.0.2)  — 200.0.0.0/30",
        "ISP Gig0/1 (1.1.1.1) ↔ INTERNET Gig0/2 (1.1.1.2)  — 1.1.1.0/30",
        "INTERNET Gi0/0 (47.11.8.1) ↔ Webserver Fa0 (47.11.8.15)  — 47.11.8.0/24",
      ],
      hint: "PAT nutzt die Outside-Interface-IP (200.0.0.1) für alle Hosts — kein Pool nötig. Der INTERNET-Router braucht eine Rückroute für 200.0.0.0/30, damit Antwortpakete zurückfinden.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12. Gateway = NAT-Router Gig0/0.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown",
                explanation:
                  "LAN-Interface. Die inside-Markierung wird im nächsten Schritt gesetzt.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.1 255.255.255.252\n no shutdown",
                explanation:
                  "WAN-Interface. /30 (255.255.255.252) = 4 Adressen, 2 nutzbar: .1 (NAT) und .2 (ISP). Typische P2P-Maske für WAN-Strecken.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 200.0.0.2 255.255.255.252\n no shutdown",
                explanation:
                  "ISP-seitiger Anschluss des NAT-Routers. Gig0/2 = Kundenseite (200.0.0.2).",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation:
                  "Transit-Interface zum INTERNET-Router. 1.1.1.0/30: ISP=.1, INTERNET=.2.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown",
                explanation:
                  "Transit-Interface Richtung ISP (.2 im /30-Subnetz).",
              },
              {
                cmd: "interface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation:
                  "Interface zum Webserver-Segment. Webserver hat .15, Gateway = .1.",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation:
                  "Statische öffentliche IP. Gateway = INTERNET-Router Gi0/0.",
              },
            ],
          },
        ],
      },
      {
        title: "2) NAT inside / outside auf Interfaces setzen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip nat inside",
                explanation:
                  "Markiert Gig0/0 als 'innen'. Pakete, die hier ankommen, werden gegen die NAT-Regeln geprüft. Ohne diese Markierung passiert KEINE Übersetzung.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip nat outside",
                explanation:
                  "Markiert Gig0/1 als 'außen'. Übersetzte Pakete verlassen hier das Netz mit der öffentlichen IP 200.0.0.1 als Source.",
              },
            ],
          },
        ],
      },
      {
        title: "3) ACL — welche Hosts übersetzt werden",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "access-list 1 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Standard-ACL 1: Erlaubt das gesamte LAN-Subnetz 192.168.1.0/24 (Wildcard 0.0.0.255). Nur diese Hosts werden von PAT übersetzt. Alles außerhalb dieser ACL bleibt unverändert.",
              },
            ],
          },
        ],
      },
      {
        title: "4) PAT aktivieren (der Schlüsselbefehl)",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source list 1 interface GigabitEthernet0/1 overload",
                explanation:
                  "Zerlegt in Teile:\n  'list 1'              → Quelle muss ACL 1 treffen (192.168.1.0/24)\n  'interface Gi0/1'     → benutze die IP von Gig0/1 (200.0.0.1) als öffentliche Adresse\n  'overload'            → PAT aktivieren — viele Hosts teilen diese eine IP per Port-Nummer\nOHNE 'overload' würde der Router versuchen, 1:1-NAT zu machen — mit nur einer IP würde ab dem 2. Host nichts mehr funktionieren.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.2",
                explanation:
                  "Default-Route: Alles unbekannte Traffic geht zum ISP (200.0.0.2). Nach PAT-Übersetzung verlässt das Paket Gig0/1 mit Quelle 200.0.0.1.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation:
                  "ISP leitet alles zum INTERNET-Router. Antwortpakete des Webservers (Ziel: 200.0.0.1) kommen über diesen Weg zurück zum ISP.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.252 1.1.1.1",
                explanation:
                  "Rückroute für 200.0.0.0/30! Der INTERNET-Router muss wissen, dass 200.0.0.1 (die PAT-Adresse) über den ISP (1.1.1.1) erreichbar ist. Ohne diese Route schmeißt er alle Antwortpakete weg — die Verbindung scheitert still.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Konnektivität testen & PAT-Verhalten beobachten",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC0> ",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 (192.168.1.10) sendet ICMP. NAT übersetzt: Quelle 192.168.1.10 → 200.0.0.1:xxxx (Port wird zugewiesen). Wenn PC0(1) gleichzeitig pingt, benutzt es ebenfalls 200.0.0.1 — aber mit einem anderen Port. Beide Antworten landen korrekt beim richtigen PC.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Pro Verbindung eine Zeile mit Port-Nummern:\n  icmp 192.168.1.10:1  200.0.0.1:1  47.11.8.15:1  47.11.8.15:1\n  icmp 192.168.1.11:1  200.0.0.1:2  47.11.8.15:1  47.11.8.15:1\nAlle PCs teilen 200.0.0.1, unterschieden nur durch den Port (Spalte 3). Genau das ist PAT.",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt: Total active translations, inside/outside interfaces und die gebundene ACL. 'Hits' steigen bei aktivem Traffic, 'misses' bei Konfigurationsfehlern (falsche ACL oder inside/outside vergessen).",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 47.11.8.15 (von PC0)", expected: "Erfolgreich — Quelle 192.168.1.10 → 200.0.0.1:Port in NAT-Tabelle" },
      { cmd: "show ip nat translations", expected: "Alle 3 PCs erscheinen mit 200.0.0.1 als Inside Global, unterschiedliche Ports" },
      { cmd: "show ip nat statistics", expected: "Hits steigen, interface GigabitEthernet0/1, ACL 1 gebunden" },
      { cmd: "ping 200.0.0.1 (vom Webserver)", expected: "Fehlschlag — PAT hat keinen permanenten Eintrag für eingehende Verbindungen" },
    ],
    glossary: [
      { term: "PAT (Overload)",   def: "Port Address Translation — viele private Hosts teilen eine öffentliche IP per eindeutiger Portnummer." },
      { term: "NAT",              def: "Network Address Translation — übersetzt private in öffentliche IPs." },
      { term: "Inside Local",     def: "Private Host-IP vor der Übersetzung (z. B. 192.168.1.10)." },
      { term: "Inside Global",    def: "Öffentliche IP nach Übersetzung — bei PAT immer 200.0.0.1 (die Outside-Interface-IP)." },
      { term: "overload",         def: "Aktiviert PAT: mehrere Hosts teilen eine IP, unterschieden per Port. Ohne 'overload' = 1:1-NAT." },
      { term: "ip nat inside",    def: "Markiert das LAN-Interface — Pakete hier werden übersetzt." },
      { term: "ip nat outside",   def: "Markiert das WAN-Interface — übersetzte Pakete verlassen hier das Netz." },
      { term: "/30 (255.255.255.252)", def: "WAN-Subnetz mit 4 Adressen (2 nutzbar). Typisch für P2P-Strecken zwischen Router und ISP." },
      { term: "Rückroute",        def: "INTERNET-Router braucht Route für 200.0.0.0/30 → sonst keine Antwortpakete." },
      { term: "RFC 1918",         def: "Definiert private Adressbereiche: 10/8, 172.16/12, 192.168/16." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Dynamic NAT (Pool) — gleiche Topologie wie Statisches NAT
  // Topologie: PC0/PC0(1)/PC0(2) → SW → NAT → ISP → INTERNET → Webserver
  // ─────────────────────────────────────────────────────────────
  {
    id: "dynamic-nat",
    icon: <Globe size={20} />,
    title: "Dynamisches NAT (Pool)",
    subtitle: "3 PCs · SW · NAT-Router · ISP · INTERNET · Webserver",
    difficulty: "Mittel",
    duration: "25 min",
    context: {
      problem:
        "Drei PCs sollen ins Internet, aber die öffentlichen IPs sollen nicht fest zugeordnet sein — wer zuerst Verbindung aufbaut, bekommt die nächste freie Pool-Adresse. Ist der Pool leer, wird die Verbindung verworfen.",
      purpose:
        "Dynamic NAT verwaltet einen Pool öffentlicher Adressen und weist jede davon bei Bedarf dynamisch einem internen Host zu (1:1, keine Port-Multiplexierung). Tabelleneinträge entstehen erst bei aktivem Traffic und verfallen danach — im Gegensatz zu Static NAT, wo Einträge permanent existieren.",
    },
    topology: {
      description:
        "Drei PCs hängen an einem Switch im Netz 192.168.1.0/24. Der NAT-Router trennt das private LAN vom öffentlichen 200.0.0.0/24-Netz. Dahinter simuliert ein ISP-Router + INTERNET-Router das Kernnetz; ein Webserver (47.11.8.15) stellt das Internet dar. Gleiche Topologie wie Statisches NAT — nur der Übersetzungsmechanismus ist anders.",
      devices: [
        { type: "pc",     label: "PC0  (192.168.1.10/24)",  count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW (Layer-2, kein Config)", count: 1 },
        { type: "router", label: "NAT-Router",               count: 1 },
        { type: "router", label: "ISP",                      count: 1 },
        { type: "router", label: "INTERNET",                 count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0 / PC0(1) / PC0(2) → SW  (192.168.1.0/24)",
        "SW Gig0/1 → NAT Gig0/0  (inside, 192.168.1.1/24)",
        "NAT Gig0/1 → ISP Gig0/1  (200.0.0.253 ↔ 200.0.0.254, /24)",
        "ISP Gig0/2 → INTERNET Gig0/2  (1.1.1.1 ↔ 1.1.1.2, /30)",
        "INTERNET Gig0/0 → Webserver Fa0  (47.11.8.1 ↔ 47.11.8.15, /24)",
        "NAT-Pool: 200.0.0.10 – 200.0.0.12 (3 öffentliche IPs, 1 pro PC)",
      ],
      hint: "Reihenfolge: 1) ACL = WER wird übersetzt, 2) ip nat inside/outside auf die Interfaces, 3) ip nat pool anlegen, 4) ip nat inside source list → pool verknüpfen. Danach Rückroute auf INTERNET-Router nicht vergessen.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Statische IP auf PC0. Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12. Das Gateway zeigt auf den NAT-Router (inside-Interface).",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n ip nat inside\n no shutdown",
                explanation:
                  "'ip nat inside' markiert das LAN-Interface. Der Router übersetzt Source-IPs eingehender Pakete von hier gegen die NAT-Pool-Adressen.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.253 255.255.255.0\n ip nat outside\n no shutdown",
                explanation:
                  "'ip nat outside' markiert das WAN-Interface. Übersetzte Pakete verlassen das Netz hier mit einer Adresse aus dem Pool.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.254 255.255.255.0\n no shutdown\ninterface GigabitEthernet0/2\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation:
                  "ISP verbindet NAT-Router (200.0.0.x) und INTERNET-Router (1.1.1.0/30). Identisch zum Static-NAT-Lab.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown\ninterface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation:
                  "INTERNET-Router: Transit (.2) und LAN-Seite zum Webserver (47.11.8.x/24).",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation:
                  "Webserver mit statischer öffentlicher IP. Gateway zeigt auf den INTERNET-Router.",
              },
            ],
          },
        ],
      },
      {
        title: "2) ACL definieren — welche Hosts übersetzt werden",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "access-list 1 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Standard-ACL 1 erlaubt das gesamte LAN-Subnetz (Wildcard 0.0.0.255 = alle 256 Adressen in .0/24). Nur Hosts, die dieser ACL entsprechen, werden von Dynamic NAT übersetzt. Alles andere bleibt unverändert.",
              },
            ],
          },
        ],
      },
      {
        title: "3) NAT-Pool anlegen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat pool PUBLIC-POOL 200.0.0.10 200.0.0.12 netmask 255.255.255.0",
                explanation:
                  "Definiert den Vorrat öffentlicher Adressen:\n  Name:     PUBLIC-POOL\n  Start-IP: 200.0.0.10\n  End-IP:   200.0.0.12\n  Maske:    255.255.255.0 (gleiche Maske wie das outside-Interface)\n3 IPs für 3 PCs — genau so viele wie im LAN. Verbindet sich ein 4. Host bevor ein Eintrag ausläuft, wird seine Verbindung verworfen (Pool leer).",
              },
            ],
          },
        ],
      },
      {
        title: "4) ACL mit Pool verknüpfen (NAT aktivieren)",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source list 1 pool PUBLIC-POOL",
                explanation:
                  "Der Schlüsselbefehl: 'list 1' = Quelle muss ACL 1 treffen, 'pool PUBLIC-POOL' = Zieladresse aus dem Pool.\nOHNE 'overload': reines Dynamic NAT — jeder Host bekommt eine eigene Pool-IP (1:1).\nMIT 'overload': Dynamic NAT + PAT — mehrere Hosts teilen eine Pool-IP per Port-Multiplexierung.\nFür dieses Lab: kein overload — Pool hat genau 3 IPs für 3 PCs.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.254",
                explanation:
                  "Default-Route zum ISP. Nach der NAT-Übersetzung verlässt das Paket Gig0/1 mit einer Adresse aus 200.0.0.10–.12.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation:
                  "ISP-Default-Route Richtung INTERNET. Antwortpakete des Webservers (Ziel: 200.0.0.x) werden so korrekt weitergeleitet.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.0 1.1.1.1",
                explanation:
                  "Kritische Rückroute! Der INTERNET-Router muss wissen, dass 200.0.0.0/24 (inklusive Pool-IPs .10–.12) über den ISP erreichbar ist. Ohne diese Route werden Antwortpakete verworfen.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Konnektivität testen & Pool-Verhalten beobachten",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC0> ",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 (192.168.1.10) bekommt bei der ersten Verbindung eine freie Pool-IP (z. B. 200.0.0.10) dynamisch zugewiesen. Wenn PC0(1) und PC0(2) gleichzeitig pingen, belegen sie .11 und .12 — der Pool ist erschöpft. Nachfolgende Hosts erhalten: 'Translation failed' bis ein Eintrag abläuft.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Zeigt AKTIVE Einträge (nur solange Verbindungen offen):\n  icmp 192.168.1.10:x  200.0.0.10:x  47.11.8.15:x  47.11.8.15:x\nUnterschied zu Static NAT: Nach Ablauf des Timeouts verschwinden die Einträge — kein dauerhafter Eintrag wie 'Pro --- 192.168.1.10  200.0.0.10  ---  ---'.",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt Pool-Auslastung:\n  Pool PUBLIC-POOL: 3 addresses, X allocated, Y misses\n'misses' steigt, wenn ein Host übersetzt werden soll aber der Pool leer ist. Das ist die klare Abgrenzung zu PAT: bei PAT gibt es keine Pool-Erschöpfung.",
              },
              {
                cmd: "clear ip nat translation *",
                explanation:
                  "Löscht alle dynamischen NAT-Einträge manuell. Nützlich zum Testen der Pool-Erschöpfung: nach 'clear' stehen wieder alle 3 Pool-IPs zur Verfügung.",
              },
            ],
          },
        ],
      },
      {
        title: "7) Eingehende Verbindung testen (Unterschied zu Static NAT)",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC0> ",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "Schritt 1 — erst einen NAT-Eintrag erzeugen: PC0 pingt den Webserver. Dadurch weist der Router die Pool-IP 200.0.0.10 zu und schreibt den Eintrag in die NAT-Tabelle. Dieser Eintrag lebt standardmäßig für ~60 s (ICMP-Timeout).",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Bestätigt den aktiven Eintrag:\n  icmp 192.168.1.10:x  200.0.0.10:x  47.11.8.15:x  ...\nSolange dieser Eintrag existiert, kennt der Router die Zuordnung 200.0.0.10 → 192.168.1.10.",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "cli",
            modeLabel: "Webserver> ",
            commands: [
              {
                cmd: "ping 200.0.0.10",
                explanation:
                  "Schritt 2 — SOFORT nach dem PC0-Ping vom Webserver aus versuchen (Eintrag noch aktiv):\n  ✓ Funktioniert: Der NAT-Router findet den Eintrag 200.0.0.10 → 192.168.1.10 und leitet weiter.\n  ✗ Scheitert, wenn der Eintrag abgelaufen ist oder PC0 nie gepingt hat.\n\nUnterschied zu Static NAT:\n  Static NAT: Eintrag ist permanent — Webserver kann jederzeit 200.0.0.10 erreichen.\n  Dynamic NAT: Eintrag existiert nur während aktiver Verbindung — eingehende Verbindungen nur im Zeitfenster nach einem ausgehenden Paket von PC0.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip nat translations", expected: "Einträge erscheinen NUR nach aktivem Traffic — kein permanenter 'Pro ---'-Eintrag wie bei Static NAT" },
      { cmd: "show ip nat statistics", expected: "Pool PUBLIC-POOL: 3 addresses, mind. 1 allocated nach Ping" },
      { cmd: "ping 47.11.8.15 (von PC0)", expected: "Erfolgreich — 192.168.1.10 → 200.0.0.10 (erste freie Pool-IP)" },
      { cmd: "ping 200.0.0.10 (vom Webserver, sofort nach PC0-Ping)", expected: "Erfolgreich NUR wenn NAT-Eintrag noch aktiv; ohne aktiven Eintrag: Fehlschlag" },
      { cmd: "show ip nat statistics (bei leerem Pool)", expected: "misses erhöhen sich wenn 4. Host versucht zu verbinden" },
    ],
    glossary: [
      { term: "Dynamic NAT",     def: "Hosts bekommen bei Bedarf eine IP aus einem Pool — 1:1, erste Verbindung gewinnt. Kein dauerhafter Eintrag." },
      { term: "NAT-Pool",        def: "Vorrat routbarer öffentlicher Adressen: ip nat pool NAME start end netmask M." },
      { term: "Inside Local",    def: "Die private Quelladresse vor der Übersetzung (z. B. 192.168.1.10)." },
      { term: "Inside Global",   def: "Die dynamisch zugewiesene Pool-Adresse nach der Übersetzung (z. B. 200.0.0.10)." },
      { term: "Pool-Erschöpfung", def: "Wenn alle Pool-IPs belegt sind, werden neue Verbindungen verworfen bis ein Eintrag abläuft." },
      { term: "overload",        def: "Schlüsselwort für PAT: mehrere Hosts teilen eine IP via Ports. OHNE overload = reines 1:1 Dynamic NAT." },
      { term: "clear ip nat translation *", def: "Löscht alle dynamischen NAT-Einträge sofort — statische Einträge bleiben." },
      { term: "Static vs. Dynamic", def: "Static: dauerhafter Eintrag, eingehende Verbindungen immer möglich. Dynamic: Eintrag nur während aktiver Session, eingehende Verbindungen nur im Zeitfenster." },
      { term: "Rückroute (INTERNET)", def: "Der INTERNET-Router muss 200.0.0.0/24 über ISP kennen — sonst werden Antwortpakete verworfen." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Dynamic NAT Pool + Overload
  // Topologie: PC0/PC0(1)/PC0(2) → SW → NAT → ISP → INTERNET → Webserver
  // WAN: 200.0.0.0/29 (NAT=.5, ISP=.6), Pool: 200.0.0.1–200.0.0.4
  // ─────────────────────────────────────────────────────────────
  {
    id: "nat-pool-overload",
    icon: <Globe size={20} />,
    title: "Dynamic NAT — Pool + Overload",
    subtitle: "3 PCs · SW · NAT-Router · ISP · INTERNET · Webserver · /29-Pool",
    difficulty: "Mittel",
    duration: "25 min",
    context: {
      problem:
        "Weder reines PAT (eine einzige öffentliche IP) noch reines Dynamic NAT (Pool der sich erschöpft) passen: Es sollen mehrere öffentliche IPs zur Verfügung stehen UND beliebig viele interne Hosts bedient werden können.",
      purpose:
        "Pool + Overload kombiniert beides: Ein Pool verteilt die Last auf mehrere öffentliche IPs, und 'overload' aktiviert zusätzlich PAT je Pool-Adresse — so können beliebig viele Hosts gleichzeitig ins Internet. Das ist die skalierbarste NAT-Variante.",
    },
    topology: {
      description:
        "Drei PCs im LAN 192.168.1.0/24, SW1, NAT-Router. WAN-Strecke zum ISP: 200.0.0.0/29 (/29 = 255.255.255.248 = 6 nutzbare Adressen). NAT-Router hat .5, ISP hat .6. Pool: 200.0.0.1–200.0.0.4 (4 IPs aus demselben /29). Hinter dem ISP: INTERNET-Router (1.1.1.0/30) → Webserver (47.11.8.0/24).",
      devices: [
        { type: "pc",     label: "PC0 (192.168.1.10/24)",    count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW1 (Fa0/1–3, Gig0/1)",    count: 1 },
        { type: "router", label: "NAT-Router (Gig0/0 inside, Gig0/1=200.0.0.5 outside)", count: 1 },
        { type: "router", label: "ISP (Gig0/2=200.0.0.6, Gig0/1=1.1.1.1)",  count: 1 },
        { type: "router", label: "INTERNET (Gig0/2=1.1.1.2, Gi0/0=47.11.8.1)", count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0/PC0(1)/PC0(2) → SW1 → NAT Gig0/0  (192.168.1.0/24)",
        "NAT Gig0/1 (200.0.0.5) ↔ ISP Gig0/2 (200.0.0.6)  — 200.0.0.0/29",
        "ISP Gig0/1 (1.1.1.1) ↔ INTERNET Gig0/2 (1.1.1.2)  — 1.1.1.0/30",
        "INTERNET Gi0/0 (47.11.8.1) ↔ Webserver Fa0 (47.11.8.15)  — 47.11.8.0/24",
        "NAT-Pool DYNAMIC-POOL: 200.0.0.1 – 200.0.0.4 /29 (4 IPs aus dem WAN-Subnetz)",
      ],
      hint: "/29 hat 6 nutzbare Adressen: .1–.6. .5 = NAT-Router, .6 = ISP. .1–.4 stehen als Pool zur Verfügung. Die INTERNET-Rückroute muss das gesamte /29 (200.0.0.0/29) abdecken — nicht nur die Interface-IPs.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown",
                explanation: "LAN-Interface. Gateway für alle drei PCs.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.5 255.255.255.248\n no shutdown",
                explanation:
                  "WAN-Interface im /29-Subnetz (255.255.255.248). .5 = NAT-Router, .6 = ISP — die Pool-IPs .1–.4 liegen im selben Subnetz und sind trotzdem routbar, weil der NAT-Router via Proxy-ARP für sie antwortet.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 200.0.0.6 255.255.255.248\n no shutdown",
                explanation: "ISP-Anschluss des NAT-Routers (.6 im /29).",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation: "Transit zum INTERNET-Router (1.1.1.0/30).",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown",
                explanation: "Transit-Interface Richtung ISP (.2 im /30).",
              },
              {
                cmd: "interface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation: "Interface zum Webserver-Segment.",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation: "Gateway = INTERNET-Router Gi0/0.",
              },
            ],
          },
        ],
      },
      {
        title: "2) NAT inside / outside auf Interfaces setzen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip nat inside",
                explanation: "LAN-Seite = inside. Pakete von hier werden gegen die NAT-Regeln übersetzt.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip nat outside",
                explanation: "WAN-Seite = outside. Übersetzte Pakete verlassen hier das Netz.",
              },
            ],
          },
        ],
      },
      {
        title: "3) ACL — welche Hosts übersetzt werden",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "access-list 1 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Alle Hosts im 192.168.1.0/24 sollen NAT bekommen. Wildcard 0.0.0.255 = alle 256 Adressen im Subnetz.",
              },
            ],
          },
        ],
      },
      {
        title: "4) NAT-Pool anlegen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat pool DYNAMIC-POOL 200.0.0.1 200.0.0.4 netmask 255.255.255.248",
                explanation:
                  "Pool mit 4 öffentlichen IPs (.1, .2, .3, .4) aus dem /29-Subnetz.\nMaske: 255.255.255.248 muss mit der Subnetzmaske des Pools übereinstimmen.\n.5 (NAT Outside-IP) und .6 (ISP) bleiben ausgespart — sie sind bereits belegt.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Pool + Overload aktivieren (der Schlüsselbefehl)",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source list 1 pool DYNAMIC-POOL overload",
                explanation:
                  "Drei Teile:\n  'list 1'              → Quelle muss ACL 1 treffen\n  'pool DYNAMIC-POOL'   → öffentliche Adresse aus dem Pool (.1–.4)\n  'overload'            → PAT pro Pool-IP aktivieren\n\nVergleich der drei NAT-Varianten:\n  PAT (interface overload):  1 IP  × viele Ports → unbegrenzt Hosts, eine IP\n  Dynamic NAT (pool):        4 IPs × 1:1         → max. 4 gleichzeitige Hosts\n  Pool + Overload (dieses Lab): 4 IPs × viele Ports → unbegrenzt Hosts, Last über 4 IPs verteilt",
              },
            ],
          },
        ],
      },
      {
        title: "6) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.6",
                explanation: "Default-Route zum ISP (.6 = ISP Gig0/2).",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation: "Default-Route zum INTERNET-Router.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.248 1.1.1.1",
                explanation:
                  "Rückroute für das gesamte /29 (200.0.0.0–200.0.0.7) → ISP (.1). Deckt sowohl die Pool-IPs (.1–.4) als auch die NAT-Outside-IP (.5) ab. Ohne diese Route kommen Antwortpakete nicht zurück.",
              },
            ],
          },
        ],
      },
      {
        title: "7) Konnektivität testen & Pool-Verteilung beobachten",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC0> ",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 bekommt eine IP aus dem Pool zugewiesen (z. B. 200.0.0.1) plus eine Port-Nummer. PC0(1) und PC0(2) können ebenfalls pingen — sie erhalten entweder dieselbe Pool-IP mit anderem Port oder die nächste Pool-IP.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Zeigt Einträge mit Pool-IPs als Inside Global:\n  icmp 192.168.1.10:1  200.0.0.1:1  47.11.8.15:1  47.11.8.15:1\n  icmp 192.168.1.11:1  200.0.0.1:2  47.11.8.15:1  47.11.8.15:1\nAlle Hosts teilen sich eine Pool-IP (wegen overload). Erst wenn die erste Pool-IP zu viele Verbindungen hat, nimmt der Router die nächste (.2, .3, .4).",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt Pool-Auslastung:\n  Pool DYNAMIC-POOL: 4 addresses, X allocated\n'allocated' zeigt, wie viele Pool-IPs gerade aktiv genutzt werden.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 47.11.8.15 (von PC0/PC0(1)/PC0(2))", expected: "Alle drei erfolgreich — Inside Global aus 200.0.0.1–200.0.0.4" },
      { cmd: "show ip nat translations", expected: "Pool-IPs (.1–.4) als Inside Global mit unterschiedlichen Ports" },
      { cmd: "show ip nat statistics", expected: "Pool DYNAMIC-POOL: 4 addresses, mind. 1 allocated" },
      { cmd: "show ip nat statistics", expected: "Hits steigen pro Paket; misses = 0 bei korrekter Konfiguration" },
    ],
    glossary: [
      { term: "Pool + Overload",    def: "Kombination: mehrere öffentliche IPs (Pool) + PAT pro IP (Overload) — unbegrenzt skalierbar." },
      { term: "NAT-Pool",           def: "Vorrat öffentlicher IPs: ip nat pool NAME start end netmask M." },
      { term: "overload",           def: "Aktiviert PAT je Pool-IP: viele Hosts teilen eine IP per Port." },
      { term: "/29 (255.255.255.248)", def: "8 Adressen, 6 nutzbar. Ideal für WAN-Strecken mit kleinem Pool." },
      { term: "Inside Local",       def: "Private Host-IP (192.168.1.x) vor der Übersetzung." },
      { term: "Inside Global",      def: "Pool-IP (200.0.0.1–.4) nach der Übersetzung — sichtbar im Internet." },
      { term: "Proxy ARP",          def: "Der NAT-Router antwortet auf ARP-Anfragen für Pool-IPs mit seiner eigenen MAC — so werden die Pool-IPs über sein Interface routbar, obwohl sie nicht direkt konfiguriert sind." },
      { term: "Rückroute /29",      def: "INTERNET-Router braucht Route 200.0.0.0/255.255.255.248 → ISP — deckt Pool + Outside-Interface ab." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Statisches NAT — 1:1-Adresszuordnung (Packet-Tracer-Topologie)
  // Topologie: PC0/PC0(1)/PC0(2) → SW → NAT → ISP → INTERNET → Webserver
  // ─────────────────────────────────────────────────────────────
  {
    id: "static-nat",
    icon: <Globe size={20} />,
    title: "Statisches NAT",
    subtitle: "3 PCs · SW · NAT-Router · ISP · INTERNET · Webserver",
    difficulty: "Mittel",
    duration: "25 min",
    context: {
      problem:
        "Ein Server im LAN (z. B. ein Webserver oder RDP-Host) muss permanent unter einer festen öffentlichen IP erreichbar sein — PAT und Dynamic NAT vergeben Adressen zufällig oder nur für ausgehende Verbindungen.",
      purpose:
        "Statisches NAT legt eine unveränderliche 1:1-Zuordnung zwischen einer privaten (Inside Local) und einer öffentlichen (Inside Global) Adresse fest. Der Eintrag existiert dauerhaft in der NAT-Tabelle — auch ohne aktive Verbindung. Damit sind eingehende Verbindungen von außen möglich, was bei PAT nicht geht.",
    },
    topology: {
      description:
        "Drei PCs hängen an einem Switch im Netz 192.168.1.0/24. Der NAT-Router trennt das private LAN vom öffentlichen 200.0.0.0/24-Netz. Dahinter simuliert ein ISP-Router + INTERNET-Router das Kernnetz; ein Webserver (47.11.8.15) stellt das Internet dar.",
      devices: [
        { type: "pc",     label: "PC0  (192.168.1.10/24)",  count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW (Layer-2, kein Config)", count: 1 },
        { type: "router", label: "NAT-Router",               count: 1 },
        { type: "router", label: "ISP",                      count: 1 },
        { type: "router", label: "INTERNET",                 count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0 / PC0(1) / PC0(2) → SW  (192.168.1.0/24)",
        "SW Gig0/1 → NAT Gig0/0  (inside, 192.168.1.1/24)",
        "NAT Gig0/1 → ISP Gig0/1  (200.0.0.253 ↔ 200.0.0.254, /24)",
        "ISP Gig0/2 → INTERNET Gig0/2  (1.1.1.1 ↔ 1.1.1.2, /30)",
        "INTERNET Gig0/0 → Webserver Fa0  (47.11.8.1 ↔ 47.11.8.15, /24)",
      ],
      hint: "NAT Gig0/0 = ip nat inside (LAN), NAT Gig0/1 = ip nat outside (WAN). Die öffentlichen IPs 200.0.0.10–.12 müssen im ISP-Kernnetz routbar sein — der INTERNET-Router braucht eine Rückroute.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Statische IP-Konfiguration auf PC0. Gateway zeigt auf den NAT-Router (inside-Interface). Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n ip nat inside\n no shutdown",
                explanation:
                  "LAN-seitiges Interface — 'ip nat inside' markiert es als die vertrauenswürdige Seite. Pakete, die hier ankommen, werden gegen die statische NAT-Tabelle geprüft.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.253 255.255.255.0\n ip nat outside\n no shutdown",
                explanation:
                  "'ip nat outside' markiert das WAN-Interface. Übersetzte Pakete verlassen das Netz hier mit der öffentlichen Inside-Global-Adresse.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.254 255.255.255.0\n no shutdown\ninterface GigabitEthernet0/2\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation:
                  "ISP verbindet NAT-Router (Gi0/1, 200.0.0.x) und INTERNET-Router (Gi0/2, 1.1.1.0/30). /30 auf dem Transit-Link = 2 nutzbare Adressen, ideale P2P-Strecke.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown\ninterface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation:
                  "INTERNET-Router: Transit-Seite zum ISP (.2 im /30) und LAN-Seite zum Webserver (47.11.8.x/24).",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation:
                  "Der Webserver braucht eine statische öffentliche IP. Gateway zeigt auf den INTERNET-Router.",
              },
            ],
          },
        ],
      },
      {
        title: "2) Statische NAT-Einträge anlegen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source static 192.168.1.10 200.0.0.10\nip nat inside source static 192.168.1.11 200.0.0.11\nip nat inside source static 192.168.1.12 200.0.0.12",
                explanation:
                  "Jeder Befehl legt eine permanente 1:1-Zuordnung an:\n  Inside Local  →  Inside Global\n  192.168.1.10  →  200.0.0.10\n  192.168.1.11  →  200.0.0.11\n  192.168.1.12  →  200.0.0.12\nDieser Eintrag existiert immer in der NAT-Tabelle — unabhängig davon, ob der Host gerade kommuniziert. Eingehende Verbindungen an 200.0.0.10 landen direkt auf PC0.",
              },
            ],
          },
        ],
      },
      {
        title: "3) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.254",
                explanation:
                  "Default-Route: Alles, was der NAT-Router nicht kennt, schickt er zum ISP (.254). Nach der Übersetzung verlässt das Paket das Netz über Gi0/1 mit der Inside-Global-Adresse.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation:
                  "ISP-Default-Route zum INTERNET-Router. Antwortpakete vom Webserver (Ziel: 200.0.0.x) kommen über diesen Weg zurück.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.0 1.1.1.1",
                explanation:
                  "Kritische Rückroute! Der INTERNET-Router muss wissen, dass 200.0.0.0/24 über den ISP (.1) erreichbar ist — sonst wirft er Antwortpakete weg (Inside-Global-Adressen sind nicht direkt verbunden).",
              },
            ],
          },
        ],
      },
      {
        title: "4) Konnektivität testen",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC0> ",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 (192.168.1.10) sendet ICMP. Der NAT-Router übersetzt die Quelle auf 200.0.0.10 (Inside Global) und leitet weiter. Webserver antwortet an 200.0.0.10, NAT übersetzt zurück auf 192.168.1.10.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Zeigt drei dauerhafte Einträge (auch ohne Ping):\n  Pro --- 192.168.1.10  200.0.0.10  ---  ---\nNach einem Ping kommen ICMP-Einträge mit Timestamps hinzu:\n  icmp 192.168.1.10:x  200.0.0.10:x  47.11.8.15:x  47.11.8.15:x\nGenau dieser Unterschied zu Dynamic NAT / PAT ist Prüfungsinhalt!",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt: Translations total, inside/outside Interfaces, Hits und Misses. Bei statischem NAT: 'static mappings' immer > 0. Misses deuten auf fehlende ip nat inside/outside-Markierung hin.",
              },
              {
                cmd: "debug ip nat",
                explanation:
                  "Zeigt jede Übersetzung in Echtzeit:\n  NAT: s=192.168.1.10->200.0.0.10, d=47.11.8.15\nZum Beenden: 'undebug all'. Nur in Lab-Umgebungen verwenden — produktiv zu laut.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Eingehende Verbindung testen (Besonderheit Static NAT)",
        blocks: [
          {
            device: "Webserver",
            mode: "cli",
            modeLabel: "Webserver> ",
            commands: [
              {
                cmd: "ping 200.0.0.10",
                explanation:
                  "Der Webserver initiiert eine Verbindung an die öffentliche IP 200.0.0.10. Der NAT-Router übersetzt das Ziel 200.0.0.10 → 192.168.1.10 und leitet ins LAN. Das funktioniert NUR mit Static NAT — PAT kann eingehende Verbindungen nicht zuordnen, da kein Port-Mapping vorhanden ist.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip nat translations", expected: "3 statische Einträge (Pro-Zeilen) dauerhaft sichtbar, auch ohne aktiven Traffic" },
      { cmd: "show ip nat statistics", expected: "Total active translations: 3 static; Hits steigen bei Ping" },
      { cmd: "ping 47.11.8.15 (von PC0)", expected: "Quelle 192.168.1.10 → 200.0.0.10 in der NAT-Tabelle sichtbar" },
      { cmd: "ping 200.0.0.10 (vom Webserver)", expected: "Eingehende Verbindung landet auf PC0 — nur möglich mit Static NAT" },
      { cmd: "debug ip nat", expected: "s=192.168.1.10->200.0.0.10 für jedes Paket von PC0" },
    ],
    glossary: [
      { term: "Statisches NAT",       def: "Permanente 1:1-Zuordnung: eine private Inside-Local-Adresse ↔ eine feste öffentliche Inside-Global-Adresse." },
      { term: "Inside Local",         def: "Die private IP des Hosts im LAN (vor der Übersetzung, z. B. 192.168.1.10)." },
      { term: "Inside Global",        def: "Die öffentliche IP nach der Übersetzung (z. B. 200.0.0.10) — sichtbar im Internet." },
      { term: "Outside Global",       def: "Die IP des externen Hosts (Webserver 47.11.8.15) — bleibt unverändert." },
      { term: "ip nat inside source static",  def: "Konfiguriert einen statischen NAT-Eintrag: ip nat inside source static <priv> <pub>." },
      { term: "ip nat inside",        def: "Markiert das LAN-Interface als vertrauenswürdige Seite." },
      { term: "ip nat outside",       def: "Markiert das WAN-Interface als öffentliche Seite." },
      { term: "Eingehende Verbindung", def: "Static NAT ermöglicht Verbindungen von außen nach innen (z. B. Webserver→PC). PAT kann das nicht." },
      { term: "Rückroute (INTERNET)", def: "Der INTERNET-Router muss 200.0.0.0/24 über den ISP kennen — sonst werden Antwortpakete verworfen." },
      { term: "debug ip nat",         def: "Zeigt jede Übersetzung in Echtzeit. Zum Beenden: 'undebug all'." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Campus-Integration: VLAN + VTP + DTP + RoaS + DHCP + PAT
  // SW1 (VTP-Server) → SW2 (VTP-Client) → Router0 (DHCP+NAT)
  // VLAN10=Blau(192.168.10.0/24), VLAN20=Grün(192.168.20.0/24), VLAN30=Gelb(192.168.30.0/24)
  // ─────────────────────────────────────────────────────────────
  {
    id: "vlan-dhcp-nat-roas",
    icon: <Globe size={20} />,
    title: "VLAN + DHCP + NAT — Campus mit Internetzugang",
    subtitle: "SW1/SW2 · VTP · DTP · RoaS · 3×DHCP-Pool · PAT · ISP · INTERNET",
    difficulty: "Fortgeschritten",
    duration: "40 min",
    context: {
      problem:
        "Ein Campus hat drei Abteilungen (Blau, Grün, Gelb) in separaten VLANs. Alle Hosts bekommen ihre IPs per DHCP und sollen trotzdem gemeinsam über eine einzige öffentliche IP ins Internet.",
      purpose:
        "Dieses Lab verbindet alle Kernthemen: VLAN-Segmentierung via VTP, automatischer Trunking via DTP, Inter-VLAN-Routing via Router-on-a-Stick, DHCP-Versorgung je VLAN und PAT für den Internetzugang. Jede Komponente hängt von der vorherigen ab.",
    },
    topology: {
      description:
        "SW1 (VTP Server, VLAN-Quelle) ist per Trunk mit SW2 (VTP Client) verbunden. SW2 verbindet sich per Trunk mit Router0 (RoaS). Router0 verwaltet drei Sub-Interfaces für die VLANs, dient als DHCP-Server für alle drei Netze und übersetzt per PAT auf seine öffentliche IP (200.0.0.1/30). Dahinter: ISP → INTERNET → Webserver (47.11.8.15).",
      devices: [
        { type: "switch", label: "SW1 — VTP Server, VLAN 10/20/30 anlegen",    count: 1 },
        { type: "switch", label: "SW2 — VTP Client, Trunk zu SW1 + Router0",   count: 1 },
        { type: "router", label: "Router0 — RoaS + DHCP-Server + NAT/PAT",     count: 1 },
        { type: "pc",     label: "PC3 (Blau, VLAN 10) — SW1 Fa0/1",            count: 1 },
        { type: "pc",     label: "PC4 (Grün, VLAN 20) — SW1 Fa0/11",           count: 1 },
        { type: "pc",     label: "C5 (Gelb, VLAN 30) — SW1 Fa0/15",            count: 1 },
        { type: "pc",     label: "PC0 (Blau, VLAN 10) — SW2 Fa0/1",            count: 1 },
        { type: "pc",     label: "PC2 (Grün, VLAN 20) — SW2 Fa0/11",           count: 1 },
        { type: "pc",     label: "PC1 (Gelb, VLAN 30) — SW2 Fa0/15",           count: 1 },
        { type: "router", label: "ISP (Gig0/2=200.0.0.2, Gig0/1=1.1.1.1)",    count: 1 },
        { type: "router", label: "INTERNET (Gig0/2=1.1.1.2, Gi0/0=47.11.8.1)", count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)",                  count: 1 },
      ],
      connections: [
        "SW1 Gig0/1 ↔ SW2 Gig0/2  — Trunk (DTP: SW1 mode on, SW2 mode desirable)",
        "SW2 Gig0/1 ↔ Router0 Gig0/0  — Trunk (Router-on-a-Stick)",
        "Router0 Gig0/1 (200.0.0.1) ↔ ISP Gig0/2 (200.0.0.2)  — 200.0.0.0/30",
        "ISP Gig0/1 (1.1.1.1) ↔ INTERNET Gig0/2 (1.1.1.2)  — 1.1.1.0/30",
        "INTERNET Gi0/0 (47.11.8.1) ↔ Webserver Fa0 (47.11.8.15)  — 47.11.8.0/24",
      ],
      hint: "Reihenfolge ist entscheidend: 1) VLANs auf VTP-Server anlegen → propagieren zu Client. 2) Trunks aktiv. 3) Sub-Interfaces + DHCP auf Router. 4) NAT-ACL muss alle drei Subnetze erfassen. 5) Routing.",
    },
    steps: [
      {
        title: "1) VLANs anlegen — SW1 als VTP Server",
        blocks: [
          {
            device: "SW1",
            mode: "config",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "vtp mode server", explanation: "SW1 ist die VLAN-Quelle im VTP-Verbund. Nur auf dem Server können VLANs angelegt werden." },
              { cmd: "vtp domain VTPDOM", explanation: "VTP-Domäne: VTPDOM. Alle Switches im Verbund müssen dieselbe Domäne haben — sonst ignorieren sie VTP-Nachrichten." },
              { cmd: "vtp password geheim!", explanation: "VTP-Passwort als MD5-Hash. SW2 muss dasselbe Passwort haben, sonst werden keine VTP-Updates akzeptiert." },
              { cmd: "vlan 10", explanation: "VLAN 10 anlegen." },
              { cmd: " name Blau", explanation: "VLAN 10 heißt 'Blau' — PCs in blauen Ovalen in der Topologie." },
              { cmd: "vlan 20", explanation: "VLAN 20 anlegen." },
              { cmd: " name Gruen", explanation: "VLAN 20 = 'Gruen' — grüne PCs." },
              { cmd: "vlan 30", explanation: "VLAN 30 anlegen." },
              { cmd: " name Gelb", explanation: "VLAN 30 = 'Gelb' — gelbe PCs. Alle drei VLANs werden über VTP an SW2 propagiert, sobald der Trunk aktiv ist." },
            ],
          },
        ],
      },
      {
        title: "2) VTP auf SW2 konfigurieren",
        blocks: [
          {
            device: "SW2",
            mode: "config",
            modeLabel: "SW2(config)#",
            commands: [
              { cmd: "vtp mode client", explanation: "SW2 ist VTP Client — darf keine VLANs anlegen, empfängt sie vom Server." },
              { cmd: "vtp domain VTPDOM", explanation: "Muss identisch mit SW1 sein." },
              { cmd: "vtp password geheim!", explanation: "Muss identisch mit SW1 sein. Danach warten bis der Trunk aktiv ist — VLANs erscheinen automatisch." },
            ],
          },
        ],
      },
      {
        title: "3) Trunk SW1 ↔ SW2 konfigurieren (DTP)",
        blocks: [
          {
            device: "SW1",
            mode: "config-if",
            modeLabel: "SW1(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "Trunk-Port zu SW2." },
              { cmd: "switchport mode trunk", explanation: "DTP Mode 'on' — sendet aktiv DTP-Frames und erzwingt Trunk. Wartet nicht auf Gegenseite." },
            ],
          },
          {
            device: "SW2",
            mode: "config-if",
            modeLabel: "SW2(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/2", explanation: "Trunk-Port zu SW1." },
              { cmd: "switchport mode dynamic desirable", explanation: "DTP Mode 'desirable' — SW2 sendet DTP-Frames und möchte einen Trunk. Da SW1 auf 'on' steht, wird der Trunk erfolgreich ausgehandelt." },
            ],
          },
        ],
      },
      {
        title: "4) Access-Ports konfigurieren (SW1 + SW2)",
        blocks: [
          {
            device: "SW1",
            mode: "config-if",
            modeLabel: "SW1(config-if)#",
            commands: [
              { cmd: "interface FastEthernet0/1", explanation: "Port zu PC3 (Blau)." },
              { cmd: "switchport mode access", explanation: "Access-Port — kein Trunk-Tag." },
              { cmd: "switchport access vlan 10", explanation: "PC3 kommt in VLAN 10 (Blau)." },
              { cmd: "interface FastEthernet0/11", explanation: "Port zu PC4 (Grün)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 20", explanation: "PC4 → VLAN 20 (Grün)." },
              { cmd: "interface FastEthernet0/15", explanation: "Port zu C5 (Gelb)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 30", explanation: "C5 → VLAN 30 (Gelb)." },
            ],
          },
          {
            device: "SW2",
            mode: "config-if",
            modeLabel: "SW2(config-if)#",
            commands: [
              { cmd: "interface FastEthernet0/1", explanation: "Port zu PC0 (Blau)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 10", explanation: "PC0 → VLAN 10." },
              { cmd: "interface FastEthernet0/11", explanation: "Port zu PC2 (Grün)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 20", explanation: "PC2 → VLAN 20." },
              { cmd: "interface FastEthernet0/15", explanation: "Port zu PC1 (Gelb)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 30", explanation: "PC1 → VLAN 30." },
            ],
          },
        ],
      },
      {
        title: "5) Trunk SW2 ↔ Router0 konfigurieren",
        blocks: [
          {
            device: "SW2",
            mode: "config-if",
            modeLabel: "SW2(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "Uplink zum Router0." },
              { cmd: "switchport mode trunk", explanation: "Trunk zum Router erzwingen. Kein DTP-Aushandeln nötig — Router unterstützt kein DTP." },
            ],
          },
        ],
      },
      {
        title: "6) Router0: Sub-Interfaces (RoaS) + ip nat inside",
        blocks: [
          {
            device: "Router0",
            mode: "config-if",
            modeLabel: "Router0(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0", explanation: "Physical Interface — kein IP, nur aktivieren. Sub-Interfaces übernehmen die Adressierung." },
              { cmd: "no ip address", explanation: "Keine IP auf dem Physical Interface." },
              { cmd: "no shutdown", explanation: "Physical Interface muss aktiv sein damit Sub-Interfaces funktionieren." },
              { cmd: "interface GigabitEthernet0/0.10", explanation: "Sub-Interface für VLAN 10." },
              { cmd: "encapsulation dot1q 10", explanation: "802.1Q-Tag für VLAN 10." },
              { cmd: "ip address 192.168.10.1 255.255.255.0", explanation: "Gateway für VLAN 10 (Blau). Alle DHCP-Clients in VLAN 10 erhalten diese IP als Default-Gateway." },
              { cmd: "ip nat inside", explanation: "Sub-Interface .10 als NAT-inside markieren. Wichtig: Jedes LAN-Sub-Interface bekommt 'ip nat inside'." },
              { cmd: "interface GigabitEthernet0/0.20", explanation: "Sub-Interface für VLAN 20." },
              { cmd: "encapsulation dot1q 20", explanation: "802.1Q-Tag für VLAN 20." },
              { cmd: "ip address 192.168.20.1 255.255.255.0", explanation: "Gateway für VLAN 20 (Grün)." },
              { cmd: "ip nat inside", explanation: "VLAN-20-Traffic wird ebenfalls NAT-übersetzt." },
              { cmd: "interface GigabitEthernet0/0.30", explanation: "Sub-Interface für VLAN 30." },
              { cmd: "encapsulation dot1q 30", explanation: "802.1Q-Tag für VLAN 30." },
              { cmd: "ip address 192.168.30.1 255.255.255.0", explanation: "Gateway für VLAN 30 (Gelb)." },
              { cmd: "ip nat inside", explanation: "VLAN-30-Traffic NAT-fähig." },
              { cmd: "interface GigabitEthernet0/1", explanation: "WAN-Interface Richtung ISP." },
              { cmd: "ip address 200.0.0.1 255.255.255.252", explanation: "Öffentliche IP auf dem /30-Subnetz. .1 = Router0, .2 = ISP." },
              { cmd: "ip nat outside", explanation: "WAN-Interface = outside. Übersetzte Pakete aller drei VLANs verlassen hier das Netz mit Source 200.0.0.1." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
            ],
          },
        ],
      },
      {
        title: "7) DHCP-Server einrichten — 3 Pools (je ein VLAN)",
        blocks: [
          {
            device: "Router0",
            mode: "config",
            modeLabel: "Router0(config)#",
            commands: [
              { cmd: "ip dhcp excluded-address 192.168.10.1", explanation: "Gateway-IP aus dem DHCP-Pool ausschließen — Router0 vergibt sie nicht an Clients." },
              { cmd: "ip dhcp excluded-address 192.168.20.1", explanation: "Gateway VLAN 20 ausschließen." },
              { cmd: "ip dhcp excluded-address 192.168.30.1", explanation: "Gateway VLAN 30 ausschließen." },
              { cmd: "ip dhcp pool VLAN10", explanation: "DHCP-Pool für VLAN 10 (Blau)." },
              { cmd: " network 192.168.10.0 255.255.255.0", explanation: "Der Pool bedient das gesamte 192.168.10.0/24." },
              { cmd: " default-router 192.168.10.1", explanation: "Gateway, das den Clients mitgeteilt wird (= das Sub-Interface .10)." },
              { cmd: " dns-server 8.8.8.8", explanation: "DNS-Server. In Packet Tracer kann auch eine beliebige erreichbare IP verwendet werden." },
              { cmd: "ip dhcp pool VLAN20", explanation: "DHCP-Pool für VLAN 20 (Grün)." },
              { cmd: " network 192.168.20.0 255.255.255.0", explanation: "Pool für 192.168.20.0/24." },
              { cmd: " default-router 192.168.20.1", explanation: "Gateway VLAN 20." },
              { cmd: " dns-server 8.8.8.8", explanation: "DNS-Server." },
              { cmd: "ip dhcp pool VLAN30", explanation: "DHCP-Pool für VLAN 30 (Gelb)." },
              { cmd: " network 192.168.30.0 255.255.255.0", explanation: "Pool für 192.168.30.0/24." },
              { cmd: " default-router 192.168.30.1", explanation: "Gateway VLAN 30." },
              { cmd: " dns-server 8.8.8.8", explanation: "DNS-Server." },
            ],
          },
        ],
      },
      {
        title: "8) NAT/PAT konfigurieren — alle VLANs über eine IP",
        blocks: [
          {
            device: "Router0",
            mode: "config",
            modeLabel: "Router0(config)#",
            commands: [
              { cmd: "access-list 1 permit 192.168.10.0 0.0.0.255", explanation: "ACL 1 erlaubt VLAN-10-Hosts als NAT-Quellen." },
              { cmd: "access-list 1 permit 192.168.20.0 0.0.0.255", explanation: "ACL 1 erlaubt VLAN-20-Hosts. Mehrere 'permit'-Zeilen in einer ACL sind möglich." },
              { cmd: "access-list 1 permit 192.168.30.0 0.0.0.255", explanation: "ACL 1 erlaubt VLAN-30-Hosts. Alle drei Subnetze werden auf 200.0.0.1 übersetzt." },
              { cmd: "ip nat inside source list 1 interface GigabitEthernet0/1 overload", explanation: "'list 1' → Quelle muss ACL 1 treffen. 'interface Gi0/1' → benutze 200.0.0.1 als öffentliche IP. 'overload' → PAT. Egal ob Host aus VLAN 10, 20 oder 30 — alle erscheinen im Internet als 200.0.0.1 mit unterschiedlichen Ports." },
            ],
          },
        ],
      },
      {
        title: "9) Routing — Default-Route + Rückrouten",
        blocks: [
          {
            device: "Router0",
            mode: "config",
            modeLabel: "Router0(config)#",
            commands: [
              { cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.2", explanation: "Default-Route zum ISP (.2)." },
            ],
          },
          {
            device: "ISP",
            mode: "config",
            modeLabel: "ISP(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/2\n ip address 200.0.0.2 255.255.255.252\n no shutdown", explanation: "ISP-Interface Richtung Router0." },
              { cmd: "interface GigabitEthernet0/1\n ip address 1.1.1.1 255.255.255.252\n no shutdown", explanation: "ISP-Interface Richtung INTERNET." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2", explanation: "Default-Route zum INTERNET-Router." },
            ],
          },
          {
            device: "INTERNET",
            mode: "config",
            modeLabel: "INTERNET(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown", explanation: "Transit-Interface Richtung ISP." },
              { cmd: "interface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown", explanation: "Interface zum Webserver-Segment." },
              { cmd: "ip route 200.0.0.0 255.255.255.252 1.1.1.1", explanation: "Rückroute für 200.0.0.0/30 → ISP. Ohne diese Route finden Antwortpakete den Weg zu 200.0.0.1 nicht." },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              { cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1", explanation: "Statische öffentliche IP. Gateway = INTERNET-Router." },
            ],
          },
        ],
      },
      {
        title: "10) Konnektivität testen",
        blocks: [
          {
            device: "PC0 / PC3",
            mode: "cli",
            modeLabel: "PC> (DHCP abwarten)",
            commands: [
              { cmd: "ipconfig /renew", explanation: "DHCP-Adresse anfordern (falls nötig). PC0 und PC3 sollten eine 192.168.10.x bekommen, Gateway 192.168.10.1." },
              { cmd: "ping 192.168.20.x", explanation: "Inter-VLAN-Ping zu einem Grün-PC — bestätigt, dass RoaS funktioniert. Router0 leitet zwischen den Sub-Interfaces weiter." },
              { cmd: "ping 47.11.8.15", explanation: "Internet-Ping — bestätigt NAT + Routing. Quelle 192.168.10.x wird zu 200.0.0.1:Port in der NAT-Tabelle." },
            ],
          },
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "Router0#",
            commands: [
              { cmd: "show ip dhcp binding", explanation: "Zeigt alle DHCP-Leases: welche IP an welche MAC vergeben wurde. Müssen Einträge aus allen drei VLANs sehen." },
              { cmd: "show ip nat translations", explanation: "Aktive PAT-Einträge: alle Hosts aus VLANs 10/20/30 erscheinen mit 200.0.0.1 als Inside Global." },
              { cmd: "show vlan brief", explanation: "Auf SW1/SW2: VLANs 10/20/30 müssen mit den richtigen Ports und Status 'active' sichtbar sein." },
              { cmd: "show interfaces trunk", explanation: "Auf SW1/SW2: Trunk-Ports zeigt VLANs allowed und in STP forwarding — alle drei VLANs müssen im Trunk-Status sein." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief (SW1)", expected: "VLAN 10 Blau, VLAN 20 Gruen, VLAN 30 Gelb — alle active mit korrekten Ports" },
      { cmd: "show vtp status (SW2)", expected: "Mode Client, Domain VTPDOM, VLANs 10/20/30 vorhanden" },
      { cmd: "show interfaces trunk (SW1/SW2)", expected: "Gi0/1 als Trunk, VLANs 10/20/30 allowed and active" },
      { cmd: "show ip dhcp binding (Router0)", expected: "Leases aus 192.168.10.x, .20.x, .30.x — alle drei VLANs bedient" },
      { cmd: "ping 47.11.8.15 (von PC0/PC3/PC1/PC2)", expected: "Alle Hosts aller VLANs erreichen den Webserver" },
      { cmd: "show ip nat translations (Router0)", expected: "Inside Global 200.0.0.1 für Hosts aus allen drei VLANs" },
    ],
    glossary: [
      { term: "VTP Server/Client",    def: "Server legt VLANs an und propagiert sie per VTP-Update über Trunks an Clients." },
      { term: "VTP Domain + Passwort", def: "Beide müssen auf allen Switches übereinstimmen — sonst werden VTP-Updates ignoriert." },
      { term: "DTP mode on",          def: "Erzwingt Trunk — sendet DTP-Frames, wartet nicht auf Antwort." },
      { term: "DTP mode desirable",   def: "Möchte Trunk — verhandelt aktiv, wird mit 'on' oder 'desirable' erfolgreich." },
      { term: "Router-on-a-Stick",    def: "Ein Router-Interface trägt per 802.1Q-Trunk mehrere VLANs über Sub-Interfaces — Inter-VLAN-Routing ohne L3-Switch." },
      { term: "ip dhcp pool",         def: "Definiert einen DHCP-Adressbereich. Pro VLAN ein eigener Pool." },
      { term: "ip dhcp excluded-address", def: "Schließt IPs (z. B. Gateways) aus dem DHCP-Pool aus." },
      { term: "ACL + NAT (mehrere Subnetze)", def: "Mehrere 'permit'-Zeilen in einer Standard-ACL reichen — alle werden mit 'overload' auf eine IP übersetzt." },
      { term: "ip nat inside (Sub-Interface)", def: "Jedes LAN-Sub-Interface muss einzeln mit 'ip nat inside' markiert werden." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 22. NTP + Syslog + SNMPv3
  // ─────────────────────────────────────────────────────────────
  {
    id: "ntp-syslog-snmp",
    icon: <Info size={20} />,
    title: "NTP + Syslog + SNMPv3",
    subtitle: "Time-Sync, zentrales Logging, sicheres Monitoring",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "Ohne synchronisierte Uhren lassen sich Logs verschiedener Geräte nicht korrelieren — und ohne zentrales Logging übersieht man Vorfälle ganz.",
      purpose:
        "Betriebsgrundlagen einrichten: NTP für eine einheitliche, authentifizierte Zeit und Syslog für zentrale Logs mit korrekten Zeitstempeln.",
    },
    topology: {
      description:
        "Switch SW1 als 'managed Device'. NTP-Server 10.0.0.10, Syslog-Server 10.0.0.20, SNMPv3 Monitoring von 10.0.0.30 mit Auth+Priv.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "server", label: "NTP, Syslog, SNMP-Manager", count: 3 },
      ],
      connections: ["SW1 Gi0/1 → Server-VLAN 99"],
      hint: "Ohne korrekte Zeit sind Logs WERTLOS — NTP zuerst, dann alles andere.",
    },
    steps: [
      {
        title: "NTP-Client mit Authentication",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "clock timezone CET 1", explanation: "Zeitzone Mitteleuropa = UTC+1." },
              { cmd: "clock summer-time CEST recurring last Sun Mar 2:00 last Sun Oct 3:00", explanation: "Sommerzeit-Regel automatisch." },
              { cmd: "ntp authentication-key 1 md5 CCNAntpKey", explanation: "Authentication-Key 1, MD5-Hash." },
              { cmd: "ntp authenticate", explanation: "Server-Auth einschalten." },
              { cmd: "ntp trusted-key 1", explanation: "Erlaubte Key-IDs." },
              { cmd: "ntp server 10.0.0.10 key 1 prefer", explanation: "Primärer NTP-Server, signiert mit Key 1." },
              { cmd: "ntp source Loopback0", explanation: "Stabile Quell-IP." },
            ],
          },
        ],
      },
      {
        title: "Syslog zentral senden",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "logging host 10.0.0.20", explanation: "Syslog-Server." },
              { cmd: "logging trap informational", explanation: "Severity 6 — alles ab informational (0-7: emerg/alert/crit/err/warn/notif/info/debug)." },
              { cmd: "logging facility local6", explanation: "Facility (Default local7) — hilft Server beim Sortieren." },
              { cmd: "logging source-interface Loopback0", explanation: "Quell-IP konstant halten." },
              { cmd: "service timestamps log datetime msec localtime show-timezone", explanation: "Logs mit Millisekunden-Zeitstempel + Zeitzone." },
              { cmd: "service sequence-numbers", explanation: "Jede Log-Zeile nummerieren — keine Logs verloren." },
            ],
          },
        ],
      },
      {
        title: "SNMPv3 (Auth + Priv)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "snmp-server view RO-VIEW iso included", explanation: "View definieren — was darf gelesen werden." },
              { cmd: "snmp-server group MONGRP v3 priv read RO-VIEW", explanation: "Gruppe MONGRP mit SNMPv3 priv (auth + encryption)." },
              { cmd: "snmp-server user monitor MONGRP v3 auth sha CcnaAuth1! priv aes 128 CcnaPriv1!", explanation: "User 'monitor' mit SHA-Auth + AES-128-Encryption." },
              { cmd: "snmp-server host 10.0.0.30 version 3 priv monitor", explanation: "Trap-Empfänger." },
              { cmd: "snmp-server enable traps", explanation: "Alle Standard-Traps senden." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ntp status", expected: "Clock is synchronized, stratum 4, reference is 10.0.0.10" },
      { cmd: "show ntp associations", expected: "*~10.0.0.10  (* = sys.peer)" },
      { cmd: "show logging", expected: "Trap logging: level informational, 0 messages lost, Logging to 10.0.0.20" },
      { cmd: "show snmp user", expected: "User name: monitor, Auth Protocol: SHA, Privacy: AES128" },
    ],
    glossary: [
      { term: "NTP", def: "Network Time Protocol (UDP 123) — synchronisiert die Uhren aller Geräte." },
      { term: "Stratum", def: "Distanz zur Referenzuhr; je niedriger, desto vertrauenswürdiger die Zeitquelle." },
      { term: "ntp authenticate", def: "Aktiviert NTP-Authentifizierung (mit ntp authentication-key … md5)." },
      { term: "Syslog", def: "Standard für Geräte-Logmeldungen, üblicherweise an einen zentralen Server (logging host)." },
      { term: "logging trap <level>", def: "Legt fest, ab welchem Schweregrad Meldungen zum Server gehen." },
      { term: "Severity-Level", def: "0 (Emergency) bis 7 (Debug) — Schweregrad einer Syslog-Meldung." },
      { term: "service timestamps", def: "Versieht Log-/Debug-Zeilen mit Datum/Uhrzeit — Voraussetzung für Korrelation." },
      { term: "facility", def: "Kategorie/Quelle einer Syslog-Meldung (z. B. local6)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 21. HSRP (FHRP)
  // ─────────────────────────────────────────────────────────────
  {
    id: "hsrp",
    icon: <Shuffle size={20} />,
    title: "HSRP First-Hop Redundancy",
    subtitle: "Virtuelles Gateway, Priority, Preempt, Tracking",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Ein einzelnes Default-Gateway ist ein Single Point of Failure: fällt der Router aus, verlieren alle Hosts ihre Verbindung nach außen.",
      purpose:
        "HSRP gibt zwei Routern eine gemeinsame virtuelle Gateway-IP. Fällt der Active-Router aus, übernimmt der Standby unbemerkt — die Clients merken nichts. FHRP-Standard für Gateway-Redundanz.",
    },
    topology: {
      description:
        "Zwei Distribution-Router teilen sich ein virtuelles Default Gateway. Fällt R1 (Active) aus, übernimmt R2 (Standby) in <3s.",
      devices: [{ type: "router", label: "R1, R2", count: 2 }],
      connections: [
        "R1 Gi0/0 — 192.168.1.2/24 (HSRP Active, Priority 110)",
        "R2 Gi0/0 — 192.168.1.3/24 (HSRP Standby, Priority 100)",
        "Virtuelle IP — 192.168.1.1 (Default Gateway der Clients)",
      ],
      hint: "Clients kennen NUR 192.168.1.1. HSRP-Gruppe nutzt eine virtuelle MAC 0000.0c07.acXX (XX = Gruppen-ID hex).",
    },
    steps: [
      {
        title: "R1 — Active (höhere Priority)",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "" },
              { cmd: "ip address 192.168.1.2 255.255.255.0", explanation: "Eigene IP." },
              { cmd: "standby version 2", explanation: "HSRPv2 (statt Default v1) — unterstützt IPv6 und größere Group-IDs." },
              { cmd: "standby 1 ip 192.168.1.1", explanation: "Gruppen-ID 1, virtuelle Gateway-IP." },
              { cmd: "standby 1 priority 110", explanation: "Priorität (Default 100). Höhere wins." },
              { cmd: "standby 1 preempt", explanation: "Übernimmt SOFORT die Active-Rolle, wenn online (sonst bleibt der bisherige Active)." },
              { cmd: "standby 1 timers msec 200 msec 750", explanation: "Hello 200ms, Hold 750ms → schnelles Failover." },
              { cmd: "standby 1 track Gi0/1 30", explanation: "Wenn Uplink Gi0/1 ausfällt → Priority sinkt um 30 (110→80) → R2 (100) übernimmt." },
              { cmd: "standby 1 authentication md5 key-string CCNAhsrp", explanation: "MD5-Auth gegen Rogue-HSRP-Spoofing." },
            ],
          },
        ],
      },
      {
        title: "R2 — Standby (Default-Priority)",
        blocks: [
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "" },
              { cmd: "ip address 192.168.1.3 255.255.255.0", explanation: "" },
              { cmd: "standby version 2", explanation: "Muss übereinstimmen." },
              { cmd: "standby 1 ip 192.168.1.1", explanation: "Gleiche Virtual-IP." },
              { cmd: "standby 1 preempt", explanation: "Damit es bei R1-Recovery die Rolle auch wieder zurückgeben kann." },
              { cmd: "standby 1 authentication md5 key-string CCNAhsrp", explanation: "Gleiches Auth-Pass." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show standby brief", expected: "Grp 1, State Active (R1) / Standby (R2), Virtual IP 192.168.1.1" },
      { cmd: "show standby Gi0/0 1", expected: "Hellos sent, Priority 110, Track Gi0/1 line-protocol Up" },
      { cmd: "ping 192.168.1.1 (vom PC)", expected: "Antwortet, MAC = 0000.0c9f.f001" },
    ],
    glossary: [
      { term: "HSRP", def: "Hot Standby Router Protocol (Cisco) — zwei Router teilen sich eine virtuelle Gateway-IP." },
      { term: "FHRP", def: "First Hop Redundancy Protocol — Oberbegriff (HSRP, VRRP, GLBP)." },
      { term: "Virtuelle IP/MAC", def: "Gemeinsame Adresse, die die Clients als Gateway nutzen; wandert beim Failover mit." },
      { term: "Active / Standby", def: "Der Active leitet weiter; der Standby wartet bereit und übernimmt bei Ausfall." },
      { term: "priority", def: "Höhere Priorität wird Active (Default 100)." },
      { term: "preempt", def: "Erlaubt einem zurückkehrenden Router, die Active-Rolle zurückzuholen." },
      { term: "Object Tracking", def: "Senkt die Priorität bei Uplink-Ausfall (standby track), sodass der Standby übernimmt." },
      { term: "standby version 2", def: "HSRPv2 — unterstützt mehr Gruppen und msec-Timer." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // GRE-Tunnel-VPN — aus Cisco Practice Lab 6
  // ─────────────────────────────────────────────────────────────
  {
    id: "gre-tunnel",
    icon: <Network size={20} />,
    title: "GRE-Tunnel-VPN zwischen Sites",
    subtitle: "Site-to-Site Tunnel über das Internet + OSPF darüber",
    difficulty: "Fortgeschritten",
    duration: "30 min",
    context: {
      problem:
        "Zwei Standorte sind nur über das öffentliche Internet verbunden. Private Netze und ein dynamisches Routing-Protokoll (OSPF, Multicast!) lassen sich nicht direkt über das Internet transportieren.",
      purpose:
        "Ein GRE-Tunnel bildet eine virtuelle Punkt-zu-Punkt-Leitung über das Internet. Darin laufen private IPs UND OSPF — als ob die Sites direkt verkabelt wären. (GRE allein ist unverschlüsselt; in der Praxis kombiniert mit IPsec.)",
    },
    topology: {
      description:
        "R1-1 (Site 1) und R2-1 (Site 2) haben je eine öffentliche IP am Internet-Interface. Über diese öffentlichen Adressen wird ein GRE-Tunnel (Tunnel12) mit eigenem privatem /30 aufgebaut; OSPF läuft über das Tunnel-Subnetz.",
      devices: [
        { type: "router", label: "R1-1 (Site 1)", count: 1 },
        { type: "router", label: "R2-1 (Site 2)", count: 1 },
        { type: "router", label: "Internet", count: 1 },
      ],
      connections: [
        "R1-1 Se0/0/0 öffentlich 1.1.1.2  ↔ Internet",
        "R2-1 Se0/0/0 öffentlich 2.2.2.2  ↔ Internet",
        "Tunnel12 (GRE): 216.145.12.1/30 (R1-1) ↔ 216.145.12.2/30 (R2-1)",
      ],
      hint: "tunnel source = eigenes öffentliches Interface, tunnel destination = öffentliche IP der Gegenseite. Die Tunnel-IP ist privat und liegt im OSPF. Voraussetzung: die öffentlichen Adressen sind erreichbar (Default-Route ins Internet).",
    },
    steps: [
      {
        title: "1) GRE-Tunnel-Interface auf R1-1",
        blocks: [
          {
            device: "R1-1",
            mode: "interface",
            modeLabel: "R1-1(config)#",
            commands: [
              {
                cmd: "interface tunnel 12\ntunnel source se0/0/0\ntunnel destination 2.2.2.2\nip address 216.145.12.1 255.255.255.252\nno shutdown",
                explanation:
                  "tunnel source = eigenes Internet-Interface, tunnel destination = öffentliche IP von R2-1. Die Tunnel-IP (216.145.12.1/30) ist die LOGISCHE Punkt-zu-Punkt-Adresse. Default-Encap ist GRE/IP.",
              },
            ],
          },
        ],
      },
      {
        title: "2) Spiegelbildlicher Tunnel auf R2-1",
        blocks: [
          {
            device: "R2-1",
            mode: "interface",
            modeLabel: "R2-1(config)#",
            commands: [
              {
                cmd: "interface tunnel 12\ntunnel source se0/0/0\ntunnel destination 1.1.1.2\nip address 216.145.12.2 255.255.255.252\nno shutdown",
                explanation:
                  "Source/Destination sind exakt vertauscht zu R1-1, die Tunnel-IP ist die zweite Adresse im selben /30. Sobald beide Seiten stehen, geht 'line protocol' auf up.",
              },
            ],
          },
        ],
      },
      {
        title: "3) OSPF über den Tunnel laufen lassen",
        blocks: [
          {
            device: "R1-1",
            mode: "router",
            modeLabel: "R1-1(config-router)#",
            commands: [
              {
                cmd: "router ospf 1\nnetwork 216.145.12.0 0.0.0.3 area 0",
                explanation:
                  "Das Tunnel-Subnetz wird in OSPF aufgenommen (Wildcard 0.0.0.3 = /30). Dadurch bilden R1-1 und R2-1 ÜBER den Tunnel eine OSPF-Nachbarschaft und tauschen ihre LAN-Routen aus. R2-1 analog.",
              },
            ],
          },
        ],
      },
      {
        title: "4) Tunnel + OSPF verifizieren",
        blocks: [
          {
            device: "R1-1",
            mode: "privileged",
            modeLabel: "R1-1#",
            commands: [
              {
                cmd: "show interface tunnel 12",
                explanation:
                  "Erwartet: 'Tunnel12 is up, line protocol is up', 'Tunnel protocol/transport GRE/IP', source/destination korrekt. Bei 'line protocol down' ist die Gegenseite (destination) nicht erreichbar.",
              },
              {
                cmd: "show ip ospf neighbor",
                explanation:
                  "Der OSPF-Nachbar (R2-1) muss im State FULL erscheinen — über das Tunnel-Interface. Danach zeigt 'show ip route ospf' die Remote-LANs als O-Routen.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show interface tunnel 12", expected: "Tunnel12 up/up, Tunnel protocol/transport GRE/IP" },
      { cmd: "show ip ospf neighbor", expected: "Nachbar über Tunnel12 im State FULL" },
      { cmd: "show ip route ospf", expected: "Remote-LANs als O-Routen via 216.145.12.x (Tunnel)" },
      { cmd: "ping <Remote-LAN-IP>", expected: "Erfolgreich — privater Verkehr fließt durch den GRE-Tunnel" },
    ],
    glossary: [
      { term: "GRE", def: "Generic Routing Encapsulation — kapselt beliebige L3-Pakete in IP; bildet eine virtuelle P2P-Leitung. Unverschlüsselt." },
      { term: "tunnel source/destination", def: "Die ÖFFENTLICHEN Endpunkt-IPs des Tunnels (eigenes Interface bzw. Gegenseite)." },
      { term: "Tunnel-IP", def: "Logische private Adresse des Tunnel-Interfaces (hier /30) — Basis für das Routing darüber." },
      { term: "OSPF over GRE", def: "Weil GRE Multicast transportiert, kann OSPF (224.0.0.5/6) über den Tunnel Nachbarschaften bilden — über reines Internet nicht möglich." },
      { term: "GRE vs. IPsec", def: "GRE kapselt (auch Multicast), verschlüsselt aber nicht. Produktiv: GRE over IPsec für Vertraulichkeit." },
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
    context: {
      problem:
        "Telnet überträgt Login und gesamte Sitzung im Klartext — jeder im Pfad kann Passwörter mitlesen. Fernzugriff auf Netzgeräte muss verschlüsselt sein.",
      purpose:
        "SSHv2 für sicheren Remote-Zugriff einrichten: RSA-Schlüssel, lokale Benutzer, VTY-Lines nur per SSH. Standard-Härtung, die auf jedes produktive Gerät gehört.",
    },
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
    glossary: [
      { term: "SSH", def: "Secure Shell — verschlüsselter Fernzugriff (TCP 22), Ersatz für Telnet." },
      { term: "Telnet", def: "Unverschlüsselter Fernzugriff (TCP 23) — überträgt alles im Klartext, unsicher." },
      { term: "ip domain-name", def: "Setzt die Domäne; nötig, weil der RSA-Schlüssel an einen FQDN gebunden wird." },
      { term: "crypto key generate rsa", def: "Erzeugt das RSA-Schlüsselpaar (Modulus >= 768 für SSHv2)." },
      { term: "ip ssh version 2", def: "Erzwingt das sichere SSHv2 (statt des schwächeren v1)." },
      { term: "line vty 0 4", def: "Die virtuellen Terminal-Lines für den Fernzugriff." },
      { term: "login local", def: "Authentifizierung gegen die lokale Benutzerdatenbank." },
      { term: "transport input ssh", def: "Erlaubt auf den VTY-Lines nur SSH (kein Telnet)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 25. Banner & Local Hardening
  // ─────────────────────────────────────────────────────────────
  {
    id: "device-hardening",
    icon: <Shield size={20} />,
    title: "Device Hardening",
    subtitle: "Banner, Password-Policy, Login-Block, Service-Cleanup",
    difficulty: "Mittel",
    duration: "12 min",
    context: {
      problem:
        "Ein Gerät mit Standardeinstellungen ist leicht angreifbar: schwache Passwort-Hashes, Brute-Force auf den Login und fehlende rechtliche Warnbanner.",
      purpose:
        "Das Gerät absichern: starke Hash-Algorithmen (scrypt), Mindest-Passwortlänge, Brute-Force-Schutz am Login und Warnbanner — die Basis-Härtung jedes produktiven Geräts.",
    },
    topology: {
      description:
        "Standalone Switch SW1 oder Router R1 — Erstkonfiguration in einem 'sicher per Default'-Setup.",
      devices: [{ type: "switch", label: "SW1 / R1", count: 1 }],
      connections: ["Standalone — gleichzeitig auf jedem Cisco-Gerät anwendbar"],
      hint: "Das hier ist die 'Day-1 Checkliste' für jedes neue Cisco-Gerät vor Produktivnahme.",
    },
    steps: [
      {
        title: "Login-Banner (rechtlich relevant!)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "banner motd ^\n*** AUTHORIZED ACCESS ONLY ***\nAll activities are monitored and logged.\nUnauthorized access will be prosecuted.\n^", explanation: "MOTD-Banner — wichtig für Gerichtsfähigkeit gegen Eindringlinge. '^' ist Delimiter (beliebiges, nicht im Text vorkommendes Zeichen)." },
              { cmd: "banner login ^\nPlease enter your credentials.\n^", explanation: "Erscheint nach MOTD vor dem Username-Prompt." },
              { cmd: "banner exec ^\nWelcome — type ? for help.\n^", explanation: "Nach erfolgreichem Login." },
            ],
          },
        ],
      },
      {
        title: "Password-Hardening",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "service password-encryption", explanation: "Verschlüsselt alle Klartext-Passwörter in der config mit Type-7 (schwach, aber besser als nichts)." },
              { cmd: "security passwords min-length 12", explanation: "Mindestens 12 Zeichen für neue Passwörter." },
              { cmd: "enable algorithm-type scrypt secret EnablePass!2024", explanation: "Type-9 (scrypt) — sehr stark, nicht reversibel." },
              { cmd: "username admin algorithm-type scrypt secret AdminPass!2024", explanation: "User mit scrypt-Hash." },
            ],
          },
        ],
      },
      {
        title: "Login-Block & Brute-Force-Protection",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "login block-for 120 attempts 5 within 60", explanation: "Bei 5 fehlgeschlagenen Logins in 60s → 120s Komplett-Block aller VTYs." },
              { cmd: "login delay 3", explanation: "3 Sekunden Verzögerung zwischen Login-Versuchen." },
              { cmd: "login on-failure log every 1", explanation: "Jeden Fehlversuch loggen." },
              { cmd: "login on-success log", explanation: "Erfolgreiche Logins auch loggen." },
            ],
          },
        ],
      },
      {
        title: "Unsichere Services deaktivieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "no ip http server", explanation: "HTTP-Webserver aus (unverschlüsselt)." },
              { cmd: "ip http secure-server", explanation: "Falls Web-UI nötig: nur HTTPS." },
              { cmd: "no service pad", explanation: "Veraltetes X.25 PAD — deaktivieren." },
              { cmd: "no ip source-route", explanation: "Source-Routing deaktivieren — gegen IP-Spoofing." },
              { cmd: "no cdp run", explanation: "(Optional) CDP global aus oder nur an Trunks erlauben." },
              { cmd: "no ip domain-lookup", explanation: "Verhindert lästige DNS-Lookups bei Tippfehlern in der CLI." },
            ],
          },
        ],
      },
      {
        title: "VTY-Lines härten",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "line vty 0 15", explanation: "Alle 16 VTY-Lines." },
              { cmd: "transport input ssh", explanation: "Nur SSH, kein Telnet." },
              { cmd: "exec-timeout 10 0", explanation: "Auto-Logout nach 10 Min Inaktivität." },
              { cmd: "logging synchronous", explanation: "Verhindert, dass Log-Messages deine Eingabe überschreiben." },
              { cmd: "access-class MGMT-ACL in", explanation: "Nur erlaubte Source-IPs dürfen sich verbinden (ACL muss vorher definiert sein)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show running-config | section line vty", expected: "transport input ssh, exec-timeout 10" },
      { cmd: "show login", expected: "Login Block-for 120 seconds, 5 attempts within 60s" },
      { cmd: "show users", expected: "Aktive Sessions" },
    ],
    glossary: [
      { term: "Device Hardening", def: "Maßnahmen, die die Angriffsfläche eines Geräts verkleinern." },
      { term: "banner motd / login / exec", def: "Textbanner zu verschiedenen Zeitpunkten — u. a. rechtlicher Warnhinweis." },
      { term: "algorithm-type scrypt", def: "Moderner, sehr starker Passwort-Hash (Type 9) für enable/username secret." },
      { term: "security passwords min-length", def: "Erzwingt eine Mindestlänge für neue Passwörter." },
      { term: "login block-for", def: "Sperrt Logins nach zu vielen Fehlversuchen für eine Zeitspanne (Brute-Force-Schutz)." },
      { term: "login delay", def: "Verzögerung zwischen Login-Versuchen — bremst automatisierte Angriffe." },
      { term: "service password-encryption", def: "Verschleiert Klartext-Passwörter in der Konfiguration (schwach, aber Pflicht)." },
      { term: "Brute-Force", def: "Angriff, der systematisch Passwörter durchprobiert." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 17. Port Security
  // ─────────────────────────────────────────────────────────────
  {
    id: "port-security",
    icon: <Shield size={20} />,
    title: "Port Security",
    subtitle: "MAC-Limit, Sticky-MAC, Violation-Modus, err-disable Recovery",
    difficulty: "Mittel",
    duration: "12 min",
    context: {
      problem:
        "An einem offenen Switch-Port kann jeder ein eigenes Gerät anstecken — oder per MAC-Flooding die MAC-Tabelle überlaufen lassen, sodass der Switch wie ein Hub alles flutet.",
      purpose:
        "Port-Security begrenzt die erlaubten MAC-Adressen pro Port, lernt sie sticky in die Konfiguration und reagiert bei Verstoß automatisch (protect/restrict/shutdown).",
    },
    topology: {
      description:
        "Access-Switch SW1 mit einem PC pro Port. Wir schützen Ports vor unauthorisierten MAC-Adressen und limitieren die Anzahl gelernter MACs.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "pc", label: "PC1, PC2", count: 2 },
      ],
      connections: ["PC1 → SW1 Fa0/1", "PC2 → SW1 Fa0/2"],
      hint: "Sticky-MAC merkt sich die erste MAC dauerhaft in der running-config — nach 'wr mem' überlebt sie den Reboot.",
    },
    steps: [
      {
        title: "Port Security auf Access-Port",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Fa0/1", explanation: "Endgerät-Port." },
              { cmd: "switchport mode access", explanation: "Port Security funktioniert NUR auf Access- oder statischen Trunk-Ports." },
              { cmd: "switchport port-security", explanation: "Feature aktivieren. Default-Limit = 1 MAC." },
              { cmd: "switchport port-security maximum 2", explanation: "Erlaubt bis zu 2 MACs (z.B. PC + VoIP-Phone)." },
              { cmd: "switchport port-security mac-address sticky", explanation: "Sticky: dynamisch gelernte MACs werden in die running-config geschrieben." },
              { cmd: "switchport port-security violation restrict", explanation: "Violation-Modi: protect (silent drop) | restrict (drop + log + counter) | shutdown (default, err-disable)." },
              { cmd: "switchport port-security aging time 60", explanation: "Aging: gelernte MAC wird nach 60 Min vergessen, falls Port inaktiv." },
              { cmd: "switchport port-security aging type inactivity", explanation: "Aging zählt nur bei Inaktivität, nicht absolute Zeit." },
            ],
          },
        ],
      },
      {
        title: "Err-disable Recovery",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "errdisable recovery cause psecure-violation", explanation: "Automatisches Wiederhochfahren des Ports nach Verletzung." },
              { cmd: "errdisable recovery interval 300", explanation: "Recovery alle 5 Minuten." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show port-security interface Fa0/1", expected: "Port Security: Enabled, Max: 2, Sticky MACs: 1" },
      { cmd: "show port-security address", expected: "VLAN, MAC, Type=SecureSticky, Port" },
      { cmd: "show errdisable recovery", expected: "psecure-violation: Enabled, Interval 300s" },
    ],
    glossary: [
      { term: "Port-Security", def: "Switch-Funktion, die je Port nur bestimmte/begrenzte MAC-Adressen zulässt." },
      { term: "maximum <n>", def: "Maximale Anzahl erlaubter MAC-Adressen am Port." },
      { term: "sticky MAC", def: "Lernt die erlaubte MAC dynamisch und schreibt sie fest in die running-config." },
      { term: "Violation: protect", def: "Verwirft Verkehr unbekannter MACs ohne Meldung." },
      { term: "Violation: restrict", def: "Verwirft + zählt + meldet (Syslog/SNMP), Port bleibt aktiv." },
      { term: "Violation: shutdown", def: "Default — Port geht bei Verstoß in err-disabled." },
      { term: "err-disabled", def: "Abgeschalteter Zustand nach einer Verletzung; per errdisable recovery automatisch rückholbar." },
      { term: "MAC-Flooding", def: "Angriff, der die MAC-Tabelle mit Fake-Adressen füllt, bis der Switch wie ein Hub flutet." },
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
    context: {
      problem:
        "Ohne Filter erreicht jedes Netz jedes andere. Oft soll ein bestimmtes Quellnetz blockiert, der übrige Verkehr aber durchgelassen werden.",
      purpose:
        "Eine Standard-ACL filtert ausschließlich nach der Quell-IP. Sie wird nah am Ziel angewendet. Wichtig: am Ende steht ein unsichtbares deny any.",
    },
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
    glossary: [
      { term: "ACL", def: "Access Control List — geordnete Regelliste, die Verkehr erlaubt (permit) oder verwirft (deny)." },
      { term: "Standard-ACL", def: "Nummern 1–99 / 1300–1999 — filtert NUR nach Quell-IP." },
      { term: "permit / deny", def: "Erlaubt bzw. verwirft passende Pakete. Reihenfolge zählt (erste Übereinstimmung gewinnt)." },
      { term: "Wildcard-Maske", def: "Invertierte Maske zur Adressauswahl (0 = muss passen, 1 = egal)." },
      { term: "implizites deny any", def: "Unsichtbare letzte Regel — was nicht erlaubt ist, wird verworfen." },
      { term: "ip access-group", def: "Bindet eine ACL an ein Interface in einer Richtung (in/out)." },
      { term: "in / out", def: "Richtung relativ zum Interface. Standard-ACL möglichst nah am Ziel platzieren." },
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
    context: {
      problem:
        "Standard-ACLs können nur nach Quelle filtern. Oft will man aber gezielter steuern — z. B. nur HTTP von einem bestimmten PC zu einem Server sperren, alles andere zulassen.",
      purpose:
        "Eine Extended ACL filtert nach Protokoll, Quelle, Ziel UND Port. Sie wird nah an der Quelle angewendet, um unerwünschten Verkehr früh zu stoppen.",
    },
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
    glossary: [
      { term: "Extended ACL", def: "Nummern 100–199 / named — filtert nach Protokoll, Quelle, Ziel und Port." },
      { term: "Named ACL", def: "ACL mit Namen statt Nummer (ip access-list extended NAME) — Regeln einzeln editierbar." },
      { term: "eq <port>", def: "Match auf eine Portnummer (z. B. eq 80 = HTTP, eq 443 = HTTPS)." },
      { term: "Protokoll-Filter", def: "Match auf tcp/udp/icmp/ip statt nur auf Adressen." },
      { term: "ip access-group in", def: "Bindet die ACL eingehend ans Interface." },
      { term: "nah an der Quelle", def: "Extended ACLs platziert man quellnah, um Verkehr früh zu verwerfen." },
      { term: "established", def: "Optionales TCP-Match auf bereits aufgebaute Verbindungen (ACK/RST gesetzt)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 16. DHCP Snooping + DAI + IP Source Guard
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp-snooping-dai",
    icon: <Shield size={20} />,
    title: "DHCP Snooping + DAI + IP Source Guard",
    subtitle: "Anti-Spoofing-Trio auf dem Access-Switch",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Im LAN ermöglichen Rogue-DHCP-Server, ARP-Poisoning und IP-Spoofing Man-in-the-Middle-Angriffe: der Angreifer leitet fremden Verkehr über sich um.",
      purpose:
        "Die zusammenhängende L2-Security-Kette aufbauen: DHCP-Snooping (nur Server-Port trusted) erzeugt eine Binding-Tabelle, auf der Dynamic ARP Inspection und IP Source Guard aufsetzen.",
    },
    topology: {
      description:
        "Access-Switch SW1 mit 3 Endgeräten. Legitime DHCP-Server hängen am Uplink. Wir blockieren Rogue-DHCP, ARP-Spoofing und IP-Spoofing in einem Rutsch.",
      devices: [
        { type: "switch", label: "SW1 (Access)", count: 1 },
        { type: "router", label: "R1 (DHCP-Server)", count: 1 },
        { type: "pc", label: "PC1, PC2, Angreifer", count: 3 },
      ],
      connections: ["R1 (DHCP) → SW1 Gi0/1 (UPLINK = TRUSTED)", "PC1-3 → SW1 Fa0/1-3 (UNTRUSTED)"],
      hint: "Trusted = Switch akzeptiert DHCP-Replies und ARP. Untrusted = alle Spoofing-Versuche werden gedroppt.",
    },
    steps: [
      {
        title: "DHCP Snooping aktivieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "ip dhcp snooping", explanation: "Globaler Switch — Feature an." },
              { cmd: "ip dhcp snooping vlan 10,20", explanation: "Nur in diesen VLANs aktiv." },
              { cmd: "no ip dhcp snooping information option", explanation: "Option-82 deaktivieren falls DHCP-Server kein 'option 82' versteht (häufige Fehlerquelle)." },
            ],
          },
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Gi0/1", explanation: "Uplink zum echten DHCP-Server." },
              { cmd: "ip dhcp snooping trust", explanation: "TRUSTED — DHCP-Replies erlaubt. Default ist UNTRUSTED auf allen Ports." },
            ],
          },
        ],
      },
      {
        title: "Dynamic ARP Inspection (DAI)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "ip arp inspection vlan 10,20", explanation: "DAI in diesen VLANs aktiv. Prüft jeden ARP-Reply gegen die DHCP-Snooping-Binding-Table." },
            ],
          },
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Gi0/1", explanation: "Uplink." },
              { cmd: "ip arp inspection trust", explanation: "Trusted für ARP (sonst würden auch legitime Gateway-ARPs gedroppt)." },
            ],
          },
        ],
      },
      {
        title: "IP Source Guard auf Access-Ports",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface range Fa0/1 - 3", explanation: "Endgeräte-Ports." },
              { cmd: "ip verify source", explanation: "IP Source Guard: Endgerät darf nur Frames mit der per DHCP zugewiesenen IP/MAC senden." },
              { cmd: "ip arp inspection limit rate 15", explanation: "Maximal 15 ARPs/s pro Port — gegen ARP-Flood." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip dhcp snooping", expected: "Switch DHCP snooping: enabled, Trusted Gi0/1" },
      { cmd: "show ip dhcp snooping binding", expected: "MAC ↔ IP ↔ Lease ↔ VLAN ↔ Port" },
      { cmd: "show ip arp inspection", expected: "Source Mac Validation: enabled" },
    ],
    glossary: [
      { term: "DHCP-Snooping", def: "Lässt DHCP-Server-Antworten nur an trusted Ports zu — blockiert Rogue-DHCP-Server." },
      { term: "trusted / untrusted", def: "Trusted = Uplink zum echten Server (alles erlaubt); untrusted = Access-Ports (Server-Antworten verworfen)." },
      { term: "Binding-Tabelle", def: "MAC ↔ IP ↔ VLAN ↔ Port, vom Snooping aufgebaut — Datenbasis für DAI und IP Source Guard." },
      { term: "Dynamic ARP Inspection (DAI)", def: "Prüft ARP-Pakete gegen die Binding-Tabelle — stoppt ARP-Poisoning." },
      { term: "IP Source Guard", def: "Filtert IP-Pakete an untrusted Ports gegen die Bindings — stoppt IP-Spoofing (ip verify source)." },
      { term: "ip arp inspection trust", def: "Markiert Uplinks/Trunks als vertrauenswürdig, sodass sie die ARP-Prüfung überspringen." },
      { term: "Rogue-DHCP", def: "Unbefugter DHCP-Server, der Clients ein falsches Gateway (MITM) zuweist." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 15. STP Root-Bridge Hardening
  // ─────────────────────────────────────────────────────────────
  {
    id: "stp-hardening",
    icon: <Lightning size={20} />,
    title: "STP Root-Bridge Hardening",
    subtitle: "Root/BPDU/Loop Guard kombiniert einsetzen",
    difficulty: "Fortgeschritten",
    duration: "15 min",
    context: {
      problem:
        "Standard-STP konvergiert langsam und ist manipulierbar: ein fremder Switch mit niedriger Priorität kann Root werden und den Verkehr umleiten, fehlerhafte Links können Loops erzeugen.",
      purpose:
        "STP produktionsreif härten: Rapid-PVST für schnelle Konvergenz, Root bewusst festlegen, PortFast+BPDU-Guard global, Root-Guard/Loop-Guard und automatische errdisable-Recovery.",
    },
    topology: {
      description:
        "3 Switches im Triangle. Wir definieren bewusst die Root Bridge, schützen sie gegen unerlaubte Übernahme und sichern alle Trunk-Links gegen Loops.",
      devices: [{ type: "switch", label: "Core, Dist1, Dist2", count: 3 }],
      connections: ["Core ↔ Dist1 (Gi0/1)", "Core ↔ Dist2 (Gi0/2)", "Dist1 ↔ Dist2 (Gi0/3) — wird per STP blockiert"],
      hint: "Core MUSS Root sein. Falls ein Mitarbeiter versehentlich einen Heim-Switch ansteckt, darf er NIE Root werden.",
    },
    steps: [
      {
        title: "Core hart als Root setzen",
        blocks: [
          {
            device: "Core",
            mode: "global",
            modeLabel: "Core(config)#",
            commands: [
              { cmd: "spanning-tree mode rapid-pvst", explanation: "RSTP (802.1w) statt klassisches STP → Konvergenz <1s." },
              { cmd: "spanning-tree vlan 1-100 priority 4096", explanation: "Niedrigste Priority = garantiert Root für alle VLANs 1-100." },
              { cmd: "spanning-tree vlan 1-100 root primary", explanation: "Alternative Schreibweise — setzt Priority auf 24576 (oder niedriger als der bisherige Root)." },
            ],
          },
        ],
      },
      {
        title: "Backup-Root auf Dist1",
        blocks: [
          {
            device: "Dist1",
            mode: "global",
            modeLabel: "Dist1(config)#",
            commands: [
              { cmd: "spanning-tree mode rapid-pvst", explanation: "Gleicher Mode wie Core." },
              { cmd: "spanning-tree vlan 1-100 root secondary", explanation: "Priority 28672 — übernimmt sofort, falls Core ausfällt." },
            ],
          },
        ],
      },
      {
        title: "Access-Ports: BPDU Guard global",
        blocks: [
          {
            device: "Core",
            mode: "global",
            modeLabel: "Core(config)#",
            commands: [
              { cmd: "spanning-tree portfast default", explanation: "PortFast automatisch für alle Access-Ports → sofortiges Forwarding." },
              { cmd: "spanning-tree portfast bpduguard default", explanation: "BPDU Guard global — alle PortFast-Ports gehen bei BPDU-Empfang err-disabled." },
              { cmd: "errdisable recovery cause bpduguard", explanation: "Auto-Recovery nach Default 5 Min." },
              { cmd: "errdisable recovery interval 300", explanation: "Recovery-Interval explizit auf 5 Min." },
            ],
          },
        ],
      },
      {
        title: "Trunk-Ports: Loop Guard + Root Guard",
        blocks: [
          {
            device: "Core",
            mode: "interface",
            modeLabel: "Core(config)#",
            commands: [
              { cmd: "interface range Gi0/1 - 2", explanation: "Trunks zu Dist1 und Dist2." },
              { cmd: "spanning-tree guard root", explanation: "Root Guard: Verhindert, dass über diesen Port ein 'überlegener' BPDU akzeptiert wird → wenn jemand am Trunk eine 'bessere' Switch ansteckt: root-inconsistent." },
              { cmd: "spanning-tree guard loop", explanation: "Loop Guard: Wenn BPDUs auf einem RP/AP plötzlich ausbleiben (unidirektionaler Link) → loop-inconsistent statt versehentlich Forwarding." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show spanning-tree root", expected: "Root ID Priority 4096, This bridge IS the root" },
      { cmd: "show spanning-tree summary", expected: "PortFast Default ON, BPDU Guard Default ON" },
      { cmd: "show spanning-tree interface Gi0/1 detail", expected: "Root guard: enabled" },
    ],
    glossary: [
      { term: "Rapid-PVST+", def: "Ciscos schnelle STP-Variante (802.1w) pro VLAN — Konvergenz in Sekunden statt ~50 s." },
      { term: "root primary / secondary", def: "Setzt die Bridge-Priority so, dass ein Switch sicher Root (bzw. Backup-Root) wird." },
      { term: "Root Guard", def: "Verhindert, dass über einen Port ein fremder Switch Root-Bridge wird (Port geht in root-inconsistent)." },
      { term: "Loop Guard", def: "Schützt vor Loops, wenn ein Blocking-Port durch ausbleibende BPDUs fälschlich forwardet." },
      { term: "PortFast default", def: "Aktiviert PortFast global auf allen Access-Ports." },
      { term: "BPDU-Guard default", def: "Aktiviert BPDU-Guard global auf allen PortFast-Ports." },
      { term: "err-disabled", def: "Sicherheits-Aus-Zustand eines Ports nach einer Verletzung (z. B. BPDU auf PortFast-Port)." },
      { term: "errdisable recovery", def: "Holt err-disabled Ports nach einem Intervall automatisch zurück (cause + interval)." },
    ],
  },

  // ═════════════════════════════════════════════════════════════
  // ERWEITERTE LABS (14–31)
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // 14. VLAN-Hopping & Mitigation
  // ─────────────────────────────────────────────────────────────
  {
    id: "vlan-hopping",
    icon: <Shield size={20} />,
    title: "VLAN-Hopping & Mitigation",
    subtitle: "Switch-Spoofing + Double-Tagging verhindern",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Ein Angreifer kann per Double-Tagging (zwei 802.1Q-Tags) oder einem erschlichenen Trunk (DTP) Frames in ein fremdes VLAN einschleusen, das er eigentlich nicht erreichen darf.",
      purpose:
        "Die Standard-Gegenmaßnahmen gegen VLAN-Hopping umsetzen: ein ungenutztes Native-VLAN als Blackhole, DTP per nonegotiate abschalten und Access-Ports härten.",
    },
    topology: {
      description:
        "Angriffsszenario: Ein PC versucht durch Switch-Spoofing (DTP) oder Double-Tagging in fremde VLANs zu gelangen. Wir härten die Switch-Ports.",
      devices: [
        { type: "switch", label: "SW1, SW2", count: 2 },
        { type: "pc", label: "Angreifer + 2 normale PCs", count: 3 },
      ],
      connections: [
        "SW1 ↔ SW2 trunk (Gi0/1)",
        "Angreifer-PC → SW1 Fa0/1 (versucht DTP-Trunk)",
        "Normale PCs → VLAN 10/20",
      ],
      hint: "Default-DTP-Modus 'dynamic auto' erlaubt einem Angreifer, einen Trunk auszuhandeln → Zugang zu ALLEN VLANs!",
    },
    steps: [
      {
        title: "Access-Port hart konfigurieren (gegen Switch-Spoofing)",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Fa0/1", explanation: "Port des Endgeräts/möglichen Angreifers." },
              { cmd: "switchport mode access", explanation: "Explizit Access — kein DTP-Aushandeln mehr möglich." },
              { cmd: "switchport access vlan 10", explanation: "Statisch VLAN 10 zugewiesen." },
              { cmd: "switchport nonegotiate", explanation: "Deaktiviert DTP komplett. Port verschickt keine DTP-Frames mehr." },
              { cmd: "spanning-tree portfast", explanation: "Sofort Forwarding für Endgeräte." },
              { cmd: "spanning-tree bpduguard enable", explanation: "Bei BPDU-Empfang → err-disabled. Schutz wenn jemand einen Switch ansteckt." },
            ],
          },
        ],
      },
      {
        title: "Trunk-Port härten (gegen Double-Tagging)",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Gi0/1", explanation: "Trunk zwischen den Switches." },
              { cmd: "switchport mode trunk", explanation: "Hart Trunk — kein Auto/Desirable." },
              { cmd: "switchport nonegotiate", explanation: "Kein DTP." },
              { cmd: "switchport trunk native vlan 999", explanation: "Native VLAN ändern (nicht VLAN 1)! Double-Tag-Angriff nutzt das Default-Native-VLAN." },
              { cmd: "switchport trunk allowed vlan 10,20", explanation: "Nur erlaubte VLANs auf dem Trunk — kein VLAN 1 für User-Daten." },
            ],
          },
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "vlan 999", explanation: "Black-Hole-VLAN für Native VLAN anlegen." },
              { cmd: "name BLACKHOLE-NATIVE", explanation: "Klar dokumentieren." },
              { cmd: "exit", explanation: "" },
              { cmd: "interface Gi0/1", explanation: "Zurück zum Trunk." },
              { cmd: "switchport trunk native vlan tag", explanation: "(Optional) zwingt den Switch, auch Native VLAN zu taggen → killt Double-Tag-Angriff sicher." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show interfaces switchport", expected: "Operational Mode: static access, Negotiation: Off" },
      { cmd: "show interfaces trunk", expected: "Native vlan: 999, Allowed: 10,20" },
    ],
    glossary: [
      { term: "VLAN-Hopping", def: "Angriff, der Frames in ein anderes VLAN bringt — per Double-Tagging oder Switch-Spoofing (DTP)." },
      { term: "Double-Tagging", def: "Angreifer setzt zwei 802.1Q-Tags; der erste wird am Trunk entfernt, der zweite leitet ins Ziel-VLAN." },
      { term: "Native VLAN", def: "Das eine VLAN, dessen Frames am Trunk UNgetaggt laufen — Einfallstor für Double-Tagging." },
      { term: "Blackhole-VLAN", def: "Ein leeres, nirgends genutztes VLAN, das man als Native VLAN setzt, damit getaggter Angriffsverkehr ins Leere läuft." },
      { term: "switchport nonegotiate", def: "Schaltet DTP ab, damit kein Port automatisch zum Trunk verhandelt wird (Switch-Spoofing-Schutz)." },
      { term: "DTP", def: "Dynamic Trunking Protocol — automatische Trunk-Verhandlung, die ein Angreifer ausnutzen kann." },
      { term: "BPDU-Guard", def: "Sichert Access-Ports zusätzlich gegen eingeschleuste Switches ab." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 23. AAA mit RADIUS/TACACS+
  // ─────────────────────────────────────────────────────────────
  {
    id: "aaa-radius-tacacs",
    icon: <Key size={20} />,
    title: "AAA mit RADIUS/TACACS+",
    subtitle: "Zentrales Login + Command Authorization",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Lokale Passwörter auf jedem einzelnen Gerät skalieren nicht und sind kaum zu auditieren. Geräte-Zugriff sollte zentral verwaltet und protokolliert werden.",
      purpose:
        "AAA mit TACACS+ einrichten: zentrale Authentifizierung und Autorisierung über einen Server, mit lokalem Fallback, falls der Server nicht erreichbar ist. Enterprise-Standard für Admin-Login.",
    },
    topology: {
      description:
        "Switch SW1. Login wird zentral gegen einen TACACS+-Server geprüft. Lokaler Fallback-User, falls Server down.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "server", label: "TACACS+ (Cisco ISE / FreeRADIUS)", count: 1 },
      ],
      connections: ["SW1 Mgmt → TACACS+ Server (10.0.0.50)"],
      hint: "IMMER lokalen Fallback-User behalten — sonst sperrst du dich aus, wenn der Server down ist!",
    },
    steps: [
      {
        title: "Lokaler Fallback-User",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "username localadmin privilege 15 secret StrongP@ss1", explanation: "Lokaler User mit höchster Privilege-Stufe — Fallback wenn TACACS+ unerreichbar." },
              { cmd: "enable secret EnableP@ss2", explanation: "Enable-Passwort gehasht (Type 5/9)." },
            ],
          },
        ],
      },
      {
        title: "TACACS+ Server definieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "tacacs server TACSRV", explanation: "Server-Objekt anlegen." },
              { cmd: "address ipv4 10.0.0.50", explanation: "Server-IP." },
              { cmd: "key 7 CCNAtacKey", explanation: "Shared Secret (gleiches auf Server-Seite)." },
              { cmd: "exit", explanation: "" },
              { cmd: "aaa group server tacacs+ TAC-GRP", explanation: "Gruppe für Load-Balancing/Failover." },
              { cmd: "server name TACSRV", explanation: "" },
            ],
          },
        ],
      },
      {
        title: "AAA Methodenlisten",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "aaa new-model", explanation: "AAA-Framework einschalten — überschreibt alte 'login local'-Logik." },
              { cmd: "aaa authentication login default group TAC-GRP local", explanation: "Login: erst TACACS+, bei Server-Down → lokal." },
              { cmd: "aaa authentication enable default group TAC-GRP enable", explanation: "Enable-Pass: TACACS+, dann lokal." },
              { cmd: "aaa authorization exec default group TAC-GRP local if-authenticated", explanation: "Authorization (welche Privilege-Stufe)." },
              { cmd: "aaa authorization commands 15 default group TAC-GRP local", explanation: "Pro Befehl in Level 15 prüfen — granulare Kontrolle." },
              { cmd: "aaa accounting exec default start-stop group TAC-GRP", explanation: "Accounting — wer hat sich wann eingeloggt." },
              { cmd: "aaa accounting commands 15 default start-stop group TAC-GRP", explanation: "Audit-Log aller privilegierten Befehle." },
            ],
          },
        ],
      },
      {
        title: "VTY-Lines mit AAA",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "line vty 0 15", explanation: "Alle 16 VTY-Lines." },
              { cmd: "transport input ssh", explanation: "Nur SSH erlaubt — kein Telnet." },
              { cmd: "login authentication default", explanation: "Verwendet die oben definierte Methodenliste." },
              { cmd: "authorization exec default", explanation: "" },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show tacacs", expected: "Server-Status alive, 0 errors" },
      { cmd: "test aaa group tacacs+ user01 Cisco123 legacy", expected: "User successfully authenticated" },
      { cmd: "show running-config | section aaa", expected: "AAA-Block komplett sichtbar" },
    ],
    glossary: [
      { term: "AAA", def: "Authentication, Authorization, Accounting — wer darf rein, was darf er, was hat er getan." },
      { term: "aaa new-model", def: "Schaltet das AAA-Framework ein (Voraussetzung für RADIUS/TACACS+)." },
      { term: "TACACS+", def: "Cisco-Protokoll (TCP 49) — trennt AAA, verschlüsselt die gesamte Sitzung; ideal für Geräte-Admin." },
      { term: "RADIUS", def: "Offenes AAA-Protokoll (UDP) — verschlüsselt nur das Passwort; typisch für Endnutzer-Zugang." },
      { term: "group server", def: "Bündelt mehrere AAA-Server zu einer benannten Gruppe." },
      { term: "lokaler Fallback", def: "Schlüsselwort local in der Methodenliste — Login über lokale DB, wenn der Server ausfällt." },
      { term: "key", def: "Gemeinsames Secret zwischen Gerät und AAA-Server." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 27. Zone-Based Firewall (ZBFW)
  // ─────────────────────────────────────────────────────────────
  {
    id: "zbfw",
    icon: <Shield size={20} />,
    title: "Zone-Based Firewall (ZBFW)",
    subtitle: "Zonen, Class-Map, Policy-Map, Zone-Pair",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Ohne Firewall-Policy erreicht jeder Bereich jeden anderen. Internes Netz, DMZ und Internet brauchen klar getrennte, kontrollierte Verkehrsregeln.",
      purpose:
        "Zone-Based Firewall einrichten: Interfaces Sicherheitszonen zuordnen und per Policy steuern, welcher Verkehr zwischen welchen Zonen erlaubt ist (z. B. INSIDE→OUTSIDE erlaubt, OUTSIDE→INSIDE blockiert).",
    },
    topology: {
      description:
        "Edge-Router R1 mit 3 Zonen: INSIDE (LAN), OUTSIDE (Internet), DMZ (Webserver). Wir erlauben LAN→Internet (NAT), LAN→DMZ und Internet→DMZ:80.",
      devices: [
        { type: "router", label: "R1 (Edge)", count: 1 },
        { type: "server", label: "Webserver in DMZ", count: 1 },
      ],
      connections: ["Gi0/0 = INSIDE (192.168.1.0/24)", "Gi0/1 = OUTSIDE (Internet)", "Gi0/2 = DMZ (192.168.99.0/24)"],
      hint: "ZBFW: ohne explizites Zone-Pair → ALLES verboten. 'Default deny' — viel sicherer als ACLs.",
    },
    steps: [
      {
        title: "Zonen anlegen + Interfaces zuweisen",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "zone security INSIDE", explanation: "Zone für vertrauenswürdiges LAN." },
              { cmd: "zone security OUTSIDE", explanation: "Internet." },
              { cmd: "zone security DMZ", explanation: "Halbvertrauenswürdig." },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "LAN-Interface." },
              { cmd: "zone-member security INSIDE", explanation: "Interface der Zone INSIDE zuweisen." },
              { cmd: "exit", explanation: "" },
              { cmd: "interface Gi0/1", explanation: "Internet-Interface." },
              { cmd: "zone-member security OUTSIDE", explanation: "" },
              { cmd: "exit", explanation: "" },
              { cmd: "interface Gi0/2", explanation: "DMZ-Interface." },
              { cmd: "zone-member security DMZ", explanation: "" },
            ],
          },
        ],
      },
      {
        title: "Class-Map: Traffic klassifizieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "class-map type inspect match-any LAN-TO-NET", explanation: "Class für LAN→Internet (HTTP, HTTPS, DNS, ICMP)." },
              { cmd: "match protocol http", explanation: "" },
              { cmd: "match protocol https", explanation: "" },
              { cmd: "match protocol dns", explanation: "" },
              { cmd: "match protocol icmp", explanation: "" },
              { cmd: "exit", explanation: "" },
              { cmd: "class-map type inspect match-any NET-TO-DMZ-WEB", explanation: "Class für Internet→DMZ:80/443." },
              { cmd: "match protocol http", explanation: "" },
              { cmd: "match protocol https", explanation: "" },
            ],
          },
        ],
      },
      {
        title: "Policy-Map: Aktionen definieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "policy-map type inspect LAN-NET-POLICY", explanation: "Policy für LAN→Internet." },
              { cmd: "class type inspect LAN-TO-NET", explanation: "Verwendet die Class von oben." },
              { cmd: "inspect", explanation: "Stateful Inspection — Return-Traffic wird automatisch erlaubt. Alternativen: pass (keine State-Table), drop, log." },
              { cmd: "exit", explanation: "" },
              { cmd: "class class-default", explanation: "Alle nicht-erwähnten Pakete." },
              { cmd: "drop", explanation: "Silently droppen (Default-Verhalten)." },
              { cmd: "exit", explanation: "Zurück in den Global-Config-Modus." },
              { cmd: "policy-map type inspect NET-DMZ-POLICY", explanation: "Zweite Policy: Internet → DMZ (nur Webzugriff)." },
              { cmd: "class type inspect NET-TO-DMZ-WEB", explanation: "Verwendet die Class für Internet→DMZ:80/443 (oben definiert)." },
              { cmd: "inspect", explanation: "Stateful Inspection für eingehenden Webverkehr zum DMZ-Server." },
              { cmd: "exit", explanation: "" },
              { cmd: "class class-default", explanation: "Aller übrige Internet→DMZ-Verkehr." },
              { cmd: "drop", explanation: "Silently droppen — nur :80/:443 dürfen in die DMZ." },
            ],
          },
        ],
      },
      {
        title: "Zone-Pair: Policy zwischen 2 Zonen anwenden",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "zone-pair security INSIDE-TO-OUTSIDE source INSIDE destination OUTSIDE", explanation: "Definiert: Traffic von INSIDE nach OUTSIDE." },
              { cmd: "service-policy type inspect LAN-NET-POLICY", explanation: "Wendet die Policy an." },
              { cmd: "exit", explanation: "" },
              { cmd: "zone-pair security OUTSIDE-TO-DMZ source OUTSIDE destination DMZ", explanation: "Internet → DMZ." },
              { cmd: "service-policy type inspect NET-DMZ-POLICY", explanation: "Wendet die NET-DMZ-POLICY an (im vorigen Schritt definiert)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show zone security", expected: "Zone INSIDE, OUTSIDE, DMZ mit Member-Interfaces" },
      { cmd: "show zone-pair security", expected: "INSIDE-TO-OUTSIDE / OUTSIDE-TO-DMZ" },
      { cmd: "show policy-map type inspect zone-pair sessions", expected: "Aktive Inspection-Sessions" },
    ],
    glossary: [
      { term: "ZBFW", def: "Zone-Based Policy Firewall — Cisco-Firewall auf Basis von Sicherheitszonen." },
      { term: "Security Zone", def: "Logische Gruppe von Interfaces mit gleichem Vertrauensniveau (INSIDE/OUTSIDE/DMZ)." },
      { term: "zone-member", def: "Ordnet ein Interface einer Zone zu." },
      { term: "Zone-Pair", def: "Richtungspaar (Quelle→Ziel-Zone), auf das eine Policy angewendet wird." },
      { term: "Class-Map / Policy-Map", def: "Class-Map klassifiziert Verkehr, Policy-Map legt die Aktion fest (inspect/pass/drop)." },
      { term: "inspect", def: "Stateful-Inspection — erlaubt Rückverkehr einer initiierten Verbindung automatisch." },
      { term: "Self Zone", def: "Spezialzone für Verkehr zum/vom Router selbst (Management)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 28. ACL + Static NAT — Dual-Site mit ISP
  // Zwei Standorte (CO-1 EIGRP, CO-2 OSPF), gemeinsamer ISP-MUMBAI,
  // statisches NAT auf beiden Routern + Extended ACL pro Interface.
  // ─────────────────────────────────────────────────────────────
  {
    id: "co-acl-nat-isp",
    icon: <Shield size={20} />,
    title: "ACL + Static NAT — Dual-Site mit ISP",
    subtitle: "CO-1 · CO-2 · EIGRP · OSPF · ISP-MUMBAI · 8 Hosts · 2×ACL + 2×NAT",
    difficulty: "Fortgeschritten",
    duration: "50 min",
    context: {
      problem:
        "Zwei Unternehmensstandorte (CO-1 und CO-2) sollen über einen gemeinsamen ISP ins Internet. Die internen Adressen müssen per Static NAT veröffentlicht werden, und Extended ACLs auf beiden Routern legen exakt fest, welcher Datenverkehr in welche Richtung erlaubt ist.",
      purpose:
        "Das Lab zeigt das Zusammenspiel von Static NAT und Extended ACL in einer realen Dual-Site-Topologie. Zentrales Lernziel: wann sieht die ACL die private IP und wann die öffentliche — und warum muss man EIGRP/OSPF in der Rückwärts-ACL explizit erlauben.",
    },
    topology: {
      description:
        "CO-1 (EIGRP AS 199, LAN 192.168.10.0/24) und CO-2 (OSPF 100 Area 1, LAN 172.16.10.0/24) verbinden sich jeweils über eine Access-VLAN-Verbindung am ISP-SW mit dem ISP-MUMBAI-Router. ISP-MUMBAI läuft Sub-Interfaces (ETH0/0.99 für CO-1, ETH0/0.199 für CO-2) und verbindet das Internet-Segment (200.10.20.0/24) via ETH0/1. Alle End-Hosts nutzen Default-Routing.",
      devices: [
        { type: "router", label: "CO-1  (ETH0/0=192.168.10.254, ETH0/1=20.30.10.10)", count: 1 },
        { type: "router", label: "CO-2  (ETH0/0=172.16.10.254, ETH0/1=45.35.55.65)", count: 1 },
        { type: "router", label: "ISP-MUMBAI  (ETH0/0 trunk, ETH0/1=200.10.20.1)", count: 1 },
        { type: "switch", label: "ISP-SW  (VLAN 99 → CO-1, VLAN 199 → CO-2, trunk → ISP)", count: 1 },
        { type: "pc",     label: "VPC-9 .1 / VPC-10 .2 / VPC-11 .3 / R-PC .100 (CO-1 LAN)", count: 4 },
        { type: "pc",     label: "VPC-12 .1 / VPC-13 .2 / VPC-14 .3 / INT_SRV .100 (CO-2 LAN)", count: 4 },
        { type: "pc",     label: "DNS .10 / WEB-1 .20 / WEB-2 .30 / SERVER-1 .40 / USER_PC .50 (Internet)", count: 5 },
      ],
      connections: [
        "CO-1 ETH0/1 ──── ISP-SW (Fa0/1, VLAN 99) ──── trunk ──── ISP-MUMBAI ETH0/0.99",
        "CO-2 ETH0/1 ──── ISP-SW (Fa0/2, VLAN 199) ─── trunk ──── ISP-MUMBAI ETH0/0.199",
        "ISP-MUMBAI ETH0/1 ──────────────────────────────────────── Internet-Segment 200.10.20.0/24",
        "CO-1 ETH0/0 ──── SW1 ──── VPC-9/10/11/R-PC (192.168.10.x/24)",
        "CO-2 ETH0/0 ──── SW2 ──── VPC-12/13/14/INT_SRV (172.16.10.x/24)",
      ],
      hint: "Static NAT auf CO-1/CO-2 konfigurieren BEVOR die ACLs greifen — sonst sieht die ACL-Outbound-Prüfung noch die privaten IPs.",
      topologyDiagram: (
        <svg viewBox="0 0 730 360" className="w-full bg-slate-950" style={{ fontFamily: "ui-monospace, monospace" }}>
          {/* ── CO-1 LAN ── */}
          <rect x="2" y="10" width="100" height="115" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x="52" y="24" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">CO-1 LAN</text>
          <text x="7" y="38" fill="#475569" fontSize="8">192.168.10.0/24</text>
          <line x1="7" y1="41" x2="99" y2="41" stroke="#1e3a5f" strokeWidth="0.5"/>
          <text x="7" y="54" fill="#cbd5e1" fontSize="8">VPC-9  · .1</text>
          <text x="7" y="66" fill="#cbd5e1" fontSize="8">VPC-10 · .2</text>
          <text x="7" y="78" fill="#cbd5e1" fontSize="8">VPC-11 · .3</text>
          <text x="7" y="90" fill="#fbbf24" fontSize="8">R-PC   · .100</text>
          <text x="7" y="104" fill="#475569" fontSize="7">GW: .254</text>

          {/* ── CO-1 Router ── */}
          <rect x="112" y="10" width="130" height="115" rx="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1.5"/>
          <text x="177" y="24" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">CO-1</text>
          <text x="116" y="38" fill="#94a3b8" fontSize="7.5">ETH0/0: .254 inside</text>
          <text x="116" y="49" fill="#94a3b8" fontSize="7.5">ETH0/1: 20.30.10.10 out</text>
          <line x1="116" y1="53" x2="238" y2="53" stroke="#1e3a5f" strokeWidth="0.5"/>
          <text x="116" y="64" fill="#fbbf24" fontSize="7">NAT .1→20.30.10.1</text>
          <text x="116" y="74" fill="#fbbf24" fontSize="7">    .2→.2  .3→.3</text>
          <text x="116" y="84" fill="#fbbf24" fontSize="7">    .100→20.30.10.100</text>
          <rect x="116" y="90" width="120" height="14" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1"/>
          <text x="176" y="100" textAnchor="middle" fill="#a5b4fc" fontSize="7">ACL: in-out | out-in</text>
          <line x1="102" y1="67" x2="112" y2="67" stroke="#3b82f6" strokeWidth="1.5"/>

          {/* ── CO-2 LAN ── */}
          <rect x="2" y="235" width="100" height="115" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5"/>
          <text x="52" y="249" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">CO-2 LAN</text>
          <text x="7" y="263" fill="#475569" fontSize="8">172.16.10.0/24</text>
          <line x1="7" y1="266" x2="99" y2="266" stroke="#14532d" strokeWidth="0.5"/>
          <text x="7" y="279" fill="#cbd5e1" fontSize="8">VPC-12 · .1</text>
          <text x="7" y="291" fill="#cbd5e1" fontSize="8">VPC-13 · .2</text>
          <text x="7" y="303" fill="#cbd5e1" fontSize="8">VPC-14 · .3</text>
          <text x="7" y="315" fill="#fbbf24" fontSize="8">INT_SRV· .100</text>
          <text x="7" y="329" fill="#475569" fontSize="7">GW: .254</text>

          {/* ── CO-2 Router ── */}
          <rect x="112" y="235" width="130" height="115" rx="4" fill="#14532d" stroke="#4ade80" strokeWidth="1.5"/>
          <text x="177" y="249" textAnchor="middle" fill="#86efac" fontSize="10" fontWeight="bold">CO-2</text>
          <text x="116" y="263" fill="#94a3b8" fontSize="7.5">ETH0/0: .254 inside</text>
          <text x="116" y="274" fill="#94a3b8" fontSize="7.5">ETH0/1: 45.35.55.65 out</text>
          <line x1="116" y1="278" x2="238" y2="278" stroke="#14532d" strokeWidth="0.5"/>
          <text x="116" y="289" fill="#fbbf24" fontSize="7">NAT .1→45.35.55.10</text>
          <text x="116" y="299" fill="#fbbf24" fontSize="7">    .2→.20  .3→.30</text>
          <text x="116" y="309" fill="#fbbf24" fontSize="7">    .100→45.35.55.100</text>
          <rect x="116" y="315" width="120" height="14" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1"/>
          <text x="176" y="325" textAnchor="middle" fill="#a5b4fc" fontSize="7">ACL: wan-lan | lan-wan</text>
          <line x1="102" y1="292" x2="112" y2="292" stroke="#22c55e" strokeWidth="1.5"/>

          {/* ── Diagonals to ISP-SW ── */}
          <line x1="242" y1="67" x2="295" y2="183" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="249" y="107" fill="#fbbf24" fontSize="7.5">EIGRP 199</text>
          <text x="249" y="117" fill="#475569" fontSize="7">VLAN 99</text>
          <line x1="242" y1="292" x2="295" y2="207" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="246" y="265" fill="#a78bfa" fontSize="7.5">OSPF 100</text>
          <text x="246" y="275" fill="#475569" fontSize="7">VLAN 199</text>

          {/* ── ISP-SW ── */}
          <rect x="295" y="165" width="72" height="60" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5"/>
          <text x="331" y="182" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontWeight="bold">ISP-SW</text>
          <text x="331" y="196" textAnchor="middle" fill="#94a3b8" fontSize="7.5">VLAN 99/199</text>
          <text x="331" y="208" textAnchor="middle" fill="#94a3b8" fontSize="7">trunk</text>
          <line x1="367" y1="192" x2="393" y2="165" stroke="#818cf8" strokeWidth="1.5"/>
          <text x="366" y="173" fill="#818cf8" fontSize="7">trunk</text>

          {/* ── ISP-MUMBAI ── */}
          <rect x="393" y="100" width="140" height="125" rx="4" fill="#2d1f3d" stroke="#c084fc" strokeWidth="1.5"/>
          <text x="463" y="116" textAnchor="middle" fill="#e9d5ff" fontSize="9.5" fontWeight="bold">ISP-MUMBAI</text>
          <line x1="397" y1="120" x2="529" y2="120" stroke="#3b1f5e" strokeWidth="0.5"/>
          <text x="397" y="132" fill="#94a3b8" fontSize="7.5">ETH0/0.99:  20.30.10.20/24</text>
          <text x="397" y="143" fill="#94a3b8" fontSize="7.5">ETH0/0.199: 45.35.55.75/24</text>
          <text x="397" y="154" fill="#94a3b8" fontSize="7.5">ETH0/1:     200.10.20.1/24</text>
          <line x1="397" y1="158" x2="529" y2="158" stroke="#3b1f5e" strokeWidth="0.5"/>
          <text x="397" y="168" fill="#c084fc" fontSize="7">EIGRP 199 ↔ CO-1</text>
          <text x="397" y="178" fill="#c084fc" fontSize="7">OSPF 100  ↔ CO-2</text>
          <text x="397" y="188" fill="#c084fc" fontSize="7">redistribute EIGRP+OSPF</text>
          <text x="397" y="198" fill="#c084fc" fontSize="7">ip route 0.0.0.0/0 null0</text>
          <line x1="533" y1="157" x2="557" y2="157" stroke="#f87171" strokeWidth="1.5"/>

          {/* ── Internet Zone ── */}
          <rect x="557" y="20" width="168" height="320" rx="4" fill="#1a0a0a" stroke="#f87171" strokeWidth="1.5"/>
          <text x="641" y="37" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">Internet</text>
          <text x="641" y="50" textAnchor="middle" fill="#475569" fontSize="7.5">200.10.20.0/24</text>
          <line x1="561" y1="54" x2="721" y2="54" stroke="#7f1d1d" strokeWidth="0.5"/>
          <text x="561" y="67" fill="#94a3b8" fontSize="8">DNS_SERVER · .10</text>
          <text x="561" y="79" fill="#f87171" fontSize="8">WEB-1      · .20</text>
          <text x="561" y="91" fill="#f87171" fontSize="8">WEB-2      · .30</text>
          <text x="561" y="103" fill="#fbbf24" fontSize="8">SERVER-1   · .40</text>
          <text x="561" y="115" fill="#86efac" fontSize="8">USER_PC    · .50</text>
          <line x1="561" y1="121" x2="721" y2="121" stroke="#7f1d1d" strokeWidth="0.5"/>
          <text x="641" y="136" textAnchor="middle" fill="#60a5fa" fontSize="7.5" fontWeight="bold">CO-1 erlaubt →</text>
          <text x="563" y="148" fill="#6ee7b7" fontSize="7">ICMP: LAN→WEB-1/WEB-2</text>
          <text x="563" y="158" fill="#6ee7b7" fontSize="7">SSH/Telnet: R-PC→WEB-1/WEB-2</text>
          <text x="563" y="168" fill="#6ee7b7" fontSize="7">HTTP/HTTPS: R-PC→SERVER-1</text>
          <line x1="561" y1="174" x2="721" y2="174" stroke="#7f1d1d" strokeWidth="0.5"/>
          <text x="641" y="189" textAnchor="middle" fill="#4ade80" fontSize="7.5" fontWeight="bold">CO-2 erlaubt →</text>
          <text x="563" y="201" fill="#6ee7b7" fontSize="7">ICMP: USER_PC→CO-2 LAN</text>
          <text x="563" y="211" fill="#6ee7b7" fontSize="7">SSH/Telnet/HTTP/HTTPS:</text>
          <text x="563" y="221" fill="#6ee7b7" fontSize="7">  USER_PC→INT_SRV</text>
        </svg>
      ),
    },
    steps: [
      // ─── Schritt 1: IP-Adressen ───────────────────────────────
      {
        title: "IP-Adressen vergeben — alle Router und Hosts",
        blocks: [
          {
            device: "CO-1",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface — hier hängen VPC-9/10/11 und R-PC." },
              { cmd: "ip address 192.168.10.254 255.255.255.0", explanation: "Gateway-IP für das CO-1-LAN. Alle Hosts zeigen hierhin als Default-Gateway." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface in Richtung ISP-SW (VLAN 99 → ISP-MUMBAI ETH0/0.99)." },
              { cmd: "ip address 20.30.10.10 255.255.255.0", explanation: "Öffentliche IP von CO-1 auf der WAN-Seite. ISP-MUMBAI's Sub-Interface .99 liegt auf 20.30.10.20 — gleiche /24." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
            ],
          },
          {
            device: "CO-2",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface — hier hängen VPC-12/13/14 und INT_SRV." },
              { cmd: "ip address 172.16.10.254 255.255.255.0", explanation: "Gateway-IP für das CO-2-LAN." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface in Richtung ISP-SW (VLAN 199 → ISP-MUMBAI ETH0/0.199)." },
              { cmd: "ip address 45.35.55.65 255.255.255.0", explanation: "Öffentliche IP von CO-2. ISP-MUMBAI's Sub-Interface .199 liegt auf 45.35.55.75 — gleiche /24." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
            ],
          },
          {
            device: "ISP-SW",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "vlan 99", explanation: "VLAN 99 anlegen — gehört zu CO-1." },
              { cmd: "vlan 199", explanation: "VLAN 199 anlegen — gehört zu CO-2." },
              { cmd: "interface ethernet 0/0", explanation: "Port in Richtung CO-1." },
              { cmd: "switchport mode access", explanation: "Access-Port — kein Trunk-Tag nötig." },
              { cmd: "switchport access vlan 99", explanation: "CO-1-Verkehr wird in VLAN 99 eingeordnet." },
              { cmd: "interface ethernet 0/1", explanation: "Port in Richtung CO-2." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 199", explanation: "CO-2-Verkehr wird in VLAN 199 eingeordnet." },
              { cmd: "interface ethernet 0/2", explanation: "Trunk-Port in Richtung ISP-MUMBAI — muss beide VLANs tragen." },
              { cmd: "switchport mode trunk", explanation: "802.1Q-Trunk aktivieren." },
            ],
          },
          {
            device: "ISP-MUMBAI",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "Physical interface — kein IP, nur 'no shutdown'. Sub-Interfaces übernehmen die Adressierung." },
              { cmd: "no ip address", explanation: "Kein IP auf dem Physical Interface." },
              { cmd: "no shutdown", explanation: "Physical Interface muss aktiv sein, damit Sub-Interfaces funktionieren." },
              { cmd: "interface ethernet 0/0.99", explanation: "Sub-Interface für CO-1 (VLAN 99)." },
              { cmd: "encapsulation dot1q 99", explanation: "802.1Q-Tag für VLAN 99 — ISP-MUMBAI akzeptiert Frames mit diesem Tag." },
              { cmd: "ip address 20.30.10.20 255.255.255.0", explanation: "IP auf der CO-1-Seite. CO-1 hat .10 — beide im selben /24, direkt erreichbar." },
              { cmd: "interface ethernet 0/0.199", explanation: "Sub-Interface für CO-2 (VLAN 199)." },
              { cmd: "encapsulation dot1q 199", explanation: "802.1Q-Tag für VLAN 199." },
              { cmd: "ip address 45.35.55.75 255.255.255.0", explanation: "IP auf der CO-2-Seite. CO-2 hat .65 — gleiche /24." },
              { cmd: "interface ethernet 0/1", explanation: "Internet-facing Interface." },
              { cmd: "ip address 200.10.20.1 255.255.255.0", explanation: "Gateway für das Internet-Segment (WEB-1, WEB-2, SERVER-1, USER_PC)." },
              { cmd: "no shutdown", explanation: "Internet-Interface aktivieren." },
            ],
          },
        ],
      },

      // ─── Schritt 2: Routing ───────────────────────────────────
      {
        title: "Routing konfigurieren — EIGRP, OSPF und Redistribution",
        blocks: [
          {
            device: "CO-1",
            mode: "config-router",
            modeLabel: "Router-Modus",
            commands: [
              { cmd: "router eigrp 199", explanation: "EIGRP Autonomous System 199 — muss auf CO-1 und ISP-MUMBAI identisch sein." },
              { cmd: "network 192.168.10.0 0.0.0.255", explanation: "CO-1-LAN in EIGRP einbinden — wird zu ISP-MUMBAI propagiert." },
              { cmd: "network 20.30.10.0 0.0.0.255", explanation: "WAN-Link in EIGRP einbinden — Nachbarschaft mit ISP-MUMBAI ETH0/0.99." },
              { cmd: "no auto-summary", explanation: "Classless-Routing aktivieren — wichtig für korrekte Subnetz-Propagierung." },
            ],
          },
          {
            device: "CO-2",
            mode: "config-router",
            modeLabel: "Router-Modus",
            commands: [
              { cmd: "router ospf 100", explanation: "OSPF Process ID 100." },
              { cmd: "network 172.16.10.0 0.0.0.255 area 1", explanation: "CO-2-LAN in OSPF Area 1 einbinden." },
              { cmd: "network 45.35.55.0 0.0.0.255 area 1", explanation: "WAN-Link in OSPF Area 1 — Nachbarschaft mit ISP-MUMBAI ETH0/0.199." },
            ],
          },
          {
            device: "ISP-MUMBAI",
            mode: "config-router",
            modeLabel: "Router-Modus",
            commands: [
              { cmd: "router eigrp 199", explanation: "EIGRP AS 199 auf ISP-MUMBAI — Nachbarschaft mit CO-1." },
              { cmd: "network 20.30.10.0 0.0.0.255", explanation: "Sub-Interface .99 einbinden." },
              { cmd: "redistribute ospf 100 metric 10000 1 255 1 1500", explanation: "OSPF-Routen (CO-2-Netz) in EIGRP einstreuen: Bandwidth=10000, Delay=1, Reliability=255, Load=1, MTU=1500." },
              { cmd: "no auto-summary", explanation: "Classless." },
              { cmd: "router ospf 100", explanation: "OSPF Process 100 auf ISP-MUMBAI — Nachbarschaft mit CO-2." },
              { cmd: "network 45.35.55.0 0.0.0.255 area 1", explanation: "Sub-Interface .199 einbinden." },
              { cmd: "network 200.10.20.0 0.0.0.255 area 1", explanation: "Internet-Segment in OSPF propagieren, damit CO-2 die Routen lernt." },
              { cmd: "redistribute eigrp 199 subnets", explanation: "EIGRP-Routen (CO-1-Netz) in OSPF einstreuen — CO-2 lernt CO-1-Netz." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 null0", explanation: "Default-Route auf ISP-MUMBAI erzwingen — wird über Redistribution zu CO-1 und CO-2 gesendet." },
            ],
          },
        ],
      },

      // ─── Schritt 3: CO-1 Static NAT ──────────────────────────
      {
        title: "CO-1: Static NAT — 4 feste 1:1-Zuordnungen",
        blocks: [
          {
            device: "CO-1",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip nat inside source static 192.168.10.1 20.30.10.1", explanation: "VPC-9 (.1) bekommt die feste öffentliche IP 20.30.10.1. Diese Zuordnung gilt dauerhaft — auch ohne aktive Verbindung." },
              { cmd: "ip nat inside source static 192.168.10.2 20.30.10.2", explanation: "VPC-10 (.2) → 20.30.10.2." },
              { cmd: "ip nat inside source static 192.168.10.3 20.30.10.3", explanation: "VPC-11 (.3) → 20.30.10.3." },
              { cmd: "ip nat inside source static 192.168.10.100 20.30.10.100", explanation: "R-PC (.100) → 20.30.10.100. R-PC ist die Management-Station — bekommt die .100 als public IP." },
            ],
          },
          {
            device: "CO-1",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip nat inside", explanation: "Markiert ETH0/0 als 'inside' — Quell-IPs ausgehender Pakete werden übersetzt." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip nat outside", explanation: "Markiert ETH0/1 als 'outside' — Ziel-IPs eingehender Pakete werden zurückübersetzt." },
            ],
          },
        ],
      },

      // ─── Schritt 4: CO-1 ACL in-out ──────────────────────────
      {
        title: "CO-1: ACL \"in-out\" — was darf das LAN nach außen senden?",
        blocks: [
          {
            device: "CO-1",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended in-out", explanation: "Named Extended ACL 'in-out' — wird auf ETH0/0 inbound angewendet (Pakete vom LAN Richtung Internet). Die ACL sieht hier noch die PRIVATEN Source-IPs (192.168.10.x), weil NAT erst nach der Inbound-ACL-Prüfung auf ETH0/0 erfolgt." },
              { cmd: " permit icmp 192.168.10.0 0.0.0.255 host 200.10.20.20 echo", explanation: "Gesamtes CO-1-LAN darf WEB-1 (200.10.20.20) anpingen. 'echo' = nur ICMP-Requests erlaubt (nicht echo-reply — die werden in out-in behandelt)." },
              { cmd: " permit icmp 192.168.10.0 0.0.0.255 host 200.10.20.30 echo", explanation: "Gesamtes CO-1-LAN darf WEB-2 (200.10.20.30) anpingen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.20 eq 23", explanation: "R-PC darf WEB-1 per Telnet (Port 23) erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.20 eq 22", explanation: "R-PC darf WEB-1 per SSH (Port 22) erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.30 eq 23", explanation: "R-PC darf WEB-2 per Telnet erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.30 eq 22", explanation: "R-PC darf WEB-2 per SSH erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.40 eq 80", explanation: "R-PC darf SERVER-1 per HTTP erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.40 eq 443", explanation: "R-PC darf SERVER-1 per HTTPS erreichen. Alles andere wird implizit verworfen (deny any any)." },
            ],
          },
        ],
      },

      // ─── Schritt 5: CO-1 ACL out-in ──────────────────────────
      {
        title: "CO-1: ACL \"out-in\" — was darf von außen ins LAN kommen?",
        blocks: [
          {
            device: "CO-1",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended out-in", explanation: "ACL 'out-in' wird auf ETH0/1 inbound angewendet (Pakete vom Internet Richtung LAN). WICHTIG: Diese ACL sieht die ÖFFENTLICHEN Ziel-IPs (20.30.10.x), weil NAT erst NACH der Inbound-ACL-Prüfung auf ETH0/1 das Ziel auf 192.168.10.x zurückübersetzt." },
              { cmd: " permit icmp host 200.10.20.20 host 20.30.10.1 echo-reply", explanation: "WEB-1 darf VPC-9's Public-IP (.1) mit ICMP echo-reply antworten — Antwort auf den ping von VPC-9." },
              { cmd: " permit icmp host 200.10.20.20 host 20.30.10.2 echo-reply", explanation: "WEB-1 antwortet VPC-10." },
              { cmd: " permit icmp host 200.10.20.20 host 20.30.10.3 echo-reply", explanation: "WEB-1 antwortet VPC-11." },
              { cmd: " permit icmp host 200.10.20.30 host 20.30.10.1 echo-reply", explanation: "WEB-2 antwortet VPC-9." },
              { cmd: " permit icmp host 200.10.20.30 host 20.30.10.2 echo-reply", explanation: "WEB-2 antwortet VPC-10." },
              { cmd: " permit icmp host 200.10.20.30 host 20.30.10.3 echo-reply", explanation: "WEB-2 antwortet VPC-11." },
              { cmd: " permit tcp host 200.10.20.20 host 20.30.10.100 ack", explanation: "WEB-1 darf TCP-Antworten (ACK-Flag gesetzt) an R-PC's Public-IP (.100) senden. 'ack' erlaubt nur bestehende Verbindungen — neue Verbindungsversuche (SYN ohne ACK) werden verworfen." },
              { cmd: " permit tcp host 200.10.20.30 host 20.30.10.100 ack", explanation: "WEB-2 darf TCP-Antworten an R-PC senden." },
              { cmd: " permit tcp host 200.10.20.40 host 20.30.10.100 ack", explanation: "SERVER-1 darf TCP-Antworten an R-PC senden." },
              { cmd: " permit eigrp any any", explanation: "EIGRP-Protokoll (IP Protokoll 88) erlauben — sonst reißt die EIGRP-Nachbarschaft mit ISP-MUMBAI ab, da EIGRP Hello-Pakete auf ETH0/1 ankommen und von der ACL geblockt würden." },
            ],
          },
        ],
      },

      // ─── Schritt 6: CO-1 ACLs anwenden ───────────────────────
      {
        title: "CO-1: ACLs auf Interfaces anwenden",
        blocks: [
          {
            device: "CO-1",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip access-group in-out in", explanation: "ACL 'in-out' greift auf eingehende Pakete von ETH0/0 (= vom LAN zum Router). Richtung 'in' = Pakete die in das Interface hineinkommen." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip access-group out-in in", explanation: "ACL 'out-in' greift auf eingehende Pakete von ETH0/1 (= vom Internet zum Router). Beide ACLs sind jeweils 'in' — d.h. der Router prüft alle ankommenden Pakete bevor er sie weiterleitet." },
            ],
          },
        ],
      },

      // ─── Schritt 7: CO-2 Static NAT ──────────────────────────
      {
        title: "CO-2: Static NAT — 4 feste 1:1-Zuordnungen",
        blocks: [
          {
            device: "CO-2",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip nat inside source static 172.16.10.1 45.35.55.10", explanation: "VPC-12 (.1) → öffentliche IP 45.35.55.10. Beachte: CO-2 nutzt einen anderen öffentlichen IP-Bereich als CO-1 (45.35.55.x statt 20.30.10.x)." },
              { cmd: "ip nat inside source static 172.16.10.2 45.35.55.20", explanation: "VPC-13 (.2) → 45.35.55.20." },
              { cmd: "ip nat inside source static 172.16.10.3 45.35.55.30", explanation: "VPC-14 (.3) → 45.35.55.30." },
              { cmd: "ip nat inside source static 172.16.10.100 45.35.55.100", explanation: "INT_SRV (.100) → 45.35.55.100. Der interne Server ist unter dieser Public-IP erreichbar." },
            ],
          },
          {
            device: "CO-2",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip nat inside", explanation: "ETH0/0 = inside. Source-IPs werden übersetzt." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip nat outside", explanation: "ETH0/1 = outside. Destination-IPs werden zurückübersetzt." },
            ],
          },
        ],
      },

      // ─── Schritt 8: CO-2 ACL wan-lan ─────────────────────────
      {
        title: "CO-2: ACL \"wan-lan\" — was darf aus dem Internet ins LAN?",
        blocks: [
          {
            device: "CO-2",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended wan-lan", explanation: "ACL 'wan-lan' wird auf ETH0/1 inbound angewendet (Pakete vom Internet). Wie bei CO-1: Die ACL sieht die ÖFFENTLICHEN Ziel-IPs (45.35.55.x) — NAT übersetzt erst danach." },
              { cmd: " permit icmp host 200.10.20.50 45.35.55.0 0.0.0.255 echo", explanation: "USER_PC (200.10.20.50) darf das gesamte CO-2-Public-Subnetz (45.35.55.0/24) anpingen. Wildcard 0.0.0.255 = alle 4 CO-2-Public-IPs erlaubt." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 22", explanation: "USER_PC darf INT_SRV per SSH erreichen (Public-IP 45.35.55.100)." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 23", explanation: "USER_PC darf INT_SRV per Telnet erreichen." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 80", explanation: "USER_PC darf INT_SRV per HTTP erreichen." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 443", explanation: "USER_PC darf INT_SRV per HTTPS erreichen." },
              { cmd: " permit ospf any any", explanation: "OSPF-Protokoll (IP Protokoll 89) erlauben — sonst verliert CO-2 die OSPF-Nachbarschaft mit ISP-MUMBAI." },
            ],
          },
        ],
      },

      // ─── Schritt 9: CO-2 ACL lan-wan ─────────────────────────
      {
        title: "CO-2: ACL \"lan-wan\" — was darf das LAN nach außen antworten?",
        blocks: [
          {
            device: "CO-2",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended lan-wan", explanation: "ACL 'lan-wan' wird auf ETH0/0 inbound angewendet (Pakete vom LAN). Hier sieht die ACL die PRIVATEN Source-IPs (172.16.10.x), weil auf ETH0/0 Inbound NAT noch nicht erfolgt ist." },
              { cmd: " permit icmp 172.16.10.0 0.0.0.255 host 200.10.20.50 echo-reply", explanation: "CO-2-LAN darf USER_PC mit ICMP echo-reply antworten. Die Hosts antworten mit ihrer privaten IP — NAT übersetzt erst auf dem Weg nach außen (ETH0/1 outbound)." },
              { cmd: " permit tcp host 172.16.10.100 host 200.10.20.50 ack", explanation: "INT_SRV darf TCP-Antworten (ACK) an USER_PC senden. 'ack' = nur Antworten auf bereits bestehende Verbindungen — kein TCP-SYN von innen nach außen zu USER_PC." },
            ],
          },
        ],
      },

      // ─── Schritt 10: CO-2 ACLs anwenden ──────────────────────
      {
        title: "CO-2: ACLs auf Interfaces anwenden",
        blocks: [
          {
            device: "CO-2",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip access-group lan-wan in", explanation: "ACL 'lan-wan' prüft Pakete vom LAN (private IPs sichtbar)." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip access-group wan-lan in", explanation: "ACL 'wan-lan' prüft Pakete vom Internet (öffentliche Ziel-IPs sichtbar, da NAT noch nicht zurückübersetzt hat)." },
            ],
          },
        ],
      },

      // ─── Schritt 11: Abschlusserklärung ──────────────────────
      {
        title: "Abschlusserklärung: Wie ACL und NAT zusammenspielen",
        blocks: [
          {
            device: "CO-1 / CO-2",
            mode: "exec",
            modeLabel: "Verification",
            commands: [
              { cmd: "show ip nat translations", explanation: "Zeigt alle aktiven NAT-Einträge. Bei Static NAT erscheinen alle 4 Zeilen dauerhaft — auch ohne Verbindung. Bei PAT/Dynamic NAT nur wenn Verbindungen aktiv sind." },
              { cmd: "show ip access-lists", explanation: "Zeigt alle ACL-Regeln inklusive Match-Counter. Jede Zeile zeigt, wie oft sie bereits getroffen hat. Erhöhende Counter = ACL greift korrekt." },
              { cmd: "show ip nat statistics", explanation: "Überblick: Wie viele Pakete wurden übersetzt? Wie viele Inside/Outside-Interfaces? Hilft beim Debuggen ob NAT überhaupt aktiv ist." },
              { cmd: "debug ip nat", explanation: "Echtzeit-Übersetzungsprotokoll — zeigt jedes NAT-Ereignis. Nur für Debugging — mit 'undebug all' deaktivieren!" },
            ],
          },
          {
            device: "── Kernkonzept: Reihenfolge NAT ↔ ACL ──",
            mode: "exec",
            modeLabel: "Theorie",
            commands: [
              {
                cmd: "Ausgehend (LAN → Internet) auf CO-1:",
                explanation:
                  "① Paket kommt auf ETH0/0 an (Inbound). " +
                  "② ACL 'in-out' wird geprüft — sieht PRIVATE Source-IP 192.168.10.x. " +
                  "③ Router leitet weiter → NAT übersetzt Source-IP: 192.168.10.x → 20.30.10.x. " +
                  "④ Paket verlässt ETH0/1 mit öffentlicher Source-IP. " +
                  "Merkregel: Auf dem Inside-Interface prüft die ACL IMMER die private IP.",
              },
              {
                cmd: "Eingehend (Internet → LAN) auf CO-1:",
                explanation:
                  "① Paket kommt auf ETH0/1 an (Inbound) — Ziel ist 20.30.10.x (die öffentliche IP). " +
                  "② ACL 'out-in' wird geprüft — sieht noch die ÖFFENTLICHE Ziel-IP 20.30.10.x. " +
                  "③ Router leitet weiter → NAT übersetzt Ziel-IP zurück: 20.30.10.x → 192.168.10.x. " +
                  "④ Paket verlässt ETH0/0 mit privater Ziel-IP. " +
                  "Merkregel: Auf dem Outside-Interface prüft die ACL die ÖFFENTLICHE IP.",
              },
              {
                cmd: "Warum 'ack' statt 'established'?",
                explanation:
                  "Cisco IOS kennt in Named Extended ACLs das Keyword 'established' (= ACK oder RST gesetzt). " +
                  "'ack' ist eine alternative Schreibweise und prüft explizit das ACK-Flag. " +
                  "Beide erlauben nur TCP-Pakete einer laufenden Verbindung — der erste SYN (ohne ACK) wird geblockt. " +
                  "Das verhindert, dass Hosts aus dem Internet neue Verbindungen initiieren können.",
              },
              {
                cmd: "Warum 'permit eigrp any any' in out-in?",
                explanation:
                  "EIGRP-Hello-Pakete kommen von ISP-MUMBAI auf ETH0/1 an. " +
                  "Ohne explizite Erlaubnis würde die ACL sie verwerfen und die EIGRP-Nachbarschaft abreißen. " +
                  "CO-2 braucht stattdessen 'permit ospf any any' in wan-lan — gleiches Prinzip für OSPF. " +
                  "Protokoll-Nummern: EIGRP = 88, OSPF = 89 (beide IP-Layer, kein TCP/UDP).",
              },
              {
                cmd: "NAT-Reihenfolge — die komplette Tabelle:",
                explanation:
                  "Inside Interface Inbound:   ACL → Routing → NAT-Translate-Source (Outbound-Seite). " +
                  "Outside Interface Inbound:  ACL → NAT-Translate-Dest (Zurückübersetzung) → Routing. " +
                  "Konsequenz: Inside-ACL sieht private IPs, Outside-ACL sieht öffentliche IPs. " +
                  "Dieses Verhalten ist bei Cisco IOS festgelegt und nicht konfigurierbar.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 200.10.20.20 source 192.168.10.1", expected: "!!!!! — VPC-9 kann WEB-1 anpingen (NAT + ACL greifen)", explanation: "Von CO-1 aus mit Source-IP 192.168.10.1 — NAT übersetzt auf 20.30.10.1." },
      { cmd: "ping 200.10.20.20 source 192.168.10.100", expected: "!!!!! — R-PC kann WEB-1 anpingen", explanation: "R-PC hat auch ICMP-Berechtigung über in-out ACL." },
      { cmd: "telnet 200.10.20.20 /source-interface e0/0.100", expected: "Verbindungsaufbau — R-PC kann Telnet zu WEB-1", explanation: "Port 23 ist in in-out für host 192.168.10.100 erlaubt." },
      { cmd: "show ip nat translations", expected: "Static NAT-Einträge für .1/.2/.3/.100 auf beiden Routern", explanation: "Alle 8 Static-NAT-Einträge müssen sichtbar sein (je 4 pro Router)." },
      { cmd: "show ip access-lists in-out", expected: "Match-Counter > 0 nach ping-Tests", explanation: "Jede getroffene Regel erhöht ihren Zähler." },
      { cmd: "ping 45.35.55.10 source 200.10.20.50", expected: "!!!!! — USER_PC kann CO-2-LAN anpingen", explanation: "wan-lan ACL erlaubt ICMP von USER_PC zum gesamten 45.35.55.0/24." },
    ],
    glossary: [
      { term: "Inside Local", def: "Die private IP eines Hosts im LAN (z.B. 192.168.10.1) — wie der Router das Gerät intern kennt." },
      { term: "Inside Global", def: "Die öffentliche IP nach der NAT-Übersetzung (z.B. 20.30.10.1) — wie das Internet das Gerät sieht." },
      { term: "Outside Local", def: "Die IP eines externen Hosts aus Sicht des LANs — bei Static NAT meist identisch mit Outside Global." },
      { term: "Outside Global", def: "Die echte IP des externen Hosts (z.B. 200.10.20.20 für WEB-1)." },
      { term: "ip nat inside", def: "Markiert ein Interface als 'innen' — Source-IPs ausgehender Pakete werden übersetzt." },
      { term: "ip nat outside", def: "Markiert ein Interface als 'außen' — Ziel-IPs eingehender Pakete werden zurückübersetzt." },
      { term: "echo / echo-reply", def: "ICMP-Typen: echo = Ping-Request, echo-reply = Ping-Antwort. In ACLs explizit unterscheidbar." },
      { term: "ack", def: "TCP-Flag: zeigt an, dass das Paket eine bestehende Verbindung bestätigt. Kein ack = neuer Verbindungsversuch (SYN)." },
      { term: "permit eigrp any any", def: "Erlaubt EIGRP-Protokollpakete (IP Proto 88) — nötig damit EIGRP-Nachbarschaften nicht durch die ACL unterbrochen werden." },
      { term: "Sub-Interface", def: "Logisches Interface auf einem physischen Interface mit 802.1Q-Tag — ermöglicht mehrere Netze auf einem Kabel (Router-on-a-Stick-Prinzip)." },
      { term: "Redistribution", def: "Einstreuen von Routen aus einem Routing-Protokoll in ein anderes. ISP-MUMBAI streut EIGRP-Routen in OSPF ein und umgekehrt." },
      { term: "encapsulation dot1q", def: "Aktiviert 802.1Q-Tagging auf einem Sub-Interface — der Router akzeptiert nur Frames mit dem angegebenen VLAN-Tag." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 26. Wireless: WLC + AP-Onboarding
  // ─────────────────────────────────────────────────────────────
  {
    id: "wlc-onboarding",
    icon: <Globe size={20} />,
    title: "Wireless: WLC + AP-Onboarding",
    subtitle: "CAPWAP-Discovery, WLAN mit WPA2-PSK & WPA3-SAE",
    difficulty: "Fortgeschritten",
    duration: "25 min",
    context: {
      problem:
        "Ein Lightweight Access Point kann erst WLANs ausstrahlen, wenn er Strom bekommt und seinen WLAN-Controller im Netz findet.",
      purpose:
        "Die AP-Anbindung vorbereiten: PoE am Switchport, Management-VLAN und ein DHCP-Pool mit Option 43, über die der AP die Controller-IP lernt. Grundlage zentral verwalteter WLANs.",
    },
    topology: {
      description:
        "Cisco 9800-CL WLC, Lightweight AP an einem PoE-Switch im AP-VLAN 50. Clients verbinden sich auf SSID 'CORP-WLAN' (WPA2) und 'CORP-WPA3' (WPA3-SAE).",
      devices: [
        { type: "wlc", label: "WLC (Cisco 9800-CL)", count: 1 },
        { type: "ap", label: "Lightweight AP (CAPWAP)", count: 1 },
        { type: "switch", label: "Access-Switch SW1", count: 1 },
      ],
      connections: ["AP → SW1 Fa0/1 (Access VLAN 50, PoE)", "SW1 → WLC Mgmt Gi0/1 (Trunk)"],
      hint: "AP findet WLC über: 1) DHCP Option 43, 2) DNS 'cisco-capwap-controller.local', 3) Broadcast. Option 43 ist die zuverlässigste Methode.",
    },
    steps: [
      {
        title: "Switch-Port für AP konfigurieren",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Fa0/1", explanation: "AP-Port." },
              { cmd: "switchport mode access", explanation: "AP läuft im Local-Mode als Access-Port." },
              { cmd: "switchport access vlan 50", explanation: "AP-Management-VLAN." },
              { cmd: "spanning-tree portfast", explanation: "Schnelles Forwarding für AP-Boot." },
              { cmd: "power inline auto", explanation: "PoE automatisch — AP zieht ~15W (802.3af) bzw. 30W (802.3at)." },
            ],
          },
        ],
      },
      {
        title: "DHCP-Pool mit Option 43 für AP-Discovery",
        blocks: [
          {
            device: "R-DHCP",
            mode: "global",
            modeLabel: "R-DHCP(config)#",
            commands: [
              { cmd: "ip dhcp pool AP-POOL", explanation: "DHCP-Pool für VLAN 50." },
              { cmd: "network 192.168.50.0 255.255.255.0", explanation: "Subnet." },
              { cmd: "default-router 192.168.50.1", explanation: "" },
              { cmd: "option 43 hex f104.c0a8.0a01", explanation: "Option 43 (Vendor-Specific): Type=f1, Length=04, Value=192.168.10.1 (WLC-IP in hex). AP nutzt das direkt für CAPWAP-Discovery." },
            ],
          },
        ],
      },
      {
        title: "WLC: WLAN mit WPA2-PSK anlegen (Cisco IOS-XE 17.x)",
        blocks: [
          {
            device: "WLC",
            mode: "global",
            modeLabel: "WLC(config)#",
            commands: [
              { cmd: "wlan CORP-WLAN 1 CORP-WLAN", explanation: "Profile-Name | WLAN-ID 1 | SSID 'CORP-WLAN'." },
              { cmd: "security wpa psk set-key ascii 0 CorpW1FiP@ss", explanation: "PSK setzen (ascii Klartext)." },
              { cmd: "no security wpa akm dot1x", explanation: "Kein 802.1X." },
              { cmd: "security wpa akm psk", explanation: "AKM = PSK." },
              { cmd: "security wpa2 ciphers aes", explanation: "AES-CCMP (CCMP-128). TKIP NICHT mehr verwenden!" },
              { cmd: "no shutdown", explanation: "WLAN aktivieren." },
            ],
          },
        ],
      },
      {
        title: "WLAN mit WPA3-SAE (Personal)",
        blocks: [
          {
            device: "WLC",
            mode: "global",
            modeLabel: "WLC(config)#",
            commands: [
              { cmd: "wlan CORP-WPA3 2 CORP-WPA3", explanation: "Zweites WLAN auf WLAN-ID 2." },
              { cmd: "security wpa psk set-key ascii 0 SaeP@ssword123", explanation: "Passphrase." },
              { cmd: "security wpa akm sae", explanation: "AKM = SAE (Simultaneous Authentication of Equals — der WPA3-Handshake)." },
              { cmd: "security wpa transition-disable", explanation: "Verhindert Downgrade auf WPA2 — nur echtes WPA3." },
              { cmd: "security pmf mandatory", explanation: "Protected Management Frames PFLICHT bei WPA3 — Schutz gegen Deauth-Angriffe." },
              { cmd: "no security wpa wpa2", explanation: "WPA2 deaktivieren — pure WPA3." },
              { cmd: "security wpa wpa3", explanation: "WPA3 aktivieren." },
              { cmd: "no shutdown", explanation: "" },
            ],
          },
        ],
      },
      {
        title: "Policy-Profile + Tags (IOS-XE Modell)",
        blocks: [
          {
            device: "WLC",
            mode: "global",
            modeLabel: "WLC(config)#",
            commands: [
              { cmd: "wireless profile policy CORP-POLICY", explanation: "Policy-Profile." },
              { cmd: "vlan 60", explanation: "Client-Traffic landet in VLAN 60." },
              { cmd: "no shutdown", explanation: "" },
              { cmd: "exit", explanation: "" },
              { cmd: "wireless tag policy CORP-POLICY-TAG", explanation: "Policy-Tag." },
              { cmd: "wlan CORP-WLAN policy CORP-POLICY", explanation: "WLAN ↔ Policy-Profile verknüpfen." },
              { cmd: "wlan CORP-WPA3 policy CORP-POLICY", explanation: "Beide WLANs auf gleiche Policy." },
              { cmd: "exit", explanation: "" },
              { cmd: "ap location-tag-name CORP-LOC", explanation: "Location-Tag." },
              { cmd: "ap site-tag-name CORP-SITE", explanation: "Site-Tag." },
              { cmd: "ap CORP-AP", explanation: "AP zuweisen." },
              { cmd: "policy-tag CORP-POLICY-TAG", explanation: "Tag dem AP zuweisen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ap summary", expected: "AP-Name, IP, State Registered" },
      { cmd: "show wlan summary", expected: "CORP-WLAN (1) UP, CORP-WPA3 (2) UP" },
      { cmd: "show wireless client summary", expected: "MAC, State Run, WLAN, AP" },
      { cmd: "show capwap client rcb (am AP)", expected: "AP Mode: Local, Controller IP: 192.168.10.1" },
    ],
    glossary: [
      { term: "WLC", def: "Wireless LAN Controller — verwaltet zentral viele Access Points." },
      { term: "Access Point (LWAP)", def: "Lightweight AP — sendet/empfängt Funk, wird aber vom WLC gesteuert." },
      { term: "CAPWAP", def: "Tunnelprotokoll zwischen AP und WLC für Steuerung und Datenverkehr." },
      { term: "PoE (power inline)", def: "Power over Ethernet — versorgt den AP über das Datenkabel mit Strom." },
      { term: "DHCP Option 43", def: "DHCP-Feld, über das der AP die IP-Adresse seines WLC erfährt (Controller-Discovery)." },
      { term: "Management-VLAN", def: "VLAN, in dem die APs ihre IP beziehen und mit dem WLC sprechen." },
      { term: "Controller-Discovery", def: "Vorgang, mit dem ein AP seinen WLC findet (DHCP 43, DNS, Broadcast)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 24. NetFlow / Flexible NetFlow
  // ─────────────────────────────────────────────────────────────
  {
    id: "netflow",
    icon: <Stack size={20} />,
    title: "NetFlow / Flexible NetFlow",
    subtitle: "Flow-Monitor, Exporter, Top-Talker erkennen",
    difficulty: "Fortgeschritten",
    duration: "15 min",
    context: {
      problem:
        "Ohne Verkehrsanalyse weiß man nicht, wer wieviel Traffic verursacht — entscheidend für Kapazitätsplanung, Abrechnung und das Erkennen von Anomalien.",
      purpose:
        "Flexible NetFlow erfasst Flows (Quelle, Ziel, Ports, Protokoll) und exportiert sie an einen Collector. Verschafft Sichtbarkeit über den tatsächlichen Datenverkehr.",
    },
    topology: {
      description:
        "Router R1 exportiert Flow-Records an einen Collector (z. B. Cisco Stealthwatch, ntopng).",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "server", label: "Flow-Collector", count: 1 },
      ],
      connections: ["R1 Gi0/0 (LAN) — wird beobachtet", "R1 Mgmt → Collector 10.0.0.60:9996"],
      hint: "Flexible NetFlow (FNF) ist der moderne Nachfolger von Traditional NetFlow. Definiere selbst, WELCHE Felder du erfassen willst.",
    },
    steps: [
      {
        title: "Flow Record definieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "flow record FNF-RECORD", explanation: "Eigenes Record-Template anlegen." },
              { cmd: "match ipv4 source address", explanation: "Key-Field: Quell-IP." },
              { cmd: "match ipv4 destination address", explanation: "Key-Field: Ziel-IP." },
              { cmd: "match transport source-port", explanation: "Key-Field." },
              { cmd: "match transport destination-port", explanation: "Key-Field." },
              { cmd: "match ipv4 protocol", explanation: "TCP/UDP/ICMP unterscheiden." },
              { cmd: "collect counter bytes", explanation: "Non-Key: Bytes pro Flow." },
              { cmd: "collect counter packets", explanation: "Non-Key: Pakete pro Flow." },
              { cmd: "collect timestamp sys-uptime first", explanation: "Wann Flow gestartet." },
              { cmd: "collect timestamp sys-uptime last", explanation: "Wann letzter Paket des Flows." },
            ],
          },
        ],
      },
      {
        title: "Flow Exporter (UDP zu Collector)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "flow exporter FNF-EXP", explanation: "Exporter-Konfig." },
              { cmd: "destination 10.0.0.60", explanation: "Collector-IP." },
              { cmd: "source Loopback0", explanation: "Stabile Quell-IP." },
              { cmd: "transport udp 9996", explanation: "UDP-Port. Standard 2055 oder 9996." },
              { cmd: "template data timeout 60", explanation: "Templates alle 60s neu senden — Collector vergisst sonst." },
            ],
          },
        ],
      },
      {
        title: "Flow Monitor & am Interface anwenden",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "flow monitor FNF-MON", explanation: "Verknüpft Record + Exporter." },
              { cmd: "record FNF-RECORD", explanation: "" },
              { cmd: "exporter FNF-EXP", explanation: "" },
              { cmd: "cache timeout active 60", explanation: "Lange Flows alle 60s exportieren." },
              { cmd: "cache timeout inactive 15", explanation: "Inaktive Flows nach 15s exportieren." },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "Beobachtetes Interface." },
              { cmd: "ip flow monitor FNF-MON input", explanation: "Ingress-Flow erfassen." },
              { cmd: "ip flow monitor FNF-MON output", explanation: "Egress-Flow erfassen — beidseitige Sicht." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show flow monitor FNF-MON cache", expected: "Flow-Liste mit Bytes/Packets pro Flow" },
      { cmd: "show flow exporter FNF-EXP statistics", expected: "Records sent, errors 0" },
      { cmd: "show flow monitor FNF-MON cache aggregate ipv4 source address sort highest counter bytes top 10", expected: "Top-Talker Liste" },
    ],
    glossary: [
      { term: "NetFlow", def: "Cisco-Technik zur Erfassung von Verkehrsflüssen pro Gerät." },
      { term: "Flow", def: "Folge von Paketen mit gleichem 5-Tupel (Quelle/Ziel-IP, Quelle/Ziel-Port, Protokoll)." },
      { term: "Flow Record", def: "Definiert, welche Felder erfasst werden (match) und welche Zähler (collect)." },
      { term: "match / collect", def: "match = Schlüsselfelder eines Flows; collect = mitgezählte Werte (Bytes, Pakete, Zeit)." },
      { term: "Flow Exporter", def: "Sendet die gesammelten Flows an einen externen Collector." },
      { term: "Flow Monitor", def: "Verknüpft Record + Exporter und wird auf ein Interface angewendet." },
      { term: "Collector", def: "Server, der NetFlow-Daten empfängt und auswertet." },
      { term: "5-Tupel", def: "Die fünf Felder, die einen Flow eindeutig identifizieren." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 28. REST API mit RESTCONF
  // ─────────────────────────────────────────────────────────────
  {
    id: "restconf",
    icon: <Stack size={20} />,
    title: "REST API mit RESTCONF",
    subtitle: "HTTPS + YANG-Daten + curl-Beispiel (CCNA 6.0)",
    difficulty: "Fortgeschritten",
    duration: "15 min",
    context: {
      problem:
        "Geräte einzeln per CLI zu konfigurieren skaliert nicht. Automatisierung braucht eine programmierbare Schnittstelle statt Tastatureingaben.",
      purpose:
        "RESTCONF auf IOS-XE aktivieren und per HTTPS/JSON Interfaces auslesen und ändern — der Einstieg in Netzwerk-Automatisierung über eine REST-API.",
    },
    topology: {
      description:
        "Router R1 (IOS-XE 17.x) wird via RESTCONF (HTTPS auf Port 443) konfigurierbar. Wir holen Interface-Status mit curl.",
      devices: [
        { type: "router", label: "R1 (IOS-XE)", count: 1 },
        { type: "pc", label: "Admin-PC mit curl", count: 1 },
      ],
      connections: ["Admin-PC → R1 Mgmt 10.0.0.1:443"],
      hint: "RESTCONF nutzt YANG-Modelle als Datenstruktur — JSON oder XML. Ideal für Python-Skripte und Ansible.",
    },
    steps: [
      {
        title: "RESTCONF auf dem Router aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ip http secure-server", explanation: "HTTPS-Webserver aktivieren — RESTCONF läuft darüber." },
              { cmd: "ip http authentication local", explanation: "Lokale User-DB für Auth." },
              { cmd: "restconf", explanation: "RESTCONF-Feature aktivieren." },
              { cmd: "username admin privilege 15 secret AdminP@ss", explanation: "User für API-Zugriff." },
            ],
          },
        ],
      },
      {
        title: "Vom Admin-PC: GET /interfaces",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ curl",
            commands: [
              { cmd: "curl -k -u admin:AdminP@ss \\\n  -H 'Accept: application/yang-data+json' \\\n  https://10.0.0.1/restconf/data/ietf-interfaces:interfaces", explanation: "Holt alle Interfaces als JSON. '-k' = unsicheres SSL akzeptieren (Self-Signed). Response: { 'ietf-interfaces:interfaces': { 'interface': [...] } }" },
              { cmd: "curl -k -u admin:AdminP@ss \\\n  -H 'Accept: application/yang-data+json' \\\n  https://10.0.0.1/restconf/data/ietf-interfaces:interfaces-state/interface=GigabitEthernet0%2F0", explanation: "Live-State eines einzelnen Interfaces. '%2F' ist URL-encoded '/'." },
            ],
          },
        ],
      },
      {
        title: "PUT — Description ändern",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ curl",
            commands: [
              { cmd: "curl -k -u admin:AdminP@ss -X PUT \\\n  -H 'Content-Type: application/yang-data+json' \\\n  -d '{\"ietf-interfaces:interface\":{\"name\":\"GigabitEthernet0/0\",\"description\":\"Uplink to Core\",\"type\":\"iana-if-type:ethernetCsmacd\",\"enabled\":true}}' \\\n  https://10.0.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F0", explanation: "PUT ersetzt das komplette Objekt. PATCH = nur Teil ändern. POST = neues Objekt erstellen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show running-config | include restconf", explanation: "restconf", expected: "restconf" },
      { cmd: "show platform software yang-management process", expected: "ncsshd, confd, syncfd: Running" },
      { cmd: "Browser: https://10.0.0.1/restconf/data?depth=2", expected: "JSON-Response mit Top-Level YANG-Modulen" },
    ],
    glossary: [
      { term: "RESTCONF", def: "HTTP(S)-basierte API (RFC 8040), die YANG-Datenmodelle als REST-Ressourcen bereitstellt." },
      { term: "YANG", def: "Modellierungssprache, die die Konfigurations-/Statusdaten eines Geräts strukturiert beschreibt." },
      { term: "ip http secure-server", def: "Aktiviert den HTTPS-Server — Voraussetzung für RESTCONF." },
      { term: "GET / PUT", def: "HTTP-Methoden: GET liest Daten, PUT setzt/ersetzt eine Konfiguration." },
      { term: "JSON", def: "Datenformat der Anfragen/Antworten (application/yang-data+json)." },
      { term: "ietf-interfaces", def: "Standard-YANG-Modul für Interface-Konfiguration und -Status." },
      { term: "API-Endpoint", def: "URL-Pfad einer Ressource, z. B. /restconf/data/ietf-interfaces:interfaces." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 29. NETCONF + YANG
  // ─────────────────────────────────────────────────────────────
  {
    id: "netconf-yang",
    icon: <Stack size={20} />,
    title: "NETCONF + YANG",
    subtitle: "SSH-basierte API + Python-ncclient-Snippet",
    difficulty: "Fortgeschritten",
    duration: "15 min",
    context: {
      problem:
        "Programmierbare Konfiguration braucht ein robustes, transaktionales Protokoll — kein fehleranfälliges Screen-Scraping der CLI.",
      purpose:
        "NETCONF (Port 830) auf IOS-XE aktivieren und per Python (ncclient) Konfigurationen lesen und schreiben. XML/YANG-basierte Automatisierung mit Transaktionen.",
    },
    topology: {
      description:
        "Router R1 mit NETCONF über SSH-Port 830. Python-Skript holt die Hostname-Konfig per ncclient.",
      devices: [
        { type: "router", label: "R1 (IOS-XE)", count: 1 },
        { type: "pc", label: "Admin-PC mit Python", count: 1 },
      ],
      connections: ["Admin-PC → R1 Mgmt 10.0.0.1:830 (SSH/NETCONF)"],
      hint: "NETCONF ist 'state-aware' — kennt Configure (candidate) + Commit. Im Gegensatz zu CLI: atomare Transaktionen.",
    },
    steps: [
      {
        title: "NETCONF auf R1 aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "netconf-yang", explanation: "NETCONF-Server aktivieren — lauscht auf Port 830." },
              { cmd: "username netops privilege 15 secret NetOpsP@ss", explanation: "User für NETCONF." },
              { cmd: "aaa new-model", explanation: "PFLICHT für NETCONF in IOS-XE." },
              { cmd: "aaa authentication login default local", explanation: "Lokale Auth." },
              { cmd: "aaa authorization exec default local", explanation: "" },
            ],
          },
        ],
      },
      {
        title: "Python-Snippet (ncclient)",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ python3",
            commands: [
              { cmd: "pip install ncclient", explanation: "Library installieren." },
              { cmd: "from ncclient import manager\n\nwith manager.connect(\n    host='10.0.0.1', port=830,\n    username='netops', password='NetOpsP@ss',\n    hostkey_verify=False, device_params={'name':'iosxe'}\n) as m:\n    filter = '''\n    <filter>\n      <native xmlns=\"http://cisco.com/ns/yang/Cisco-IOS-XE-native\">\n        <hostname/>\n      </native>\n    </filter>'''\n    reply = m.get_config(source='running', filter=filter)\n    print(reply.xml)", explanation: "Holt den Hostname aus der running-config via NETCONF. Filter im XML mit Cisco-IOS-XE-native YANG-Modell." },
            ],
          },
        ],
      },
      {
        title: "Hostname per NETCONF ändern",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ python3",
            commands: [
              { cmd: "config = '''\n<config>\n  <native xmlns=\"http://cisco.com/ns/yang/Cisco-IOS-XE-native\">\n    <hostname>R1-NEW</hostname>\n  </native>\n</config>'''\nm.edit_config(target='running', config=config)\nprint('Hostname updated!')", explanation: "edit_config schreibt direkt in running-config. Alternativ: target='candidate' + m.commit() für transaktionale Änderung." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show netconf-yang sessions", expected: "Active sessions: 1, User: netops" },
      { cmd: "show platform software yang-management process", expected: "ncsshd: Running" },
      { cmd: "show running-config | include hostname", expected: "hostname R1-NEW" },
    ],
    glossary: [
      { term: "NETCONF", def: "XML-basiertes Konfigurationsprotokoll (RFC 6241) über SSH, Port 830." },
      { term: "YANG", def: "Datenmodell, das NETCONF und RESTCONF gemeinsam nutzen." },
      { term: "ncclient", def: "Python-Bibliothek, um NETCONF-Sitzungen aufzubauen und RPCs zu senden." },
      { term: "Port 830", def: "Standard-TCP-Port für NETCONF over SSH." },
      { term: "RPC", def: "Remote Procedure Call — NETCONF-Operation wie get-config oder edit-config." },
      { term: "Datastore", def: "Konfigurationsspeicher: running (aktiv) bzw. candidate (Entwurf vor Commit)." },
      { term: "XML", def: "Auszeichnungsformat der NETCONF-Nachrichten." },
    ],
  },

  // ---------------------------------------------------------------
  // Password Recovery (Router + Switch) -- PDF
  // ---------------------------------------------------------------
  {
    id: "password-recovery",
    icon: <Key size={20} />,
    title: "Password Recovery",
    subtitle: "Router (0x2142) & Switch (flash_init) ohne Passwort retten",
    difficulty: "Mittel",
    duration: "15 min",
    context: {
      problem:
        "Kennt niemand mehr das enable secret eines Geräts, ist es ohne Recovery nicht mehr administrierbar — ein realer Notfall im Betrieb.",
      purpose:
        "Standard-Admin-Prozedur, um Router (über ROMMON) und Switch (über den Boot-Loader) wieder unter Kontrolle zu bringen, OHNE die bestehende Konfiguration zu verlieren.",
    },
    topology: {
      description:
        "Klassische Admin-Aufgabe: ein Gerät, dessen enable-secret niemand mehr kennt, wieder unter Kontrolle bringen -- über Konsolenzugang und Boot-Loader.",
      devices: [
        { type: "router", label: "R1 (Passwort unbekannt)", count: 1 },
        { type: "switch", label: "SW1 (Passwort unbekannt)", count: 1 },
      ],
      connections: [
        "Konsolenkabel (Rollover) → PC mit Terminalprogramm",
      ],
      hint: "Kernidee: das Gerät so booten, dass die startup-config (mit dem Passwort) NICHT geladen wird -- dann Passwort neu setzen und sauber zurückstellen.",
    },
    steps: [
      {
        title: "Router: Register lesen + ROMMON",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show version",
                explanation:
                  "Ganz unten: 'Configuration register is 0x2102'. 0x2102 = startup-config laden, 0x2142 = startup-config überspringen.",
              },
              {
                cmd: "(Router neu starten + während des Bootens Strg+Pause/Break)",
                explanation:
                  "Unterbricht den Boot und fällt in den ROMMON-Modus (rommon 1>). In Packet Tracer: Ctrl+C.",
              },
            ],
          },
          {
            device: "R1",
            mode: "rommon",
            modeLabel: "rommon 1>",
            commands: [
              {
                cmd: "confreg 0x2142\nreset",
                explanation:
                  "Setzt das Register so, dass die startup-config beim nächsten Boot übersprungen wird, und startet neu. Gerät bootet jetzt OHNE Passwort.",
              },
            ],
          },
        ],
      },
      {
        title: "Router: Passwort neu setzen + Register zurücksetzen",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router#",
            commands: [
              {
                cmd: "copy startup-config running-config",
                explanation:
                  "WICHTIG: erst die alte Config zurückholen -- sonst überschreibst du beim Speichern die komplette Konfiguration mit einer leeren!",
              },
              {
                cmd: "configure terminal\nenable secret cisco123\nconfig-register 0x2102",
                explanation:
                  "Neues Passwort setzen UND das Register auf 0x2102 zurücksetzen -- sonst ignoriert der Router auch beim nächsten Start die startup-config.",
              },
              {
                cmd: "end\nwrite memory",
                explanation:
                  "Speichern. Beim nächsten Reload bootet der Router normal mit neuem Passwort.",
              },
            ],
          },
        ],
      },
      {
        title: "Switch: Recovery über den Boot-Loader",
        blocks: [
          {
            device: "SW1",
            mode: "switch",
            modeLabel: "switch:",
            commands: [
              {
                cmd: "flash_init",
                explanation:
                  "Switch beim Booten mit gedrueckter MODE-Taste in den Boot-Loader bringen, dann Flash initialisieren.",
              },
              {
                cmd: "rename flash:config.text flash:config.old\nboot",
                explanation:
                  "Die startup-config (config.text) umbenennen → Switch bootet ohne Passwort. Nach dem Boot zurückbenennen und mit 'copy startup running' zurückholen.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show version | include register", expected: "Configuration register is 0x2102 (will be 0x2102 at next reload)" },
      { cmd: "show running-config | include enable", expected: "enable secret 5 ... (neuer Hash)" },
      { cmd: "reload + Login", expected: "Gerät bootet normal, neues Passwort wird akzeptiert, alte Config intakt" },
    ],
    glossary: [
      { term: "Configuration Register", def: "16-Bit-Wert (zeigt show version), der das Boot-Verhalten steuert." },
      { term: "0x2102", def: "Standard-Register: der Router lädt beim Booten die startup-config." },
      { term: "0x2142", def: "Register, das die startup-config beim Booten ÜBERSPRINGT — der Kern des Router-Recovery." },
      { term: "ROMMON", def: "ROM Monitor — minimaler Boot-Modus des Routers, erreichbar durch Boot-Unterbrechung (Strg+Pause)." },
      { term: "confreg", def: "ROMMON-Befehl zum Setzen des Configuration Registers (z. B. confreg 0x2142)." },
      { term: "config-register", def: "IOS-Befehl im Config-Modus, um das Register nach dem Recovery wieder auf 0x2102 zu setzen." },
      { term: "flash_init", def: "Boot-Loader-Befehl des Switches, der den Flash initialisiert, bevor config.text umbenannt wird." },
      { term: "config.text", def: "Datei im Switch-Flash, die die startup-config enthält. Umbenennen = Switch bootet ohne Passwort." },
      { term: "copy startup-config running-config", def: "Holt die gesicherte Config zurück — WICHTIG vor dem Speichern, sonst überschreibt man alles mit Leer." },
    ],
  },

  // ---------------------------------------------------------------
  // IOS Backup & Upgrade (TFTP) -- PDF
  // ---------------------------------------------------------------
  {
    id: "ios-backup-upgrade",
    icon: <Stack size={20} />,
    title: "IOS-Backup & Upgrade (TFTP)",
    subtitle: "Image sichern, neues laden, Bootreihenfolge setzen",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "Vor einem IOS-Upgrade muss alles gesichert sein. Ein defektes oder falsches Image kann ein Gerät unbootbar machen.",
      purpose:
        "Wartungsroutine: Config und altes Image per TFTP sichern, neues Image laden, MD5 prüfen, Bootreihenfolge setzen. Genau so läuft IOS-Pflege in der Praxis.",
    },
    topology: {
      description:
        "Wartungsroutine: vor jedem IOS-Upgrade erst Config und altes Image auf einen TFTP-Server sichern, dann das neue Image laden und den Boot festlegen.",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "server", label: "TFTP-Server", count: 1 },
      ],
      connections: [
        "R1 Gi0/0 → TFTP-Server  (gleiches Subnetz, z. B. 10.1.1.0/24)",
      ],
      hint: "Reihenfolge merken: Erreichbarkeit prüfen → Config sichern → Image sichern → Platz prüfen → neues Image laden → verify md5 → boot system → reload.",
    },
    steps: [
      {
        title: "Vorbereitung: Erreichbarkeit + Platz",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "ping 10.1.1.10",
                explanation:
                  "Der TFTP-Server muss erreichbar sein -- ohne Konnektivitaet schlägt jedes copy fehl.",
              },
              {
                cmd: "show flash:",
                explanation:
                  "Aktuelles Image und freier Speicher. Genug Platz für das neue Image? Sonst altes erst löschen.",
              },
            ],
          },
        ],
      },
      {
        title: "Backup von Config + IOS-Image",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "copy running-config tftp:",
                explanation:
                  "Erst die Konfiguration sichern. Bei der Abfrage die TFTP-Server-IP (10.1.1.10) und den Dateinamen angeben.",
              },
              {
                cmd: "copy flash: tftp:",
                explanation:
                  "Dann das aktuelle IOS-Image sichern -- das ist die Rückfallebene, falls das neue Image defekt ist.",
              },
            ],
          },
        ],
      },
      {
        title: "Neues Image laden + Boot festlegen",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "copy tftp: flash:",
                explanation:
                  "Neues Image vom Server in den Flash laden. Server-IP + exakter Dateiname nötig.",
              },
              {
                cmd: "verify /md5 flash:c2900-universalk9-mz.SPA.bin",
                explanation:
                  "MD5-Prüfsumme gegen Ciscos Angabe vergleichen -- so erkennst du eine beschädigte Datei VOR dem Reload.",
              },
            ],
          },
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "boot system flash:c2900-universalk9-mz.SPA.bin",
                explanation:
                  "Legt fest, welches Image beim nächsten Start geladen wird. Ohne diesen Befehl nimmt der Router das erste Image im Flash.",
              },
              {
                cmd: "exit\nwrite memory\nreload",
                explanation:
                  "Speichern und neu starten. Nach dem Boot mit 'show version' die neue IOS-Version prüfen.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show version", expected: "Neue IOS-Version in der ersten Zeile (z. B. Version 15.2 statt 15.1)" },
      { cmd: "show flash:", expected: "Neues + altes Image vorhanden, genug freier Speicher" },
      { cmd: "show boot / show bootvar", expected: "BOOT path-list zeigt das neue Image" },
    ],
    glossary: [
      { term: "TFTP", def: "Trivial File Transfer Protocol (UDP 69) — einfacher Dateitransfer, Standard für IOS-/Config-Backups." },
      { term: "Flash", def: "Nichtflüchtiger Speicher des Geräts, in dem das IOS-Image liegt." },
      { term: "IOS-Image", def: "Die Betriebssystem-Datei von Cisco-Geräten (z. B. c2900-universalk9-mz.SPA.bin)." },
      { term: "copy flash: tftp:", def: "Sichert ein Image (oder Config) aus dem Flash auf einen TFTP-Server." },
      { term: "copy tftp: flash:", def: "Lädt ein neues Image vom TFTP-Server in den Flash." },
      { term: "verify /md5", def: "Prüft die MD5-Summe einer Datei gegen Ciscos Angabe — erkennt ein beschädigtes Image VOR dem Reload." },
      { term: "boot system", def: "Legt fest, welches Image beim nächsten Start geladen wird." },
      { term: "show flash:", def: "Zeigt Inhalt und freien Speicher des Flash — genug Platz fürs neue Image?" },
      { term: "reload", def: "Startet das Gerät neu, damit das neue Image aktiv wird." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 31. Cable & Layer-1-Issues
  // ─────────────────────────────────────────────────────────────
  {
    id: "layer1-issues",
    icon: <HardDrives size={20} />,
    title: "Cable & Layer-1-Issues",
    subtitle: "CRC, Late-Collision, Input-Errors interpretieren",
    difficulty: "Mittel",
    duration: "15 min",
    context: {
      problem:
        "Physische Probleme — defekte Kabel, Duplex-Mismatch, Störungen — stehen nicht in der Konfiguration, sondern in den Fehlerzählern eines Interfaces. Die muss man lesen können.",
      purpose:
        "Die Counter eines Interfaces interpretieren: CRC, Frame, Giants/Runts und Late Collisions — und daraus auf die wahre Ursache (Kabel, Duplex, Hardware) schließen.",
    },
    topology: {
      description:
        "Switch SW1 mit auffälligem Port — wir lernen, wie man Kabel- und Duplex-Probleme diagnostiziert.",
      devices: [{ type: "switch", label: "SW1", count: 1 }],
      connections: ["Port Fa0/5 zeigt Performance-Probleme"],
      hint: "CRC-Errors sind fast immer ein KABEL- oder TRANSCEIVER-Problem. Late-Collisions sind fast immer DUPLEX-Mismatch.",
    },
    steps: [
      {
        title: "Interface-Counter detailliert lesen",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              { cmd: "show interfaces Fa0/5", explanation: "Vollständiger Counter-Block — wir interpretieren die Felder unten." },
              { cmd: "show interfaces Fa0/5 counters errors", explanation: "Übersichtliche Fehler-Tabelle." },
            ],
          },
          {
            device: "SW1",
            mode: "info",
            modeLabel: "Counter-Interpretation",
            commands: [
              { cmd: "Input errors          ← Summe aller Empfangsfehler", explanation: "Wenn > 0: Hardware/Kabel-Problem auf Empfangsseite." },
              { cmd: "CRC                   ← Cyclic Redundancy Check failed", explanation: "Frame angekommen, aber CRC-Prüfsumme falsch. URSACHEN: defektes Kabel, schlechter Transceiver, EMV-Störung, defekter Switch-Port." },
              { cmd: "Frame                 ← Frame mit nicht-ganzzahligen Bytes", explanation: "Kabel-/Hardware-Problem auf Layer 1." },
              { cmd: "Giants/Runts          ← Frame > 1518 B / < 64 B", explanation: "Selten — meist VLAN-Tagging falsch oder Driver-Bug." },
              { cmd: "Output errors         ← Summe aller Sendefehler", explanation: "Wenn > 0: ausgehende Probleme." },
              { cmd: "Collisions            ← Halb-Duplex normal", explanation: "Bei Full-Duplex IMMER 0. Wenn > 0 → Duplex-Mismatch!" },
              { cmd: "Late collisions       ← KRITISCH (Full-Duplex)", explanation: "Collision NACH 64 Byte Übertragung. URSACHE: Duplex-Mismatch (eine Seite Full, andere Half) oder Kabellänge > 100m." },
              { cmd: "Excessive collisions  ← > 16 collisions", explanation: "Stark überlastetes Half-Duplex-Segment oder Hardware-Defekt." },
            ],
          },
        ],
      },
      {
        title: "Duplex & Speed prüfen + fest setzen",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              { cmd: "show interfaces Fa0/5 | include duplex", explanation: "Aktueller Duplex-Status." },
              { cmd: "show interface Fa0/5 status", explanation: "Status, VLAN, Duplex, Speed, Type." },
            ],
          },
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Fa0/5", explanation: "Problem-Port." },
              { cmd: "duplex full", explanation: "FEST auf Full-Duplex (statt 'auto')." },
              { cmd: "speed 100", explanation: "FEST auf 100 Mbit/s." },
              { cmd: "shutdown", explanation: "Interface aus..." },
              { cmd: "no shutdown", explanation: "...und wieder an — Counter werden ggf. resettet." },
            ],
          },
        ],
      },
      {
        title: "Counter zurücksetzen für sauberen Test",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              { cmd: "clear counters Fa0/5", explanation: "Setzt nur die Counter auf 0 — Interface bleibt up. Dann 10 Min warten und neu prüfen." },
              { cmd: "clear counters", explanation: "Counter ALLER Interfaces zurücksetzen." },
            ],
          },
        ],
      },
      {
        title: "TDR-Test (Time Domain Reflectometer) — Kabel physisch prüfen",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              { cmd: "test cable-diagnostics tdr interface Gi0/1", explanation: "Nur auf moderneren Catalysts. Sendet Signal-Impuls, misst Reflexion → erkennt Kabelbruch und exakte Position in Metern!" },
              { cmd: "show cable-diagnostics tdr interface Gi0/1", explanation: "Ergebnis: 'Pair A: OK', 'Pair B: Open at 47 meters' — defektes Adernpaar lokalisiert." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show interfaces Fa0/5 | include error|collision|CRC", expected: "Alle Counter sollten 0 oder konstant niedrig sein" },
      { cmd: "show interfaces status err-disabled", expected: "Liste err-disabled Ports — z. B. nach BPDU Guard oder Port Security" },
      { cmd: "show platform pm port-data Fa0/5", expected: "Detaillierter Port-Manager-Status (interne Cisco-Debug-Info)" },
    ],
    glossary: [
      { term: "Input / Output Errors", def: "Summe aller Empfangs- bzw. Sendefehler eines Ports." },
      { term: "CRC", def: "Prüfsummenfehler — meist Kabel, Störungen oder Duplex-Mismatch." },
      { term: "Frame", def: "Frame mit nicht-ganzzahliger Byte-Zahl — oft Verkabelung/Störung." },
      { term: "Giants / Runts", def: "Frame größer 1518 B (Giant) bzw. kleiner 64 B (Runt)." },
      { term: "Collisions", def: "Auf Halb-Duplex normal; auf Full-Duplex ein Warnsignal." },
      { term: "Late Collisions", def: "Kollision spät im Frame — fast immer ein Duplex-Mismatch (kritisch!)." },
      { term: "Duplex-Mismatch", def: "Eine Seite Full-, die andere Half-Duplex — verursacht Late Collisions und CRC." },
      { term: "show interfaces counters errors", def: "Listet alle Fehlerzähler je Port auf." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 30. Show-Cheat-Lab (Troubleshooting)
  // ─────────────────────────────────────────────────────────────
  {
    id: "troubleshooting-cheat",
    icon: <Info size={20} />,
    title: "Show-Cheat-Lab (Troubleshooting)",
    subtitle: "Strukturierte Fehlersuche von L1 nach L7",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "Bei einer Störung weiß man oft nicht, wo anfangen. Strukturierte Diagnose nach Schichten spart Zeit gegenüber wildem Herumprobieren.",
      purpose:
        "Eine nach OSI-Schichten sortierte show-Befehl-Referenz als Spickzettel für die systematische Fehlersuche — von Layer 1 (Interfaces) bis Layer 3 (Routing).",
    },
    topology: {
      description:
        "Beliebige Topologie — der Workflow funktioniert immer. Ein PC erreicht angeblich nicht den Webserver. Wir gehen die Layer systematisch durch.",
      devices: [{ type: "any", label: "Bestehendes Netz", count: 1 }],
      connections: ["PC → SW1 → R1 → Internet → Webserver"],
      hint: "Beginne IMMER bei Layer 1 und arbeite dich nach oben. Nicht wild raten!",
    },
    steps: [
      {
        title: "Layer 1+2: Physische Verbindung & Switching",
        blocks: [
          {
            device: "Router/Switch",
            mode: "privileged",
            modeLabel: "#",
            commands: [
              { cmd: "show ip interface brief", explanation: "Quick-Check: alle Interfaces, IP, Status. 'administratively down' = no shutdown vergessen. 'up/down' = Layer 1 ok, Layer 2 down (z. B. Speed/Duplex Mismatch)." },
              { cmd: "show interfaces status", explanation: "Switch-Spezifisch: Port-Status, VLAN, Duplex, Speed, Type." },
              { cmd: "show interfaces counters errors", explanation: "CRC-Errors → schlechtes Kabel. Late-Collisions → Duplex-Mismatch. Input-Errors → Hardware-Defekt." },
              { cmd: "show cdp neighbors detail", explanation: "Zeigt direkt verbundene Cisco-Geräte mit IP und Port — perfekt für 'wo bin ich angeschlossen?'." },
              { cmd: "show lldp neighbors detail", explanation: "Wie CDP, aber Vendor-neutral (802.1AB)." },
              { cmd: "show mac address-table dynamic", explanation: "MAC-Adresstabelle des Switches — wo ist welche MAC gelernt." },
            ],
          },
        ],
      },
      {
        title: "Layer 2: VLAN & STP",
        blocks: [
          {
            device: "Switch",
            mode: "privileged",
            modeLabel: "SW#",
            commands: [
              { cmd: "show vlan brief", explanation: "Welche VLANs existieren, welche Ports sind zugeordnet." },
              { cmd: "show interfaces trunk", explanation: "Welche Ports sind Trunk, welche VLANs erlaubt, Native VLAN." },
              { cmd: "show spanning-tree", explanation: "Wer ist Root, welche Ports sind Blocked/Forwarding." },
              { cmd: "show spanning-tree blockedports", explanation: "Schnellcheck blockierter Ports." },
            ],
          },
        ],
      },
      {
        title: "Layer 3: IP-Connectivity",
        blocks: [
          {
            device: "Router",
            mode: "privileged",
            modeLabel: "R#",
            commands: [
              { cmd: "show ip route", explanation: "Routing-Tabelle — fehlt die Default-Route? Welche Routen sind dynamisch (O/D/B)?" },
              { cmd: "show ip route 8.8.8.8", explanation: "Longest-Match für eine spezifische IP — über welches Interface geht das?" },
              { cmd: "show ip arp", explanation: "ARP-Tabelle — MAC ↔ IP. Wenn leer für ein Ziel: Layer-2-Problem oder Ziel nicht im selben Subnetz." },
              { cmd: "ping 8.8.8.8 source Loopback0", explanation: "Explizite Source-IP — wichtig bei NAT/Routing-Tests." },
              { cmd: "traceroute 8.8.8.8", explanation: "Wo bleibt der Pfad hängen? '* * *' = Router antwortet nicht (ICMP rate-limit oder Firewall)." },
            ],
          },
        ],
      },
      {
        title: "Layer 4+: Service-Layer",
        blocks: [
          {
            device: "Router",
            mode: "privileged",
            modeLabel: "R#",
            commands: [
              { cmd: "telnet 10.0.0.20 80", explanation: "TCP-Connection-Test ohne Browser. '%Open' = Port erreichbar. Verbindungsabbruch = Port zu/Firewall." },
              { cmd: "show ip nat translations", explanation: "Aktive NAT-Sessions — bei Internet-Problemen." },
              { cmd: "show ip access-lists", explanation: "ACL-Counter — werden Pakete von einer Deny-Regel getroffen?" },
              { cmd: "debug ip icmp", explanation: "Live-Debug von ICMP. ACHTUNG: hohe CPU-Last → nach Test sofort 'undebug all'!" },
              { cmd: "undebug all", explanation: "Alle Debugs abschalten — PFLICHT nach jedem Debug." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show tech-support", expected: "Komplett-Snapshot — sendest du an TAC bei Eskalation" },
      { cmd: "show logging | last 50", expected: "Letzte 50 Log-Zeilen — oft steht das Problem direkt drin" },
    ],
    glossary: [
      { term: "show ip interface brief", def: "Schneller Überblick: welche L3-Interfaces sind up/up und haben eine IP." },
      { term: "show interfaces status", def: "Port-Übersicht mit VLAN, Duplex, Speed und Verbindungsstatus." },
      { term: "show interfaces counters errors", def: "Fehlerzähler je Port (CRC, Runts, Giants) — Layer-1-Diagnose." },
      { term: "CDP / LLDP neighbors", def: "Zeigt direkt verbundene Nachbargeräte und an welchem Port." },
      { term: "show mac address-table", def: "Welche MAC ist an welchem Port/VLAN gelernt — L2-Weiterleitung." },
      { term: "show vlan brief", def: "VLANs und ihre zugeordneten Access-Ports." },
      { term: "show interfaces trunk", def: "Trunk-Status und erlaubte/aktive VLANs." },
      { term: "show spanning-tree", def: "Root-Bridge, Port-Rollen und -Zustände — L2-Loop-Diagnose." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // DHCP Troubleshooting — 3 eingebaute Fehler finden & beheben
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp-troubleshoot-lab",
    icon: <Shield size={20} />,
    title: "DHCP Troubleshooting: 3 Fehler finden",
    subtitle: "APIPA-Diagnose · helper-address · excluded-address · SVI down",
    difficulty: "Fortgeschritten",
    duration: "25 min",
    context: {
      problem:
        "In einer fertig verdrahteten Umgebung bekommen Clients keine oder falsche IPs (169.254.x.x bzw. Gateway-Konflikt). Drei typische Konfigurationsfehler sind absichtlich eingebaut.",
      purpose:
        "Systematische Fehlersuche trainieren: Symptom lesen (APIPA = kein DHCP), Ursache eingrenzen und gezielt beheben — Helper-Adresse auf der richtigen Seite, fehlende Exclusion, abgeschaltetes SVI.",
    },
    topology: {
      description:
        "Eine fertig 'verkabelte' Umgebung mit drei eingebauten Konfigurationsfehlern: Clients bekommen keine oder falsche IPs (169.254.x.x / Gateway-Konflikt). Aufgabe: systematisch diagnostizieren und beheben.",
      devices: [
        { type: "router", label: "R1 (DHCP-Relay + SVI VLAN1)", count: 1 },
        { type: "switch", label: "SW1", count: 1 },
        { type: "server", label: "DHCP-Server 192.168.2.11", count: 1 },
        { type: "pc", label: "Clients VLAN 51 / 61", count: 2 },
      ],
      connections: [
        "R1 Gi0/0 ↔ SW1 (Trunk) · DHCP-Server in VLAN 71",
        "Clients in VLAN 51 (Rot) und VLAN 61 (Blau)",
      ],
      hint: "Symptom zuerst lesen: 169.254.x.x = gar keine DHCP-Antwort. Eine Adresse aus dem richtigen Netz, aber Konflikt = excluded-address-Problem.",
    },
    steps: [
      {
        title: "Fehler 1: Client Rot bekommt 169.254.x.x (APIPA)",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show running-config interface gi0/0.51",
                explanation:
                  "Diagnose: Der Helper steht fälschlich auf gi0/0.71 (Server-seitig) statt auf gi0/0.51 (Client-seitig). Darum entsteht kein korrektes giaddr für die Rot-Clients → keine Antwort → APIPA.",
              },
              {
                cmd: "interface gi0/0.51\nip helper-address 192.168.2.11",
                explanation:
                  "FIX: Helper auf das CLIENT-Subinterface setzen. (Auf gi0/0.71 wieder entfernen: 'no ip helper-address 192.168.2.11'.)",
              },
            ],
          },
        ],
      },
      {
        title: "Fehler 2: Client Blau bekommt IP, aber Adresskonflikt",
        blocks: [
          {
            device: "DHCP-Server",
            mode: "service",
            modeLabel: "Server > Services > DHCP",
            commands: [
              {
                cmd: "Pool Blau prüfen: Start-IP = 172.16.61.1 (= Gateway!)",
                explanation:
                  "Diagnose: Der Pool beginnt bei 172.16.61.1 — das ist die Gateway-IP des Routers (gi0/0.61). Der Server vergibt sie an einen Client → Konflikt, 'show ip dhcp conflict' / Doppel-IP-Warnung.",
              },
              {
                cmd: "FIX: Start-IP auf 172.16.61.10 setzen (Gateway .1 ausnehmen)",
                explanation:
                  "Auf einem IOS-DHCP-Server entspricht das 'ip dhcp excluded-address 172.16.61.1'. In Packet Tracer: Start-Adresse über das Gateway hinaus legen.",
              },
            ],
          },
        ],
      },
      {
        title: "Fehler 3: Management-Zugriff im VLAN 1 schlägt fehl",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              {
                cmd: "show ip interface brief | include Vlan1",
                explanation:
                  "Diagnose: Vlan1 ist 'administratively down'. Das Management-SVI ist nie hochgekommen — der Switch ist nicht per Telnet/SSH erreichbar.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.2.50 255.255.255.0\nno shutdown",
                explanation:
                  "FIX: SVI mit IP versehen und mit 'no shutdown' aktivieren. SVIs sind per Default down — der häufigste Management-Fehler.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ipconfig (Client Rot)", expected: "Echte IP 172.16.51.x statt 169.254.x.x" },
      { cmd: "ipconfig (Client Blau)", expected: "IP ab 172.16.61.10, kein Konflikt mit Gateway" },
      { cmd: "show ip dhcp conflict (Server)", expected: "Keine Konflikte mehr gelistet" },
      { cmd: "show ip interface brief (SW1)", expected: "Vlan1: up/up mit Management-IP" },
    ],
    glossary: [
      { term: "APIPA", def: "169.254.x.x — Selbstadresse eines Clients, wenn KEIN DHCP antwortet. Sicheres Zeichen für ein DHCP-Problem." },
      { term: "ip helper-address", def: "Muss auf dem CLIENT-seitigen Interface stehen; auf der Server-Seite entsteht kein korrektes giaddr." },
      { term: "giaddr", def: "Feld, in das der Relay seine Interface-IP einträgt; der Server wählt daran den Pool." },
      { term: "ip dhcp excluded-address", def: "Fehlt sie für die Gateway-IP, vergibt der Server diese — Adresskonflikt." },
      { term: "SVI", def: "interface vlan X; ist es administratively down, fehlt das Gateway/Management." },
      { term: "administratively down", def: "Per shutdown abgeschaltetes Interface — mit no shutdown aktivieren." },
      { term: "Adresskonflikt", def: "Zwei Geräte beanspruchen dieselbe IP (z. B. Gateway + Client)." },
    ],
  },

  // ---------------------------------------------------------------
  // Campus-Capstone: VTP + Router-on-a-Stick + zentrales DHCP (3 Switches)
  // ---------------------------------------------------------------
  {
    id: "vlan-vtp-dhcp-campus",
    icon: <Network size={20} />,
    title: "Campus: VTP + RoaS + zentrales DHCP (3 Switches)",
    subtitle: "R1 als DHCP-Server · VTP CCNA · 3 VLANs + Mgmt · End-to-End",
    difficulty: "Fortgeschritten",
    duration: "45 min",
    context: {
      problem:
        "Drei Abteilungen (VLANs) verteilt über drei in Reihe geschaltete Switches sollen automatisch IP-Adressen bekommen und miteinander routen — mit nur EINEM Router und einem zentralen DHCP-Server, ohne auf jedem Switch VLANs und auf jedem Router-Port Adressen von Hand zu pflegen.",
      purpose:
        "Ein vollständiges Campus-Szenario von Grund auf, das den CIS-Grundlagenstoff zusammenführt: Grundkonfiguration, automatische VLAN-Verteilung per VTP über drei Switches, Inter-VLAN-Routing per Router-on-a-Stick (inkl. Native-VLAN-Subinterface), ein zentraler DHCP-Server mit vier Pools und ausgenommenen Bereichen sowie Switch-Management über SVIs — abgeschlossen mit End-to-End-Ping-Tests. Ideales Abschluss-Lab.",
    },
    topology: {
      description:
        "Router R1 (Router-on-a-Stick + DHCP-Server) hängt an SW1; die drei Switches sind in Reihe per Trunk verbunden (SW1—SW2—SW3). VLANs werden per VTP von SW1/SW2 (Server) an SW3 (Client) verteilt. An jedem Switch sitzen drei PCs in VLAN 100 (Rot), 110 (Blau) und 120 (Grün); das Management läuft über VLAN 1.",
      devices: [
        { type: "router", label: "R1 (RoaS + DHCP-Server)", count: 1 },
        { type: "switch", label: "SW1 / SW2 (VTP-Server)", count: 2 },
        { type: "switch", label: "SW3 (VTP-Client)", count: 1 },
        { type: "pc", label: "9 PCs (Rot/Blau/Grün je Switch)", count: 9 },
      ],
      connections: [
        "R1 Gi0/0 ↔ SW1 Gi0/1  (Trunk, Router-on-a-Stick)",
        "SW1 Gi0/2 ↔ SW2 Gi0/1  (Trunk)",
        "SW2 Gi0/2 ↔ SW3 Gi0/1  (Trunk)",
        "Je Switch: PC Rot → Fa0/1 (VLAN 100), PC Blau → Fa0/2 (VLAN 110), PC Grün → Fa0/3 (VLAN 120)",
      ],
      hint: "Access-Ports: Fa0/1 = VLAN 100 (Rot), Fa0/2 = VLAN 110 (Blau), Fa0/3 = VLAN 120 (Grün). Bei SW3 (VTP-Client) zuerst den Trunk setzen, auf die VLAN-Synchronisation warten, DANN die Access-Ports zuweisen.",
    },
    steps: [
      {
        title: "Schritt 1 — R1: Grundkonfig, Subinterfaces (RoaS), DHCP-Server",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "hostname R1\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation:
                  "Grundkonfiguration: Hostname, Privileged-Passwort (Hash), kein DNS-Lookup bei Tippfehlern, Console- und VTY-Zugang mit Passwort.",
              },
              {
                cmd: "interface gi0/0\nno ip address\nno shutdown",
                explanation:
                  "Das physische Parent-Interface bekommt KEINE IP, muss aber aktiviert werden — sonst sind alle Subinterfaces down.",
              },
              {
                cmd: "interface gi0/0.1\nencapsulation dot1Q 1 native\nip address 192.168.1.1 255.255.255.0\nexit",
                explanation:
                  "Subinterface für das Management-VLAN 1 als NATIVE VLAN (ungetaggt). 192.168.1.1 ist Gateway des Mgmt-Netzes.",
              },
              {
                cmd: "interface gi0/0.100\nencapsulation dot1Q 100\nip address 10.10.100.1 255.255.255.0\nexit\ninterface gi0/0.110\nencapsulation dot1Q 110\nip address 10.10.110.1 255.255.255.0\nexit\ninterface gi0/0.120\nencapsulation dot1Q 120\nip address 10.10.120.1 255.255.255.0\nexit",
                explanation:
                  "Je ein Subinterface als Gateway pro Daten-VLAN (100 Rot, 110 Blau, 120 Grün). encapsulation dot1Q <id> bindet das Tag, dann die IP.",
              },
              {
                cmd: "ip dhcp excluded-address 192.168.1.1 192.168.1.100\nip dhcp excluded-address 192.168.1.200 192.168.1.255\nip dhcp excluded-address 10.10.100.1 10.10.100.100\nip dhcp excluded-address 10.10.100.200 10.10.100.255\nip dhcp excluded-address 10.10.110.1 10.10.110.100\nip dhcp excluded-address 10.10.110.200 10.10.110.255\nip dhcp excluded-address 10.10.120.1 10.10.120.100\nip dhcp excluded-address 10.10.120.200 10.10.120.255",
                explanation:
                  "Nimmt Gateways, Server- und Reservebereiche aus den Pools heraus. So vergibt DHCP nur den Bereich .101–.199 je Netz.",
              },
              {
                cmd: "ip dhcp pool MGMT\nnetwork 192.168.1.0 255.255.255.0\ndefault-router 192.168.1.1\nexit",
                explanation: "DHCP-Pool für das Management-Netz (VLAN 1).",
              },
              {
                cmd: "ip dhcp pool VLAN100\nnetwork 10.10.100.0 255.255.255.0\ndefault-router 10.10.100.1\nexit\nip dhcp pool VLAN110\nnetwork 10.10.110.0 255.255.255.0\ndefault-router 10.10.110.1\nexit\nip dhcp pool VLAN120\nnetwork 10.10.120.0 255.255.255.0\ndefault-router 10.10.120.1\nexit",
                explanation:
                  "Ein Pool je Daten-VLAN. Das Default-Gateway ist jeweils die Subinterface-IP des Routers — so erreichen die Clients ihr Inter-VLAN-Routing.",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "end\nwrite memory",
                explanation: "Konfiguration speichern.",
              },
              {
                cmd: "show ip interface brief\nshow ip dhcp pool",
                explanation:
                  "Verifikation: alle Subinterfaces up/up; jeder Pool zeigt seinen Bereich und (nach Schritt 5) vergebene Leases.",
              },
            ],
          },
        ],
      },
      {
        title: "Schritt 2 — SW1 (VTP-Server): VLANs, Access-Ports, Trunks, Mgmt-SVI",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "hostname SW1\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation: "Grundkonfiguration wie bei R1.",
              },
              {
                cmd: "vtp mode server\nvtp domain CCNA\nvtp password cisco",
                explanation:
                  "SW1 ist VTP-Server der Domain CCNA und verteilt die VLAN-Datenbank. Domain + Passwort müssen auf allen Switches gleich sein.",
              },
              {
                cmd: "vlan 100\nname Rot\nexit\nvlan 110\nname Blau\nexit\nvlan 120\nname Gruen\nexit",
                explanation:
                  "Die drei Daten-VLANs anlegen. VTP überträgt sie automatisch an SW2 und SW3.",
              },
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 100\nexit\ninterface fa0/2\nswitchport mode access\nswitchport access vlan 110\nexit\ninterface fa0/3\nswitchport mode access\nswitchport access vlan 120\nexit",
                explanation:
                  "Access-Ports den VLANs zuordnen: Fa0/1 → 100 (Rot), Fa0/2 → 110 (Blau), Fa0/3 → 120 (Grün) — passend zu den drei PCs je Switch.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\nexit\ninterface gi0/2\nswitchport mode trunk\nexit",
                explanation: "Gi0/1 = Trunk zum Router (RoaS), Gi0/2 = Trunk zu SW2.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.2 255.255.255.0\nno shutdown\nexit\nip default-gateway 192.168.1.1",
                explanation:
                  "Management-SVI im VLAN 1 + Default-Gateway, damit SW1 fernadministrierbar ist (L2-Switch routet selbst nicht).",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              {
                cmd: "end\nwrite memory",
                explanation: "Speichern.",
              },
              {
                cmd: "show vtp status\nshow vlan brief\nshow interfaces trunk",
                explanation:
                  "Verifikation: VTP-Server, Domain CCNA; VLAN 100/110/120 vorhanden; Gi0/1 und Gi0/2 trunking.",
              },
            ],
          },
        ],
      },
      {
        title: "Schritt 3 — SW2 (VTP-Server): Access-Ports, Trunks, Mgmt-SVI",
        blocks: [
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "hostname SW2\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation: "Grundkonfiguration.",
              },
              {
                cmd: "vtp mode server\nvtp domain CCNA\nvtp password cisco",
                explanation:
                  "Auch SW2 ist Server der Domain CCNA. Die VLANs muss SW2 NICHT selbst anlegen — sie kommen per VTP von SW1 (gleiche Domain, höhere Revision gewinnt).",
              },
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 100\nexit\ninterface fa0/2\nswitchport mode access\nswitchport access vlan 110\nexit\ninterface fa0/3\nswitchport mode access\nswitchport access vlan 120\nexit",
                explanation: "Access-Ports wie auf SW1 zuordnen.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\nexit\ninterface gi0/2\nswitchport mode trunk\nexit",
                explanation: "Gi0/1 = Trunk zu SW1, Gi0/2 = Trunk zu SW3.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.3 255.255.255.0\nno shutdown\nexit\nip default-gateway 192.168.1.1",
                explanation: "Management-SVI + Gateway (192.168.1.3).",
              },
            ],
          },
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "SW2#",
            commands: [
              { cmd: "end\nwrite memory", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Schritt 4 — SW3 (VTP-Client): erst Trunk, VLAN-Sync abwarten, dann Access",
        blocks: [
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              {
                cmd: "hostname SW3\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation: "Grundkonfiguration.",
              },
              {
                cmd: "vtp mode client\nvtp domain CCNA\nvtp password cisco",
                explanation:
                  "SW3 ist VTP-Client und übernimmt die VLAN-Datenbank — kann selbst keine VLANs anlegen.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\nexit",
                explanation:
                  "ZUERST den Trunk setzen! Erst über den Trunk synchronisiert VTP die VLANs zu SW3.",
              },
            ],
          },
          {
            device: "SW3",
            mode: "privileged",
            modeLabel: "SW3#",
            commands: [
              {
                cmd: "show vlan brief",
                explanation:
                  "Warten und prüfen: VLAN 100, 110, 120 MÜSSEN per VTP erschienen sein. Erst dann weiter mit den Access-Ports.",
              },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 100\nexit\ninterface fa0/2\nswitchport mode access\nswitchport access vlan 110\nexit\ninterface fa0/3\nswitchport mode access\nswitchport access vlan 120\nexit",
                explanation: "Jetzt die Access-Ports den (synchronisierten) VLANs zuweisen.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.4 255.255.255.0\nno shutdown\nexit\nip default-gateway 192.168.1.1",
                explanation: "Management-SVI + Gateway (192.168.1.4).",
              },
            ],
          },
          {
            device: "SW3",
            mode: "privileged",
            modeLabel: "SW3#",
            commands: [
              { cmd: "end\nwrite memory", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Schritt 5 — PCs auf DHCP stellen",
        blocks: [
          {
            device: "Alle PCs",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "Jeden PC anklicken → Desktop → IP Configuration → DHCP auswählen",
                explanation:
                  "Erwartete IPs: VLAN 100 (Rot) 10.10.100.101–199, VLAN 110 (Blau) 10.10.110.101–199, VLAN 120 (Grün) 10.10.120.101–199 — Gateway jeweils .1.",
              },
            ],
          },
        ],
      },
      {
        title: "Schritt 6 — Abschlusstest",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip dhcp binding",
                explanation:
                  "Alle 9 PCs sollten mit IP und MAC erscheinen. Danach die Ping-Tests durchführen.",
              },
            ],
          },
          {
            device: "PCs",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "PC Rot SW1 → PC Rot SW3  (gleiches VLAN 100, anderer Switch)",
                explanation: "Muss funktionieren — VTP-Trunks tragen VLAN 100 durchgehend.",
              },
              {
                cmd: "PC Rot → PC Blau  (VLAN 100 → VLAN 110, über R1)",
                explanation: "Muss funktionieren — Inter-VLAN-Routing über die RoaS-Subinterfaces.",
              },
              {
                cmd: "PC Rot SW1 → PC an SW3  (über zwei Trunk-Hops)",
                explanation: "Muss funktionieren — Trunks SW1—SW2—SW3 transportieren alle VLANs.",
              },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip dhcp binding (R1)", expected: "9 Einträge — je PC eine IP aus .101–.199 + MAC" },
      { cmd: "show ip dhcp pool (R1)", expected: "MGMT/VLAN100/110/120 mit vergebenen Leases" },
      { cmd: "show vlan brief (SW3)", expected: "VLAN 100/110/120 per VTP vorhanden (obwohl SW3 Client ist)" },
      { cmd: "show vtp status (alle)", expected: "Domain CCNA, gleiche Configuration Revision auf allen Switches" },
      { cmd: "show interfaces trunk", expected: "Gi0/1/Gi0/2 trunking, VLAN 1/100/110/120 allowed+active" },
      { cmd: "ping VLAN100 → VLAN110", expected: "Erfolgreich (Inter-VLAN über R1-Subinterfaces)" },
    ],
    glossary: [
      { term: "Router-on-a-Stick", def: "Inter-VLAN-Routing über ein physisches Router-Interface, aufgeteilt in Subinterfaces pro VLAN." },
      { term: "Subinterface (gi0/0.X)", def: "Logisches Unter-Interface mit eigenem VLAN-Tag und IP — Default-Gateway eines VLANs." },
      { term: "encapsulation dot1Q <id> native", def: "Bindet das Subinterface an ein VLAN; 'native' = dieses VLAN läuft am Trunk ungetaggt (hier VLAN 1)." },
      { term: "Native VLAN", def: "Das eine VLAN, dessen Frames am Trunk ungetaggt übertragen werden (Standard VLAN 1)." },
      { term: "VTP (Server/Client)", def: "VLAN Trunking Protocol — Server legen VLANs an und verteilen sie; Clients übernehmen sie automatisch." },
      { term: "VTP-Domain", def: "Gemeinsamer Name + Passwort, den alle Switches teilen müssen, damit VTP synchronisiert (hier CCNA)." },
      { term: "ip dhcp excluded-address", def: "Nimmt Adressbereiche aus einem Pool heraus (Gateways, Server, Reserve) — verhindert Konflikte." },
      { term: "ip dhcp pool / default-router", def: "Definiert Adressbereich (network) und das den Clients mitgeteilte Gateway je VLAN." },
      { term: "SVI (interface vlan 1)", def: "Virtuelles Switch-Interface für das Management — gibt dem L2-Switch eine erreichbare IP." },
      { term: "ip default-gateway", def: "Gateway für einen reinen L2-Switch (der selbst nicht routet) — für Fernzugriff aus anderen Netzen." },
      { term: "show ip dhcp binding", def: "Zeigt alle vergebenen Leases: IP ↔ MAC ↔ Ablaufzeit." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // IPv6 Routing — OSPFv3 + EIGRPv6
  // ─────────────────────────────────────────────────────────────
  {
    id: "ipv6-ospfv3-eigrpv6",
    icon: <Globe size={20} />,
    title: "IPv6 Routing — OSPFv3 + EIGRPv6",
    subtitle: "R1/R2/R3 · IPv6 · OSPFv3 · EIGRPv6 · /127 P2P · AD-Koexistenz",
    difficulty: "Fortgeschritten",
    duration: "40 min",
    context: {
      problem:
        "Drei IPv6-Router (R1, R2, R3) bilden ein vollvermaschtes Dreieck. An jedem Router hängt ein LAN-Segment mit einem PC. Das Netz soll mit zwei modernen Routing-Protokollen ausgestattet werden: OSPFv3 auf allen Interfaces (LAN + Backbone) und EIGRPv6 zusätzlich parallel auf den Backbone-Links. Alle PCs müssen sich durchgehend erreichen.",
      purpose:
        "Dieses Lab vermittelt die Konfiguration von OSPFv3 und EIGRPv6 auf reinen IPv6-Routern ohne IPv4-Adressierung. Schwerpunkte: /127-Punkt-zu-Punkt-Adressierung (RFC 6164), Area-Zuweisung direkt am Interface, explizite Router-ID (Pflicht ohne IPv4), passive-interface-Strategie für LAN-Ports, und die automatische Koexistenz von OSPFv3 (AD 110) und EIGRPv6 (AD 90) dank administrativer Distanz — ohne manuelle Redistribution.",
    },
    topology: {
      description:
        "R1, R2 und R3 bilden ein vollvermaschtes Dreieck — jeder Router hat eine direkte Verbindung zu den beiden anderen über dedizierte Backbone-Links. An Gig0/0 hängt an jedem Router genau ein PC in einem eigenen /64-LAN. OSPFv3 läuft auf allen Interfaces (LAN + Backbone). EIGRPv6 wird zusätzlich nur auf den Backbone-Links aktiviert. Da EIGRP (AD 90) eine niedrigere administrative Distanz hat als OSPF (AD 110), übernimmt EIGRP automatisch die Backbone-Routen — ohne manuelle Redistribution.",
      devices: [
        { type: "router", label: "R1 (LAN FDAA::/64)", count: 1 },
        { type: "router", label: "R2 (LAN FDBB::/64)", count: 1 },
        { type: "router", label: "R3 (LAN FDCC::/64)", count: 1 },
        { type: "pc", label: "PC2 (R1 Gig0/0, FDAA::0101/64)", count: 1 },
        { type: "pc", label: "PC1 (R2 Gig0/0, FDBB::0101/64)", count: 1 },
        { type: "pc", label: "PC0 (R3 Gig0/0, FDCC::0101/64)", count: 1 },
      ],
      connections: [
        "R1 Gig0/1 (FD00::2/127) ↔ R2 Gig0/2 (FD00::3/127) — Backbone-Link \"x=2\"",
        "R2 Gig0/1 (FD00::4/127) ↔ R3 Gig0/2 (FD00::5/127) — Backbone-Link \"x=4\"",
        "R1 Gig0/2 (FD00::6/127) ↔ R3 Gig0/1 (FD00::7/127) — Backbone-Link \"x=6\"",
        "R1 Gig0/0 (FDAA::FFFF/64) ↔ PC2 Fa0 (FDAA::0101/64)",
        "R2 Gig0/0 (FDBB::FFFF/64) ↔ PC1 Fa0 (FDBB::0101/64)",
        "R3 Gig0/0 (FDCC::FFFF/64) ↔ PC0 Fa0 (FDCC::0101/64)",
      ],
      hint: "Reihenfolge: 1) IPv6-Routing + Adressierung auf allen Routern. 2) OSPFv3 auf ALLEN Interfaces (LAN + Backbone) mit passive-interface auf Gig0/0. 3) EIGRPv6 zusätzlich auf den Backbone-Links. 4) Nach jedem Schritt Ping zwischen den PCs verifizieren — bei korrekter Konfiguration darf der Ping nie verloren gehen.",
    },
    steps: [
      {
        title: "1) IPv6-Routing global aktivieren (R1/R2/R3 identisch)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ipv6 unicast-routing", explanation: "PFLICHT: Aktiviert IPv6-Forwarding auf dem Router. Ohne diesen Befehl bleibt der Router im reinen Host-Modus und kann keine IPv6-Pakete zwischen Interfaces weiterleiten — egal wie Adressen und Protokolle konfiguriert sind." },
              { cmd: "ipv6 cef", explanation: "Aktiviert Cisco Express Forwarding für IPv6 (Hardware-beschleunigtes Forwarding). Ohne CEF fällt der Router auf langsameres Process-Switching zurück. Sicherstellen dass KEIN 'no ipv6 cef' in der Config steht." },
            ],
          },
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "ipv6 unicast-routing", explanation: "IPv6-Forwarding aktivieren." },
              { cmd: "ipv6 cef", explanation: "IPv6 CEF aktivieren." },
            ],
          },
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              { cmd: "ipv6 unicast-routing", explanation: "IPv6-Forwarding aktivieren." },
              { cmd: "ipv6 cef", explanation: "IPv6 CEF aktivieren." },
            ],
          },
        ],
      },
      {
        title: "2) R1 — Interface-Adressierung (LAN + Backbone)",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nipv6 address FDAA::FFFF/64\nno shutdown\nipv6 ospf 1 area 0", explanation: "LAN-Interface Richtung PC2. Global-Unicast-Adresse als Gateway für LAN FDAA::/64. OSPFv3 direkt am Interface aktivieren und Area 0 zuweisen — kein network-Statement wie bei OSPFv2." },
              { cmd: "interface GigabitEthernet0/1\nipv6 address FD00::2/127\nno shutdown\nipv6 ospf 1 area 0", explanation: "Backbone-Link zu R2 (x=2). /127 belegt genau 2 Adressen (FD00::2 und FD00::3) — Best Practice für P2P-Links (RFC 6164). Beide Enden MÜSSEN im selben /127-Subnetz liegen, sonst schlägt der direkte Ping trotz up/up fehl. OSPFv3 auf dem Backbone-Link, Area 0." },
              { cmd: "interface GigabitEthernet0/2\nipv6 address FD00::6/127\nno shutdown\nipv6 ospf 1 area 0", explanation: "Backbone-Link zu R3 (x=6). Partner-Adresse auf R3 Gig0/1 ist FD00::7/127 — selbes /127-Subnetz. OSPFv3 auf dem Backbone-Link zu R3, Area 0." },
            ],
          },
        ],
      },
      {
        title: "3) R2 — Interface-Adressierung (LAN + Backbone)",
        blocks: [
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nipv6 address FDBB::FFFF/64\nno shutdown\nipv6 ospf 1 area 0", explanation: "LAN-Interface Richtung PC1. Gateway für LAN FDBB::/64. OSPFv3 Area 0 — das LAN-Präfix wird dadurch automatisch in OSPFv3 beworben, keine Redistribution nötig." },
              { cmd: "interface GigabitEthernet0/1\nipv6 address FD00::4/127\nno shutdown\nipv6 ospf 1 area 0", explanation: "Backbone-Link zu R3 (x=4). Partner auf R3 Gig0/2: FD00::5/127 — selbes Subnetz. OSPFv3 Area 0." },
              { cmd: "interface GigabitEthernet0/2\nipv6 address FD00::3/127\nno shutdown\nipv6 ospf 1 area 0", explanation: "Backbone-Link zu R1 (x=2). Partner auf R1 Gig0/1: FD00::2/127 — selbes Subnetz. OSPFv3 Area 0." },
            ],
          },
        ],
      },
      {
        title: "4) R3 — Interface-Adressierung (LAN + Backbone)",
        blocks: [
          {
            device: "R3",
            mode: "interface",
            modeLabel: "R3(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nipv6 address FDCC::FFFF/64\nno shutdown\nipv6 ospf 1 area 0", explanation: "LAN-Interface Richtung PC0. Gateway für LAN FDCC::/64. OSPFv3 Area 0." },
              { cmd: "interface GigabitEthernet0/1\nipv6 address FD00::7/127\nno shutdown\nipv6 ospf 1 area 0", explanation: "Backbone-Link zu R1 (x=6). Partner auf R1 Gig0/2: FD00::6/127 — selbes Subnetz. OSPFv3 Area 0." },
              { cmd: "interface GigabitEthernet0/2\nipv6 address FD00::5/127\nno shutdown\nipv6 ospf 1 area 0", explanation: "Backbone-Link zu R2 (x=4). Partner auf R2 Gig0/1: FD00::4/127 — selbes Subnetz. OSPFv3 Area 0." },
            ],
          },
        ],
      },
      {
        title: "5) OSPFv3-Prozess konfigurieren (R1, R2, R3)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ipv6 router ospf 1", explanation: "Startet den OSPFv3-Prozess. OSPFv3 ist ein eigener Prozess für IPv6 — kann dieselbe oder eine andere Process-ID wie ein eventueller IPv4-OSPF haben." },
              { cmd: "router-id 1.1.1.1", explanation: "ZWINGEND bei reinen IPv6-Routern: OSPFv3 benötigt eine 32-Bit Router-ID in IPv4-Notation. Da kein einziges Interface eine IPv4-Adresse hat, kann der Prozess die ID nicht automatisch ableiten und startet sonst nicht sauber." },
              { cmd: "log-adjacency-changes", explanation: "Protokolliert Nachbarschaftswechsel im Log — sehr nützlich beim Troubleshooting." },
              { cmd: "passive-interface default", explanation: "Setzt ALLE Interfaces auf passiv: keine OSPF-Hello-Pakete werden gesendet. Anschließend werden nur die Backbone-Links gezielt wieder aktiv geschaltet. Hinweis: Gig0/0 bleibt passiv — das LAN-Präfix wird trotzdem über OSPFv3 beworben, weil das Interface der Area 0 zugewiesen ist. passive-interface unterdrückt nur Hellos, nicht die LSA-Werbung." },
              { cmd: "no passive-interface GigabitEthernet0/1", explanation: "Backbone-Link zu R2/R3 wieder aktivieren — hier müssen Hellos laufen damit die OSPFv3-Adjacency aufgebaut wird." },
              { cmd: "no passive-interface GigabitEthernet0/2", explanation: "Zweiten Backbone-Link aktivieren." },
            ],
          },
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "ipv6 router ospf 1", explanation: "OSPFv3-Prozess starten." },
              { cmd: "router-id 2.2.2.2", explanation: "Eindeutige Router-ID für R2. Muss netzwerkweit einmalig sein." },
              { cmd: "log-adjacency-changes", explanation: "Adjacency-Änderungen protokollieren." },
              { cmd: "passive-interface default", explanation: "Alle Interfaces passiv setzen." },
              { cmd: "no passive-interface GigabitEthernet0/1", explanation: "Backbone-Link reaktivieren." },
              { cmd: "no passive-interface GigabitEthernet0/2", explanation: "Zweiten Backbone-Link reaktivieren." },
            ],
          },
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              { cmd: "ipv6 router ospf 1", explanation: "OSPFv3-Prozess starten." },
              { cmd: "router-id 3.3.3.3", explanation: "Eindeutige Router-ID für R3. Muss netzwerkweit einmalig sein." },
              { cmd: "log-adjacency-changes", explanation: "Adjacency-Änderungen protokollieren." },
              { cmd: "passive-interface default", explanation: "Alle Interfaces passiv setzen." },
              { cmd: "no passive-interface GigabitEthernet0/1", explanation: "Backbone-Link reaktivieren." },
              { cmd: "no passive-interface GigabitEthernet0/2", explanation: "Zweiten Backbone-Link reaktivieren." },
            ],
          },
        ],
      },
      {
        title: "6) Verifikation Phase 1 — OSPFv3-Baseline",
        blocks: [
          {
            device: "R1 / R2 / R3",
            mode: "privileged",
            modeLabel: "Router#",
            commands: [
              { cmd: "show ipv6 interface brief", explanation: "Alle Interfaces up/up — kein Interface administratively down." },
              { cmd: "show ipv6 ospf neighbor", explanation: "Beide Backbone-Nachbarn im Zustand FULL/DR oder FULL/BDR — nicht INIT oder EXSTART." },
              { cmd: "show ipv6 route ospf", explanation: "Zwei fremde LAN-Präfixe als 'O' (OSPF intra-area) — z.B. auf R1: FDBB::/64 und FDCC::/64." },
            ],
          },
          {
            device: "PC0 / PC1 / PC2",
            mode: "cli",
            modeLabel: "PC>",
            commands: [
              { cmd: "ping <andere PC-Adresse>", explanation: "Alle drei PCs erreichen sich gegenseitig bevor Phase 2 beginnt." },
            ],
          },
        ],
      },
      {
        title: "7) EIGRPv6 auf Backbone-Interfaces aktivieren (R1/R2/R3)",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1\nipv6 eigrp 1", explanation: "Aktiviert EIGRPv6-Prozess AS 1 auf diesem Interface — ZUSÄTZLICH zu OSPFv3. Beide Protokolle laufen ab jetzt parallel auf demselben physischen Link. Das LAN-Interface (Gig0/0) bekommt KEIN 'ipv6 eigrp 1' — EIGRP wird nur auf dem Backbone benötigt." },
              { cmd: "interface GigabitEthernet0/2\nipv6 eigrp 1", explanation: "EIGRPv6 auch auf dem zweiten Backbone-Link aktivieren." },
            ],
          },
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1\nipv6 eigrp 1", explanation: "EIGRPv6 auf dem Backbone-Link zu R3 aktivieren." },
              { cmd: "interface GigabitEthernet0/2\nipv6 eigrp 1", explanation: "EIGRPv6 auf dem Backbone-Link zu R1 aktivieren." },
            ],
          },
          {
            device: "R3",
            mode: "interface",
            modeLabel: "R3(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1\nipv6 eigrp 1", explanation: "EIGRPv6 auf dem Backbone-Link zu R1 aktivieren." },
              { cmd: "interface GigabitEthernet0/2\nipv6 eigrp 1", explanation: "EIGRPv6 auf dem Backbone-Link zu R2 aktivieren." },
            ],
          },
        ],
      },
      {
        title: "8) EIGRPv6-Prozess konfigurieren (R1, R2, R3)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ipv6 router eigrp 1", explanation: "Startet den EIGRPv6-Prozess mit AS-Nummer 1. Alle Router im selben EIGRP-Verbund MÜSSEN dieselbe AS-Nummer verwenden — sonst bilden sie keine Nachbarschaft." },
              { cmd: "eigrp router-id 1.1.1.1", explanation: "Auch EIGRPv6 benötigt bei reinen IPv6-Routern eine explizite Router-ID (32-Bit, IPv4-Notation), da keine IPv4-Adresse zur automatischen Ableitung existiert." },
              { cmd: "no shutdown", explanation: "PFLICHT: Der EIGRPv6-Prozess startet standardmäßig im Zustand 'shutdown' und muss explizit aktiviert werden. Ohne diesen Befehl baut EIGRP trotz korrekter Interface-Konfiguration keine einzige Nachbarschaft auf — häufigste Fehlerquelle." },
            ],
          },
          {
            device: "R2",
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "ipv6 router eigrp 1", explanation: "EIGRPv6-Prozess AS 1 starten." },
              { cmd: "eigrp router-id 2.2.2.2", explanation: "Eindeutige Router-ID für R2." },
              { cmd: "no shutdown", explanation: "Prozess aktivieren — nicht vergessen!" },
            ],
          },
          {
            device: "R3",
            mode: "global",
            modeLabel: "R3(config)#",
            commands: [
              { cmd: "ipv6 router eigrp 1", explanation: "EIGRPv6-Prozess AS 1 starten." },
              { cmd: "eigrp router-id 3.3.3.3", explanation: "Eindeutige Router-ID für R3." },
              { cmd: "no shutdown", explanation: "Prozess aktivieren — nicht vergessen!" },
            ],
          },
        ],
      },
      {
        title: "9) Verifikation Phase 2 — EIGRPv6 + AD-Koexistenz",
        blocks: [
          {
            device: "R1 / R2 / R3",
            mode: "privileged",
            modeLabel: "Router#",
            commands: [
              { cmd: "show ipv6 eigrp neighbors", explanation: "Beide Backbone-Nachbarn gelistet — Uptime steigt, Q Cnt = 0." },
              { cmd: "show ipv6 route", explanation: "Backbone-Präfixe als 'D' (EIGRP, AD 90). LAN-Präfixe als 'O' (OSPF, AD 110). EIGRP gewinnt auf dem Backbone, OSPF bleibt für die LANs aktiv." },
              { cmd: "show ipv6 protocols", explanation: "Beide Prozesse (OSPFv3, EIGRPv6) aktiv, mit jeweiligen Interface-Zuordnungen." },
            ],
          },
          {
            device: "PC0 / PC1 / PC2",
            mode: "cli",
            modeLabel: "PC>",
            commands: [
              { cmd: "ping <andere PC-Adresse>", explanation: "Alle drei PCs weiterhin erreichbar — Ping darf nie verloren gehen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ipv6 interface brief (R1/R2/R3)", expected: "Alle Interfaces up/up — kein Subnetz-Mismatch auf den /127-Links" },
      { cmd: "show ipv6 ospf neighbor (R1/R2/R3)", expected: "Beide Backbone-Nachbarn im Zustand FULL — auf zwei verschiedenen Interfaces" },
      { cmd: "show ipv6 eigrp neighbors (R1/R2/R3)", expected: "Beide Backbone-Nachbarn als EIGRP-Nachbarn mit steigendem Uptime" },
      { cmd: "show ipv6 route (R1/R2/R3)", expected: "Backbone-Präfix als D (EIGRP) — LAN-Präfixe als O (OSPF) — AD-Hierarchie korrekt" },
      { cmd: "ping PC0 ↔ PC1 ↔ PC2", expected: "Alle PCs erreichen sich gegenseitig — nach Phase 1 UND nach Phase 2" },
    ],
    glossary: [
      { term: "ipv6 unicast-routing", def: "Globaler Pflichtbefehl für IPv6-Forwarding. Ohne ihn bleibt der Router im Host-Modus." },
      { term: "/127-Adressierung", def: "Punkt-zu-Punkt-Subnetz mit genau 2 nutzbaren Adressen (RFC 6164). Beide Enden MÜSSEN im selben /127-Subnetz liegen." },
      { term: "OSPFv3", def: "Link-State-Protokoll für IPv6 (RFC 5340), AD 110. Area-Zuweisung direkt am Interface per 'ipv6 ospf area' — kein network-Statement wie bei OSPFv2." },
      { term: "EIGRPv6", def: "Advanced-Distance-Vector-Protokoll von Cisco für IPv6, AD 90 (intern). Interface-basiert per 'ipv6 eigrp'. Benötigt 'no shutdown' im Prozess." },
      { term: "Router-ID (OSPFv3/EIGRPv6)", def: "32-Bit-Kennung in IPv4-Notation — bei reinen IPv6-Routern ZWINGEND manuell zu setzen." },
      { term: "passive-interface default", def: "Setzt alle Interfaces passiv (keine Hellos). Mit 'no passive-interface' gezielt freigeben. Das LAN-Präfix wird trotzdem beworben — nur Hellos werden unterdrückt." },
      { term: "Administrative Distanz (AD)", def: "Bestimmt welche Route-Quelle gewinnt: Connected=0, EIGRP-intern=90, OSPF=110, EIGRP-extern=170. EIGRP gewinnt automatisch gegen OSPF auf den Backbone-Links." },
      { term: "no shutdown (EIGRPv6)", def: "Der EIGRPv6-Prozess startet im Zustand 'shutdown' — muss explizit aktiviert werden. Häufigstes vergessenes Kommando bei EIGRPv6." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // IPSec Site-to-Site VPN — Hamburg ↔ Bremen
  // ─────────────────────────────────────────────────────────────
  {
    id: "ipsec-s2s-vpn",
    icon: <Shield size={20} />,
    title: "IPSec Site-to-Site VPN: Hamburg ↔ Bremen",
    subtitle: "Hamburg/Bremen · IKE Ph1/Ph2 · ISAKMP · Transform-Set · Crypto Map · AES-256/SHA · PFS G5",
    difficulty: "Fortgeschritten",
    duration: "45 min",
    context: {
      problem:
        "Zwei Firmenstandorte — Hamburg (LAN 192.168.1.0/24) und Bremen (LAN 192.168.2.0/24) — sollen über das öffentliche Internet sicher gekoppelt werden. Das Provider-Backbone (ISP1, Internet1, Internet2, ISP2) routet nur öffentliche Netze und kennt die privaten LANs NICHT — direkter Verkehr PC0 → PC2 schlägt fehl. Ein IPSec Site-to-Site VPN zwischen den WAN-Routern Hamburg (100.0.0.1) und Bremen (200.0.0.1) baut einen verschlüsselten Tunnel über das Internet.",
      purpose:
        "Vermittelt die vollständige IPSec-Site-to-Site-Konfiguration auf Cisco IOS: IKE Phase 1 (ISAKMP-Policy, Pre-Shared Key) und Phase 2 (Transform-Set, Crypto-ACL, Crypto Map) inkl. der beidseitigen Übereinstimmungspflicht der Parameter. Schwerpunkte: spiegelbildliche Crypto-ACLs, Crypto Map aufs Outside-Interface, PFS, die zwei verschiedenen Lifetimes (Phase 1 vs. Phase 2) und die Selektivität der Crypto-ACL (Split Tunneling). Angefasst werden nur Hamburg und Bremen — der Core ist vorkonfiguriert.",
    },
    topology: {
      description:
        "Zwei Standorte über ein Provider-Internet gekoppelt. Links Hamburg: PC0, PC1 und ein DHCP-Server (.11) an SW1, dahinter Router Hamburg (LAN .254 / WAN 100.0.0.1). Rechts Bremen: Router Bremen (LAN .254 / WAN 200.0.0.1) an SW2 mit PC2 und PC3. Dazwischen der vorkonfigurierte Core aus ISP1, Internet1, Internet2 und ISP2 (nur /30-Transfernetze) sowie ein Webserver 47.11.8.15. Über dieses Underlay wird der IPSec-Tunnel Hamburg (100.0.0.1) ↔ Bremen (200.0.0.1) aufgebaut.",
      devices: [
        { type: "PC", label: "PC0/PC1 (LAN Hamburg, an SW1)", count: 2 },
        { type: "Server", label: "DHCP .11 (SW1 Fa0/24)", count: 1 },
        { type: "Switch", label: "SW1 (Hamburg, Uplink Gig0/1)", count: 1 },
        { type: "Router", label: "Hamburg (LAN .254 / WAN 100.0.0.1)", count: 1 },
        { type: "Router", label: "Core: ISP1 / Internet1 / Internet2 / ISP2 (vorkonfiguriert)", count: 4 },
        { type: "Server", label: "Webserver 47.11.8.15 (an Internet2)", count: 1 },
        { type: "Router", label: "Bremen (LAN .254 / WAN 200.0.0.1)", count: 1 },
        { type: "Switch", label: "SW2 (Bremen, Uplink Gig0/2)", count: 1 },
        { type: "PC", label: "PC2/PC3 (LAN Bremen, an SW2)", count: 2 },
      ],
      connections: [
        "Hamburg Gig0/0 .254 ──── SW1 ──── PC0/PC1 + DHCP .11 (LAN 192.168.1.0/24)",
        "Hamburg Gig0/1 100.0.0.1 ──── 100.0.0.0/30 ──── ISP1 Gig0/2 100.0.0.2",
        "ISP1 Gig0/1 2.2.2.1 ──── 2.2.2.0/30 ──── Internet1 Gig0/2 2.2.2.2",
        "Internet1 Gig0/1 1.1.1.1 ──── 1.1.1.0/30 ──── Internet2 Gig0/2 1.1.1.2",
        "Internet1 Gig0/0 3.3.3.1 ──── 3.3.3.0/30 ──── ISP2 Gig0/1 3.3.3.2",
        "Internet2 Gig0/0 47.11.8.1 ──── 47.11.8.0/24 ──── Webserver Fa0 47.11.8.15",
        "ISP2 Gig0/2 200.0.0.2 ──── 200.0.0.0/30 ──── Bremen Gig0/1 200.0.0.1",
        "Bremen Gig0/0 .254 ──── SW2 ──── PC2/PC3 (LAN 192.168.2.0/24)",
        "IPSec-Tunnel: Hamburg 100.0.0.1 ↔ Bremen 200.0.0.1 (über das Provider-Internet)",
      ],
      hint: "Nur Hamburg und Bremen anfassen — der Core ist vorkonfiguriert. Reihenfolge: 1) Underlay-Ping 200.0.0.1 (MUSS klappen). 2) Phase 1: ISAKMP-Policy + PSK. 3) Phase 2: Transform-Set + Crypto-ACL + Crypto Map. 4) Crypto Map aufs WAN-Interface Gig0/1. Der Tunnel baut sich erst bei interessantem Traffic (PC0 → PC2) auf — nicht durch einen Ping vom Router selbst.",
    },
    exhibits: [
      {
        type: "topology",
        devices: [
          { id: "pc0", type: "pc", label: "PC0", x: 40, y: 40 },
          { id: "pc1", type: "pc", label: "PC1", x: 40, y: 130 },
          { id: "dhcp", type: "pc", label: "DHCP .11", x: 40, y: 220 },
          { id: "sw1", type: "switch", label: "SW1", x: 165, y: 130 },
          { id: "hamburg", type: "router", label: "Hamburg", x: 300, y: 130 },
          { id: "isp1", type: "router", label: "ISP1", x: 430, y: 130 },
          { id: "internet1", type: "router", label: "Internet1", x: 560, y: 130 },
          { id: "isp2", type: "router", label: "ISP2", x: 690, y: 130 },
          { id: "bremen", type: "router", label: "Bremen", x: 820, y: 130 },
          { id: "sw2", type: "switch", label: "SW2", x: 950, y: 130 },
          { id: "pc2", type: "pc", label: "PC2", x: 1075, y: 90 },
          { id: "pc3", type: "pc", label: "PC3", x: 1075, y: 175 },
          { id: "internet2", type: "router", label: "Internet2", x: 560, y: 285 },
          { id: "webserver", type: "pc", label: "Webserver .15", x: 415, y: 285 },
        ],
        links: [
          { from: "pc0", to: "sw1" },
          { from: "pc1", to: "sw1" },
          { from: "dhcp", to: "sw1", labelTo: "Fa0/24" },
          { from: "sw1", to: "hamburg", subnet: "192.168.1.0/24", labelTo: "G0/0 .254" },
          { from: "hamburg", to: "isp1", subnet: "100.0.0.0/30", labelFrom: "G0/1 .1", labelTo: "G0/2 .2" },
          { from: "isp1", to: "internet1", subnet: "2.2.2.0/30", labelFrom: "G0/1 .1", labelTo: "G0/2 .2" },
          { from: "internet1", to: "isp2", subnet: "3.3.3.0/30", labelFrom: "G0/0 .1", labelTo: "G0/1 .2" },
          { from: "isp2", to: "bremen", subnet: "200.0.0.0/30", labelFrom: "G0/2 .2", labelTo: "G0/1 .1" },
          { from: "bremen", to: "sw2", subnet: "192.168.2.0/24", labelFrom: "G0/0 .254" },
          { from: "sw2", to: "pc2" },
          { from: "sw2", to: "pc3" },
          { from: "internet1", to: "internet2", subnet: "1.1.1.0/30", labelFrom: "G0/1 .1", labelTo: "G0/2 .2" },
          { from: "internet2", to: "webserver", subnet: "47.11.8.0/24", labelFrom: "G0/0 .1", labelTo: "Fa0 .15" },
        ],
        labels: [
          { text: "◄═══ IPSec-Tunnel: Hamburg 100.0.0.1 ↔ Bremen 200.0.0.1 ═══►", attachTo: "internet1", position: "above" },
        ],
      },
      {
        type: "table",
        headers: ["Gerät", "Interface", "IP-Adresse", "Netz", "Gegenstelle"],
        rows: [
          ["Hamburg", "Gig0/0", "192.168.1.254/24", "192.168.1.0/24", "SW1 Gig0/1"],
          ["Hamburg", "Gig0/1", "100.0.0.1/30", "100.0.0.0/30", "ISP1 Gig0/2"],
          ["ISP1", "Gig0/2", "100.0.0.2/30", "100.0.0.0/30", "Hamburg Gig0/1"],
          ["ISP1", "Gig0/1", "2.2.2.1/30", "2.2.2.0/30", "Internet1 Gig0/2"],
          ["Internet1", "Gig0/2", "2.2.2.2/30", "2.2.2.0/30", "ISP1 Gig0/1"],
          ["Internet1", "Gig0/1", "1.1.1.1/30", "1.1.1.0/30", "Internet2 Gig0/2"],
          ["Internet1", "Gig0/0", "3.3.3.1/30", "3.3.3.0/30", "ISP2 Gig0/1"],
          ["Internet2", "Gig0/2", "1.1.1.2/30", "1.1.1.0/30", "Internet1 Gig0/1"],
          ["Internet2", "Gig0/0", "47.11.8.1/24", "47.11.8.0/24", "Webserver"],
          ["Webserver", "Fa0", "47.11.8.15/24", "47.11.8.0/24", "Internet2 Gig0/0"],
          ["ISP2", "Gig0/1", "3.3.3.2/30", "3.3.3.0/30", "Internet1 Gig0/0"],
          ["ISP2", "Gig0/2", "200.0.0.2/30", "200.0.0.0/30", "Bremen Gig0/1"],
          ["Bremen", "Gig0/1", "200.0.0.1/30", "200.0.0.0/30", "ISP2 Gig0/2"],
          ["Bremen", "Gig0/0", "192.168.2.254/24", "192.168.2.0/24", "SW2 Gig0/2"],
        ],
      },
      {
        type: "cli",
        content: `Hamburg# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id slot status
200.0.0.1       100.0.0.1       QM_IDLE           1001    0 ACTIVE

Hamburg# show crypto ipsec sa
interface: GigabitEthernet0/1
    Crypto map tag: IPSEC-MAP, local addr 100.0.0.1

   local  ident (addr/mask/prot/port): (192.168.1.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (192.168.2.0/255.255.255.0/0/0)
   current_peer 200.0.0.1 port 500
    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4
    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4`,
        highlight: [
          "200.0.0.1       100.0.0.1       QM_IDLE           1001    0 ACTIVE",
          "    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4",
          "    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4",
        ],
      },
    ],
    steps: [
      {
        title: "1) Underlay prüfen (Hamburg) — VPN braucht eine funktionierende IP-Verbindung",
        blocks: [
          {
            device: "Hamburg",
            mode: "privileged",
            modeLabel: "Hamburg#",
            commands: [
              { cmd: "ping 200.0.0.1", explanation: "Erreichbarkeit der Bremen-WAN-Adresse über das Provider-Underlay prüfen. MUSS erfolgreich sein — IPSec setzt eine funktionierende IP-Verbindung zwischen den beiden WAN-Peers voraus. Schlägt dieser Ping fehl, ist das Routing kaputt und kein Tunnel hilft." },
              { cmd: "show ip interface brief", explanation: "Kontrolle, dass Gig0/0 (LAN 192.168.1.254) und Gig0/1 (WAN 100.0.0.1) up/up sind." },
              { cmd: "show ip route", explanation: "Die Default-Route 0.0.0.0/0 Richtung ISP1 (100.0.0.2) muss vorhanden sein. Das ferne LAN 192.168.2.0/24 taucht hier NICHT auf — der Core kennt es nicht. Genau deshalb der Tunnel." },
            ],
          },
        ],
      },
      {
        title: "2) IKE Phase 1 — ISAKMP-Policy (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "isakmp",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "crypto isakmp policy 10", explanation: "Legt ISAKMP/IKE-Phase-1-Policy Nr. 10 an (niedrigere Nummer = höhere Priorität). Diese Policy handelt aus, WIE der sichere Management-Kanal (IKE-SA) aufgebaut wird." },
              { cmd: "encryption aes 256", explanation: "Verschlüsselung des IKE-Kanals mit AES-256. Muss auf beiden Peers identisch sein, sonst scheitert Phase 1." },
              { cmd: "hash sha", explanation: "Integritätsschutz per SHA-1 (HMAC). Beidseitig identisch." },
              { cmd: "authentication pre-share", explanation: "Peer-Authentisierung über Pre-Shared Key (statt Zertifikate). Bestimmt, dass im nächsten Schritt ein PSK definiert wird." },
              { cmd: "group 5", explanation: "Diffie-Hellman-Gruppe 5 (1536 Bit) für den Schlüsselaustausch. DH erzeugt ein gemeinsames Geheimnis, ohne es je über die Leitung zu schicken. Muss beidseitig gleich sein." },
              { cmd: "lifetime 86400", explanation: "Gültigkeitsdauer der IKE-SA (Phase 1) in Sekunden = 24 h. NICHT verwechseln mit der Phase-2-Lifetime in der Crypto Map." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
            ],
          },
        ],
      },
      {
        title: "3) Pre-Shared Key (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "global",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "crypto isakmp key ganzganzganzgeheim! address 200.0.0.1", explanation: "PSK an die PEER-IP (Bremen WAN 200.0.0.1) binden — nicht an ein Interface. Der Schlüssel inkl. Ausrufezeichen muss auf beiden Seiten ZEICHENGENAU identisch sein, sonst schlägt die Phase-1-Authentisierung fehl." },
            ],
          },
        ],
      },
      {
        title: "4) IKE Phase 2 — Transform-Set (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "global",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "crypto ipsec transform-set HH-HB esp-aes 256 esp-sha-hmac", explanation: "Definiert den Phase-2-Schutz für die Nutzdaten: ESP mit AES-256 (Vertraulichkeit) + SHA-HMAC (Integrität). Der NAME (HH-HB) ist lokal frei wählbar und muss NICHT mit Bremen übereinstimmen — die PARAMETER (esp-aes 256, esp-sha-hmac) aber schon. Bindestrich statt '->' verwenden (Packet-Tracer-kompatibel)." },
            ],
          },
        ],
      },
      {
        title: "5) Crypto-ACL — interesting traffic (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "global",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "access-list 100 permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255", explanation: "Definiert, WELCHER Verkehr in den Tunnel soll — hier LAN Hamburg → LAN Bremen. permit = verschlüsseln. Alles andere (z. B. Richtung Webserver/Internet) bleibt unverschlüsselt. Alternativ als benannte ACL (ip access-list extended VPN-TRAFFIC) — funktional identisch, in der Praxis lesbarer; die nummerierte Variante bleibt hier die Referenz." },
            ],
          },
        ],
      },
      {
        title: "6) Crypto Map — alle Bausteine zusammenführen (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "crypto-map",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "crypto map IPSEC-MAP 10 ipsec-isakmp", explanation: "Legt die Crypto Map an, die Peer + Transform-Set + ACL verbindet. 'ipsec-isakmp' = SAs dynamisch per IKE aushandeln. Beim Anlegen erscheint die NOTE 'This new crypto map will remain disabled until a peer and a valid access list have been configured.' — das ist KEIN Fehler; sie verschwindet, sobald peer + match address gesetzt sind." },
              { cmd: "set peer 200.0.0.1", explanation: "VPN-Gegenstelle = Bremen WAN 200.0.0.1." },
              { cmd: "set pfs group5", explanation: "Perfect Forward Secrecy mit DH-Gruppe 5: erzeugt für Phase 2 frisches Schlüsselmaterial, unabhängig von Phase 1. Schreibweise OHNE Leerzeichen: 'group5', nicht 'group 5'. Muss beidseitig gleich sein." },
              { cmd: "set security-association lifetime seconds 86400", explanation: "Phase-2-Lebensdauer der IPSec-SA (Default wäre 3600 s). Das Schlüsselwort 'seconds' ist PFLICHT, sonst Syntaxfehler; Maximum 86400 s. Nicht verwechseln mit der ISAKMP-'lifetime' aus Step 2 (Phase 1)." },
              { cmd: "set transform-set HH-HB", explanation: "Verknüpft den in Step 4 definierten Phase-2-Schutz mit dieser Crypto Map." },
              { cmd: "match address 100", explanation: "Verknüpft die Crypto-ACL 100 (Step 5): nur dieser Traffic wird verschlüsselt. Ab jetzt ist die Map vollständig und die NOTE-Warnung gegenstandslos." },
              { cmd: "exit", explanation: "Zurück in den globalen Modus." },
            ],
          },
        ],
      },
      {
        title: "7) Crypto Map aufs WAN-Interface (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "interface",
            modeLabel: "Hamburg(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "Das WAN-/Outside-Interface Richtung ISP1 (100.0.0.1) — hier tritt der zu schützende Verkehr aus. NICHT das LAN-Interface." },
              { cmd: "crypto map IPSEC-MAP", explanation: "Aktiviert die Crypto Map auf dem Interface. Erst JETZT wird IPSec scharf. Erwartete Konsolenmeldung: %CRYPTO-6-ISAKMP_ON_OFF: ISAKMP is ON. Pro Interface ist nur EINE Crypto Map möglich." },
              { cmd: "exit", explanation: "Konfiguration Hamburg abgeschlossen." },
            ],
          },
        ],
      },
      {
        title: "8) Spiegelbildliche Konfiguration auf Bremen (vollständig)",
        blocks: [
          {
            device: "Bremen",
            mode: "isakmp",
            modeLabel: "Bremen(config)#",
            commands: [
              { cmd: "crypto isakmp policy 10", explanation: "Identische Phase-1-Policy wie Hamburg — die Parameter MÜSSEN matchen." },
              { cmd: "encryption aes 256", explanation: "AES-256, wie Hamburg." },
              { cmd: "hash sha", explanation: "SHA, wie Hamburg." },
              { cmd: "authentication pre-share", explanation: "Pre-Shared Key, wie Hamburg." },
              { cmd: "group 5", explanation: "DH-Gruppe 5, wie Hamburg." },
              { cmd: "lifetime 86400", explanation: "Phase-1-Lifetime 86400 s, wie Hamburg." },
              { cmd: "exit", explanation: "Zurück in den globalen Modus." },
            ],
          },
          {
            device: "Bremen",
            mode: "global",
            modeLabel: "Bremen(config)#",
            commands: [
              { cmd: "crypto isakmp key ganzganzganzgeheim! address 100.0.0.1", explanation: "GLEICHER Schlüssel wie Hamburg, aber gebunden an die PEER-IP Hamburg (100.0.0.1). Nur die Adresse ist spiegelverkehrt, der Key selbst ist identisch." },
              { cmd: "crypto ipsec transform-set HB-HH esp-aes 256 esp-sha-hmac", explanation: "Lokaler Name HB-HH (darf sich von Hamburgs HH-HB unterscheiden) — die Parameter esp-aes 256 + esp-sha-hmac sind identisch. Genau das ist entscheidend, nicht der Name." },
              { cmd: "access-list 100 permit ip 192.168.2.0 0.0.0.255 192.168.1.0 0.0.0.255", explanation: "SPIEGELBILDLICH zu Hamburg: Source = LAN Bremen, Destination = LAN Hamburg. Werden Source/Destination nicht korrekt vertauscht, gibt es einen Proxy-ID-Mismatch und Phase 2 kommt nicht hoch." },
            ],
          },
          {
            device: "Bremen",
            mode: "crypto-map",
            modeLabel: "Bremen(config)#",
            commands: [
              { cmd: "crypto map IPSEC-MAP 10 ipsec-isakmp", explanation: "Wie Hamburg — dieselbe NOTE-Warnung, bis peer + match address gesetzt sind." },
              { cmd: "set peer 100.0.0.1", explanation: "Gegenstelle = Hamburg WAN 100.0.0.1." },
              { cmd: "set pfs group5", explanation: "PFS Gruppe 5, wie Hamburg (Schreibweise group5)." },
              { cmd: "set security-association lifetime seconds 86400", explanation: "Phase-2-Lifetime 86400 s, wie Hamburg." },
              { cmd: "set transform-set HB-HH", explanation: "Lokales Transform-Set HB-HH verknüpfen." },
              { cmd: "match address 100", explanation: "Crypto-ACL 100 (Bremen → Hamburg) verknüpfen." },
              { cmd: "exit", explanation: "Zurück in den globalen Modus." },
            ],
          },
          {
            device: "Bremen",
            mode: "interface",
            modeLabel: "Bremen(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "WAN-/Outside-Interface Richtung ISP2 (200.0.0.1)." },
              { cmd: "crypto map IPSEC-MAP", explanation: "Crypto Map aktivieren → ISAKMP is ON. Konfiguration Bremen abgeschlossen." },
              { cmd: "exit", explanation: "Fertig." },
            ],
          },
        ],
      },
      {
        title: "9) Tunnel aufbauen und verifizieren",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC>",
            commands: [
              { cmd: "ping 192.168.2.10", explanation: "Interessanten Traffic erzeugen (LAN Hamburg → LAN Bremen), damit der Tunnel überhaupt aufgebaut wird. Der erste Ping kann verloren gehen, während IKE Phase 1+2 aushandelt — danach läuft es." },
            ],
          },
          {
            device: "Hamburg",
            mode: "privileged",
            modeLabel: "Hamburg#",
            commands: [
              { cmd: "show crypto isakmp sa", explanation: "Phase 1 prüfen: Zustand QM_IDLE + status ACTIVE = IKE-SA steht (Quick Mode idle). Ohne QM_IDLE ist Phase 1 nicht fertig — dann PSK/Policy prüfen." },
              { cmd: "show crypto ipsec sa", explanation: "Phase 2 prüfen: die Zähler #pkts encaps/encrypt und #pkts decaps/decrypt müssen auf BEIDEN Seiten steigen. Steigt nur encaps, decaps bleibt 0 → die Gegenseite antwortet nicht (ACL/Routing/Peer prüfen)." },
              { cmd: "show crypto map", explanation: "Zeigt Peer, Transform-Set, match address und das Interface-Binding — schnelle Gesamtübersicht der VPN-Konfiguration." },
            ],
          },
        ],
      },
      {
        title: "10) Gegenprobe — Selektivität der Crypto-ACL (Split Tunneling)",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC>",
            commands: [
              { cmd: "ping 47.11.8.15", explanation: "Ping zum Webserver im Internet. Dieser Verkehr wird von der Crypto-ACL 100 NICHT erfasst (Ziel ist nicht 192.168.2.0/24) → er läuft unverschlüsselt am Tunnel vorbei." },
            ],
          },
          {
            device: "Hamburg",
            mode: "privileged",
            modeLabel: "Hamburg#",
            commands: [
              { cmd: "show crypto ipsec sa", explanation: "Gegenprobe: der #pkts encaps-Zähler steigt bei diesem Webserver-Ping NICHT — Beweis, dass nur ACL-gematchter Traffic in den Tunnel geht (Split Tunneling / Selektivität der Crypto-ACL)." },
            ],
          },
        ],
      },
      {
        title: "11) Häufige Fehler & Troubleshooting",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ACLs spiegelbildlich halten", explanation: "Source/Destination auf der Gegenseite vertauschen — sonst Proxy-ID-Mismatch, Phase 2 kommt nicht hoch." },
              { cmd: "Transform-Set: Name lokal, Parameter global", explanation: "Der Name muss NICHT identisch sein, die Parameter (esp-aes 256 + esp-sha-hmac) auf beiden Seiten schon." },
              { cmd: "Keine Sonderzeichen im Namen", explanation: "'HH->HB' funktioniert in Packet Tracer nicht zuverlässig → 'HH-HB' verwenden." },
              { cmd: "set security-association lifetime seconds 86400", explanation: "Das Schlüsselwort 'seconds' (bzw. 'kilobytes') ist Pflicht, sonst Syntaxfehler. Maximum 86400 s." },
              { cmd: "set pfs group5 (ohne Leerzeichen)", explanation: "'group5', nicht 'group 5'. Im crypto-map-Modus hilft 'set pfs ?' bei der richtigen Schreibweise." },
              { cmd: "Zwei Lifetimes nicht verwechseln", explanation: "'lifetime' in der ISAKMP-Policy = Phase 1 (Default 86400 s); 'set security-association lifetime' in der Crypto Map = Phase 2 (Default 3600 s)." },
              { cmd: "PSK zeichengenau + an Peer-IP", explanation: "Muss exakt übereinstimmen, inkl. Ausrufezeichen. Der PSK ist an die Peer-IP gebunden, nicht ans Interface." },
              { cmd: "Crypto Map aufs WAN-Interface", explanation: "Gehört aufs Outside-/WAN-Interface, nicht aufs LAN. Pro Interface nur EINE Crypto Map." },
              { cmd: "DH-Group + Encryption müssen matchen", explanation: "Group 5 (1536 Bit) und AES-256 auf beiden Seiten identisch." },
              { cmd: "Tunnel braucht interessanten Traffic", explanation: "Ein Ping vom Router selbst (Source = WAN-IP) matcht die ACL nicht → immer von PC0 zu PC2 pingen bzw. 'ping 192.168.2.10 source 192.168.1.254'." },
              { cmd: "NAT/PAT vor VPN ausnehmen", explanation: "Falls NAT aktiv ist: in der NAT-ACL 'deny ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255' VOR den Overload-Eintrag setzen, sonst wird übersetzt und matcht die Crypto-ACL nicht mehr (optionaler Advanced-Step)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show crypto isakmp sa (Hamburg & Bremen)", expected: "Zustand QM_IDLE, status ACTIVE — IKE-SA (Phase 1) steht auf beiden Seiten" },
      { cmd: "show crypto ipsec sa (Hamburg & Bremen)", expected: "#pkts encaps UND #pkts decaps steigen beidseitig — Phase 2 verschlüsselt bidirektional" },
      { cmd: "show crypto map (Hamburg & Bremen)", expected: "Peer, transform-set, match address 100 und Interface-Binding korrekt angezeigt" },
      { cmd: "ping PC0 → PC2 (192.168.2.x)", expected: "Erfolgreich — LAN-zu-LAN läuft durch den Tunnel (erster Ping ggf. verloren, während IKE aushandelt)" },
      { cmd: "ping PC0 → Webserver 47.11.8.15", expected: "Erfolgreich, aber encaps-Zähler steigt NICHT — Traffic läuft unverschlüsselt (Split Tunneling)" },
    ],
    glossary: [
      { term: "ISAKMP / IKE", def: "Internet Security Association and Key Management Protocol — das Aushandlungsprotokoll (IKE) für IPSec. Läuft über UDP 500." },
      { term: "IKE Phase 1", def: "Baut den sicheren Management-Kanal (IKE-SA) zwischen den Peers auf: ISAKMP-Policy (Encryption/Hash/DH/Auth/Lifetime) + Peer-Authentisierung (PSK). Ergebnis: Zustand QM_IDLE." },
      { term: "IKE Phase 2 (Quick Mode)", def: "Handelt unter dem Schutz von Phase 1 die IPSec-SAs für die eigentlichen Nutzdaten aus: Transform-Set + Crypto-ACL + PFS." },
      { term: "QM_IDLE", def: "Zustand in 'show crypto isakmp sa': Quick Mode idle = Phase 1 steht, IKE-SA aufgebaut und bereit. Nur mit QM_IDLE + ACTIVE ist die Basis für Phase 2 gelegt." },
      { term: "ESP", def: "Encapsulating Security Payload (IP-Protokoll 50): verschlüsselt UND authentifiziert die Nutzdaten. Für Vertraulichkeit immer ESP (nicht AH)." },
      { term: "AH", def: "Authentication Header (IP-Protokoll 51): authentifiziert nur, verschlüsselt NICHT — daher für Vertraulichkeit ungeeignet." },
      { term: "Transform-Set", def: "Definiert den Phase-2-Schutz (z. B. esp-aes 256 esp-sha-hmac). Name lokal frei, Parameter müssen beidseitig gleich sein." },
      { term: "Crypto-ACL (interesting traffic)", def: "permit-ACL, die festlegt, welcher Verkehr verschlüsselt wird. Muss auf beiden Peers spiegelbildlich sein (Source/Destination vertauscht)." },
      { term: "Crypto Map", def: "Bindet Peer + Transform-Set + Crypto-ACL + PFS/Lifetime zusammen und wird aufs WAN-/Outside-Interface gelegt. Pro Interface nur eine." },
      { term: "PFS (set pfs group5)", def: "Perfect Forward Secrecy: erzeugt für Phase 2 frisches DH-Schlüsselmaterial, unabhängig von Phase 1. Schreibweise 'group5' ohne Leerzeichen." },
      { term: "Pre-Shared Key (PSK)", def: "Gemeinsames Geheimnis zur Peer-Authentisierung, an die Peer-IP gebunden. Muss zeichengenau (inkl. Sonderzeichen) beidseitig gleich sein." },
      { term: "Zwei Lifetimes", def: "'lifetime' in der ISAKMP-Policy = Phase 1 (Default 86400 s); 'set security-association lifetime seconds' in der Crypto Map = Phase 2 (Default 3600 s). Nicht verwechseln." },
    ],
  },
];

// ── Didaktisch-kognitive Lernreihenfolge ─────────────────────
// Prinzip (Sweller / Bloom): Fundament → Werkzeug → L2 → L3 → Dienste → Security → Wireless → Automation → Betrieb
// Voraussetzungskette beachtet: z.B. STP vor EtherChannel, Static vor OSPF, SSH früh als Admin-Werkzeug.
const LAB_ORDER: string[] = [
  // ── Drills: Muskelgedächtnis für Grundbefehle ────────────
  "drill-grundkonfig",    // Hostname/Secret/Console/VTY — Voraussetzung für jedes weitere Lab
  "drill-interfaces",     // ip address + no shutdown — Voraussetzung für IP-Konfiguration
  "drill-pc-ips",         // statische IPs vergeben
  "drill-access-ports",   // interface range + mode access — Voraussetzung für VLAN-Labs

  // ── Layer 2 + IP-Grundlagen ───────────────────────────────
  "basic-ip",             // erste vollständige Ende-zu-Ende-Topologie
  "ssh",                  // Admin-Werkzeug: früh lernen, in JEDEM weiteren Lab nutzbar
  "vlan-trunking",        // VLANs + 802.1Q-Trunks — Voraussetzung für STP/EtherChannel/RoaS
  "stp",                  // STP MUSS vor EtherChannel: EC wurde erfunden, um STP-Blocking zu umgehen
  "vtp-dtp",              // VTP/DTP setzt VLAN + Trunk + STP-Verständnis voraus
  "etherchannel",         // Link-Aggregation als STP-Alternative (erst nach STP verständlich)

  // ── IP-Dienste (Grundlage vor Routing-Szenarien) ──────────
  "dhcp",                 // DHCP früh: PCs in den meisten Labs per DHCP, nicht statisch

  // ── Layer 3: Routing (konkret → abstrakt) ─────────────────
  "static-routing",       // statische Routen — konkretester Einstieg in L3
  "floating-static",      // Erweiterung: Backup-Route mit AD
  "roas",                 // Inter-VLAN via Router — braucht VLANs + Routing
  "ivr-svi",              // Inter-VLAN via L3-Switch — Alternative zu RoaS
  "rip-v1",               // historische Baseline (classful, Grenzen zeigen)
  "rip-v2",               // classless RIP mit version 2 + no auto-summary
  "rip-v2-passive",       // 4-Router-Variante, passive-interface, Metrik-Analyse
  "ospf",                 // OSPF Single Area — wichtigstes Protokoll im CCNA
  "ospf-rid-wildcard",    // Loopback-RID, Wildcard-Drill
  "ospf-dr-bdr-election", // DR/BDR auf Multi-Access (setzt OSPF-Grundverständnis voraus)
  "ospf-multiarea",       // Multi-Area, ABR, LSA-Typen
  "eigrp",                // Advanced Distance-Vector, DUAL (nach OSPF gut vergleichbar)

  // ── IPv6 (nach IPv4-Routing beherrscht) ───────────────────
  "ipv6",                 // IPv6-Grundkonfiguration
  "ipv6-static",          // Statische IPv6-Routen
  "ospfv3-ipv6",          // OSPFv3 — analoge Konzepte zu OSPFv2

  // ── IP-Dienste Advanced ────────────────────────────────────
  "dhcp-relay",           // ip helper-address — braucht VLAN + Routing-Verständnis
  "nat-pat",              // PAT/Overload — braucht Routing-Grundverständnis
  "dynamic-nat",          // NAT-Pool — Variante zu PAT
  "nat-pool-overload",    // NAT-Pool + Overload — Pool mit PAT kombiniert (200.0.0.0/29)
  "static-nat",           // 1:1 Static NAT — feste Zuordnung, eingehende Verbindungen möglich
  "vlan-dhcp-nat-roas",   // Campus-Integration: VLAN + VTP + DTP + RoaS + DHCP + PAT
  "ntp-syslog-snmp",      // Management-Protokolle
  "hsrp",                 // FHRP — braucht Routing + Redundanz-Konzept
  "gre-tunnel",           // Site-to-Site VPN über Internet
  "ipsec-s2s-vpn",        // Verschlüsselter Site-to-Site VPN (IKE/IPSec) — Fortsetzung von GRE

  // ── Security: einfach → komplex ───────────────────────────
  "device-hardening",     // Banner, Password-Policy, Login-Block
  "port-security",        // MAC-Begrenzung auf Access-Ports
  "acl-standard",         // Standard-ACL (nur Quelle)
  "acl-extended",         // Extended ACL (Proto/Quelle/Ziel/Port)
  "dhcp-snooping-dai",    // Anti-Spoofing-Trio (braucht DHCP + VLAN)
  "stp-hardening",        // Root Guard, BPDU Guard, Loop Guard
  "vlan-hopping",         // VLAN-Hopping + Mitigation (setzt VLAN/STP voraus)
  "aaa-radius-tacacs",    // Zentrales AAA (fortgeschrittene Security)
  "zbfw",                 // Zone-Based Firewall (komplexeste Security)
  "co-acl-nat-isp",       // ACL + Static NAT Dual-Site (CO-1 EIGRP, CO-2 OSPF, ISP-MUMBAI)

  // ── Wireless ──────────────────────────────────────────────
  "wlc-onboarding",       // WLC + AP + CAPWAP + WPA3

  // ── Automatisierung & Monitoring ──────────────────────────
  "netflow",              // Traffic-Analyse
  "restconf",             // REST API mit HTTPS/JSON
  "netconf-yang",         // NETCONF über SSH

  // ── Betrieb & Troubleshooting (Konsolidierung am Ende) ────
  "password-recovery",    // ROMMON/Boot-Loader — Notfallprozedur
  "ios-backup-upgrade",   // TFTP-Backup + IOS-Upgrade
  "layer1-issues",        // CRC, Duplex-Mismatch, Interface-Counter
  "troubleshooting-cheat",
  "dhcp-troubleshoot-lab",
  "vlan-vtp-dhcp-campus", // Umfassendes Campus-Szenario (integriert L2+L3+DHCP)
];

/** Labs in didaktisch begründeter Reihenfolge. Nicht gefundene IDs werden ans Ende gesetzt. */
export const LABS_ORDERED: LabScenario[] = [
  ...LAB_ORDER.map((id) => LABS.find((l) => l.id === id)).filter(
    (l): l is LabScenario => l !== undefined,
  ),
  ...LABS.filter((l) => !LAB_ORDER.includes(l.id)),
];

// ── Hilfsfunktionen ───────────────────────────────────────────

function difficultyColor(d: LabScenario["difficulty"]) {
  if (d === "Drill") return "text-cyan-400 bg-cyan-400/10";
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

  // Kontext
  if (lab.context) {
    out += `WORUM GEHT ES?\n${line}\n`;
    out += `Problem: ${lab.context.problem}\n`;
    out += `Zweck:   ${lab.context.purpose}\n\n`;
  }

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

  // Glossar
  if (lab.glossary && lab.glossary.length > 0) {
    out += `④ GLOSSAR\n${line}\n`;
    lab.glossary.forEach((g) => {
      out += `  ${g.term} — ${g.def}\n`;
    });
    out += `\n`;
  }

  out += `${sep}\nGeneriert von ccna.ajti.online – ${new Date().toLocaleDateString("de-DE")}\n${sep}\n`;
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
    <span class="badge ${lab.difficulty === 'Anfänger' || lab.difficulty === 'Drill' ? 'badge-easy' : lab.difficulty === 'Mittel' ? 'badge-medium' : 'badge-hard'}">${lab.difficulty}</span>
    ${lab.subtitle} &nbsp;|&nbsp; ⏱ ${lab.duration}
  </div>

  ${lab.context ? `
  <div class="section topology-box" style="border-color:#c7d2fe;background:#eef2ff">
    <strong>Worum geht es?</strong><br/>
    <span style="font-size:10px;color:#374151"><strong>Problem:</strong> ${lab.context.problem}</span><br/>
    <span style="font-size:10px;color:#374151"><strong>Zweck:</strong> ${lab.context.purpose}</span>
  </div>` : ""}

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

  ${lab.glossary && lab.glossary.length > 0 ? `
  <div class="section">
    <strong>④ Glossar — Begriffe in diesem Lab</strong>
    ${lab.glossary.map(g => `<div style="font-size:10px;margin-top:3px"><strong style="font-family:monospace">${g.term}</strong> — ${g.def}</div>`).join("")}
  </div>` : ""}

  <div class="footer">ccna.ajti.online &mdash; ${new Date().toLocaleDateString("de-DE")} &mdash; ${lab.title}</div>

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
}

export function LabScenariosDialog({ open, onClose }: LabScenariosDialogProps) {
  const [selectedId, setSelectedId] = useState(LABS_ORDERED[0].id);
  const lab = LABS_ORDERED.find((l) => l.id === selectedId) ?? LABS_ORDERED[0];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          // Bewusst immer dunkel (Terminal-Konvention): das gesamte Innenleben
          // ist auf slate-800/900/950 gebaut und in einem hellen Shell unlesbar.
          "flex flex-col w-full max-w-6xl h-[90vh] rounded-2xl border shadow-2xl overflow-hidden",
          "bg-slate-900 border-slate-700",
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
            <button
              onClick={() => exportLabForPacketTracer(lab)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
              title="Packet-Tracer-Export: ZIP mit IOS-Konfigs pro Gerät + Aufbau-Anleitung"
            >
              <Package size={15} />
              PT-Export
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
            {LABS_ORDERED.map((l) => (
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

              {/* ── Kontext: Warum dieses Lab? ── */}
              {lab.context && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-indigo-300 text-sm font-bold">Worum geht es in diesem Lab?</span>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div>
                      <span className="text-indigo-400 font-semibold">Problem: </span>
                      <span className="text-slate-300">{lab.context.problem}</span>
                    </div>
                    <div>
                      <span className="text-indigo-400 font-semibold">Zweck: </span>
                      <span className="text-slate-300">{lab.context.purpose}</span>
                    </div>
                  </div>
                </div>
              )}

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

                {/* Optionales visuelles Topologie-Diagramm */}
                {lab.topology.topologyDiagram && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-700/50">
                    {lab.topology.topologyDiagram}
                  </div>
                )}

                {/* Strukturierte Exhibits (Topologie / Adressplan / erwartete CLI-Ausgabe) */}
                {lab.exhibits && lab.exhibits.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {lab.exhibits.map((ex, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-slate-700/50">
                        <ExhibitRenderer exhibit={ex} />
                      </div>
                    ))}
                  </div>
                )}
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

              {/* ── Glossar ── */}
              {lab.glossary && lab.glossary.length > 0 && (
                <div className="rounded-xl border border-slate-600/40 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-slate-300 text-sm font-bold">④ Glossar — Begriffe in diesem Lab</span>
                  </div>
                  <dl className="space-y-2">
                    {lab.glossary.map((g, i) => (
                      <div key={i} className="text-xs">
                        <dt className="inline font-mono font-semibold text-cyan-300">{g.term}</dt>
                        <dd className="inline text-slate-400"> — {g.def}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
