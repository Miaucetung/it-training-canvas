import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import type { NetworkTopology } from "@/types/topology";

export type LabLike = (typeof LABS)[number];

export const labOf = (id: string): LabLike => LABS.find((l) => l.id === id)!;

/** Lab mit geänderten Befehlen: `edit` bekommt Gerät und Zeile und liefert die neue Zeile, `null` entfernt sie. */
export function editedLab(lab: LabLike, edit: (device: string, line: string) => string | null): LabLike {
  return {
    ...lab,
    steps: lab.steps.map((st) => ({
      ...st,
      blocks: (st.blocks as Array<{ device: string; commands: Array<{ cmd: string }> }>).map((b) => ({
        ...b,
        commands: b.commands.map((c) => ({
          ...c,
          cmd: String(c.cmd)
            .split("\n")
            .map((l) => edit(b.device, l.trim()))
            .filter((l): l is string => l !== null)
            .join("\n"),
        })),
      })),
    })),
  } as LabLike;
}

export const topologyOf = (lab: LabLike, state: "target" | "start" = "target"): NetworkTopology =>
  buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[lab.id], state).topology;

export const showOutputs = (t: NetworkTopology, deviceName: string): Record<string, string> => {
  const d = t.devices.find((x) => x.name === deviceName);
  if (!d) throw new Error(`Gerät ${deviceName} fehlt`);
  return CiscoCliGenerator.getDynamicShowOutputs(d, t);
};
