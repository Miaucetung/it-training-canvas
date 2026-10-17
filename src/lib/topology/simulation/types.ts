import type { NetworkTopology } from "@/types/topology";

export type SimulationProtocol = "icmp" | "ip" | "tcp" | "udp";

export interface SimulatedPacket {
  id: string;
  type: "icmp-echo" | "icmp-echo-reply";
  srcIp: string;
  dstIp: string;
  protocol: SimulationProtocol;
  icmpType?: "echo" | "echo-reply";
  srcPort?: number;
  dstPort?: number;
  ttl: number;
  srcMac: string;
  dstMac: string;
}

export type DropReasonCode =
  | "no-gateway"
  | "wrong-subnet"
  | "no-route"
  | "acl-deny"
  | "vlan-mismatch"
  | "stp-blocked"
  | "interface-down"
  | "ttl-expired"
  | "arp-timeout"
  | "unreachable";

export type HopAction =
  | "originate"
  | "arp-resolve"
  | "switch"
  | "route"
  | "nat-inside-to-outside"
  | "nat-outside-to-inside"
  | "deliver"
  | "drop";

export interface HopStep {
  stepNumber: number;
  deviceId: string;
  deviceName: string;
  inInterface?: string;
  outInterface?: string;
  action: HopAction;
  reason: string;
  packet: SimulatedPacket;
  packetOut?: SimulatedPacket;
  natTranslation?: {
    direction: "inside-to-outside" | "outside-to-inside";
    beforeIp: string;
    afterIp: string;
  };
  status: "ok" | "dropped";
  dropReason?: DropReasonCode;
}

export interface SimulationResult {
  success: boolean;
  status:
    | "success"
    | "timeout"
    | "unreachable"
    | "ttl-expired"
    | "acl-denied"
    | "stp-blocked"
    | "no-route"
    | "no-gateway"
    | "interface-down";
  iosSummary: string; // e.g. ".!!!!", "!!!!!", "U.U.U", "....."
  explanation: string;
  forwardHops: HopStep[];
  returnHops: HopStep[];
  allHops: HopStep[];
  arpResolvedThisRun: boolean;
  routerArpLoss?: boolean;
  arpCache: Record<string, Record<string, string>>;
}

export interface SimulationOptions {
  topology: NetworkTopology;
  sourceDeviceId: string;
  sourceInterfaceId?: string;
  targetDeviceId?: string;
  targetIp?: string;
  protocol?: SimulationProtocol;
  port?: number;
  ttl?: number;
  arpCache?: Record<string, Record<string, string>>;
}
