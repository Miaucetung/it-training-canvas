// ============================================================
// CCNA Topic: Virtualization & Cloud
// Quelle: CCNA 200-301 Official Cert Guide V2, Ch 18
// Blueprint 1.2: Describe characteristics of network topology architectures
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_VIRTUALIZATION: Concept = {
  id: "virtualization",
  title: "Virtualisierung — Hypervisoren, VMs, Container und Cloud",
  appliesTo: ["ccna"],
  tags: ["virtualization", "hypervisor", "vm", "container", "nfv", "cloud", "iaas", "paas", "saas"],
  content: `
## Virtualisierung im Netzwerkkontext

Virtualisierung entkoppelt Software (Betriebssystem, Netzwerkfunktionen) von
dedizierter Hardware. Für die CCNA sind zwei Bereiche relevant:
**Server-Virtualisierung** (VMs/Container) und **NFV** (Network Functions Virtualization).

---

## Hypervisoren — Typen

| Typ | Beschreibung | Beispiele |
|-----|-------------|-----------|
| **Typ 1** (Bare-Metal) | Läuft direkt auf Hardware, kein Host-OS | VMware ESXi, Microsoft Hyper-V, KVM |
| **Typ 2** (Hosted) | Läuft als Anwendung auf Host-OS | VirtualBox, VMware Workstation |

:::merke
**Typ 1 = Bare-Metal** (direkt auf der Hardware, kein Host-OS) → Rechenzentrum, max. Leistung. **Typ 2 = Hosted** (als App auf Windows/macOS) → Desktop/Lab. Merkhilfe: Typ **1** sitzt auf der **1.** Schicht (Hardware).
:::

---

## VMs vs. Container

:::kernidee
Der Unterschied ist die **Grenze der Isolation**: Eine **VM** virtualisiert die *Hardware* und bringt ein **komplettes eigenes Betriebssystem** mit (schwer, sicher isoliert). Ein **Container** virtualisiert nur das *OS* und **teilt sich den Kernel** des Hosts (leicht, schnell, weniger isoliert). Faustregel: VM = „eigenes Haus", Container = „eigenes Zimmer in einer WG".
:::

| Merkmal | Virtual Machine (VM) | Container |
|---------|---------------------|-----------|
| Isolation | Vollständige OS-Isolation | Teilen Host-Kernel |
| Größe | GB (vollständiges OS-Image) | MB (nur App + Abhängigkeiten) |
| Startzeit | Minuten | Sekunden |
| Overhead | Hoch (eigener Kernel) | Gering |
| Beispiel | VMware ESXi-VMs | Docker, Kubernetes |
| Portabilität | Medium | Hoch |

---

## NFV — Network Functions Virtualization

NFV ersetzt dedizierte Netzwerk-Hardware durch Software, die auf Standard-Servern läuft.

### Klassisch vs. NFV
\`\`\`
Klassisch:  [Firewall-HW] [IDS-HW] [Router-HW] [Load Balancer-HW]

NFV:        [Standard x86 Server]
             ├── vFirewall  (VM)
             ├── vIDS       (VM)
             ├── vRouter    (VM)
             └── vLB        (VM)
\`\`\`

### Cisco NFVIS (Enterprise NFV Infrastructure Software)
Cisco-Plattform für NFV auf Branch-Routern (z. B. ISR 4000 mit UCS-E-Modul):
- Hostet virtuelle Netzwerkfunktionen (VNFs) auf einem physischen Gerät
- Verwaltung über REST API oder Cisco DNA Center
- Typische VNFs: Cisco CSR 1000V, ASAv (virtual Firewall), ISRv

---

## Virtuelle Switches (vSwitch)

In virtualisierten Umgebungen verbinden vSwitches VMs intern und mit dem
physischen Netzwerk.

| vSwitch | Beschreibung |
|---------|-------------|
| **VMware vSwitch** | Einfacher L2-Switch im VMware-ESXi-Hypervisor |
| **VMware dvSwitch** | Verteilter vSwitch über mehrere ESXi-Hosts |
| **Cisco Nexus 1000V** | Cisco vSwitch für VMware, bietet VLANs/QoS/ACL |
| **Open vSwitch (OVS)** | Open-Source vSwitch, häufig in KVM/OpenStack |

> VMs eines ESXi-Hosts kommunizieren über den vSwitch intern — kein Datenverkehr
> verlässt den Server. Für VLAN-Tagging im vSwitch: Port Groups mit VLAN-ID konfigurieren.

---

## Cloud-Service-Modelle

| Modell | Anbieter verwaltet | Kunde verwaltet | Beispiel |
|--------|--------------------|-----------------|---------|
| **IaaS** (Infrastructure as a Service) | Hardware, Hypervisor | OS, Middleware, Apps | AWS EC2, Azure VMs |
| **PaaS** (Platform as a Service) | Hardware bis Runtime | Anwendung, Daten | AWS Elastic Beanstalk, Heroku |
| **SaaS** (Software as a Service) | Alles | Nur Nutzung | Microsoft 365, Salesforce |

### Cloud-Deployment-Modelle
| Modell | Beschreibung |
|--------|-------------|
| **Public Cloud** | Ressourcen beim Cloud-Anbieter (AWS, Azure, GCP) |
| **Private Cloud** | Eigenes Rechenzentrum, Cloud-ähnliche Automatisierung |
| **Hybrid Cloud** | Kombination: on-prem + Public Cloud, verbunden via VPN/Direct Connect |
| **Community Cloud** | Shared Cloud für mehrere Organisationen gleicher Branche |

---

## Cisco-relevante Virtualiserungskonzepte

| Begriff | Bedeutung |
|---------|-----------|
| **CSR 1000V** | Cisco Cloud Services Router — virtuelle IOS-XE-Instanz für Cloud |
| **ASAv** | Virtuelle Cisco ASA Firewall |
| **Catalyst 8000V** | Virtueller SD-WAN-fähiger Router |
| **NFVIS** | Cisco NFV Infrastructure Software |
| **UCS (Unified Computing System)** | Cisco Blade/Rack-Server für Rechenzentren |
`,
};

export const TOPIC_VIRTUALIZATION: Topic = {
  id: "ccna-virtualization",
  title: "Virtualisierung & Cloud",
  description:
    "Hypervisoren Typ 1/2, VMs vs. Container, NFV, virtuelle Switches und Cloud-Servicemodelle (IaaS/PaaS/SaaS).",
  conceptIds: ["virtualization"],
  quizIds: ["ccna-quiz-virtualization"],
  exerciseIds: [],
  estimatedMinutes: 45,
  tags: ["virtualization", "cloud", "nfv", "hypervisor", "vm", "container"],
  lessonSummary: {
    mustKnow: [
      "Typ-1-Hypervisor (Bare-Metal) läuft direkt auf Hardware — VMware ESXi, Hyper-V, KVM; Typ-2 (gehostet) läuft auf einem Betriebssystem — VirtualBox, VMware Workstation",
      "VMs beinhalten ein vollständiges Gast-OS (GB groß, Minuten zum Starten); Container teilen den Host-Kernel (MB groß, Sekunden zum Starten) — Container sind leichter, aber weniger isoliert",
      "NFV ersetzt dedizierte Netzwerkhardware (Firewalls, Router, Load Balancer) durch Software-VMs auf Standard-x86-Servern",
      "Cloud-Service-Modelle: IaaS (du verwaltest OS+App), PaaS (du verwaltest nur die App), SaaS (du verwaltest nur Daten/Konfiguration)",
    ],
    bestPractice: [
      {
        topic: "Hypervisor-Auswahl",
        practice:
          "Typ-1-Hypervisoren (ESXi, Hyper-V) für Produktions-Workloads verwenden — bessere Leistung und Isolation; Typ-2 nur für Lab-/Entwicklungsumgebungen.",
      },
      {
        topic: "Container-Sicherheit",
        practice:
          "Container in der Produktion niemals als Root ausführen; Namespaces und Cgroups zur Isolation verwenden; Container-Images vor dem Deployment auf Schwachstellen scannen.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "Dedizierte Hardware-Appliances für Netzwerkfunktionen",
        reason:
          "Hohe Kosten, langsame Bereitstellung, schwer skalierbar; jede Funktion erfordert separate Hardware-Anschaffung und Rack-Platz",
        replacedBy: "NFV (virtuelle Firewalls, Router, Load Balancer) auf Standard-x86-Servern",
      },
    ],
    fastFacts: [
      "Ein vSwitch verbindet VMs intern innerhalb eines Hypervisor-Hosts — Traffic zwischen zwei VMs auf demselben Host verlässt den Server nie. Verify: show virtual-switch auf ESXi oder 'ip link show' auf KVM",
      "IaaS: du pflegst OS-Patches. PaaS: Vendor pflegt OS-Patches. SaaS: Vendor pflegt alles. Verify: AWS Shared Responsibility Model",
      "Docker-Container starten in Sekunden, weil sie den OS-Bootprozess überspringen; sie teilen den Host-Kernel. Verify: docker ps --format 'table {{.Names}}\\t{{.Status}}'",
    ],
  },
};

export const VIRTUALIZATION_CONCEPTS: Record<string, Concept> = {
  virtualization: CONCEPT_VIRTUALIZATION,
};
