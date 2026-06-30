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

:::kernidee
Discovery-Protokolle beantworten **„Was hängt eigentlich an diesem Port?"** — auf **Layer 2**, also noch **bevor** IP konfiguriert ist. Genau deshalb sind sie Gold beim Troubleshooting (falsch verkabelt? falscher Nachbar?), aber auch ein **Informationsleck**: Wer mithört, sieht Modell, IOS-Version und Topologie frei Haus.
:::

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

:::kernidee
Zeit ist die **gemeinsame Wahrheit** im Netz: Logs aus 20 Geräten lassen sich nur korrelieren, wenn alle dieselbe Uhrzeit haben. Zertifikate (Gültigkeit), Kerberos (5-Minuten-Fenster) und jede Forensik brechen ohne synchrone Uhren. Das **Stratum** misst dabei nur die *Distanz zur Referenzuhr* — nicht die Genauigkeit an sich.
:::

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

:::merke
**Severity 0 = am wichtigsten**, 7 = am unwichtigsten (Debug) — die Zahl ist *umgekehrt* zur Dringlichkeit. \`logging trap warnings\` (4) sendet daher **0–4**. Eselsbrücke: **E**very **A**wesome **C**isco **E**ngineer **W**ill **N**eed **I**ce-cream **D**aily (Emergency→Debugging).
:::

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

:::falle
**SNMPv1/v2c senden den Community-String im Klartext** — wer mitliest, kann das Gerät auslesen (read) oder bei \`RW\` sogar konfigurieren. Nur **SNMPv3 mit authPriv** bietet echte Authentifizierung **und** Verschlüsselung. „v2c ist sicher genug" ist falsch.
:::

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

:::falle
Management-Protokoll-Fallen:
- **CDP/LLDP an Edge-Ports aktiv:** Ein Sniffer liest Topologie, IOS-Version und Plattform aus → \`no cdp enable\` / \`no lldp transmit\`/\`receive\` an User-Ports.
- **Syslog ohne Timestamps:** Ohne \`service timestamps log datetime msec\` + NTP haben Meldungen nur relative Uptime — für Forensik wertlos.
- **SNMPv2c mit "public"/"private":** Default-Communities sind weltweit bekannt — nie nutzen, direkt SNMPv3.
:::
  `.trim(),
};

export const CONCEPT_TFTP_FTP: Concept = {
  id: "tftp-ftp",
  title: "TFTP, FTP & SCP — Cisco IOS Image Management",
  appliesTo: ["ccna"],
  tags: ["tftp", "ftp", "scp", "sftp", "ios", "device-management", "file-transfer"],
  content: `
## Dateiübertragungsprotokolle im Überblick

| Protokoll | Transport | Port | Auth | Verschlüsselung | Einsatz |
|-----------|-----------|------|------|----------------|---------|
| **TFTP** | UDP | 69 | Nein | Nein | IOS-Images, Konfig-Backup |
| **FTP** | TCP | 20 (Daten), 21 (Control) | Ja (User/Pass) | Nein | IOS-Images, größere Dateien |
| **SCP** | TCP | 22 (SSH) | Ja (SSH) | Ja (SSH) | Sicheres Konfig-Backup |
| **SFTP** | TCP | 22 (SSH) | Ja (SSH) | Ja (SSH) | Sichere Dateiübertragung |

> **Prüfungstipp:** TFTP ist zustandslos und einfach, aber ohne Auth und Verschlüsselung.
> FTP hat zwei Ports: TCP 21 (Kommandokanal) und TCP 20 (Datenkanal).

---

## TFTP — Trivial File Transfer Protocol (RFC 1350)

- **Transport:** UDP Port 69
- **Kein Auth, keine Verschlüsselung** — nur im vertrauenswürdigen Netz nutzen
- Maximale Dateigröße: ältere Implementierungen begrenzt auf ~32 MB (Block-Size 512 Byte × 65535)
- Cisco nutzt TFTP häufig für: IOS-Image-Backup, Konfig-Upload/Download, Bootloader-Recovery

### Cisco IOS TFTP-Befehle

\`\`\`
! Konfiguration auf TFTP-Server sichern
R1# copy running-config tftp:
Address or name of remote host []? 192.168.1.100
Destination filename [r1-confg]? backup-r1.cfg

! IOS-Image von TFTP laden
R1# copy tftp: flash:
Address or name of remote host []? 192.168.1.100
Source filename []? c2900-universalk9-mz.SPA.155-3.M8.bin
Destination filename [c2900-universalk9-mz.SPA.155-3.M8.bin]?

! Flash-Inhalt prüfen
R1# show flash:
\`\`\`

---

## FTP — File Transfer Protocol (RFC 959)

- **Control Channel:** TCP Port 21 (Befehle: USER, PASS, LIST, RETR, STOR)
- **Data Channel:** TCP Port 20 (aktiver Modus) oder ephemerer Port (passiver Modus)
- Authentifizierung mit Benutzername/Passwort (Klartext!)
- Cisco IOS kann als FTP-Client agieren

### FTP-Modi

| Modus | Beschreibung |
|-------|-------------|
| **Aktiv** | Server öffnet Datenkanal von TCP 20 zum Client |
| **Passiv (PASV)** | Client öffnet Datenkanal zu einem Server-Port >1023 (firewall-freundlich) |

### Cisco IOS FTP-Befehle

\`\`\`
R1(config)# ip ftp username cisco
R1(config)# ip ftp password cisco123
R1# copy ftp: flash:
Address or name of remote host []? 192.168.1.100
Source filename []? new-ios.bin
\`\`\`

---

## SCP & SFTP — Sichere Alternativen

**SCP (Secure Copy Protocol)**
- Basiert auf SSH (TCP 22)
- Authentifizierung über SSH (Passwort oder Public Key)
- Dateiübertragung verschlüsselt

\`\`\`
! SCP auf Cisco aktivieren
R1(config)# ip scp server enable

! Datei via SCP übertragen (Linux-Client)
$ scp ios-image.bin cisco@192.168.1.1:flash:/ios-image.bin
\`\`\`

**SFTP (SSH File Transfer Protocol)**
- Ebenfalls SSH-basiert (TCP 22)
- Modernere API als SCP, unterstützt Verzeichnisoperationen
- Unterschied zu SCP: SFTP ist ein eigenständiges Protokoll über SSH, SCP nutzt nur SSH als Tunnel

---

## Cisco IOS Bootvorgang (Kurzübersicht)

1. Power-On: POST (Power-On Self Test)
2. Bootstrap (ROM): sucht IOS-Image
3. Boot-Reihenfolge: Flash → TFTP (wenn konfiguriert) → ROM (ROMMON-Modus)
4. IOS-Load aus Flash
5. Startup-Config aus NVRAM laden
6. Wenn keine Startup-Config: Setup-Dialog

\`\`\`
! Boot-Reihenfolge anpassen
R1(config)# boot system flash c2900-universalk9-mz.SPA.155-3.M8.bin
R1(config)# boot system tftp c2900-universalk9-mz.SPA.155-3.M8.bin 192.168.1.100
\`\`\`
`,
};

export const TOPIC_DEVICE_MANAGEMENT: Topic = {
  id: "device-management",
  title: "Device Management Protocols",
  description:
    "CDP/LLDP-Discovery, NTP-Zeitsynchronisation, Syslog-Severity, SNMPv3 und TFTP/FTP/SCP-Dateiübertragung.",
  conceptIds: [
    "cdp-lldp",
    "ntp",
    "syslog",
    "snmp",
    "device-management-guide",
    "tftp-ftp",
  ],
  quizIds: ["ccna-quiz-device-management"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ios-cli"],
  estimatedMinutes: 120,
  tags: ["device-management", "cdp", "lldp", "ntp", "syslog", "snmp", "tftp", "ftp"],
};

export const DEVICE_MANAGEMENT_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_CDP_LLDP.id]: CONCEPT_CDP_LLDP,
  [CONCEPT_NTP.id]: CONCEPT_NTP,
  [CONCEPT_SYSLOG.id]: CONCEPT_SYSLOG,
  [CONCEPT_SNMP.id]: CONCEPT_SNMP,
  [CONCEPT_DEVICE_MGMT_GUIDE.id]: CONCEPT_DEVICE_MGMT_GUIDE,
  [CONCEPT_TFTP_FTP.id]: CONCEPT_TFTP_FTP,
};
