import {
  Check,
  Desktop,
  Network,
  Stack,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const DRILL_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // DRILL-LABS — stumpfe Wiederholung für Muskelgedächtnis
  // ─────────────────────────────────────────────────────────────
  {
    id: "drill-grundkonfig",
    icon: <Check size={20} />,
    title: "Drill: Grundkonfiguration ×3",
    subtitle: "Identischer Basis-Block auf R1, SW1 und SW2",
    difficulty: "Drill",
    duration: "20 min",
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
      hint: "Nicht kopieren! Jeden Block von Hand tippen — genau darum geht es. Reihenfolge laut sagen: Enable → Configure Terminal → Hostname → Secret → Console → VTY → Banner → Speichern.",
    },
    steps: [
      {
        title: "Runde 1: R1 komplett durchkonfigurieren",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable",
                explanation:
                  "Wechselt vom User-EXEC (Router>) in den privilegierten EXEC-Modus (Router#). Erster Handgriff auf JEDEM frischen Gerät.",
              },
              {
                cmd: "configure terminal",
                explanation:
                  "Öffnet den globalen Konfigurationsmodus (Router(config)#). Kurzform: conf t.",
              },
              {
                cmd: "hostname R1",
                explanation:
                  "Setzt den Gerätenamen — ändert sofort den Prompt auf R1(config)#.",
              },
              {
                cmd: "enable secret class",
                explanation:
                  "Privileged-Passwort als MD5-Hash gespeichert (nicht umkehrbar) — sicherer als das veraltete enable password.",
              },
              {
                cmd: "no ip domain-lookup",
                explanation:
                  "Kein nerviges DNS-Lookup bei Tippfehlern in der CLI — sonst hängt die Konsole bis zum Timeout.",
              },
            ],
          },
          {
            device: "R1",
            mode: "line",
            modeLabel: "R1(config)#",
            commands: [
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
            ],
          },
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "banner motd #Unbefugter Zugriff verboten!#",
                explanation:
                  "Rechtlicher Warnhinweis, der vor jedem Login erscheint. # ist hier das Trennzeichen (Delimiter) — jedes Zeichen geht, solange es nicht im Text selbst vorkommt.",
              },
              {
                cmd: "service password-encryption",
                explanation:
                  "Verschleiert alle Klartext-Passwörter in der laufenden Konfiguration (schwache Type-7-Verschlüsselung, aber besser als nichts).",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "end",
                explanation: "Zurück in den privilegierten EXEC (R1#).",
              },
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
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal",
                explanation:
                  "Identisch zu R1: erst enable, dann configure terminal — auch auf dem Switch.",
              },
              {
                cmd: "hostname SW1\nenable secret class\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit\nbanner motd #Unbefugter Zugriff verboten!#\nservice password-encryption",
                explanation:
                  "Ab hier identisch zu R1 — nur der Hostname ändert sich. Diesmal ohne auf die Erklärungen zu schauen.",
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
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nenable secret class\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit\nbanner motd #Unbefugter Zugriff verboten!#\nservice password-encryption\nend\ncopy running-config startup-config",
                explanation:
                  "Die komplette Sequenz aus dem Kopf, inklusive Speichern am Ende. Bildschirm vorher abdecken und erst NACH dem eigenen Versuch mit Runde 1/2 vergleichen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei der Grundkonfiguration",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "login vergessen", explanation: "password gesetzt, aber kein login auf der Line — der Router fragt dann NIE nach dem Passwort, obwohl eines konfiguriert ist." },
              { cmd: "enable secret vs. enable password verwechselt", explanation: "enable password ist Klartext und veraltet; ist zusätzlich ein enable secret gesetzt, gewinnt IMMER das secret." },
              { cmd: "Banner-Delimiter kommt im Text vor", explanation: "Wird z. B. # als Trennzeichen gewählt und taucht im Bannertext selbst auf, bricht der Banner vorzeitig ab." },
              { cmd: "Speichern vergessen", explanation: "Ohne copy running-config startup-config ist nach einem reload oder Stromausfall die komplette Konfiguration weg — häufigster Anfängerfehler überhaupt." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show running-config | include hostname|secret|banner", expected: "Alle drei Geräte zeigen identische Struktur (nur der Hostname unterscheidet sich)" },
      { cmd: "show startup-config", expected: "Gespeicherte Config vorhanden (kein 'startup-config is not present') — auf allen drei Geräten" },
      { cmd: "exit + neu einloggen", expected: "Banner erscheint, Console-Passwort wird abgefragt" },
    ],
    glossary: [
      { term: "enable", def: "Wechsel vom User-EXEC (>) in den privilegierten EXEC-Modus (#) — Voraussetzung für configure terminal." },
      { term: "configure terminal", def: "Öffnet den globalen Konfigurationsmodus ((config)#). Kurzform: conf t." },
      { term: "hostname", def: "Setzt den Gerätenamen und ändert den CLI-Prompt — wichtig zur Orientierung in größeren Netzen." },
      { term: "enable secret", def: "Passwort für den Privileged-EXEC-Modus, als MD5-Hash gespeichert (nicht umkehrbar). Sicherer als enable password." },
      { term: "line console 0", def: "Konfiguriert den physischen Konsolen-Port; mit password + login wird der Zugang abgesichert." },
      { term: "line vty 0 4", def: "Die ersten 5 virtuellen Terminal-Leitungen für Telnet/SSH-Fernzugriff." },
      { term: "login", def: "Aktiviert die Passwortabfrage auf einer Line — ohne login wird trotz gesetztem Passwort nichts abgefragt." },
      { term: "banner motd", def: "Message of the Day — rechtlicher Warnhinweis, der vor dem Login erscheint." },
      { term: "service password-encryption", def: "Verschleiert Klartext-Passwörter in der Konfiguration (schwache Type-7-Verschlüsselung)." },
      { term: "end", def: "Springt aus jedem Config-Untermodus direkt zurück in den privilegierten EXEC (#)." },
      { term: "copy running-config startup-config", def: "Speichert die laufende Konfiguration ins NVRAM, damit sie einen Reload übersteht. Kurzform: write memory." },
    ],
  },

  {
    id: "drill-pc-ips",
    icon: <Desktop size={20} />,
    title: "Drill: 6 PCs durchnummerieren",
    subtitle: "Statische IPs im Akkord vergeben",
    difficulty: "Drill",
    duration: "12 min",
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
            device: "PC1–PC5",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IP Address: 192.168.50.12\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.50.1",
                explanation: "PC1 — gleiches Schema wie PC0, nur die letzte Zahl ändert sich.",
              },
              {
                cmd: "IP Address: 192.168.50.13\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.50.1",
                explanation: "PC2.",
              },
              {
                cmd: "IP Address: 192.168.50.14\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.50.1",
                explanation: "PC3.",
              },
              {
                cmd: "IP Address: 192.168.50.15\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.50.1",
                explanation: "PC4.",
              },
              {
                cmd: "IP Address: 192.168.50.16\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.50.1",
                explanation: "PC5 — letzter PC. Ziel: unter 60 Sekunden pro PC, ab hier ohne nachzudenken.",
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
      {
        title: "Typische Fehler bei der IP-Vergabe",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Gateway mit falschem letzten Oktett", explanation: "Alle 6 PCs müssen dasselbe Gateway (192.168.50.1) haben — nicht die eigene Host-Adresse als Gateway eingetragen." },
              { cmd: "Tippfehler in der Maske", explanation: "255.255.255.0 statt versehentlich 255.255.0.0 — sonst hält der PC ein ganz anderes Netz für 'lokal' und ARP scheitert." },
              { cmd: "Zwei PCs mit derselben IP", explanation: "Bei sechs PCs im Akkord passiert das leicht — Windows zeigt dann eine IP-Konflikt-Warnung, ipconfig bleibt aber scheinbar normal." },
              { cmd: "Erster Ping verloren, danach Panik", explanation: "Verlust von genau 1 Paket beim allerersten Ping zu einem neuen Nachbarn ist normal (ARP-Auflösung) — kein Fehler." },
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
    duration: "15 min",
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
        "R1 Gi0/1 ↔ R2 Gi0/1 (10.0.0.0/30, für den Schluss-Ping)",
      ],
      hint: "Der Vierschritt: interface — ip address — no shut — description. Bei 'no shutdown' auf die Konsolenmeldung 'changed state to up' achten.",
    },
    steps: [
      {
        title: "R1: drei Interfaces konfigurieren",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1",
                explanation:
                  "Auch bei einem reinen Interface-Drill gehört der Einstieg dazu: enable → configure terminal → hostname.",
              },
            ],
          },
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
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config-if)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Zurück in den privilegierten EXEC und speichern — nicht erst am Ende beider Router.",
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
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2",
                explanation: "Runde 2 ohne Spickzettel. Der Einstieg muss automatisch kommen.",
              },
            ],
          },
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config-if)#",
            commands: [
              {
                cmd: "interface gi0/0\nip address 192.168.30.1 255.255.255.0\nno shutdown\ndescription LAN-BUERO",
                explanation: "Interface 1 — eigenes LAN-Subnetz von R2.",
              },
              {
                cmd: "interface gi0/1\nip address 10.0.0.2 255.255.255.252\nno shutdown\ndescription WAN-ZU-R1",
                explanation: "Interface 2 — Gegenstelle zu R1 Gi0/1 (10.0.0.1) im selben /30.",
              },
              {
                cmd: "interface gi0/2\nip address 192.168.40.1 255.255.255.0\nno shutdown\ndescription LAN-LABOR",
                explanation: "Interface 3 — dieselbe Sequenz, drittes Mal. Der Vierschritt muss automatisch kommen.",
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
                explanation: "Schluss-Ping über den WAN-Link zu R1 — Router-zu-Router-Konnektivitätstest, da dieses Drill-Lab keine PCs enthält.",
              },
              {
                cmd: "copy running-config startup-config",
                explanation: "Speichern nicht vergessen — gehört zu JEDER Konfiguration dazu, auch im Drill.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler beim Interface-Vierschritt",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "no shutdown vergessen", explanation: "Router-Interfaces sind ab Werk administrativ down — ohne no shutdown bleibt es das, egal wie korrekt IP und Maske sind." },
              { cmd: "Falsche Interface-Bezeichnung", explanation: "gi0/0 vs. GigabitEthernet0/0 vs. g0/0 — IOS akzeptiert Kurzformen, aber Tippfehler in der Nummer (z. B. gi0/1 statt gi0/0) landen auf dem falschen Port." },
              { cmd: "Falsche Maske am /30-Link", explanation: "R1 und R2 müssen auf demselben Subnetz liegen (hier beide 255.255.255.252) — sonst zeigt show ip interface brief zwar up/up, der Ping schlägt trotzdem fehl." },
              { cmd: "show ip interface brief zu früh geprüft", explanation: "Direkt nach no shutdown kann das Interface kurz 'down/down' zeigen, bis die Konsolenmeldung 'changed state to up' erscheint — Sekunden abwarten." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip interface brief", expected: "Alle konfigurierten Interfaces: Status up, Protocol up" },
      { cmd: "show interfaces description", expected: "Jedes Interface hat eine Description" },
      { cmd: "ping 10.0.0.2 (von R1)", expected: "!!!!! — 100% Erfolg über den /30-Link" },
      { cmd: "show startup-config | include hostname", expected: "R1 und R2 zeigen jeweils ihren gespeicherten Hostnamen" },
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
    duration: "15 min",
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
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1",
                explanation: "Einstieg wie immer: enable → configure terminal → hostname. Auch im Drill nicht überspringen.",
              },
            ],
          },
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
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Mit `do` direkt aus dem Config-Modus speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2: identisch wiederholen — aus dem Gedächtnis",
        blocks: [
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nvlan 10\nname BUERO\nvlan 20\nname LABOR\ninterface range fa0/1 - 8\nswitchport mode access\nswitchport access vlan 10\nspanning-tree portfast\ninterface range fa0/9 - 16\nswitchport mode access\nswitchport access vlan 20\nspanning-tree portfast",
                explanation:
                  "Runde 2 aus dem Gedächtnis: Einstieg, 2 VLANs, 2× Dreierschritt. Stoppuhr: unter 90 Sekunden ist das Ziel. Bildschirm vorher abdecken, danach mit SW1 vergleichen.",
              },
              {
                cmd: "do show vlan brief",
                explanation:
                  "Sofort-Kontrolle ohne den Config-Modus zu verlassen: Fa0/1–8 in VLAN 10, Fa0/9–16 in VLAN 20?",
              },
              {
                cmd: "do copy running-config startup-config",
                explanation: "Auch SW2 speichern — nicht nur SW1.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Access-Ports im Akkord",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "VLAN vergessen anzulegen", explanation: "switchport access vlan 20 wird auch ohne existierendes VLAN 20 akzeptiert — der Port hängt dann in einem 'inactive' VLAN, bis es angelegt wird." },
              { cmd: "Falscher Port-Bereich in interface range", explanation: "fa0/1 - 8 (mit Leerzeichen um den Bindestrich) ist Pflichtsyntax — fa0/1-8 ohne Leerzeichen wird von IOS abgelehnt." },
              { cmd: "PortFast auf einem Trunk oder Uplink", explanation: "spanning-tree portfast gehört NUR auf Access-Ports zu Endgeräten — auf einem Switch-Uplink kann es einen Loop verursachen." },
              { cmd: "Speichern vergessen nach interface range", explanation: "Gerade bei vielen Ports in einem Rutsch wird das abschließende copy running-config startup-config oft übersehen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief", expected: "VLAN 10 BUERO: Fa0/1-8, VLAN 20 LABOR: Fa0/9-16 (auf beiden Switches)" },
      { cmd: "show interfaces fa0/1 switchport", expected: "Administrative Mode: static access, Access Mode VLAN: 10" },
      { cmd: "show running-config | section interface", expected: "Jeder Port: mode access + access vlan + portfast" },
      { cmd: "show startup-config | include hostname", expected: "SW1 und SW2 zeigen jeweils ihren gespeicherten Hostnamen" },
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
];
