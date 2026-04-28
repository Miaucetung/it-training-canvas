// ============================================================
// CCNA Topic: Device Management Protocols
// Quelle: CCNA 200-301 Official Cert Guide V2, Ch 13 + 17
// CDP/LLDP, NTP, Syslog, SNMP, FTP/TFTP
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_CDP_LLDP: Concept = {
  id: "cdp-lldp",
  title: "CDP & LLDP — Discovery-Protokolle",
  appliesTo: ["ccna"],
  tags: ["cisco", "cdp", "lldp", "discovery", "device-management"],
  content: `
## CDP — Cisco Discovery Protocol

CDP ist ein **Cisco-proprietäres** Layer-2-Protokoll, das benachbarte Cisco-Geräte
automatisch erkennt — ohne IP-Adressen zu kennen.

### Eigenschaften
- Ethernet-Multicast: \`01:00:0C:CC:CC:CC\`
- Default Hello-Intervall: **60 s**, Holdtime: **180 s**
- Pakete enthalten: Device-ID, IP-Adresse, Plattform, Capabilities, Interface, IOS-Version

### Befehle
\`\`\`
SW# show cdp                          ! global aktiv?
SW# show cdp neighbors                ! kurze Liste
SW# show cdp neighbors detail         ! IP-Adressen, Plattform, IOS
SW# show cdp interface gi0/1
SW(config)# no cdp run                ! global deaktivieren
SW(config-if)# no cdp enable          ! pro Interface deaktivieren
\`\`\`

### Sicherheits-Aspekt
CDP verrät viel über die Topologie. Empfehlung: an Endgerät-Ports und Edge-Ports
(\`no cdp enable\`) deaktivieren, intern aktiv lassen.

## LLDP — Link Layer Discovery Protocol (IEEE 802.1AB)

**Hersteller-übergreifender Standard** — Pendant zu CDP. Zwischen Cisco und Nicht-Cisco-Geräten Pflicht.

### Aktivieren
\`\`\`
SW(config)# lldp run                  ! Default: aus
SW# show lldp neighbors
SW# show lldp neighbors detail
\`\`\`

### Vergleich CDP vs. LLDP
| Eigenschaft | CDP | LLDP |
|-------------|-----|------|
| Standard | Cisco-proprietär | IEEE 802.1AB |
| Default-Status | aktiv | inaktiv |
| Hello / Hold | 60 / 180 s | 30 / 120 s |
| TLVs | Cisco-spezifisch | offen, erweiterbar |

Beide Protokolle können parallel laufen.
  `.trim(),
};

export const CONCEPT_NTP: Concept = {
  id: "ntp",
  title: "NTP — Network Time Protocol",
  appliesTo: ["ccna"],
  tags: ["ntp", "time", "device-management", "udp"],
  content: `
## NTP (RFC 5905, UDP 123)

Synchronisiert die Uhrzeit auf Netzwerkgeräten — Voraussetzung für korrekte
Zertifikate, Logs, Forensik und Kerberos-Authentifizierung.

### Stratum-Hierarchie
| Stratum | Quelle |
|---------|--------|
| 0 | Atomuhr, GPS — keine Netzwerkverbindung |
| 1 | Server direkt mit Stratum-0-Quelle (z. B. ptbtime1.ptb.de) |
| 2–15 | Server, die ihre Zeit von einem niedrigeren Stratum beziehen |
| 16 | "unsynchronized" — keine Zeitquelle |

### Cisco als NTP-Client
\`\`\`
R1(config)# ntp server 10.0.0.1
R1(config)# ntp server pool.ntp.org
R1# show ntp associations               ! "*" = sync mit dieser Quelle
R1# show ntp status
R1# show clock
\`\`\`

### Cisco als NTP-Server
\`\`\`
R1(config)# ntp master 3                ! eigene Stratum-3-Quelle
\`\`\`

### NTP-Authentifizierung
\`\`\`
R1(config)# ntp authenticate
R1(config)# ntp authentication-key 1 md5 GeheimerKey
R1(config)# ntp trusted-key 1
R1(config)# ntp server 10.0.0.1 key 1
\`\`\`

### Zeitzone & Sommerzeit
\`\`\`
R1(config)# clock timezone CET 1
R1(config)# clock summer-time CEST recurring last Sun Mar 2:00 last Sun Oct 3:00
\`\`\`
  `.trim(),
};

export const CONCEPT_SYSLOG: Concept = {
  id: "syslog",
  title: "Syslog — Logging & Severity",
  appliesTo: ["ccna"],
  tags: ["syslog", "logging", "device-management", "udp"],
  content: `
## Syslog (RFC 5424, UDP 514)

Zentralisiertes Logging — alle Cisco-Geräte schicken Meldungen an einen Syslog-Server.

### Severity-Level (0 = wichtigster!)
| Level | Name | Beispiel |
|-------|------|---------|
| 0 | Emergency | System unbenutzbar |
| 1 | Alert | Sofortiges Eingreifen nötig |
| 2 | Critical | Kritischer Zustand |
| 3 | Error | Fehlermeldung |
| 4 | Warning | Warnung |
| 5 | Notification | Normale, aber bemerkenswerte Ereignisse (Interface up/down) |
| 6 | Informational | Informationen |
| 7 | Debugging | \`debug\`-Output |

Eselsbrücke: **E**very **A**wesome **C**isco **E**ngineer **W**ill **N**eed **I**ce-cream **D**aily.

### Format einer Syslog-Meldung
\`\`\`
*Mar 1 00:23:45.123: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
\`\`\`
- Timestamp · **Facility** · **Severity** · Mnemonic · Beschreibung

### Konfiguration auf Cisco
\`\`\`
R1(config)# logging host 10.0.0.50           ! Syslog-Server
R1(config)# logging trap warnings            ! Level 0–4 senden
R1(config)# logging buffered 16384 informational
R1(config)# service timestamps log datetime msec
R1(config)# service sequence-numbers
R1# show logging
\`\`\`

### Console- vs. Buffered- vs. Monitor-Logging
- \`logging console\`: in Konsolen-Sitzung
- \`logging monitor\`: in VTY-Sitzungen (nur nach \`terminal monitor\`)
- \`logging buffered\`: im RAM-Puffer (\`show logging\`)
- \`logging host\`: an externen Server
  `.trim(),
};

export const CONCEPT_SNMP: Concept = {
  id: "snmp",
  title: "SNMP — Simple Network Management Protocol",
  appliesTo: ["ccna"],
  tags: ["snmp", "monitoring", "device-management", "udp"],
  content: `
## SNMP (UDP 161 / 162)

NMS (Network Management System) fragt Geräte ab oder empfängt Traps.

### Komponenten
- **Manager (NMS)**: PRTG, LibreNMS, SolarWinds, Cacti, Nagios
- **Agent**: läuft auf Switch/Router
- **MIB**: Hierarchischer Objektbaum mit OIDs

### Operationen
| Operation | Richtung | Zweck |
|-----------|----------|-------|
| Get / GetNext / GetBulk | Manager → Agent (UDP 161) | Werte abfragen |
| Set | Manager → Agent (UDP 161) | Werte schreiben |
| Trap / Inform | Agent → Manager (UDP 162) | Ereignis-Benachrichtigung |

Inform = Trap mit Bestätigung (zuverlässiger).

### SNMP-Versionen
| Version | Auth | Verschlüsselung | Empfehlung |
|---------|------|----------------|-----------|
| v1 | Community-String (Klartext) | Nein | ❌ veraltet |
| v2c | Community-String (Klartext) | Nein | ⚠️ nur read-only intern |
| **v3** | User + Hash (HMAC-MD5/SHA) | Ja (DES/AES) | ✅ produktiv nutzen |

### SNMPv3 Sicherheits-Level
- **noAuthNoPriv** — keine Auth, keine Verschlüsselung
- **authNoPriv** — Auth (MD5/SHA), keine Verschlüsselung
- **authPriv** — Auth + Verschlüsselung (AES) ✅

\`\`\`
R1(config)# snmp-server group ADMINS v3 priv
R1(config)# snmp-server user mmustermann ADMINS v3 auth sha AuthPwd123 priv aes 128 PrivPwd123
R1(config)# snmp-server host 10.0.0.50 version 3 priv mmustermann
\`\`\`
  `.trim(),
};

export const CONCEPT_DEVICE_MGMT_GUIDE: Concept = {
  id: "device-management-guide",
  title: "Lernguide: Device Management Protocols",
  appliesTo: ["ccna"],
  tags: ["cdp", "lldp", "ntp", "syslog", "snmp", "guide"],
  content: `
## Lernziele
- CDP- und LLDP-Nachbarn anzeigen und die Vor- und Nachteile beider Protokolle benennen
- Einen Cisco-Router als NTP-Client und als NTP-Master konfigurieren
- Die acht Syslog-Severity-Level der Reihe nach (0–7) benennen
- Auf Cisco-Geräten Syslog an einen externen Server (\`logging host\`) senden
- SNMPv3 mit authPriv und einem Trap-Empfänger konfigurieren

## Praxis-Szenario
Das "Klinikum am Park" (3 Standorte, 22 Cisco-Switches, 8 Router) standardisiert sein Monitoring. Alle Geräte sollen über NTP (Master: 10.10.0.10, Stratum 2) synchronisiert sein, Syslog-Meldungen ab Severity 4 (\`warnings\`) an den Syslog-Server 10.10.0.20 schicken und über SNMPv3 mit Auth+Priv (User \`klinik-monitor\`) an PRTG (10.10.0.30) gemeldet werden. Außerdem soll an allen Edge-Ports (Patientenzimmer) CDP deaktiviert, aber LLDP für VoIP-Telefone aktiviert sein.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit drei Switches (Standort A, B, C) verbunden über einen zentralen Core-Router. Platziere am Core den NTP-Master, im Server-Subnetz den Syslog- und SNMP-Server. Beschrifte den NTP-Pfad mit Stratum-Werten (1 → 2 → 3).
**Ziel:** Stratum-Hierarchie und Logging-Pfade visualisieren.
**Tipps:** Bei \`logging trap warnings\` werden alle Severity-Level **0–4** gesendet — eine niedrigere Zahl bedeutet wichtiger. \`debugging\` (Level 7) sollte niemals an einen produktiven Syslog-Server gehen.

## Verständnisfragen
1. Welche zwei Severity-Level liegen zwischen "Critical" und "Warning"? In welcher Reihenfolge?
2. Warum ist NTP-Authentifizierung wichtig — was kann ein Angreifer mit gefälschten Zeit-Paketen erreichen?
3. Was ist der Unterschied zwischen einer SNMP-Trap und einem Inform — wann nutzt man welches?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **CDP/LLDP an Edge-Ports aktiv lassen:** Ein Angreifer kann mit einem Sniffer Topologie, IOS-Version und Plattform auslesen — ideal für Exploits. \`no cdp enable\` und \`no lldp transmit/receive\` an User-Ports.
- ⚠️ **Syslog ohne Timestamps:** Ohne \`service timestamps log datetime msec\` haben alle Meldungen relative Uptime — bei Forensik unbrauchbar. Immer aktivieren und NTP nutzen.
- ⚠️ **SNMPv2c mit "public"/"private":** Default-Communities sind weltweit bekannt. Niemals nutzen — entweder eigene Strings ODER (besser) sofort SNMPv3.
  `.trim(),
};

export const TOPIC_DEVICE_MANAGEMENT: Topic = {
  id: "device-management",
  title: "Device Management Protocols",
  description:
    "CDP/LLDP-Discovery, NTP-Zeitsynchronisation, Syslog-Severity und SNMPv3 — die Operations-Werkzeuge.",
  conceptIds: [
    "cdp-lldp",
    "ntp",
    "syslog",
    "snmp",
    "device-management-guide",
  ],
  quizIds: ["ccna-quiz-device-management"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ios-cli"],
  estimatedMinutes: 120,
  tags: ["device-management", "cdp", "lldp", "ntp", "syslog", "snmp"],
};

export const DEVICE_MANAGEMENT_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_CDP_LLDP.id]: CONCEPT_CDP_LLDP,
  [CONCEPT_NTP.id]: CONCEPT_NTP,
  [CONCEPT_SYSLOG.id]: CONCEPT_SYSLOG,
  [CONCEPT_SNMP.id]: CONCEPT_SNMP,
  [CONCEPT_DEVICE_MGMT_GUIDE.id]: CONCEPT_DEVICE_MGMT_GUIDE,
};
