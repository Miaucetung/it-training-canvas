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
  `.trim(),
};

export const CONCEPT_ACLS: Concept = {
  id: "acls",
  title: "ACLs — Access Control Lists",
  appliesTo: ["ccna", "az-104"],
  tags: ["security", "networking", "acl", "filtering", "layer-3", "layer-4"],
  relatedConceptIds: ["azure-nsg"],
  content: `
## Access Control Lists (ACLs)

### Zweck
- Paketfilterung auf Router-Interfaces (inbound/outbound)
- Identifikation von Traffic für QoS, NAT, VPN

### Typen
| Typ | Nummerierung | Filterkriterium |
|-----|-------------|----------------|
| Standard ACL | 1-99, 1300-1999 | Nur Quell-IP |
| Extended ACL | 100-199, 2000-2699 | Quell/Ziel-IP, Protokoll, Port |
| Named ACL | Name | Wie Standard/Extended, leichter zu editieren |

### Verarbeitungsreihenfolge
- ACEs werden **von oben nach unten** abgearbeitet
- Erste Match gewinnt
- Implizites **"deny all"** am Ende (nicht sichtbar!)

### Platzierung
- **Standard ACL**: Nah am Ziel (nur Quell-IP)
- **Extended ACL**: Nah an der Quelle (spezifisch genug)
- **Inbound**: Vor dem Routing-Prozess
- **Outbound**: Nach dem Routing-Prozess

### Cisco Konfiguration (Extended Named ACL)
\`\`\`
R1(config)# ip access-list extended BLOCK-TELNET
R1(config-ext-nacl)# remark Block Telnet from 192.168.1.0/24
R1(config-ext-nacl)# deny tcp 192.168.1.0 0.0.0.255 any eq 23
R1(config-ext-nacl)# permit ip any any

R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip access-group BLOCK-TELNET in

R1# show ip access-lists
R1# show running-config | section access-list
\`\`\`

### Wildcard-Masken (ACL)
Gegenteil der Subnetzmaske: 0 = prüfen, 1 = ignorieren
- 255.255.255.0 → Wildcard: 0.0.0.255
- /27 (255.255.255.224) → Wildcard: 0.0.0.31
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

export const TOPIC_SECURITY: Topic = {
  id: "security",
  title: "Netzwerksicherheit",
  description:
    "CIA-Triad, Angriffstypen, ACLs, Port-Security, DHCP Snooping, DAI und 802.1X — Netzwerke absichern.",
  conceptIds: ["security-fundamentals", "acls", "port-security", "security-guide"],
  quizIds: [
    "ccna-quiz-security",
    "ccna-quiz-harden-access",
    "ccna-quiz-dhcp-snooping-dai",
    "ccna-quiz-acl",
  ],
  exerciseIds: [],
  prerequisiteTopicIds: ["routing-ospf", "switching-vlans"],
  estimatedMinutes: 150,
  tags: ["security", "acl", "port-security"],
};

export const SECURITY_CONCEPTS: Record<string, Concept> = {
  "security-fundamentals": CONCEPT_SECURITY_FUNDAMENTALS,
  acls: CONCEPT_ACLS,
  "port-security": CONCEPT_PORT_SECURITY,
  "security-guide": CONCEPT_SECURITY_GUIDE,
};
