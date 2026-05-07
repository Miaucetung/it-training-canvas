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

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_VLAN_ADVANCED: Topic = {
  id: "vlan-advanced",
  title: "VLANs — Tiefenwissen & Sicherheit",
  description:
    "802.1Q-Frame-Aufbau, Port-Typen, Inter-VLAN-Routing (ROAS & L3-Switch), VTP/DTP-Risiken und VLAN-Hopping-Angriffe mit Gegenmaßnahmen.",
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
    "vlan-network",
  ],
  quizIds: [],
  exerciseIds: [],
  prerequisiteTopicIds: ["switching-vlans", "networking-fundamentals"],
  estimatedMinutes: 150,
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
};
