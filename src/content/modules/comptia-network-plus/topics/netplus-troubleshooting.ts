// ============================================================
// CompTIA Network+ N10-009 — Topic 5: Netzwerkfehlerbehebung
// Domains: 5.1 (Methodik), 5.2 (Kabel/Physical), 5.3 (Netzwerkdienste),
//          5.4 (Performance), 5.5 (Tools)
// Sources:
//   CompTIA Network+ N10-009 Exam Objectives Version 4.0 (lokal, Projektordner)
//   RFC 792 (ICMP) — rfc-editor.org
//   Wikipedia — Netzwerkdiagnose-Tools (unstrittige technische Grundlage)
// Cross-References:
//   → CCNA: show-commands (Cisco-IOS-Diagnose — spezifische show-Befehle)
//   → AZ-900: azure-network-watcher (Cloud-native Diagnose-Tools)
//   N10-009 Scope: Vendor-neutrale Fehlerbehebung — kein Cisco-IOS-Fokus
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_TROUBLESHOOTING_METHODOLOGY: Concept = {
  id: "netplus-troubleshooting-methodology",
  title: "Fehlerbehebungs-Methodik: Der 7-Schritte-Prozess (N10-009 Domain 5.1)",
  appliesTo: ["comptia-network-plus"],
  tags: ["troubleshooting", "methodology", "osi-model", "n10-009", "vendor-neutral"],
  relatedConceptIds: ["netplus-osi-tcpip"],
  content: `
## Fehlerbehebungs-Methodik: N10-009 Domain 5.1

CompTIA N10-009 prüft einen strukturierten, wiederholbaren Prozess zur Netzwerkfehlerbehebung. Dieser 7-Schritte-Prozess ist **prüfungsrelevantes Pflicht-Lernstoff** — in der Prüfung erscheinen häufig Szenario-Fragen, in denen du den nächsten richtigen Schritt identifizieren musst.

### Die 7 Schritte der Fehlerbehebung

| Schritt | Beschreibung |
|---------|-------------|
| **1. Problem identifizieren** | Informationen sammeln, Nutzer befragen, Symptome erkennen, mögliche Veränderungen feststellen, Problem reproduzieren, mehrere Probleme einzeln angehen |
| **2. Theorie aufstellen** | Offensichtliches hinterfragen, mehrere Ansätze erwägen (Top-to-Bottom, Bottom-to-Top, Teile-und-herrsche) |
| **3. Theorie testen** | Bei Bestätigung → nächste Schritte planen; bei Widerlegung → neue Theorie aufstellen oder eskalieren |
| **4. Aktionsplan erstellen** | Lösung planen und mögliche Auswirkungen (Risiken, Downtime) bestimmen |
| **5. Lösung umsetzen** | Änderungen implementieren oder Problem eskalieren |
| **6. Systemfunktionalität prüfen** | Vollständige Funktion verifizieren, präventive Maßnahmen ergreifen |
| **7. Dokumentieren** | Erkenntnisse, Aktionen, Ergebnisse und Lessons Learned festhalten |

**Prüfungsfalle:** Der Prozess ist nicht immer linear — bei Schritt 3 (Theorie nicht bestätigt) geht man zurück zu Schritt 2. Das ist explizit im Blueprint beschrieben.

### OSI-basierte Fehlerbehebungsansätze

**Top-to-Bottom (Layer 7 → Layer 1):**
- Beginne auf der Anwendungsschicht (kann der Nutzer die Anwendung öffnen?)
- Arbeite schrittweise nach unten bis zur physischen Schicht
- Geeignet: Wenn die Symptome auf eine bestimmte Anwendung hinweisen

**Bottom-to-Top (Layer 1 → Layer 7):**
- Beginne auf der physischen Schicht (ist das Kabel verbunden? LEDs aktiv?)
- Geeignet: Wenn der Fehler auf physische Probleme hindeutet (kein Link-Up, kein Signal)

**Teile-und-herrsche (Divide and Conquer):**
- Beginne in der Mitte des OSI-Modells (z.B. Layer 3/4)
- Ping-Test: Kann der Host eine IP-Adresse erreichen? → Layer 3 funktioniert → Layer 1-2 auch OK
- Eingrenzen von oben und unten gleichzeitig
- Geeignet: Wenn der Fehlerbereich unklar ist

### Praxis-Tipp: Warum dokumentieren?

Schritt 7 (Dokumentation) wird in der Prüfung unterschätzt. Dokumentation ist kein "Nice-to-have":
- Ermöglicht Wiedererkennung bei zukünftigen ähnlichen Problemen
- Ist Grundlage für Change-Management-Prozesse
- Kann für Compliance-Anforderungen relevant sein (Audit Trails)
`,
};

export const CONCEPT_CABLE_PHYSICAL_ISSUES: Concept = {
  id: "netplus-cable-physical-issues",
  title: "Kabel- und physische Schnittstellenprobleme (N10-009 Domain 5.2)",
  appliesTo: ["comptia-network-plus"],
  tags: ["cable", "physical", "crc", "runts", "giants", "poe", "n10-009"],
  relatedConceptIds: ["netplus-troubleshooting-methodology"],
  content: `
## Kabel- und Schnittstellenprobleme: N10-009 Domain 5.2

### Kabelprobleme

**Falsches Kabel:**
- **SMF vs. MMF verwechselt:** Single-Mode-Glasfaser (gelb, bis 100 km) und Multi-Mode-Glasfaser (orange/aqua, bis 550 m) sind physisch kompatibel (gleiche Stecker möglich), aber optisch inkompatibel → kein Signal oder starke Dämpfung
- **Kategorie-Fehler:** Cat5e (max. 1 Gbit/s) statt Cat6 (10 Gbit/s bis 55 m) → Speed-Limitierung
- **STP vs. UTP:** Shielded Twisted Pair benötigt korrektes Grounding — ohne Erdung kann STP Interferenz verstärken statt reduzieren

**Signaldegradation:**
- **Crosstalk (Überlagerung):** Elektromagnetische Interferenz zwischen benachbarten Kabelpaaren — typisch bei schlecht verdrillten Kabeln oder zu engem Verlegen
  - **NEXT (Near-End Crosstalk):** Interferenz am sendenden Ende
  - **FEXT (Far-End Crosstalk):** Interferenz am empfangenden Ende
- **Interferenz:** Externe elektromagnetische Störquellen (Motoren, Leuchtstofflampen, andere Kabel)
- **Abschwächung (Attenuation):** Signalverlust durch Kabellänge — bei Kupfer typisch ab 100 m für Cat5e/6

**Weitere physische Fehlerquellen:**
- **Unsachgemäße Terminierung:** Kabelpaare nicht korrekt aufgespleißt → Crosstalk, Attenuation
- **TX/RX vertauscht:** Sende- und Empfangspaare vertauscht — bei Glasfaser: falscher Anschluss des SC/LC-Duplexkabels

### Schnittstellenzähler — Fehlerdiagnose

Beim Ausführen von \`show interfaces\` (oder äquivalenten Befehlen auf anderen Herstellern) liefern diese Zähler Diagnose-Informationen:

| Zähler | Bedeutung | Typische Ursache |
|--------|-----------|-----------------|
| **CRC-Fehler** | Frame mit korrupten Daten erkannt | Schlechtes Kabel, Crosstalk, Interferenz, Duplex-Mismatch |
| **Runts** | Frames unter 64 Byte | Kollisionen (Half-Duplex-Problem), Duplex-Mismatch |
| **Giants** | Frames über 1518 Byte | Falsche MTU-Konfiguration, Jumbo Frames ohne Unterstützung |
| **Input Errors** | Summe aller Eingehende-Frame-Fehler | Physische Verbindungsprobleme |
| **Output Errors** | Fehler beim Senden | Überlastung, Queue-Drops |

**Duplex-Mismatch — häufigster Fehler:**
- Eine Seite auf Full-Duplex, andere auf Half-Duplex (oder Auto-Negotiation schlägt fehl)
- Symptome: Viele CRC-Fehler, Runts, langsame Verbindung trotz physisch guter Verbindung
- Diagnose: Beide Seiten zeigen erhöhte Fehlerrate, aber Verbindung besteht

### Port-Status

| Status | Bedeutung |
|--------|-----------|
| **Error-Disabled** | Port vom Switch automatisch gesperrt (z.B. nach Port-Security-Verletzung oder BPDU-Guard) |
| **Administrativ Disabled** | Manuell deaktiviert mit \`shutdown\` |
| **Suspended** | Port temporär blockiert (z.B. STP-Konvergenz, LACP-Aushandlung) |

### PoE-Probleme (Power over Ethernet)

- **Leistungsbudget überschritten:** Switch liefert mehr PoE-Leistung als verfügbar → einige Ports werden abgeschaltet
  - Diagnose: Summe der angeschlossenen PoE-Geräte × Leistungsbedarf > Switch-PoE-Budget
- **Falscher PoE-Standard:**
  - PoE (802.3af): 15,4 W — reicht nicht für PoE+-Geräte (z.B. VoIP-Telefone mit Heizung)
  - PoE+ (802.3at): 30 W — reicht nicht für PoE++-Geräte (z.B. PTZ-Kameras)
  - Symptom: Gerät startet nicht oder schaltet periodisch aus
- **Transceiver-Mismatch:** SFP-Transceiver nicht kompatibel mit Switch-Port oder Kabeltyp → kein Link

### Fehlerbehebungs-Strategie für physische Probleme

1. LEDs prüfen (Link-LED an, Aktivitäts-LED blinkt?)
2. Kabel tauschen (Ausschluss von Kabeldefekt)
3. Port am Switch wechseln
4. \`show interfaces\` / Schnittstellenzähler prüfen
5. Kabeltester einsetzen (Continuity, Wiremap)
`,
};

export const CONCEPT_NETWORK_SERVICE_ISSUES: Concept = {
  id: "netplus-network-service-issues",
  title: "Netzwerkdienstprobleme: Switching, Routing, IP-Adressierung (N10-009 Domain 5.3)",
  appliesTo: ["comptia-network-plus"],
  tags: ["stp", "vlan", "routing", "dhcp", "dns", "ip-addressing", "n10-009", "troubleshooting"],
  relatedConceptIds: ["netplus-switching-vlans", "netplus-routing", "netplus-network-services"],
  content: `
## Netzwerkdienstprobleme: N10-009 Domain 5.3

### Switching-Probleme

**STP-Probleme (Spanning Tree Protocol):**

| Problem | Symptom | Ursache |
|---------|---------|---------|
| **Netzwerk-Loop** | Broadcast-Storm, Netz komplett überlastet, alle Ports blinken wild | STP nicht aktiv, BPDU-Guard/Filter falsch konfiguriert |
| **Falsche Root-Bridge** | Suboptimaler Traffic-Pfad, unerwartet hohe Latenz | Priority nicht gesetzt, unbekanntes Gerät wird Root |
| **Blockierter Port fälschlicherweise** | Kein Traffic trotz angeschlossenem Gerät | STP konvergiert zu langsam (klassisches STP vs. RSTP) |

**VLAN-Probleme:**
- **Falsche VLAN-Zuweisung:** Access-Port im falschen VLAN → Gerät im falschen Broadcast-Domain, falsche IP vom falschen DHCP-Server
- **Trunk-Port nicht konfiguriert:** Inter-Switch-Verbindung als Access-Port → nur 1 VLAN passiert
- **Native VLAN Mismatch:** Verschiedene Native VLANs auf beiden Trunk-Enden → STP-Instabilität, ungetaggter Traffic landet im falschen VLAN

**ACL-Fehler:**
- ACL blockiert legitimen Traffic (falsche Reihenfolge oder zu restriktiv)
- Diagnose: ACL-Hit-Counter prüfen (\`show ip access-lists\`)

### Routing-Probleme

**Routing-Tabelle prüfen:**
- Prüfe: Gibt es eine Route zum Ziel? (\`show ip route\` oder \`ip route\` / \`route print\`)
- Prüfe: Ist die Standardroute (0.0.0.0/0) konfiguriert?
- **Falscher Default-Gateway:** Häufigster Fehler — Client kann LAN-Hosts erreichen, aber nicht das Internet
  - Diagnose: \`ipconfig\` (Windows) / \`ip addr\` (Linux) → Default-Gateway prüfen
  - Ping-Test: Gateway erreichbar? → \`ping <gateway-ip>\`

**Typische IP-Adressierungsfehler:**

| Problem | Symptom | Diagnose |
|---------|---------|---------|
| **Falsche IP-Adresse** | Keine Kommunikation | \`ipconfig\` / \`ip addr\` |
| **Doppelte IP-Adresse** | Verbindungsabbrüche, ARP-Konflikte | ARP-Cache prüfen, DHCP-Lease-Tabelle |
| **Falsche Subnetzmaske** | Kommunikation nur innerhalb des vermeintlichen Subnetzes funktioniert | Binäre Subnetzmaske prüfen |
| **APIPA-Adresse (169.254.x.x)** | Kein DHCP-Server erreichbar → Client vergibt sich selbst eine APIPA-Adresse | DHCP-Server prüfen, DHCP-Relay/IP Helper prüfen |
| **IP-Adresserschöpfung** | Neue Geräte erhalten keine IP | DHCP-Pool-Größe erhöhen, Lease-Time prüfen |

### DNS-Probleme

- **Kein DNS → kein Internetzugang:** Websites nicht erreichbar, IP-Pings funktionieren
  - Diagnose: \`nslookup google.com\` — liefert es eine IP?
  - Unterschied: Kein DNS ≠ kein Internet — IP-basierte Verbindungen funktionieren trotzdem
- **Falscher DNS-Server:** DNS-Anfragen gehen an falsche Adresse → keine Auflösung
  - Diagnose: \`ipconfig /all\` (Windows) → DNS-Server-Adresse prüfen

### DHCP-Probleme

- **Kein DHCP-Server im Subnetz:** Client erhält APIPA-Adresse
- **DHCP-Relay fehlt:** DHCP-Server in anderem Subnetz — Relay-Agent (IP Helper) auf Router nötig
- **Erschöpfter DHCP-Pool:** Alle Adressen vergeben → neue Clients erhalten keine IP
  - Kurzfristig: DHCP-Pool vergrößern, Lease-Time reduzieren
`,
};

export const CONCEPT_PERFORMANCE_ISSUES: Concept = {
  id: "netplus-performance-issues",
  title: "Performance-Probleme: Latenz, Jitter, Paketverlust (N10-009 Domain 5.4)",
  appliesTo: ["comptia-network-plus"],
  tags: ["latency", "jitter", "packet-loss", "wireless", "qos", "n10-009", "troubleshooting"],
  relatedConceptIds: ["netplus-wireless", "netplus-troubleshooting-methodology"],
  content: `
## Performance-Probleme: N10-009 Domain 5.4

### Kabel-Netzwerk Performance

**Datenstau / Bottleneck:**
- Engpass an einem Punkt im Netzwerkpfad → reduzierter Durchsatz für alle
- Typische Orte: WAN-Link (geringste Bandbreite), überlasteter Switch-Uplink, schlecht dimensionierter Router
- Diagnose: Traffic-Monitoring, SNMP-Bandbreitengraphen

**Bandbreite vs. Durchsatz (Thoughput):**
- **Bandbreite:** Maximale theoretische Kapazität (z.B. 1 Gbit/s am Port)
- **Durchsatz:** Tatsächlich genutzter Datendurchsatz — immer ≤ Bandbreite
- **Goodput:** Nutzdatendurchsatz (ohne Protokoll-Overhead) — noch geringer als Durchsatz

**Latenz (Delay):**
- Zeit, die ein Paket von Quelle zu Ziel benötigt
- Quellen: Verarbeitungszeit (Router/Switches), Ausbreitungsverzögerung (Lichtgeschwindigkeit), Serialisierungs-Delay (Framegröße / Bandbreite), Queue-Delay (überlastete Geräte)
- Diagnose: \`ping\` (RTT = Round Trip Time ≈ 2× Latenz)

**Jitter:**
- Schwankungen der Latenz über Zeit — unterschiedlich lange Paketumlaufzeiten
- Problem besonders für Echtzeit-Anwendungen: VoIP, Videokonferenzen, Online-Gaming
- Ursache: Überlastete Netzwerkgeräte mit variablen Queue-Wartezeiten
- Lösung: QoS (Quality of Service) — Echtzeit-Traffic priorisieren

**Paketverlust (Packet Loss):**
- Pakete kommen nicht am Ziel an
- Ursachen: Überlastete Queues (Drops), physische Fehler (CRC → Frame verworfen), fehlerhafte Hardware
- Auswirkung: TCP → Retransmission (Throughput sinkt), UDP (VoIP) → Qualitätsverlust/Aussetzer
- Diagnose: \`ping\` mit erhöhter Paketanzahl (\`ping -n 100 <ziel>\`)

### Wireless Performance-Probleme

**Kanalüberlappung (Channel Overlap):**
- Im 2,4-GHz-Band gibt es nur 3 nicht-überlappende Kanäle: **1, 6, 11**
- Benachbarte APs auf überlappenden Kanälen → gegenseitige Interferenz → Retransmissions, niedriger Durchsatz
- Lösung: Kanal-Koordination (manuelle Zuweisung oder automatisch durch WLC)

**Signalverschlechterung und -verlust:**
- Hindernisse (Wände, Metallstrukturen, Aufzüge) dämpfen das WLAN-Signal
- Materialien mit hoher Dämpfung: Beton, Metall, Wasser
- Symptom: Niedrige RSSI (Received Signal Strength Indicator), langsame Verbindung

**Unzureichende Funkabdeckung:**
- Dead Zones — Bereiche ohne ausreichendes WLAN-Signal
- Lösung: Zusätzliche APs platzieren, Antennenwahl anpassen (direktional vs. omnidirektional)
- Diagnose: Wi-Fi-Analysator (Heatmap erstellen)

**Roaming-Probleme:**
- **Sticky Client:** Gerät hält an schwachem AP fest, obwohl ein stärkerer AP verfügbar ist
  - Ursache: Client entscheidet über Roaming, nicht der AP (bei Autonomous APs)
  - Lösung: WLC mit 802.11r Fast BSS Transition, Client Steering
- **Falsche Roaming-Konfiguration:** Verschiedene SSIDs oder Sicherheitseinstellungen auf APs → nahtloses Roaming nicht möglich

**Bandsteuerung (Band Steering):**
- WLC lenkt Dual-Band-fähige Clients bevorzugt auf 5 GHz (weniger Interferenz, höherer Durchsatz)
- 2,4 GHz: Größere Reichweite, aber mehr Interferenz (Bluetooth, Mikrowellen, ältere Geräte)
`,
};

export const CONCEPT_TROUBLESHOOTING_TOOLS: Concept = {
  id: "netplus-troubleshooting-tools",
  title: "Fehlerbehebungs-Tools: CLI, Hardware-Tools, Show-Befehle (N10-009 Domain 5.5)",
  appliesTo: ["comptia-network-plus"],
  tags: ["ping", "traceroute", "nslookup", "tcpdump", "nmap", "wireshark", "cable-tester", "n10-009"],
  relatedConceptIds: ["netplus-troubleshooting-methodology", "netplus-cable-physical-issues"],
  content: `
## Fehlerbehebungs-Tools: N10-009 Domain 5.5

### Software-Tools: Kommandozeile

**ping:**
- Sendet ICMP Echo Request, wartet auf ICMP Echo Reply
- Prüft: Erreichbarkeit eines Hosts, Round-Trip-Time (RTT), Paketverlust
- Wichtige Parameter: \`-n <Anzahl>\` (Windows) / \`-c <Anzahl>\` (Linux)
- **Was ping NICHT testet:** TCP-Ports, Anwendungsverfügbarkeit, Routing-Pfad

**traceroute / tracert:**
- Zeigt jeden Hop (Router) auf dem Pfad zum Ziel
- Windows: \`tracert <ziel>\` (nutzt ICMP), Linux: \`traceroute <ziel>\` (nutzt UDP oder ICMP)
- Erkennt: Wo der Traffic stoppt, welcher Router Latenz verursacht
- Stern (*) bedeutet: Router antwortet nicht auf Traceroute (ICMP-Rate-Limiting oder Firewall)

**nslookup:**
- DNS-Diagnose-Tool — prüft Namensauflösung
- \`nslookup google.com\` → Zeigt IP-Adresse von google.com und genutzten DNS-Server
- \`nslookup google.com 8.8.8.8\` → Prüft gegen spezifischen DNS-Server
- Erkennt: DNS-Auflösungsprobleme, falscher DNS-Server, fehlerhafte DNS-Einträge

**tcpdump (Linux/macOS):**
- CLI-basierter Paketanalysator — mitschneiden und analysieren von Netzwerktraffic
- Äquivalent zu Wireshark auf der Kommandozeile
- \`tcpdump -i eth0 host 192.168.1.1\` → Zeigt Traffic von/zu 192.168.1.1
- Einsatz: Protokollverifikation, Sicherheitsanalyse, Troubleshooting ohne GUI

**dig (DNS Investigation Gathering):**
- Mächtigeres DNS-Diagnosetool als nslookup (Linux/macOS)
- \`dig google.com MX\` → Zeigt MX-Records für google.com
- \`dig +trace google.com\` → Verfolgt die komplette DNS-Auflösungskette

**netstat:**
- Zeigt aktive Netzwerkverbindungen, Ports, Routing-Tabelle
- \`netstat -an\` → Alle aktiven Verbindungen mit Port-Nummern
- \`netstat -r\` → Routing-Tabelle (äquivalent zu \`route print\`)

**ip / ifconfig / ipconfig:**
- Zeigt/konfiguriert Netzwerkinterfaces
- Windows: \`ipconfig /all\` → IP, Subnetzmaske, Gateway, DNS, MAC-Adresse
- Linux: \`ip addr show\` (moderner) oder \`ifconfig\` (älter)

**arp:**
- Zeigt / verwaltet ARP-Cache (IP→MAC-Zuordnungen)
- \`arp -a\` → Alle ARP-Cache-Einträge
- Diagnose: Doppelte IP-Adressen, ARP-Spoofing-Erkennung

**nmap:**
- Netzwerk-Scanner: erkennt aktive Hosts, offene Ports, Betriebssysteme
- \`nmap -sn 192.168.1.0/24\` → Ping-Sweep (Welche Hosts sind aktiv?)
- \`nmap -p 80,443 <host>\` → Prüft spezifische Ports
- **N10-009-Kontext:** Tool kennen und Einsatzzweck verstehen

**LLDP / CDP:**
- **LLDP (Link Layer Discovery Protocol):** IEEE-Standard, vendor-neutral — Geräte tauschen Informationen aus (Hostname, Port, VLAN)
- **CDP (Cisco Discovery Protocol):** Cisco-proprietäres Äquivalent zu LLDP
- Einsatz: Netzwerk-Inventarisierung, Topology-Erkennung ohne manuelle Dokumentation

### Hardware-Tools

| Tool | Einsatz |
|------|---------|
| **Toner (Tone Generator/Probe)** | Kabelsuche in Wänden/Kabelbündeln — Sender auf ein Ende, Probe erkennt Signal |
| **Kabeltester** | Prüft Durchgang, Wiremap (Pinbelegung), Crosstalk-Messung — erkennt fehlerhafte Terminierung |
| **Network TAP (Test Access Point)** | Passiver In-Line-Sniffer — kopiert Traffic ohne Netzwerk zu unterbrechen (für Paketanalyse) |
| **Wi-Fi-Analysator** | Zeigt WLAN-Netzwerke, Kanalnutzung, Signalstärke (RSSI), Interferenzen — für Wireless-Diagnose |
| **Optisches Leistungsmessgerät** | Misst Signalstärke auf Glasfaser-Strecken — erkennt Dämpfungsprobleme |

### Grundlegende Netzwerkgeräte-Befehle

Für N10-009 musst du die **Funktion** dieser Befehle kennen (nicht die genaue Cisco-Syntax — das ist CCNA):

| Befehl (konzeptionell) | Was er zeigt |
|------------------------|-------------|
| **MAC-Adresstabelle anzeigen** | Welche MAC-Adressen auf welchen Ports gelernt wurden — für VLAN-Diagnose |
| **Route anzeigen** | Routing-Tabelle — welche Netzwerke sind erreichbar, welcher Next-Hop |
| **Schnittstelle anzeigen** | Interface-Status (up/down), Fehlerzähler (CRC, Runts, Giants), Speed/Duplex |
| **Konfiguration anzeigen** | Aktuelle Running-Configuration — VLAN, ACL, Interface-Einstellungen |
| **ARP anzeigen** | IP-zu-MAC-Zuordnungen — Diagnose von IP-Konflikten, Konnektivitätsproblemen |
| **VLAN anzeigen** | Welche VLANs aktiv, welche Ports welchem VLAN zugewiesen |
| **Leistung anzeigen** | CPU-Last, Speichernutzung — erkennt überlastete Geräte |

> **Cross-Reference CCNA:** In CCNA heißen diese Befehle \`show mac address-table\`, \`show ip route\`, \`show interfaces\`, \`show running-config\`, \`show arp\`, \`show vlan brief\`, \`show processes cpu\` — auf Cisco-IOS. N10-009 prüft das konzeptionelle Wissen, nicht die Cisco-Syntax.
`,
};

// ── Quiz ──────────────────────────────────────────────────────

const QUIZ_QUESTIONS_T5: Question[] = [
  {
    id: "np-trouble-q1",
    type: "single-choice",
    text: "Ein Netzwerkadministrator beginnt mit der Fehlerbehebung. Er hat das Problem identifiziert und eine Theorie aufgestellt. Er testet seine Theorie — und die Theorie bestätigt sich NICHT. Was ist der korrekte nächste Schritt gemäß dem N10-009 Fehlerbehebungsprozess?",
    points: 10,
    answers: [
      { id: "a", text: "Sofort einen Aktionsplan erstellen und das Problem eskalieren", isCorrect: false },
      { id: "b", text: "Zurück zu Schritt 1 gehen und alle Informationen neu sammeln", isCorrect: false },
      { id: "c", text: "Eine neue Theorie aufstellen oder das Problem eskalieren", isCorrect: true },
      { id: "d", text: "Die Lösung trotzdem umsetzen und abwarten", isCorrect: false },
    ],
    explanation:
      "Wenn die Theorie in Schritt 3 nicht bestätigt wird, geht man zurück zu Schritt 2 (neue Theorie aufstellen) oder eskaliert das Problem an einen Spezialisten. Nicht direkt zu Schritt 4 (Aktionsplan) springen, denn ohne bestätigte Ursache kann die Lösung das Problem verschlimmern. Das ist eine typische N10-009-Prüfungsfrage zum Prozessablauf.",
  },
  {
    id: "np-trouble-q2",
    type: "single-choice",
    text: "Ein Administrator analysiert Schnittstellenfehler mit 'show interfaces' und sieht sehr hohe CRC-Zähler und viele Runts. Welche Ursache ist am wahrscheinlichsten?",
    points: 10,
    answers: [
      { id: "a", text: "IP-Adress-Konflikt im Netzwerk", isCorrect: false },
      { id: "b", text: "Duplex-Mismatch zwischen Switch und Endgerät", isCorrect: true },
      { id: "c", text: "Falsche VLAN-Konfiguration", isCorrect: false },
      { id: "d", text: "DNS-Server nicht erreichbar", isCorrect: false },
    ],
    explanation:
      "Hohe CRC-Fehler kombiniert mit Runts (Frames unter 64 Byte) sind ein klassisches Indiz für einen Duplex-Mismatch: Eine Seite ist auf Full-Duplex, die andere auf Half-Duplex. Die Half-Duplex-Seite erkennt Kollisionen und sendet Runts. Die Full-Duplex-Seite empfängt diese unvollständigen Frames und zählt CRC-Fehler. Die Verbindung funktioniert degradiert, aber nicht komplett ausgefallen.",
  },
  {
    id: "np-trouble-q3",
    type: "single-choice",
    text: "Welcher Fehlerbehebungsansatz beginnt mit der physischen Schicht und arbeitet sich nach oben bis zur Anwendungsschicht?",
    points: 10,
    answers: [
      { id: "a", text: "Top-to-Bottom", isCorrect: false },
      { id: "b", text: "Teile-und-herrsche (Divide and Conquer)", isCorrect: false },
      { id: "c", text: "Bottom-to-Top", isCorrect: true },
      { id: "d", text: "Symptom-first", isCorrect: false },
    ],
    explanation:
      "Bottom-to-Top beginnt auf Layer 1 (physisch: Kabel, LEDs, Transceiver) und arbeitet schrittweise nach oben: Layer 2 (Switching, MAC), Layer 3 (IP, Routing), Layer 4 (TCP/UDP), bis zur Anwendungsschicht. Geeignet, wenn physische Symptome wie keine Link-LED oder fehlendes Signal vorhanden sind.",
  },
  {
    id: "np-trouble-q4",
    type: "single-choice",
    // PBQ-artig: In der echten Prüfung als Szenario
    text: "Technikerin Sara pingt einen Remote-Host — alle Pings gehen durch. Trotzdem kann sie die Website (https://example.com) nicht öffnen. Was ist die wahrscheinlichste Ursache?",
    points: 10,
    answers: [
      { id: "a", text: "Der Remote-Host ist nicht erreichbar", isCorrect: false },
      { id: "b", text: "Kein Default-Gateway konfiguriert", isCorrect: false },
      { id: "c", text: "DNS-Auflösung schlägt fehl", isCorrect: true },
      { id: "d", text: "Duplex-Mismatch an Saras Switch-Port", isCorrect: false },
    ],
    explanation:
      "Da Ping (ICMP, IP-basiert) funktioniert, ist Layer 1–3 in Ordnung. Die Website-URL erfordert DNS-Auflösung — wenn DNS nicht funktioniert, kann der Browser die IP nicht ermitteln und die Verbindung schlägt fehl. Diagnose: 'nslookup example.com' ausführen. Wenn Ping auf die IP-Adresse der Website direkt funktioniert, bestätigt sich der DNS-Fehler.",
  },
  {
    id: "np-trouble-q5",
    type: "single-choice",
    text: "Ein neues Gerät erhält die IP-Adresse 169.254.45.12. Was bedeutet das?",
    points: 10,
    answers: [
      { id: "a", text: "Das Gerät hat eine statisch konfigurierte IP aus dem Link-Local-Bereich", isCorrect: false },
      { id: "b", text: "Das Gerät hat keinen DHCP-Server erreicht und eine APIPA-Adresse automatisch zugewiesen", isCorrect: true },
      { id: "c", text: "Das Gerät ist in einem privaten RFC-1918-Netzwerk", isCorrect: false },
      { id: "d", text: "Das Gerät hat eine IPv6-Adresse (Link-Local)", isCorrect: false },
    ],
    explanation:
      "169.254.0.0/16 ist der APIPA-Bereich (Automatic Private IP Addressing). Wenn ein Windows-/macOS-Client beim Booten keinen DHCP-Server erreicht, weist es sich selbst eine zufällige APIPA-Adresse zu. Ursachen: DHCP-Server ausgefallen, DHCP-Pool erschöpft, DHCP-Relay fehlt, falsche VLAN-Konfiguration. Diagnose: DHCP-Server und Netzwerkverbindung prüfen.",
  },
  {
    id: "np-trouble-q6",
    type: "single-choice",
    text: "Welches CLI-Tool zeigt den Pfad von Paketen durch ein Netzwerk inkl. aller Zwischen-Hops und deren Latenz?",
    points: 10,
    answers: [
      { id: "a", text: "ping", isCorrect: false },
      { id: "b", text: "netstat", isCorrect: false },
      { id: "c", text: "traceroute / tracert", isCorrect: true },
      { id: "d", text: "arp", isCorrect: false },
    ],
    explanation:
      "traceroute (Linux/macOS) bzw. tracert (Windows) zeigt jeden Router-Hop auf dem Weg zum Ziel mit der Latenz pro Hop. Es nutzt TTL-Manipulation: Pakete mit TTL=1 werden vom ersten Router verworfen → Router sendet ICMP Time Exceeded zurück → traceroute erfährt die Router-Adresse. ping prüft nur Erreichbarkeit. netstat zeigt lokale Verbindungen. arp zeigt IP-zu-MAC-Zuordnungen.",
  },
  {
    id: "np-trouble-q7",
    type: "single-choice",
    text: "Ein Netzwerk-Loop verursacht eine Broadcast-Storm. Die Verbindungen funktionieren nicht mehr. Welches Protokoll hätte diesen Loop verhindern sollen?",
    points: 10,
    answers: [
      { id: "a", text: "OSPF (Open Shortest Path First)", isCorrect: false },
      { id: "b", text: "STP (Spanning Tree Protocol)", isCorrect: true },
      { id: "c", text: "DHCP (Dynamic Host Configuration Protocol)", isCorrect: false },
      { id: "d", text: "DNS (Domain Name System)", isCorrect: false },
    ],
    explanation:
      "STP (Spanning Tree Protocol) und sein modernerer Nachfolger RSTP (Rapid STP) verhindern Layer-2-Loops, indem sie redundante Switch-Ports in den Blocking-State setzen. Bei einem Loop zirkulieren Broadcasts endlos → Broadcast-Storm → kompletter Netzwerkausfall. STP erkennt Loops über BPDUs (Bridge Protocol Data Units) und blockt einen der redundanten Pfade.",
  },
  {
    id: "np-trouble-q8",
    type: "single-choice",
    text: "Welches Hardware-Tool ermöglicht es, Glasfaser-Kabel auf Signaldämpfung zu prüfen und misst die Leistungsstärke des optischen Signals?",
    points: 10,
    answers: [
      { id: "a", text: "Kabeltester (Copper Cable Tester)", isCorrect: false },
      { id: "b", text: "Network TAP", isCorrect: false },
      { id: "c", text: "Optisches Leistungsmessgerät (Optical Power Meter)", isCorrect: true },
      { id: "d", text: "Wi-Fi-Analysator", isCorrect: false },
    ],
    explanation:
      "Ein optisches Leistungsmessgerät misst die Intensität des Lichtsignals auf einer Glasfaser-Strecke in dBm. Es erkennt Dämpfungsprobleme durch zu lange Kabel, schlechte Verbinder oder Spleißverluste. Ein Kupfer-Kabeltester prüft Continuity und Wiremap für UTP/STP-Kabel. Network TAP kopiert Netzwerktraffic passiv. Wi-Fi-Analysator ist für WLAN-Diagnose.",
  },
  {
    id: "np-trouble-q9",
    type: "multiple-choice",
    text: "Welche ZWEI Symptome deuten typischerweise auf einen Wireless-Kanal-Überlappungsfehler im 2,4-GHz-Band hin? (Wähle 2)",
    points: 10,
    answers: [
      { id: "a", text: "Niedriger Datendurchsatz trotz guter RSSI-Signalstärke", isCorrect: true },
      { id: "b", text: "Keine IP-Adresse vom DHCP-Server", isCorrect: false },
      { id: "c", text: "Viele Retransmissions im WLAN-Traffic", isCorrect: true },
      { id: "d", text: "Client kann sich nicht authentifizieren", isCorrect: false },
    ],
    explanation:
      "Kanalüberlappung im 2,4-GHz-Band (nur Kanäle 1, 6, 11 sind nicht-überlappend) führt zu Interferenz zwischen APs. Das WLAN-Signal ist vorhanden (gute RSSI), aber durch Interferenz entstehen viele Retransmissions → niedriger effektiver Durchsatz trotz starkem Signal. Kein DHCP oder Authentifizierungsfehler sind keine typischen Symptome von Kanalüberlappung.",
  },
  {
    id: "np-trouble-q10",
    type: "single-choice",
    text: "Was ist der Unterschied zwischen einem Network TAP und Portspiegelung (Port Mirroring/SPAN)?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Ein TAP ist aktiv und verändert den Traffic, Portspiegelung ist passiv",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Ein TAP kopiert Traffic passiv ohne Gerätebelastung; Portspiegelung belastet den Switch und kann bei hoher Last Pakete auslassen",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Portspiegelung funktioniert nur für WLAN-Traffic, TAP nur für Kabel",
        isCorrect: false,
      },
      {
        id: "d",
        text: "Beide Methoden sind identisch — nur unterschiedliche Begriffe",
        isCorrect: false,
      },
    ],
    explanation:
      "Ein Network TAP (Test Access Point) sitzt physisch inline in der Verbindung und kopiert passiv alle Pakete — ohne den Switch zu belasten. Portspiegelung (SPAN) konfiguriert den Switch, Traffic zu spiegeln, belastet aber den Switch-Prozessor/ASIC. Bei hohem Traffic kann Portspiegelung Pakete auslassen (Drops). TAPs liefern 100% aller Pakete, sind aber teurer in der Infrastruktur.",
  },
  {
    id: "np-trouble-q11",
    type: "single-choice",
    text: "Ein Mitarbeiter klagt: 'VoIP-Telefonate ruckeln und haben Aussetzer, aber E-Mails und Downloads funktionieren problemlos.' Welches Netzwerkproblem beschreibt das am besten?",
    points: 10,
    answers: [
      { id: "a", text: "Bandbreitenerschöpfung — alle Verbindungen sind betroffen", isCorrect: false },
      { id: "b", text: "Jitter — schwankende Paketlaufzeiten beeinträchtigen Echtzeit-Traffic", isCorrect: true },
      { id: "c", text: "DNS-Fehler — Namen werden nicht aufgelöst", isCorrect: false },
      { id: "d", text: "MTU-Mismatch — Frames werden fragmentiert", isCorrect: false },
    ],
    explanation:
      "Jitter beschreibt Schwankungen in der Paketlaufzeit. VoIP ist extrem empfindlich gegenüber Jitter, weil Sprachpakete in Echtzeit in gleichmäßigen Abständen ankommen müssen. Wenn Pakete mit unterschiedlicher Verzögerung ankommen, entstehen Aussetzer und Ruckeln. E-Mails und Downloads (TCP) sind unempfindlich — TCP puffert und überträgt bei Verzögerung erneut. QoS mit VoIP-Priorisierung löst das Problem.",
  },
  {
    id: "np-trouble-q12",
    type: "single-choice",
    text: "Was zeigt der Befehl 'arp -a' an?",
    points: 10,
    answers: [
      { id: "a", text: "Die Routing-Tabelle des Systems mit IP-Netzwerken und Next-Hops", isCorrect: false },
      { id: "b", text: "Alle aktiven TCP/UDP-Verbindungen und Ports", isCorrect: false },
      { id: "c", text: "Den ARP-Cache: gespeicherte IP-zu-MAC-Adress-Zuordnungen", isCorrect: true },
      { id: "d", text: "Alle DNS-Einträge im lokalen DNS-Resolver-Cache", isCorrect: false },
    ],
    explanation:
      "'arp -a' zeigt den ARP-Cache (Address Resolution Protocol Cache) — die lokal gespeicherten Zuordnungen von IP-Adressen zu MAC-Adressen. Nützlich zur Diagnose von IP-Konflikten (zwei Einträge mit derselben IP aber verschiedenen MACs) oder ARP-Spoofing-Verdacht. 'route print' / 'netstat -r' zeigt Routing-Tabelle. 'netstat -an' zeigt Verbindungen. 'ipconfig /displaydns' zeigt DNS-Cache.",
  },
  {
    id: "np-trouble-q13",
    type: "single-choice",
    text: "Welches Diagnosetool kann eingesetzt werden, um herauszufinden, welche TCP-Ports auf einem Remote-Host geöffnet sind?",
    points: 10,
    answers: [
      { id: "a", text: "ping", isCorrect: false },
      { id: "b", text: "traceroute", isCorrect: false },
      { id: "c", text: "nslookup", isCorrect: false },
      { id: "d", text: "nmap", isCorrect: true },
    ],
    explanation:
      "nmap (Network Mapper) kann Hosts scannen und offene TCP/UDP-Ports erkennen. 'nmap -p 80,443 <host>' prüft spezifische Ports. 'nmap -sn <netzwerk>' führt einen Ping-Sweep durch ohne Port-Scan. ping prüft nur ICMP-Erreichbarkeit (kein Port-Test). traceroute zeigt den Routing-Pfad. nslookup löst DNS-Namen auf.",
  },
  {
    id: "np-trouble-q14",
    type: "single-choice",
    // PBQ-artig: Klassischer N10-009 Tool-Zuordnungs-Szenario
    text: "Ein Techniker muss ein Ethernet-Kabel in einem Kabelbündel identifizieren, das hinter einer abgehängten Decke verläuft, ohne die genaue Strecke sehen zu können. Welches Hardware-Tool ist am geeignetsten?",
    points: 10,
    answers: [
      { id: "a", text: "Kabeltester (Wire Map Tester)", isCorrect: false },
      { id: "b", text: "Wi-Fi-Analysator", isCorrect: false },
      { id: "c", text: "Toner (Tone Generator und Probe)", isCorrect: true },
      { id: "d", text: "Network TAP", isCorrect: false },
    ],
    explanation:
      "Ein Toner (Tone Generator + Inductive Probe) sendet ein Tonsignal in das Kabel am einen Ende. Die Probe wird entlang der Kabelbündel gehalten und erkennt akustisch das Signal — auch durch Wände und Decken. Perfekt für Kabelidentifikation in unübersichtlichen Infrastrukturen. Ein Kabeltester prüft Pinbelegung und Continuity, kann aber kein Kabel in einem Bündel identifizieren.",
  },
  {
    id: "np-trouble-q15",
    type: "single-choice",
    text: "Ein Switch-Port zeigt den Status 'err-disabled'. Was bedeutet das und was ist der erste Schritt zur Diagnose?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Der Port ist administrativ mit 'shutdown' deaktiviert — einfach 'no shutdown' eingeben",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Der Port wurde automatisch vom Switch gesperrt (z.B. durch Port-Security-Verletzung oder BPDU-Guard) — Ursache diagnostizieren, beheben und Port reaktivieren",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Das Kabel ist defekt — Kabel tauschen",
        isCorrect: false,
      },
      {
        id: "d",
        text: "STP hat den Port blockiert — Normal-Status, keine Aktion nötig",
        isCorrect: false,
      },
    ],
    explanation:
      "'Err-disabled' bedeutet: Der Switch hat den Port automatisch gesperrt, weil eine Sicherheits- oder Konfigurationsregel verletzt wurde. Häufige Ursachen: Port-Security-Verletzung (fremde MAC-Adresse), BPDU-Guard-Auslösung (unerlaubter Switch angeschlossen), Loopback-Erkennung. Diagnose: Logs prüfen ('show log'), Ursache beheben, dann Port zurücksetzen ('shutdown' + 'no shutdown'). Einfach 'no shutdown' ohne Ursachenbehebung führt sofort wieder zu 'err-disabled'.",
  },
];

export const QUIZ_NETPLUS_TROUBLESHOOTING: Quiz = {
  id: "netplus-quiz-troubleshooting",
  title: "Network+ T5: Netzwerkfehlerbehebung",
  description:
    "Fehlerbehebungsmethodik (7 Schritte), Kabelprobleme, Schnittstellenfehler, Netzwerkdienstprobleme, Performance-Issues und Diagnose-Tools — N10-009 Domain 5 (24% der Prüfung).",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 900,
  questions: QUIZ_QUESTIONS_T5,
};

// ── Topic-Descriptor ──────────────────────────────────────────

export const TOPIC_NETPLUS_TROUBLESHOOTING: Topic = {
  id: "netplus-troubleshooting",
  title: "Netzwerkfehlerbehebung",
  description:
    "7-Schritte-Fehlerbehebungsmethodik, OSI-basierte Ansätze (Top-to-Bottom, Bottom-to-Top, Divide-and-Conquer), Kabel- und physische Schnittstellenprobleme, Switching/Routing/DNS/DHCP-Fehler, Performance-Probleme (Latenz, Jitter, Paketverlust, Wireless) und CLI/Hardware-Diagnose-Tools.",
  conceptIds: [
    "netplus-troubleshooting-methodology",
    "netplus-cable-physical-issues",
    "netplus-network-service-issues",
    "netplus-performance-issues",
    "netplus-troubleshooting-tools",
  ],
  quizIds: ["netplus-quiz-troubleshooting"],
  exerciseIds: [],
  prerequisiteTopicIds: [
    "netplus-network-concepts",
    "netplus-implementation",
    "netplus-operations",
  ],
  estimatedMinutes: 90,
  tags: ["troubleshooting", "methodology", "cable", "routing", "dhcp", "dns", "performance", "tools", "n10-009", "comptia"],
};

// ── Exports ───────────────────────────────────────────────────

export const TROUBLESHOOTING_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_TROUBLESHOOTING_METHODOLOGY.id]: CONCEPT_TROUBLESHOOTING_METHODOLOGY,
  [CONCEPT_CABLE_PHYSICAL_ISSUES.id]: CONCEPT_CABLE_PHYSICAL_ISSUES,
  [CONCEPT_NETWORK_SERVICE_ISSUES.id]: CONCEPT_NETWORK_SERVICE_ISSUES,
  [CONCEPT_PERFORMANCE_ISSUES.id]: CONCEPT_PERFORMANCE_ISSUES,
  [CONCEPT_TROUBLESHOOTING_TOOLS.id]: CONCEPT_TROUBLESHOOTING_TOOLS,
};
