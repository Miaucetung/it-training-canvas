import {
  BookOpen,
  Lightning,
  Network,
  Stack,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const LAYER2_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // 1. IP-Grundkonfiguration
  // ─────────────────────────────────────────────────────────────
  {
    id: "basic-ip",
    icon: <Network size={20} />,
    title: "IP-Grundkonfiguration",
    subtitle: "Router · Switch · 2 PCs",
    difficulty: "Anfänger",
    duration: "15 min",
    context: {
      problem:
        "Geräte können erst kommunizieren, wenn jedes Interface eine IP hat und Endgeräte ihr Default-Gateway kennen — das ist das absolute Fundament jedes Netzes.",
      purpose:
        "Die einfachste Topologie (Router–Switch–2 PCs) end-to-end aufbauen, adressieren und per Ping verifizieren. Grundlage für alle weiteren Labs.",
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
              {
                cmd: "no ip domain-lookup",
                explanation:
                  "Kein DNS-Lookup bei Tippfehlern in der CLI — sonst hängt die Konsole bis zum Timeout.",
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
              {
                cmd: "copy running-config startup-config",
                explanation:
                  "Speichern! Ohne diesen Schritt ist die Konfiguration nach einem reload verloren.",
              },
            ],
          },
        ],
      },
      {
        title: "Switch konfigurieren",
        blocks: [
          {
            device: "Switch0",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation:
                  "Auch der Switch bekommt den üblichen Einstieg. VLAN-Konfiguration ist hier nicht nötig — alle Ports liegen im Default-VLAN 1.",
              },
            ],
          },
          {
            device: "Switch0",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "interface vlan 1\nip address 192.168.1.2 255.255.255.0\nno shutdown\nexit\nip default-gateway 192.168.1.1",
                explanation:
                  "Management-SVI im VLAN 1 + Default-Gateway. Damit ist der Switch selbst erreichbar (z. B. für spätere SSH-Labs) — routet aber weiterhin nur auf Layer 2.",
              },
            ],
          },
          {
            device: "Switch0",
            mode: "privileged",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
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
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
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
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
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
      {
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.1.20",
                explanation: "PC0 pingt PC1 — beide liegen im selben Subnetz, der Router wird dafür nicht gebraucht, aber die Switch-Verkabelung muss stimmen.",
              },
              {
                cmd: "ping 192.168.1.1",
                explanation: "PC0 pingt sein Default Gateway (R1) — bestätigt, dass die Gateway-Adresse korrekt eingetragen ist.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei der IP-Grundkonfiguration",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "no shutdown auf dem Router-Interface vergessen", explanation: "Router-Interfaces sind ab Werk down — ohne no shutdown bleibt Gi0/0 down, egal wie korrekt IP und Maske sind." },
              { cmd: "Falsches Gateway auf dem PC", explanation: "Ein Tippfehler im Gateway-Feld (z. B. 192.168.1.10 statt .1) lässt den PC im eigenen Subnetz pingen, aber nichts außerhalb erreichen." },
              { cmd: "PC und Router in unterschiedlichen Subnetzen", explanation: "Stimmen Netzanteil oder Maske nicht überein, scheitert der ARP-Prozess schon vor dem eigentlichen Ping." },
              { cmd: "Switch-Kabel am falschen Port", explanation: "Copper Straight-Through zwischen PC und Switch, aber Switch und Router — beide Enden in Packet Tracer prüfen, wenn kein Link-Licht kommt." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 192.168.1.10 (von PC1 oder R1)", expected: "!!!!! (5/5 erfolgreich)" },
      { cmd: "show ip interface brief (R1)", expected: "GigabitEthernet0/0 up/up" },
      { cmd: "show startup-config | include hostname (R1 + SW1)", expected: "Beide Geräte zeigen ihren gespeicherten Hostnamen" },
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
      { term: "interface vlan 1 (SVI)", def: "Management-Interface eines Switches — gibt ihm eine eigene IP, ohne dass er dadurch routet." },
      { term: "ip default-gateway", def: "Gateway eines reinen L2-Switches für seinen eigenen Management-Verkehr (nicht mit ip route verwechseln)." },
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
    duration: "20 min",
    context: {
      problem:
        "Ein flaches LAN ist eine einzige große Broadcast-Domäne — jedes Gerät hört jeden Broadcast. Das ist schlecht für Sicherheit und Performance.",
      purpose:
        "Den Verkehr per VLANs in getrennte Broadcast-Domänen aufteilen und diese VLANs über einen 802.1Q-Trunk zwischen Switches transportieren — die Basis jeder Campus-Verkabelung.",
    },
    topology: {
      description:
        "Zwei Switches teilen ein Netz in zwei VLANs auf. Trunk-Link verbindet die Switches. Ohne Router bleiben die beiden VLANs bewusst voneinander isoliert — genau das zeigt der Abschlusstest.",
      devices: [
        { type: "switch", label: "SW1 / SW2", count: 2 },
        { type: "pc", label: "PC0–PC3", count: 4 },
      ],
      connections: [
        "PC0 → SW1 Fa0/1  (VLAN 10, 192.168.10.0/24)",
        "PC1 → SW1 Fa0/2  (VLAN 20, 192.168.20.0/24)",
        "PC2 → SW2 Fa0/1  (VLAN 10, 192.168.10.0/24)",
        "PC3 → SW2 Fa0/2  (VLAN 20, 192.168.20.0/24)",
        "SW1 Gi0/1 ↔ SW2 Gi0/1  (Trunk)",
      ],
      hint: "Drag 2 Switches + 4 PCs. Verbinde Switches mit Copper Cross-Over oder Auto.",
    },
    steps: [
      {
        title: "SW1: Grundkonfiguration + VLANs erstellen",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
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
                cmd: "end\ncopy running-config startup-config",
                explanation: "Zurück zum Privileged EXEC und speichern.",
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
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie SW1.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "vlan 10\nname SALES\nvlan 20\nname HR\nexit",
                explanation:
                  "Gleiche VLANs auf SW2 anlegen — VLANs werden NICHT automatisch über Trunks propagiert (außer mit VTP, siehe eigenes Lab).",
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
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs adressieren",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1", explanation: "VLAN 10 (SALES) — Gateway zeigt ins Leere, da hier kein Router steht; für den Ping innerhalb desselben Subnetzes ohne Belang." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.20.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.20.1", explanation: "VLAN 20 (HR) — eigenes Subnetz, getrennt von VLAN 10." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1", explanation: "VLAN 10 (SALES) an SW2 — gleiches Subnetz wie PC0, über den Trunk erreichbar." },
            ],
          },
          {
            device: "PC3",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.20.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.20.1", explanation: "VLAN 20 (HR) an SW2 — gleiches Subnetz wie PC1." },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest — Trunk trägt, VLANs trennen",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.10.20",
                explanation: "PC0 (VLAN 10, SW1) → PC2 (VLAN 10, SW2): MUSS erfolgreich sein — der Trunk trägt das VLAN-10-Tag über den Switch-Link.",
              },
              {
                cmd: "ping 192.168.20.10",
                explanation: "PC0 (VLAN 10) → PC1 (VLAN 20, derselbe Switch SW1): MUSS FEHLSCHLAGEN — unterschiedliche VLANs sind getrennte Broadcast-Domänen, auch am selben Switch. Ohne Router gibt es keinen Weg zwischen ihnen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei VLAN & Trunking",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "VLANs nur auf einem Switch angelegt", explanation: "VLANs werden ohne VTP NICHT automatisch verteilt — auf SW2 fehlen sonst VLAN 10/20, und die Access-Ports landen in einem inaktiven VLAN." },
              { cmd: "Trunk vergessen oder als Access belassen", explanation: "Ohne switchport mode trunk auf BEIDEN Seiten des Uplinks bleibt der Link ein normaler Access-Port — nur ein VLAN kommt durch, alle anderen PCs verlieren die Verbindung zum jeweils anderen Switch." },
              { cmd: "switchport trunk allowed vlan vergisst ein VLAN", explanation: "Wird z. B. nur 'vlan 10' erlaubt, kommt VLAN-20-Verkehr nie über den Trunk — PC1 und PC3 erreichen sich dann trotz korrekter IP-Konfiguration nicht." },
              { cmd: "Erwarteter Fehlschlag als Bug missverstanden", explanation: "PC0 erreicht PC1 NICHT — das ist kein Fehler, sondern der Beweis, dass die VLAN-Trennung funktioniert. Ohne Router/L3-Switch ist das so gewollt." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief", expected: "VLAN 10 SALES active (Fa0/1), VLAN 20 HR active (Fa0/2) — auf beiden Switches" },
      { cmd: "show interfaces trunk", expected: "Gi0/1 trunk, VLANs 10,20 allowed and active" },
      { cmd: "ping 192.168.10.20 (von PC0)", expected: "Erfolgreich — gleiches VLAN über den Trunk" },
      { cmd: "ping 192.168.20.10 (von PC0)", expected: "Fehlschlag — anderes VLAN, keine Routing-Instanz vorhanden" },
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
    duration: "30 min",
    context: {
      problem:
        "VLANs auf jedem Switch einzeln zu pflegen ist mühsam und fehleranfällig — und falsch verhandelte Trunks öffnen VLAN-Hopping-Angriffe.",
      purpose:
        "VTP verteilt die VLAN-Datenbank automatisch vom Server an die Client-Switches; DTP zeigt die Trunk-Verhandlung und wird per nonegotiate abgesichert. CCNA-Standardthema.",
    },
    topology: {
      description:
        "Drei Switches in Reihe. SW1 ist VTP-Server und verteilt VLANs automatisch an die Clients SW2 und SW3. DTP verhandelt die Trunks — PC0 und PC1 liegen an den beiden Enden im selben VLAN und testen die komplette Kette.",
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
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
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
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 10",
                explanation:
                  "Die Port-Zuweisung selbst wird NICHT von VTP verteilt — jeder Switch braucht seinen eigenen access-vlan-Befehl, auch der Server. PC0 hängt hier.",
              },
            ],
          },
        ],
      },
      {
        title: "SW1: Trunk per DTP verhandeln",
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
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config-if)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2 als VTP-Client + statischer Trunk (nonegotiate)",
        blocks: [
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie SW1.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "vtp domain CCNA-LAB\nvtp mode client\nvtp password cisco",
                explanation:
                  "Client übernimmt die VLAN-Datenbank vom Server, kann selbst aber keine VLANs anlegen oder löschen. SW3 identisch konfigurieren.",
              },
              {
                cmd: "interface range gi0/1 - 2\nswitchport mode trunk\nswitchport nonegotiate",
                explanation:
                  "Best Practice: Trunk statisch setzen und DTP mit nonegotiate abschalten — verhindert VLAN-Hopping über gefälschte DTP-Frames. gi0/1 zu SW1, gi0/2 zu SW3.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "SW3 als VTP-Client + Access-Port für PC1",
        blocks: [
          {
            device: "SW3",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW3\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie SW1/SW2.",
              },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              {
                cmd: "vtp domain CCNA-LAB\nvtp mode client\nvtp password cisco",
                explanation: "Auch SW3 ist Client — übernimmt VLAN 10 und 20 automatisch von SW1, sobald der Trunk zu SW2 steht.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\nswitchport nonegotiate",
                explanation:
                  "Gegenstelle zu SW2 Gi0/2, das bereits statisch als Trunk konfiguriert ist. Beide Seiten statisch zu setzen ist Best Practice — DTP-Aushandlung ist damit auf dieser Strecke komplett abgeschaltet.",
              },
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 10",
                explanation: "PC1 hängt hier — gleiches VLAN wie PC0 an SW1, aber lokal auf SW3 zugewiesen (VTP verteilt nur die VLAN-Datenbank, nicht die Port-Zuweisung).",
              },
            ],
          },
          {
            device: "SW3",
            mode: "privileged",
            modeLabel: "SW3(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs adressieren",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1", explanation: "VLAN 10 (VERWALTUNG) an SW1." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1", explanation: "VLAN 10 (VERWALTUNG) an SW3 — gleiches Subnetz wie PC0, drei Switches entfernt." },
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
                cmd: "show vlan brief",
                explanation: "VLAN 10 VERWALTUNG und VLAN 20 TECHNIK müssen hier erscheinen — obwohl SW3 sie NIE selbst angelegt hat.",
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
      {
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.10.20",
                explanation: "PC0 (an SW1) → PC1 (an SW3): das Paket durchquert beide Trunks (SW1↔SW2, SW2↔SW3). Erfolgreich = VTP-Verteilung UND DTP-Trunks funktionieren durchgehend.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei VTP & DTP",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Domain oder Passwort tippen sich unterschiedlich", explanation: "Auch ein einziges falsches Zeichen in vtp domain oder vtp password lässt den Client die Server-Updates komplett ignorieren — show vtp status zeigt dann 0 VLANs." },
              { cmd: "Port-Zuweisung für VTP-verteilt gehalten", explanation: "switchport access vlan muss auf JEDEM Switch einzeln gesetzt werden — VTP verteilt ausschließlich die VLAN-Datenbank selbst, nicht welcher Port zu welchem VLAN gehört." },
              { cmd: "auto + auto auf beiden Trunk-Enden", explanation: "Zwei Ports im DTP-Default (dynamic auto) verhandeln NIE aktiv einen Trunk — mindestens eine Seite muss desirable oder statisch trunk sein." },
              { cmd: "Höhere Revision-Nummer bei einem 'gebrauchten' Switch", explanation: "Ein Switch, der vorher schon VTP-Client oder -Server in einer anderen Domain war, kann eine höhere Revision mitbringen und die Server-Datenbank versehentlich überschreiben — vor dem Einbau immer vtp mode transparent + reload oder delete vlan.dat." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief (auf SW3)", expected: "VLAN 10 VERWALTUNG und VLAN 20 TECHNIK vorhanden — ohne lokale vlan-Befehle" },
      { cmd: "show vtp status", expected: "VTP Operating Mode: Client, gleiche Configuration Revision wie SW1" },
      { cmd: "show interfaces trunk", expected: "Gi0/1 mode: desirable bzw. nonegotiate, status: trunking, encapsulation 802.1q" },
      { cmd: "ping 192.168.10.20 (von PC0)", expected: "Erfolgreich — komplette Kette SW1→SW2→SW3 funktioniert" },
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
    subtitle: "2 Switches · gebündelte Links · 2 PCs",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Ein einzelner Link zwischen zwei Switches ist Flaschenhals und Single Point of Failure — und STP würde einen zweiten, parallelen Link blockieren statt nutzen.",
      purpose:
        "Mehrere physische Links zu EINEM logischen Port-Channel bündeln: mehr Bandbreite und Redundanz, und STP sieht nur einen logischen Link (blockiert nichts).",
    },
    topology: {
      description:
        "Zwei physische Links zwischen den Switches werden zu einem logischen Port-Channel gebündelt. Je ein PC pro Switch testet, ob der Datenverkehr über den Bundle-Trunk tatsächlich durchkommt.",
      devices: [
        { type: "switch", label: "SW1 / SW2", count: 2 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "SW1 Fa0/1 ↔ SW2 Fa0/1  (Link 1, Bundle)",
        "SW1 Fa0/2 ↔ SW2 Fa0/2  (Link 2, Bundle)",
        "PC0 → SW1 Fa0/3, PC1 → SW2 Fa0/3  (192.168.1.0/24)",
      ],
      hint: "Zwei Switches mit 2 parallelen Copper-Kabeln verbinden, dazu je einen PC an einen separaten Port (nicht Fa0/1/Fa0/2).",
    },
    steps: [
      {
        title: "EtherChannel auf SW1 konfigurieren",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
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
              {
                cmd: "exit\ninterface fa0/3\nswitchport mode access",
                explanation: "PC0-Port bleibt separat vom Bundle — normaler Access-Port im Default-VLAN 1.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
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
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie SW1.",
              },
            ],
          },
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
              {
                cmd: "interface fa0/3\nswitchport mode access",
                explanation: "PC1-Port, ebenfalls außerhalb des Bundles.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs adressieren",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "An SW1 Fa0/3." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "An SW2 Fa0/3 — gleiches Subnetz, Verkehr läuft über den Port-Channel-Trunk." },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.1.20",
                explanation: "PC0 → PC1 über den gebündelten Port-Channel-Trunk. Erfolgreich = beide physischen Links tragen gemeinsam als EIN logisches Interface.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei EtherChannel",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "channel-group-Modus passt nicht zusammen", explanation: "active/active oder active/passive bildet ein Bundle, aber passive/passive NICHT — beide Seiten warten dann nur aufeinander." },
              { cmd: "Mitglieds-Interfaces unterschiedlich konfiguriert", explanation: "Speed, Duplex, VLAN oder Trunk-Einstellungen müssen auf ALLEN Mitglieds-Ports identisch sein, sonst verweigert IOS die Aufnahme in den Channel." },
              { cmd: "Konfiguration am Port-channel statt an den Mitgliedern erwartet", explanation: "switchport-Befehle können auf dem Port-channel-Interface ODER den Mitgliedern stehen — mischt man beides, gewinnen oft die zuletzt gesetzten Mitglieds-Einstellungen und der Channel geht in suspended." },
              { cmd: "PC-Port versehentlich mit ins Bundle genommen", explanation: "Landet ein Endgeräte-Port in derselben interface range wie die Bundle-Ports, wird er Teil des Trunks — der PC verliert dann seine normale Access-Konnektivität." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show etherchannel summary", expected: "Po1 (SU) — S=Layer2, U=in use, Fa0/1 und Fa0/2 als Mitglieder (P)" },
      { cmd: "show interfaces Port-channel1", expected: "Bandbreite = 2× Fa0 = 200Mbit/s" },
      { cmd: "ping 192.168.1.20 (von PC0)", expected: "Erfolgreich — Traffic läuft über den Bundle-Trunk" },
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
    subtitle: "2 Switches · redundante Links · PCs",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "Redundante Verbindungen zwischen Switches erzeugen ohne Schutz Layer-2-Loops. Ein Frame kreist endlos, ein Broadcast-Sturm legt binnen Sekunden das ganze Netz lahm.",
      purpose:
        "STP wählt automatisch eine Root-Bridge und blockiert überflüssige Pfade, sodass genau ein loopfreier Baum bleibt. PortFast + BPDU-Guard sichern dabei die Access-Ports ab.",
    },
    topology: {
      description:
        "SW1 und SW2 sind über ZWEI parallele Links verbunden — erst dieser echte Loop gibt STP etwas zu blockieren. PortFast beschleunigt den Port-Übergang für die Endgeräte-Ports.",
      devices: [
        { type: "switch", label: "SW1 (Root) / SW2", count: 2 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "SW1 Gi0/1 ↔ SW2 Gi0/1  (Link 1)",
        "SW1 Gi0/2 ↔ SW2 Gi0/2  (Link 2 — redundant, erzeugt den Loop)",
        "PC0 → SW1 Fa0/1  (192.168.1.0/24)",
        "PC1 → SW2 Fa0/1  (192.168.1.0/24)",
      ],
      hint: "SW1 wird Root Bridge durch niedrigere Priority. Ohne den zweiten Link zwischen SW1 und SW2 gäbe es keinen Loop und nichts zu blockieren.",
    },
    steps: [
      {
        title: "SW1: Root Bridge + PortFast/BPDU-Guard",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
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
                cmd: "interface FastEthernet0/1\nswitchport mode access\nspanning-tree portfast\nspanning-tree bpduguard enable",
                explanation:
                  "PortFast: Port überspringt Listening/Learning-Phasen (spart ~30s Wartezeit). Nur für Endgeräte! BPDU Guard: Wenn stattdessen ein Switch an diesem Port angeschlossen wird, geht der Port sofort in err-disabled — schützt vor Loop-Einschleusung.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2: PortFast/BPDU-Guard + globale PortFast-Vorgabe",
        blocks: [
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie SW1.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "interface FastEthernet0/1\nswitchport mode access\nspanning-tree portfast\nspanning-tree bpduguard enable",
                explanation: "Gleiche Sicherheitskonfiguration für PC1-Port.",
              },
              {
                cmd: "spanning-tree portfast default",
                explanation:
                  "Aktiviert PortFast global für alle Access-Ports. Effizient wenn alle Non-Trunk-Ports zu Endgeräten gehen.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs adressieren",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "PC0 an SW1 Fa0/1." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "PC1 an SW2 Fa0/1 — gleiches Subnetz wie PC0." },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest — Forwarding trotz Loop-Topologie",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.1.20",
                explanation: "Trotz zweier physischer Links zwischen SW1 und SW2 kommt der Ping normal durch — STP hat einen der beiden Ports in Blocking versetzt, es gibt keinen Loop und keinen Broadcast-Sturm.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei STP/PortFast",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "PortFast auf einem Switch-Uplink aktiviert", explanation: "spanning-tree portfast gehört NUR auf Ports zu Endgeräten. Auf einem Uplink zwischen zwei Switches kann es kurzzeitig einen Loop durchlassen, bevor STP reagiert." },
              { cmd: "Priority nicht in Vielfachen von 4096 gesetzt", explanation: "IOS akzeptiert nur Vielfache von 4096 (0, 4096, 8192, …) als Priority-Wert — andere Zahlen werden mit einem Syntaxfehler abgelehnt." },
              { cmd: "Nur einen Link konfiguriert, zweiten vergessen", explanation: "Ohne den zweiten Link (Gi0/2 ↔ Gi0/2) gibt es gar keinen Loop — dann zeigt show spanning-tree auch keinen blockierten Port, weil keiner nötig ist." },
              { cmd: "Blocking-Port für einen Fehler gehalten", explanation: "Ein Port im Zustand BLK ist gewollt — das ist STP, das den Loop verhindert, kein Konfigurationsfehler." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show spanning-tree vlan 1", expected: "SW1: This bridge is the root; SW2: ein Port RP (Root Port), der andere BLK (Blocking)" },
      { cmd: "show spanning-tree vlan 1 detail", expected: "Root ID Priority 4096, SW1 MAC-Adresse" },
      { cmd: "ping 192.168.1.20 (von PC0)", expected: "Erfolgreich — trotz Loop-Topologie kein Broadcast-Sturm" },
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
    duration: "25 min",
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
            device: "Switch0",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
          {
            device: "Switch0",
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
          {
            device: "Switch0",
            mode: "privileged",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
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
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
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
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "R1(config-subif)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IP Address: 192.168.10.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1",
                explanation: "PC0 in VLAN 10 — Gateway ist das Subinterface .10 des Routers.",
              },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IP Address: 192.168.20.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.20.1",
                explanation: "PC1 in VLAN 20 — Gateway ist Subinterface .20.",
              },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.20.10",
                explanation: "PC0 (VLAN 10) → PC1 (VLAN 20): erfolgreich = Inter-VLAN-Routing über die Subinterfaces funktioniert.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Router-on-a-Stick",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "no shutdown auf dem Parent-Interface vergessen", explanation: "Ohne no shutdown auf Gi0/0 bleiben ALLE Subinterfaces down, egal wie korrekt sie einzeln konfiguriert sind — Subinterfaces erben den Status des physischen Interfaces." },
              { cmd: "encapsulation dot1Q vergessen", explanation: "Ohne diesen Befehl weiß das Subinterface nicht, für welches VLAN es zuständig ist — es bleibt inaktiv, auch mit korrekter IP-Adresse." },
              { cmd: "Trunk auf dem Switch vergessen", explanation: "Fehlt switchport mode trunk auf Gi0/1, kommen die 802.1Q-Tags nie beim Router an — Inter-VLAN-Routing scheitert trotz korrekter Router-Konfiguration." },
              { cmd: "Gateway-IP auf dem PC falsch", explanation: "Jedes VLAN braucht das passende Subinterface als Gateway — ein PC in VLAN 20 mit Gateway 192.168.10.1 findet sein Gateway nicht." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 192.168.20.10 (von PC0)", expected: "5/5 erfolgreich — Inter-VLAN Routing funktioniert" },
      { cmd: "show ip route", expected: "C 192.168.10.0/24, C 192.168.20.0/24" },
      { cmd: "show vlan brief (Switch0)", expected: "VLAN 10 und VLAN 20 mit den richtigen Access-Ports" },
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
    duration: "25 min",
    context: {
      problem:
        "Router-on-a-Stick hat einen Engpass: aller Inter-VLAN-Verkehr teilt sich einen Trunk-Link. In größeren Netzen routet man lieber direkt im Switch.",
      purpose:
        "Ein Layer-3-Switch routet per SVIs (interface vlan) at Wire-Speed in Hardware zwischen VLANs — der moderne Campus-Standard. Zeigt die häufige Falle „ip routing vergessen\".",
    },
    topology: {
      description:
        "Statt Router-on-a-Stick übernimmt ein Layer-3-Switch das Routing zwischen den VLANs über SVIs (interface vlan). Moderner Standard im Campus-Netz. In Packet Tracer einen L3-fähigen Switch verwenden (z. B. Catalyst 3560) — ein einfacher 2960 unterstützt kein ip routing.",
      devices: [
        { type: "switch", label: "MLS1 (Layer-3, z. B. 3560)", count: 1 },
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
        title: "Grundkonfiguration + VLANs anlegen",
        blocks: [
          {
            device: "MLS1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname MLS1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
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
          {
            device: "MLS1",
            mode: "privileged",
            modeLabel: "MLS1(config-if)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "Endgeräte konfigurieren",
        blocks: [
          {
            device: "PC-Sales",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IP Address: 192.168.10.1\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.254",
                explanation: "Gateway = SVI von VLAN 10.",
              },
            ],
          },
          {
            device: "PC-Mrkt",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IP Address: 192.168.20.1\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.20.254",
                explanation: "Gateway = SVI von VLAN 20. Ohne korrektes Gateway scheitert das Inter-VLAN-Routing trotz richtiger Switch-Konfig.",
              },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC-Sales",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.20.1",
                explanation: "PC-Sales (VLAN 10) → PC-Mrkt (VLAN 20): erfolgreich = der L3-Switch routet zwischen den VLANs in Hardware.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei L3-Switch-Routing",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ip routing vergessen", explanation: "Die häufigste Falle im Namen des Labs selbst: ohne diesen globalen Befehl bleibt der Switch ein reiner L2-Switch — SVIs bekommen zwar eine IP, routen aber nicht zwischen VLANs." },
              { cmd: "SVI ohne aktiven Access-Port im VLAN", explanation: "Ein SVI geht erst 'up', wenn mindestens ein Access-Port im zugehörigen VLAN aktiv (up) ist — sonst bleibt interface vlan 10 down, egal wie korrekt die IP ist." },
              { cmd: "2960 statt L3-fähigem Modell verwendet", explanation: "ip routing existiert als Befehl nur auf Multilayer-Switches (z. B. 3560/3650) — auf einem reinen 2960 wird er gar nicht erst akzeptiert." },
              { cmd: "Gateway auf dem PC vertauscht", explanation: "PC-Sales mit Gateway 192.168.20.254 (statt .10.254) findet sein eigenes Gateway nicht — Ping scheitert schon lokal." },
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
];
