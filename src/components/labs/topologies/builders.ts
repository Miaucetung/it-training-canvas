import type { LabAddressingEntry, LabSubnetZone, LabTopologyDevice, LabTopologyLink } from "../types";

export const device = (
  id: string,
  name: string,
  model: string,
  type: LabTopologyDevice["type"],
  tier: LabTopologyDevice["tier"],
  x: number,
  y: number,
): LabTopologyDevice => ({ id, name, model, type, tier, x, y });

export const endpoint = (
  id: string,
  name: string,
  model: string,
  type: LabTopologyDevice["type"],
  x: number,
  y: number,
): LabTopologyDevice => ({ id, name, model, type, tier: "endpoint", x, y });

export const zone = (
  id: string,
  label: string,
  colorTheme: LabSubnetZone["colorTheme"],
  x: number,
  y: number,
  width: number,
  height: number,
  vlan?: number,
): LabSubnetZone => ({ id, label, colorTheme, x, y, width, height, ...(vlan !== undefined ? { vlan } : {}) });

export const tableRow = (
  deviceName: string,
  iface: string,
  ip: string,
  subnetMask: string,
  defaultGateway: string,
  vlan: string | number,
  description: string,
): LabAddressingEntry => ({
  device: deviceName,
  interface: iface,
  ip,
  subnetMask,
  defaultGateway,
  vlan,
  description,
});

export const link = (
  id: string,
  from: string,
  fromPort: string,
  to: string,
  toPort: string,
  extra: Partial<LabTopologyLink> = {},
): LabTopologyLink => ({
  id,
  from,
  to,
  fromPort,
  toPort,
  cableType: "copper-straight",
  fromPortOffset: 60,
  fromPortSide: -14,
  toPortOffset: 60,
  toPortSide: -14,
  ...extra,
});

/** Zeile der Adressierungstabelle mit Kurzform für Interface-Namen (Gi0/0 -> GigabitEthernet0/0). */
export const ifRow = (
  deviceName: string,
  iface: string,
  ip: string,
  mask: string,
  zoneOrVlan: string | number,
  description: string,
  gateway = "N/A",
): LabAddressingEntry =>
  tableRow(
    deviceName,
    iface.replace(/^Gi/, "GigabitEthernet").replace(/^Fa/, "FastEthernet").replace(/^Lo/, "Loopback").replace(/^Se/, "Serial").replace(/^Et/, "Ethernet"),
    ip,
    mask,
    gateway,
    zoneOrVlan,
    description,
  );
