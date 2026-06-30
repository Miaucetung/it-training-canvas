// ============================================================
// CCNA Topic: Controller-Based Networking & SDN
// Quelle: CCNA 200-301 Official Cert Guide V2, Ch 21–22
// SDN, Cisco DNA Center, SD-Access, Cloud
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_SDN_OVERVIEW: Concept = {
  id: "sdn-overview",
  title: "SDN — Trennung von Control- und Data-Plane",
  appliesTo: ["ccna"],
  tags: ["sdn", "controller", "openflow", "networking", "automation"],
  content: `
## Klassisch vs. SDN

:::kernidee
SDN trennt das **„Denken"** (Control Plane: welcher Weg?) vom **„Tun"** (Data Plane: Paket weiterleiten) und zieht das Denken auf einen **zentralen Controller**. Klassisch hat jedes Gerät beides und handelt Routen verteilt aus (OSPF/BGP). Bei SDN entscheidet der Controller zentral und programmiert die Geräte über die **Southbound-API** — du konfigurierst die **Absicht** einmal oben, statt 200 Geräte einzeln.
:::

:::merke
**Northbound = nach oben zu den Apps** (REST, „was will ich"), **Southbound = nach unten zu den Geräten** (OpenFlow/NETCONF, „so wird's umgesetzt"). Der Controller sitzt in der Mitte und übersetzt zwischen beiden.
:::

### Klassisches Netzwerk (verteilt)
Jeder Switch/Router hat eigene Control- und Data-Plane. Routing wird durch
Protokolle (OSPF, BGP, STP) zwischen Geräten **verteilt** ausgehandelt.
Konfiguration: pro Gerät, per CLI.

### SDN (zentralisiert)
**Control Plane** wird auf einen **Controller** (Server) ausgelagert. Der Controller
programmiert die Forwarding-Entscheidungen in jeden Switch.

### Drei Planes
| Plane | Was passiert | Wer macht es klassisch? |
|-------|-------------|------------------------|
| **Data Plane** (Forwarding) | Paket aus Port A nach Port B | ASIC im Switch |
| **Control Plane** | Routing-Entscheidung | OSPF/BGP/STP im IOS |
| **Management Plane** | Konfiguration, Monitoring | SSH, SNMP, NetFlow |

### SDN-Architektur (3 Schichten)
\`\`\`
┌──────────────────────────────────┐
│ Application Plane                │  Northbound API (REST)
│ (Apps, Network Automation Tools) │
└────────────┬─────────────────────┘
             ▼
┌──────────────────────────────────┐
│ Control Plane (Controller)       │  z. B. OpenDaylight, ONOS, Cisco DNA-C
└────────────┬─────────────────────┘
             ▼   Southbound API (OpenFlow, NETCONF, gRPC)
┌──────────────────────────────────┐
│ Data Plane (Switches/Router)     │
└──────────────────────────────────┘
\`\`\`

### Southbound APIs
- **OpenFlow** — programmiert Forwarding-Tabellen direkt
- **NETCONF + YANG** — strukturierte Konfiguration (XML)
- **RESTCONF** — wie NETCONF, aber über HTTPS+JSON
- **gRPC / gNMI** — moderne, telemetrie-fähige Variante

### Northbound APIs
- REST-APIs (JSON), die Anwendungen mit dem Controller sprechen lassen
- z. B. Python-Skript ruft Controller auf: "Erstelle VLAN X auf allen Sites"

### Vorteile von SDN
- Zentrale Sicht und Policy → konsistent
- Schnelle Änderungen (Sekunden statt Stunden)
- Automatisierung & Telemetrie als First-Class-Citizen
  `.trim(),
};

export const CONCEPT_DNA_CENTER: Concept = {
  id: "dna-center",
  title: "Cisco DNA Center & SD-Access",
  appliesTo: ["ccna"],
  tags: ["cisco", "dna-center", "sd-access", "sdn", "fabric", "vxlan", "lisp"],
  content: `
## Cisco DNA Center

Cisco DNA Center (DNAC) ist eine Appliance/Software für **Intent-Based Networking**:
Der Operator beschreibt das **gewünschte Verhalten** ("alle IoT-Geräte ins VLAN 99"),
DNAC setzt das technisch um — auf allen Geräten gleichzeitig.

### DNAC-Funktionen
- **Design** — Sites, IP-Pools, AAA, NTP zentral
- **Policy** — Mikrosegmentierung mit Security Group Tags (SGTs)
- **Provision** — Push der Konfiguration in die Fabric
- **Assurance** — Telemetrie, KI-gestützte Health-Scores

### Cisco SD-Access — Fabric im Campus

SD-Access ist die **Anwendung von SDN auf das Campus-LAN**.

#### Underlay
Klassisches IP-Netz zwischen Switches (z. B. ISIS), nur für die Fabric-Konnektivität.

#### Overlay (Fabric)
| Komponente | Zweck |
|-----------|-------|
| **Edge Node** | Access-Switch — endet User-Traffic |
| **Border Node** | Verbindet Fabric mit externen Netzen |
| **Control Plane Node** | Hostet **LISP**-Mapping-Datenbank |

#### Schlüsseltechnologien
- **VXLAN** als Tunnel-Encapsulation (Layer 2 über Layer 3)
- **LISP** (Locator/ID Separation Protocol) — entkoppelt "Wo bist du?" (RLOC)
  von "Wer bist du?" (EID)
- **Cisco TrustSec / SGT** — segmentierungs-Tags statt VLAN/ACL-Spaghetti

### Vorteile gegenüber klassischem Campus
- Roaming ohne IP-Wechsel (gleicher EID, anderer RLOC)
- Mikrosegmentierung an jedem Port (SGT-basiert)
- Konsistente Policy auf allen Sites — DNAC pusht überall gleich

### Beispiel-Use-Case
"Wenn ein Notebook sich an irgendeinem Access-Port anmeldet → ISE prüft den User
→ DNAC weist SGT 'Mitarbeiter' zu → ACL erlaubt Zugriff auf Server-SGT 'ERP'.
Egal an welchem Switch oder welcher Site das Notebook hängt."
  `.trim(),
};

export const CONCEPT_CLOUD_ARCHITECTURE: Concept = {
  id: "cloud-architecture",
  title: "Cloud-Architektur & Service-Modelle",
  appliesTo: ["ccna", "az-900"],
  tags: ["cloud", "iaas", "paas", "saas", "virtualization", "container"],
  relatedConceptIds: ["azure-cloud-models"],
  content: `
## Cloud-Modelle

### Service-Modelle
| Modell | Was managt der Anbieter? | Was bleibt beim Kunden? | Beispiel |
|--------|--------------------------|------------------------|---------|
| **IaaS** | HW, Hypervisor, Netz | OS, Middleware, App, Daten | AWS EC2, Azure VM |
| **PaaS** | + OS, Middleware | App, Daten | Azure App Service, Heroku |
| **SaaS** | + App | nur Daten/Konfig | Microsoft 365, Salesforce |

### Deployment-Modelle
- **Public Cloud** — gemeinsame Hardware, geringere Kosten
- **Private Cloud** — eigene Hardware, volle Kontrolle, höhere Kosten
- **Hybrid Cloud** — Mischung, Workloads je nach Bedarf
- **Community Cloud** — geteilt mit ähnlichen Organisationen (z. B. Behörden)

### Server-Virtualisierung
Hypervisor (Type-1: ESXi, Hyper-V, KVM) teilt physische Hardware in **VMs**.
Ressourcen: vCPU, vRAM, vDisk, vNIC.

### Container (Docker/Kubernetes)
- Leichter als VM — teilen sich den Host-Kernel
- Schneller Start (Sekunden statt Minuten)
- **Microservices**, CI/CD, Auto-Scaling
- Kubernetes orchestriert hunderte/tausende Container über mehrere Hosts

### NFV — Network Functions Virtualization
Klassische Netzwerk-Appliances (Firewall, Load-Balancer, Router) laufen als
Software auf Standard-Servern. Beispiele: Cisco CSR1000v, Cisco ASAv, F5 BIG-IP VE.

### Cloud-Konnektivität
| Variante | Beschreibung |
|---------|-------------|
| Internet-VPN | IPsec über Internet zum Cloud-Edge |
| AWS Direct Connect / Azure ExpressRoute | dedizierte Privatleitung |
| SD-WAN | Application-aware Steuerung in Multi-Cloud-Setups |
  `.trim(),
};

export const CONCEPT_SDN_GUIDE: Concept = {
  id: "sdn-guide",
  title: "Lernguide: SDN, DNA Center & Cloud",
  appliesTo: ["ccna"],
  tags: ["sdn", "dna-center", "sd-access", "cloud", "guide"],
  content: `
## Lernziele
- Control-, Data- und Management-Plane definieren und einem Beispiel zuordnen
- Northbound- vs. Southbound-API erklären (REST vs. OpenFlow/NETCONF)
- Cisco DNA Center als Intent-Based-Networking-Tool einordnen
- Underlay vs. Overlay in einer SD-Access-Fabric unterscheiden (VXLAN, LISP)
- Cloud-Service-Modelle (IaaS, PaaS, SaaS) korrekt abgrenzen

## Praxis-Szenario
Die "Kanzlei Brandstetter & Lutz" (3 Standorte, 90 Anwälte) modernisiert das gesamte Campus-LAN auf Cisco SD-Access. DNA Center 2.x läuft auf einer Appliance im Hauptstandort. Alle Catalyst 9300 werden Edge Nodes, zwei Catalyst 9500 sind Border Nodes. Mitarbeitende werden über Cisco ISE per 802.1X authentifiziert und erhalten je nach Rolle einen SGT (z. B. "Anwalt", "Mandant-Gast"). Die zentrale Policy verbietet Mandant-Gästen den Zugriff auf interne Server, erlaubt aber Internet.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit einem DNA-Center-Server, zwei Border Nodes (Cisco 9500), drei Edge Nodes (Cisco 9300, je einer pro Etage) und einer Cisco ISE. Verbinde die Edge-Nodes über die Border-Nodes mit dem Internet. Zeichne den **Underlay** (klassisches IP-Routing zwischen Switches) als durchgezogene Linien, das **Overlay** (VXLAN-Fabric) als gestrichelte Linien.
**Ziel:** Die Trennung zwischen Underlay und Overlay sichtbar machen.
**Tipps:** SD-Access nutzt **VXLAN** für Datentransport im Overlay und **LISP** für die Mapping-Datenbank "EID ↔ RLOC". DNA Center selbst überträgt keine Userdaten — es konfiguriert nur.

## Verständnisfragen
1. Warum benötigt SD-Access zwingend ein funktionierendes Underlay-Routing — und welches Protokoll wird dafür typischerweise eingesetzt?
2. Was ist der Unterschied zwischen einer Northbound-API und einer Southbound-API — und welche Rolle spielt JSON dabei?
3. Welche Cloud-Konnektivitätsvariante bietet **garantierte Bandbreite** und SLAs — und warum ist sie teurer als ein Internet-VPN?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **DNA Center ≠ Datenpfad:** DNA Center ist Management/Control-Tool. User-Pakete laufen niemals durch DNAC. Wer ein Performance-Problem auf DNA Center sucht, sucht falsch.
- ⚠️ **SD-Access mit SD-WAN verwechseln:** SD-Access ist Campus-LAN-Fabric (innerhalb eines Standorts), SD-WAN ist die Verbindung **zwischen** Standorten. Beide nutzen ähnliche Konzepte (Fabric, Overlay), sind aber unterschiedliche Produkte.
- ⚠️ **IaaS vs. PaaS vermischen:** Wer eine Azure VM mietet (IaaS), ist selbst für Patches verantwortlich. Wer Azure SQL DB (PaaS) nutzt, muss sich um den darunterliegenden SQL-Server-OS-Patch nicht kümmern.
  `.trim(),
};

export const TOPIC_SDN: Topic = {
  id: "sdn-controller",
  title: "Controller-Based Networking & Cloud",
  description:
    "SDN-Architektur, Cisco DNA Center, SD-Access (VXLAN/LISP) und Cloud-Service-Modelle.",
  conceptIds: [
    "sdn-overview",
    "dna-center",
    "cloud-architecture",
    "sdn-guide",
  ],
  quizIds: ["ccna-quiz-sdn"],
  exerciseIds: [],
  prerequisiteTopicIds: ["routing-ospf"],
  estimatedMinutes: 120,
  tags: ["sdn", "dna-center", "sd-access", "cloud", "automation"],
};

export const SDN_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_SDN_OVERVIEW.id]: CONCEPT_SDN_OVERVIEW,
  [CONCEPT_DNA_CENTER.id]: CONCEPT_DNA_CENTER,
  [CONCEPT_CLOUD_ARCHITECTURE.id]: CONCEPT_CLOUD_ARCHITECTURE,
  [CONCEPT_SDN_GUIDE.id]: CONCEPT_SDN_GUIDE,
};
