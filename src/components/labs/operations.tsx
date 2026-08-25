import {
  HardDrives,
  Info,
  Key,
  Shield,
  Stack,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const OPERATIONS_LABS: LabScenario[] = [

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
        title: "Switch: Recovery über den Boot-Loader (auf realer Hardware)",
        blocks: [
          {
            device: "Hinweis",
            mode: "info",
            modeLabel: "Nur auf realer Hardware zuverlässig testbar",
            commands: [
              {
                cmd: "flash_init",
                explanation:
                  "Switch beim Booten mit gedrückter MODE-Taste in den Boot-Loader bringen, dann Flash initialisieren. Der `switch:`-Bootloader-Prompt lässt sich in Packet Tracer 9.0 nicht zuverlässig reproduzieren — dieser Ablauf entspricht realer Cisco-Catalyst-Hardware, nicht der Simulation.",
              },
              {
                cmd: "rename flash:config.text flash:config.old\nboot",
                explanation:
                  "Die startup-config (config.text) umbenennen → Switch bootet ohne Passwort. Nach dem Boot zurückbenennen und mit 'copy startup running' zurückholen. In PT stattdessen die Router-Recovery (0x2142) als Übungsgrundlage nutzen — das Prinzip ist identisch: Boot ohne startup-config, Passwort neu setzen, Ursprungszustand wiederherstellen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei der Password Recovery",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "copy startup-config running-config vergessen", explanation: "Wird direkt gespeichert, ohne vorher die alte Config zurückzuholen, überschreibt write memory die gesamte Konfiguration mit einer leeren — alle VLANs, Routen und Interfaces sind weg." },
              { cmd: "config-register nicht zurückgesetzt", explanation: "Bleibt das Register auf 0x2142, ignoriert der Router bei JEDEM künftigen Reload die startup-config — das neue Passwort geht beim nächsten Neustart wieder verloren." },
              { cmd: "Boot-Unterbrechung verpasst", explanation: "Das Zeitfenster für Strg+Pause/Break (bzw. Ctrl+C in PT) ist kurz — verpasst man es, bootet das Gerät normal durch und fragt wieder nach dem unbekannten Passwort." },
              { cmd: "Falsches Register gesetzt", explanation: "confreg 0x2142 ist der Standard zum Überspringen der startup-config — ein Tippfehler (z. B. 0x1242) führt zu unvorhersehbarem Bootverhalten." },
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
      { term: "flash_init", def: "Boot-Loader-Befehl des Switches, der den Flash initialisiert, bevor config.text umbenannt wird. Auf realer Hardware, nicht zuverlässig in Packet Tracer." },
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
    duration: "25 min",
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
            modeLabel: "Router>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC wechseln — Voraussetzung für alle copy/show-Befehle dieses Wartungslabs." },
            ],
          },
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
                  "Neues Image vom Server in den Flash laden. Server-IP + exakter Dateiname nötig. Auf realer Hardware würde man direkt danach mit verify /md5 flash:<dateiname> die MD5-Prüfsumme gegen Ciscos Angabe vergleichen und so eine beschädigte Datei vor dem Reload erkennen — in Packet Tracer 9.0 zeigt dieser Befehl kein echtes Verifikationsverhalten und entfällt daher hier.",
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
      {
        title: "Typische Fehler bei IOS-Backup & Upgrade",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Backup übersprungen, direkt neues Image geladen", explanation: "Ohne vorheriges copy flash: tftp: gibt es keine Rückfallebene — schlägt das neue Image fehl, ist der Router ohne funktionierendes Backup-Image nicht mehr bootfähig." },
              { cmd: "Zu wenig Flash-Speicher für zwei Images", explanation: "show flash: vor dem Laden zu prüfen ist Pflicht — reicht der Platz nicht für altes UND neues Image gleichzeitig, bricht copy tftp: flash: mitten im Transfer ab." },
              { cmd: "boot system vergessen", explanation: "Ohne den boot system-Befehl bootet der Router beim nächsten Start das ALPHABETISCH ERSTE Image im Flash — nicht zwingend das neu geladene." },
              { cmd: "Speichern vor dem reload vergessen", explanation: "Ohne write memory ist der neue boot system-Eintrag nur in der running-config — nach dem reload greift wieder die alte Boot-Reihenfolge." },
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
    duration: "20 min",
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
        title: "SW1: Grundkonfiguration",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
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
              { cmd: "clear counters", explanation: "Counter ALLER Interfaces zurücksetzen. Auf realer Catalyst-Hardware würde man bei einem konkreten Kabelverdacht zusätzlich test cable-diagnostics tdr interface <port> ausführen — ein TDR-Impuls misst per Signalreflexion exakt, an welcher Stelle im Kabel ein Adernpaar unterbrochen ist. In Packet Tracer 9.0 zeigt dieser Befehl kein echtes Diagnoseverhalten und entfällt daher hier." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei der Layer-1-Diagnose",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Counter direkt nach clear counters bewertet", explanation: "Nach dem Zurücksetzen sind alle Werte 0 — das beweist noch nichts. Erst nach einigen Minuten aktiven Traffics sagt der Counter-Stand etwas über das tatsächliche Problem aus." },
              { cmd: "duplex/speed nur auf einer Seite fest gesetzt", explanation: "Wird ein Ende fest auf full/100 gesetzt, das andere aber auf auto belassen, entsteht ein Duplex-Mismatch — genau die Ursache, die man eigentlich beheben wollte." },
              { cmd: "CRC-Fehler für ein Software-Problem gehalten", explanation: "CRC-Fehler sind so gut wie immer Layer 1 (Kabel, Stecker, Transceiver, Störquelle) — kein Konfigurationsfehler, den man mit CLI-Befehlen beheben könnte." },
              { cmd: "Late Collisions mit normalen Collisions verwechselt", explanation: "Collisions sind auf Half-Duplex normal; Late Collisions (nach Byte 64) sind auf Full-Duplex-Ports IMMER ein Alarmsignal für Duplex-Mismatch oder zu lange Kabel." },
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "Client Rot",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ipconfig /release\nipconfig /renew\nipconfig",
                explanation: "Gegenprobe: Client Rot muss jetzt eine echte 172.16.51.x-Adresse bekommen statt 169.254.x.x — der Beweis, dass der Fix wirkt.",
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
          {
            device: "Client Blau",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ipconfig /release\nipconfig /renew\nipconfig",
                explanation: "Gegenprobe: Client Blau muss jetzt eine Adresse ab 172.16.61.10 bekommen — nicht mehr die Gateway-IP .1.",
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
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              {
                cmd: "show ip interface brief | include Vlan1",
                explanation: "Gegenprobe: Vlan1 muss jetzt up/up mit 192.168.2.50 zeigen — Management per Telnet/SSH ist ab jetzt möglich.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei der DHCP-Fehlersuche",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "169.254.x.x mit einer normalen IP verwechselt", explanation: "APIPA ist kein gültiger DHCP-Lease, sondern die Selbstvergabe des Clients — sie beweist, dass GAR KEINE Antwort vom Server ankam, nicht dass der Pool falsch konfiguriert ist." },
              { cmd: "Gateway-Konflikt für ein Server-Problem gehalten", explanation: "Vergibt der Pool die Gateway-Adresse selbst, liegt der Fehler in der Pool-Konfiguration (fehlende Exclusion) — nicht im Routing oder Relay." },
              { cmd: "SVI-Fix vergessen zu speichern", explanation: "Ohne copy running-config startup-config geht der no-shutdown-Fix beim nächsten Reload wieder verloren — der Management-Zugriff fällt erneut aus." },
              { cmd: "Nur ipconfig ohne vorheriges /release geprüft", explanation: "Ein alter, noch gültiger Lease kann den Fix verschleiern — ipconfig /release vor /renew erzwingt eine frische DHCP-Anfrage und zeigt den echten aktuellen Zustand." },
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
];
