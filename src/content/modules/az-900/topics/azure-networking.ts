// ============================================================
// AZ-900 Topic 4: Azure Networking Services
// Domain 2: Azure Architecture and Services (~35-40%)
// Outline: "Describe Azure compute and networking services"
// Sources: learn.microsoft.com/azure/virtual-network,
//          learn.microsoft.com/azure/vpn-gateway,
//          learn.microsoft.com/azure/expressroute,
//          learn.microsoft.com/azure/dns
// CCNA Cross-Reference: VNet/Subnets ↔ VLAN/Subnetting
//                        NSG ↔ ACL, ExpressRoute ↔ WAN/MPLS
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_AZURE_VNET: Concept = {
  id: "vnet-subnet",
  title: "Azure Virtual Network (VNet), Subnets & Peering",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "networking", "vnet", "subnet", "peering", "nsg"],
  // Cross-reference: CCNA VLAN/Subnetting ↔ Azure VNet/Subnets
  relatedConceptIds: ["vlans", "subnetting"],
  content: `
## Azure Virtual Network (VNet)

Ein Azure Virtual Network (VNet) ist ein isoliertes, privates Netzwerk in Azure —
vergleichbar mit einem VLAN oder einem privaten Layer-3-Netzwerk in der
klassischen Netzwerktechnik.

**CCNA-Analogie**: Ein VNet entspricht einem isolierten privaten Netzwerk
(ähnlich VLAN + Subnetz-Hierarchie), in dem Ressourcen kommunizieren können,
ohne direkt dem Internet ausgesetzt zu sein.

### VNet-Grundlagen

- Jedes VNet ist einer Azure-Region zugeordnet
- VNets sind standardmäßig voneinander isoliert (keine Kommunikation zwischen VNets ohne Konfiguration)
- Ressourcen im selben VNet kommunizieren standardmäßig miteinander
- Adressraum wird als CIDR-Bereich definiert (z.B. 10.0.0.0/16)

### Subnets (Teilnetzwerke)

Ein VNet wird in Subnets unterteilt, um Ressourcen zu segmentieren:

\`\`\`
VNet: 10.0.0.0/16
├── Subnet: Frontend (10.0.1.0/24) — Web-Server
├── Subnet: Backend  (10.0.2.0/24) — App-Server
└── Subnet: Data     (10.0.3.0/24) — Datenbanken
\`\`\`

**Prüfungs-Hinweis**: Azure reserviert in jedem Subnet 5 IP-Adressen für interne
Zwecke (Netzwerkadresse, Gateway, DNS, Broadcast, Azure-intern).
Bei einem /24-Subnet sind also 251 von 256 Adressen nutzbar.

### Network Security Groups (NSG)

NSGs sind Azure-Firewalls für Netzwerkebene (Layer 4):
- Regeln für eingehenden (Inbound) und ausgehenden (Outbound) Traffic
- Anwendbar auf Subnets und/oder einzelne Netzwerkschnittstellen (NICs)
- Prioritätsbasiert (niedrigere Zahl = höhere Priorität), Standard: 100–4096
- **CCNA-Analogie**: NSGs entsprechen funktional Access Control Lists (ACLs)

Beispiel-NSG-Regel:
| Priorität | Name | Port | Protokoll | Richtung | Aktion |
|-----------|------|------|-----------|---------|--------|
| 100 | Allow-HTTPS | 443 | TCP | Inbound | Allow |
| 200 | Allow-HTTP | 80 | TCP | Inbound | Allow |
| 4096 | Deny-All | * | * | Inbound | Deny |

### VNet Peering

VNet Peering verbindet zwei VNets miteinander:
- **Regional Peering**: Zwei VNets in derselben Region
- **Global Peering**: Zwei VNets in verschiedenen Regionen
- Traffic läuft über das Azure-Backbone-Netzwerk (nicht über Internet)
- Peering ist nicht transitiv: VNet A peered mit B, B peered mit C → A kann C NICHT direkt erreichen

### Azure DNS

Azure DNS hostet DNS-Zonen in Azure:
- **Öffentliche DNS-Zonen**: Internet-auflösbare Domain-Namen
- **Private DNS-Zonen**: Name-Auflösung innerhalb von VNets
- Azure stellt globale DNS-Infrastruktur bereit (anycast)
- Domain-Registrierung erfolgt über externe Registrare, nicht Azure DNS
  `.trim(),
};

export const CONCEPT_AZURE_CONNECTIVITY: Concept = {
  id: "azure-connectivity",
  title: "Azure VPN Gateway, ExpressRoute & Hybrid-Konnektivität",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "networking", "vpn", "expressroute", "hybrid", "gateway", "wan"],
  // Cross-reference: CCNA WAN/MPLS/VPN ↔ Azure ExpressRoute/VPN Gateway
  relatedConceptIds: ["azure-nat-gateway", "azure-route-server"],
  content: `
## Hybrid-Konnektivität: On-Premises mit Azure verbinden

Unternehmen müssen ihre bestehenden On-Premises-Netzwerke oft mit Azure verbinden.
Azure bietet zwei primäre Mechanismen:

### Azure VPN Gateway

VPN Gateway erstellt verschlüsselte Verbindungen über das öffentliche Internet:

**Connection-Typen**:
| Typ | Beschreibung | Einsatz |
|-----|-------------|---------|
| Site-to-Site (S2S) | On-Premises-Netzwerk → Azure VNet via IPsec | Dauerhafter Unternehmens-Anschluss |
| Point-to-Site (P2S) | Einzelne Geräte (Laptop) → Azure VNet | Remote-Work, Entwickler |
| VNet-to-VNet | Azure VNet → Azure VNet via VPN | Cross-Region VNet-Verbindungen |

**CCNA-Analogie**: Site-to-Site VPN entspricht einem IPsec-VPN-Tunnel zwischen
zwei Router-Standorten — gleiche Konzepte (IKE Phase 1/2, ESP), nur in Azure
als verwalteter Gateway-Dienst.

**Eigenschaften**:
- Verschlüsselt, über Internet (nicht dediziert)
- Maximale Bandbreite abhängig von Gateway-SKU (bis ~10 Gbps bei VpnGw5)
- Latenz variabel (Internet-abhängig)
- Geeignet für: kleinere Datenmengen, Remote-Access, Backup-Konnektivität

### Azure ExpressRoute

ExpressRoute ist eine private, dedizierte Verbindung zu Azure — NICHT über
das öffentliche Internet:

- Verbindung über einen **ExpressRoute Circuit** bei einem Connectivity Provider
  (Telekommunikationsanbieter wie Deutsche Telekom, BT, Equinix, etc.)
- Verbindung vom On-Premises-Netzwerk → Provider Edge → Microsoft Edge → Azure
- **CCNA-Analogie**: Entspricht einer MPLS/WAN-Verbindung oder einer Dedicated
  Leased Line — definierte Bandbreite, definierte SLA, kein Internet-Transit

**Vorteile gegenüber VPN Gateway**:
| Merkmal | VPN Gateway | ExpressRoute |
|---------|------------|-------------|
| Verbindungstyp | Über Internet (verschlüsselt) | Dedizierte private Leitung |
| Bandbreite | Bis ~10 Gbps | Bis 100 Gbps |
| Latenz | Variabel | Konsistent, vorhersagbar |
| SLA | 99,9% | 99,95% |
| Kosten | Günstiger | Teurer (Provider-Kosten) |
| Einsatz | Kleinere Workloads, Backup | Kritische, latenz-sensitive Workloads |

**ExpressRoute Global Reach**: Verbindet zwei On-Premises-Standorte über das
Microsoft-Netzwerk (ohne eigenes WAN).

### Wann VPN Gateway, wann ExpressRoute?

- **Schnelle Einrichtung, kleinere Bandbreiten, Kosten sparen** → VPN Gateway
- **Kritische Produktions-Workloads, hohe Bandbreiten, definierte Latenz** → ExpressRoute
- **Kombination**: ExpressRoute als primär, VPN Gateway als Failback

### Azure Virtual WAN

Azure Virtual WAN ist ein verwalteter Netzwerk-Hub-Dienst für Hub-and-Spoke-Topologien:
- Vereinfacht die Konnektivität zwischen vielen VNets, Filialen und Azure-Diensten
- Enthält VPN Gateway, ExpressRoute und SD-WAN-Funktionalität
- Einsatz: Enterprise-Netzwerke mit vielen Standorten
  `.trim(),
};

export const CONCEPT_AZURE_NETWORK_SERVICES: Concept = {
  id: "azure-network-services",
  title: "Azure Load Balancer, Application Gateway, Firewall & CDN",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "networking", "load-balancer", "application-gateway", "firewall", "cdn", "waf"],
  content: `
## Weitere Azure-Netzwerkdienste

### Azure Load Balancer

Azure Load Balancer verteilt eingehenden Netzwerktraffic auf mehrere VMs:

- **Layer 4** (TCP/UDP) — kein Verständnis von HTTP/HTTPS-Inhalten
- **Standard Load Balancer**: Zone-redundant, empfohlen für Produktion (99,99% SLA)
- **Basic Load Balancer**: Kostenlos, begrenzte Features, kein Zone-Support

Einsatz: Web-Frontend-Server, Load-Verteilung über VM Scale Sets

### Azure Application Gateway

Application Gateway ist ein Layer-7-Load-Balancer mit Web-Application-Firewall:

- Versteht HTTP/HTTPS — kann nach URL-Pfad, Hostname, Cookie routen
- **WAF (Web Application Firewall)**: Schutzt vor OWASP-Top-10-Angriffen
  (SQL Injection, XSS, etc.)
- SSL/TLS-Terminierung (SSL-Offloading)
- Einsatz: Web-Applikationen mit Sicherheitsanforderungen, komplexes Routing

**Load Balancer vs. Application Gateway**:
| Merkmal | Azure Load Balancer | Application Gateway |
|---------|-------------------|-------------------|
| OSI-Schicht | Layer 4 (TCP/UDP) | Layer 7 (HTTP/HTTPS) |
| Routing | IP + Port | URL-Pfad, Header, Cookie |
| WAF | Nein | Ja (WAF-SKU) |
| HTTPS-Termination | Nein | Ja |

### Azure Firewall

Azure Firewall ist ein verwalteter, cloud-nativer Netzwerk-Firewall-Dienst:
- Layer 3–7 Filtering (IP, Port, FQDN, Application-ID)
- Zentrale Firewall-Policy für alle VNets (Azure Firewall Policy)
- Threat Intelligence: Blockiert bekannte bösartige IPs/Domains automatisch
- Hochverfügbar und skalierbar ohne Konfigurationsaufwand

**Wann Azure Firewall, wann NSG?**
- NSG: Layer-4-Filterung auf Subnet/NIC-Ebene (einfach, kostenlos)
- Azure Firewall: Zentrale, feature-reiche Firewall für Enterprise-Umgebungen

### Azure Content Delivery Network (CDN) / Azure Front Door

**Azure CDN**: Verteilt statische Inhalte (Bilder, Videos, JS, CSS) auf
Point-of-Presence (PoP)-Standorte weltweit — Endnutzer erhalten Inhalte vom
nächsten PoP, nicht vom Origin-Server.

**Azure Front Door**: Globaler Layer-7-Load-Balancer + CDN + WAF in einem Dienst
- Routing zu nächstgelegenen gesunden Backend-Region
- Einsatz: Global verteilte Web-Apps mit geo-basiertem Routing

### Private Endpoints

Private Endpoints ermöglichen den Zugriff auf Azure PaaS-Dienste (Storage,
SQL Database, etc.) über private IP-Adressen im VNet — ohne Internet-Transit:
- PaaS-Dienst erhält eine private IP im eigenen VNet
- Traffic bleibt vollständig im Azure-Backbone
- Einsatz: Compliance-Anforderungen, Zero-Internet-Exposure für Daten-Dienste
  `.trim(),
};

export const CONCEPT_AZURE_NETWORKING_GUIDE: Concept = {
  id: "azure-networking-guide",
  title: "Lernguide: Azure Networking",
  appliesTo: ["az-900"],
  tags: ["azure", "networking", "guide", "vnet", "vpn", "expressroute"],
  content: `
## Lernziele

- VNet und Subnets als Azure-Netzwerksegmentierung erklären
- NSGs als Azure-ACL-Äquivalent beschreiben
- VPN Gateway von ExpressRoute unterscheiden (Internet vs. dediziert)
- Point-to-Site von Site-to-Site VPN abgrenzen
- Azure Load Balancer (L4) von Application Gateway (L7) unterscheiden
- Private Endpoints als Zero-Internet-PaaS-Zugriff erklären
- Szenarien für Azure DNS und VNet Peering beschreiben

## Praxis-Szenario

Die "Alpentechnik AG" (Hauptsitz München, Zweigstelle Wien) migriert nach Azure:

- **Netzwerksegmentierung**: VNet 10.0.0.0/16 mit drei Subnets
  (Frontend 10.0.1.0/24, Backend 10.0.2.0/24, Data 10.0.3.0/24)
- **Schutz**: NSG auf dem Data-Subnet lässt nur Port 5432 (PostgreSQL) von
  Backend-Subnet zu — blockiert direkte Verbindungen aus dem Frontend
- **Zweigstelle Wien**: Site-to-Site VPN Gateway → schnelle Einrichtung,
  verschlüsselt, für Verwaltungszugriff ausreichend
- **SAP-System (kritisch)**: ExpressRoute über Telekommunikationsanbieter →
  dedizierte Bandbreite, vorhersagbare Latenz für SAP HANA
- **Web-Frontend** (kundenorientiert): Application Gateway mit WAF → HTTP/HTTPS,
  URL-basiertes Routing, Schutz vor SQL Injection

**Canvas-Übung**: Zeichne die Netzwerktopologie der Alpentechnik AG mit VNet,
Subnets, NSGs, VPN Gateway und ExpressRoute als Azure-Netzwerkdiagramm.

## Typische Prüfungsfallen

- ⚠️ **"VPN Gateway = ExpressRoute"** — FALSCH. VPN Gateway läuft über das
  öffentliche Internet (verschlüsselt). ExpressRoute ist eine private,
  dedizierte Leitung über einen Connectivity Provider.

- ⚠️ **"NSG schützt auf Layer 7"** — FALSCH. NSGs sind Layer-4-Filter (IP, Port,
  Protokoll). Für Layer-7-Schutz (WAF, URL-Filtering) braucht man Application
  Gateway oder Azure Firewall.

- ⚠️ **"VNet Peering ist transitiv"** — FALSCH. Wenn VNet A mit VNet B peered
  und VNet B mit VNet C, kann A NICHT automatisch C erreichen. Transitive
  Konnektivität erfordert Azure Virtual WAN oder Hub-Spoke mit Azure Firewall.

- ⚠️ **"Azure DNS registriert Domains"** — FALSCH. Azure DNS hostet DNS-Zonen,
  registriert aber keine Domain-Namen. Dafür sind externe Domain-Registrare
  nötig (z.B. GoDaddy, IONOS, etc.).
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_NETWORKING_QUESTIONS: Question[] = [
  {
    id: "az900-net-q1",
    type: "single-choice",
    points: 10,
    text: "Die IT-Abteilung der 'Seewind GmbH' möchte verhindern, dass Ressourcen im Frontend-Subnet direkt auf die PostgreSQL-Datenbank im Data-Subnet zugreifen können (nur das Backend-Subnet soll Port 5432 nutzen dürfen). Welcher Azure-Dienst wird dafür konfiguriert?",
    explanation: "Network Security Groups (NSGs) sind Azure-Firewalls auf Layer 4 (IP, Port, Protokoll) — das Azure-Äquivalent zu Access Control Lists (ACLs) aus der CCNA-Welt. Eine NSG-Regel auf dem Data-Subnet erlaubt Port 5432 nur aus dem Backend-Subnet-Adressbereich.",
    answers: [
      { id: "a", text: "Azure Application Gateway mit WAF-Regelset", isCorrect: false },
      { id: "b", text: "Network Security Group (NSG) am Data-Subnet", isCorrect: true },
      { id: "c", text: "Azure Firewall mit FQDN-Filterung", isCorrect: false },
      { id: "d", text: "VNet Peering mit Routing-Einschränkungen", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q2",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen muss seinen Hauptsitz dauerhaft mit Azure verbinden. Die Verbindung muss für SAP-HANA-Replikation genutzt werden — niedrige, konsistente Latenz und hohe Bandbreite sind kritisch. Internetausfälle dürfen die Verbindung nicht beeinflussen. Welche Option ist richtig?",
    explanation: "ExpressRoute ist die Lösung: private, dedizierte Verbindung über einen Connectivity Provider, nicht über das Internet. Das garantiert konsistente Latenz und hohe Bandbreite. VPN Gateway nutzt das öffentliche Internet (variabler Latenz, begrenzte Bandbreite).",
    answers: [
      { id: "a", text: "Azure VPN Gateway mit Site-to-Site-Verbindung", isCorrect: false },
      { id: "b", text: "Azure ExpressRoute mit einem Connectivity Provider", isCorrect: true },
      { id: "c", text: "Azure VPN Gateway mit Point-to-Site-Verbindung", isCorrect: false },
      { id: "d", text: "VNet Peering zwischen On-Premises und Azure VNet", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q3",
    type: "single-choice",
    points: 10,
    text: "Was ist der wesentliche Unterschied zwischen Azure Load Balancer und Azure Application Gateway?",
    explanation: "Azure Load Balancer arbeitet auf Layer 4 (TCP/UDP) — verteilt Traffic anhand von IP und Port. Azure Application Gateway arbeitet auf Layer 7 (HTTP/HTTPS) — kann nach URL-Pfad, Hostname, HTTP-Headern routen und bietet WAF-Funktionalität.",
    answers: [
      { id: "a", text: "Load Balancer unterstützt globale Verteilung; Application Gateway nur regional", isCorrect: false },
      { id: "b", text: "Load Balancer ist Layer 4 (TCP/UDP); Application Gateway ist Layer 7 (HTTP/HTTPS) mit WAF", isCorrect: true },
      { id: "c", text: "Application Gateway ist kostenlos; Load Balancer ist kostenpflichtig", isCorrect: false },
      { id: "d", text: "Beide Dienste sind identisch — Application Gateway ist der neue Name für Load Balancer", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q4",
    type: "single-choice",
    points: 10,
    text: "Drei Azure VNets — VNet-A, VNet-B und VNet-C — sollen verbunden werden. VNet-A ist mit VNet-B gepeered, VNet-B ist mit VNet-C gepeered. Kann VNet-A direkt mit VNet-C kommunizieren?",
    explanation: "NEIN — VNet Peering ist nicht transitiv. Obwohl A-B und B-C gepeered sind, kann A nicht automatisch über B zu C routen. Für transitive Konnektivität zwischen A und C müsste zusätzlich A-C direkt gepeered werden, oder eine Hub-Spoke-Architektur mit Azure Virtual WAN / Azure Firewall eingesetzt werden.",
    answers: [
      { id: "a", text: "Ja — VNet-B routet automatisch Traffic zwischen VNet-A und VNet-C", isCorrect: false },
      { id: "b", text: "Nein — VNet Peering ist nicht transitiv; ein direktes A-C Peering ist nötig", isCorrect: true },
      { id: "c", text: "Ja, wenn alle VNets in derselben Region sind", isCorrect: false },
      { id: "d", text: "Ja — globales Peering ist immer transitiv, regionales nicht", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q5",
    type: "single-choice",
    points: 10,
    text: "Ein Entwickler arbeitet remote und muss sicher auf Ressourcen im Azure VNet zugreifen, ohne eine permanente Unternehmensnetzwerk-Verbindung. Welcher VPN-Gateway-Verbindungstyp ist der richtige?",
    explanation: "Point-to-Site (P2S) VPN verbindet einzelne Endgeräte (z.B. Laptop des Entwicklers) mit einem Azure VNet. Site-to-Site (S2S) verbindet ganze Netzwerke. P2S ist für Remote-Access gedacht.",
    answers: [
      { id: "a", text: "Site-to-Site VPN — verbindet On-Premises-Netzwerk mit Azure", isCorrect: false },
      { id: "b", text: "ExpressRoute — dedizierte Leitung für sicheren Zugriff", isCorrect: false },
      { id: "c", text: "Point-to-Site VPN — verbindet einzelne Geräte mit dem Azure VNet", isCorrect: true },
      { id: "d", text: "VNet-to-VNet VPN — verbindet zwei Azure VNets", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q6",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen möchte eine Azure SQL-Datenbank so konfigurieren, dass sie ausschließlich über eine private IP-Adresse im eigenen VNet erreichbar ist — kein direkter Internetzugriff auf den Datenbankendpunkt. Welche Technologie wird eingesetzt?",
    explanation: "Private Endpoints geben einem PaaS-Dienst (wie Azure SQL Database) eine private IP-Adresse im VNet. Traffic zur Datenbank verlässt niemals das VNet und das Azure-Backbone. Der öffentliche Endpunkt kann deaktiviert werden. Service Endpoints sind eine ähnliche, aber weniger restriktive Option.",
    answers: [
      { id: "a", text: "VNet-Peering mit der SQL-Datenbank-Region", isCorrect: false },
      { id: "b", text: "NSG mit Deny-Regel für öffentliche IP-Adressen", isCorrect: false },
      { id: "c", text: "Private Endpoint für Azure SQL Database", isCorrect: true },
      { id: "d", text: "Azure Firewall mit SQL-Filterregeln", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q7",
    type: "multiple-choice",
    points: 15,
    text: "Welche ZWEI der folgenden Dienste bieten Web Application Firewall (WAF)-Funktionalität in Azure? (Wähle 2)",
    explanation: "Azure Application Gateway (WAF-SKU) und Azure Front Door bieten beide WAF-Funktionalität zum Schutz vor OWASP-Top-10-Angriffen. Azure Load Balancer ist Layer 4 (kein WAF). NSGs sind Layer 4 (kein WAF). Azure DNS ist ein DNS-Dienst.",
    answers: [
      { id: "a", text: "Azure Application Gateway (WAF-SKU)", isCorrect: true },
      { id: "b", text: "Azure Load Balancer (Standard-Tier)", isCorrect: false },
      { id: "c", text: "Azure Front Door", isCorrect: true },
      { id: "d", text: "Network Security Group (NSG)", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q8",
    type: "single-choice",
    points: 10,
    text: "Wofür wird Azure DNS verwendet, und was kann Azure DNS NICHT tun?",
    explanation: "Azure DNS hostet DNS-Zonen und beantwortet DNS-Abfragen für konfigurierte Domains. Azure DNS kann KEINE Domains registrieren — das erfolgt über externe Domain-Registrare. Nach der Registrierung können Nameserver auf Azure DNS umgestellt werden.",
    answers: [
      { id: "a", text: "Azure DNS registriert Domains und hostet DNS-Zonen in einem Schritt", isCorrect: false },
      { id: "b", text: "Azure DNS hostet DNS-Zonen; Domain-Registrierung erfolgt bei externen Registraren", isCorrect: true },
      { id: "c", text: "Azure DNS ersetzt lokale Windows-DNS-Server vollständig in Hybrid-Szenarien", isCorrect: false },
      { id: "d", text: "Azure DNS ist nur für öffentliche Domains — private VNet-DNS ist nicht möglich", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q9",
    type: "single-choice",
    points: 10,
    text: "Ein VNet hat den Adressraum 10.2.0.0/16 und enthält ein Subnet mit der Range 10.2.5.0/24. Wie viele IP-Adressen sind in diesem Subnet für Azure-Ressourcen nutzbar?",
    explanation: "In einem /24-Subnet (256 Adressen) reserviert Azure 5 Adressen: .0 (Netzwerkadresse), .1 (Default Gateway), .2 und .3 (Azure DNS), .255 (Broadcast). Damit verbleiben 256 - 5 = 251 nutzbare IP-Adressen.",
    answers: [
      { id: "a", text: "256 — das ist die Gesamtzahl des /24-Subnets", isCorrect: false },
      { id: "b", text: "254 — minus Netzwerk- und Broadcast-Adresse", isCorrect: false },
      { id: "c", text: "251 — Azure reserviert 5 Adressen pro Subnet", isCorrect: true },
      { id: "d", text: "250 — Azure reserviert 6 Adressen pro Subnet", isCorrect: false },
    ],
  },
  {
    id: "az900-net-q10",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen betreibt eine global verfügbare Webanwendung und möchte statische Assets (Bilder, CSS, JavaScript) möglichst nah an den Endnutzern weltweit ausliefern, um Ladezeiten zu minimieren. Welcher Azure-Dienst ist dafür konzipiert?",
    explanation: "Azure CDN (Content Delivery Network) verteilt statische Inhalte auf Point-of-Presence (PoP)-Standorte weltweit. Endnutzer erhalten Inhalte vom geografisch nächsten PoP statt vom Origin-Server. Das reduziert Latenz erheblich. Azure Load Balancer und Application Gateway optimieren die Lastverteilung auf Backend-Server, nicht die CDN-Verteilung.",
    answers: [
      { id: "a", text: "Azure Application Gateway — Layer-7-Routing für globale Lastverteilung", isCorrect: false },
      { id: "b", text: "Azure Load Balancer — verteilt Traffic auf mehrere Web-Server", isCorrect: false },
      { id: "c", text: "Azure CDN — verteilt statische Inhalte auf PoP-Standorte weltweit", isCorrect: true },
      { id: "d", text: "Azure VPN Gateway — verbindet Endnutzer mit dem Azure-Netzwerk", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_NETWORKING: Quiz = {
  id: "az900-quiz-azure-networking",
  title: "Quiz: Azure Networking",
  description: "VNet, Subnets, NSG, VPN Gateway, ExpressRoute, Load Balancer, Application Gateway, Private Endpoints",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_NETWORKING_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_NETWORKING: Topic = {
  id: "azure-networking",
  title: "Azure Networking Services",
  description:
    "Azure VNet, Subnets, NSG, VNet Peering, Azure DNS, VPN Gateway, ExpressRoute, Load Balancer, Application Gateway, Azure Firewall, Private Endpoints und CDN.",
  conceptIds: [
    "vnet-subnet",
    "azure-connectivity",
    "azure-network-services",
    "azure-networking-guide",
  ],
  quizIds: ["az900-quiz-azure-networking"],
  exerciseIds: ["exercise-az900-network-diagram"],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 85,
  tags: ["azure", "networking", "vnet", "vpn", "expressroute", "load-balancer", "nsg"],
};

export const AZURE_NETWORKING_CONCEPTS: Record<string, Concept> = {
  "vnet-subnet": CONCEPT_AZURE_VNET,
  "azure-connectivity": CONCEPT_AZURE_CONNECTIVITY,
  "azure-network-services": CONCEPT_AZURE_NETWORK_SERVICES,
  "azure-networking-guide": CONCEPT_AZURE_NETWORKING_GUIDE,
};
