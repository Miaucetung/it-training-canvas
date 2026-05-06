// ============================================================
// CCNA Topic: Netzwerk-Segmentierung
// Subnetzsegmentierung, Sicherheitszonen, VLSM-Planung,
// DMZ, Enterprise-Szenario, Cisco IOS Konfiguration
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

// ── Concept 1: Warum segmentieren? ───────────────────────────
export const CONCEPT_SEGMENT_WHY: Concept = {
  id: "segment-why",
  title: "Warum Netzwerk-Segmentierung?",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["segmentierung", "sicherheit", "broadcast-domain", "netzwerkplanung"],
  relatedConceptIds: ["vlans", "subnetting"],
  content: `
## Warum Netzwerk-Segmentierung?

### 🏢 Alltagsanalogie: Das Bürogebäude
Stell dir ein Bürogebäude vor, in dem **alle Etagen offene Türen** haben — jeder hört jedes Gespräch, jeder kann zu jedem Drucker gehen, und wenn jemand einen Brand legt, breitet er sich sofort aus.

Netzwerk-Segmentierung ist wie **Brandschutztüren**: Sie unterteilen das Gebäude in kontrollierte Zonen, jede mit eigener Zutrittskontrolle.

---

### Problem 1: Broadcast-Lawinen
Ohne Segmentierung teilen sich **alle Geräte dieselbe Broadcast-Domäne**:
- Ein ARP-Request wird an alle 500 Geräte gesendet → CPU-Last an jedem Gerät
- DHCP-Discover, NetBIOS-Anfragen, STP-BPDUs — alles geht an alle
- Ab ~200 Geräten: **messbare Performance-Degradation**

\`\`\`
Ohne Segmentierung:
[PC₁]──[PC₂]──[PC₃]──...──[PC₅₀₀]
        ← Alle in einer Broadcast-Domäne →

Mit Segmentierung:
[PC₁..₅₀]  /26    [Server₁..₁₀]  /28    [Drucker₁..₅]  /29
 VLAN 10          VLAN 20               VLAN 30
\`\`\`

---

### Problem 2: Fehlende Sicherheitstrennung
Ohne Segmentierung kann:
- Ein infizierter PC direkt auf Server zugreifen (laterale Bewegung)
- Ein Mitarbeiter auf Buchhaltungsdaten zugreifen (Data Leakage)
- Ein Angreifer im Gästenetz ins Firmennetz tunneln

**Segmentierung = Minimalprinzip** (Principle of Least Privilege):
Jede Zone bekommt nur die Rechte, die sie wirklich braucht.

---

### Problem 3: IP-Adressmanagement
Ein einziges /24-Netz für 200 Geräte:
- Alle IP-Adressen im selben Block → unübersichtlich
- Fehler bei einer Adresse kann DHCP-Pool durcheinanderbringen
- Keine klare Trennung: "Ist 192.168.1.87 ein Server oder ein PC?"

Mit Segmentierung:
\`\`\`
10.10.10.0/27  → Server-Zone   (30 Hosts)
10.10.10.32/27 → Client-Zone   (30 Hosts)
10.10.10.64/28 → DMZ           (14 Hosts)
10.10.10.80/29 → Management    (6 Hosts)
\`\`\`
Sofort erkennbar: IP-Adresse = Zone = Sicherheitsstufe.

---

### Vorteile der Segmentierung auf einen Blick

| Vorteil | Wie? |
|---------|------|
| **Performance** | Kleinere Broadcast-Domänen → weniger Rauschen |
| **Sicherheit** | Zones isolieren Systeme → laterale Bewegung erschwert |
| **Management** | IP-Adressen reflektieren Funktion → einfache Fehlersuche |
| **Compliance** | PCI-DSS, ISO 27001 fordern Netzwerktrennung |
| **Skalierbarkeit** | Neue Zonen hinzufügen ohne das ganze Netz umzubauen |

---

### ⚠️ Achtung-Falle: Segmentierung ≠ vollständige Sicherheit
Segmentierung ist **eine Schicht** im Defense-in-Depth-Konzept.
Ohne Firewalls, ACLs und Monitoring zwischen den Zonen nützt die
Unterteilung wenig — Zonen müssen aktiv kontrolliert werden.

> 🎯 **CCNA-Prüfungsrelevanz:** ★★☆  
> 📋 **Exam Topic:** 1.6 (Network Topology Architectures)  
> ⏱️ **Lernzeit:** 20 Minuten
  `.trim(),
};

// ── Concept 2: Sicherheitszonen ──────────────────────────────
export const CONCEPT_SEGMENT_ZONES: Concept = {
  id: "segment-zones",
  title: "Sicherheitszonen: DMZ, Server, Client, Management",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["dmz", "sicherheitszonen", "vlan", "netzwerkplanung"],
  relatedConceptIds: ["segment-why", "vlsm-plan"],
  content: `
## Sicherheitszonen im Unternehmens-Netzwerk

### Das klassische Zonen-Modell

\`\`\`
Internet
   │
[Firewall Außen]
   │
┌──┴──────────────────────────┐
│  DMZ (Demilitarized Zone)   │  ← Öffentlich erreichbar
│  Web-Server, Mail-Server    │
│  10.x.x.64/28               │
└──────────────────────────┬──┘
                           │
[Firewall Innen / Router]
   │
   ├─── Server-Zone ─── VLAN 20 ── 10.x.x.0/27
   │    (intern, hoch geschützt)
   │    File-Server, DB-Server, Auth
   │
   ├─── Client-Zone ── VLAN 10 ── 10.x.x.32/27
   │    (Arbeitsstationen)
   │    PCs, Laptops
   │
   ├─── WLAN-Zone ──── VLAN 30 ── 10.x.x.96/28
   │    (Wireless Clients)
   │
   ├─── Gäste-WLAN ── VLAN 40 ── 10.x.x.112/28
   │    (Kein Zugriff intern!)
   │
   └─── Management ── VLAN 99 ── 10.x.x.80/29
        (Out-of-Band, nur Admins)
        Switch-CLI, Router-SSH, iDRAC
\`\`\`

---

### Zone 1: DMZ (Demilitarized Zone)

**Zweck:** Systeme, die vom Internet erreichbar sein müssen, aber **nicht ins interne Netz sollen**.

**Typische Dienste:** Web-Server (HTTP/HTTPS), Mail-Server (SMTP), DNS-Resolver, Reverse Proxy

**Regelwerk:**
- ✅ Internet → DMZ: erlaubt (Port 80, 443, 25)
- ✅ DMZ → Internet: eingeschränkt (nur ausgehend)
- ❌ DMZ → Intern: **verboten** (kritische Regel!)
- ✅ Intern → DMZ: erlaubt (für Admins)

> **Achtung-Falle:** Wenn ein Web-Server in der DMZ kompromittiert wird und direkt auf den internen DB-Server zugreifen kann, ist die DMZ wertlos. DMZ → Intern **muss** durch Firewall blockiert sein.

---

### Zone 2: Server-Zone (Internal)

**Zweck:** Interne Server, die nur von autorisierten internen Systemen erreichbar sind.

**Typische Systeme:** Active Directory, File-Server, Datenbank-Server, Backup-Server

**Regelwerk:**
- ✅ Client-Zone → Server-Zone: erlaubt (spezifische Ports)
- ✅ Management → Server-Zone: erlaubt (SSH, RDP)
- ❌ WLAN → Server-Zone: eingeschränkt (nur nach Authentifizierung)
- ❌ Gäste → Server-Zone: **verboten**

---

### Zone 3: Client-Zone

**Zweck:** Arbeitsstationen der Mitarbeiter.

**Typische Geräte:** PCs, Laptops, Thin Clients

**Besonderheit:** Größte Zone → braucht die meisten IP-Adressen → größtes Subnetz!

---

### Zone 4: Management-Zone (Out-of-Band)

**Zweck:** Netzwerkgeräte verwalten — **getrennt vom Produktionsnetz**.

**Typische Zugangspunkte:** Switch-Management-IPs, Router-SSH, iDRAC/IPMI (Server-Remote-Management)

**Regelwerk:** Nur dedizierte Admin-Workstations haben Zugriff.

> **Best Practice:** Management VLAN 99 (VLAN 1 niemals für Management nutzen!)

---

### Zone 5: Gäste-WLAN

**Zweck:** Internet-Zugang für Besucher, **ohne** Zugang zum Firmennetz.

**Implementierung:**
- Separates VLAN → eigener DHCP-Pool
- Firewall-Regel: Gäste → Internet ✅, Gäste → Intern ❌
- Optional: Client-Isolation (Gäste sehen sich gegenseitig nicht)

---

### Zonen-Übersicht: Typical Enterprise

| Zone | VLAN | Subnetz | Sicherheit | Zugriff von |
|------|------|---------|------------|-------------|
| DMZ | 50 | /28 | Hoch | Internet, Intern |
| Server | 20 | /27 | Sehr hoch | Client (gefiltert), Mgmt |
| Client | 10 | /24 | Mittel | Internet (via NAT) |
| WLAN | 30 | /25 | Mittel | Internet (via NAT) |
| Gäste | 40 | /26 | Niedrig | Internet only |
| Management | 99 | /29 | Sehr hoch | Nur Admin-Stationen |

> 🎯 **CCNA-Prüfungsrelevanz:** ★★★  
> 📋 **Exam Topic:** 5.2 (ACL configuration), 4.1 (Troubleshooting inter-VLAN)  
> ⏱️ **Lernzeit:** 25 Minuten
  `.trim(),
};

// ── Concept 3: VLSM-Planung ───────────────────────────────────
export const CONCEPT_VLSM_PLAN: Concept = {
  id: "vlsm-plan",
  title: "VLSM-Planung: Schritt für Schritt",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["vlsm", "cidr", "subnetting", "planung", "netzwerkdesign"],
  relatedConceptIds: ["subnetting", "subnetting-drill", "segment-zones"],
  content: `
## VLSM-Planung für Netzwerk-Segmentierung

### Ausgangssituation
Firma erhält: **10.10.0.0/22** (1022 nutzbare Hosts)

Anforderungen:
| Zone | Benötigte Hosts |
|------|----------------|
| Client-Zone | 200 |
| Server-Zone | 40 |
| WLAN | 60 |
| DMZ | 12 |
| Gäste | 20 |
| Management | 5 |

---

### Schritt 1: Sortiere nach Größe (größte zuerst!)

\`\`\`
1. Client-Zone:  200 Hosts
2. WLAN:          60 Hosts
3. Server-Zone:   40 Hosts
4. Gäste:         20 Hosts
5. DMZ:           12 Hosts
6. Management:     5 Hosts
\`\`\`

> **Achtung-Falle:** Immer größte Zonen zuerst vergeben — sonst entstehen Lücken,
> die nicht mehr genutzt werden können (Adressraum-Verschwendung).

---

### Schritt 2: CIDR für jede Zone berechnen

**Formel:** Nächste Zweierpotenz ≥ (Hosts + 2) → Präfix = 32 − log₂(Block-Größe)

| Zone | Hosts | +2 | Nächste 2er-Pot. | Präfix | Hosts nutzbar |
|------|-------|-----|-----------------|--------|---------------|
| Client | 200 | 202 | 256 | **/24** | 254 |
| WLAN | 60 | 62 | 64 | **/26** | 62 |
| Server | 40 | 42 | 64 | **/26** | 62 |
| Gäste | 20 | 22 | 32 | **/27** | 30 |
| DMZ | 12 | 14 | 16 | **/28** | 14 |
| Management | 5 | 7 | 8 | **/29** | 6 |

---

### Schritt 3: Subnetze aus dem Pool zuweisen

Basis-Netz: **10.10.0.0/22** = 10.10.0.0 – 10.10.3.255

\`\`\`
10.10.0.0   /24  → Client-Zone    (10.10.0.0 – 10.10.0.255)
10.10.1.0   /26  → WLAN           (10.10.1.0 – 10.10.1.63)
10.10.1.64  /26  → Server-Zone    (10.10.1.64 – 10.10.1.127)
10.10.1.128 /27  → Gäste          (10.10.1.128 – 10.10.1.159)
10.10.1.160 /28  → DMZ            (10.10.1.160 – 10.10.1.175)
10.10.1.176 /29  → Management     (10.10.1.176 – 10.10.1.183)

Verbleibend (noch frei für Wachstum):
10.10.1.184 – 10.10.3.255  (~571 Adressen)
\`\`\`

---

### Schritt 4: Jedes Subnetz verifizieren (Magic Number)

**Beispiel: WLAN 10.10.1.0/26**
- Maske: 255.255.255.**192** → Magic = 256 − 192 = **64**
- Netzadresse: **10.10.1.0**
- Broadcast: 10.10.1.0 + 64 − 1 = **10.10.1.63**
- Gateway: **10.10.1.1** (erste Host-Adresse)
- Erster Host: **10.10.1.2** (oder 10.10.1.1 wenn Gateway = erster Host)
- Letzter Host: **10.10.1.62**
- Nutzbare Hosts: **62** ✓

---

### Schritt 5: Gateway-Adressen vergeben

Konvention: **Erste** oder **letzte** nutzbare Adresse für den Router/Switch (je nach Team-Policy).

| Zone | Gateway | Empfehlung |
|------|---------|------------|
| Client-Zone | 10.10.0.1 | Router Sub-Interface Gi0/0.10 |
| WLAN | 10.10.1.1 | Router Sub-Interface Gi0/0.30 |
| Server-Zone | 10.10.1.65 | Router Sub-Interface Gi0/0.20 |
| Gäste | 10.10.1.129 | Router Sub-Interface Gi0/0.40 |
| DMZ | 10.10.1.161 | Firewall-Interface |
| Management | 10.10.1.177 | SVI Vlan 99 am Layer-3-Switch |

---

### Schnell-Check: Überschneiden sich Subnetze?

\`\`\`
10.10.0.0/24  endet bei .0.255
10.10.1.0/26  beginnt bei .1.0  ✓ (kein Überlapp)
10.10.1.64/26 beginnt bei .1.64 ✓ (endet bei .1.127)
10.10.1.128/27 beginnt bei .1.128 ✓ (endet bei .1.159)
10.10.1.160/28 beginnt bei .1.160 ✓ (endet bei .1.175)
10.10.1.176/29 beginnt bei .1.176 ✓ (endet bei .1.183)
\`\`\`

> 🎯 **CCNA-Prüfungsrelevanz:** ★★★  
> 📋 **Exam Topic:** 1.7 (IPv4 addressing and subnetting, VLSM)  
> ⏱️ **Lernzeit:** 30 Minuten
  `.trim(),
};

// ── Concept 4: Cisco IOS Konfiguration ──────────────────────
export const CONCEPT_SEGMENT_CISCO: Concept = {
  id: "segment-cisco-config",
  title: "Cisco IOS: Segmentierung konfigurieren",
  appliesTo: ["ccna"],
  tags: ["cisco", "ios", "subinterface", "svi", "acl", "router-on-a-stick"],
  relatedConceptIds: ["vlsm-plan", "vlans"],
  content: `
## Cisco IOS: Segmentierung implementieren

### Methode 1: Router-on-a-Stick (Sub-Interfaces)

Einsatz: Ein physischer Router-Port, viele VLANs via 802.1Q-Trunking.

\`\`\`
! Router (ISR 4321)
!
! Trunk-Port Richtung Switch aktivieren
interface GigabitEthernet0/0
 no shutdown
!
! Sub-Interface für Client-Zone VLAN 10
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 10.10.0.1 255.255.255.0
 description Client-Zone
!
! Sub-Interface für Server-Zone VLAN 20
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.10.1.65 255.255.255.192
 description Server-Zone
!
! Sub-Interface für WLAN VLAN 30
interface GigabitEthernet0/0.30
 encapsulation dot1Q 30
 ip address 10.10.1.1 255.255.255.192
 description WLAN-Zone
!
! Sub-Interface für Gäste VLAN 40
interface GigabitEthernet0/0.40
 encapsulation dot1Q 40
 ip address 10.10.1.129 255.255.255.224
 description Gaeste-WLAN
!
! Sub-Interface für DMZ VLAN 50
interface GigabitEthernet0/0.50
 encapsulation dot1Q 50
 ip address 10.10.1.161 255.255.255.240
 description DMZ
!
! Sub-Interface für Management VLAN 99
interface GigabitEthernet0/0.99
 encapsulation dot1Q 99
 ip address 10.10.1.177 255.255.255.248
 description Management
\`\`\`

---

### Switch-Konfiguration (Trunk + Access Ports)

\`\`\`
! VLANs anlegen
vlan 10
 name Client-Zone
vlan 20
 name Server-Zone
vlan 30
 name WLAN
vlan 40
 name Gaeste
vlan 50
 name DMZ
vlan 99
 name Management
!
! Uplink zum Router als Trunk
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50,99
 description Trunk-zum-Router
!
! Access Port für PC
interface GigabitEthernet0/2
 switchport mode access
 switchport access vlan 10
 description PC-Mitarbeiter
!
! Access Port für Server
interface GigabitEthernet0/10
 switchport mode access
 switchport access vlan 20
 description File-Server
!
! Management-IP auf dem Switch selbst
interface Vlan99
 ip address 10.10.1.178 255.255.255.248
 no shutdown
ip default-gateway 10.10.1.177
\`\`\`

---

### Methode 2: Layer-3-Switch mit SVIs

\`\`\`
! Layer-3-Switch (Catalyst 3560/3750/9300)
ip routing
!
interface Vlan10
 ip address 10.10.0.1 255.255.255.0
 description Client-Zone-Gateway
 no shutdown
!
interface Vlan20
 ip address 10.10.1.65 255.255.255.192
 description Server-Zone-Gateway
 no shutdown
!
interface Vlan30
 ip address 10.10.1.1 255.255.255.192
 description WLAN-Gateway
 no shutdown
!
interface Vlan99
 ip address 10.10.1.177 255.255.255.248
 description Management-Gateway
 no shutdown
\`\`\`

---

### ACLs für Zonenübergänge

\`\`\`
! Gäste dürfen NICHT ins interne Netz
ip access-list extended GAESTE-POLICY
 deny   ip 10.10.1.128 0.0.0.31 10.10.0.0 0.0.3.255
 permit ip 10.10.1.128 0.0.0.31 any
!
interface GigabitEthernet0/0.40
 ip access-group GAESTE-POLICY in
!
! DMZ darf NICHT in interne Zonen
ip access-list extended DMZ-POLICY
 permit tcp 10.10.1.160 0.0.0.15 any eq 80
 permit tcp 10.10.1.160 0.0.0.15 any eq 443
 deny   ip 10.10.1.160 0.0.0.15 10.10.0.0 0.0.3.255
 permit ip any any
!
interface GigabitEthernet0/0.50
 ip access-group DMZ-POLICY in
\`\`\`

---

### Verifizierung

\`\`\`
! Sub-Interfaces prüfen
show ip interface brief | include GigabitEthernet0/0

! Routing-Tabelle — alle Subnetze da?
show ip route

! VLAN-Zuweisung am Switch
show vlan brief
show interfaces trunk

! ACL-Treffer prüfen
show ip access-lists
\`\`\`

---

### ⚠️ Achtung-Falle: VLAN 1 als Native VLAN
Standard: Native VLAN auf Trunk-Ports ist VLAN 1.
VLAN 1 trägt per Default auch Management-Traffic.
**Best Practice:** Native VLAN auf ein ungenutztes VLAN setzen:
\`\`\`
interface GigabitEthernet0/1
 switchport trunk native vlan 999
\`\`\`

> 🎯 **CCNA-Prüfungsrelevanz:** ★★★  
> 📋 **Exam Topic:** 2.1 (VLANs), 2.4 (Inter-VLAN routing), 5.2 (ACLs)  
> ⏱️ **Lernzeit:** 35 Minuten
  `.trim(),
};

// ── Concept 5: Enterprise-Szenario ──────────────────────────
export const CONCEPT_SEGMENT_ENTERPRISE: Concept = {
  id: "segment-enterprise-example",
  title: "Enterprise-Szenario: MedTech GmbH",
  appliesTo: ["ccna"],
  tags: ["praxis", "szenario", "enterprise", "netzwerkplanung"],
  relatedConceptIds: ["vlsm-plan", "segment-cisco-config", "segment-zones"],
  content: `
## Enterprise-Szenario: MedTech GmbH

### Ausgangslage
Die **MedTech GmbH** (Medizingerätehersteller, 180 Mitarbeiter) zieht in ein neues Bürogebäude.
Der ISP stellt **192.168.100.0/22** zur Verfügung.

**Anforderungen:**
- Entwicklungsabteilung: 80 Hosts (besonders schützenswert — Patentdaten!)
- Produktion/Fertigung: 50 Hosts
- Büro/Verwaltung: 60 Hosts
- Gäste-WLAN: 30 gleichzeitige Clients (täglich wechselnd)
- Server-Zone: 20 Server (intern)
- DMZ: 5 Server (Web, Mail, VPN)
- Management-Netz: 8 Geräte (Switches, Router, AP-Controller)

---

### Schritt 1: Sortieren & CIDR bestimmen

| Zone | Hosts | CIDR | Block | Nutzbar |
|------|-------|------|-------|---------|
| Büro/Verwaltung | 60 | /26 | 64 | 62 |
| Entwicklung | 80 | /25 | 128 | 126 |
| Produktion | 50 | /26 | 64 | 62 |
| Gäste-WLAN | 30 | /27 | 32 | 30 |
| Server-Zone | 20 | /27 | 32 | 30 |
| DMZ | 5 | /29 | 8 | 6 |
| Management | 8 | /28 | 16 | 14 |

---

### Schritt 2: Zuteilung aus 192.168.100.0/22

\`\`\`
Verfügbarer Pool: 192.168.100.0 – 192.168.103.255 (1022 nutzbare Hosts)

192.168.100.0   /25  → Entwicklung (VLAN 20)
                       Gateway: 192.168.100.1
                       Hosts: .2 – .126
                       Broadcast: 192.168.100.127

192.168.100.128 /26  → Büro/Verwaltung (VLAN 10)
                       Gateway: 192.168.100.129
                       Hosts: .130 – .190
                       Broadcast: 192.168.100.191

192.168.100.192 /26  → Produktion (VLAN 30)
                       Gateway: 192.168.100.193
                       Hosts: .194 – .254
                       Broadcast: 192.168.100.255

192.168.101.0   /27  → Server-Zone (VLAN 40)
                       Gateway: 192.168.101.1
                       Hosts: .2 – .30
                       Broadcast: 192.168.101.31

192.168.101.32  /27  → Gäste-WLAN (VLAN 50)
                       Gateway: 192.168.101.33
                       Hosts: .34 – .62
                       Broadcast: 192.168.101.63

192.168.101.64  /28  → Management (VLAN 99)
                       Gateway: 192.168.101.65
                       Hosts: .66 – .78
                       Broadcast: 192.168.101.79

192.168.101.80  /29  → DMZ (VLAN 60)
                       Gateway: 192.168.101.81
                       Hosts: .82 – .86
                       Broadcast: 192.168.101.87

Verbleibend: 192.168.101.88 – 192.168.103.255 (~680 Adressen für Wachstum)
\`\`\`

---

### Schritt 3: Sicherheits-Policy

\`\`\`
Regelwerk (vereinfacht):
┌─────────────────┬──────────┬──────────┬──────────────┐
│ Quelle → Ziel   │ Intern   │ Server   │ Internet     │
├─────────────────┼──────────┼──────────┼──────────────┤
│ Entwicklung     │ ❌ nein   │ ✅ ja    │ ✅ eingeschr.│
│ Büro            │ ❌ nein   │ ✅ ja    │ ✅ ja        │
│ Produktion      │ ❌ nein   │ ✅ ja    │ ❌ nein      │
│ Gäste           │ ❌ nein   │ ❌ nein  │ ✅ ja        │
│ Server          │ ✅ ja    │ intern   │ ❌ nein      │
│ DMZ             │ ❌ nein   │ ❌ nein  │ ✅ ja        │
│ Management      │ ✅ ja    │ ✅ ja    │ ❌ nein      │
└─────────────────┴──────────┴──────────┴──────────────┘
\`\`\`

**Besonderheit Entwicklung:** Maximale Isolierung wegen Patentdaten.
- Kein seitlicher Zugriff auf andere Client-Zonen
- Server-Zugriff nur über dedizierte ACL-Regeln
- Alle ausgehenden HTTPS-Verbindungen geloggt

---

### Schritt 4: Cisco IOS Kurzconfig

\`\`\`
! Entwicklungs-VLAN absichern (beispielhaft)
ip access-list extended ENTWICKLUNG-OUT
 permit tcp 192.168.100.0 0.0.0.127 192.168.101.0 0.0.0.31 established
 permit tcp 192.168.100.0 0.0.0.127 any eq 443
 deny   ip 192.168.100.0 0.0.0.127 192.168.100.0 0.0.3.255
 permit ip 192.168.100.0 0.0.0.127 any
!
interface GigabitEthernet0/0.20
 ip access-group ENTWICKLUNG-OUT out
\`\`\`

---

### Prüfungs-Checkliste VLSM-Design

- [ ] Größte Subnetze zuerst zugewiesen
- [ ] Alle Subnetze liegen auf ihren natürlichen Grenzen (aligned)
- [ ] Kein Subnetz überlappt ein anderes
- [ ] Gateway-Adressen notiert (erste nutzbare IP)
- [ ] Broadcast-Adressen korrekt (letzte IP im Block)
- [ ] Freier Adressraum für zukünftiges Wachstum reserviert
- [ ] Sicherheits-Policy für jede Zone definiert

> 🎯 **CCNA-Prüfungsrelevanz:** ★★★  
> 📋 **Exam Topic:** 1.7, 2.1, 2.4, 5.2  
> ⏱️ **Lernzeit:** 30 Minuten
  `.trim(),
};

// ── Concept 6: Sentinel für interaktiven Planer ──────────────
export const CONCEPT_SUBNET_SEG_TOOL: Concept = {
  id: "subnet-seg-tool",
  title: "Interaktiver Subnetz-Segmentierungsplaner",
  appliesTo: ["ccna"],
  tags: ["interaktiv", "vlsm", "planung", "tool"],
  content: `
## Subnetz-Segmentierungsplaner

Der interaktive Planer berechnet VLSM-Subnetze für dein Netzwerk-Design:

1. **Basis-Netz eingeben** (z.B. 10.0.0.0/22)
2. **Zonen definieren** — Name, benötigte Hosts, VLAN-ID
3. **Berechnen** → automatische VLSM-Zuteilung
4. **Cisco IOS Config** direkt kopierfertig

Klick auf **"Subnetz-Planer starten"** ↓
  `.trim(),
};

// ── Topic ────────────────────────────────────────────────────
export const TOPIC_SUBNET_SEGMENTATION: Topic = {
  id: "subnet-segmentation",
  title: "Netzwerk-Segmentierung",
  description:
    "Warum segmentieren, Sicherheitszonen (DMZ, Server, Client, Management), VLSM-Planung Schritt für Schritt, Cisco IOS Konfiguration und Enterprise-Szenario mit interaktivem Planer.",
  conceptIds: [
    "segment-why",
    "segment-zones",
    "vlsm-plan",
    "segment-cisco-config",
    "segment-enterprise-example",
    "subnet-seg-tool",
  ],
  quizIds: ["ccna-quiz-segmentierung"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ipv4-addressing", "switching-vlans"],
  estimatedMinutes: 90,
  tags: ["segmentierung", "vlsm", "dmz", "sicherheitszonen", "cisco", "acl"],
};

export const SUBNET_SEGMENTATION_CONCEPTS: Record<string, Concept> = {
  "segment-why": CONCEPT_SEGMENT_WHY,
  "segment-zones": CONCEPT_SEGMENT_ZONES,
  "vlsm-plan": CONCEPT_VLSM_PLAN,
  "segment-cisco-config": CONCEPT_SEGMENT_CISCO,
  "segment-enterprise-example": CONCEPT_SEGMENT_ENTERPRISE,
  "subnet-seg-tool": CONCEPT_SUBNET_SEG_TOOL,
};
