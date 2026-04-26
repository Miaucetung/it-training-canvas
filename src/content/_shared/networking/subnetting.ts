// ============================================================
// Shared Concept: Subnetting / IPv4 Addressing
// appliesTo: ccna, comptia-network-plus, az-104, az-900
// ============================================================

import type { Concept } from "@/lib/content/types";

export const CONCEPT_SUBNETTING: Concept = {
  id: "subnetting",
  title: "IPv4 Subnetting & CIDR",
  appliesTo: ["ccna", "comptia-network-plus", "az-104", "az-900"],
  tags: ["networking", "ip", "subnetting", "cidr", "layer-3", "addressing"],
  relatedConceptIds: [
    "ipv4-addressing",
    "vlsm",
    "azure-addressing",
    "vnet-subnet",
  ],
  content: `
## IPv4 Subnetting

### CIDR-Notation
Eine IP-Adresse mit Präfixlänge, z.B. **192.168.1.0/24**
- /24 → erste 24 Bits = Netzanteil → Subnetzmaske 255.255.255.0

### Subnetzmasken-Tabelle
| CIDR | Subnetzmaske | Hosts | Block-Größe |
|------|-------------|-------|------------|
| /24 | 255.255.255.0 | 254 | 256 |
| /25 | 255.255.255.128 | 126 | 128 |
| /26 | 255.255.255.192 | 62 | 64 |
| /27 | 255.255.255.224 | 30 | 32 |
| /28 | 255.255.255.240 | 14 | 16 |
| /29 | 255.255.255.248 | 6 | 8 |
| /30 | 255.255.255.252 | 2 | 4 |

**Formel**: nutzbare Hosts = 2^(32-Präfix) - 2

### Subnetting-Methode (Magic Number)
1. Block-Größe = 256 - interessantes Oktett der Subnetzmaske
2. Netzwerkadressen: 0, Block, 2×Block, ...
3. Broadcast = nächste Netzwerkadresse - 1
4. Hosts: Netzwerk+1 bis Broadcast-1

**Beispiel**: 192.168.10.0/28
- Maske: 255.255.255.240 → Block-Größe: 256-240 = 16
- Netz: .0, .16, .32, ... Broadcast: .15, .31, .47, ...
- Hosts .0/28: 192.168.10.1 – 192.168.10.14

### Private IP-Adressen (RFC 1918)
| Bereich | CIDR |
|---------|------|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 |

### Spezielle Adressen
| Adresse | Zweck |
|---------|-------|
| 127.0.0.0/8 | Loopback |
| 169.254.0.0/16 | APIPA / Link-local |
| 0.0.0.0 | Unspecified |
| 255.255.255.255 | Limited Broadcast |

### VLSM (Variable Length Subnet Masking)
Verschiedene Subnetzmasken innerhalb desselben Adressraums.
→ Effiziente Nutzung des Adressraums
→ Vorgehen: Größte Subnetze zuerst planen
  `.trim(),
};

export const CONCEPT_IPV4_HEADER: Concept = {
  id: "ipv4-header",
  title: "IPv4 Header & Funktionen",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "ip", "header", "fragmentation", "ttl", "layer-3"],
  content: `
## IPv4 Header

Minimalgröße: **20 Byte** (ohne Optionen)

### Wichtige Header-Felder
| Feld | Größe | Beschreibung |
|------|-------|-------------|
| Version | 4 Bit | IPv4 = 4 |
| IHL | 4 Bit | Header-Länge in 32-Bit-Wörtern |
| DSCP/ECN | 8 Bit | QoS-Markierung |
| Total Length | 16 Bit | Gesamtlänge Paket (Header + Daten) |
| Identification | 16 Bit | Fragmentidentifikation |
| Flags | 3 Bit | DF (Don't Fragment), MF (More Fragments) |
| Fragment Offset | 13 Bit | Position im Original-Paket |
| TTL | 8 Bit | Time-to-Live: dekrementiert bei jedem Hop |
| Protocol | 8 Bit | Nächstes Protokoll (TCP=6, UDP=17, ICMP=1) |
| Header Checksum | 16 Bit | Integritätsprüfung des Headers |
| Source IP | 32 Bit | Quelladresse |
| Destination IP | 32 Bit | Zieladresse |

### Fragmentierung
Wenn ein Paket größer als die MTU (Default: 1500 Byte Ethernet) ist:
- Router fragmentiert das Paket
- DF-Bit gesetzt → Router sendet ICMP "Fragmentation Needed"
- Reassembly erfolgt nur beim Zielhost
  `.trim(),
};
