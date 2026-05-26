# CCNA Deep-Dive Modul-Roadmap

Reihenfolge der geplanten Vertiefungsmodule.  
**Tier 1** = aktiv in Entwicklung · **Tier 2** = nächste Sprints · **Tier 3** = Backlog

---

## Tier 1 — Aktiv (CCNA Blueprint-Schwerpunkte)

| # | Modul | Blueprint | Status | Zieldateien |
|---|-------|-----------|--------|-------------|
| 1 | **VLAN Vertiefung** | 2.1–2.3 | ✅ Phase 2 abgeschlossen (PR: feature/vlan-deepdive-module) | `vlan-advanced.ts`, `ccna-quiz-content.ts`, `collaboration-engine.ts`, `VlanSimulatorDialog.tsx` |
| 2 | OSPF Multi-Area | 3.4 | ⬜ Geplant | `routing-ospf.ts`, neues Template `tpl-edu-ospf-areas` |
| 3 | STP Deep-Dive | 2.5 | ⬜ Geplant | `switching-vlans.ts`, Erweiterung `tpl-edu-stp-root-bridge` |
| 4 | Subnetting Advanced | 1.6 | ⬜ Geplant | `subnet-segmentation.ts`, VLSM / Aggregation / Summarization |
| 5 | WLAN / Wireless | 2.6 | ⬜ Geplant | `wlan.ts`, WLC-Modes, 802.11 Standards, neues Template |

---

## Tier 2 — Nächste Sprints

| # | Modul | Blueprint | Begründung / Kontext | Abhängigkeit |
|---|-------|-----------|----------------------|--------------|
| 6 | **EtherChannel / LACP** | **2.4** | Aus VLAN-Vertiefung ausgelagert (Blueprint 2.4 ≠ 2.1–2.3; L2-Mechanik-Thema von `switching-vlans.ts`). Eigenständig genug für eigenes Sprint-Item. | `switching-vlans.ts`, neues Template `tpl-edu-etherchannel` (PAgP / LACP / Static) |
| 7 | NAT Deep-Dive | 4.1 | PAT / Static / Dynamic + Troubleshooting | `dhcp-nat.ts` |
| 8 | IPv6 Transition | 1.8 | Dual-Stack, Tunnel (6in4, Teredo), NAT64 | `ipv6.ts` |
| 9 | OSPF LSA & Path Selection | 3.4 | Advanced OSPF (erst nach Tier-1 OSPF Multi-Area) | `routing-ospf.ts` |
| 10 | Security Hardening Extended | 5.3–5.4 | DAI, IP Source Guard, Port-Security Advanced — inkl. eigenem Template `tpl-edu-dai-security` | `security.ts` |

---

## Tier 3 — Backlog

| # | Modul | Blueprint | Notizen |
|---|-------|-----------|---------|
| 11 | FHRP Deep-Dive | 3.5 | HSRP / VRRP / GLBP Vergleich; Basis in `fhrp.ts` vorhanden |
| 12 | QoS Queuing | 6.1 | DSCP-Marking, CBWFQ, LLQ, Shaping vs. Policing |
| 13 | SDN / Automation Advanced | 6.x | Python + NetMiko, RESTCONF/NETCONF |
| 14 | WAN Technologien | 4.2 | MPLS Labels, SD-WAN Grundlagen |
| 15 | OSPF Troubleshooting | 3.4 | Neighbor-States, MTU-Mismatch, Stuck-in-Init |

---

## Abhängigkeits-Hinweise

- `tpl-edu-ospf-areas` ist Voraussetzung für das QW-4-Mechanismus-Flag in `routing-ospf.ts` (Blueprint F-INT-3 kann erst landen, wenn Template gebaut ist)
- EtherChannel-Template (`tpl-edu-etherchannel`) → gehört zu `switching-vlans.ts`, **nicht** `vlan-advanced.ts`
- DAI-Visualisierung → eigenes Template in Tier-2 #10 (Security), kein VLAN-Template
- Extended VLANs (1006–4094) → bereits in `vlan-advanced.ts` Concept 4 abgedeckt; kein eigenständiges Tier-Item nötig

---

## TODOs aus VLAN-Vertiefung (Cross-References für Folgemodule)

Diese Cross-References wurden in `vlan-advanced.ts` als Text-Hinweise eingebaut.
Wenn die Ziel-Module implementiert werden, sollten formale `relatedTopicIds` ergänzt werden:

| Cross-Reference | Erwähnt in Concept | Ziel-Modul | Aktion bei Implementierung |
|---|---|---|---|
| STP wird relevant wenn 2 Switches mit Trunk | `vlan-lab-multi-switch` (Lab 12.2) | **STP Deep-Dive** (Tier 1 #3) | `prerequisiteTopicIds` oder `relatedTopicIds` in `vlan-advanced.ts` ergänzen |
| AP-SSID → VLAN Mapping ist herstellerspezifisch | `vlan-lab-wlan` (Lab 12.3) | **WLAN / Wireless** (Tier 1 #5) | `relatedTopicIds: ["wlan"]` in `vlan-lab-wlan` ergänzen |
| Gäste-VLAN-Isolation: DAI, IP Source Guard | `vlan-lab-wlan` (Lab 12.3) | **Security Hardening Extended** (Tier 2 #10) | `relatedTopicIds: ["security-hardening"]` ergänzen |
