// ============================================================
// CCNA Topic: Network Programmability & Automation
// Quelle: CCNA 200-301 Official Cert Guide V2, Ch 23–24
// REST APIs, JSON, Ansible, Terraform, Puppet/Chef
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_REST_JSON: Concept = {
  id: "rest-json",
  title: "REST APIs, JSON, YAML, XML",
  appliesTo: ["ccna"],
  tags: ["rest", "json", "yaml", "xml", "api", "automation"],
  content: `
## REST — Representational State Transfer

:::kernidee
Eine REST-API macht das Netzwerk **programmierbar wie eine Webseite**: Statt jeden Switch per CLI anzufassen, schickst du HTTP-Requests an einen Controller (DNA Center, Meraki) — **GET** liest den Zustand, **POST/PUT/DELETE** ändern ihn. „Stateless" heißt: jeder Request trägt alles Nötige selbst (inkl. Token), der Server merkt sich nichts zwischen Aufrufen. Das ist die Grundlage jeder Netzwerk-Automatisierung.
:::

REST ist ein **Architekturstil** für HTTP-basierte APIs. Cisco DNA Center, Cisco ACI,
Meraki Dashboard, Webex Control Hub — alle bieten REST-APIs.

### REST-Prinzipien
- **Client-Server**: klare Trennung
- **Stateless**: jede Anfrage trägt alle nötigen Infos
- **Cacheable**: Antworten dürfen gecached werden
- **Uniform Interface**: standardisierte URI-Pfade & Methoden

### HTTP-Methoden (CRUD)
| Methode | CRUD | Idempotent? |
|---------|------|-------------|
| **GET** | Read | ✅ |
| **POST** | Create | ❌ |
| **PUT** | Update / Replace | ✅ |
| **PATCH** | Partial Update | meist nein |
| **DELETE** | Delete | ✅ |

### HTTP-Statuscodes (wichtig)
| Bereich | Bedeutung |
|---------|----------|
| 2xx | Erfolg (200 OK, 201 Created, 204 No Content) |
| 3xx | Redirect |
| 4xx | Client-Fehler (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found) |
| 5xx | Server-Fehler (500 Internal, 503 Unavailable) |

### REST-Authentifizierung
- **Basic Auth** (Base64 Username:Password) — nur über HTTPS
- **Bearer Token** (OAuth2 / JWT) — heute Standard
- API-Key im HTTP-Header

### Datenformate

#### JSON (JavaScript Object Notation)
\`\`\`json
{
  "hostname": "SW1",
  "interfaces": [
    { "name": "Gi0/1", "ip": "192.168.1.1", "mask": 24 },
    { "name": "Gi0/2", "ip": "192.168.2.1", "mask": 24 }
  ],
  "ospf": { "area": 0, "process_id": 1 }
}
\`\`\`

#### YAML (YAML Ain't Markup Language)
\`\`\`yaml
hostname: SW1
interfaces:
  - name: Gi0/1
    ip: 192.168.1.1
    mask: 24
  - name: Gi0/2
    ip: 192.168.2.1
    mask: 24
ospf:
  area: 0
  process_id: 1
\`\`\`

#### XML
\`\`\`xml
<config>
  <hostname>SW1</hostname>
  <interfaces>
    <interface><name>Gi0/1</name><ip>192.168.1.1</ip></interface>
  </interfaces>
</config>
\`\`\`

### Vergleich
| Format | Lesbarkeit | Verbreitung | Genutzt von |
|--------|-----------|-------------|-------------|
| JSON | gut | sehr hoch | REST-APIs |
| YAML | sehr hoch | hoch | Ansible, Kubernetes |
| XML | mittel | rückläufig | NETCONF, SOAP |

### Beispiel-Curl-Aufruf an DNA Center
\`\`\`
curl -X GET https://dnac.example.com/dna/intent/api/v1/network-device \\
  -H "X-Auth-Token: ABC123…" \\
  -H "Content-Type: application/json"
\`\`\`
  `.trim(),
};

export const CONCEPT_AUTOMATION_TOOLS: Concept = {
  id: "automation-tools",
  title: "Ansible, Terraform, Puppet, Chef",
  appliesTo: ["ccna"],
  tags: ["ansible", "terraform", "puppet", "chef", "automation", "iac"],
  content: `
## Configuration Management vs. Infrastructure-as-Code

| | Configuration Management | Infrastructure-as-Code |
|---|--------------------------|-----------------------|
| Beispiele | Ansible, Puppet, Chef | Terraform, CloudFormation |
| Fokus | Bestehende Hosts/Geräte konfigurieren | Cloud-Ressourcen erstellen |
| State | tendenziell zustandslos pro Run | mit State-Datei |

:::kernidee
Der mentale Sprung der Automatisierung: weg vom **imperativen** „mach Schritt A, dann B" hin zum **deklarativen** „so soll es aussehen" — das Werkzeug ermittelt selbst die nötigen Änderungen. Daraus folgt **Idempotenz**: derselbe Lauf 100× ausgeführt ergibt denselben Zustand, nicht 100 VLANs. Genau das macht Automatisierung sicher wiederholbar.
:::

### Ansible
- **Agentlos** — verbindet sich per SSH (Linux) oder NETCONF/REST (Cisco)
- **Push-Modell** — Steuerstation pusht zu Targets
- **YAML-Playbooks** — menschenlesbar
- **Idempotent** — gleicher Run bringt immer dasselbe Ergebnis

\`\`\`yaml
- name: Configure VLAN on Cisco IOS
  hosts: switches
  gather_facts: false
  tasks:
    - name: Create VLAN 10
      cisco.ios.ios_vlans:
        config:
          - vlan_id: 10
            name: SALES
        state: merged
\`\`\`

### Terraform
- **Deklarativ** — beschreibt Soll-Zustand
- **Provider-Modell** — AWS, Azure, GCP, vSphere, Cisco ACI, Meraki
- **State-File** \`terraform.tfstate\` speichert Ist-Zustand
- Workflow: \`init\` → \`plan\` → \`apply\` → \`destroy\`

\`\`\`hcl
resource "meraki_network" "headquarter" {
  organization_id = var.org_id
  name            = "HQ-Network"
  product_types   = ["wireless", "switch", "appliance"]
  tags            = ["main-site"]
}
\`\`\`

### Puppet
- **Agent-basiert** — Agent läuft auf jedem Target, fragt Master alle 30 min
- **Pull-Modell** — Targets holen sich neue Manifeste
- **Eigene DSL** (Ruby-ähnlich)

### Chef
- Wie Puppet: Agent-basiert, Pull-Modell
- Cookbooks in Ruby

### Ansible vs. Puppet — wichtigster Unterschied
| | Ansible | Puppet |
|---|--------|-------|
| Agent | nein | ja |
| Modell | Push | Pull |
| Sprache | YAML | Puppet-DSL |
| Lernkurve | flach | mittel |

### Idempotenz — der Kern jeder Automatisierung
Ein **idempotenter** Task ändert das System nur, wenn der Soll-Zustand nicht
erreicht ist. Dadurch sind Reruns ungefährlich.

### Quellcodeverwaltung (Git)
Sämtliche Playbooks/Manifeste/Templates gehören in Git → **GitOps**.
Vorteil: Versionierung, Code-Review (Pull Request), CI/CD.
  `.trim(),
};

export const CONCEPT_AUTOMATION_GUIDE: Concept = {
  id: "automation-guide",
  title: "Lernguide: Programmability & Automation",
  appliesTo: ["ccna"],
  tags: ["automation", "rest", "ansible", "terraform", "guide"],
  content: `
## Lernziele
- HTTP-Methoden GET/POST/PUT/PATCH/DELETE den CRUD-Operationen zuordnen
- JSON, YAML und XML lesen und einfache Strukturen unterscheiden
- Den Unterschied zwischen Ansible (push, agentlos) und Puppet (pull, agent-basiert) erklären
- Terraform-Workflow (init/plan/apply/destroy) benennen
- Idempotenz definieren und an einem Beispiel zeigen, warum sie nötig ist

## Praxis-Szenario
Die "Holding RheinTech AG" verwaltet 18 Standorte mit insgesamt 60 Cisco-Geräten. Bisher wird jeder neue Switch manuell per SSH konfiguriert (~4 h pro Gerät). Das Netzwerk-Team führt **Ansible** als Configuration-Management ein. Ein zentrales Inventory listet alle Geräte mit ihrem Standort und Hostnamen. Ein Playbook konfiguriert: Hostname, Management-VLAN, NTP-Server (10.0.0.1), Syslog-Server (10.0.0.2), SSHv2 mit lokalem User \`netops\` und einen Banner. Die Playbooks werden in einem Git-Repository versioniert, jede Änderung läuft durch eine Pull-Request-Review.

## Canvas-Übung
**Aufgabe:** Skizziere auf dem Canvas einen Ansible-Control-Node (Server), ein Git-Repository (Symbol) und drei Cisco-Switches an verschiedenen Standorten. Zeichne den Pfad: Engineer → Git Push → CI/CD → Ansible Run → SSH zu Switches.
**Ziel:** Den GitOps-Workflow im Netzwerk-Bereich darstellen.
**Tipps:** Ansible erreicht Cisco-Geräte über zwei Wege: \`network_cli\` (SSH + Templates) oder \`netconf\` (NETCONF/YANG). Letzteres setzt voraus, dass auf dem Cisco-Gerät NETCONF aktiviert ist (\`netconf-yang\`).

## Verständnisfragen
1. Welche HTTP-Methode erstellt eine neue Ressource — und welche ersetzt eine vorhandene komplett?
2. Was bedeutet "idempotent" — und was wäre ein Beispiel für einen NICHT-idempotenten Task?
3. Welcher Vorteil entsteht, wenn man Ansible-Playbooks in Git versioniert (GitOps)?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **POST und PUT vertauschen:** POST erstellt (Server vergibt ID), PUT überschreibt eine konkrete Ressource. Wer mit PUT eine neue Ressource ohne ID anlegen will, bekommt 400 oder 404.
- ⚠️ **YAML-Indentation kaputt:** YAML reagiert sensibel auf **Leerzeichen** — Tabs sind verboten. Eine falsche Einrückung wirft \`could not find expected ':'\`-Fehler.
- ⚠️ **Terraform-State-File ungesichert:** \`terraform.tfstate\` enthält oft Secrets (DB-Passwörter, API-Keys). Niemals lokal in Git, sondern in **Remote Backend** (S3 + KMS, Azure Storage + lock).
  `.trim(),
};

export const CONCEPT_NETCONF_YANG: Concept = {
  id: "netconf-yang",
  title: "NETCONF & YANG – Netzwerk-Automatisierung",
  appliesTo: ["ccna"],
  tags: ["automation", "netconf", "yang", "restconf", "programmability"],
  content: `
## NETCONF & YANG

### Was ist NETCONF?
**NETCONF** (Network Configuration Protocol, RFC 6241) ist ein standardisiertes Protokoll zur Konfiguration und Verwaltung von Netzwerkgeräten über ein strukturiertes API.

| Merkmal | Wert |
|---------|------|
| **Protokoll** | SSH (TCP 830) |
| **Datenformat** | XML |
| **Standard** | RFC 6241 (IETF) |
| **Operationen** | get-config, edit-config, commit, lock/unlock, delete-config |
| **Alternativen** | RESTCONF (HTTPS + JSON/XML, RFC 8040) |

### NETCONF-Architektur
\`\`\`
Manager (Controller / Ansible)
  │  SSH TCP 830
  ▼
NETCONF Agent (Cisco IOS-XE / NX-OS)
  │
  ▼
Datenspeicher (Running / Candidate / Startup)
\`\`\`

### NETCONF Datastores
| Datastore | Beschreibung |
|-----------|-------------|
| **Running** | Aktive Konfiguration (sofort wirksam) |
| **Candidate** | Entwurf — wird mit \`<commit/>\` in Running übernommen |
| **Startup** | Konfiguration nach Neustart |

### Was ist YANG?
**YANG** (Yet Another Next Generation, RFC 7950) ist eine Datenmodellierungssprache für NETCONF/RESTCONF.
- Beschreibt die **Struktur und Typen** von Konfigurationsdaten
- Vergleichbar mit einem Schema/Blueprint für die Geräteconfig
- Cisco, Juniper und andere Hersteller veröffentlichen YANG-Modelle

### YANG-Modelltypen
| Typ | Beschreibung |
|-----|-------------|
| **Native YANG** | Herstellerspezifisch (z.B. Cisco-IOS-XE-native) |
| **OpenConfig** | Herstellerneutral (z.B. openconfig-interfaces) |
| **IETF YANG** | IETF-Standards (z.B. ietf-interfaces) |

### RESTCONF vs. NETCONF
| Merkmal | NETCONF | RESTCONF |
|---------|---------|---------|
| Transport | SSH (TCP 830) | HTTPS |
| Format | XML | JSON oder XML |
| Standard | RFC 6241 | RFC 8040 |
| Einsatz | Vollständige Config | Einfachere REST-ähnliche Abfragen |

### Cisco IOS Konfiguration (NETCONF aktivieren)
\`\`\`
R1(config)# netconf-yang
R1(config)# aaa new-model
R1(config)# aaa authentication login default local
R1# show netconf-yang status
\`\`\`

### Zusammenfassung: Warum NETCONF/YANG?
- **Strukturiert**: XML-Schema statt Freitext-CLI
- **Transaktional**: Candidate-Datastore + commit (atomarer Rollback möglich)
- **Standardisiert**: Herstellerübergreifend (Cisco, Juniper, etc.)
- **Automatisierbar**: Ansible (\`netconf\`-Modul), Python (\`ncclient\`-Bibliothek)
  `.trim(),
};

export const TOPIC_AUTOMATION: Topic = {
  id: "automation",
  title: "Programmability & Automation",
  description:
    "REST APIs, JSON/YAML/XML, Ansible, Terraform, Puppet/Chef und GitOps für Netzwerk-Automatisierung.",
  conceptIds: [
    "rest-json",
    "automation-tools",
    "netconf-yang",
    "automation-guide",
  ],
  quizIds: ["ccna-quiz-automation"],
  exerciseIds: [],
  prerequisiteTopicIds: ["sdn-controller"],
  estimatedMinutes: 120,
  tags: ["automation", "rest", "json", "ansible", "terraform"],
};

export const AUTOMATION_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_REST_JSON.id]: CONCEPT_REST_JSON,
  [CONCEPT_AUTOMATION_TOOLS.id]: CONCEPT_AUTOMATION_TOOLS,
  [CONCEPT_NETCONF_YANG.id]: CONCEPT_NETCONF_YANG,
  [CONCEPT_AUTOMATION_GUIDE.id]: CONCEPT_AUTOMATION_GUIDE,
};
