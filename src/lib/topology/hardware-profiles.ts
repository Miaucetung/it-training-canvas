import type { DeviceType, TopologyInterface } from "@/types/topology";

// ============================================================================
// Hardware-Profile (Packet-Tracer-Modelle). Quelle der Interface-Namen für Topologien,
// den Standard-Interfaces neuer Geräte und die Prüfung der Lab-Topologien.
// ============================================================================

export type HardwareProfileId =
  | "isr2911"
  | "catalyst2960-24tt"
  | "catalyst3560-24ps"
  | "catalyst3650-24ps"
  | "pc-pt"
  | "server-pt";

export interface HardwareProfile {
  id: HardwareProfileId;
  model: string;
  deviceType: DeviceType;
  /** Physische Ports in Anzeigereihenfolge (Kurzform wie in der CLI-Zusammenfassung) */
  ports: string[];
  /** Zusätzliche virtuelle Interfaces (SVI, Loopback), die jedes Gerät dieses Typs anlegen kann */
  virtual?: string[];
  description: string;
}

const range = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}${from + i}`);

export const HARDWARE_PROFILES: Record<HardwareProfileId, HardwareProfile> = {
  isr2911: {
    id: "isr2911",
    model: "Cisco 2911 ISR",
    deviceType: "router",
    // HWIC-2T in Slot 0: Serial0/0/0 und Serial0/0/1 (wie in Packet Tracer)
    ports: ["Gi0/0", "Gi0/1", "Gi0/2", "Se0/0/0", "Se0/0/1"],
    virtual: ["Lo0"],
    description: "3x Gigabit Ethernet onboard, 2x Serial (HWIC-2T)",
  },
  "catalyst2960-24tt": {
    id: "catalyst2960-24tt",
    model: "Catalyst 2960-24TT",
    deviceType: "switch-l2",
    ports: [...range("Fa0/", 1, 24), "Gi0/1", "Gi0/2"],
    virtual: ["Vlan1"],
    description: "24x FastEthernet, 2x GigabitEthernet Uplink",
  },
  "catalyst3560-24ps": {
    id: "catalyst3560-24ps",
    model: "Catalyst 3560-24PS",
    deviceType: "switch-l3",
    ports: [...range("Fa0/", 1, 24), "Gi0/1", "Gi0/2"],
    virtual: ["Vlan1"],
    description: "Layer-3-Switch: 24x FastEthernet (PoE), 2x GigabitEthernet",
  },
  "catalyst3650-24ps": {
    id: "catalyst3650-24ps",
    model: "Catalyst 3650-24PS",
    deviceType: "switch-l3",
    ports: [...range("Gi1/0/", 1, 24), ...range("Gi1/1/", 1, 4)],
    virtual: ["Vlan1"],
    description: "Layer-3-Switch: 24x GigabitEthernet (PoE+), 4x SFP-Uplink",
  },
  "pc-pt": {
    id: "pc-pt",
    model: "PC-PT",
    deviceType: "pc",
    ports: ["Fa0"],
    description: "Endgerät mit FastEthernet0",
  },
  "server-pt": {
    id: "server-pt",
    model: "Server-PT",
    deviceType: "server",
    ports: ["Fa0"],
    description: "Server mit FastEthernet0",
  },
};

/** Wählt das Profil anhand von Modellname und Gerätetyp (Modell hat Vorrang). */
export function resolveHardwareProfile(model: string | undefined, type: DeviceType): HardwareProfile | undefined {
  const m = (model ?? "").toLowerCase();
  if (/2911|2901|isr/.test(m) && type === "router") return HARDWARE_PROFILES.isr2911;
  if (/2960/.test(m)) return HARDWARE_PROFILES["catalyst2960-24tt"];
  if (/3650/.test(m)) return HARDWARE_PROFILES["catalyst3650-24ps"];
  if (/3560/.test(m)) return HARDWARE_PROFILES["catalyst3560-24ps"];
  switch (type) {
    case "router":
      return HARDWARE_PROFILES.isr2911;
    case "switch-l2":
      return HARDWARE_PROFILES["catalyst2960-24tt"];
    case "switch-l3":
      return HARDWARE_PROFILES["catalyst3650-24ps"];
    case "pc":
    case "laptop":
      return HARDWARE_PROFILES["pc-pt"];
    case "server":
      return HARDWARE_PROFILES["server-pt"];
    default:
      return undefined;
  }
}

const LONG_TO_SHORT: Array<[RegExp, string]> = [
  [/^gigabitethernet/i, "Gi"],
  [/^fastethernet/i, "Fa"],
  [/^serial/i, "Se"],
  [/^loopback/i, "Lo"],
  [/^gig(?=\d)/i, "Gi"],
  [/^gi(?=\d)/i, "Gi"],
  [/^fa(?=\d)/i, "Fa"],
  [/^se(?=\d)/i, "Se"],
  [/^lo(?=\d)/i, "Lo"],
  [/^vlan\s*/i, "Vlan"],
  [/^port-?channel\s*/i, "Po"],
  [/^po(?=\d)/i, "Po"],
];

/** Normalisiert Interface-Namen auf die Kurzform: "GigabitEthernet0/0" -> "Gi0/0". */
export function normalizeInterfaceName(name: string): string {
  const n = name.trim().replace(/\s*\(.*\)$/, "");
  for (const [re, short] of LONG_TO_SHORT) {
    if (re.test(n)) return n.replace(re, short);
  }
  return n;
}

/** Basisname ohne Subinterface-Suffix: "Gi0/0.10" -> "Gi0/0". */
export function baseInterfaceName(name: string): string {
  return normalizeInterfaceName(name).replace(/\.\d+$/, "");
}

export function profileHasInterface(profile: HardwareProfile, name: string): boolean {
  const n = baseInterfaceName(name);
  if (profile.ports.includes(n)) return true;
  return (profile.virtual ?? []).some((v) => (v === "Vlan1" ? /^Vlan\d+$/.test(n) : v === "Lo0" ? /^Lo\d+$/.test(n) : v === n)) || /^Po\d+$/.test(n);
}

const idOf = (deviceId: string, name: string) => `${deviceId}-${name.replace(/[^A-Za-z0-9]/g, "-")}`;

/** Interfaces eines Profils als Topologie-Interfaces (ohne IP-Konfiguration). */
export function interfacesForProfile(profile: HardwareProfile, deviceId: string): TopologyInterface[] {
  return profile.ports.map((p) => ({ id: idOf(deviceId, p), name: p, status: "up" as const }));
}

export function interfaceIdFor(deviceId: string, name: string): string {
  return idOf(deviceId, normalizeInterfaceName(name));
}
