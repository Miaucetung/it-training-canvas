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
  | "server-pt"
  | "isr2911-2hwic"
  | "iol-router"
  | "iol-switch"
  | "catalyst2960-4gi"
  | "extern";

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
  "isr2911-2hwic": {
    id: "isr2911-2hwic",
    model: "Cisco 2911 ISR (2x HWIC-2T)",
    deviceType: "router",
    // zweite HWIC-2T in Slot 1: Serial0/1/0 und Serial0/1/1
    ports: ["Gi0/0", "Gi0/1", "Gi0/2", "Se0/0/0", "Se0/0/1", "Se0/1/0", "Se0/1/1"],
    virtual: ["Lo0"],
    description: "3x Gigabit Ethernet onboard, 4x Serial (2x HWIC-2T)",
  },
  // Profile für IOL/GNS3-Labs mit Ethernet0/0-Namen (co-acl-nat-isp)
  "iol-router": {
    id: "iol-router",
    model: "Cisco IOL Router (Ethernet)",
    deviceType: "router",
    ports: ["Et0/0", "Et0/1", "Et0/2", "Et0/3"],
    virtual: ["Lo0"],
    description: "IOL-Router mit Ethernet0/0–0/3",
  },
  "iol-switch": {
    id: "iol-switch",
    model: "Cisco IOL Switch (Ethernet)",
    deviceType: "switch-l2",
    ports: ["Et0/0", "Et0/1", "Et0/2", "Et0/3"],
    virtual: ["Vlan1"],
    description: "IOL-Layer-2-Switch mit Ethernet0/0–0/3",
  },
  // Das Lab stp-hardening nennt den Port Gi0/3 (Dist1 ↔ Dist2)
  "catalyst2960-4gi": {
    id: "catalyst2960-4gi",
    model: "Catalyst 2960 (4x Gigabit-Uplink)",
    deviceType: "switch-l2",
    ports: [...range("Fa0/", 1, 24), "Gi0/1", "Gi0/2", "Gi0/3", "Gi0/4"],
    virtual: ["Vlan1"],
    description: "24x FastEthernet, 4x GigabitEthernet Uplink (laut Lab-Text Gi0/3)",
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
    virtual: ["Vlan1", "Lo0"],
    description: "Layer-3-Switch: 24x FastEthernet (PoE), 2x GigabitEthernet",
  },
  "catalyst3650-24ps": {
    id: "catalyst3650-24ps",
    model: "Catalyst 3650-24PS",
    deviceType: "switch-l3",
    ports: [...range("Gi1/0/", 1, 24), ...range("Gi1/1/", 1, 4)],
    virtual: ["Vlan1", "Lo0"],
    description: "Layer-3-Switch: 24x GigabitEthernet (PoE+), 4x SFP-Uplink",
  },
  "pc-pt": {
    id: "pc-pt",
    model: "PC-PT",
    deviceType: "pc",
    ports: ["Fa0"],
    description: "Endgerät mit FastEthernet0",
  },
  extern: {
    id: "extern",
    model: "Gegenstelle (im Lab nicht angegeben)",
    deviceType: "cloud",
    ports: [],
    description: "Gerät, das das Lab nur über Adresse/Next-Hop erwähnt",
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
  if (/\biol\b/.test(m)) return type === "router" ? HARDWARE_PROFILES["iol-router"] : type === "switch-l2" ? HARDWARE_PROFILES["iol-switch"] : undefined;
  if (/4\s*[x×]\s*gi/.test(m) && type === "switch-l2") return HARDWARE_PROFILES["catalyst2960-4gi"];
  if (/2hwic|2x hwic|2×hwic/.test(m) && type === "router") return HARDWARE_PROFILES["isr2911-2hwic"];
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
    case "cloud":
      return HARDWARE_PROFILES.extern;
    default:
      return undefined;
  }
}

const LONG_TO_SHORT: Array<[RegExp, string]> = [
  [/^gigabitethernet/i, "Gi"],
  [/^fastethernet/i, "Fa"],
  [/^serial/i, "Se"],
  [/^ethernet/i, "Et"],
  [/^eth(?=\d)/i, "Et"],
  [/^et(?=\d)/i, "Et"],
  [/^s(?=\d+\/\d+\/\d+)/i, "Se"],
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
  if (profile.deviceType === "router" && /^Tu\d+$/.test(n)) return true;
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
