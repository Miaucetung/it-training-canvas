import type { LabTopologyData } from "./types";
import { LAYER2_TOPOLOGIES } from "./topologies/layer2";
import { LAYER2_SWITCHING_TOPOLOGIES } from "./topologies/layer2-switching";
import { ROUTING_TOPOLOGIES } from "./topologies/routing";
import { ROUTING_LABS_TOPOLOGIES } from "./topologies/routing-labs";
import { ROUTING_MORE_TOPOLOGIES } from "./topologies/routing-more";
import { IPV6_LABS_TOPOLOGIES } from "./topologies/ipv6-labs";

/**
 * Kuratierte, rasterausgerichtete Cisco-Press-Topologien aller Labs mit Netzwerk-Topologie.
 * Je Kategorie eine Datei unter ./topologies/.
 */
export const CURATED_TOPOLOGIES: Record<string, LabTopologyData> = {
  ...LAYER2_TOPOLOGIES,
  ...LAYER2_SWITCHING_TOPOLOGIES,
  ...ROUTING_TOPOLOGIES,
  ...ROUTING_LABS_TOPOLOGIES,
  ...ROUTING_MORE_TOPOLOGIES,
  ...IPV6_LABS_TOPOLOGIES,
};
