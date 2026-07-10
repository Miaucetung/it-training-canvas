// ============================================================
// CCNA Topic: WAN-Architekturen & VPN
// Quelle: CCNA 200-301 Official Cert Guide V2, Ch 19
// Leased Lines, MPLS, Internet, IPsec, GRE, DMVPN, SD-WAN
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_WAN_TECHNOLOGIES: Concept = {
  id: "wan-technologies",
  title: "WAN-Technologien — Mietleitung, MPLS, Internet",
  appliesTo: ["ccna"],
  tags: ["wan", "mpls", "metro-ethernet", "leased-line", "networking"],
  content: `
## WAN-Optionen für Unternehmen

### 1. Leased Line (Mietleitung)
- Punkt-zu-Punkt-Verbindung, garantierte Bandbreite, exklusiv
- Layer-2-Protokoll: HDLC (Cisco-Default) oder PPP
- Hoher Preis, beste SLA

### 2. Metro Ethernet
- ISP liefert Ethernet-Frame als WAN-Service
- Topologien: E-Line (P2P), E-LAN (any-to-any), E-Tree (hub-and-spoke)
- Layer-2-Service: alle Standorte im gleichen Broadcast-Bereich (oder als Punkt-zu-Punkt)

### 3. MPLS L3VPN
- Provider routet Kundennetz im eigenen MPLS-Backbone
- **CE** (Customer Edge) ↔ **PE** (Provider Edge) sprechen z. B. BGP
- Vorteil: any-to-any zwischen allen Standorten, ohne Full-Mesh-Tunnel
- ISP managt das Routing — Kunde sieht "One Hop" zwischen Sites

### 4. Internet als WAN
- Günstig, ubiquitär — aber **keine SLAs** und **unverschlüsselt**
- Lösung: Verschlüsselter Tunnel = **VPN** (siehe nächstes Konzept)

### Klassische Layer-2-Protokolle (nur Theorie)
| Protokoll | Standard | Auth | Heute? |
|-----------|---------|------|-------|
| HDLC | ISO (Cisco-Variante) | – | Cisco-Default auf Serial |
| PPP | RFC 1661 | PAP/CHAP | offen, multivendor |
| Frame Relay | – | – | obsolet |
| ATM | – | – | obsolet |

:::merke
**WAN-Layer-2-Protokolle haben keine MAC-Adressen** — im Gegensatz zu Ethernet gibt es auf einer
seriellen Punkt-zu-Punkt-Leitung nur zwei Endpunkte, eine Adressierung ist überflüssig.
:::

**cHDLC (Cisco HDLC) — Frame-Struktur:**
\`\`\`
| Flag | Address | Control | Proprietary Type | Data | FCS |
\`\`\`
Cisco HDLC ist **proprietär** (nicht der originale ISO-HDLC-Standard) und funktioniert daher
nur **Cisco ↔ Cisco**. Es ist der **Default** auf seriellen Cisco-Interfaces, wenn keine
Encapsulation konfiguriert wurde.

**PPP** ist der offene Gegenpart (RFC 1661) und wird gewählt, wenn Multivendor-Interop,
Authentifizierung (PAP/CHAP) oder Multilink nötig sind:
\`\`\`
R1(config-if)# encapsulation ppp
R1(config-if)# ppp authentication chap
\`\`\`
  `.trim(),
};

export const CONCEPT_VPN_IPSEC: Concept = {
  id: "vpn-ipsec",
  title: "VPN — IPsec, GRE, DMVPN, SSL-VPN",
  appliesTo: ["ccna"],
  tags: ["vpn", "ipsec", "gre", "dmvpn", "ssl-vpn", "tunnel", "security"],
  content: `
## VPN-Übersicht

:::kernidee
Ein VPN baut einen **verschlüsselten Tunnel durch ein unsicheres Netz** (meist das Internet) — als hätte man eine private Standleitung, ohne sie zu bezahlen. Zwei Bausteine, die man oft verwechselt: **GRE** kapselt (kann *was* transportieren, auch Multicast/Routing) — aber **ohne Verschlüsselung**; **IPsec** verschlüsselt (kann *sicher*) — aber kein Multicast. Deshalb in der Praxis oft **GRE over IPsec**: GRE liefert die Vielseitigkeit, IPsec die Sicherheit.
:::

**Site-to-Site VPN**: zwei Standorte (Router ↔ Router) — Mitarbeitende merken nichts.
**Remote-Access VPN**: einzelner Client (Cisco AnyConnect/Secure Client) ↔ Headend.

### IPsec (RFC 4301)
Suite aus Protokollen, die IP-Pakete authentifiziert und verschlüsselt.

| Komponente | Zweck |
|-----------|-------|
| **IKE** (v1/v2) | Schlüsseltausch, Aushandlung der SA |
| **ESP** | Authentifizierung **+** Verschlüsselung der Payload |
| AH | Nur Authentifizierung — selten genutzt |
| **Transport-Mode** | nur Payload verschlüsselt (Host-zu-Host) |
| **Tunnel-Mode** | gesamtes IP-Paket gekapselt (Site-to-Site) |

### IPsec-Phasen (IKEv2)
1. IKE_SA_INIT — DH-Keyaustausch, Crypto-Algorithmen aushandeln
2. IKE_AUTH — gegenseitige Authentifizierung (PSK oder Zertifikat)
3. CHILD_SA — die eigentlichen IPsec-SAs für Datenverkehr

### GRE (Generic Routing Encapsulation, RFC 2784)
- Kapselt **beliebige** Layer-3-Protokolle in IP-Pakete
- Unterstützt Multicast (→ Routing-Protokolle wie OSPF im Tunnel möglich)
- **Keine Verschlüsselung** → meist mit IPsec kombiniert: **GRE over IPsec**

### DMVPN — Dynamic Multipoint VPN
- Cisco-Lösung für **Hub-and-Spoke mit dynamischen Spoke-zu-Spoke-Tunneln**
- Komponenten: **mGRE** (multipoint GRE) + **NHRP** (Next Hop Resolution Protocol) + **IPsec**
- Vorteil: Spokes können direkt miteinander reden, ohne den Hub zu belasten

### SSL/TLS VPN (Remote-Access)
- HTTPS-Tunnel (TCP 443) → durchquert nahezu jede Firewall
- Cisco AnyConnect / Cisco Secure Client
- Authentifizierung: AAA + 2FA (RADIUS, Duo)

### Site-to-Site IPsec — Mini-Konfiguration
\`\`\`
crypto isakmp policy 10
 encryption aes 256
 authentication pre-share
 group 14
 hash sha256

crypto isakmp key GeheimerKey address 203.0.113.10

crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac
 mode tunnel

crypto map S2SMAP 10 ipsec-isakmp
 set peer 203.0.113.10
 set transform-set TS
 match address VPN-TRAFFIC

ip access-list extended VPN-TRAFFIC
 permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255

interface gi0/1
 crypto map S2SMAP
\`\`\`
  `.trim(),
};

export const CONCEPT_SDWAN: Concept = {
  id: "sd-wan",
  title: "SD-WAN — Software-Defined WAN",
  appliesTo: ["ccna"],
  tags: ["sd-wan", "wan", "controller", "cisco", "viptela"],
  content: `
## SD-WAN

Klassisch: Jede Site hat eine MPLS-Leitung **und** Internet — Routing wird statisch
oder per BGP gesteuert. Komplex, teuer, langsam änderbar.

**SD-WAN** trennt Control- und Data-Plane und nutzt mehrere Transport-Pfade
gleichzeitig (MPLS + Internet + LTE). Eine zentrale Policy entscheidet pro
Anwendung, welcher Pfad genutzt wird.

### Cisco SD-WAN (Viptela / Catalyst SD-WAN) Komponenten
| Komponente | Rolle |
|-----------|-------|
| **vManage** | GUI / Konfigurationsserver (Management Plane) |
| **vSmart** | Control Plane — verteilt Routing-/Policy-Infos |
| **vBond** | Orchestrator — bringt vEdges in den Overlay |
| **vEdge / cEdge** | Router an den Sites (Data Plane) |

### Vorteile
- **Zero-Touch Provisioning**: Site-Router selbst bringt sich in das Overlay
- **Application-aware Routing**: Voice via MPLS, YouTube via Internet
- **Encryption ist Pflicht**: alle Tunnel automatisch IPsec-verschlüsselt
- **Brownout-Detection**: schaltet bei Paketverlust > X automatisch um

### Typische Architektur
\`\`\`
Site 1 ─┐                                  ┌─ Site 2
        ├─ MPLS ────[SD-WAN Overlay]──────┤
        ├─ Internet ────────────────────────┤
        └─ LTE Backup ─────────────────────┘
\`\`\`

SD-WAN überlagert die transparenten Transports mit einem virtuellen Mesh — der
Operator sieht **eine** logische WAN-Fabric.
  `.trim(),
};

export const CONCEPT_WAN_GUIDE: Concept = {
  id: "wan-guide",
  title: "Lernguide: WAN & VPN",
  appliesTo: ["ccna"],
  tags: ["wan", "vpn", "ipsec", "sd-wan", "guide"],
  content: `
## Lernziele
- Mietleitung, MPLS L3VPN und Internet-VPN als WAN-Optionen vergleichen
- IPsec-Komponenten (IKE, ESP, Transform-Set) benennen
- Den Unterschied zwischen GRE, GRE over IPsec und DMVPN erklären
- Die vier Komponenten einer Cisco SD-WAN-Lösung (vManage, vSmart, vBond, vEdge) zuordnen
- Site-to-Site- vs. Remote-Access-VPN unterscheiden

## Praxis-Szenario
Die "RetailChain SE" (32 Filialen, 1 RZ) löst ihr altes MPLS-only-WAN durch eine SD-WAN-Lösung ab. Jede Filiale erhält zwei Transports: eine günstige Glasfaser (1 Gbit/s, ohne SLA) und einen LTE-Backup-Stick. Eine zentrale Policy in vManage definiert: SAP- und VoIP-Traffic → bevorzugt günstige Glasfaser, bei Paketverlust > 5 % automatisch über LTE; restlicher Internet-Traffic geht direkt aus den Filialen ins Internet (Direct Internet Access). Alle Tunnel werden mit IPsec verschlüsselt.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit einem RZ-Standort (mit vManage, vSmart, vBond als Server-Symbole) und drei Filialen, die jeweils einen cEdge-Router haben. Zeichne pro Filiale zwei Transports (Glasfaser, LTE) und beschrifte das Overlay als gestrichelte IPsec-Tunnel.
**Ziel:** Die Trennung zwischen Underlay (Glasfaser/LTE) und Overlay (verschlüsselte SD-WAN-Tunnel) visualisieren.
**Tipps:** vBond ist nur initial wichtig — er bringt neue cEdges in das Overlay. Nach erfolgreichem Onboarding kommunizieren cEdges direkt mit vSmart (Control) und untereinander (Data).

## Verständnisfragen
1. Warum reicht GRE alleine nicht aus, wenn Verkehrsdaten über das Internet geschickt werden — und was ergänzt IPsec?
2. Welche zwei Komponenten von Cisco SD-WAN bilden die Control Plane?
3. Was ist der Vorteil eines DMVPN gegenüber einem klassischen Hub-and-Spoke-IPsec — gerade beim Voice-Verkehr?
*(Antworten im Quiz verfügbar)*

:::falle
WAN/VPN-Fallen:
- **GRE ≠ IPsec:** GRE kapselt, verschlüsselt aber **nichts**. Wer „VPN" im Sinne von sicher meint, braucht IPsec oder GRE-over-IPsec.
- **MPLS ist kein Verschlüsselungsdienst:** MPLS L3VPN trennt Kundenrouting, verschlüsselt aber **nicht** — bei Compliance zusätzlich IPsec.
- **SD-WAN ohne zweiten Transport:** Der Mehrwert entsteht erst durch ≥ 2 unabhängige Leitungen — ein einzelner Internet-Anschluss bringt nichts.
:::
  `.trim(),
};

export const TOPIC_WAN: Topic = {
  id: "wan",
  title: "WAN-Architekturen & VPN",
  description:
    "Mietleitungen, MPLS L3VPN, Metro Ethernet, IPsec/GRE/DMVPN und Cisco SD-WAN.",
  conceptIds: [
    "wan-technologies",
    "vpn-ipsec",
    "sd-wan",
    "wan-guide",
  ],
  quizIds: ["ccna-quiz-wan-vpn"],
  exerciseIds: ["exercise-sdwan-overlay"],
  prerequisiteTopicIds: ["routing-ospf", "security"],
  estimatedMinutes: 120,
  tags: ["wan", "vpn", "ipsec", "mpls", "sd-wan"],
  lessonSummary: {
    mustKnow: [
      "MPLS L3VPN provides any-to-any connectivity between sites without full-mesh tunnels; the ISP manages CE-PE routing (usually BGP or OSPF)",
      "IPsec ESP provides both authentication and encryption of the IP payload; AH provides authentication only (no encryption) and is rarely used",
      "GRE encapsulates any Layer-3 protocol and supports multicast (enabling OSPF/EIGRP inside the tunnel); GRE alone has NO encryption",
      "GRE over IPsec combines GRE's multicast support with IPsec's encryption — the standard for site-to-site VPN with dynamic routing",
      "SD-WAN components: vManage (GUI/config), vSmart (control plane), vBond (orchestrator), vEdge/cEdge (data plane at each site)",
    ],
    bestPractice: [
      {
        topic: "VPN technology selection",
        practice:
          "Use IPsec with IKEv2 (not IKEv1) for all new site-to-site VPNs; use AES-256 and SHA-256 minimum. Avoid PSK in large deployments — use PKI certificates.",
      },
      {
        topic: "MPLS vs. Internet VPN",
        practice:
          "Use MPLS for latency-sensitive traffic (VoIP, ERP) where guaranteed bandwidth and SLA are needed; use Internet VPN for lower-cost backup paths or non-critical traffic.",
      },
      {
        topic: "SD-WAN dual-transport",
        practice:
          "Deploy at least two independent transports per site (e.g., fiber + LTE) to benefit from SD-WAN's application-aware failover — a single transport gives no redundancy benefit.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "Frame Relay",
        reason:
          "Legacy Layer-2 WAN technology using virtual circuits (DLCI); the ITU-T formally withdrew the standard in 2016; no modern ISP offers it",
        replacedBy: "Metro Ethernet or MPLS L3VPN",
      },
      {
        topic: "HDLC (Cisco cHDLC)",
        reason:
          "Cisco-proprietary serial encapsulation; only works Cisco-to-Cisco; serial WAN links themselves are nearly extinct, replaced by Ethernet handoffs",
        replacedBy: "Metro Ethernet (IEEE 802.3)",
      },
      {
        topic: "IKEv1 (ISAKMP Phase 1/2)",
        reason:
          "More complex negotiation, known vulnerabilities in aggressive mode; IKEv2 is faster (2 exchanges vs. 6/9) and required for modern use cases like MOBIKE and EAP",
        replacedBy: "IKEv2 (RFC 7296)",
      },
    ],
    fastFacts: [
      "GRE tunnels add 24 bytes of overhead (20 IP + 4 GRE); with IPsec ESP in tunnel mode, total overhead is ~74 bytes. Verify: show interface tunnel0",
      "MPLS does NOT encrypt traffic by default — the ISP backbone carries customer data in the clear; add IPsec on top if encryption is required. Verify: traceroute between sites",
      "SD-WAN Zero-Touch Provisioning: a new cEdge calls vBond using the serial number — no manual IP configuration needed at the site. Verify: show sdwan system status",
    ],
  },
};

export const WAN_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_WAN_TECHNOLOGIES.id]: CONCEPT_WAN_TECHNOLOGIES,
  [CONCEPT_VPN_IPSEC.id]: CONCEPT_VPN_IPSEC,
  [CONCEPT_SDWAN.id]: CONCEPT_SDWAN,
  [CONCEPT_WAN_GUIDE.id]: CONCEPT_WAN_GUIDE,
};
