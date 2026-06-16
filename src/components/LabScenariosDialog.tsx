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
  };
  steps: LabStep[];
  verifyCommands: Array<{ cmd: string; expected: string; explanation?: string }>;
  /** Kurz-Glossar der im Lab verwendeten Fachbegriffe. */
  glossary?: Array<{ term: string; def: string }>;
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
  },

  {
    id: "drill-pc-ips",
    icon: <Desktop size={20} />,
    title: "Drill: 6 PCs durchnummerieren",
    subtitle: "Statische IPs im Akkord vergeben",
    difficulty: "Drill",
    duration: "10 min",
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
  },

  {
    id: "drill-access-ports",
    icon: <Stack size={20} />,
    title: "Drill: Access-Ports im Akkord",
    subtitle: "16 Ports · 2 VLANs · 2 Switches",
    difficulty: "Drill",
    duration: "12 min",
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
  },

  {
    id: "drill-interfaces",
    icon: <Network size={20} />,
    title: "Drill: Router-Interfaces hochziehen",
    subtitle: "6 Interfaces · 2 Router · ip address + no shutdown",
    difficulty: "Drill",
    duration: "12 min",
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
  // VTP & DTP (CIS1 — Prüfungsklassiker)
  // ─────────────────────────────────────────────────────────────
  {
    id: "vtp-dtp",
    icon: <Stack size={20} />,
    title: "VTP & DTP",
    subtitle: "VLAN-Verteilung & Trunk-Verhandlung · 3 Switches",
    difficulty: "Mittel",
    duration: "20 min",
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
  // RIPv2 (CIS2 — dynamisches Routing Grundlagen)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rip-v2",
    icon: <Shuffle size={20} />,
    title: "RIPv2 — Dynamisches Routing",
    subtitle: "3 Router · Distance Vector · max. 15 Hops",
    difficulty: "Mittel",
    duration: "20 min",
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
        title: "Interfaces konfigurieren (alle Router)",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown\ninterface gi0/1\nip address 10.0.12.1 255.255.255.252\nno shutdown",
                explanation:
                  "LAN + WAN-Link zu R2. R2 und R3 analog mit ihren Subnetzen konfigurieren.",
              },
            ],
          },
        ],
      },
      {
        title: "RIPv2 aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "router",
            modeLabel: "R1(config-router)#",
            commands: [
              {
                cmd: "router rip\nversion 2\nno auto-summary",
                explanation:
                  "version 2 macht RIP classless (Subnetzmasken werden mitgesendet, Multicast 224.0.0.9 statt Broadcast). no auto-summary verhindert falsche Zusammenfassung an Klassengrenzen — Top-Prüfungsfrage!",
              },
              {
                cmd: "network 192.168.1.0\nnetwork 10.0.0.0",
                explanation:
                  "RIP nimmt CLASSFUL-Netzangaben ohne Wildcard-Maske: 10.0.0.0 aktiviert ALLE Interfaces im 10er-Netz. Anders als OSPF/EIGRP!",
              },
              {
                cmd: "passive-interface gi0/0",
                explanation:
                  "Keine RIP-Updates ins LAN senden (dort ist kein Router) — spart Bandbreite und verhindert Manipulation.",
              },
            ],
          },
          {
            device: "R2",
            mode: "router",
            modeLabel: "R2(config-router)#",
            commands: [
              {
                cmd: "router rip\nversion 2\nno auto-summary\nnetwork 192.168.2.0\nnetwork 10.0.0.0",
                explanation: "R2 kennt beide WAN-Links über das 10er-Netz. R3 analog.",
              },
            ],
          },
        ],
      },
      {
        title: "Konvergenz beobachten",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip route rip",
                explanation:
                  "R-Einträge mit [120/1] und [120/2]: AD 120, Metrik = Hop-Count. 192.168.3.0/24 hat 2 Hops (über R2 und R3).",
              },
              {
                cmd: "show ip protocols",
                explanation:
                  "Zeigt Timer (Update 30s, Invalid 180s, Flush 240s), Version und passive Interfaces — die Timer sind Prüfungsstoff.",
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
  // DHCP Troubleshooting — 3 eingebaute Fehler finden & beheben
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp-troubleshoot-lab",
    icon: <Shield size={20} />,
    title: "DHCP Troubleshooting: 3 Fehler finden",
    subtitle: "APIPA-Diagnose · helper-address · excluded-address · SVI down",
    difficulty: "Fortgeschritten",
    duration: "25 min",
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
        title: "EIGRP mit gleicher AS-Nummer starten",
        blocks: [
          {
            device: "R1",
            mode: "router",
            modeLabel: "R1(config-router)#",
            commands: [
              {
                cmd: "router eigrp 100",
                explanation:
                  "Die AS-Nummer (100) MUSS auf allen Routern identisch sein, sonst entsteht keine Nachbarschaft — der häufigste EIGRP-Fehler in der Prüfung.",
              },
              {
                cmd: "network 192.168.1.0 0.0.0.255\nnetwork 10.0.12.0 0.0.0.3\nnetwork 10.0.13.0 0.0.0.3",
                explanation:
                  "EIGRP nutzt Wildcard-Masken wie OSPF (Maske invertiert: /30 → 0.0.0.3). Präziser als RIPs classful network-Befehl.",
              },
              {
                cmd: "no auto-summary\npassive-interface gi0/0",
                explanation:
                  "Auto-Summary deaktivieren (wie bei RIP), keine Hellos ins LAN.",
              },
            ],
          },
          {
            device: "R2",
            mode: "router",
            modeLabel: "R2(config-router)#",
            commands: [
              {
                cmd: "router eigrp 100\nnetwork 10.0.12.0 0.0.0.3\nnetwork 10.0.23.0 0.0.0.3\nno auto-summary",
                explanation: "R2 ist reiner Transit-Router. R3 analog mit seinen Netzen.",
              },
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
              { cmd: "service-policy type inspect NET-DMZ-POLICY", explanation: "(Diese Policy analog zu LAN-NET-POLICY, aber mit class NET-TO-DMZ-WEB)" },
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
  },
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
