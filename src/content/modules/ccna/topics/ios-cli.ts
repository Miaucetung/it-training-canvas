// ============================================================
// CCNA Topic: Cisco IOS CLI Grundlagen
// Quelle: CCNA 200-301 Official Cert Guide V1, Ch 4, 6, 7
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_IOS_CLI_BASICS: Concept = {
  id: "ios-cli-basics",
  title: "Cisco IOS CLI — Modi & Navigation",
  appliesTo: ["ccna"],
  tags: ["cisco", "ios", "cli", "configuration", "networking"],
  content: `
## Cisco IOS CLI

Cisco IOS (und IOS XE) ist das Betriebssystem auf Cisco-Switches/Routern.
Der Zugriff erfolgt über Konsole, Telnet, SSH oder die WebUI.

### Hierarchie der CLI-Modi
\`\`\`
User EXEC Mode          Switch>           # Anzeige eingeschränkt
   ↓ enable
Privileged EXEC Mode    Switch#           # Alle show/debug-Befehle
   ↓ configure terminal
Global Config Mode      Switch(config)#   # Globale Einstellungen
   ↓ interface gi0/1, line vty 0 15, router ospf 1, ...
Submode                 Switch(config-if)#
\`\`\`

### Modus-Wechsel-Befehle
| Aus → Nach | Befehl |
|-----------|--------|
| User → Privileged | \`enable\` |
| Privileged → User | \`disable\` |
| Privileged → Global | \`configure terminal\` |
| Submode → eine Ebene zurück | \`exit\` |
| Beliebiger Submode → Privileged | \`end\` oder Strg+Z |

### Help-System
- \`?\` → alle möglichen Befehle in aktuellem Modus
- \`sh ?\` → alle Befehle die mit "sh" beginnen
- \`show ?\` → alle Parameter für \`show\`
- \`Tab\` → vervollständigt teilweise eingegebene Befehle
- Eindeutige Abkürzungen funktionieren: \`sh ru\` = \`show running-config\`

### Konfigurationsdateien
| Datei | Speicherort | Bedeutung |
|-------|-------------|-----------|
| running-config | RAM (volatile) | Aktuell aktive Konfiguration |
| startup-config | NVRAM | Beim Booten geladen |
| IOS Image | Flash | Betriebssystem-Datei |

\`\`\`
Switch# show running-config
Switch# show startup-config
Switch# copy running-config startup-config   ! "wr" oder "write memory"
Switch# erase startup-config                 ! Werks-Reset (nach reload)
Switch# reload
\`\`\`

### Hilfreiche Befehle für Diagnose
\`\`\`
Switch# show version          ! IOS-Version, Uptime, Hardware
Switch# show inventory        ! Slot/Modul-Bestückung
Switch# show interfaces       ! Counter, Errors, Status aller Ports
Switch# show interfaces status
Switch# show ip interface brief
Switch# show flash:           ! Flash-Inhalt
Switch# show clock
\`\`\`
  `.trim(),
};

export const CONCEPT_IOS_DEVICE_ACCESS: Concept = {
  id: "ios-device-access",
  title: "Konsolen-, Telnet- und SSH-Zugriff",
  appliesTo: ["ccna"],
  tags: ["cisco", "ios", "ssh", "telnet", "console", "security"],
  content: `
## Zugang zur CLI

### Konsolenzugang (Out-of-Band)
- RJ-45-Konsolenport oder USB-Mini-B
- Terminalprogramm (PuTTY, Tera Term): **9600 8N1, kein Flow Control**
- Funktioniert auch ohne IP-Konfiguration → Erstinbetriebnahme

### Konsolen-Passwort konfigurieren
\`\`\`
Switch(config)# line console 0
Switch(config-line)# password Cisco123
Switch(config-line)# login
Switch(config-line)# exec-timeout 10 0       ! Auto-Logout nach 10 min
Switch(config-line)# logging synchronous     ! Log-Meldungen stören Eingabe nicht
\`\`\`

### Telnet vs. SSH
| | Telnet | SSH |
|---|--------|-----|
| Port | TCP 23 | TCP 22 |
| Verschlüsselung | ❌ Klartext | ✅ Verschlüsselt |
| Empfehlung | nicht im Produktivnetz! | **immer SSH** |

### SSH einrichten (Pflichtprozedur)
\`\`\`
! 1. Hostname und Domain (für RSA-Schlüssel notwendig)
Switch(config)# hostname SW1
SW1(config)# ip domain-name beispiel.local

! 2. RSA-Schlüssel generieren (mind. 1024 Bit, 2048 empfohlen)
SW1(config)# crypto key generate rsa modulus 2048

! 3. SSH-Version 2 erzwingen
SW1(config)# ip ssh version 2

! 4. Lokalen Benutzer anlegen (mit "secret" = Hash, nicht "password")
SW1(config)# username admin privilege 15 secret StarkesPasswort!

! 5. VTY-Lines auf SSH umschalten
SW1(config)# line vty 0 15
SW1(config-line)# transport input ssh        ! kein telnet mehr
SW1(config-line)# login local                ! lokale Userdatenbank
\`\`\`

### Privilege Levels
- 0: \`disable\`, \`enable\`, \`exit\`, \`help\`, \`logout\`
- 1: User EXEC (Default nach Login)
- 15: Privileged EXEC (alle Rechte)

### Banner (Rechtshinweis)
\`\`\`
SW1(config)# banner motd #
Unauthorized access prohibited!
#
\`\`\`
  `.trim(),
};

export const CONCEPT_IOS_INTERFACE_CONFIG: Concept = {
  id: "ios-interface-config",
  title: "Interfaces konfigurieren & Fehler analysieren",
  appliesTo: ["ccna"],
  tags: ["cisco", "ios", "interface", "duplex", "speed", "troubleshooting"],
  content: `
## Switch- und Router-Interfaces

### Status-Codes verstehen (\`show ip interface brief\`)
| Status | Protocol | Bedeutung |
|--------|----------|-----------|
| up | up | Interface arbeitet ✅ |
| up | down | Layer-2-Problem (Encap-Mismatch, kein Keepalive) |
| down | down | Kein Signal (Kabel, Gegenstelle aus) |
| administratively down | down | \`shutdown\` aktiv → \`no shutdown\` |
| err-disabled | – | Port gesperrt durch Port-Security/BPDU Guard |

### Geschwindigkeit & Duplex (Autonegotiation)
\`\`\`
SW(config-if)# speed auto                ! oder 10/100/1000
SW(config-if)# duplex auto               ! oder half/full
\`\`\`

### Duplex-Mismatch — der Klassiker
- Eine Seite Full-Duplex, andere Half-Duplex
- Symptome: Hohe **late collisions**, **Runts**, **CRC errors**, niedrige Performance
- \`show interfaces gi0/1\` → Counter "input errors", "late collisions"
- Fix: Beide Seiten gleich konfigurieren (am besten beide auto)

### Beschreibung & Range
\`\`\`
SW(config)# interface range gi0/1 - 12
SW(config-if-range)# description Access-Ports VLAN 10
SW(config-if-range)# switchport mode access
SW(config-if-range)# switchport access vlan 10
\`\`\`

### Konfiguration entfernen
\`\`\`
SW(config-if)# no description           ! einzelnen Befehl entfernen
SW(config)#    default interface gi0/1  ! komplettes Interface zurücksetzen
\`\`\`

### Auto-MDIX
- Erkennt automatisch Straight-Through vs. Crossover
- Aktiv wenn speed UND duplex auf "auto" stehen
- Befehl: \`mdix auto\`
  `.trim(),
};

export const CONCEPT_IOS_GUIDE: Concept = {
  id: "ios-cli-guide",
  title: "Lernguide: Cisco IOS CLI",
  appliesTo: ["ccna"],
  tags: ["ios", "cli", "cisco", "guide"],
  content: `
## Lernziele
- Zwischen User-, Privileged- und Global-Config-Mode wechseln
- Lokalen User mit \`secret\` anlegen und SSH v2 auf einem Switch aktivieren
- running-config in startup-config sichern und einen Werks-Reset durchführen
- Interface-Status \`up/up\`, \`up/down\`, \`down/down\`, \`admin down\`, \`err-disabled\` interpretieren
- Duplex-Mismatch anhand der Interface-Counter erkennen

## Praxis-Szenario
Die "Stadtbibliothek Mannheim" hat einen neuen Cisco Catalyst 9200 erhalten. Werksauslieferung — keine Konfiguration. Eine Auszubildende soll: Hostname (\`BIB-SW1\`) setzen, Management-VLAN (VLAN 99, IP 10.10.99.10/24) konfigurieren, SSH v2 mit User \`admin\` und 2048-Bit-RSA-Schlüssel einrichten, Telnet deaktivieren, ein Banner setzen und alles in der startup-config sichern. Anschließend werden 12 Access-Ports (Gi1/0/1 – Gi1/0/12) per Range-Befehl auf VLAN 50 (Lese-PCs) konfiguriert.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit einem Cisco Catalyst 9200 und einem PC, der per Konsolenkabel angeschlossen ist (Out-of-Band-Management). Zeichne zusätzlich einen zweiten PC, der per Ethernet an Gi1/0/1 hängt und per SSH zugreifen können soll. Beschrifte SSH-Port (TCP 22) und das Management-VLAN (99) als Notiz.
**Ziel:** Den Unterschied zwischen Out-of-Band-Konsole und In-Band-Management (SSH über VLAN 99) visualisieren.
**Tipps:** SSH funktioniert nur, wenn Hostname, Domain-Name, RSA-Key, lokaler User UND \`transport input ssh\` auf den VTY-Lines konfiguriert sind. Fehlt einer der fünf Punkte, schlägt die Verbindung fehl.

## Verständnisfragen
1. Welche fünf Schritte sind nötig, damit SSH v2 funktioniert? Nenne sie in der korrekten Reihenfolge.
2. Was ist der Unterschied zwischen \`enable password\` und \`enable secret\` — welcher Befehl ist heute Pflicht?
3. Warum genügt \`copy run start\` nicht, um eine fehlerhafte Konfiguration rückgängig zu machen — was ist ein besserer Weg?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **\`password\` statt \`secret\` verwendet:** \`enable password\` speichert Klartext (oder schwaches Type-7-Encoding). \`enable secret\` (oder \`username … secret\`) erzeugt einen Type-9- oder Type-8-Hash. Heute ist \`secret\` Pflicht.
- ⚠️ **SSH-Schlüssel zu klein gewählt:** \`crypto key generate rsa modulus 512\` reicht für SSH v1, aber nicht für SSH v2. Mindestens 768 Bit (SSH v2) — produktiv 2048.
- ⚠️ **\`copy run start\` vergessen:** Nach jeder Änderung an running-config ist die startup-config noch alt. Beim nächsten Reload sind alle Änderungen weg. Faustregel: nach jeder erfolgreich getesteten Änderung **\`wr\`** (write memory).
  `.trim(),
};

export const TOPIC_IOS_CLI: Topic = {
  id: "ios-cli",
  title: "Cisco IOS CLI",
  description:
    "Cisco IOS CLI-Modi, SSH-Konfiguration, Interface-Management und Diagnose mit show-Befehlen.",
  conceptIds: [
    "ios-cli-basics",
    "ios-device-access",
    "ios-interface-config",
    "ios-cli-guide",
    "ios-cli-glossary",
    "ios-terminal",
  ],
  quizIds: ["ccna-quiz-ios-cli"],
  exerciseIds: [],
  prerequisiteTopicIds: ["networking-fundamentals"],
  estimatedMinutes: 120,
  tags: ["ios", "cli", "cisco", "ssh", "configuration"],
};

const CONCEPT_IOS_TERMINAL: Concept = {
  id: "ios-terminal",
  title: "IOS Terminal Emulator",
  appliesTo: ["ccna"],
  tags: ["ios", "cli", "terminal", "interactive"],
  content: `## IOS Terminal Emulator

Der integrierte Terminal-Emulator ermöglicht die interaktive Eingabe von Cisco IOS-Befehlen direkt im Browser — ohne physischen Router oder Switch.

**Starte den Emulator** über den Button im Topic-Bereich, um IOS-Konfigurationsbefehle zu üben:
- Modi wechseln (User / Privileged / Global Config)
- SSH konfigurieren
- Interface-Befehle eingeben und Feedback erhalten`.trim(),
};

export const IOS_CLI_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_IOS_CLI_BASICS.id]: CONCEPT_IOS_CLI_BASICS,
  [CONCEPT_IOS_DEVICE_ACCESS.id]: CONCEPT_IOS_DEVICE_ACCESS,
  [CONCEPT_IOS_INTERFACE_CONFIG.id]: CONCEPT_IOS_INTERFACE_CONFIG,
  [CONCEPT_IOS_GUIDE.id]: CONCEPT_IOS_GUIDE,
  [CONCEPT_IOS_TERMINAL.id]: CONCEPT_IOS_TERMINAL,
};
