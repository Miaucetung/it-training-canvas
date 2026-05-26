// ============================================================
// CCNA Topic: WLAN
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_WLAN_STANDARDS: Concept = {
  id: "wlan-standards",
  title: "WLAN Standards & Frequenzbänder",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["wireless", "wlan", "wifi", "802.11", "rf", "networking"],
  content: `
## WLAN Standards (IEEE 802.11)

### Übersicht der Standards
| Standard | Frequenz | Max. Durchsatz | Anmerkung |
|----------|---------|----------------|-----------|
| 802.11b | 2.4 GHz | 11 Mbit/s | Veraltet |
| 802.11g | 2.4 GHz | 54 Mbit/s | Veraltet |
| 802.11a | 5 GHz | 54 Mbit/s | Veraltet |
| 802.11n (Wi-Fi 4) | 2.4 / 5 GHz | 600 Mbit/s | MIMO |
| 802.11ac (Wi-Fi 5) | 5 GHz | 6.9 Gbit/s | MU-MIMO, Beamforming |
| 802.11ax (Wi-Fi 6) | 2.4 / 5 / 6 GHz | 9.6 Gbit/s | OFDMA, TWT |

### Frequenzbänder
| Band | Kanäle | Reichweite | Störanfälligkeit |
|------|--------|-----------|-----------------|
| 2.4 GHz | 3 nicht-überlappend (1, 6, 11) | Größer | Hoch (Mikrowellen, BT) |
| 5 GHz | Bis zu 25 nicht-überlappend | Kleiner | Geringer |
| 6 GHz (Wi-Fi 6E) | Viele nicht-überlappend | Klein | Sehr gering |

### CSMA/CA (Kollisionsvermeidung)
WLAN nutzt **CSMA/CA** (kein CSMA/CD wie Ethernet):
1. **Listen**: Ist das Medium frei? (DIFS warten)
2. **Random Backoff**: Zufällige Wartezeit
3. **Senden**: Frame übertragen
4. **ACK**: Empfänger bestätigt Empfang

### SSID, BSSID, BSS, ESS
| Begriff | Bedeutung |
|---------|----------|
| SSID | Service Set Identifier (Netzwerkname) |
| BSSID | MAC-Adresse des Access Points |
| BSS | Basic Service Set (ein AP + Clients) |
| ESS | Extended Service Set (mehrere APs, gleiche SSID) |
| DS | Distribution System (kabelgebundenes Backbone) |
  `.trim(),
};

export const CONCEPT_WLAN_SECURITY: Concept = {
  id: "wlan-security",
  title: "WLAN-Sicherheit & Authentifizierung",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["wireless", "wlan", "security", "wpa", "wpa2", "wpa3", "802.1x"],
  content: `
## WLAN-Sicherheit

### Sicherheitsstandards (Evolution)
| Standard | Verschlüsselung | Schwäche |
|----------|----------------|---------|
| WEP | RC4 (40/104 Bit) | Geknackt, nicht verwenden! |
| WPA | TKIP (RC4) | Verbessert, aber noch RC4 |
| WPA2 | AES-CCMP | Sicher (wenn starkes Passwort) |
| WPA3 | AES-GCMP + SAE | Aktuell sicherster Standard |

### WPA2/WPA3 Modi
| Modus | Zielgruppe | Authentifizierung |
|-------|-----------|-----------------|
| Personal (PSK) | Heimnetz | Pre-Shared Key (Passwort) |
| Enterprise (802.1X) | Unternehmen | RADIUS-Server (Benutzerkonto) |

### 802.11 Authentifizierungsmethoden
\`\`\`
Client → AP: Authentication Request
AP → RADIUS: Access-Request (EAP)
RADIUS → AP: Access-Challenge
Client ↔ RADIUS: EAP-Austausch (durch AP weitergeleitet)
RADIUS → AP: Access-Accept / Reject
AP → Client: 4-Way Handshake (PMK → PTK)
\`\`\`

### Häufige WLAN-Angriffe
| Angriff | Beschreibung |
|---------|-------------|
| Evil Twin | Gefälschter AP mit gleichem SSID |
| Deauthentication Attack | Client vom AP trennen |
| WPS Brute Force | WPS PIN angreifen |
| Handshake Capture | 4-Way Handshake abfangen → Offline-Cracking |
  `.trim(),
};

export const CONCEPT_WIRELESS_ARCHITECTURE: Concept = {
  id: "wireless-architecture",
  title: "Cisco Wireless-Architektur (WLC)",
  appliesTo: ["ccna"],
  tags: ["wireless", "wlan", "cisco", "wlc", "capwap", "lightweight-ap"],
  content: `
## Cisco Wireless LAN Controller (WLC)

### Autonome vs. Controller-basierte APs
| Typ | Konfiguration | Verwaltung |
|-----|--------------|-----------|
| Autonomous AP | Lokal (pro AP) | Einzeln |
| Lightweight AP | Zentral über WLC | Zentral per WLC |

### CAPWAP (Control and Provisioning of Wireless Access Points)
- Protokoll zwischen WLC und Lightweight AP
- Port UDP 5246 (Control), UDP 5247 (Data)
- AP tunnelt Traffic zum WLC

### FlexConnect (Hybrid-Modus)
- APs können lokal weiterleiten wenn WLC-Verbindung ausfällt
- Nützlich für Filialen mit schmaler WAN-Leitung

### Wireless Roaming
| Typ | Beschreibung |
|-----|-------------|
| Layer-2 Roaming | Gleicher Controller, gleiche IP |
| Layer-3 Roaming | Verschiedene Controller, IP bleibt via Tunnel |

### Cisco WLC Konfigurationsbereiche
- **WLANs**: SSID, Security-Policy, QoS
- **Controller**: Management, Interfaces, Ports
- **Wireless**: APs, RF-Profile, Channel Assignment
- **Security**: AAA, ACLs, Rogue Detection
  `.trim(),
};

export const CONCEPT_WLAN_AP_MODES: Concept = {
  id: "wlan-ap-modes",
  title: "WLAN AP-Betriebsmodi",
  appliesTo: ["ccna"],
  tags: ["wireless", "wlan", "ap", "flexconnect", "capwap", "lightweight"],
  content: `
## WLAN Access Point Betriebsmodi

### Überblick: AP-Betriebsmodi im Vergleich

| Modus | Beschreibung | Einsatz |
|-------|-------------|---------|
| **Autonomous** | Komplett selbstständig; jede Funktion lokal konfiguriert | Kleine Netze ohne WLC |
| **Lightweight (Local)** | Alle Funktionen über WLC; Traffic wird durch CAPWAP-Tunnel zum WLC geleitet | Enterprise-Netze mit zentralem WLC |
| **FlexConnect** | Lightweight AP, der bei WLC-Ausfall lokal weiterleitet | Filialen mit eingeschränkter WAN-Leitung |
| **Monitor** | Nur passives Lauschen; kein Client-Traffic | Rogue-AP-Erkennung, IDS |
| **Sniffer** | Captures frames für externe Analyse (z.B. Wireshark) | WLAN-Troubleshooting |
| **Mesh** | APs als Backhaul-Mesh-Knoten (Outdoor/Indoor) | Schwer verkabelbare Bereiche |

### Autonomous AP — Modus "Stand-alone"
- Vollständige Funktionalität ohne WLC
- Jeder AP wird **einzeln** konfiguriert (CLI oder Web-GUI)
- Eignet sich für kleine Unternehmen oder Einzelinstallationen
- **Nachteil**: Keine zentrale Verwaltung, kein einheitliches Roaming, keine dynamische RF-Verwaltung

### Lightweight AP — Local Modus (Standard)
- Minimale Logik im AP — WLC übernimmt alle Steuerungsentscheidungen
- **Split MAC-Architektur**:
  - AP: Sendet/empfängt RF, kümmert sich um Layer-1/2 Funktionen
  - WLC: Authentifizierung, Verschlüsselung, SSID-Management, QoS
- Client-Traffic wird durch CAPWAP-Tunnel zum WLC geleitet (**centralized forwarding**)
- **Vorteil**: Zentrale Konfiguration, nahtloses Roaming, RF-Optimierung

### FlexConnect (früher: H-REAP)
- Hybrid: AP kann beim WLC-Ausfall **lokal weiterleiten** (local switching)
- **Zwei Betriebszustände**:
  - **Connected**: WLC ist erreichbar → zentrale Steuerung + lokales Forwarding möglich
  - **Standalone**: WLC nicht erreichbar → AP leitet lokal weiter, Authentifizierung lokal
- Ideal für **Filialen** mit schmaler WAN-Verbindung zum WLC
- Konfiguration: WLC → WLAN → Advanced → FlexConnect Local Switching aktivieren

### AP-Modus-Konfiguration (Cisco WLC GUI)
\`\`\`
WLC → Wireless → Access Points → [AP auswählen]
  → General → AP Mode: Local / FlexConnect / Monitor / Sniffer
\`\`\`

### CAPWAP im Detail
| Element | Wert |
|---------|------|
| Protokoll | UDP |
| Control-Kanal | Port 5246 (verschlüsselt DTLS) |
| Data-Kanal | Port 5247 (optional DTLS) |
| Funktion | AP-Konfiguration, Software-Updates, Client-Daten |

### Typische Prüfungsfrage: Welcher Modus für welches Szenario?
| Szenario | Empfohlener Modus |
|---------|-----------------|
| Kleine Arztpraxis, kein WLC | Autonomous |
| Unternehmensnetz mit zentralem WLC | Lightweight (Local) |
| Filiale mit schlechter WAN-Verbindung | FlexConnect |
| WLAN-Troubleshooting mit Wireshark | Sniffer |
| Rogue-AP-Überwachung | Monitor |
  `.trim(),
};

export const CONCEPT_WLAN_GUIDE: Concept = {
  id: "wlan-guide",
  title: "Lernguide: WLAN",
  appliesTo: ["ccna"],
  tags: ["wireless", "wlan", "wifi", "wlc", "capwap", "guide"],
  content: `
## Lernziele
- Die wichtigsten 802.11-Standards (Wi-Fi 4/5/6) mit Frequenzband und Durchsatz benennen
- WPA2-Personal und WPA2-Enterprise hinsichtlich Authentifizierung und Einsatzzweck unterscheiden
- Die CAPWAP-Architektur mit WLC und Lightweight APs erklären
- Den Unterschied zwischen autonomen und Lightweight-APs beschreiben
- Häufige WLAN-Angriffe (Evil Twin, Deauth) und Gegenmaßnahmen kennen

## Praxis-Szenario
Die "Stadtwerke Freiburg" (ca. 300 Mitarbeiter, 3 Etagen) plant eine neue Wi-Fi 6-Infrastruktur. Bisher sind 12 autonome Cisco Aironet 1815i-APs verteilt — jeder muss einzeln konfiguriert werden. Zukünftig sollen 12 Cisco Aironet 9120 (Lightweight APs) über einen Cisco 9800-L WLC (IP: 10.0.100.50) zentral verwaltet werden. Das Management-VLAN ist 100 (10.0.100.0/24), das WLAN-SSID "Stadtwerke-Corp" nutzt WPA2-Enterprise mit RADIUS-Server (10.0.100.10, Port 1812). Ein zweites SSID "SW-Gast" (VLAN 200, 10.0.200.0/24) nutzt WPA2-Personal mit Voucher-System.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit dem Cisco 9800-L WLC (verbunden mit einem Core-Switch über VLAN-Trunk), zwei Lightweight APs (AP1 in Etage 1, AP2 in Etage 2) und einem RADIUS-Server. Zeige die CAPWAP-Tunnel zwischen den APs und dem WLC als gestrichelte Linien. Beschrifte den WLC mit seiner Management-IP und die APs mit ihren Access-VLANs.
**Ziel:** Die WLC-basierte Wireless-Architektur visualisieren und zeigen, dass alle APs ihre Konfiguration vom WLC beziehen.
**Tipps:** CAPWAP nutzt UDP 5246 (Control) und UDP 5247 (Data) — diese Ports müssen in Firewalls freigeschaltet sein. Überprüfe, ob der WLC auf dem Trunk-Port alle benötigten VLANs erlaubt.

## Verständnisfragen
1. Was ist der Unterschied zwischen WPA2-Personal und WPA2-Enterprise — welches Verfahren ist für Unternehmen geeigneter und warum?
2. Welche zwei UDP-Ports nutzt CAPWAP — und wozu dient jeweils der Control- vs. der Data-Tunnel?
3. Was ist ein Evil-Twin-Angriff — und welche technische Maßnahme hilft, ihn zu erkennen oder zu verhindern?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **WPA2-Personal mit WPA2-Enterprise verwechseln:** In Prüfungsfragen wird oft gefragt, welches Verfahren einen RADIUS-Server erfordert — das ist Enterprise (802.1X), nicht Personal (PSK). Personal nutzt ein gemeinsames Passwort, Enterprise individuelle Benutzerkonten.
- ⚠️ **CAPWAP-Ports nicht freigeschaltet:** Lightweight APs können keine Verbindung zum WLC aufbauen, wenn UDP 5246/5247 durch eine Firewall blockiert wird. Symptom: AP bleibt im "Discovering"-Zustand.
- ⚠️ **2.4-GHz-Kanalüberlappung ignoriert:** Im 2.4-GHz-Band gibt es nur 3 nicht-überlappende Kanäle (1, 6, 11). Werden benachbarte APs auf Kanal 1 und 3 gesetzt, entstehen Interferenzen — immer nur Kanäle 1, 6 oder 11 verwenden.
  `.trim(),
};

export const TOPIC_WLAN: Topic = {
  id: "wlan",
  title: "WLAN",
  description:
    "802.11-Standards, Frequenzbänder, CSMA/CA, WPA2/WPA3, 802.1X und Cisco WLC-Architektur.",
  conceptIds: [
    "wlan-standards",
    "wlan-security",
    "wireless-architecture",
    "wlan-ap-modes",
    "wlan-guide",
  ],
  quizIds: ["ccna-quiz-wlan"],
  exerciseIds: [],
  prerequisiteTopicIds: ["security"],
  estimatedMinutes: 90,
  tags: ["wireless", "wlan", "wifi"],
};

export const WLAN_CONCEPTS: Record<string, Concept> = {
  "wlan-standards": CONCEPT_WLAN_STANDARDS,
  "wlan-security": CONCEPT_WLAN_SECURITY,
  "wireless-architecture": CONCEPT_WIRELESS_ARCHITECTURE,
  "wlan-ap-modes": CONCEPT_WLAN_AP_MODES,
  "wlan-guide": CONCEPT_WLAN_GUIDE,
};
