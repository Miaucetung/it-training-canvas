# AZ-900 Cross-Reference Mapping

Dieses Dokument dokumentiert alle Cross-References zwischen AZ-900 und CCNA-Konzepten.
Die Bridges werden über `src/lib/content/cross-references.ts` (CONCEPT_BRIDGES) aufgelöst.

## Bestehende Bridges (bereits in cross-references.ts)

| AZ-900-Konzept (targetConceptId) | CCNA-Konzept (sourceConceptId) | Topic in AZ-900       | Bridge-Notiz                                                                    |
|----------------------------------|-------------------------------|-----------------------|---------------------------------------------------------------------------------|
| `vnet-subnet`                    | `vlan`                        | azure-networking      | VLANs segmentieren lokal auf L2; VNet Subnets übernehmen diese Rolle in Azure   |
| `azure-addressing`               | `subnetting`                  | azure-networking      | CIDR-Subnetting ist identisch mit Azure VNet Address Space / Subnet-Planung     |
| `nsg`                            | `acl`                         | azure-networking      | Cisco ACLs filtern Traffic auf Router-Interfaces; NSGs tun dasselbe für Azure   |
| `azure-nat-gateway`              | `nat-pat`                     | azure-networking      | PAT/NAT Overload = Azure NAT Gateway: viele interne Ressourcen, 1 öffentliche IP |
| `azure-route-server`             | `ospf`                        | azure-networking      | OSPF propagiert Routing; Azure Route Server ermöglicht BGP zu On-Premises       |
| `azure-dhcp`                     | `dhcp`                        | azure-networking      | DHCP auf Cisco-Geräten = Azure vergibt IP-Adressen automatisch in VNets         |

## Neue Bridges (in Phase 4 hinzugefügt)

| AZ-900-Konzept (targetConceptId) | CCNA-Konzept (sourceConceptId) | Topic in AZ-900            | Begründung                                                                      |
|----------------------------------|-------------------------------|----------------------------|---------------------------------------------------------------------------------|
| `azure-rbac`                     | `aaa-radius`                  | azure-identity-governance  | AAA/RADIUS steuert Zugriff auf Netzgeräte; RBAC steuert Zugriff auf Azure-Ressourcen |
| `azure-availability-zones`       | `stp-redundancy`              | azure-architecture         | STP = Layer-2-Redundanz ohne Loops; Availability Zones = physische Redundanz über DC-Grenzen |
| `azure-monitor`                  | `syslog-snmp`                 | azure-cost-monitoring      | SNMP/Syslog = zentrales Netzwerk-Monitoring; Azure Monitor = zentrales Cloud-Monitoring |

## Warum diese Bridges wichtig sind

1. **Lern-Effizienz**: CCNA-Absolventen können Azure-Konzepte schneller verstehen, weil sie auf bekannten Analogien aufbauen.
2. **"Brückenbauer"-Achievement**: Wenn ein User sowohl CCNA (subnetting) als auch AZ-900 (azure-networking) abschließt, wird das `bridge-builder`-Achievement automatisch ausgelöst.
3. **Erweiterbarkeit**: Neue Module (z.B. AZ-104, CompTIA Network+) können Bridges zu CCNA UND AZ-900 hinzufügen.

## Mapping: AZ-900 Concept-IDs → wo im Code

| Concept-ID          | Definiert in                              |
|---------------------|-------------------------------------------|
| `vnet-subnet`       | `topics/azure-networking.ts`              |
| `azure-addressing`  | `topics/azure-networking.ts`              |
| `nsg`               | `topics/azure-networking.ts`              |
| `azure-nat-gateway` | `topics/azure-networking.ts`              |
| `azure-route-server`| `topics/azure-networking.ts`              |
| `azure-dhcp`        | `topics/azure-networking.ts`              |
| `azure-rbac`        | `topics/azure-identity-governance.ts`     |
| `azure-availability-zones` | `topics/azure-architecture.ts`   |
| `azure-monitor`     | `topics/azure-cost-monitoring.ts`         |
