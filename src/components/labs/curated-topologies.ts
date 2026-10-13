import type { LabTopologyData } from "./types";
import { LAYER2_TOPOLOGIES } from "./topologies/layer2";
import { LAYER2_SWITCHING_TOPOLOGIES } from "./topologies/layer2-switching";
import { ROUTING_TOPOLOGIES } from "./topologies/routing";

/**
 * Kuratierte, rasterausgerichtete Cisco-Press-Topologien aller Labs mit Netzwerk-Topologie.
 * Je Kategorie eine Datei unter ./topologies/.
 */
export const CURATED_TOPOLOGIES: Record<string, LabTopologyData> = {
  ...LAYER2_TOPOLOGIES,
  ...LAYER2_SWITCHING_TOPOLOGIES,
  ...ROUTING_TOPOLOGIES,
};
