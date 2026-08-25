import {
  Globe,
  Network,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const IPV6_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // 12. IPv6 Grundkonfiguration
  // ─────────────────────────────────────────────────────────────
  {
    id: "ipv6",
    icon: <Globe size={20} weight="fill" />,
    title: "IPv6 Grundkonfiguration",
    subtitle: "2 Router · 2 PCs",
    difficulty: "Mittel",
    duration: "20 min",
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
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R1\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
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
              { cmd: "enable\nconfigure terminal\nhostname R2\nno ip domain-lookup", explanation: "Gleicher Einstieg wie R1." },
            ],
          },
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
                cmd: "IPv6 Address:    2001:db8:1::10/64\nIPv6 Gateway:    2001:db8:1::1",
                explanation: "PC0 mit manueller IPv6-Adresse.",
              },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IPv6 Address:    2001:db8:2::10/64\nIPv6 Gateway:    2001:db8:2::1",
                explanation: "PC1 mit manueller IPv6-Adresse.",
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
                cmd: "ping 2001:db8:2::10",
                explanation: "PC0 → PC1, automatisch über die statischen IPv6-Routen auf R1/R2 geroutet.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei IPv6-Grundkonfiguration",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ipv6 unicast-routing vergessen", explanation: "Ohne diesen globalen Befehl weist der Router zwar Adressen zu, leitet aber kein IPv6 zwischen Interfaces weiter — er verhält sich wie ein reiner Host." },
              { cmd: "Link-Local mit Global Unicast verwechselt", explanation: "Jedes Interface bekommt automatisch eine fe80::-Adresse — das ersetzt NICHT die manuell zu vergebende globale 2001:db8::-Adresse." },
              { cmd: "Präfixlänge falsch übernommen", explanation: "Ein Tippfehler bei /64 (z. B. /48) auf einer Seite der Verbindung erzeugt zwei verschiedene Subnetze — die Router erscheinen dann als 'nicht im selben Netz'." },
              { cmd: "ipv6 route mit falschem Next-Hop", explanation: "Der Next-Hop muss die IPv6-Adresse des NÄCHSTEN Routers auf dem WAN-Link sein, nicht die eigene — sonst zeigt show ipv6 route eine Route ins Leere." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ipv6 route", expected: "S 2001:db8:2::/64 via Gi0/1" },
      { cmd: "ping 2001:db8:2::10 (von PC0)", expected: "!!!!! von PC0 zu PC1" },
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
    duration: "30 min",
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
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R1-1\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "3) R2-1 komplett (analog zu R1-1)",
        blocks: [
          {
            device: "R2-1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R2-1\nno ip domain-lookup", explanation: "Gleicher Einstieg wie R1-1." },
            ],
          },
          {
            device: "R2-1",
            mode: "global",
            modeLabel: "R2-1(config)#",
            commands: [
              {
                cmd: "ipv6 unicast-routing",
                explanation: "Pflicht auf jedem IPv6-Router.",
              },
              {
                cmd: "interface se0/1/0\nipv6 address 2001:DB8:CCA2:2::2/64\nno shutdown\ninterface loopback0\nipv6 address 2001:DB8:CCA2:254::2:1/128",
                explanation: "Eigene Global-Unicast-Adressen für Link und Loopback.",
              },
              {
                cmd: "ipv6 route 2001:DB8:CCAF:254::1/128 2001:DB8:CCA2:2::1",
                explanation: "Host-Route zur Loopback des Internet-Routers über dessen Link-Next-Hop.",
              },
              {
                cmd: "ipv6 route ::/0 2001:DB8:CCA2:2::1",
                explanation: "Default-Route zum Internet-Router.",
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
        title: "4) Gegenrouten auf dem Internet-Router",
        blocks: [
          {
            device: "Internet",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname Internet\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "5) IPv6-Routing prüfen & testen",
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
          {
            device: "R2-1",
            mode: "privileged",
            modeLabel: "R2-1#",
            commands: [
              {
                cmd: "show ipv6 route static",
                explanation: "Gleiche Prüfung auf R2-1: ::/0 + die Host-Route zur Internet-Loopback.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Abschlusstest — Ende-zu-Ende zwischen den Sites",
        blocks: [
          {
            device: "R1-1",
            mode: "privileged",
            modeLabel: "R1-1#",
            commands: [
              {
                cmd: "ping 2001:DB8:CCA2:254::2:1",
                explanation:
                  "R1-1 → Loopback von R2-1, über den Internet-Router geroutet. Beweist, dass beide Site-Routen UND die Gegenrouten am Internet-Router korrekt stehen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei IPv6 Static Routing",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Fehlende Rückroute am Internet-Router", explanation: "Ping vom Site-Router scheitert nicht am Hinweg, sondern weil die Antwort keinen Rückweg findet — jede Loopback braucht eine Gegenroute am Internet-Router." },
              { cmd: "::/0 mit /0 vertippt oder vergessen", explanation: "Ohne Default-Route erreicht der Site-Router nur explizit per ipv6 route eingetragene Ziele — alles andere fällt durch." },
              { cmd: "Next-Hop-Adresse statt Interface-Name (oder umgekehrt) bei Punkt-zu-Punkt-Links", explanation: "Auf seriellen P2P-Links funktioniert oft auch der Interface-Name als Next-Hop — wird eine falsche IP verwendet, bleibt die Route unbenutzbar (Next-Hop unerreichbar)." },
              { cmd: "/128 mit /64 verwechselt bei der Loopback-Route", explanation: "Die Loopback ist eine Host-Adresse (/128) — eine Route mit /64 fasst ein viel zu großes, in Wahrheit nicht existierendes Netz zusammen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ipv6 route static", expected: "S 2001:DB8:CCAF:254::1/128 [1/0] via ... + S ::/0" },
      { cmd: "show ipv6 interface brief", expected: "Se0/0/0 mit Global-Unicast + fe80:: Link-Local, Status up/up" },
      { cmd: "ping 2001:DB8:CCAF:254::1", expected: "!!!!! — Erfolg (Hin- und Rückroute vorhanden)" },
      { cmd: "ping 2001:DB8:CCA2:254::2:1 (von R1-1)", expected: "!!!!! — Ende-zu-Ende über den Internet-Router" },
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
    duration: "25 min",
    context: {
      problem:
        "Das klassische OSPF für IPv4 kennt keine IPv6-Routen. Für dynamisches Routing im IPv6-Netz braucht es OSPFv3.",
      purpose:
        "OSPFv3 für IPv6 einrichten: Area-Zuweisung direkt am Interface, manuelle Router-ID (Pflicht ohne IPv4) und passive-interface. Dynamisches IPv6-Routing statt statischer Routen.",
    },
    topology: {
      description:
        "2 Router, beide IPv6-only, je mit einem LAN. OSPFv3 läuft als eigener Prozess parallel zu OSPFv2 (IPv4).",
      devices: [
        { type: "router", label: "R1, R2", count: 2 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
      ],
      connections: [
        "R1 Gi0/0 ↔ R2 Gi0/0  (2001:db8::/64)",
        "R1 Gi0/1 → PC0  (2001:db8:1::/64)",
        "R2 Gi0/1 → PC1  (2001:db8:2::/64)",
      ],
      hint: "OSPFv3 nutzt link-local fe80::/10 für Neighborships — nicht die globale Unicast-Adresse.",
    },
    steps: [
      {
        title: "R1: IPv6 routing + Interfaces + OSPFv3",
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
              { cmd: "interface Gi0/0\nipv6 address 2001:db8::1/64\nno shutdown\nipv6 ospf 1 area 0", explanation: "Backbone-Link zu R2. OSPFv3 direkt am Interface aktivieren — keine 'network'-Statements wie bei OSPFv2!" },
              { cmd: "interface Gi0/1\nipv6 address 2001:db8:1::1/64\nno shutdown\nipv6 ospf 1 area 0", explanation: "LAN-Interface zu PC0, ebenfalls in Area 0." },
            ],
          },
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ipv6 router ospf 1", explanation: "Separater Process für IPv6 (kann gleiche oder andere Process-ID wie IPv4 haben)." },
              { cmd: "router-id 1.1.1.1", explanation: "Router-ID ist trotz IPv6 ein 32-Bit-Wert (IPv4-Notation) — muss manuell gesetzt werden, falls keine IPv4-Adresse vorhanden!" },
              { cmd: "passive-interface GigabitEthernet0/1", explanation: "Kein OSPFv3-Hello ins LAN." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "R2: identisch konfigurieren",
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
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "ipv6 unicast-routing", explanation: "Pflicht auf jedem IPv6-Router." },
              {
                cmd: "interface Gi0/0\nipv6 address 2001:db8::2/64\nno shutdown\nipv6 ospf 1 area 0",
                explanation: "Backbone-Link zu R1.",
              },
              {
                cmd: "interface Gi0/1\nipv6 address 2001:db8:2::1/64\nno shutdown\nipv6 ospf 1 area 0",
                explanation: "LAN-Interface zu PC1.",
              },
              { cmd: "ipv6 router ospf 1\nrouter-id 2.2.2.2\npassive-interface GigabitEthernet0/1", explanation: "Eigene Router-ID, LAN passiv." },
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
              { cmd: "IPv6 Address: 2001:db8:1::10/64\nIPv6 Gateway: 2001:db8:1::1", explanation: "Gateway = R1 Gi0/1." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IPv6 Address: 2001:db8:2::10/64\nIPv6 Gateway: 2001:db8:2::1", explanation: "Gateway = R2 Gi0/1." },
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
              { cmd: "ping 2001:db8:2::10", explanation: "PC0 → PC1, automatisch über OSPFv3 geroutet." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei OSPFv3",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "network-Befehl statt ipv6 ospf am Interface erwartet", explanation: "OSPFv3 kennt KEIN network-Statement im Prozess — die Area-Zuordnung passiert direkt am Interface mit ipv6 ospf <pid> area <n>." },
              { cmd: "router-id nicht manuell gesetzt (reines IPv6-Netz)", explanation: "Ohne IPv4-Adresse auf dem Router hat OSPFv3 keine automatische Quelle für die Router-ID — ohne manuelles router-id startet der Prozess gar nicht." },
              { cmd: "ipv6 unicast-routing vergessen", explanation: "Ohne den globalen Befehl bleibt der Router ein reiner IPv6-Host, OSPFv3 kommt trotz korrekter Area-Zuordnung nie in den FULL-State." },
              { cmd: "passive-interface auf dem Backbone-Link statt dem LAN gesetzt", explanation: "Wird versehentlich Gi0/0 statt Gi0/1 passiv geschaltet, bildet sich keine Nachbarschaft zwischen R1 und R2." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ipv6 ospf neighbor", expected: "Neighbor ID 2.2.2.2 — FULL, Interface ID, Address fe80::..." },
      { cmd: "show ipv6 route ospf", expected: "O   2001:db8:2::/64 [110/2] via FE80::..." },
      { cmd: "show ipv6 ospf interface brief", expected: "Gi0/0 1 0 fe80::... 1" },
      { cmd: "ping 2001:db8:2::10 (von PC0)", expected: "Erfolgreich über OSPFv3" },
    ],
    glossary: [
      { term: "OSPFv3", def: "OSPF-Version für IPv6 (RFC 5340) — Link-State, AD 110." },
      { term: "ipv6 ospf <pid> area <n>", def: "Aktiviert OSPFv3 direkt am Interface und ordnet es einer Area zu (statt network-Befehl)." },
      { term: "ipv6 router ospf", def: "Öffnet den OSPFv3-Prozess für globale Parameter (router-id, passive-interface)." },
      { term: "router-id", def: "32-Bit-Kennung — bei reinem IPv6 MANUELL nötig, da keine IPv4-Adresse als ID dient." },
      { term: "passive-interface", def: "Unterdrückt OSPFv3-Hellos auf einem Interface — hier gezielt aufs LAN gesetzt." },
      { term: "Link-Local-Nachbarschaft", def: "OSPFv3-Nachbarn kommunizieren über ihre fe80::-Adressen." },
      { term: "Area 0", def: "Backbone-Area, hier am Interface zugewiesen." },
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
        title: "1) Grundkonfiguration + IPv6-Routing global aktivieren (R1/R2/R3 identisch)",
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
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ipv6 unicast-routing", explanation: "PFLICHT: Aktiviert IPv6-Forwarding auf dem Router. Ohne diesen Befehl bleibt der Router im reinen Host-Modus und kann keine IPv6-Pakete zwischen Interfaces weiterleiten — egal wie Adressen und Protokolle konfiguriert sind." },
              { cmd: "ipv6 cef", explanation: "Aktiviert Cisco Express Forwarding für IPv6 (Hardware-beschleunigtes Forwarding). Ohne CEF fällt der Router auf langsameres Process-Switching zurück. Sicherstellen dass KEIN 'no ipv6 cef' in der Config steht." },
            ],
          },
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
            mode: "global",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "ipv6 unicast-routing", explanation: "IPv6-Forwarding aktivieren." },
              { cmd: "ipv6 cef", explanation: "IPv6 CEF aktivieren." },
            ],
          },
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
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
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
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
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
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
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
      {
        title: "Typische Fehler bei OSPFv3 + EIGRPv6",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "router-id auf einem der Prozesse vergessen", explanation: "Ohne IPv4-Adresse leiten weder OSPFv3 noch EIGRPv6 automatisch eine Router-ID ab — beide Prozesse brauchen sie manuell (router-id bzw. eigrp router-id), sonst startet der Prozess gar nicht sauber." },
              { cmd: "EIGRPv6-Prozess im shutdown-Zustand belassen", explanation: "Der EIGRPv6-Prozess startet per Default im Zustand shutdown — ohne 'no shutdown' bleibt er inaktiv, obwohl Interfaces korrekt mit ipv6 eigrp 1 aktiviert wurden." },
              { cmd: "/127-Subnetz auf beiden Seiten unterschiedlich gewählt", explanation: "Ein Tippfehler bei den /127-Backbone-Adressen (z. B. FD00::2 statt FD00::3 als Partner) trennt die beiden Enden logisch, obwohl beide Interfaces up/up zeigen." },
              { cmd: "passive-interface default ohne Backbone-Ausnahmen", explanation: "Wird 'no passive-interface' für die Backbone-Links vergessen, bleiben ALLE Interfaces passiv — es entsteht keine einzige OSPFv3-Nachbarschaft." },
              { cmd: "AD-Koexistenz für einen Fehler gehalten", explanation: "Dass Backbone-Routen als 'D' (EIGRP, AD 90) statt 'O' (OSPF, AD 110) erscheinen, ist beabsichtigtes Verhalten der administrativen Distanz — keine Fehlkonfiguration." },
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
];
