import {
  Globe,
  Lightning,
  Network,
  Shuffle,
  Stack,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const ROUTING_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // 4. Statisches Routing
  // ─────────────────────────────────────────────────────────────
  {
    id: "static-routing",
    icon: <Shuffle size={20} />,
    title: "Statisches Routing",
    subtitle: "2 Router · 2 Switches · 4 PCs",
    difficulty: "Mittel",
    duration: "30 min",
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
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config)#",
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
        title: "R2 konfigurieren",
        blocks: [
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie R1.",
              },
            ],
          },
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
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2(config)#",
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
        title: "Switches: Grundkonfiguration",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup\nend\ncopy running-config startup-config",
                explanation: "Reiner L2-Switch — Default-VLAN 1 reicht.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nno ip domain-lookup\nend\ncopy running-config startup-config",
                explanation: "Identisch zu SW1.",
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
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "An SW1, Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "An SW1, gleiches Subnetz wie PC0." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.1", explanation: "An SW2, Gateway = R2 Gi0/0." },
            ],
          },
          {
            device: "PC3",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.1", explanation: "An SW2, gleiches Subnetz wie PC2." },
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
                cmd: "ping 192.168.2.10",
                explanation: "PC0 (LAN R1) → PC2 (LAN R2): Pakete kommen durch beide Router — testet Hin- UND Rückroute gleichzeitig.",
              },
              {
                cmd: "tracert 192.168.2.10",
                explanation: "Zeigt den Pfad: PC0 → R1 (192.168.1.1) → R1-WAN (10.0.0.1) → R2-WAN (10.0.0.2) → PC2.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler beim statischen Routing",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Rückroute vergessen", explanation: "Die häufigste Falle: Nur R1 bekommt eine Route zu 192.168.2.0/24 — R2-PCs können dann zwar Anfragen an PC0 schicken, aber Antworten finden nie zurück (asymmetrisches Routing)." },
              { cmd: "Next-Hop statt Ziel-Netz verwechselt", explanation: "ip route <ZIEL-Netz> <Maske> <NEXT-HOP> — wird die Reihenfolge vertauscht, zeigt die Route ins Leere." },
              { cmd: "Falsche Maske im ip route-Befehl", explanation: "Die Maske gehört zum ZIEL-Netz (z. B. 255.255.255.0 für 192.168.2.0/24), nicht zum WAN-Link." },
              { cmd: "no shutdown auf dem WAN-Interface vergessen", explanation: "Ohne no shutdown bleibt der /30-Link down — die Route existiert zwar in der Konfiguration, ist aber inaktiv (show ip route zeigt sie gar nicht erst an)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 192.168.2.10 (von PC0)", expected: "Pakete kommen durch beide Router" },
      { cmd: "show ip route", expected: "S 192.168.2.0/24 via 10.0.0.2 (auf R1)" },
      { cmd: "tracert 192.168.2.10 (von PC0)", expected: "Hops: R1 LAN → R1 WAN → R2 WAN → Ziel" },
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
    duration: "20 min",
    context: {
      problem:
        "Eine einzelne statische Default-Route hat keinen Ersatz: fällt der Uplink aus, ist das Internet weg, bis jemand von Hand umkonfiguriert.",
      purpose:
        "Eine zweite Default-Route mit höherer Administrativer Distanz (Floating Static) als Reserve hinterlegen. Sie wird erst aktiv, wenn die primäre Route verschwindet — automatisches Failover, optional per IP SLA Tracking.",
    },
    topology: {
      description:
        "Branch-Router R1 hat einen primären MPLS-Uplink und einen Backup-Internet-DSL-Link. Floating Static aktiviert den Backup nur, wenn der primäre Pfad ausfällt. ISP-MPLS und DSL-Modem sind externe, nicht selbst konfigurierte Next-Hop-Geräte (z. B. als generische Router oder Cloud-Objekt in Packet Tracer platzieren) — dieses Lab konfiguriert ausschließlich R1.",
      devices: [{ type: "router", label: "R1 (Branch)", count: 1 }],
      connections: [
        "R1 Gi0/0 → ISP-MPLS  (R1: 10.1.1.2/30, Next-Hop 10.1.1.1, AD 1)",
        "R1 Gi0/1 → DSL-Modem (R1: 10.2.2.2/30, Next-Hop 10.2.2.1, AD 200 = Floating)",
      ],
      hint: "Die Backup-Route hat eine höhere Administrative Distance — sie 'floats' über der primären und wird nur eingesetzt, wenn die primäre verschwindet.",
    },
    steps: [
      {
        title: "R1: Grundkonfiguration + beide Uplink-Interfaces",
        blocks: [
          {
            device: "R1",
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
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip address 10.1.1.2 255.255.255.252\nno shutdown\ndescription MPLS-PRIMARY",
                explanation: "Primärer Uplink Richtung ISP-MPLS (Next-Hop 10.1.1.1).",
              },
              {
                cmd: "interface GigabitEthernet0/1\nip address 10.2.2.2 255.255.255.252\nno shutdown\ndescription DSL-BACKUP",
                explanation: "Backup-Uplink Richtung DSL-Modem (Next-Hop 10.2.2.1).",
              },
            ],
          },
        ],
      },
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
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern — auch vor dem optionalen IP-SLA-Teil, damit der Basiszustand gesichert ist.",
              },
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
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config)#",
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
        title: "Failover testen",
        blocks: [
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nshutdown",
                explanation: "Simuliert den Ausfall des primären MPLS-Uplinks. Der Router-zu-Router-Konnektivitätstest dieses konzeptionellen Labs: die AD-1-Route verschwindet, die Floating-Route mit AD 200 übernimmt.",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip route",
                explanation: "Jetzt zeigt sich S* 0.0.0.0/0 [200/0] via 10.2.2.1 — die Floating Static Route ist aktiv. Danach: no shutdown auf Gi0/0, um den Ursprungszustand wiederherzustellen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Floating Static Routes",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Gleiche AD auf beiden Routen", explanation: "Ohne die abweichende AD (200 statt Default 1) sind beide Routen gleichwertig — der Router nutzt dann Load-Balancing statt Failover, was hier NICHT gewollt ist." },
              { cmd: "AD-Wert vergessen", explanation: "ip route 0.0.0.0 0.0.0.0 10.2.2.1 OHNE die 200 am Ende wäre wieder AD 1 — beide Default-Routen konkurrieren, die Backup-Route 'floatet' nicht mehr." },
              { cmd: "IP-SLA-Ziel über den Backup-Link erreichbar gehalten", explanation: "Das SLA-Ziel (8.8.8.8) muss über GENAU das überwachte Interface (Gi0/0) geprüft werden — sonst bleibt der Track auch bei einem MPLS-Ausfall fälschlich 'Up'." },
              { cmd: "Route nach dem Test nicht zurückgesetzt", explanation: "Nach dem Failover-Test (shutdown Gi0/0) nicht vergessen: no shutdown wieder aktivieren, sonst bleibt der Router dauerhaft auf dem Backup-Pfad." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip route", expected: "S* 0.0.0.0/0 [1/0] via 10.1.1.1 (nur primär sichtbar, solange Gi0/0 up ist)" },
      { cmd: "show ip route (nach shutdown Gi0/0)", expected: "S* 0.0.0.0/0 [200/0] via 10.2.2.1 — Floating Route übernimmt" },
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
    duration: "35 min",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "Switches (SW1–SW3) + Endgeräte (PC0–PC2)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW1\nend\ncopy running-config startup-config", explanation: "Reiner Access-Switch im R1-LAN. SW2/SW3 identisch mit 'hostname SW2' bzw. 'hostname SW3'." },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW2\nend\ncopy running-config startup-config", explanation: "Access-Switch im R2-LAN." },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW3\nend\ncopy running-config startup-config", explanation: "Access-Switch im R3-LAN." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.1", explanation: "Gateway = R2 Gi0/0." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.3.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.3.1", explanation: "Gateway = R3 Gi0/0." },
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
            device: "Merke",
            mode: "info",
            modeLabel: "Konzeptionelle Grenzen von RIPv1 (nicht ausführen)",
            commands: [
              {
                cmd: "VLSM-Test würde scheitern: interface gi0/1 auf 255.255.255.252 (/30) statt /24 umstellen",
                explanation:
                  "RIPv1 trägt keine Subnetzmaske → VLSM (z. B. /30-WAN + /24-LAN im selben Major-Netz) ist unmöglich. R2 würde das Netz NICHT korrekt lernen, weil im Update keine Maske mitgesendet wird. Discontiguous Networks werden an Klassengrenzen falsch zu 10.0.0.0/8 zusammengefasst (auto-summary, nicht abschaltbar in v1).",
              },
              {
                cmd: "Lösung: version 2 + no auto-summary (eigenes Lab)",
                explanation:
                  "Die Lösung für ALLE diese Grenzen: auf RIPv2 wechseln. v2 sendet Masken mit (classless), nutzt Multicast 224.0.0.9, unterstützt VLSM/CIDR und Authentifizierung. Nicht in DIESEM Lab ausführen — das würde R1 mitten im laufenden RIPv1-Verbund auf v2 umstellen und die Nachbarschaft zu R2/R3 verwirren. Siehe eigenes Lab 'RIPv2'.",
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
                cmd: "ping 192.168.3.10\ntracert 192.168.3.10",
                explanation: "PC0 → PC2, automatisch über RIPv1 geroutet (2 Hops über R1 → R2 → R3).",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei RIPv1",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Unterschiedliche Masken im selben Major-Netz", explanation: "RIPv1 überträgt keine Maske — sobald ein Interface im 10er-Netz von /24 abweicht (z. B. versehentlich /30), lernen die anderen Router das Subnetz falsch oder gar nicht." },
              { cmd: "version 2 versehentlich mit hineinkopiert", explanation: "Dieses Lab demonstriert bewusst RIPv1 (Default-Version) — eine 'version 2'-Zeile würde den Verbund klassenlos machen und widerspricht dem Lernziel dieses spezifischen Labs." },
              { cmd: "passive-interface auf einem WAN-Link statt dem LAN gesetzt", explanation: "Wird versehentlich ein Router-zu-Router-Link statt des LAN-Interfaces passiv geschaltet, bildet sich keine RIP-Nachbarschaft zum entsprechenden Nachbarrouter." },
              { cmd: "network mit dem tatsächlichen Subnetz statt dem classful-Netz angegeben", explanation: "RIP nimmt im network-Befehl das CLASSFUL-Netz (10.0.0.0), nicht das spezifische Subnetz (10.0.12.0) — eine zu spezifische Angabe wird von IOS oft stillschweigend auf die Klassengrenze zurückgerundet." },
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
                cmd: "enable\nconfigure terminal\nhostname SW1\nend\ncopy running-config startup-config",
                explanation: "Reiner Layer-2-Access-Switch im R1-LAN — alle Ports Default-VLAN 1, keine IP nötig. SW2 und SW3 identisch mit 'hostname SW2' bzw. 'hostname SW3'.",
              },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW2\nend\ncopy running-config startup-config", explanation: "Access-Switch im R2-LAN." },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW3\nend\ncopy running-config startup-config", explanation: "Access-Switch im R3-LAN." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.2.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.2.1", explanation: "Gateway = R2 Gi0/0." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
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
      {
        title: "Typische Fehler bei RIPv2",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "version 2 vergessen", explanation: "Ohne diese Zeile läuft RIP im Default = Version 1 — classful, keine Masken in den Updates, kann bei unterschiedlichen Subnetzmasken im selben Major-Netz scheitern." },
              { cmd: "no auto-summary vergessen", explanation: "Ohne diese Zeile fasst RIP die Subnetze an Klassengrenzen zusammen — bei mehreren /30-Links im selben 10er-Netz kann das die Routing-Tabelle verfälschen." },
              { cmd: "passive-interface auf dem falschen Interface gesetzt", explanation: "passive-interface gehört auf LAN-Interfaces OHNE Router-Nachbarn — wird versehentlich ein WAN-Link passiv gesetzt, reißt die RIP-Nachbarschaft dorthin ab." },
              { cmd: "network mit falscher (nicht-classful) Adresse", explanation: "RIP nimmt im network-Befehl das CLASSFUL-Netz (z. B. 10.0.0.0), nicht das tatsächliche Subnetz (10.0.12.0) — ein zu spezifischer Eintrag wird von IOS oft automatisch auf die Klassengrenze zurückgerundet, was zu Verwirrung führt." },
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
                cmd: "enable\nconfigure terminal\nhostname SW1\nend\ncopy running-config startup-config",
                explanation:
                  "Der 2960 ist reiner Layer-2-Transit für das Segment 10.0.0.8/29 — alle Ports bleiben im Default-VLAN 1 (Access), keine IP nötig. Nur Hostname zur Wiedererkennung.",
              },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
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
            modeLabel: "Desktop > IP Configuration",
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
            modeLabel: "Desktop > IP Configuration",
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
      {
        title: "Typische Fehler bei RIPv2 mit passive-interface",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "passive-interface auf R2 (Transit) gesetzt", explanation: "R2 hat KEIN LAN — beide Interfaces zeigen zu Routern. Wird hier trotzdem passive-interface gesetzt, reißt eine RIP-Nachbarschaft ab und die Server-Netze verschwinden aus R1s Routingtabelle." },
              { cmd: "Classful network-Zeile für R2 vergessen", explanation: "Ein einziges network 10.0.0.0 deckt bei R2 BEIDE Interfaces (10.1.0.0/30 UND 10.0.0.8/29) ab — wird stattdessen versucht, jedes Subnetz einzeln mit Wildcard anzugeben, lehnt IOS das bei RIP ab." },
              { cmd: "Metrik [120/2] für einen Fehler gehalten", explanation: "Zwei Hops (R1→R2→R3/R4) sind hier korrekt und erwartet — nicht mit einem Konvergenzproblem verwechseln." },
              { cmd: "SW1 (2960) fälschlich mit IP konfiguriert", explanation: "SW1 ist reiner Layer-2-Transit für das Segment 10.0.0.8/29 — er braucht keine IP-Adresse, um Frames zwischen R2/R3/R4 weiterzuleiten." },
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
    duration: "35 min",
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
        { type: "switch", label: "SW1–SW3", count: 3 },
        { type: "pc", label: "PC pro Router-LAN", count: 3 },
      ],
      connections: [
        "R1 Gi0/1 ↔ R2 Gi0/1  (10.0.12.0/30)",
        "R2 Gi0/2 ↔ R3 Gi0/1  (10.0.23.0/30)",
        "R1 Gi0/2 ↔ R3 Gi0/2  (10.0.13.0/30)",
        "R1 Gi0/0 → SW1 → PC0  (192.168.1.0/24)",
        "R2 Gi0/0 → SW2 → PC1  (192.168.2.0/24)",
        "R3 Gi0/0 → SW3 → PC2  (192.168.3.0/24)",
      ],
      hint: "Dreieck aus 3 Routern. Jeder Router hat zusätzlich ein LAN-Interface mit einem PC.",
    },
    steps: [
      {
        title: "R1: Grundkonfiguration + Interfaces + OSPF",
        blocks: [
          {
            device: "R1",
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
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface Gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown",
                explanation: "LAN-Interface zu PC0.",
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
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config-router)#",
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
        title: "R2 und R3 vollständig konfigurieren",
        blocks: [
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie R1.",
              },
            ],
          },
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "R3",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R3\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie R1.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "Switches + Endgeräte",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW1\nend\ncopy running-config startup-config", explanation: "Reiner Access-Switch im R1-LAN. SW2/SW3 identisch mit 'hostname SW2' bzw. 'hostname SW3'." },
            ],
          },
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW2\nend\ncopy running-config startup-config", explanation: "Access-Switch im R2-LAN." },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW3\nend\ncopy running-config startup-config", explanation: "Access-Switch im R3-LAN." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.1", explanation: "Gateway = R2 Gi0/0." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.3.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.3.1", explanation: "Gateway = R3 Gi0/0." },
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
                cmd: "ping 192.168.3.10\ntracert 192.168.3.10",
                explanation: "PC0 → PC2, automatisch über OSPF geroutet. tracert zeigt den vom SPF-Algorithmus berechneten Pfad.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei OSPF Single-Area",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Subnetzmaske statt Wildcard-Maske verwendet", explanation: "Der network-Befehl bei OSPF nimmt die INVERTIERTE Maske (0.0.0.255 statt 255.255.255.0) — die normale Subnetzmaske wird von IOS klaglos akzeptiert, aktiviert dann aber das falsche Interface oder gar keins." },
              { cmd: "area-Nummer auf einer Seite vergessen", explanation: "network ... area 0 ohne die area-Angabe ist ein Syntaxfehler — OSPF braucht IMMER eine Area-Zuordnung, anders als bei RIP." },
              { cmd: "passive-interface auf einem Router-Link gesetzt", explanation: "Werden versehentlich die P2P-Links (Gi0/1/Gi0/2) statt nur des LAN-Interfaces passiv gesetzt, kommt keine OSPF-Nachbarschaft zwischen den Routern zustande." },
              { cmd: "Router-ID-Kollision", explanation: "Zwei Router mit derselben router-id bilden keine korrekte Adjacency — jeder Router in diesem Lab braucht eine eindeutige ID (hier 1.1.1.1/2.2.2.2/3.3.3.3)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ospf neighbor", expected: "Alle Nachbarn im FULL-State" },
      { cmd: "show ip route ospf", expected: "O 192.168.2.0, O 192.168.3.0 in Routing-Tabelle" },
      { cmd: "ping 192.168.3.10 (von PC0)", expected: "Automatisch geroutet über OSPF" },
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.11\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.254", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC-rechts",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
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
      {
        title: "Typische Fehler bei Loopback-RID & Wildcard",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Wildcard mit Subnetzmaske verwechselt", explanation: "network 192.168.1.0 255.255.255.0 area 0 wird von IOS angenommen, aktiviert dann aber das falsche Interface/keins — im network-Befehl gehört die INVERTIERTE Maske hin." },
              { cmd: "Loopback ohne /32 angelegt", explanation: "Eine Loopback-Adresse ohne 255.255.255.255 wird versehentlich als eigenes /24-Netz in die OSPF-Datenbank injiziert und verfälscht die Routing-Tabelle." },
              { cmd: "router-id nachträglich geändert, ohne den Prozess neu zu starten", explanation: "Eine neue router-id wirkt bei laufendem OSPF-Prozess erst nach clear ip ospf process — sonst bleibt die alte RID aktiv." },
              { cmd: "passive-interface auf dem Transit-Link statt dem LAN gesetzt", explanation: "Wird versehentlich Gi0/1 (Router-zu-Router) statt Gi0/0 (LAN) passiv gesetzt, bildet sich gar keine Nachbarschaft zwischen den Routern." },
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
    duration: "40 min",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern. Gleicher Speicher-Schritt am Ende von R2/R3/R4.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
                cmd: "enable\nconfigure terminal\nhostname Sw1\nend\ncopy running-config startup-config",
                explanation: "Reiner Layer-2-Switch für das Segment 10.1.0.0/29 (alle 4 Router hängen dran) — Default-VLAN 1, keine IP nötig.",
              },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.11\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.254", explanation: "R1-LAN." },
            ],
          },
          {
            device: "Server0 / Server1 / Server2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
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
      {
        title: "10) Abschlusstest — Ende-zu-Ende über das Segment",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.4.11\ntracert 192.168.4.11",
                explanation:
                  "PC0 (R1-LAN) → Server2 (R4-LAN). Der Pfad läuft über das gemeinsame Broadcast-Segment — die DR/BDR-Wahl beeinflusst nur den LSA-Austausch, nicht den Datenpfad selbst.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei der DR/BDR-Wahl",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Priority-Änderung erwartet, sofortige Neuwahl", explanation: "Die Wahl ist NICHT preemptiv — ein bestehender DR bleibt DR, bis er ausfällt oder clear ip ospf process die Neuwahl erzwingt. Nur eine Priority zu setzen reicht nicht." },
              { cmd: "Priority auf dem falschen Interface gesetzt", explanation: "ip ospf priority muss auf dem Segment-Interface (hier Gi0/1) stehen, nicht auf dem LAN-Interface — sonst hat es keine Wirkung auf die Wahl." },
              { cmd: "2-WAY zwischen zwei DROTHERn für einen Fehler gehalten", explanation: "DROTHER bilden bewusst KEINE Full-Adjacency untereinander (nur zu DR/BDR) — 2-WAY zwischen ihnen ist normales Verhalten, kein Adjacency-Problem." },
              { cmd: "Priority 0 mit 'kein OSPF' verwechselt", explanation: "Priority 0 bedeutet nur 'nie DR/BDR' — der Router bleibt vollwertiger DROTHER-Nachbar und lernt/verteilt weiterhin Routen." },
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
      { cmd: "ping 192.168.4.11 (PC0)", expected: "Erfolgreich — Ende-zu-Ende über das Broadcast-Segment" },
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
    duration: "35 min",
    context: {
      problem:
        "Ein einziges großes OSPF-Area zwingt jeden Router, die vollständige Topologie-Datenbank zu halten und bei jeder Änderung neu zu rechnen — das skaliert schlecht.",
      purpose:
        "OSPF in mehrere Areas aufteilen, die alle an Area 0 hängen. ABRs fassen zwischen den Areas zusammen und begrenzen so den Rechen-/Speicheraufwand. Grundprinzip hierarchischer OSPF-Netze.",
    },
    topology: {
      description:
        "3 Router: R1 in Area 0, R2 ist ABR (Area Border Router) zwischen Area 0 und Area 1, R3 in Area 1. Area 1 wird als Stub konfiguriert.",
      devices: [
        { type: "router", label: "R1, R2, R3", count: 3 },
        { type: "pc", label: "PC0 (R1-LAN) / PC1 (R3-LAN)", count: 2 },
      ],
      connections: [
        "R1 ↔ R2 Gi0/0 (10.0.0.0/30, Area 0)",
        "R2 ↔ R3 Gi0/1 (10.0.0.4/30, Area 1)",
        "R1 Gi0/2 → PC0  (192.168.1.0/24, Area 0)",
        "R3 Gi0/2 → PC1  (192.168.3.0/24, Area 1)",
      ],
      hint: "ABR (R2) hat Interfaces in MEHREREN Areas. Er generiert LSA Type 3 (Summary), um Routen zwischen Areas zu propagieren.",
    },
    steps: [
      {
        title: "R1 — Backbone (Area 0)",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R1\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface Gi0/0\nip address 10.0.0.1 255.255.255.252\nno shutdown", explanation: "Backbone-Link zu R2." },
              { cmd: "interface Gi0/2\nip address 192.168.1.1 255.255.255.0\nno shutdown", explanation: "LAN-Interface zu PC0." },
            ],
          },
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
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "R2 — ABR (Area 0 + Area 1)",
        blocks: [
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R2\nno ip domain-lookup", explanation: "Gleicher Einstieg wie R1." },
            ],
          },
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "interface Gi0/0\nip address 10.0.0.2 255.255.255.252\nno shutdown", explanation: "Backbone-Link zu R1." },
              { cmd: "interface Gi0/1\nip address 10.0.0.5 255.255.255.252\nno shutdown", explanation: "Link zu R3 in Area 1." },
            ],
          },
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
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "R3 — Stub Area 1",
        blocks: [
          {
            device: "R3",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R3\nno ip domain-lookup", explanation: "Gleicher Einstieg wie R1." },
            ],
          },
          {
            device: "R3",
            mode: "interface",
            modeLabel: "R3(config)#",
            commands: [
              { cmd: "interface Gi0/1\nip address 10.0.0.6 255.255.255.252\nno shutdown", explanation: "Eigenes Backbone-Interface in Area 1." },
              { cmd: "interface Gi0/2\nip address 192.168.3.1 255.255.255.0\nno shutdown", explanation: "LAN-Interface zu PC1." },
            ],
          },
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
              { cmd: "passive-interface Gi0/2", explanation: "Kein OSPF-Hello auf User-Interface." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Endgeräte",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway = R1 Gi0/2." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.3.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.3.1", explanation: "Gateway = R3 Gi0/2." },
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
                cmd: "ping 192.168.3.10\ntracert 192.168.3.10",
                explanation: "PC0 (Area 0) → PC1 (Stub Area 1), automatisch über den ABR R2 geroutet.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei OSPF Multi-Area",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "area X stub nur auf einem Router der Area gesetzt", explanation: "Stub-Konfiguration muss auf JEDEM Router innerhalb der Area identisch sein — sonst kommt gar keine Adjacency zustande (Mismatch in den Hello-Paketen)." },
              { cmd: "Nicht-Backbone-Area ohne direkte Anbindung an Area 0", explanation: "Jede Area außer 0 muss direkt an den Backbone angebunden sein (Backbone-Regel) — sonst sind Inter-Area-Routen (O IA) nicht erreichbar." },
              { cmd: "ABR-Interface versehentlich in die falsche Area gelegt", explanation: "Der network-Befehl auf dem ABR muss pro Interface exakt der jeweiligen Area zugeordnet sein — vertauschte Area-Nummern trennen die beiden Segmente logisch." },
              { cmd: "Stub-Area fälschlich externe Routen erwartet", explanation: "In einer Stub-Area werden Type-5-LSAs (externe Routen) geblockt — R3 sieht dafür eine Default-Route (O*IA 0.0.0.0/0) vom ABR." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ospf neighbor", expected: "R1: FULL/BDR (auf R2), R3: FULL/BDR" },
      { cmd: "show ip ospf database", expected: "Type-1 (Router), Type-2 (Network), Type-3 (Summary) sichtbar" },
      { cmd: "show ip route ospf", expected: "O IA 192.168.1.0/24 (Inter-Area), O*IA 0.0.0.0/0 (Default in Stub)" },
      { cmd: "ping 192.168.3.10 (von PC0)", expected: "Erfolgreich über den ABR R2" },
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
    duration: "35 min",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
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
              { cmd: "enable\nconfigure terminal\nhostname SW1\nend\ncopy running-config startup-config", explanation: "Access-Switch im R1-LAN, Default-VLAN 1." },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW3\nend\ncopy running-config startup-config", explanation: "Access-Switch im R3-LAN, Default-VLAN 1." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.1.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Adresse:    192.168.3.10\nSubnetzmaske:  255.255.255.0\nGateway:       192.168.3.1", explanation: "Gateway = R3 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest — Baseline",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.3.10",
                explanation: "PC0 → PC1 über das Dreieck, automatisch von EIGRP geroutet — Baseline vor dem Failover-Test.",
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
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.3.10",
                explanation: "Nach dem Shutdown von Gi0/2 weiterhin erfolgreich — DUAL-Failover über R2, ohne spürbaren Ausfall. Danach auf R1: no shutdown auf Gi0/2 zur Wiederherstellung.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei EIGRP",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Unterschiedliche AS-Nummern auf den Routern", explanation: "router eigrp 100 vs. router eigrp 200 auf Nachbarn verhindert jede Nachbarschaft — die AS-Nummer muss netzweit identisch sein." },
              { cmd: "Subnetzmaske statt Wildcard-Maske im network-Befehl", explanation: "Wie bei OSPF erwartet EIGRP die invertierte Maske (0.0.0.3 statt 255.255.255.252) — eine falsche Maske aktiviert das Interface nicht wie gewünscht." },
              { cmd: "no auto-summary vergessen", explanation: "Ohne no auto-summary fasst EIGRP Subnetze an Klassengrenzen zusammen — bei diskontinuierlichen Netzen (wie hier) führt das zu Routing-Löchern." },
              { cmd: "passive-interface auf einem Router-Link statt dem LAN gesetzt", explanation: "Wird das falsche Interface passiv geschaltet, bildet sich keine Nachbarschaft zum entsprechenden Router." },
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
];
