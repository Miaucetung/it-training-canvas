# CompTIA Network+ N10-009 – Gap-Plan

> **Zweck:** Vergleich Repo-Ist-Stand mit Referenz-Curriculum (Phase 1).  
> Grundlage für die inhaltliche Umsetzung (Phase 3).  
> **Freigabe-Status:** 🔄 Entwurf (26. Mai 2026)  
> **Sprache:** DE-only (Cisco/CompTIA-Fachbegriffe englisch, Erklärtexte deutsch)
>
> **THIN-Schwellenwerte (nach Prüfungsgewichtung N10-009):**
> | Section | Quiz-Minimum | Konzept-Minimum |
> |---------|-------------|-----------------|
> | 1.0 (23%) | 28 | 7 |
> | 2.0 (20%) | 25 | 6 |
> | 3.0 (19%) | 24 | 6 |
> | 4.0 (14%) | 18 | 5 |
> | 5.0 (24%) | 30 | 8 |

---

## Aktueller Ist-Stand (messbar)

| Blueprint | Topic/Datei | Konzepte | Quiz-Q | Soll-Q | Soll-K | Delta-Q | Status |
|-----------|-------------|---------|--------|--------|--------|---------|--------|
| **1.1–1.4, 1.8** | netplus-network-concepts | 4 | 7 | 28 | 7 | -21 | ⚠️ THIN |
| **1.5** | *Medien/Transceiver (fehlt in Datei)* | 0 | 0 | — | — | — | ❌ MISSING |
| **1.6** | *Topologien/Architekturen (fehlt in Datei)* | 0 | 0 | — | — | — | ❌ MISSING |
| **1.7** | *IPv4-Adressierung / VLSM / CIDR (fehlt)* | 0 | 0 | — | — | — | ❌ MISSING |
| **2.1–2.3** | netplus-implementation | 3 | 8 | 25 | 6 | -17 | ⚠️ THIN |
| **2.4** | *Physische Installation (fehlt in Datei)* | 0 | 0 | — | — | — | ❌ MISSING |
| **3.1–3.4** | netplus-operations | 3 | 7 | 24 | 6 | -17 | ⚠️ THIN |
| **3.5** | *Netzwerkzugriff/VPN-Verwaltung (fehlt)* | 0 | 0 | — | — | — | ❌ MISSING |
| **4.1–4.3** | netplus-security | 3 | 7 | 18 | 5 | -11 | ⚠️ THIN |
| **5.0 gesamt** | *netplus-troubleshooting (fehlt komplett!)* | 0 | 0 | 30 | 8 | -30 | ❌ MISSING |
| **Exam-Sim** | *QUIZ_NETPLUS_EXAM (fehlt)* | — | 0 | 90 | — | -90 | ❌ MISSING |

---

## MISSING — Inhalte die komplett fehlen → neu anlegen

### M-1: Medien, Transceiver, Topologien, IPv4-Adressierung `[1.5, 1.6, 1.7]`

**Blueprint:**
- 1.5 — Übertragungsmedien und Transceiver (SMF, MMF, DAC, Koaxial, SFP, QSFP, Steckertypen)
- 1.6 — Netzwerk-Topologien und -Architekturen (Mesh, Star, Spine-Leaf, 3-Tier, Collapsed Core, Traffic Flows)
- 1.7 — IPv4-Adressierung (VLSM, CIDR, RFC1918, APIPA, Adressklassen)

**Empfehlung:** In bestehende `netplus-network-concepts.ts` integrieren (3 neue Concepts + 10–12 neue Quiz-Fragen)  
**Neue Concepts:**
- `CONCEPT_MEDIA_TRANSCEIVERS` (Kabel/Glasfaser/Stecker/SFP/QSFP)
- `CONCEPT_NETWORK_TOPOLOGIES` (Mesh/Star/Spine-Leaf/3-Tier/Collapsed Core)
- `CONCEPT_IPV4_ADDRESSING` (VLSM/CIDR/RFC1918/Klassen)

---

### M-2: Physische Installation `[2.4]`

**Blueprint:** 2.4 — IDF/MDF, Rack-Größe, Patchfeld, USV/PDU, Umweltfaktoren (Temperatur, Feuchtigkeit, Brandschutz)

**Empfehlung:** In bestehende `netplus-implementation.ts` integrieren (1 neues Concept + 4–5 neue Quiz-Fragen)  
**Neues Concept:** `CONCEPT_PHYSICAL_INSTALL` (Serverraum-Grundlagen, IDF/MDF, USV, PDU)

---

### M-3: Netzwerkzugriff und -verwaltung `[3.5]`

**Blueprint:** 3.5 — Site-to-Site-VPN, Client-to-Site-VPN (Split/Full Tunnel), SSH/GUI/API/Konsole, Jump-Box, In-Band vs. Out-of-Band

**Empfehlung:** In bestehende `netplus-operations.ts` integrieren (1–2 neue Concepts + 5–6 neue Quiz-Fragen)  
**Neues Concept:** `CONCEPT_NETWORK_ACCESS_MGMT` (VPN-Typen, Remote-Access-Methoden, Jump-Box)

---

### M-4: Netzwerkfehlerbehebung `[5.1, 5.2, 5.3, 5.4, 5.5]` — KRITISCH (24% der Prüfung!)

**Blueprint:** Komplette Section 5.0 fehlt — die gewichtigste Section der Prüfung (24%)!
- 5.1 — Fehlerbehebungs-Methodik (7-Schritte-Prozess, Top-to-Bottom/Bottom-to-Top, Teile-und-herrsche)
- 5.2 — Kabelprobleme (falsches Kabel, CRC, Runts, Giants, PoE-Fehler, Transceiver-Mismatch)
- 5.3 — Netzwerkdienstprobleme (STP-Loops, VLAN-Fehler, Routing-Tabellen, IP-Adressfehler)
- 5.4 — Performance-Probleme (Latenz, Jitter, Paketverlust, Wireless-Interferenz)
- 5.5 — Tools (ping/traceroute/nslookup/tcpdump/Nmap/LLDP/CDP, Kabeltester, Wi-Fi-Analysator)

**Datei anlegen:** `src/content/modules/comptia-network-plus/topics/netplus-troubleshooting.ts`  
**Neue Concepts (5):**
- `CONCEPT_TROUBLESHOOTING_METHODOLOGY` (7-Schritte, OSI-basierte Methoden)
- `CONCEPT_CABLE_PHYSICAL_ISSUES` (Kabeltypen, Signaldegradation, Interface-Zähler)
- `CONCEPT_NETWORK_SERVICE_ISSUES` (STP, VLAN, Routing, IP-Adressierung)
- `CONCEPT_PERFORMANCE_ISSUES` (Latenz, Jitter, Paketverlust, Wireless)
- `CONCEPT_TROUBLESHOOTING_TOOLS` (CLI-Befehle, Hardware-Tools, Cisco show-Befehle)

**Quiz:** 15+ neue Fragen (Prüfungsformat: oft szenariobasierte Fragen)

---

### M-5: Exam-Simulation Quiz `[Alle Sections]`

**Blueprint:** Kein Datei-Pendant — Exam-Sim mit 90 Fragen über alle 5 Sections

**Empfehlung:** `QUIZ_NETPLUS_EXAM` in `netplus-network-concepts.ts` oder separater Datei  
**Ziel:** 90 Fragen, 90 Minuten Zeitlimit, 70% Bestehensgrenze

---

## THIN — Bestehende Topics mit zu wenig Quiz-Fragen

### T-1: netplus-network-concepts (7/28 Fragen)
**Lücken durch fehlende M-1-Inhalte** (s.o.) + zusätzliche Fragen zu bestehenden Concepts nötig:
- OSI-Layer-Zuordnung (mehr Szenarien)
- Ports/Protokolle (mehr Port-Zahlen-Abfragen)
- Cloud-Konzepte (IaaS/PaaS/SaaS Shared Responsibility)
- IPv6-Übergangstechnologien (Dual Stack, NAT64, Tunneling)
- **Ziel nach Phase 3:** 28+ Fragen

### T-2: netplus-implementation (8/25 Fragen)
**Lücken durch fehlende M-2-Inhalte** (s.o.) + nötige Ergänzungen:
- VLAN-Hopping-Prävention, Native VLAN Sicherheit
- OSPF-Metriken, BGP-Grundlagen
- WPA3-SAE vs. WPA2-PSK, Enterprise-Authentifizierung
- Link-Aggregation / LACP
- **Ziel nach Phase 3:** 25+ Fragen

### T-3: netplus-operations (7/24 Fragen)
**Lücken durch fehlende M-3-Inhalte** (s.o.) + nötige Ergänzungen:
- SNMP Community-String-Sicherheit (v2c vs. v3)
- DNS-Record-Typen (MX, PTR, TXT, AAAA-Praxis)
- Change-Management-Prozess
- DR-Site-Typen (Cold/Warm/Hot mit Kosten-Vergleich)
- **Ziel nach Phase 3:** 24+ Fragen

### T-4: netplus-security (7/18 Fragen)
**Nötige Ergänzungen:**
- ARP-Poisoning vs. ARP-Spoofing (Unterschied)
- DHCP-Snooping und DAI (Dynamic ARP Inspection)
- 802.1X EAP-Typen
- PKI-Zertifikats-Lebenszyklus
- IoT/SCADA-Netzwerksegmentierung-Szenarien
- **Ziel nach Phase 3:** 18+ Fragen

---

## Priorisierter Umsetzungsplan (Phase 3)

| Priorität | Aufgabe | Datei | Aufwand | Begründung |
|-----------|---------|-------|---------|-----------|
| 🔴 P1 | Section 5.0 Troubleshooting komplett anlegen | `netplus-troubleshooting.ts` (neu) | Hoch | 24% der Prüfung, komplett fehlend |
| 🔴 P2 | IPv4-Adressierung + Topologien + Medien ergänzen | `netplus-network-concepts.ts` | Mittel | 3 Blueprint-Sections fehlen in 23%-Section |
| 🟡 P3 | Quiz-Fragen T-1 bis T-4 aufstocken | alle 4 .ts-Dateien | Mittel | Alle Topics unter Mindest-Schwellenwert |
| 🟡 P4 | Physische Installation [2.4] ergänzen | `netplus-implementation.ts` | Niedrig | Abgerundete Coverage von Section 2.0 |
| 🟡 P5 | Netzwerkzugriff/VPN [3.5] ergänzen | `netplus-operations.ts` | Niedrig | Abgerundete Coverage von Section 3.0 |
| 🟢 P6 | Exam-Simulation Quiz | neue Datei oder bestehend | Hoch | Prüfungsrealistische Gesamtsimulation |

---

## Zusammenfassung Delta

| Kennzahl | Ist | Soll | Delta |
|---------|-----|------|-------|
| Topics (Dateien) | 4 | 5 | -1 |
| Concepts | 13 | 32 | -19 |
| Quiz-Fragen | 29 | 125 | -96 |
| Blueprint-Sections vollständig abgedeckt | 2/13 | 13/13 | -11 |
| Exam-Simulation | 0 | 1 (90 Q) | -1 |
