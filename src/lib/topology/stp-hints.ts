import type { TopologyDevice } from "@/types/topology";

/** Hinweise zur Spanning-Tree-Konfiguration eines Geräts (leer, wenn nichts zu beachten ist). */
export function stpHints(device: TopologyDevice): string[] {
  const stp = device.config?.stp;
  if (!stp) return [];
  if (stp.ambiguous) {
    return [
      `STP: „root primary“ ergibt je nach Netzzustand beim Ausführen eine andere Priority (hier angenommen: ${stp.priority}). Das Ergebnis ist nicht eindeutig; mit einer expliziten „priority“ ist es festgelegt.`,
    ];
  }
  return [];
}
