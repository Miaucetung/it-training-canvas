// ============================================================
// CCNA Topic: VLAN Advanced
// Abdeckung: 802.1Q deep dive, Inter-VLAN, VTP/DTP, Sicherheit
// CCNA Exam Topics: 2.1, 2.2, 3.3
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

// ── Concept 1: Broadcast-Problem & L2-Segmentierung ──────────

export const CONCEPT_VLAN_BROADCAST_PROBLEM: Concept = {
  id: "vlan-broadcast-problem",
  title: "Broadcast-Domäne — das Problem und die Lösung",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "vlan",
    "broadcast",
    "layer-2",
    "segmentation",
    "performance",
    "security",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1 | ⏱️ 15 Min

---

## 📢 Anker — Großraumbüro-Analogie

Stell dir ein Büro mit 100 Mitarbeitern vor, alle in einem einzigen Raum ohne Trennwände. Wenn jemand laut ruft "Wer hat meinen Locher?", muss jeder innehalten und zuhören — selbst die, die den Locher nicht haben. Das ist eine **Broadcast-Domäne**: Ein Gerät sendet, alle anderen müssen verarbeiten.

VLANs = **Trennwände im Büro**: Verschiedene Abteilungen in verschiedenen Räumen. Der Buchhalter hört nicht mehr, was der Entwickler fragt.

---

## Was ist eine Broadcast-Domäne?

Eine **Broadcast-Domäne** ist der Bereich, in dem ein Layer-2-Broadcast (Ziel-MAC: FF:FF:FF:FF:FF:FF) empfangen wird. In einem flachen Layer-2-Netz ohne VLANs ist das **das gesamte Netzwerk**.

### Beispiel: ARP in einem flachen /16-Netz (65.534 Hosts)

\`\`\`
PC_A sendet ARP Request: "Wer hat 10.0.200.50?"
→ Broadcast an alle 65.534 Geräte im Netz
→ Jedes Gerät muss unterbrechen, Frame verarbeiten, ARP-Tabelle prüfen
→ 65.533 Geräte antworten "Nicht ich"
→ Bandbreitenverschwendung + CPU-Last auf JEDEM Gerät
\`\`\`

### Typische Broadcast-Quellen
- ARP (Adressauflösung)
- DHCP Discover (Client sucht DHCP-Server)
- NetBIOS Name Resolution (Windows-Netzwerke)
- OSPF Hello (aber nur Multicast, nicht Broadcast)
- Spanning Tree BPDUs

---

## Layer-2-Segmentierung mit VLANs

| Maßnahme | Broadcast-Domänen | Ergebnis |
|----------|-------------------|---------|
| 1 Switch, kein VLAN | 1 | Alle 48 Ports = eine riesige Broadcast-Domäne |
| 1 Switch, 3 VLANs | 3 | Broadcasts bleiben im VLAN |
| Router (L3) | ∞ | Jedes Interface = eigene Broadcast-Domäne |

### VLAN-Vorteile

1. **Performance**: Broadcasts betreffen nur das eigene VLAN, nicht alle
2. **Sicherheit**: Buchhaltung und Produktion können nicht auf Layer-2 kommunizieren — kein ARP-Spoofing über VLAN-Grenzen hinweg
3. **Flexibilität**: Logische Gruppen unabhängig von physischer Topologie — Mitarbeiter in OG3 kann im "Buchhaltungs-VLAN" sein
4. **Skalierung**: Statt eines riesigen /16-Netzes mehrere kleine /24-Netze pro VLAN

---

## Cisco-Konfigurations-Überblick

\`\`\`
! VLAN anlegen (Datenbankbefehl)
SW(config)# vlan 10
SW(config-vlan)# name BUCHHALTUNG

SW(config)# vlan 20
SW(config-vlan)# name ENTWICKLUNG

! Status prüfen
SW# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- ------
1    default                          active    Gi0/23, Gi0/24
10   BUCHHALTUNG                      active    Gi0/1, Gi0/2
20   ENTWICKLUNG                      active    Gi0/3, Gi0/4
\`\`\`
  `.trim(),
};

// ── Concept 2: 802.1Q Tagging ─────────────────────────────────

export const CONCEPT_DOT1Q_TAGGING: Concept = {
  id: "dot1q-tagging",
  title: "802.1Q VLAN-Tagging — Frame-Aufbau Byte für Byte",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "vlan",
    "802.1q",
    "tagging",
    "trunk",
    "tpid",
    "tci",
    "native-vlan",
    "frame",
    "layer-2",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1 | ⏱️ 30 Min

---

## 🔬 Anker — Gepäckaufkleber-Analogie

Stell dir einen Flughafen vor: Alle Koffer landen auf demselben Gepäckband (= Trunk-Link). Damit die richtigen Koffer zur richtigen Schalterhalle kommen, bekommt jeder Koffer einen Aufkleber mit der Ziel-ID. Genau das macht 802.1Q: Es klebt einen Aufkleber (Tag) an jeden Ethernet-Frame.

---

## Ethernet-Frame-Aufbau mit 802.1Q-Tag

\`\`\`
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Präambel │ Ziel-MAC │ Quell-MAC │ 802.1Q   │  Typ/    │  Daten   │  FCS  │
│  8 Byte  │  6 Byte  │  6 Byte  │  4 Byte  │  Länge   │ 46-1500  │ 4 Byte│
│          │          │          │ ◄── NEU ──│  2 Byte  │  Byte    │       │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Ohne Tag: Max. Frame-Größe = 1518 Byte
Mit Tag:  Max. Frame-Größe = 1522 Byte (+4 Byte)
\`\`\`

---

## Der 802.1Q-Tag im Detail (4 Byte = 32 Bit)

\`\`\`
 Byte 1+2: TPID        Byte 3+4: TCI
┌──────────────────┬───────┬────┬──────────────────────┐
│       TPID       │  PCP  │DEI │        VID           │
│    0x8100        │ 3 Bit │1Bit│       12 Bit         │
│   (2 Byte)       │       │    │                      │
└──────────────────┴───────┴────┴──────────────────────┘
\`\`\`

| Feld | Bits | Wert | Bedeutung |
|------|------|------|-----------|
| **TPID** | 16 | 0x8100 | Tag Protocol Identifier — kennzeichnet 802.1Q-Tag |
| **PCP** | 3 | 0–7 | Priority Code Point — CoS für QoS (7 = höchste Priorität) |
| **DEI** | 1 | 0/1 | Drop Eligible Indicator — darf bei Überlast verworfen werden |
| **VID** | 12 | 0–4095 | VLAN-ID — 4094 nutzbare VLANs (0 und 4095 reserviert) |

> **Merksatz TPID**: Wenn ein Switch den Wert **0x8100** liest, weiß er: "Das ist ein getaggter Frame — die nächsten 2 Byte sind TCI, nicht Ethertype."

---

## Native VLAN — ungetaggter Traffic auf Trunk-Ports

Das **Native VLAN** ist das einzige VLAN auf einem Trunk-Port, dessen Frames **keinen 802.1Q-Tag** tragen.

**Warum existiert das Native VLAN?**
- Kompatibilität mit älteren Geräten, die kein 802.1Q sprechen
- Management-Traffic von Cisco-Geräten (CDP, VTP, PAgP) läuft auf VLAN 1 (Standard-Native-VLAN)

\`\`\`
! Native VLAN auf Trunk-Port ändern (Empfehlung: nicht VLAN 1 verwenden!)
SW(config-if)# switchport trunk native vlan 999

! Verifizieren
SW# show interfaces GigabitEthernet 0/24 trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi0/24      on               802.1q         trunking      999
\`\`\`

---

> ⚠️ **Achtung-Falle**: **Native VLAN ≠ Default VLAN!**
> - **Default VLAN** = VLAN 1, dem alle Ports nach dem Reset zugewiesen sind
> - **Native VLAN** = das VLAN, das auf Trunk-Ports *ohne* Tag übertragen wird (konfigurierbar)
> - Beide sind standardmäßig VLAN 1 — das führt zur Verwechslung!

> ⚠️ **Achtung-Falle**: **Native VLAN Mismatch** — wenn SW1 Native VLAN 1 und SW2 Native VLAN 999 konfiguriert hat, erscheinen CDP-Fehlermeldungen und Traffic wird im falschen VLAN empfangen. Cisco gibt eine explizite Warnung aus:
\`\`\`
%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/24
\`\`\`

---

## 🖥️ Interaktiver Frame-Vivisektor

Öffne den **VLAN-Simulator** (Button unten), um einen 802.1Q-Frame interaktiv zu zerlegen: Klicke auf jedes Feld für eine Bit-Ebene-Erklärung, schalte den Tag ein und aus.
  `.trim(),
};

// ── Concept 3: Port-Typen ─────────────────────────────────────

export const CONCEPT_VLAN_PORT_TYPEN: Concept = {
  id: "vlan-port-typen",
  title: "Access Port, Trunk Port & Voice VLAN",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["vlan", "access-port", "trunk-port", "voice-vlan", "voip", "layer-2"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1 | ⏱️ 20 Min

---

## Access Port

- Gehört genau **einem** VLAN (dem "Access VLAN")
- Frames werden **ohne 802.1Q-Tag** gesendet und empfangen
- Das Endgerät (PC, Drucker, Server) weiß nichts von VLANs
- Der Switch taggt den Frame intern, wenn er an einen Trunk weitergeleitet wird

\`\`\`
SW(config)# interface GigabitEthernet 0/1
SW(config-if)# switchport mode access
SW(config-if)# switchport access vlan 10
SW(config-if)# spanning-tree portfast          ! optional: schnelle Konvergenz für Endgeräte

! Prüfen
SW# show interfaces GigabitEthernet 0/1 switchport
Administrative Mode: static access
Access Mode VLAN: 10 (BUCHHALTUNG)
\`\`\`

---

## Trunk Port

- Trägt **mehrere VLANs** auf einem einzigen physischen Link
- Frames werden mit **802.1Q-Tag** versehen (außer Native VLAN)
- Typisch: Switch ↔ Switch, Switch ↔ Router, Switch ↔ Server mit VLAN-Aware-NIC

\`\`\`
SW(config)# interface GigabitEthernet 0/24
SW(config-if)# switchport mode trunk
SW(config-if)# switchport trunk encapsulation dot1q   ! nur auf älteren Switches nötig
SW(config-if)# switchport trunk native vlan 999
SW(config-if)# switchport trunk allowed vlan 10,20,30

! Prüfen
SW# show interfaces GigabitEthernet 0/24 trunk
Port        Mode    Encap   Status   Native vlan
Gi0/24      on      802.1q  trunking 999

Port        Vlans allowed on trunk
Gi0/24      10,20,30

Port        Vlans allowed and active in management domain
Gi0/24      10,20,30
\`\`\`

> ⚠️ **Achtung-Falle**: Standardmäßig erlaubt ein Trunk-Port **alle VLANs (1–4094)**. Aus Sicherheitsgründen sollte immer explizit mit \`switchport trunk allowed vlan\` eingeschränkt werden — nur die tatsächlich benötigten VLANs erlauben!

---

## Voice VLAN (Sonderfall)

Ein Cisco IP-Telefon hat einen eingebauten Mini-Switch mit **2 Ports**:
- Port 1: Verbindung zum Access-Switch
- Port 2: Verbindung zum PC dahinter

Der Switch-Port muss **beide VLANs** gleichzeitig bedienen:
- **Data VLAN** (Access VLAN): für den PC hinter dem Telefon → ungetaggt
- **Voice VLAN**: für VoIP-Traffic → mit **CoS 5** getaggt (PCP-Bit im 802.1Q-Tag)

\`\`\`
SW(config)# interface GigabitEthernet 0/5
SW(config-if)# switchport mode access
SW(config-if)# switchport access vlan 10          ! Data VLAN für PC
SW(config-if)# switchport voice vlan 100          ! Voice VLAN für IP-Telefon
SW(config-if)# mls qos trust device cisco-phone   ! QoS: CoS-Markierung vom Telefon vertrauen
SW(config-if)# spanning-tree portfast

! Prüfen
SW# show interfaces GigabitEthernet 0/5 switchport
Administrative Mode: static access
Access Mode VLAN: 10 (DATA)
Voice VLAN: 100 (VOICE)
\`\`\`

> Der Port arbeitet quasi wie ein "mini-Trunk" für genau 2 VLANs — aber er ist kein Trunk-Port!
  `.trim(),
};

// ── Concept 4: VLAN-Typen ─────────────────────────────────────

export const CONCEPT_VLAN_TYPEN: Concept = {
  id: "vlan-typen",
  title: "VLAN-Typen — Default, Data, Voice, Management, Native",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "vlan",
    "vlan-types",
    "management-vlan",
    "native-vlan",
    "data-vlan",
    "layer-2",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1 | ⏱️ 15 Min

---

## Überblick der VLAN-Typen

| VLAN-Typ | Standard VLAN | Zweck | Empfehlung |
|----------|--------------|-------|------------|
| **Default VLAN** | VLAN 1 | Alle Ports nach Reset | Nicht für Daten nutzen |
| **Data VLAN** | beliebig | Normaler User-Traffic | Getrennt nach Abteilung |
| **Voice VLAN** | beliebig | VoIP-Traffic | Separates VLAN, CoS 5 |
| **Management VLAN** | empfohlen: nicht VLAN 1 | SSH/Telnet/SNMP zum Switch | SVI mit IP-Adresse |
| **Native VLAN** | VLAN 1 (Standard) | Ungetaggter Trunk-Traffic | Auf unbenutzte VLAN-ID setzen |

---

## Default VLAN (VLAN 1)

- **Nicht löschbar, nicht umbenennbar** auf Cisco-Switches
- Alle Ports sind nach einem Reset in VLAN 1
- CDP, VTP, PAgP, DTP-Protokoll-Traffic läuft über VLAN 1

\`\`\`
SW# show vlan brief
VLAN Name         Status    Ports
---- ------------ --------- ------
1    default      active    [alle nicht zugewiesenen Ports]
\`\`\`

> ⚠️ **Achtung-Falle**: VLAN 1 sollte **nicht** für User-Daten genutzt werden — es ist zu stark exponiert (Management-Protokolle, Native-VLAN-Standard). Best Practice: VLAN 1 leer lassen, alle Ports in dedizierte VLANs verschieben.

---

## Management VLAN — SVI konfigurieren

Das Management VLAN bekommt eine **Switched Virtual Interface (SVI)** mit einer IP-Adresse. Über diese IP ist der Switch via SSH/Telnet/SNMP erreichbar.

\`\`\`
! VLAN 99 als Management VLAN
SW(config)# vlan 99
SW(config-vlan)# name MANAGEMENT

! SVI erstellen
SW(config)# interface vlan 99
SW(config-if)# ip address 192.168.99.10 255.255.255.0
SW(config-if)# no shutdown

! Standard-Gateway für Management-Traffic
SW(config)# ip default-gateway 192.168.99.1

! Trunk-Port muss VLAN 99 auch tragen!
SW(config)# interface GigabitEthernet 0/24
SW(config-if)# switchport trunk allowed vlan add 99
\`\`\`

---

## Reservierte VLAN-Ranges

| Range | VLANs | Verwendung |
|-------|-------|-----------|
| Normale VLANs | 1–1005 | Standard Ethernet VLANs |
| Extended VLANs | 1006–4094 | VTP v3 / Transparent Mode erforderlich |
| Reserviert | 1006–1009 | FDDI/Token Ring, nicht für Ethernet |
| Reserviert | 4095 | IEEE-reserviert, nicht nutzbar |

> **Extended VLANs (1006–4094)** werden in der CCNA-Prüfung abgefragt. Sie sind nur im VTP Transparent Mode oder VTP v3 nutzbar.
  `.trim(),
};

// ── Concept 5: Inter-VLAN Routing ─────────────────────────────

export const CONCEPT_INTER_VLAN_ROUTING: Concept = {
  id: "inter-vlan-routing",
  title: "Inter-VLAN Routing — Router-on-a-Stick vs. Layer-3-Switch",
  appliesTo: ["ccna"],
  tags: [
    "vlan",
    "inter-vlan",
    "routing",
    "router-on-a-stick",
    "svi",
    "l3-switch",
    "subinterface",
    "layer-3",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 3.3 | ⏱️ 30 Min

---

## Das Problem: VLANs sind Layer-2-Inseln

Geräte in VLAN 10 können **nicht direkt** mit Geräten in VLAN 20 kommunizieren — dafür ist ein Layer-3-Gerät (Router oder L3-Switch) erforderlich.

---

## Methode 1: Router-on-a-Stick (ROAS)

Ein einziger Trunk-Link zwischen Switch und Router. Der Router hat **logische Subinterfaces** pro VLAN.

\`\`\`
Topologie:
PC_A (VLAN 10) ─── SW1 ─── [Trunk Gi0/24] ─── Router Gi0/0
PC_B (VLAN 20) ─── SW1 ─/

Router-Konfiguration:
Router(config)# interface GigabitEthernet 0/0
Router(config-if)# no ip address
Router(config-if)# no shutdown

Router(config)# interface GigabitEthernet 0/0.10
Router(config-subif)# encapsulation dot1q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0

Router(config)# interface GigabitEthernet 0/0.20
Router(config-subif)# encapsulation dot1q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0

! Native VLAN auf Subinterface (optional, für ungetaggten Traffic)
Router(config)# interface GigabitEthernet 0/0.999
Router(config-subif)# encapsulation dot1q 999 native

Switch-Konfiguration (Trunk-Port zum Router):
SW(config)# interface GigabitEthernet 0/24
SW(config-if)# switchport mode trunk
SW(config-if)# switchport trunk allowed vlan 10,20,999
\`\`\`

**Nachteil ROAS**: Der Trunk-Link ist ein Engpass ("Stau auf der Einbahnstraße"). Bei 48-Port-Switch mit 20 VLANs läuft alles über einen einzigen physischen Link.

---

## Methode 2: Layer-3-Switch mit SVIs

Ein Layer-3-Switch (z.B. Cisco Catalyst 3650/3850/9300) hat **integrierte Routing-Engine**. Kein Router nötig.

\`\`\`
L3-Switch-Konfiguration:
! IP-Routing aktivieren (standardmäßig deaktiviert!)
SW(config)# ip routing

! SVI per VLAN
SW(config)# interface Vlan 10
SW(config-if)# ip address 192.168.10.1 255.255.255.0
SW(config-if)# no shutdown

SW(config)# interface Vlan 20
SW(config-if)# ip address 192.168.20.1 255.255.255.0
SW(config-if)# no shutdown

! Verifizieren
SW# show ip route
C    192.168.10.0/24 is directly connected, Vlan10
C    192.168.20.0/24 is directly connected, Vlan20
\`\`\`

---

## Vergleich ROAS vs. L3-Switch SVI

| Kriterium | Router-on-a-Stick | L3-Switch SVI |
|-----------|------------------|---------------|
| Kosten | Günstig (Router ggf. vorhanden) | L3-Switch teurer als L2 |
| Performance | Trunk-Link Engpass | Wire-Speed in Hardware |
| Skalierung | Schlecht (>10 VLANs unpraktisch) | Sehr gut (bis 1000 VLANs) |
| Konfigurationsaufwand | Mittel | Gering |
| Typischer Einsatz | Lab, kleine Umgebungen | Enterprise, Datacenter |
| \`ip routing\` nötig? | Nein (Router hat es immer) | **Ja — vergisst man oft!** |

> ⚠️ **Achtung-Falle**: Auf einem Layer-3-Switch muss **\`ip routing\`** explizit aktiviert werden! Ohne diesen Befehl werden SVIs erstellt, aber es findet kein Routing statt. Häufigster Fehler im Lab!

---

## Paket-Pfad: PC_A (VLAN 10) → PC_B (VLAN 20)

\`\`\`
1. PC_A sendet Paket (Ziel: 192.168.20.50)
   → Default-Gateway: 192.168.10.1 (SVI Vlan10 oder Router-Subinterface)

2. Switch/Router empfängt Paket auf Interface für VLAN 10
   → Routing-Tabelle: 192.168.20.0/24 → via Vlan20

3. Paket wird auf Interface für VLAN 20 weitergeleitet
   → ARP für 192.168.20.50 (falls noch nicht bekannt)

4. PC_B empfängt Paket
\`\`\`
  `.trim(),
};

// ── Concept 6: VTP & DTP ──────────────────────────────────────

export const CONCEPT_VTP_DTP: Concept = {
  id: "vtp-dtp",
  title: "VTP & DTP — Automatisierung mit Risiken",
  appliesTo: ["ccna"],
  tags: [
    "vlan",
    "vtp",
    "dtp",
    "vlan-trunking-protocol",
    "dynamic-trunking",
    "security",
    "layer-2",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 2.1 | ⏱️ 15 Min

---

## VTP — VLAN Trunking Protocol

VTP ist ein **Cisco-proprietäres Protokoll**, das VLAN-Informationen automatisch zwischen Switches synchronisiert — damit VLANs nicht manuell auf jedem Switch angelegt werden müssen.

### VTP-Modi

| Modus | VLAN erstellen | VLAN synchronisieren | Empfehlung |
|-------|---------------|---------------------|------------|
| **Server** | Ja | Ja (sendet + empfängt) | Nur 1-2 Switches (Core) |
| **Client** | Nein | Ja (empfängt) | Distribution/Access |
| **Transparent** | Ja (lokal) | Nein (leitet durch) | Wenn VTP nicht erwünscht |
| **Off** (VTP v3) | Ja (lokal) | Nein | Sicherste Option |

\`\`\`
SW(config)# vtp mode server
SW(config)# vtp domain FIRMA_GmbH
SW(config)# vtp password Geheim123
SW(config)# vtp version 2

SW# show vtp status
VTP Version capable             : 1 to 3
VTP version running             : 2
VTP Domain Name                 : FIRMA_GmbH
VTP Pruning Mode                : Disabled
VTP Traps Generation            : Disabled
Device ID                       : 0023.34ca.c200
Configuration last modified by 0.0.0.0 at 3-1-93 00:00:00
\`\`\`

> ⚠️ **KRITISCHE Achtung-Falle**: VTP kann ein ganzes Netzwerk zerstören! Wenn ein neuer Switch mit einer **höheren VTP-Revision** (auch wenn er leer ist) an einen VTP-Server angeschlossen wird, überschreibt er alle VLAN-Datenbanken. **Alle VLANs können in Sekunden gelöscht werden.** Best Practice: VTP Transparent Mode oder VTP v3 mit Passwort.

---

## DTP — Dynamic Trunking Protocol

DTP ist ein weiteres **Cisco-proprietäres Protokoll**, das Ports automatisch als Trunk oder Access konfiguriert — durch Aushandlung mit dem Gegenstück.

### DTP-Modi

| Modus | Verhalten | Ergebnis bei Gegenüber "desirable" | Ergebnis bei Gegenüber "access" |
|-------|-----------|-----------------------------------|--------------------------------|
| \`dynamic desirable\` | Aktiv verhandeln | Trunk ✅ | Access ✅ |
| \`dynamic auto\` | Passiv warten | Trunk ✅ | Access ✅ |
| \`trunk\` | Immer Trunk | Trunk ✅ | Trunk ✅ (Mismatch!) |
| \`access\` | Immer Access | Access ✅ | Access ✅ |
| \`nonegotiate\` | Kein DTP | – | – |

> ⚠️ **Achtung-Falle**: Der Standard-Modus auf vielen Cisco-Switches ist **\`dynamic auto\`** — der Port wird zum Trunk, sobald die Gegenseite Trunk möchte. Das ist ein **Sicherheitsrisiko (VLAN Hopping)**!

**Empfehlung**: DTP grundsätzlich deaktivieren:
\`\`\`
SW(config-if)# switchport mode access          ! Explizit Access setzen
SW(config-if)# switchport nonegotiate          ! DTP senden/empfangen deaktivieren
! ODER für Trunk-Ports:
SW(config-if)# switchport mode trunk
SW(config-if)# switchport nonegotiate
\`\`\`
  `.trim(),
};

// ── Concept 7: VLAN Sicherheit ────────────────────────────────

export const CONCEPT_VLAN_SICHERHEIT: Concept = {
  id: "vlan-sicherheit",
  title: "VLAN Hopping & Sicherheitsmaßnahmen",
  appliesTo: ["ccna"],
  tags: [
    "vlan",
    "security",
    "vlan-hopping",
    "double-tagging",
    "native-vlan",
    "dtp",
    "layer-2",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 2.1 | ⏱️ 20 Min

---

## Angriff 1: VLAN Hopping via DTP

**Voraussetzung**: Ziel-Switch hat einen Port im \`dynamic auto\` oder \`dynamic desirable\` Modus.

\`\`\`
Schritt 1: Angreifer sendet DTP-Pakete vom eigenen Laptop
Schritt 2: Ziel-Switch-Port wechselt in Trunk-Modus
Schritt 3: Angreifer kann nun getaggte Frames für ALLE VLANs senden
           → Zugang zu VLAN 20 (Buchhaltung), VLAN 30 (Server) etc.
\`\`\`

**Gegenmaßnahme**:
\`\`\`
! Alle Access-Ports explizit konfigurieren
SW(config-if)# switchport mode access
SW(config-if)# switchport nonegotiate
\`\`\`

---

## Angriff 2: Double-Tagging (VLAN Hopping via Native VLAN)

Dieser Angriff funktioniert **auch ohne DTP** und nutzt das Native VLAN aus.

\`\`\`
Voraussetzung:
- Angreifer ist in VLAN 1 (= Native VLAN)
- Ziel-Gerät ist in VLAN 20

Schritt 1: Angreifer erstellt Frame mit DOPPELTEM Tag:
           [Tag VLAN 1][Tag VLAN 20][Daten]

Schritt 2: SW1 (erster Switch) empfängt Frame am Access-Port (VLAN 1)
           → Entfernt äußeren Tag (VLAN 1 = Native VLAN, wird entfernt)
           → Frame mit [Tag VLAN 20] wird auf Trunk weitergeleitet

Schritt 3: SW2 (zweiter Switch) sieht [Tag VLAN 20]
           → Leitet Frame an VLAN 20-Port weiter
           → Angreifer hat VLAN 20 erreicht — OHNE Routing!

⚠️ Dieser Angriff ist UNIDIREKTIONAL — Antwortframes kommen nicht zurück
   (es sei denn, Angreifer hat auch Zugang zu VLAN 20).
\`\`\`

**Gegenmaßnahmen gegen Double-Tagging**:
\`\`\`
! 1. Native VLAN auf ein dediziertes, unbenutztes VLAN setzen
SW(config-if)# switchport trunk native vlan 999
! VLAN 999 hat keine Hosts → kein Angreifer kann dort sitzen

! 2. Auf Trunk-Ports alle Frames taggen (inkl. Native VLAN)
SW(config)# vlan dot1q tag native

! 3. Angreifer-Port in ein eigenes VLAN isolieren
SW(config-if)# switchport access vlan 100  ! VLAN 100 = "Gäste" ohne Zugang zu Servern
\`\`\`

---

## Zusammenfassung: Hardening-Checkliste für Switches

\`\`\`
! 1. Native VLAN ändern (weg von VLAN 1)
switchport trunk native vlan 999

! 2. Trunk-Ports auf allowed VLANs beschränken
switchport trunk allowed vlan 10,20,30,99,999

! 3. Ungenutzte Ports deaktivieren und in "Quarantäne-VLAN" schieben
interface range GigabitEthernet 0/10-23
  switchport mode access
  switchport access vlan 999    ! unbenutztes "schwarzes Loch" VLAN
  shutdown

! 4. DTP auf allen Ports deaktivieren
switchport nonegotiate

! 5. VLAN 1 von Trunk-Ports entfernen
switchport trunk allowed vlan remove 1

! 6. Port-Security auf Access-Ports
switchport port-security
switchport port-security maximum 1
switchport port-security violation restrict
\`\`\`
  `.trim(),
};

// ── Concept 8: VLAN Advanced Guide ───────────────────────────

export const CONCEPT_VLAN_ADVANCED_GUIDE: Concept = {
  id: "vlan-advanced-guide",
  title: "Lernguide: VLANs Advanced — Anker bis Selbsttest",
  appliesTo: ["ccna"],
  tags: [
    "vlan",
    "guide",
    "802.1q",
    "trunk",
    "inter-vlan",
    "security",
    "layer-2",
  ],
  content: `
## Lernziele

Nach diesem Modul kannst du:
- 802.1Q-Frame-Aufbau erklären (TPID, TCI, PCP, DEI, VID)
- Access- und Trunk-Ports korrekt konfigurieren und verifizieren
- Inter-VLAN-Routing mit Router-on-a-Stick und L3-Switch-SVI konfigurieren
- VLAN Hopping (Double-Tagging) erklären und Gegenmaßnahmen nennen
- VTP-Risiken beschreiben und Best-Practice-Empfehlung geben
- DTP deaktivieren und erklären, warum das sicherer ist

---

## Praxis-Szenario: Schulnetz "Albert-Einstein-Gesamtschule"

**Ausgangslage**: 800 Schüler, 60 Lehrer, 1 Admin — alle in einem flachen Netz (192.168.1.0/24). ARP-Floods, Broadcasts verlangsamen alle Geräte.

**Zielstruktur**:

| VLAN | ID | Subnetz | Hosts |
|------|----|---------|----|
| SCHUELER | 10 | 192.168.10.0/23 | ~600 |
| LEHRER | 20 | 192.168.20.0/25 | ~80 |
| VERWALTUNG | 30 | 192.168.30.0/27 | ~20 |
| MANAGEMENT | 99 | 192.168.99.0/28 | Switches |
| NATIVE | 999 | (kein Netz) | Trunk-Isolation |

**Inter-VLAN-Routing**: Cisco Catalyst 3650 (L3-Switch) im Serverraum, SVI pro VLAN.

\`\`\`
! Komplette Konfiguration L3-Switch
ip routing

vlan 10
 name SCHUELER
vlan 20
 name LEHRER
vlan 30
 name VERWALTUNG
vlan 99
 name MANAGEMENT
vlan 999
 name NATIVE_ISOLATION

interface Vlan10
 ip address 192.168.10.1 255.255.254.0
 no shutdown

interface Vlan20
 ip address 192.168.20.1 255.255.255.128
 no shutdown

interface Vlan30
 ip address 192.168.30.1 255.255.255.224
 no shutdown

interface Vlan99
 ip address 192.168.99.1 255.255.255.240
 no shutdown

! Uplink zum Access-Switch
interface GigabitEthernet 1/0/24
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,30,99,999
 switchport nonegotiate
\`\`\`

---

## Achtung-Fallen Zusammenfassung

> ⚠️ **Native VLAN ≠ Default VLAN** — VLAN 1 ist beides (Standard), aber sie haben verschiedene Bedeutungen und sollten getrennt konfiguriert werden.

> ⚠️ **\`ip routing\` vergessen** — Ohne diesen Befehl auf dem L3-Switch findet kein Inter-VLAN-Routing statt, SVIs sind trotzdem konfigurierbar.

> ⚠️ **Trunk erlaubt alle VLANs** — Standard-Trunk trägt VLANs 1–4094. Immer mit \`switchport trunk allowed vlan\` einschränken.

> ⚠️ **VTP ohne Passwort + höhere Revision = Datenverlust** — Neuer Switch im VTP-Server-Modus mit Revision > aktueller überschreibt alle VLAN-Datenbanken.

---

## Verständnisfragen (Selbsttest)

1. Ein Frame kommt auf einem Trunk-Port ohne 802.1Q-Tag an. In welchem VLAN wird er behandelt?
2. Du konfigurierst \`ip routing\` und SVIs auf einem L3-Switch, aber Hosts in VLAN 10 können VLAN 20 immer noch nicht erreichen. Was prüfst du als erstes?
3. Warum reicht es nicht, VLAN 1 einfach zu deaktivieren, um Double-Tagging-Angriffe zu verhindern?
4. Was ist der Unterschied zwischen VTP Server und VTP Transparent?
5. Du führst \`show interfaces trunk\` aus und siehst VLAN 10 unter "VLANs allowed on trunk" aber nicht unter "VLANs allowed and active in management domain". Was bedeutet das?

*(Antwort Frage 5: VLAN 10 existiert nicht in der VLAN-Datenbank des Switches — es wurde nicht erstellt)*
  `.trim(),
};

// ── Concept 9: VLAN-Simulator ─────────────────────────────────

export const CONCEPT_VLAN_SIMULATOR: Concept = {
  id: "vlan-simulator",
  title: "Interaktiver VLAN-Simulator — Frame-Walk & Konfigurationsübung",
  appliesTo: ["ccna"],
  tags: ["vlan", "simulator", "interactive", "802.1q", "trunk", "frame-walk"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1 | ⏱️ 20 Min

---

## Was der Simulator zeigt

Der VLAN-Simulator (Button unten) hat 5 Tabs:

| Tab | Funktion |
|-----|---------|
| **Topologie** | Switch + PCs, Konnektivitätstest per Klick |
| **VLAN-Konfig** | Access- und Trunk-Ports konfigurieren |
| **Trunk-Konfig** | Native VLAN, Allowed VLANs anpassen |
| **802.1Q Frame** | Tag-Felder interaktiv — TPID / PCP / DEI / VID |
| **Packet-Walk** | Schritt-für-Schritt durch Trunk: Tag hinzufügen → übertragen → entfernen |

---

## Empfohlene Übungsreihenfolge

1. **Tab Topologie** → Starte ohne VLAN-Konfiguration: Was passiert beim Ping zwischen VLANs?
2. **Tab VLAN-Konfig** → Port 1+2 auf VLAN 10, Port 3+4 auf VLAN 20
3. **Tab Trunk-Konfig** → Native VLAN 999, Allowed VLANs 10,20
4. **Tab 802.1Q Frame** → Klicke auf jedes Feld (TPID, PCP, DEI, VID) für die Bit-Erklärung
5. **Tab Packet-Walk** → Klicke "Senden" und beobachte den Frame Schritt für Schritt

---

## Lernkontrolle nach dem Simulator

- Welches VLAN bekommt ein ungetaggter Frame auf dem Trunk-Port?
- Was ändert sich im Frame-Header wenn der Switch den Frame auf den Trunk weiterleitet?
- Warum kann PC in VLAN 10 nicht direkt mit PC in VLAN 20 kommunizieren?
- Was bedeutet der Wert 0x8100 im Frame-Header?
  `.trim(),
};

// ── Concept 10: Lab-Brücke ────────────────────────────────────

export const CONCEPT_VLAN_LAB_BRUECKE: Concept = {
  id: "vlan-lab-bruecke",
  title: "Lab-Brücke: Vollständige VLAN-Konfiguration von Null",
  appliesTo: ["ccna"],
  tags: [
    "vlan",
    "lab",
    "trunk",
    "voice-vlan",
    "inter-vlan",
    "roas",
    "svi",
    "security",
    "layer-2",
    "layer-3",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1, 3.3 | ⏱️ 45 Min

---

> 💡 **Cisco Packet Tracer**: Alle drei Lab-Szenarien (12.1, 12.2, 12.3) können kostenlos in Cisco Packet Tracer nachgebaut werden. Download unter [netacad.com](https://www.netacad.com) (Registrierung erforderlich, kostenlos). Empfehlung: Baue erst die Topologie auf, konfiguriere dann Schritt für Schritt — und mache am Ende jeden Schritt bewusst kaputt, um die Fehlerbehebung zu üben.

---

## Kapitelabschluss-Lab — Bürogebäude "NetzTech GmbH"

Dieses Lab verbindet alle Konzepte aus dem Modul in einer vollständigen, realen Konfiguration.

**Topologie**: 2 Switches (SW1 = Distribution, SW2 = Access) + 1 Router (R1 = ROAS)

**Anforderungen**:
- 3 Abteilungs-VLANs + Voice VLAN + Management VLAN + Native VLAN
- Inter-VLAN-Routing über Router-on-a-Stick
- 1 IP-Telefon-Arbeitsplatz (Voice VLAN)
- Management-Zugang zum Switch (SSH via SVI)
- Sicherheits-Härtung: Nicht genutzte Ports abschalten, DTP deaktivieren

**VLAN-Plan**:

| VLAN-ID | Name | Subnetz | Verwendung |
|---------|------|---------|-----------|
| 10 | SALES | 192.168.10.0/24 | Vertrieb |
| 20 | IT | 192.168.20.0/24 | IT-Abteilung |
| 30 | MGMT-DEPT | 192.168.30.0/24 | Management-Abteilung |
| 100 | VOICE | 192.168.100.0/24 | IP-Telefonie |
| 99 | MANAGEMENT | 192.168.99.0/28 | Switch-Management (SVI) |
| 999 | NATIVE | — | Native VLAN (keine Hosts) |

---

## Schritt 1 — VLANs anlegen (beide Switches)

\`\`\`
SW(config)# vlan 10
SW(config-vlan)# name SALES
SW(config)# vlan 20
SW(config-vlan)# name IT
SW(config)# vlan 30
SW(config-vlan)# name MGMT-DEPT
SW(config)# vlan 100
SW(config-vlan)# name VOICE
SW(config)# vlan 99
SW(config-vlan)# name MANAGEMENT
SW(config)# vlan 999
SW(config-vlan)# name NATIVE

SW# show vlan brief    ! Prüfen: alle 6 VLANs vorhanden
\`\`\`

---

## Schritt 2 — Access-Ports zuweisen (SW2)

\`\`\`
! PC Sales (Gi0/1 → VLAN 10)
SW2(config)# interface GigabitEthernet 0/1
SW2(config-if)# switchport mode access
SW2(config-if)# switchport access vlan 10
SW2(config-if)# switchport nonegotiate
SW2(config-if)# spanning-tree portfast

! PC IT (Gi0/2 → VLAN 20)
SW2(config)# interface GigabitEthernet 0/2
SW2(config-if)# switchport mode access
SW2(config-if)# switchport access vlan 20
SW2(config-if)# switchport nonegotiate
SW2(config-if)# spanning-tree portfast

! PC MGMT-Dept (Gi0/3 → VLAN 30)
SW2(config)# interface GigabitEthernet 0/3
SW2(config-if)# switchport mode access
SW2(config-if)# switchport access vlan 30
SW2(config-if)# switchport nonegotiate
SW2(config-if)# spanning-tree portfast
\`\`\`

---

## Schritt 3 — Voice VLAN konfigurieren (SW2 Gi0/5)

\`\`\`
! IP-Telefon + PC dahinter
SW2(config)# interface GigabitEthernet 0/5
SW2(config-if)# switchport mode access
SW2(config-if)# switchport access vlan 10          ! Data VLAN für PC hinter Telefon
SW2(config-if)# switchport voice vlan 100          ! Voice VLAN für IP-Phone
SW2(config-if)# mls qos trust device cisco-phone   ! CoS-Markierung vom Cisco-Phone vertrauen
SW2(config-if)# spanning-tree portfast
SW2(config-if)# switchport nonegotiate

SW2# show interfaces GigabitEthernet 0/5 switchport | include Voice
! Erwartetes Ergebnis: Voice VLAN: 100 (VOICE)
\`\`\`

---

## Schritt 4 — Trunk-Link SW1 ↔ SW2

\`\`\`
! Auf beiden Switches (Gi0/24)
SW(config)# interface GigabitEthernet 0/24
SW(config-if)# switchport mode trunk
SW(config-if)# switchport trunk native vlan 999
SW(config-if)# switchport trunk allowed vlan 10,20,30,99,100,999
SW(config-if)# switchport nonegotiate

SW# show interfaces GigabitEthernet 0/24 trunk
! Prüfen: Status = trunking, Native = 999, Allowed VLANs korrekt
\`\`\`

---

## Schritt 5 — Management SVI (SW1)

\`\`\`
! SVI für SSH-Zugang
SW1(config)# interface Vlan 99
SW1(config-if)# ip address 192.168.99.10 255.255.255.240
SW1(config-if)# no shutdown

! Default-Gateway
SW1(config)# ip default-gateway 192.168.99.1

! SSH aktivieren
SW1(config)# ip domain-name netztech.local
SW1(config)# crypto key generate rsa modulus 2048
SW1(config)# ip ssh version 2
SW1(config)# line vty 0 4
SW1(config-line)# transport input ssh
SW1(config-line)# login local
\`\`\`

---

## Schritt 6 — Router-on-a-Stick (R1)

\`\`\`
! Trunk-Port zum Switch (Gi0/24 → R1 Gi0/0)
SW1(config)# interface GigabitEthernet 0/24
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 999
SW1(config-if)# switchport trunk allowed vlan 10,20,30,99,100,999
SW1(config-if)# switchport nonegotiate

! Router-Konfiguration
R1(config)# interface GigabitEthernet 0/0
R1(config-if)# no ip address
R1(config-if)# no shutdown

R1(config)# interface GigabitEthernet 0/0.10
R1(config-subif)# encapsulation dot1q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0

R1(config)# interface GigabitEthernet 0/0.20
R1(config-subif)# encapsulation dot1q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0

R1(config)# interface GigabitEthernet 0/0.30
R1(config-subif)# encapsulation dot1q 30
R1(config-subif)# ip address 192.168.30.1 255.255.255.0

R1(config)# interface GigabitEthernet 0/0.99
R1(config-subif)# encapsulation dot1q 99
R1(config-subif)# ip address 192.168.99.1 255.255.255.240

R1(config)# interface GigabitEthernet 0/0.100
R1(config-subif)# encapsulation dot1q 100
R1(config-subif)# ip address 192.168.100.1 255.255.255.0
\`\`\`

---

## Schritt 7 — Sicherheits-Härtung

\`\`\`
! Ungenutzte Ports deaktivieren und in "Quarantäne-VLAN" schieben
SW(config)# interface range GigabitEthernet 0/10-23
SW(config-if-range)# switchport mode access
SW(config-if-range)# switchport access vlan 999
SW(config-if-range)# switchport nonegotiate
SW(config-if-range)# shutdown

! VLAN 1 vom Trunk entfernen
SW(config)# interface GigabitEthernet 0/24
SW(config-if)# switchport trunk allowed vlan remove 1
\`\`\`

---

## Schritt 8 — Verifikation

\`\`\`
! Gesamtüberblick
SW# show vlan brief
SW# show interfaces trunk
SW# show interfaces GigabitEthernet 0/5 switchport

! Routing
R1# show ip route
R1# ping 192.168.20.1 source 192.168.10.1

! Konnektivität PC-Ebene (vom Simulator oder realen Lab)
PC-SALES# ping 192.168.20.X    ! → soll funktionieren (via Router)
PC-SALES# ping 192.168.10.X    ! → direktes VLAN (Layer 2)
\`\`\`

---

## Häufige Fehler in diesem Lab

> ⚠️ **Trunk erlaubt alle VLANs** — Standard-Trunk trägt VLANs 1–4094. Immer explizit einschränken.

> ⚠️ **Native VLAN Mismatch** — SW1 und SW2 müssen dasselbe Native VLAN haben. CDP meldet Mismatch.

> ⚠️ **Voice VLAN + CoS** — Ohne \`mls qos trust device cisco-phone\` wird QoS-Markierung des Telefons ignoriert.

> ⚠️ **SVI bleibt down** — VLAN 99 muss existieren (vlan 99 anlegen) UND mindestens ein Port im VLAN aktiv sein (der Trunk-Port zählt).

---

## Übungsaufgabe (ROAS-Szenario)

**Füge VLAN 40 (GÄSTE, 192.168.40.0/24) zur NetzTech-GmbH-Konfiguration hinzu:**

1. Welche Befehle brauchst du auf **SW1** und **SW2**? (VLAN anlegen, Trunk erlauben)
2. Welches Subinterface musst du auf **R1** hinzufügen?
3. Wie stellst du sicher, dass GÄSTE-Hosts das Internet erreichen können, aber VLAN 10/20/30 **nicht** direkt erreichbar ist?
4. Teste mit einem Ping von einem Gäste-Host zu 192.168.10.10 (SALES) — was erwartest du?

*Hinweis: Auf dem Router kannst du eine Standard-ACL auf das ROAS-Subinterface anwenden, um VLAN-übergreifenden Traffic von VLAN 40 zu blockieren.*

---

## Abschluss-Reflexion

> **"Wenn du diese drei Szenarien (Lab 12.1 ROAS, Lab 12.2 L3-Switch, Lab 12.3 WLAN-VLAN) aufgebaut und je einmal bewusst kaputtgemacht hast — ip routing entfernt, Native VLAN falsch gesetzt, VLAN aus dem Trunk entfernt — dann hast du VLANs wirklich verstanden."**

Das Kapitelabschluss-Lab markiert den Übergang von Wissen zu Können. Ab jetzt bist du bereit für:
- **STP Deep-Dive**: Was passiert, wenn du zwischen SW1 und SW2 einen zweiten Trunk-Link ziehst?
- **OSPF Multi-Area**: Deine VLANs brauchen ein Routing-Protokoll, sobald mehrere Standorte verbunden werden.
- **Wireless-Modul**: Wie verbindest du SSID "CORP-DATA" mit deinem VLAN 10?
  `.trim(),
};

// ── Concept 11: Lab 12.2 — Multi-Switch mit L3-Switch ────────

export const CONCEPT_VLAN_LAB_MULTI_SWITCH: Concept = {
  id: "vlan-lab-multi-switch",
  title: "Lab 12.2 — Multi-Switch mit L3-Switch und SVIs",
  appliesTo: ["ccna"],
  tags: [
    "vlan",
    "lab",
    "l3-switch",
    "svi",
    "ip-routing",
    "inter-vlan",
    "trunk",
    "multi-switch",
    "layer-3",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 3.3 | ⏱️ 45 Min

---

> 💡 **Cisco Packet Tracer**: Dieses Lab kann kostenlos in Cisco Packet Tracer nachgebaut werden. Download unter [netacad.com](https://www.netacad.com) (Registrierung erforderlich, kostenlos).

---

## Lernziel

In Lab 12.1 hast du Inter-VLAN-Routing mit einem separaten Router (ROAS) gelernt.
In diesem Lab routet der **Layer-3-Switch selbst** — kein externer Router nötig.
Das ist der häufigste Aufbau in modernen Enterprise-Netzwerken.

---

## Topologie

\`\`\`
PC1 (VLAN 10) ─── Gi0/1 ┐
PC2 (VLAN 20) ─── Gi0/2 ├── SW1 (Access-Layer) ── Gi0/24 Trunk ── Gi0/24 SW2 (L3-Switch)
PC3 (VLAN 20) ─── Gi0/3 ┘                                              │
                                                                  ip routing aktiv
                                                                  SVI Vlan10 (GW für VLAN 10)
                                                                  SVI Vlan20 (GW für VLAN 20)
                                                                  SVI Vlan99 (Management)
\`\`\`

---

## IP-Plan

| VLAN-ID | Name | Subnetz | Switch-Gateway (SVI) | Hosts |
|---------|------|---------|---------------------|-------|
| 10 | DATA | 192.168.10.0/24 | 192.168.10.1 (SW2) | PC1 → .10 |
| 20 | SERVERS | 192.168.20.0/24 | 192.168.20.1 (SW2) | PC2 → .10, PC3 → .11 |
| 99 | MANAGEMENT | 192.168.99.0/28 | 192.168.99.1 (SW2) | SW1-SVI → .10 |
| 999 | NATIVE | — | — | kein Host |

---

## Schritt 1 — VLANs anlegen (auf beiden Switches)

\`\`\`
SW(config)# vlan 10
SW(config-vlan)# name DATA
SW(config)# vlan 20
SW(config-vlan)# name SERVERS
SW(config)# vlan 99
SW(config-vlan)# name MANAGEMENT
SW(config)# vlan 999
SW(config-vlan)# name NATIVE

SW# show vlan brief
! Erwartung: alle 4 VLANs active, 999 ohne zugewiesene Ports
\`\`\`

---

## Schritt 2 — Access-Ports auf SW1

\`\`\`
! PC1 → VLAN 10
SW1(config)# interface GigabitEthernet 0/1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport nonegotiate
SW1(config-if)# spanning-tree portfast

! PC2 → VLAN 20
SW1(config)# interface GigabitEthernet 0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 20
SW1(config-if)# switchport nonegotiate
SW1(config-if)# spanning-tree portfast

! PC3 → VLAN 20
SW1(config)# interface GigabitEthernet 0/3
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 20
SW1(config-if)# switchport nonegotiate
SW1(config-if)# spanning-tree portfast
\`\`\`

---

## Schritt 3 — Trunk-Link SW1 ↔ SW2 (auf beiden Switches)

\`\`\`
SW(config)# interface GigabitEthernet 0/24
SW(config-if)# switchport mode trunk
SW(config-if)# switchport trunk native vlan 999
SW(config-if)# switchport trunk allowed vlan 10,20,99,999
SW(config-if)# switchport nonegotiate

! Auf SW1 und SW2 identisch konfigurieren!
SW# show interfaces GigabitEthernet 0/24 trunk
! Prüfen: Mode = trunking, Native = 999, Allowed = 10,20,99,999
\`\`\`

---

## Schritt 4 — L3-Switch: ip routing + SVIs (SW2)

\`\`\`
! ← DAS ist der entscheidende Unterschied zu einem normalen Switch
SW2(config)# ip routing

! Gateway für VLAN 10
SW2(config)# interface Vlan10
SW2(config-if)# ip address 192.168.10.1 255.255.255.0
SW2(config-if)# no shutdown

! Gateway für VLAN 20
SW2(config)# interface Vlan20
SW2(config-if)# ip address 192.168.20.1 255.255.255.0
SW2(config-if)# no shutdown

! Management-SVI
SW2(config)# interface Vlan99
SW2(config-if)# ip address 192.168.99.1 255.255.255.240
SW2(config-if)# no shutdown
\`\`\`

---

## Schritt 5 — Management-SVI auf SW1

\`\`\`
SW1(config)# interface Vlan99
SW1(config-if)# ip address 192.168.99.10 255.255.255.240
SW1(config-if)# no shutdown

! Default-Gateway auf SW1 (für Management-Traffic)
SW1(config)# ip default-gateway 192.168.99.1
\`\`\`

---

## Schritt 6 — PC-Konfiguration (End-to-End-Test vorbereiten)

\`\`\`
PC1:  IP 192.168.10.10 / Gateway 192.168.10.1
PC2:  IP 192.168.20.10 / Gateway 192.168.20.1
PC3:  IP 192.168.20.11 / Gateway 192.168.20.1
\`\`\`

---

## Verifikation

\`\`\`
! 1. VLAN-Datenbank prüfen
SW1# show vlan brief
SW2# show vlan brief

! 2. Trunk-Status prüfen
SW1# show interfaces trunk
! Erwartung: Gi0/24 trunking, Native 999, 10/20/99/999 in active domain

! 3. Routing-Tabelle auf SW2
SW2# show ip route
! Erwartung: C 192.168.10.0/24 via Vlan10, C 192.168.20.0/24 via Vlan20

! 4. SVI-Status
SW2# show interfaces vlan 10
! Erwartung: Vlan10 is up, line protocol is up

! 5. Konnektivität (Inter-VLAN)
PC1# ping 192.168.20.10     ! → soll funktionieren (über SW2 ip routing)
PC1# ping 192.168.10.10     ! → direktes VLAN 10 (Layer 2)
SW1# ping 192.168.99.1      ! → Management-Ping zum SW2-Gateway
\`\`\`

---

## Häufige Fehler (5 typische Fallstricke)

> ⚠️ **\`ip routing\` vergessen** — SVIs können ohne \`ip routing\` erstellt werden, Routing findet aber nicht statt. Symptom: Ping zwischen VLANs schlägt fehl, \`show ip route\` zeigt nur direkt verbundene Routen wenn überhaupt.

> ⚠️ **VLAN existiert nicht in Datenbank** — \`show interfaces trunk\` zeigt ein VLAN unter "allowed" aber nicht unter "active in management domain". Ursache: VLAN wurde auf SW1 angelegt aber nicht auf SW2 (oder umgekehrt). Abhilfe: \`show vlan brief\` auf beiden Switches vergleichen.

> ⚠️ **Native VLAN Mismatch** — SW1 und SW2 müssen dasselbe Native VLAN konfiguriert haben. CDP meldet: \`%CDP-4-NATIVE_VLAN_MISMATCH\`. Abhilfe: \`show interfaces trunk\` auf beiden Switches, Native VLAN-Spalte vergleichen.

> ⚠️ **SVI bleibt down** — Ein SVI geht nur "up", wenn VLAN in der Datenbank existiert UND mindestens ein aktiver Port diesem VLAN zugewiesen ist (der Trunk-Port zählt). \`show interfaces vlan 10\` zeigt "line protocol is down" wenn kein Port aktiv ist.

> ⚠️ **PC-Gateway falsch gesetzt** — PC1 sendet Paket an Default-Gateway, aber Gateway-Adresse zeigt nicht auf SW2-SVI. Symptom: Ping innerhalb des VLANs funktioniert, VLAN-übergreifend schlägt fehl. Abhilfe: PC-Konfiguration überprüfen.

---

## Übungsaufgabe

**Erweitere das Lab um VLAN 30 (MARKETING, 192.168.30.0/24):**

1. Welche Befehle brauchst du auf **SW1**? (VLANs, Access-Ports für neue PCs)
2. Welche Befehle brauchst du auf **SW2**? (VLAN, SVI mit IP, Trunk allowed)
3. Was muss auf dem **Trunk-Link** geändert werden?
4. Teste mit \`ping 192.168.10.10\` von einem VLAN-30-Host — funktioniert es?

*Hinweis: Vergiss nicht, VLAN 30 explizit dem Trunk-Link hinzuzufügen: \`switchport trunk allowed vlan add 30\`*

---

## 🔗 Cross-Reference: STP (Spanning Tree Protocol)

> **Sobald du zwei oder mehr Switches mit Trunk-Links verbindest, ist STP aktiv** — und du musst es verstehen.
>
> In diesem Lab hast du genau einen Trunk-Pfad zwischen SW1 und SW2. Was passiert, wenn du einen zweiten Trunk-Link hinzufügst (Redundanz)?
> → **Spanning Tree Protocol (STP)** berechnet automatisch, welcher Link blockiert wird, um Loops zu verhindern.
>
> 📚 Nächstes Modul: **STP Deep-Dive** — Lerne wie STP Loops verhindert, was RSTP verbessert, und welche Ports in welchem Zustand sind.
  `.trim(),
};

// ── Concept 12: Lab 12.3 — WLAN-VLAN-Anbindung ───────────────

export const CONCEPT_VLAN_LAB_WLAN: Concept = {
  id: "vlan-lab-wlan",
  title: "Lab 12.3 — WLAN-VLAN-Anbindung (AP → Trunk → L3-Switch)",
  appliesTo: ["ccna"],
  tags: [
    "vlan",
    "lab",
    "wlan",
    "wireless",
    "access-point",
    "trunk",
    "voice-vlan",
    "ssid",
    "l3-switch",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1, 3.3 | ⏱️ 40 Min

---

> 💡 **Cisco Packet Tracer**: Dieses Lab kann in Cisco Packet Tracer nachgebaut werden. Verwende einen Cisco Aironet AP oder den generischen "Wireless Router" für die AP-Seite. Download unter [netacad.com](https://www.netacad.com).

---

## Lernziel

Wireless-Netzwerke verbinden sich nicht direkt mit VLANs — sie benötigen eine **SSID-zu-VLAN-Zuordnung** im Access Point.
Der **Switch sieht den AP wie jeden anderen Trunk-Partner**: getaggte Frames pro VLAN.
In diesem Lab konfigurierst du die **Switch-Seite** vollständig; die AP-Konfiguration wird konzeptuell beschrieben (sie ist herstellerspezifisch und Thema des Wireless-Moduls).

---

## Topologie

\`\`\`
Laptop (SSID: "CORP-DATA")  ─── WiFi ─┐
                                       │
Phone  (SSID: "CORP-VOICE") ─── WiFi ─┤── [ Access Point (AP) ] ── Gi0/1 Trunk ── Gi0/1 L3-SW1
                                       │         │
Guest  (SSID: "GÄSTE-WLAN") ─── WiFi ─┘         │ AP sendet pro SSID getaggte Frames:
                                             SSID CORP-DATA  → Tag VID=10
                                             SSID CORP-VOICE → Tag VID=100
                                             SSID GÄSTE-WLAN → Tag VID=50
                                             AP-Mgmt-Traffic → ungetaggt (Native VLAN 999)

L3-SW1: ip routing + SVI pro VLAN = Inter-VLAN-Routing
\`\`\`

---

## IP-Plan

| VLAN-ID | Name | Subnetz | Gateway (SVI) | Verwendung |
|---------|------|---------|---------------|-----------|
| 10 | CORP-DATA | 192.168.10.0/24 | 192.168.10.1 | Unternehmens-Laptops |
| 100 | CORP-VOICE | 192.168.100.0/24 | 192.168.100.1 | VoIP-Phones |
| 50 | GÄSTE | 192.168.50.0/24 | 192.168.50.1 | Gäste (isoliert) |
| 99 | MANAGEMENT | 192.168.99.0/28 | 192.168.99.1 | AP + Switch Mgmt |
| 999 | NATIVE | — | — | kein Host, AP-Trunk |

---

## Switch-Konfiguration (vollständig)

### VLANs anlegen

\`\`\`
SW1(config)# vlan 10
SW1(config-vlan)# name CORP-DATA
SW1(config)# vlan 50
SW1(config-vlan)# name GAESTE
SW1(config)# vlan 99
SW1(config-vlan)# name MANAGEMENT
SW1(config)# vlan 100
SW1(config-vlan)# name CORP-VOICE
SW1(config)# vlan 999
SW1(config-vlan)# name NATIVE
\`\`\`

### Trunk-Port zum Access Point

\`\`\`
! Der AP hängt an Gi0/1 — dieser Port wird als Trunk konfiguriert
SW1(config)# interface GigabitEthernet 0/1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 999
SW1(config-if)# switchport trunk allowed vlan 10,50,99,100,999
SW1(config-if)# switchport nonegotiate
! Kein 'spanning-tree portfast' auf Trunk-Ports!

! VLAN 1 entfernen (kein Grund, VLAN 1 auf AP-Trunk zu erlauben)
SW1(config-if)# switchport trunk allowed vlan remove 1
\`\`\`

### ip routing + SVIs

\`\`\`
SW1(config)# ip routing

SW1(config)# interface Vlan10
SW1(config-if)# ip address 192.168.10.1 255.255.255.0
SW1(config-if)# no shutdown

SW1(config)# interface Vlan50
SW1(config-if)# ip address 192.168.50.1 255.255.255.0
SW1(config-if)# no shutdown

SW1(config)# interface Vlan99
SW1(config-if)# ip address 192.168.99.1 255.255.255.240
SW1(config-if)# no shutdown

SW1(config)# interface Vlan100
SW1(config-if)# ip address 192.168.100.1 255.255.255.0
SW1(config-if)# no shutdown
\`\`\`

---

## AP-Konfiguration (konzeptuell — herstellerspezifisch)

> ⚠️ **Hinweis**: Die AP-seitige Konfiguration (SSID → VLAN-Mapping) ist **herstellerspezifisch** und wird im Wireless-Modul behandelt. Die folgenden Angaben gelten konzeptuell für Cisco Aironet / Cisco WLC:

\`\`\`
! Konzeptuell (Cisco WLC / Aironet):
! SSID "CORP-DATA"  → VLAN 10
! SSID "CORP-VOICE" → VLAN 100
! SSID "GÄSTE-WLAN" → VLAN 50
! AP-Management     → VLAN 99 (Native VLAN auf Trunk = kein Tag)

! Der AP sendet für jede SSID getaggte Frames Richtung Switch
! Trunk-Port auf dem Switch = einzige Konfiguration auf Switch-Seite
\`\`\`

📚 **Cross-Reference Wireless-Modul**: Dort lernst du, wie du SSIDs auf einem Cisco WLC oder Meraki AP erstellst und sie per "VLAN Mapping" mit den oben konfigurierten VLANs verknüpfst.

---

## Verifikation (Switch-Seite)

\`\`\`
! 1. Trunk-Status prüfen
SW1# show interfaces GigabitEthernet 0/1 trunk
! Erwartung: Mode = trunking, Native = 999, Allowed = 10,50,99,100,999
! Active: alle 5 VLANs (vorausgesetzt AP sendet Traffic in diesem VLAN)

! 2. VLANs aktiv?
SW1# show vlan brief
! Erwartung: 10,50,99,100 active; 999 active (native, kein Port explizit)

! 3. Routing-Tabelle
SW1# show ip route
! Erwartung: C 192.168.10.0/24, 192.168.50.0/24, 192.168.100.0/24 direkt verbunden

! 4. SVI-Status
SW1# show interfaces vlan 10
! Erwartung: Vlan10 is up, line protocol is up
! Achtung: "line protocol is down" wenn kein Gerät im VLAN 10 aktiv ist

! 5. Konnektivität (sobald AP aktiv und Clients verbunden)
SW1# ping 192.168.99.X     ! AP-Management-IP anpingen
Laptop# ping 192.168.10.1  ! Default-Gateway erreichbar?
\`\`\`

---

## Häufige Fehler (5 typische Fallstricke)

> ⚠️ **AP sendet ungetaggte Frames** — Wenn der AP nicht korrekt als Trunk konfiguriert ist, sendet er alle Frames ungetaggt. Der Switch ordnet sie dem Native VLAN (999) zu — kein VLAN-Separation. Abhilfe: AP-Trunk-Konfiguration überprüfen (herstellerspezifisch).

> ⚠️ **Native VLAN Mismatch** — AP erwartet Native VLAN 1, Switch hat Native VLAN 999. Frames für AP-Management kommen im falschen VLAN an. Symptom: AP nicht per SSH/Web erreichbar. Abhilfe: Native VLAN auf beiden Seiten identisch setzen.

> ⚠️ **Gäste-VLAN nicht isoliert** — VLAN 50 (Gäste) hat ip routing → Gäste erreichen VLAN 10/100. In Produktion: Firewall-Regel oder \`ip access-group\` auf SVI Vlan50 einrichten, die VLAN 10/100 blockiert.

> ⚠️ **VLAN nicht im Trunk allowed** — AP sendet getaggte Frames für VLAN 100, aber \`switchport trunk allowed vlan\` enthält VLAN 100 nicht. Frames werden verworfen. Symptom: Voice-Clients haben keine IP-Adresse. Abhilfe: \`show interfaces trunk\` prüfen.

> ⚠️ **SVI bleibt down** — Ein SVI geht nur "up", wenn VLAN existiert UND mindestens ein aktiver Port im VLAN vorhanden ist. Da der AP ein Trunk-Port ist, muss der AP tatsächlich verbunden und aktiv sein.

---

## Übungsaufgabe

**Füge ein zweites Gäste-NETZ für Partner hinzu (VLAN 60, 192.168.60.0/24):**

1. Welche Befehle sind auf dem Switch nötig?
2. Was muss auf dem AP geändert werden (konzeptuell)?
3. Wie isolierst du VLAN 60, sodass Partner zwar ins Internet, aber nicht in VLAN 10/50/100 können?
4. Überprüfe nach der Konfiguration mit \`show interfaces trunk\` — siehst du VLAN 60 unter "active in management domain"?

---

## 🔗 Cross-References

> 📚 **STP-Modul**: Der AP-Trunk-Port sollte **kein** \`spanning-tree portfast\` erhalten, da ein AP prinzipiell ein Switch sein könnte. Lerne im STP-Modul, wann PortFast sicher ist.
>
> 📚 **Wireless-Modul**: SSID → VLAN-Mapping auf Cisco WLC, Meraki, und UniFi APs. QoS für CORP-VOICE (SSID markiert Traffic mit WMM-AC_VO → Switch erkennt CoS 5).
>
> 📚 **Security-Modul**: Gäste-VLAN-Isolation, Dynamic ARP Inspection (DAI), IP Source Guard zum Schutz von VLAN 10/100 gegen Angriffe aus VLAN 50.
  `.trim(),
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_VLAN_ADVANCED: Topic = {
  id: "vlan-advanced",
  title: "VLANs — Tiefenwissen & Sicherheit",
  description:
    "802.1Q-Frame-Aufbau, Port-Typen, Inter-VLAN-Routing (ROAS & L3-Switch), VTP/DTP-Risiken, VLAN-Hopping-Angriffe mit Gegenmaßnahmen und vollständiges Praxislab.",
  conceptIds: [
    "vlan-broadcast-problem",
    "dot1q-tagging",
    "vlan-port-typen",
    "vlan-typen",
    "inter-vlan-routing",
    "vtp-dtp",
    "vlan-sicherheit",
    "vlan-advanced-guide",
    "vlan-simulator",
    "vlan-lab-bruecke",
    "vlan-lab-multi-switch",
    "vlan-lab-wlan",
  ],
  quizIds: ["quiz-vlan-advanced"],
  exerciseIds: [],
  prerequisiteTopicIds: ["switching-vlans", "networking-fundamentals"],
  estimatedMinutes: 240,
  tags: ["vlan", "802.1q", "trunk", "inter-vlan", "security", "layer-2"],
};

// ── Exports ───────────────────────────────────────────────────

export const VLAN_ADVANCED_CONCEPTS: Record<string, Concept> = {
  "vlan-broadcast-problem": CONCEPT_VLAN_BROADCAST_PROBLEM,
  "dot1q-tagging": CONCEPT_DOT1Q_TAGGING,
  "vlan-port-typen": CONCEPT_VLAN_PORT_TYPEN,
  "vlan-typen": CONCEPT_VLAN_TYPEN,
  "inter-vlan-routing": CONCEPT_INTER_VLAN_ROUTING,
  "vtp-dtp": CONCEPT_VTP_DTP,
  "vlan-sicherheit": CONCEPT_VLAN_SICHERHEIT,
  "vlan-advanced-guide": CONCEPT_VLAN_ADVANCED_GUIDE,
  "vlan-simulator": CONCEPT_VLAN_SIMULATOR,
  "vlan-lab-bruecke": CONCEPT_VLAN_LAB_BRUECKE,
  "vlan-lab-multi-switch": CONCEPT_VLAN_LAB_MULTI_SWITCH,
  "vlan-lab-wlan": CONCEPT_VLAN_LAB_WLAN,
};
