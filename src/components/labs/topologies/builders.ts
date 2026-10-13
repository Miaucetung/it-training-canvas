import type { LabAddressingEntry, LabSubnetZone, LabTopologyDevice } from "../types";

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
