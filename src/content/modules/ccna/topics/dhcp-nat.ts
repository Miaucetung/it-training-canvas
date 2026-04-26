// ============================================================
// CCNA Topic: DHCP & NAT
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_DHCP: Concept = {
  id: "dhcp",
  title: "DHCP — Dynamic Host Configuration Protocol",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "dhcp", "ip", "automation", "layer-7"],
  content: `
## DHCP (RFC 2131)

DHCP vergibt automatisch IP-Adressen, Subnetzmaske, Default-Gateway und DNS.

### DORA-Prozess
\`\`\`
Client → Broadcast: DISCOVER  (Wer ist DHCP-Server?)
Server → Broadcast: OFFER     (Ich bin hier, deine IP: 192.168.1.100)
Client → Broadcast: REQUEST   (Ich nehme 192.168.1.100)
Server → Unicast:   ACK       (Bestätigt, Lease 86400 s)
\`\`\`

### DHCP auf Cisco Router
\`\`\`
R1(config)# ip dhcp pool OFFICE
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1
R1(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
R1(dhcp-config)# lease 1 0 0           ! 1 Tag

R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10

R1# show ip dhcp binding
R1# show ip dhcp pool
\`\`\`

### DHCP Relay (IP Helper)
Falls DHCP-Server in einem anderen Subnetz:
\`\`\`
R1(config-if)# ip helper-address 10.0.0.1  ! IP des DHCP-Servers
\`\`\`
Router wandelt Broadcast in Unicast um und leitet weiter.

### DHCP Snooping (Layer-2-Sicherheit)
- Blockiert DHCP-Antworten von nicht-autorisierten Ports
- Trusted: Uplink-Ports (zum echten Server)
- Untrusted: Access-Ports (Endgeräte)
\`\`\`
SW(config)# ip dhcp snooping
SW(config)# ip dhcp snooping vlan 10,20
SW(config-if)# ip dhcp snooping trust         ! Uplink-Port
\`\`\`
  `.trim(),
};

export const CONCEPT_NAT: Concept = {
  id: "nat",
  title: "NAT & PAT — Network/Port Address Translation",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "nat", "pat", "layer-3", "ipv4", "internet-access"],
  content: `
## NAT / PAT (RFC 3022)

NAT übersetzt private IP-Adressen in öffentliche (und zurück).

### NAT-Typen
| Typ | Beschreibung | Anwendung |
|-----|-------------|-----------|
| Static NAT | 1:1 Übersetzung (privat ↔ öffentlich) | Server hinter NAT |
| Dynamic NAT | Pool öffentlicher IPs | Mehrere User, Pool |
| PAT (NAT Overload) | Viele private IPs → eine öffentliche (per Port) | Home/Office Router |

### NAT-Terminologie
| Term | Beschreibung |
|------|-------------|
| Inside Local | Private IP des Hosts (z.B. 192.168.1.10) |
| Inside Global | Öffentliche IP nach Übersetzung (z.B. 203.0.113.5) |
| Outside Local | IP des externen Ziels, wie intern gesehen |
| Outside Global | Echte IP des externen Ziels |

### PAT Konfiguration (Cisco)
\`\`\`
! ACL: Welche Adressen übersetzt werden
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255

! NAT: ACL + Ausgangsinterface, overload = PAT
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload

! Interfaces markieren
R1(config-if)# ip nat inside   ! LAN-Seite
R1(config-if)# ip nat outside  ! WAN-Seite (Internet)

R1# show ip nat translations
R1# show ip nat statistics
\`\`\`

### Probleme mit NAT
- End-to-End Connectivity ist unterbrochen
- Stateful → Ausfall des Routers verliert Verbindungen
- Erschwert IPsec, VoIP (Protokolle mit IP im Payload)
- IPv6 macht NAT überflüssig
  `.trim(),
};

export const CONCEPT_DHCP_NAT_GUIDE: Concept = {
  id: "dhcp-nat-guide",
  title: "Lernguide: DHCP & NAT",
  appliesTo: ["ccna"],
  tags: ["dhcp", "nat", "pat", "ip-management", "guide"],
  content: `
## Lernziele
- Einen DHCP-Pool auf einem Cisco-Router konfigurieren (inkl. exclusions, DNS, Gateway)
- Den DORA-Prozess (Discover, Offer, Request, ACK) in der richtigen Reihenfolge beschreiben
- PAT (NAT Overload) für ein internes Subnetz konfigurieren
- \`ip nat inside\` und \`ip nat outside\` an den richtigen Interfaces setzen
- DHCP Relay (ip helper-address) erklären und konfigurieren

## Praxis-Szenario
Die "Bäckerei Hofmann KG" eröffnet eine Filiale in Nürnberg (50 Mitarbeiter, darunter Kassenterminals und Büro-PCs). Der Cisco ISR 1100 übernimmt gleichzeitig DHCP-Server und NAT-Router. Das interne Netz ist 10.10.30.0/24, der Router hat die LAN-IP 10.10.30.1/24. Die erste Adresse ist für den Router reserviert, 10.10.30.2–10.10.30.10 für Server und Drucker. Der ISP hat dem Router die öffentliche IP 85.214.99.5 auf dem WAN-Interface (Gi0/0/1) zugewiesen. Mit PAT (NAT Overload) sollen alle 50 internen Hosts über diese eine IP ins Internet gelangen.

## Canvas-Übung
**Aufgabe:** Baue eine Topologie mit dem Cisco ISR 1100 (LAN: Gi0/0/0, WAN: Gi0/0/1), einem LAN-Switch, drei PCs (als DHCP-Clients) und einem simulierten ISP-Router. Beschrifte den Router mit DHCP-Pool-Konfiguration und NAT-Overload-Konfiguration als Notizen. Markiere LAN-Interface als "ip nat inside" und WAN-Interface als "ip nat outside".
**Ziel:** Den vollständigen Weg eines Pakets von einem internen DHCP-Client über NAT ins Internet visualisieren.
**Tipps:** Erstelle zuerst die ACL (access-list 1 permit 10.10.30.0 0.0.0.255), dann den NAT-Befehl. Die Reihenfolge der Konfigurationsschritte ist im CCNA-Exam Thema.

## Verständnisfragen
1. In welcher Reihenfolge laufen die vier DORA-Schritte ab — und welche sind Broadcasts, welche Unicasts?
2. Warum muss \`ip nat inside\` auf dem LAN-Interface und \`ip nat outside\` auf dem WAN-Interface konfiguriert werden — was passiert, wenn man es vertauscht?
3. Was ist der Unterschied zwischen Static NAT, Dynamic NAT und PAT (NAT Overload) in Bezug auf die Anzahl benötigter öffentlicher IP-Adressen?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **\`ip nat inside\`/\`ip nat outside\` fehlt oder vertauscht:** Ohne diese Interface-Befehle funktioniert NAT überhaupt nicht. Cisco IOS übersetzt nur Traffic, der ein "inside"-Interface betritt und ein "outside"-Interface verlässt (oder umgekehrt).
- ⚠️ **DORA-Reihenfolge in Prüfungsfragen:** Häufig wird gefragt, welcher DORA-Schritt ein Broadcast ist. DISCOVER und REQUEST sind Broadcasts (Client kennt den Server noch nicht / meldet Auswahl an alle), OFFER und ACK können Broadcasts oder Unicasts sein.
- ⚠️ **Excluded-Address-Befehl vergessen:** Wenn der Router 10.10.30.1 hat und kein \`ip dhcp excluded-address\` konfiguriert ist, kann DHCP dieselbe Adresse an einen Client vergeben — Adresskonflikt!
  `.trim(),
};

export const TOPIC_DHCP_NAT: Topic = {
  id: "dhcp-nat",
  title: "DHCP & NAT",
  description:
    "DHCP für automatische IP-Vergabe, DHCP Relay und DHCP Snooping. NAT/PAT für Internetzugang aus privaten Netzen.",
  conceptIds: ["dhcp", "nat", "dhcp-nat-guide"],
  quizIds: ["ccna-quiz-dhcp", "ccna-quiz-nat"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ipv4-addressing"],
  estimatedMinutes: 90,
  tags: ["dhcp", "nat", "pat", "ip-management"],
};

export const DHCP_NAT_CONCEPTS: Record<string, Concept> = {
  dhcp: CONCEPT_DHCP,
  nat: CONCEPT_NAT,
  "dhcp-nat-guide": CONCEPT_DHCP_NAT_GUIDE,
};
