# CCNA 200-301 v1.1 – Gap-Plan

> **Zweck:** Vergleich Repo-Inventar (Phase 0) mit Referenz-Curriculum (Phase 1).  
> Grundlage für die inhaltliche Umsetzung (Phase 3).  
> **Freigabe-Status:** ✅ Freigegeben (26. Mai 2026)  
**Sprache:** DE-only (kein i18n — Cisco-Fachbegriffe englisch, Erklärtexte deutsch)
>
> **THIN-Schwellenwerte (nutzerdefiniert):**
> | Section | Quiz-Minimum | Konzept-Minimum |
> |---------|-------------|-----------------|
> | 1.0 (20%) | 25 | 6 |
> | 2.0 (20%) | 25 | 6 |
> | 3.0 (25%) | 30 | 8 |
> | 4.0 (10%) | 15 | 4 |
> | 5.0 (15%) | 20 | 6 |
> | 6.0 (10%) | 15 | 4 |

---

## Aktueller Ist-Stand (messbar)

| Blueprint | Topic/Datei | Konzepte | Quiz-Q | Soll-Q | Soll-K | Delta-Q | Status |
|-----------|-------------|---------|--------|--------|--------|---------|--------|
| **1.0** | networking-fundamentals | 7 | 23 | — | — | — | ✅ |
| **1.0** | ipv4-addressing | 5 | 31 | — | — | — | ✅ |
| **1.0** | subnet-segmentation | 7 | 20 | — | — | — | ✅ |
| **1.0** | verkabelung | 10 | 31 | — | — | — | ✅ |
| **1.8/1.9** | ipv6 | 4 | 8 | 15 | 6 | -7 | ⚠️ THIN |
| **1.12** | *virtualization* | 0 | 0 | 8 | 4 | -8 | ❌ MISSING |
| **2.0** | switching-vlans | 6 | 0* | — | — | — | ⚠️ |
| **2.0** | vlan-advanced | 9 | 0* | — | — | — | ⚠️ |
| **2.0** | wlan | 4 | 9 | 15 | 5 | -6 | ⚠️ THIN |
| **2.5** | *stp-rstp (dediziert)* | 0 | 0 | 15 | 4 | -15 | ❌ MISSING |
| **2.0 ges.** | *(Section 2.0 gesamt)* | 19 | 9 | 25 | 6 | -16 | ⚠️ THIN |
| **3.0** | routing-ospf | 5 | 8 | — | — | — | ⚠️ |
| **3.5** | fhrp | 5 | 8 | — | — | — | ⚠️ |
| **3.0 ges.** | *(Section 3.0 gesamt)* | 10 | 16 | 30 | 8 | -14 | ⚠️ THIN |
| **4.0** | dhcp-nat | 4 | 15 | — | — | — | ✅ |
| **4.0** | device-management | 6 | 8 | — | — | — | ✅ |
| **4.7** | qos | 4 | 7 | 10 | 4 | -3 | ⚠️ THIN |
| **4.9** | *tftp-ftp* | 0 | 0 | 5 | 2 | -5 | ❌ MISSING |
| **5.0** | security (ACL, Port-Sec, DHCP Snooping) | 8 | 34 | — | — | — | ✅ |
| **5.2** | *security-program-elements* | 0 | 0 | 8 | 2 | -8 | ❌ MISSING |
| **5.9** | *802.1x-authentication* | 0 | 0 | 8 | 3 | -8 | ❌ MISSING |
| **6.0** | automation | 3 | 8 | — | — | — | ⚠️ |
| **6.0** | sdn-controller | 5 | 8 | — | — | — | ✅ |
| **6.0 ges.** | *(Section 6.0 gesamt)* | 8 | 16 | 15 | 4 | +1 | ✅ knapp |
| **Exam-Sim** | QUIZ_CCNA_EXAM | — | 20 | 100 | — | -80 | ❌ MISSING |
| **Exam-Sim 2** | *QUIZ_CCNA_EXAM_2* | — | 0 | 100 | — | -100 | ❌ MISSING |

*\* Fragen in Topics verankert, kein verknüpftes Quiz-Objekt im Quiz-Registry*

---

## MISSING — Themen, die komplett fehlen → neu anlegen

### M-1: Virtualisierungsgrundlagen `[1.12]`
- **Blueprint:** 1.12 — Describe virtualization fundamentals (server virtualization, containers, VRFs)
- **Datei anlegen:** `src/content/modules/ccna/topics/virtualization.ts`
- **Inhalte:**
  - Hypervisor Typ 1 (ESXi, Hyper-V) vs. Typ 2 (VirtualBox)
  - VMs vs. Container (Docker, Kubernetes) — Isolation, Overhead, Startup-Zeit
  - VRF (Virtual Routing and Forwarding) — mehrere Routing-Tabellen auf einem Router
  - Virtual Switching (vSwitch, Cisco Nexus 1000V)
  - Network Function Virtualization (NFV)
- **Quiz anlegen:** `QUIZ_VIRTUALIZATION` (min. 8 Fragen)
- **Commit:** `feat(ccna): Section 1.0 Virtualization Fundamentals [1.12] – Konzepte + 8 Quizfragen`

---

### M-2: STP/RSTP dediziertes Quiz `[2.5]`
- **Blueprint:** 2.5 — Interpret basic operations of Rapid PVST+ Spanning Tree Protocol
- **Datei erweitern:** `src/content/modules/ccna/topics/switching-vlans.ts` (stp-Konzept ausbauen)
- **Quiz anlegen:** `QUIZ_STP` in `src/lib/ccna-quiz-content.ts`
- **TOPIC_SWITCHING_VLANS.quizIds** ergänzen: `["ccna-quiz-stp"]`
- **Inhalte für Quiz:**
  - Root Bridge Wahl (Bridge-ID = Priority + MAC, niedrigste gewinnt)
  - Root Port, Designated Port, Alternate Port (RSTP)
  - Port-States STP: Blocking/Listening/Learning/Forwarding
  - Port-States RSTP: Discarding/Learning/Forwarding
  - PortFast und BPDU Guard — Konfiguration und Use Case
  - STP-Kosten: 1 Gbit/s=1 (nach IEEE), 100 Mbit/s=19, 10 Mbit/s=100
  - PVST+ vs. Rapid PVST+ — Unterschied und Konvergenzzeit
  - Timer: Hello (2s), Forward Delay (15s), Max Age (20s)
- **Commit:** `feat(ccna): Section 2.0 STP/RSTP Quiz ccna-quiz-stp – 15 Quizfragen`

---

### M-3: TFTP/FTP im Netzwerk `[4.9]`
- **Blueprint:** 4.9 — Describe the capabilities and function of TFTP/FTP in the network
- **Datei:** Konzept in `src/content/modules/ccna/topics/device-management.ts` einfügen **oder** eigenes Konzept in `ios-cli.ts`
- **Inhalte:**
  - TFTP: UDP/69, kein Auth, kein Directory, für IOS-Image-/Config-Transfer
  - FTP: TCP/20+21, Passwort-Auth, Aktiv vs. Passiv
  - IOS-Backup/Upgrade-Workflow: `copy flash: tftp:`, `verify /md5`, Boot-Statement
  - SFTP/SCP als sichere Alternativen
- **Quiz-Fragen:** 5 neue Fragen in QUIZ_DEVICE_MGMT ergänzen
- **Commit:** `feat(ccna): Section 4.0 TFTP/FTP [4.9] – Konzept + 5 Quizfragen in QUIZ_DEVICE_MGMT`

---

### M-4: Security Program Elements `[5.2]`
- **Blueprint:** 5.2 — Describe security program elements (user awareness, training, physical access control)
- **Datei:** Neues Konzept in `src/content/modules/ccna/topics/security.ts` einfügen
- **Inhalte:**
  - Phishing-Bewusstsein, Security-Awareness-Programme
  - Acceptable Use Policy (AUP), Non-Disclosure Agreement (NDA)
  - Physical Security: Badge, Biometrie, Mantrap, Kamera, Rack-Schlösser
  - Defense in Depth: Layered Security-Konzept
  - Least Privilege, RBAC (Role-Based Access Control)
- **Quiz-Fragen:** 8 neue Fragen in QUIZ_HARDEN ergänzen
- **Commit:** `feat(ccna): Section 5.0 Security Program Elements [5.2] – Konzept + 8 Quizfragen`

---

### M-5: 802.1X Authentifizierungsmechanismen `[5.9]`
- **Blueprint:** 5.9 — Describe 802.1X authentication mechanisms
- **Datei erweitern:** `src/content/modules/ccna/topics/security.ts`
- **Inhalte:**
  - 802.1X Rollen: Supplicant / Authenticator (Switch oder AP) / Authentication Server (RADIUS)
  - EAP (Extensible Authentication Protocol) als Rahmenprotokoll
  - EAP-Methoden: EAP-TLS (Zertifikat beidseitig), PEAP (nur Server-Cert), EAP-FAST (Cisco)
  - Port-State: Unauthorized → Auth-Prozess → Authorized
  - Konfiguration Cisco Switch: `dot1x system-auth-control`, `authentication port-control auto`
  - Integration mit RADIUS
- **Quiz-Fragen:** 8 neue Fragen in QUIZ_SECURITY ergänzen
- **Commit:** `feat(ccna): Section 5.0 802.1X Authentication [5.9] – Konzept + 8 Quizfragen`

---

### M-6: Prüfungssimulation Erweiterung auf 100 Fragen + zweite Simulation
- **Blueprint-Verteilung:** 20/20/25/10/15/10 = 100 Fragen
- **Aktuell:** 20 Fragen in QUIZ_CCNA_EXAM → auf 100 erweitern
- **Neu:** QUIZ_CCNA_EXAM_2 mit weiteren 100 Fragen anlegen
- **Datei:** `src/lib/ccna-quiz-content.ts`
- **Fragen-Mix:** 60% Single-Choice, 30% Multiple-Choice, 10% True/False (als Platzhalter für Drag-and-Drop)
- **Commit:** `feat(ccna): Prüfungssimulation – Exam 1 auf 100 Fragen, Exam 2 mit 100 Fragen`

---

## THIN — Themen vorhanden, aber unter Mindest-Quote → erweitern

### T-1: IPv6 `[1.8, 1.9]` — 8 von 15 Fragen, 4 von 6 Konzepten
- **Datei:** `src/content/modules/ccna/topics/ipv6.ts`
- **Neue Konzepte hinzufügen:**
  - `ipv6-address-types` — alle Typen mit Präfix und Use-Case-Tabelle (GUA/ULA/LLA/Loopback/Unspecified/Multicast/Anycast)
  - `ipv6-ndp-slaac` — NDP (RS/RA/NS/NA), SLAAC, Stateless DHCPv6, Stateful DHCPv6
- **TOPIC_IPV6.conceptIds** um neue IDs erweitern
- **Quiz QUIZ_IPV6** auf 15 Fragen aufstocken (+7 Fragen):
  - IPv6 Multicast-Gruppen (FF02::1, FF02::2, FF02::5, FF02::6)
  - Anycast-Definition und Use Case
  - NDP vs. ARP Vergleich
  - DHCPv6 Stateless vs. Stateful
  - Adresstyp aus Präfix ableiten (Multiple-Choice mit Szenarien)
- **Commit:** `feat(ccna): Section 1.0 IPv6 [1.8/1.9] – 2 Konzepte + 7 neue Quizfragen`

---

### T-2: Section 2.0 Network Access — 9 von 25 Quiz-Q, 19 von 6 Konzepten (Quiz-Gap)
Der Quiz-Mangel kommt daher, dass `switching-vlans.ts` und `vlan-advanced.ts` zwar Konzepte haben, aber kein Quiz verlinkt ist.

- **Neue Quizze anlegen:**
  - `QUIZ_SWITCHING` (15 Fragen) → Blueprint 1.13 / 2.1: MAC-Learning, Frame-Flooding, VLANs, Access/Trunk-Ports
  - `QUIZ_STP` (15 Fragen) → Blueprint 2.5: STP/RSTP (bereits als M-2 gelistet)
  - `QUIZ_ETHERCHANNEL` (8 Fragen) → Blueprint 2.4: LACP, PAgP, Static, Load-Balance
- **Topics verlinken:**
  - `TOPIC_SWITCHING_VLANS.quizIds`: `["ccna-quiz-switching", "ccna-quiz-stp"]`
  - `TOPIC_VLAN_ADVANCED.quizIds`: `["ccna-quiz-vlan-advanced"]` (oder QUIZ_SWITCHING erweitern)
- **Commit:** `feat(ccna): Section 2.0 Network Access – 3 neue Quizze (Switching/STP/EtherChannel) +38 Fragen`

---

### T-3: WLAN `[2.6, 2.7, 2.8, 2.9]` — 9 von 15 Fragen, 4 von 5 Konzepten
- **Datei:** `src/content/modules/ccna/topics/wlan.ts`
- **Neues Konzept hinzufügen:**
  - `wlan-ap-modes` — Autonomous vs. Lightweight vs. Cloud-Based, Split-MAC, AP-Modi (Local/FlexConnect/Monitor/Sniffer)
- **TOPIC_WLAN.conceptIds** erweitern
- **Quiz QUIZ_WLAN** auf 15 Fragen aufstocken (+6 Fragen):
  - Split-MAC-Architektur: welche Funktion im AP, welche im WLC?
  - AP-Modus-Auswahl für Szenario (FlexConnect für Branch ohne WAN?)
  - WLC-Zugangswege: Welches Protokoll ist sicher? (SSH ja, Telnet nein)
  - WPA3 SAE vs. WPA2-PSK Unterschied
  - LAG am WLC — Zweck und Konfiguration
  - 802.11ax (Wi-Fi 6) Unterschied zu 802.11ac (OFDMA, TWT)
- **Commit:** `feat(ccna): Section 2.0 WLAN [2.6-2.9] – AP-Modi Konzept + 6 neue Quizfragen`

---

### T-4: OSPF Single-Area `[3.4]` — Section 3.0 gesamt: 16 von 30 Fragen, 10 von 8 Konzepten (Q-Gap)
- **Datei:** `src/content/modules/ccna/topics/routing-ospf.ts`
- **Neues Konzept hinzufügen:**
  - `ospf-neighbor-states` — alle 7 Neighbor-States mit Beschreibung und Troubleshooting
  - `ospf-dr-bdr` — DR/BDR-Wahl, Kriterien, OSPF-Netzwerktypen (Broadcast/P2P), `ip ospf network`
  - `ospf-lsa-types` — LSA Type 1/2/3, wer generiert sie, wozu
- **Quiz QUIZ_OSPF** auf 20 Fragen aufstocken (+12 Fragen):
  - Neighbor-State-Szenario: Warum bleibt Nachbar in "2-Way"?
  - DR-Wahl bei gegebener Priority-Tabelle
  - OSPF Cost berechnen (Referenzbandbreite, `auto-cost`)
  - OSPFv3 vs. OSPFv2 (IPv6-Support)
  - Troubleshooting: Hello/Dead-Timer-Mismatch, Subnet-Mismatch
  - `passive-interface` — was passiert mit dem Hello?
  - LSA Type 1 vs. Type 2 — wer generiert welchen?
  - Floating Static Route vs. OSPF-Route — AD-Vergleich
- **Statisches Routing ausbauen** (IPv6 Static Routes, Floating Static)
- **Commit:** `feat(ccna): Section 3.0 IP Connectivity – OSPF [3.4] 3 Konzepte + 12 Quizfragen, Routing gesamt`

---

### T-5: QoS `[4.7]` — 7 von 10 Fragen
- **Datei:** `src/content/modules/ccna/topics/qos.ts`
- **Quiz QUIZ_QOS** auf 10 Fragen aufstocken (+3 Fragen):
  - DSCP EF=46 für VoIP (Prüfungsfavorit)
  - Policing vs. Shaping: Was passiert bei Überschreitung?
  - LLQ: Warum ist es die beste Lösung für Echtzeit-Traffic?
- **Commit:** `feat(ccna): Section 4.0 QoS [4.7] – 3 neue Quizfragen`

---

### T-6: Automation `[6.1–6.7]` — Section 6.0: 16 von 15 Fragen ✓ (knapp), aber NETCONF/YANG fehlt
- **Datei:** `src/content/modules/ccna/topics/automation.ts`
- **Neues Konzept hinzufügen:**
  - `netconf-yang` — NETCONF (XML/SSH), RESTCONF (HTTP/YANG), YANG als Datenmodell, `show netconf-yang status`
- **TOPIC_AUTOMATION.conceptIds** erweitern
- **Quiz QUIZ_AUTOMATION** auf 12 Fragen aufstocken (+4 Fragen):
  - NETCONF vs. RESTCONF Unterschied
  - YANG-Datenmodell: Was beschreibt es?
  - Northbound API vs. Southbound API — Beispiel für jede
  - RESTCONF HTTP-Methode für Lesen einer Konfiguration (GET)
- **Commit:** `feat(ccna): Section 6.0 Automation [6.5] – NETCONF/YANG Konzept + 4 Quizfragen`

---

## NEEDS_REVIEW — Inhalte vorhanden, Korrektheit/Aktualität prüfen

### R-1: IPv6 Anycast `[1.9]`
- **Datei:** `src/content/modules/ccna/topics/ipv6.ts`
- **Problem:** Anycast hat keinen eigenen Präfix (ist eine GUA-Adresse auf mehreren Interfaces). Bestehender Inhalt zeigt nur globale Tabelle ohne Anycast. Prüfen ob korrekt erklärt.
- **Aktion:** Anycast-Beschreibung in `CONCEPT_IPV6_BASICS.content` ergänzen/korrigieren.

---

### R-2: OSPF Cost-Berechnung `[3.4]`
- **Datei:** `src/content/modules/ccna/topics/routing-ospf.ts`
- **Problem (v1.0 vs. v1.1):** Die Default-Referenzbandbreite beträgt 100 Mbit/s. OSPF-Cost = Referenzbandbreite / Interface-Bandbreite. Das führt dazu, dass **alle Links ab 100 Mbit/s aufwärts** (100M, 1G, 10G, 40G) dieselbe Cost **1** bekommen — OSPF kann ohne Anpassung nicht zwischen Gigabit und 10G unterscheiden. Dies ist ein klassischer Prüfungs-Fallstrick, der im bestehenden Content nicht explizit erwähnt wird.
- **Korrekte Lösung:** `auto-cost reference-bandwidth 100000` (= 100 Gbit/s in Mbit/s) konsistent auf **allen Routern derselben OSPF-Area** — sonst entstehen asymmetrische Kosten und suboptimales Routing.
- **Aktion:** In `CONCEPT_OSPF.content` Fallstrick-Tabelle ergänzen (100M=Cost 1, 1G=Cost 1, 10G=Cost 1 mit Default; vs. mit `ref-bw 100000`: 1G=Cost 100, 10G=Cost 10); Hinweis auf Konsistenzpflicht über gesamte Area.

---

### R-3: Wireless v1.1-Änderungen `[2.6, 2.8, 2.9]`
- **Datei:** `src/content/modules/ccna/topics/wlan.ts`
- **Problem (v1.0 → v1.1):** Blueprint v1.1 hat 2.8 (AP/WLC Management Access) und 2.9 (WLC GUI) als explizite Sub-Topics neu hinzugefügt. Im bestehenden `CONCEPT_WIRELESS_ARCHITECTURE` sind TACACS+/RADIUS für Admin-Zugriff und GUI-Details unterrepräsentiert.
- **Aktion:** In `CONCEPT_WIRELESS_ARCHITECTURE.content` explizite Erwähnung von TACACS+ für WLC-Admin (vs. RADIUS für Client-Auth) ergänzen. GUI-Konfigurationsschritte (SSID → Security → WPA2-PSK → VLAN-Mapping) als Schritt-für-Schritt hinzufügen.

---

### R-4: Automation v1.1 — NETCONF/YANG `[6.3, 6.5]`
- **Datei:** `src/content/modules/ccna/topics/automation.ts`
- **Problem:** v1.1 hat NETCONF/YANG in den Blueprint aufgenommen (unter 6.3 Southbound APIs und 6.5 REST-based APIs). Bestehender Content (rest-json, automation-tools) deckt REST und Ansible ab, hat aber keine NETCONF-Inhalte.
- **Aktion:** Als T-6 (THIN) bereits geplant — neues Konzept `netconf-yang` anlegen.

---

### R-5: Security — AAA-Details `[5.4]`
- **Datei:** `src/content/modules/ccna/topics/security.ts`
- **Problem:** TACACS+ vs. RADIUS Vergleich ist in `CONCEPT_SECURITY_FUNDAMENTALS` sehr knapp. Der Blueprint testet den Unterschied explizit (TACACS+ = Cisco-proprietär, TCP/49, trennt Auth/Author/Accounting; RADIUS = IEEE, UDP/1812+1813, kombiniert Auth+Author).
- **Aktion:** Tabelle TACACS+ vs. RADIUS in `security.ts` ausbauen. Fallstrick: "TACACS+ für Device-Admin, RADIUS für WLAN-Clients" explizit nennen.

---

## Zusammenfassung: Arbeitspaket für Phase 3

### Neue Dateien anlegen
| Datei | Inhalt | Commits |
|-------|--------|---------|
| `topics/virtualization.ts` | M-1: Virtualisierung [1.12] | 1 |

### Bestehende Dateien erweitern
| Datei | Änderung | Commits |
|-------|----------|---------|
| `topics/ipv6.ts` | T-1: +2 Konzepte, +7 Q | 1 |
| `topics/switching-vlans.ts` | T-2/M-2: STP ausbauen + Quiz-IDs | 1 |
| `topics/wlan.ts` | T-3: +1 Konzept (AP-Modi), +6 Q | 1 |
| `topics/routing-ospf.ts` | T-4/R-2: +3 Konzepte, +12 Q, OSPF-Cost-Fallstrick | 1 |
| `topics/qos.ts` | T-5: +3 Q | gebündelt |
| `topics/automation.ts` | T-6/R-4: +1 Konzept (NETCONF/YANG), +4 Q | 1 |
| `topics/security.ts` | M-4/M-5/R-5: +2 Konzepte (5.2+5.9), +16 Q, AAA ausbauen | 1 |
| `topics/device-management.ts` | M-3: +1 Konzept (TFTP/FTP), +5 Q | gebündelt |

### Quiz-Datei erweitern (`src/lib/ccna-quiz-content.ts`)
| Quiz | Aktion | Neue Fragen |
|------|--------|------------|
| `QUIZ_SWITCHING` | Neu anlegen | 15 |
| `QUIZ_STP` | Neu anlegen | 15 |
| `QUIZ_ETHERCHANNEL` | Neu anlegen | 8 |
| `QUIZ_VIRTUALIZATION` | Neu anlegen | 8 |
| `QUIZ_IPV6` | Erweitern | +7 → 15 |
| `QUIZ_WLAN` | Erweitern | +6 → 15 |
| `QUIZ_OSPF` | Erweitern | +12 → 20 |
| `QUIZ_DEVICE_MGMT` | Erweitern (+TFTP/FTP) | +5 → 13 |
| `QUIZ_QOS` | Erweitern | +3 → 10 |
| `QUIZ_SECURITY` | Erweitern (+802.1X) | +8 → 17 |
| `QUIZ_HARDEN` | Erweitern (+5.2) | +8 → 17 |
| `QUIZ_AUTOMATION` | Erweitern (+NETCONF/YANG) | +4 → 12 |
| `QUIZ_CCNA_EXAM` | Erweitern auf 100 | +80 → 100 |
| `QUIZ_CCNA_EXAM_2` | Neu anlegen | 100 |

**Gesamt neue Fragen:** ~299

### Geplante Commits (nach Cisco-Blueprint-Sections)
```
feat(ccna): Section 1.0 Network Fundamentals – Virtualization [1.12] + IPv6 [1.8/1.9] erweitert
feat(ccna): Section 2.0 Network Access – STP/RSTP Quiz + WLAN AP-Modi + Switching Quizze
feat(ccna): Section 3.0 IP Connectivity – OSPF Single-Area [3.4] 3 Konzepte + 12 Quizfragen
feat(ccna): Section 4.0 IP Services – TFTP/FTP [4.9] + QoS [4.7] erweitert
feat(ccna): Section 5.0 Security Fundamentals – 802.1X [5.9] + Security-Programm [5.2] + AAA
feat(ccna): Section 6.0 Automation – NETCONF/YANG [6.5] Konzept + Quizfragen
feat(ccna): Pruefungssimulation – Exam 1 auf 100 Fragen, Exam 2 neu (100 Fragen)
```

---

## ⏳ Freigabe-Checkpoint

**→ Bitte bestätigen, bevor Phase 3 (Code) beginnt.**

Nach Freigabe werden die Commits in der oben genannten Reihenfolge erstellt.  
Jede Section wird als atomarer Commit committiert.  
Kein Refactoring außerhalb des Content-Bereichs.
