// ============================================================
// CCNA Topic: Network Security
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_SECURITY_FUNDAMENTALS: Concept = {
  id: "security-fundamentals",
  title: "Netzwerksicherheit Grundlagen",
  appliesTo: ["ccna", "comptia-security-plus"],
  tags: ["security", "cia-triad", "threats", "vulnerabilities", "networking"],
  content: `
## Netzwerksicherheit Grundlagen

### CIA-Triad
| Ziel | Beschreibung | Bedrohung |
|------|-------------|-----------|
| **C**onfidentiality | Nur Berechtigte können Daten lesen | Sniffing, MitM |
| **I**ntegrity | Daten wurden nicht verändert | Tampering, Replay |
| **A**vailability | Dienst ist erreichbar | DoS/DDoS, Ausfälle |

### Angriffs-Typen
| Angriff | Beschreibung |
|---------|-------------|
| Reconnaissance | Informationssammlung (nmap, OSINT) |
| Phishing / Spear-Phishing | Täuschungs-E-Mails |
| Man-in-the-Middle (MitM) | Abfangen der Kommunikation |
| DoS / DDoS | Überlastung eines Dienstes |
| SQL Injection | Einschleusen von SQL-Code |
| Brute Force | Passwörter durch Ausprobieren knacken |

### Defense-in-Depth
Mehrere Sicherheitsschichten: Perimeter → Netzwerk → Host → Anwendung → Daten

### AAA-Framework
| Komponente | Funktion |
|-----------|---------|
| **A**uthentication | Wer bist du? (Identitätsnachweis) |
| **A**uthorization | Was darfst du? (Zugriffsrechte) |
| **A**ccounting | Was hast du getan? (Protokollierung) |

### Cisco AAA (TACACS+ / RADIUS)
- **TACACS+** (Cisco-proprietär): Trennt Auth/Author/Accounting, TCP 49, verschlüsselt
- **RADIUS** (offen): Kombiniert Auth+Author, UDP 1812/1813

### TACACS+ vs. RADIUS — Detaillierter Vergleich
| Merkmal | TACACS+ | RADIUS |
|---------|---------|--------|
| **Transport** | TCP Port 49 | UDP Port 1812 (Auth), 1813 (Accounting) |
| **Entwickler** | Cisco (proprietär) | RFC-Standard (offen) |
| **Verschlüsselung** | Gesamter Payload (vollständig) | Nur Passwort-Feld |
| **AAA-Trennung** | Vollständig getrennt (Auth / Author / Accounting) | Auth + Author kombiniert; Accounting separat |
| **Primärer Einsatz** | **Device-Administration** (CLI-Zugriff auf Router/Switch) | **Network Access** (WLAN-Clients, 802.1X, VPN) |
| **Fehlermeldungen** | Detailliert (separate Author-Antwort pro Befehl) | Begrenzt (Access-Accept / Access-Reject) |
| **Command Authorization** | Ja — granulare Befehlserlaubnis pro Benutzer | Nein — nicht unterstützt |

> **Merkregel**: **TACACS+ → Terminal (CLI/Device-Admin)**, **RADIUS → Remote-Access (WLAN/VPN/802.1X)**
  `.trim(),
};

export const CONCEPT_ACL_STANDARD: Concept = {
  id: "acl-standard",
  title: "Standard ACLs",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "standard-acl", "filtering", "layer-3"],
  content: `
## Standard ACLs (1–99, 1300–1999)

### Wesentlich
- Filtern **nur** anhand der **Quell-IP**.
- Kein Schutz vor spezifischen Diensten (kein Port-Match möglich).
- **Platzierung: nahe am Ziel**, da sonst alle anderen Verbindungen der Quelle ebenfalls blockiert würden.

### Konfiguration (nummeriert)
\`\`\`
R1(config)# access-list 10 deny 192.168.1.50 0.0.0.0
R1(config)# access-list 10 permit 192.168.1.0 0.0.0.255
R1(config)# access-list 10 deny any log

R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip access-group 10 out
\`\`\`

### Wildcard-Maske vs. Subnetzmaske
- 0 = prüfen, 1 = ignorieren (Inverse zur Subnetzmaske)
- /24 → Wildcard \`0.0.0.255\`
- Einzelhost → \`host 192.168.1.50\` oder \`192.168.1.50 0.0.0.0\`

### Verifikation
\`\`\`
R1# show access-lists 10
R1# show ip interface GigabitEthernet0/1 | include access list
\`\`\`
  `.trim(),
};

export const CONCEPT_ACL_EXTENDED: Concept = {
  id: "acl-extended",
  title: "Extended ACLs",
  appliesTo: ["ccna", "az-104"],
  tags: ["security", "acl", "extended-acl", "filtering", "layer-3", "layer-4"],
  relatedConceptIds: ["azure-nsg"],
  content: `
## Extended ACLs (100–199, 2000–2699)

### Wesentlich
- Filtern auf **Quell- und Ziel-IP**, **Protokoll** (TCP/UDP/ICMP/IP), **Port**, **TCP-Flags**, **DSCP**.
- **Platzierung: nahe an der Quelle** — ungewollter Traffic wird früh verworfen.

### Konfiguration (nummeriert)
\`\`\`
R1(config)# access-list 110 deny tcp 192.168.1.0 0.0.0.255 any eq 23
R1(config)# access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 80
R1(config)# access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 443
R1(config)# access-list 110 permit ip any any

R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip access-group 110 in
\`\`\`

### Wichtige Operatoren
| Operator | Bedeutung |
|---------|----------|
| \`eq\`   | Port equals |
| \`neq\`  | Port not equals |
| \`gt\` / \`lt\` | Port größer/kleiner |
| \`range\` | Port-Bereich (z.B. \`range 8080 8090\`) |
| \`established\` | TCP ACK/RST gesetzt — Rückverkehr |

### Hinweis
Für komplexere TCP-Stateful-Filterung wird **Reflexive ACL** oder **Zone-Based Firewall (ZBFW)** statt einfacher Extended-ACLs eingesetzt.
  `.trim(),
};

export const CONCEPT_ACL_NAMED: Concept = {
  id: "acl-named",
  title: "Named ACLs & Editierbarkeit",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "named-acl", "filtering"],
  content: `
## Named ACLs

### Vorteile gegenüber nummerierten ACLs
- Sprechende Namen (\`BLOCK-TELNET\` statt \`110\`).
- **Sequenznummern** ermöglichen gezieltes Einfügen/Löschen einzelner ACEs ohne ACL-Neubau.
- Wahlweise Standard- oder Extended-Modus.

### Beispiel: Extended Named ACL
\`\`\`
R1(config)# ip access-list extended DMZ-POLICY
R1(config-ext-nacl)# 10 permit tcp any host 172.16.10.10 eq 80
R1(config-ext-nacl)# 20 permit tcp any host 172.16.10.10 eq 443
R1(config-ext-nacl)# 30 deny ip 172.16.10.0 0.0.0.255 192.168.50.0 0.0.0.255
R1(config-ext-nacl)# 40 permit icmp 192.168.50.0 0.0.0.255 172.16.10.0 0.0.0.255
R1(config-ext-nacl)# 50 permit ip any any
\`\`\`

### Einzelne Zeile nachträglich einfügen / löschen
\`\`\`
R1(config)# ip access-list extended DMZ-POLICY
R1(config-ext-nacl)# 25 deny tcp any host 172.16.10.10 eq 22
R1(config-ext-nacl)# no 40
\`\`\`

### Sequenznummern neu vergeben
\`\`\`
R1# show access-lists DMZ-POLICY
R1(config)# ip access-list resequence DMZ-POLICY 100 10
\`\`\`
  `.trim(),
};

export const CONCEPT_ACL_TROUBLESHOOTING: Concept = {
  id: "acl-troubleshooting",
  title: "ACL-Troubleshooting",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "troubleshooting"],
  content: `
## Typische ACL-Fehler

| Symptom | Ursache | Diagnose |
|---------|--------|----------|
| Alles wird blockiert | Implizites \`deny any\` greift | \`show access-lists\` Hit-Counter prüfen |
| Falsche Richtung gewählt | \`in\` vs. \`out\` vertauscht | \`show ip interface <int>\` |
| Falsche Wildcard | Wildcard statt Subnetzmaske notiert | ACE prüfen, Maske invertieren |
| Reihenfolge falsch | Spezifische Regel **nach** allgemeiner | ACE-Reihenfolge umstellen |
| Stateful-Verhalten erwartet | Extended ACL ist stateless | \`established\`-Keyword oder ZBFW |

### Diagnosebefehle
\`\`\`
R1# show access-lists
R1# show ip interface GigabitEthernet0/0 | include access list
R1# debug ip packet detail 110     ! VORSICHT: Performance!
\`\`\`

### Beispiel-Output: Hit-Counter
\`\`\`
R1# show access-lists DMZ-POLICY
Extended IP access list DMZ-POLICY
    10 permit tcp any host 172.16.10.10 eq www (1284 matches)
    20 permit tcp any host 172.16.10.10 eq 443 (8771 matches)
    30 deny ip 172.16.10.0 0.0.0.255 192.168.50.0 0.0.0.255 (12 matches)
    40 permit icmp 192.168.50.0 0.0.0.255 172.16.10.0 0.0.0.255 (3 matches)
    50 permit ip any any (45120 matches)
\`\`\`

### Best Practices
- ACLs immer mit \`log\` auf den letzten \`deny\` versehen, um Fehlblockaden zu erkennen.
- Vor Änderung: \`show access-lists\` und Konfiguration sichern.
- Bei kritischen Pfaden Test-Traffic mit \`extended ping\` von der Quelle aussenden.
  `.trim(),
};

export const CONCEPT_PORT_SECURITY: Concept = {
  id: "port-security",
  title: "Port Security & Layer-2-Sicherheit",
  appliesTo: ["ccna"],
  tags: [
    "security",
    "networking",
    "layer-2",
    "port-security",
    "dhcp-snooping",
    "dai",
  ],
  content: `
## Port Security

Begrenzt MAC-Adressen auf einem Access-Port.

### Konfiguration
\`\`\`
SW(config-if)# switchport mode access
SW(config-if)# switchport port-security
SW(config-if)# switchport port-security maximum 2
SW(config-if)# switchport port-security mac-address sticky
SW(config-if)# switchport port-security violation shutdown  ! default

SW# show port-security interface GigabitEthernet0/1
\`\`\`

### Violation-Modi
| Modus | Aktion |
|-------|--------|
| shutdown | Port geht in err-disabled (Standard) |
| restrict | Verwirft Frames, erhöht Counter, keine Abschaltung |
| protect | Verwirft Frames, kein Counter, keine Abschaltung |

### DHCP Snooping (Wiederholung)
Verhindert Rogue-DHCP-Server → Details im DHCP-Topic

### Dynamic ARP Inspection (DAI)
- Validiert ARP-Pakete anhand der DHCP-Snooping-Binding-Tabelle
- Verhindert ARP-Spoofing
\`\`\`
SW(config)# ip arp inspection vlan 10,20
SW(config-if)# ip arp inspection trust   ! Uplink-Ports
\`\`\`

### 802.1X (Port-basierte Authentifizierung)
- **Supplicant**: Endgerät (802.1X-Client)
- **Authenticator**: Switch-Port
- **Authentication Server**: RADIUS-Server
- Port ist gesperrt bis Authentifizierung erfolgreich
  `.trim(),
};

export const CONCEPT_SECURITY_GUIDE: Concept = {
  id: "security-guide",
  title: "Lernguide: Netzwerksicherheit",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "port-security", "defense-in-depth", "guide"],
  content: `
## Lernziele
- Extended Named ACLs konfigurieren und an den richtigen Interfaces in der richtigen Richtung anwenden
- Das Defense-in-Depth-Konzept mit mindestens 4 Sicherheitsebenen beschreiben
- Port Security auf einem Switch-Access-Port aktivieren und Violation-Modi unterscheiden
- AAA mit TACACS+ vs. RADIUS vergleichen
- DHCP Snooping und Dynamic ARP Inspection (DAI) konfigurieren

## Praxis-Szenario
Die "MedData GmbH" (Medizinische Softwarelösungen, 150 Mitarbeiter) betreibt eine DMZ mit einem öffentlich erreichbaren Webserver (172.16.10.10/24) und ein internes Netz (192.168.50.0/24). Der Cisco ISR 4351 verbindet beide Zonen. Im Rahmen eines "Defense-in-Depth"-Konzepts soll eine Extended ACL namens "DMZ-POLICY" eingerichtet werden: HTTP (Port 80) und HTTPS (Port 443) aus dem Internet zur DMZ erlauben; alle anderen Verbindungen aus der DMZ in das interne Netz blockieren; ICMP aus dem internen Netz zur DMZ erlauben.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit drei Zonen: Internet (simulierter ISP-Router), DMZ (Webserver 172.16.10.10), internes Netz (Switch + 3 PCs, 192.168.50.0/24). Der Cisco ISR 4351 verbindet alle drei Zonen über separate Interfaces. Beschrifte das DMZ-Interface mit der ACL-Richtung (inbound oder outbound) und zeige den ACL-Regeltext als Notiz.
**Ziel:** Die korrekte Platzierung einer Extended ACL zwischen DMZ und internem Netz demonstrieren.
**Tipps:** Extended ACLs gehören nah an die Quelle. Prüfe die Richtung: "in" bedeutet der Traffic kommt vom angeschlossenen Netz Richtung Router; "out" bedeutet der Traffic verlässt den Router in das angeschlossene Netz.

## Verständnisfragen
1. Warum wird eine Standard-ACL immer nah am Ziel platziert, eine Extended ACL dagegen nah an der Quelle?
2. Was bedeutet das implizite "deny all" am Ende jeder ACL — und wie kann man es sichtbar machen?
3. Was ist der Unterschied zwischen TACACS+ und RADIUS in Bezug auf Transport-Protokoll und Verschlüsselung?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **ACL-Richtung (in vs. out) falsch gesetzt:** \`ip access-group ACL-NAME in\` filtert Traffic, der am Interface eingeht (vom angeschlossenen Netz Richtung Router). \`out\` filtert Traffic, der das Interface verlässt. Eine falsche Richtung kann das komplette Netz sperren.
- ⚠️ **Standard-ACL nah an der Quelle platziert:** Standard-ACLs filtern nur anhand der Quell-IP. Nah an der Quelle platziert blockieren sie unter Umständen den Zugriff auf alle anderen Netze, nicht nur auf das gewünschte Ziel.
- ⚠️ **Implizites deny-all nicht bedacht:** Jede ACL endet mit einem unsichtbaren \`deny any any\`. Wer vergisst, am Ende ein \`permit ip any any\` hinzuzufügen (bei Extended ACLs), sperrt den gesamten restlichen Traffic.
  `.trim(),
};

export const CONCEPT_802_1X: Concept = {
  id: "802.1x-authentication",
  title: "802.1X Port-Based Network Access Control",
  appliesTo: ["ccna"],
  tags: ["security", "802.1x", "dot1x", "authentication", "radius", "eap", "nac"],
  content: `
## 802.1X – Portbasierte Netzwerkzugangskontrolle

### Was ist 802.1X?
IEEE 802.1X ist ein Standard für **portbasierte Netzwerkzugangskontrolle (NAC)**. Ein Switch-Port oder WLAN-Interface bleibt gesperrt, bis sich das Endgerät erfolgreich authentifiziert hat. Erst dann wird der Port geöffnet und Netzwerkzugang gewährt.

### Die drei Rollen (EAP-Dreieck)

| Rolle | Gerät | Aufgabe |
|-------|-------|---------|
| **Supplicant** | Endgerät (PC, Smartphone) | Hat 802.1X-Client-Software, initiiert Authentifizierung |
| **Authenticator** | Switch oder WLAN-AP | Leitet EAP-Pakete zwischen Supplicant und Auth-Server weiter; öffnet/sperrt Port |
| **Authentication Server** | RADIUS-Server (z.B. Cisco ISE) | Prüft Identität und sendet Access-Accept oder Access-Reject |

### Authentifizierungs-Ablauf
\`\`\`
Supplicant       Authenticator (Switch)    Authentication Server (RADIUS)
     |                    |                          |
     |--- EAPOL-Start --→|                          |
     |←-- EAP-Request ---| (Identity)               |
     |--- EAP-Response →→|→→ RADIUS Access-Request →|
     |                   |←← RADIUS Access-Accept ←-|
     |←-- EAP-Success ---|                          |
     |  (Port öffnet)    |                          |
\`\`\`

### Wichtige Begriffe
| Begriff | Erklärung |
|---------|----------|
| **EAP** | Extensible Authentication Protocol — Framework für verschiedene Auth-Methoden |
| **EAPOL** | EAP over LAN — Layer-2-Protokoll zwischen Supplicant und Authenticator |
| **RADIUS** | Authentifizierungsprotokoll zwischen Authenticator und Auth-Server (UDP 1812/1813) |
| **MAB** | MAC Authentication Bypass — für Geräte ohne 802.1X-Client (z.B. Drucker) |
| **Guest VLAN** | VLAN für Geräte, die 802.1X nicht unterstützen |
| **Auth-Fail VLAN** | VLAN für Geräte, die die Authentifizierung nicht bestehen |

### EAP-Methoden (Prüfungsrelevant)
| Methode | Authentifizierung | Sicherheit |
|---------|------------------|-----------|
| **EAP-TLS** | Zertifikate (Client + Server) | Sehr hoch — beidseitige Zertifikate |
| **PEAP** | Server-Zertifikat + Username/Passwort | Hoch — in WPA2-Enterprise üblich |
| **EAP-FAST** | Protected Access Credential (PAC) | Hoch — Cisco-proprietär |

### Cisco IOS Konfiguration (802.1X auf Switch-Port)
\`\`\`
SW1(config)# aaa new-model
SW1(config)# aaa authentication dot1x default group radius
SW1(config)# dot1x system-auth-control
SW1(config)# radius server ISE
SW1(config-radius-server)# address ipv4 192.168.100.10 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key SecretKey123

SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport mode access
SW1(config-if)# dot1x port-control auto     ! auto = 802.1X aktiviert
SW1(config-if)# authentication host-mode single-host

! Verifikation
SW1# show dot1x all
SW1# show authentication sessions
\`\`\`

### Port-Control-Modi
| Modus | Verhalten |
|-------|----------|
| **force-authorized** | Port immer offen (802.1X deaktiviert) — Standard |
| **force-unauthorized** | Port immer gesperrt |
| **auto** | 802.1X aktiv — Port öffnet nur nach erfolgreicher Auth |

### Zusammenfassung: Wo wird 802.1X eingesetzt?
- **Kabelgebunden**: Switchports in Unternehmensnetzwerken (Büros, Konferenzräume)
- **WLAN**: WPA2-Enterprise / WPA3-Enterprise nutzt 802.1X + EAP
- Alternativ zur MAC-basierten Port-Security (sicherer, weil nicht fälschbar)
  `.trim(),
};

export const CONCEPT_SECURITY_PROGRAM: Concept = {
  id: "security-program",
  title: "Security-Programme und Sicherheitsrichtlinien",
  appliesTo: ["ccna"],
  tags: ["security", "policy", "cvss", "incident-response", "vulnerability", "risk"],
  content: `
## Security-Programme und Sicherheitsrichtlinien

### Grundbegriffe: Vulnerability – Threat – Risk
| Begriff | Definition | Beispiel |
|---------|-----------|----------|
| **Vulnerability** | Schwachstelle in einem System oder Prozess | Ungepatchtes Betriebssystem |
| **Threat** | Potenzielle Bedrohung, die eine Vulnerability ausnutzen kann | Malware-Angriff |
| **Exploit** | Werkzeug oder Technik zum Ausnutzen einer Vulnerability | Metasploit-Modul |
| **Risk** | Wahrscheinlichkeit × Schadensausmaß einer Bedrohung | Hohe Wahrscheinlichkeit + hoher Schaden = kritisch |

### CVSS – Common Vulnerability Scoring System
- Industriestandard zur Bewertung von Sicherheitslücken (**0.0 – 10.0**)
- **Basis-Metriken**: Attack Vector, Attack Complexity, Privileges Required, User Interaction, CIA-Impact

| CVSS-Score | Klassifikation |
|-----------|---------------|
| 0.0 | None |
| 0.1 – 3.9 | Low |
| 4.0 – 6.9 | Medium |
| 7.0 – 8.9 | High |
| 9.0 – 10.0 | Critical |

### Sicherheitsrichtlinien (Security Policies)
| Richtlinie | Inhalt |
|-----------|-------|
| **AUP** (Acceptable Use Policy) | Erlaubte und verbotene Nutzung von IT-Ressourcen |
| **Password Policy** | Mindestlänge, Komplexität, Ablaufintervall, Wiederverwendung |
| **Data Classification Policy** | Vertraulich / Intern / Öffentlich |
| **Incident Response Policy** | Verfahren bei Sicherheitsvorfällen |
| **BYOD Policy** | Regeln für private Geräte im Unternehmensnetz |

### Passwort-Richtlinien (Best Practices)
- Mindestlänge: **12 Zeichen** (empfohlen)
- Komplexität: Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen
- Kein Wiederverwenden von Passwörtern (Password-History)
- **MFA** (Multi-Faktor-Authentifizierung) als zusätzliche Schicht
- Cisco IOS: \`security passwords min-length 12\`

### Security Awareness Training
- Ziel: Mitarbeiter als **„Human Firewall"** schulen
- Themen: Phishing-Erkennung, Social Engineering, sichere Passwortverwaltung, Datenschutz
- Regelmäßige Wiederholung (mind. jährlich) + Phishing-Simulationen

### Incident Response – 6 Phasen (NIST SP 800-61)
| Phase | Name | Beschreibung |
|-------|------|-------------|
| 1 | **Preparation** | IR-Plan erstellen, Tools bereitstellen, Team schulen |
| 2 | **Identification** | Vorfall erkennen, klassifizieren, Schwere beurteilen |
| 3 | **Containment** | Ausbreitung stoppen (kurzfristig: Isolation; langfristig: Clean-up) |
| 4 | **Eradication** | Ursache beseitigen (Malware entfernen, Patches einspielen) |
| 5 | **Recovery** | Systeme wiederherstellen, Normalbetrieb verifizieren |
| 6 | **Lessons Learned** | Post-Incident-Review, Dokumentation, Prozessverbesserung |

> **Merkhilfe**: **P-I-C-E-R-L**

### Schwachstellen-Management
- **Vulnerability Scanning**: Automatisierte Suche nach Schwachstellen (z.B. Nessus, OpenVAS)
- **Penetration Testing**: Autorisierter simulierter Angriff
- **Patch Management**: Regelmäßiges Einspielen von Security-Patches
- **CVE** (Common Vulnerabilities and Exposures): Standardisierte Kennung für Schwachstellen
  `.trim(),
};

export const TOPIC_SECURITY: Topic = {
  id: "security",
  title: "Netzwerksicherheit",
  description:
    "CIA-Triad, Angriffstypen, ACLs, Port-Security, DHCP Snooping, DAI, 802.1X und Security-Programme — Netzwerke absichern.",
  conceptIds: [
    "security-fundamentals",
    "acl-standard",
    "acl-extended",
    "acl-named",
    "acl-troubleshooting",
    "port-security",
    "802.1x-authentication",
    "security-program",
    "security-guide",
  ],
  quizIds: [
    "ccna-quiz-security",
    "ccna-quiz-harden-access",
    "ccna-quiz-dhcp-snooping-dai",
    "ccna-quiz-acl",
  ],
  exerciseIds: ["exercise-acl-dmz"],
  prerequisiteTopicIds: ["routing-ospf", "switching-vlans"],
  estimatedMinutes: 150,
  tags: ["security", "acl", "port-security"],
};

export const SECURITY_CONCEPTS: Record<string, Concept> = {
  "security-fundamentals": CONCEPT_SECURITY_FUNDAMENTALS,
  "acl-standard": CONCEPT_ACL_STANDARD,
  "acl-extended": CONCEPT_ACL_EXTENDED,
  "acl-named": CONCEPT_ACL_NAMED,
  "acl-troubleshooting": CONCEPT_ACL_TROUBLESHOOTING,
  "port-security": CONCEPT_PORT_SECURITY,
  "802.1x-authentication": CONCEPT_802_1X,
  "security-program": CONCEPT_SECURITY_PROGRAM,
  "security-guide": CONCEPT_SECURITY_GUIDE,
};
