import {
  ChannelGroupMode,
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
} from "@/types/topology";

// ============================================================================
// CCNA 200-301 Topologie-Validierung & Didaktische Netzwerk-Diagnostik
// ============================================================================

export type IssueSeverity = "warning" | "info" | "error";

export interface TopologyValidationIssue {
  id: string;
  code:
    | "HOST_GATEWAY_NOT_IN_SUBNET"
    | "TRUNK_NATIVE_VLAN_MISMATCH"
    | "ACCESS_VLAN_MISMATCH"
    | "ETHERCHANNEL_INCOMPATIBLE_MODES"
    | "ETHERCHANNEL_MISMATCHED_MEMBERS"
    | "ETHERCHANNEL_MEMBER_INCONSISTENCY"
    | "ROUTER_GATEWAY_MISSING_IP"
    | "DUPLICATE_IP_ADDRESS";
  severity: IssueSeverity;
  deviceId?: string;
  interfaceId?: string;
  linkId?: string;
  title: string;
  message: string;
  didacticExplanation: string;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. IP-Adress- und Subnetz-Mathematik
// ────────────────────────────────────────────────────────────────────────────

export function isValidIpv4(ipStr: string): boolean {
  const parts = ipStr.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (!/^\d+$/.test(p)) return false;
    const n = parseInt(p, 10);
    return n >= 0 && n <= 255;
  });
}

export function ipToNumber(ip: string): number {
  return (
    ip
      .trim()
      .split(".")
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  );
}

export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

export function cidrToNetmask(prefix: number): number {
  if (prefix === 0) return 0;
  return (~0 << (32 - prefix)) >>> 0;
}

export function netmaskToPrefix(netmaskStr: string): number {
  const num = ipToNumber(netmaskStr);
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((num & (1 << i)) !== 0) count++;
    else break;
  }
  return count;
}

export function parseIpCidr(ipCidr: string): {
  ip: string;
  prefix: number;
  networkIp: string;
  broadcastIp: string;
  netmask: string;
} | null {
  const parts = ipCidr.trim().split("/");
  if (parts.length !== 2) return null;
  const ip = parts[0];
  const prefix = parseInt(parts[1], 10);
  if (!isValidIpv4(ip) || isNaN(prefix) || prefix < 0 || prefix > 32) return null;

  const ipNum = ipToNumber(ip);
  const maskNum = cidrToNetmask(prefix);
  const netNum = (ipNum & maskNum) >>> 0;
  const bcastNum = (netNum | ~maskNum) >>> 0;

  return {
    ip,
    prefix,
    networkIp: numberToIp(netNum),
    broadcastIp: numberToIp(bcastNum),
    netmask: numberToIp(maskNum),
  };
}

export function areIpsInSameSubnet(
  ip1: string,
  ip2: string,
  prefixOrMask: number | string
): boolean {
  if (!isValidIpv4(ip1) || !isValidIpv4(ip2)) return false;
  const prefix =
    typeof prefixOrMask === "number"
      ? prefixOrMask
      : netmaskToPrefix(prefixOrMask);
  const mask = cidrToNetmask(prefix);
  const n1 = (ipToNumber(ip1) & mask) >>> 0;
  const n2 = (ipToNumber(ip2) & mask) >>> 0;
  return n1 === n2;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Host Default-Gateway Validierung
// ────────────────────────────────────────────────────────────────────

export function validateHostGateway(
  hostIpCidr?: string,
  gatewayIp?: string
): { valid: boolean; issue?: TopologyValidationIssue } {
  if (!hostIpCidr || !gatewayIp) return { valid: true };

  const parsed = parseIpCidr(hostIpCidr);
  if (!parsed || !isValidIpv4(gatewayIp)) return { valid: true };

  const inSameSubnet = areIpsInSameSubnet(parsed.ip, gatewayIp, parsed.prefix);
  if (!inSameSubnet) {
    return {
      valid: false,
      issue: {
        id: `gateway-mismatch-${parsed.ip}-${gatewayIp}`,
        code: "HOST_GATEWAY_NOT_IN_SUBNET",
        severity: "warning",
        title: "Default Gateway außerhalb des lokalen Subnetzes",
        message: `Das konfigurierte Default Gateway ${gatewayIp} liegt nicht im Subnetz ${parsed.networkIp}/${parsed.prefix} des Hosts (${parsed.ip}).`,
        didacticExplanation:
          "Ein Host kann IP-Pakete nur an ein Gateway senden, das im selben Layer-2-Broadcast-Segment liegt. Liegt die Gateway-IP in einem fremden Subnetz, schlägt die ARP-Auflösung (Address Resolution Protocol) fehl und der Host kann das Subnetz nicht verlassen.",
      },
    };
  }

  // Warnung wenn Gateway = Host-eigene IP
  if (parsed.ip === gatewayIp) {
    return {
      valid: false,
      issue: {
        id: `gateway-self-${parsed.ip}`,
        code: "HOST_GATEWAY_NOT_IN_SUBNET",
        severity: "warning",
        title: "Gateway entspricht eigener IP-Adresse",
        message: `Der Host ${parsed.ip} hat seine eigene IP als Default Gateway eingetragen.`,
        didacticExplanation:
          "Ein Default Gateway muss ein Router- oder Layer-3-Switch-Port sein, nicht der Host selbst.",
      },
    };
  }

  return { valid: true };
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Trunk Native-VLAN Mismatch (Cisco CDP Warning)
// ────────────────────────────────────────────────────────────────────────────

export function checkNativeVlanMismatches(
  topology: NetworkTopology
): TopologyValidationIssue[] {
  const issues: TopologyValidationIssue[] = [];
  const deviceMap = new Map<string, TopologyDevice>();
  for (const d of topology.devices) deviceMap.set(d.id, d);

  for (const link of topology.links) {
    if (link.linkType !== "trunk" && link.linkType !== "ethernet") continue;

    const srcDev = deviceMap.get(link.sourceDeviceId);
    const tgtDev = deviceMap.get(link.targetDeviceId);
    if (!srcDev || !tgtDev) continue;

    const srcIface = srcDev.interfaces.find((i) => i.id === link.sourceInterfaceId);
    const tgtIface = tgtDev.interfaces.find((i) => i.id === link.targetInterfaceId);
    if (!srcIface || !tgtIface) continue;

    // Nur prüfen wenn mindestens eine Seite Trunk ist oder nativeVlan explizit gesetzt ist
    const isSrcTrunk = srcIface.mode === "trunk" || link.linkType === "trunk";
    const isTgtTrunk = tgtIface.mode === "trunk" || link.linkType === "trunk";

    if (isSrcTrunk && isTgtTrunk) {
      const srcNative = srcIface.nativeVlan ?? 1;
      const tgtNative = tgtIface.nativeVlan ?? 1;

      if (srcNative !== tgtNative) {
        issues.push({
          id: `native-vlan-mismatch-${link.id}`,
          code: "TRUNK_NATIVE_VLAN_MISMATCH",
          severity: "warning",
          linkId: link.id,
          title: "Native VLAN Mismatch auf 802.1Q Trunk",
          message: `Trunk-Link zwischen ${srcDev.name} (${srcIface.name}, Native VLAN ${srcNative}) und ${tgtDev.name} (${tgtIface.name}, Native VLAN ${tgtNative}) hat abweichende Native VLANs.`,
          didacticExplanation:
            "Cisco Switche erkennen diesen Zustand per CDP und werfen die Warnung '%CDP-4-NATIVE_VLAN_MISMATCH'. Ungetaggte Frames auf Gerät A werden auf Gerät B dem falschen VLAN zugeordnet (VLAN Leaking / Sicherheitsrisiko). STP blockiert den Port ggf. per Type Inconsistency.",
        });
      }
    }
  }

  return issues;
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Access-VLAN Mismatch (VLAN Leaking zwischen Switchports)
// ────────────────────────────────────────────────────────────────────────────

export function checkAccessVlanMismatches(
  topology: NetworkTopology
): TopologyValidationIssue[] {
  const issues: TopologyValidationIssue[] = [];
  const deviceMap = new Map<string, TopologyDevice>();
  for (const d of topology.devices) deviceMap.set(d.id, d);

  for (const link of topology.links) {
    if (link.linkType !== "ethernet") continue;

    const srcDev = deviceMap.get(link.sourceDeviceId);
    const tgtDev = deviceMap.get(link.targetDeviceId);
    if (!srcDev || !tgtDev) continue;

    // Nur zwischen zwei Switchen im Access Mode
    const isSrcSwitch = srcDev.type === "switch-l2" || srcDev.type === "switch-l3";
    const isTgtSwitch = tgtDev.type === "switch-l2" || tgtDev.type === "switch-l3";
    if (!isSrcSwitch || !isTgtSwitch) continue;

    const srcIface = srcDev.interfaces.find((i) => i.id === link.sourceInterfaceId);
    const tgtIface = tgtDev.interfaces.find((i) => i.id === link.targetInterfaceId);
    if (!srcIface || !tgtIface) continue;

    const isSrcAccess = srcIface.mode !== "trunk" && srcIface.mode !== "routed";
    const isTgtAccess = tgtIface.mode !== "trunk" && tgtIface.mode !== "routed";

    if (isSrcAccess && isTgtAccess) {
      const srcVlan = srcIface.vlan ?? 1;
      const tgtVlan = tgtIface.vlan ?? 1;

      if (srcVlan !== tgtVlan) {
        issues.push({
          id: `access-vlan-mismatch-${link.id}`,
          code: "ACCESS_VLAN_MISMATCH",
          severity: "warning",
          linkId: link.id,
          title: "Access VLAN Mismatch (VLAN Leaking)",
          message: `Direkte Switch-Verbindung zwischen ${srcDev.name} (${srcIface.name}, VLAN ${srcVlan}) und ${tgtDev.name} (${tgtIface.name}, VLAN ${tgtVlan}) verbindet unterschiedliche VLANs ohne Router.`,
          didacticExplanation:
            "Da Access-Ports keine 802.1Q-Tags mitsenden, fließen ungetaggte Ethernet-Frames von VLAN " +
            srcVlan +
            " direkt in VLAN " +
            tgtVlan +
            ". Dies überbrückt die geplante Netzwerk-Segmentierung unbemerkt.",
        });
      }
    }
  }

  return issues;
}

// ────────────────────────────────────────────────────────────────────────────
// 5. EtherChannel Kompatibilitätsmatrix (LACP, PAgP, Statisch)
// ────────────────────────────────────────────────────────────────────────────

export interface EtherChannelCompatibilityResult {
  compatible: boolean;
  channelOperational: boolean;
  protocol: "lacp" | "pagp" | "static" | "incompatible";
  explanation: string;
}

/**
 * Validiert die Kompatibilität zweier Channel-Group Modi nach Cisco CCNA Standard.
 *
 * Matrix:
 * - LACP (802.3ad): active / passive
 *   active + active   -> OK (LACP)
 *   active + passive  -> OK (LACP)
 *   passive + passive -> DOWN (Beide lauschen nur passiv)
 * - PAgP (Cisco): desirable / auto
 *   desirable + desirable -> OK (PAgP)
 *   desirable + auto      -> OK (PAgP)
 *   auto + auto           -> DOWN (Beide warten auf Verhandlungspakete)
 * - Statisch: on
 *   on + on               -> OK (Static unconditionally)
 *   on + (beliebig)       -> INKOMPATIBEL (on sendet keine Pakete; Gegenseite blockiert)
 * - Mischung LACP / PAgP  -> INKOMPATIBEL
 */
export function evaluateEtherChannelModes(
  modeA: ChannelGroupMode,
  modeB: ChannelGroupMode
): EtherChannelCompatibilityResult {
  const isLacpA = modeA === "active" || modeA === "passive";
  const isLacpB = modeB === "active" || modeB === "passive";

  const isPagpA = modeA === "desirable" || modeA === "auto";
  const isPagpB = modeB === "desirable" || modeB === "auto";

  const isStaticA = modeA === "on";
  const isStaticB = modeB === "on";

  // 1. Statisch (mode on)
  if (isStaticA && isStaticB) {
    return {
      compatible: true,
      channelOperational: true,
      protocol: "static",
      explanation:
        "Statische Bündelung ('channel-group mode on'): Beide Enden bündeln die Links bedingungslos ohne Aushandlungsprotokoll.",
    };
  }

  if (isStaticA || isStaticB) {
    return {
      compatible: false,
      channelOperational: false,
      protocol: "incompatible",
      explanation:
        "Inkompatibel: Der Modus 'on' verhandelt nicht. Die Gegenseite erwartet Protokollpakete (LACP/PAgP). Der Port-Channel wird durch Spanning Tree oder Channel Misconfig Guard blockiert.",
    };
  }

  // 2. LACP (IEEE 802.3ad / 802.1AX)
  if (isLacpA && isLacpB) {
    if (modeA === "passive" && modeB === "passive") {
      return {
        compatible: false,
        channelOperational: false,
        protocol: "lacp",
        explanation:
          "Inkompatible LACP-Konfiguration ('passive' ↔ 'passive'): Beide Switche warten ausschließlich passiv auf LACP-Pakete der Gegenseite. Es wird kein EtherChannel aufgebaut.",
      };
    }
    return {
      compatible: true,
      channelOperational: true,
      protocol: "lacp",
      explanation:
        modeA === "active" && modeB === "active"
          ? "Erfolgreicher LACP EtherChannel ('active' ↔ 'active'): Beide Seiten initiieren aktiv die LACP-Aushandlung."
          : "Erfolgreicher LACP EtherChannel ('active' ↔ 'passive'): Die aktive Seite initiiert die LACP-Aushandlung; die passive antwortet.",
    };
  }

  // 3. PAgP (Cisco proprietär)
  if (isPagpA && isPagpB) {
    if (modeA === "auto" && modeB === "auto") {
      return {
        compatible: false,
        channelOperational: false,
        protocol: "pagp",
        explanation:
          "Inkompatible PAgP-Konfiguration ('auto' ↔ 'auto'): Beide Switche lauschen stumm auf PAgP-Pakete. Ein Channel-Aufbau kommt niemals zustande.",
      };
    }
    return {
      compatible: true,
      channelOperational: true,
      protocol: "pagp",
      explanation:
        modeA === "desirable" && modeB === "desirable"
          ? "Erfolgreicher PAgP EtherChannel ('desirable' ↔ 'desirable'): Beide Endpunkte verhandeln aktiv."
          : "Erfolgreicher PAgP EtherChannel ('desirable' ↔ 'auto'): Die desirable-Seite stößt die PAgP-Bündelung an.",
    };
  }

  // 4. Protokoll-Mischung LACP mit PAgP
  return {
    compatible: false,
    channelOperational: false,
    protocol: "incompatible",
    explanation: `Protokoll-Konflikt: Seite A nutzt ${
      isLacpA ? "LACP (" + modeA + ")" : "PAgP (" + modeA + ")"
    }, während Seite B ${
      isLacpB ? "LACP (" + modeB + ")" : "PAgP (" + modeB + ")"
    } nutzt. LACP und PAgP sind inkompatible Protokolle.`,
  };
}

/**
 * Durchsucht alle konfigurierten Port-Channels in der Topologie nach Inkompatibilitäten.
 */
export function checkEtherChannelCompatibility(
  topology: NetworkTopology
): TopologyValidationIssue[] {
  const issues: TopologyValidationIssue[] = [];
  const deviceMap = new Map<string, TopologyDevice>();
  for (const d of topology.devices) deviceMap.set(d.id, d);

  // Finde Links, deren beteiligte Interfaces einer channel-group angehören
  for (const link of topology.links) {
    const srcDev = deviceMap.get(link.sourceDeviceId);
    const tgtDev = deviceMap.get(link.targetDeviceId);
    if (!srcDev || !tgtDev) continue;

    const srcIface = srcDev.interfaces.find((i) => i.id === link.sourceInterfaceId);
    const tgtIface = tgtDev.interfaces.find((i) => i.id === link.targetInterfaceId);
    if (!srcIface || !tgtIface) continue;

    if (srcIface.channelGroup && tgtIface.channelGroup) {
      const modeA = srcIface.channelGroup.mode;
      const modeB = tgtIface.channelGroup.mode;

      const evalRes = evaluateEtherChannelModes(modeA, modeB);
      if (!evalRes.compatible || !evalRes.channelOperational) {
        issues.push({
          id: `etherchannel-incompatible-${link.id}`,
          code: "ETHERCHANNEL_INCOMPATIBLE_MODES",
          severity: "warning",
          linkId: link.id,
          deviceId: srcDev.id,
          title: `EtherChannel Inkompatibilität (${srcDev.name} Po${srcIface.channelGroup.id} ↔ ${tgtDev.name} Po${tgtIface.channelGroup.id})`,
          message: evalRes.explanation,
          didacticExplanation:
            "Damit ein EtherChannel funktionsfähig gebündelt werden kann, muss mindestens ein Partner aktiv sprechen (LACP: mindestens ein 'active'; PAgP: mindestens ein 'desirable') oder beide müssen synchron im statischen Modus 'on' betrieben werden.",
        });
      }
    }
  }

  return issues;
}

// ────────────────────────────────────────────────────────────────────────────
// 5b. EtherChannel Member-Port-Konsistenzprüfung (%EC-5-CANNOT_BUNDLE2)
// ────────────────────────────────────────────────────────────────────────────

export interface EtherChannelMemberConsistency {
  isConsistent: boolean;
  leadInterface?: TopologyInterface;
  inconsistentPorts: Array<{
    iface: TopologyInterface;
    reason: string;
  }>;
}

export function checkEtherChannelMemberConsistency(
  device: TopologyDevice,
  channelGroupId: number
): EtherChannelMemberConsistency {
  const memberIfaces = device.interfaces.filter(
    (i) => i.channelGroup?.id === channelGroupId
  );

  if (memberIfaces.length <= 1) {
    return { isConsistent: true, leadInterface: memberIfaces[0], inconsistentPorts: [] };
  }

  const lead = memberIfaces[0];
  const leadMode = lead.mode || "access";
  const leadVlan = lead.vlan ?? 1;
  const leadNativeVlan = lead.nativeVlan ?? 1;
  const leadAllowed = (lead.allowedVlans || []).slice().sort().join(",");

  const inconsistent: Array<{ iface: TopologyInterface; reason: string }> = [];

  for (let i = 1; i < memberIfaces.length; i++) {
    const cur = memberIfaces[i];
    const curMode = cur.mode || "access";
    const curVlan = cur.vlan ?? 1;
    const curNativeVlan = cur.nativeVlan ?? 1;
    const curAllowed = (cur.allowedVlans || []).slice().sort().join(",");

    if (curMode !== leadMode) {
      inconsistent.push({
        iface: cur,
        reason: `Port-Modus weicht ab (${cur.name}: ${curMode} vs. ${lead.name}: ${leadMode})`,
      });
    } else if (curMode === "access" && curVlan !== leadVlan) {
      inconsistent.push({
        iface: cur,
        reason: `Access-VLAN weicht ab (${cur.name}: VLAN ${curVlan} vs. ${lead.name}: VLAN ${leadVlan})`,
      });
    } else if (curMode === "trunk") {
      if (curNativeVlan !== leadNativeVlan) {
        inconsistent.push({
          iface: cur,
          reason: `Native-VLAN weicht ab (${cur.name}: VLAN ${curNativeVlan} vs. ${lead.name}: VLAN ${leadNativeVlan})`,
        });
      } else if (curAllowed !== leadAllowed) {
        inconsistent.push({
          iface: cur,
          reason: `Trunk Allowed-VLANs weichen ab (${cur.name}: [${curAllowed || "alle"}] vs. ${lead.name}: [${leadAllowed || "alle"}])`,
        });
      }
    }
  }

  return {
    isConsistent: inconsistent.length === 0,
    leadInterface: lead,
    inconsistentPorts: inconsistent,
  };
}

export function checkEtherChannelMemberConsistencyAcrossTopology(
  topology: NetworkTopology
): TopologyValidationIssue[] {
  const issues: TopologyValidationIssue[] = [];

  for (const dev of topology.devices) {
    if (dev.type === "switch-l2" || dev.type === "switch-l3") {
      const channelIds = new Set<number>();
      for (const iface of dev.interfaces) {
        if (iface.channelGroup) channelIds.add(iface.channelGroup.id);
      }

      for (const chId of channelIds) {
        const consistency = checkEtherChannelMemberConsistency(dev, chId);
        if (!consistency.isConsistent) {
          for (const item of consistency.inconsistentPorts) {
            issues.push({
              id: `etherchannel-bundle-mismatch-${dev.id}-${chId}-${item.iface.id}`,
              code: "ETHERCHANNEL_MEMBER_INCONSISTENCY",
              severity: "warning",
              deviceId: dev.id,
              title: `%EC-5-CANNOT_BUNDLE2 auf ${dev.name} (Port-Channel ${chId})`,
              message: `%EC-5-CANNOT_BUNDLE2: ${item.iface.name} ist nicht kompatibel mit ${consistency.leadInterface?.name} und wird suspendiert (${item.reason}).`,
              didacticExplanation:
                "In Cisco IOS müssen alle Member-Ports eines EtherChannels (channel-group) exakt identische Schnittstellen-Parameter aufweisen (Access/Trunk-Modus, Access-VLAN bzw. Native- und Allowed-VLANs). Abweichende Ports können nicht gebündelt werden und wechseln in den Status 'suspended' (s).",
            });
          }
        }
      }
    }
  }

  return issues;
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Umfassende Topologie-Diagnose (Gesamtauswertung)
// ────────────────────────────────────────────────────────────────────────────

export function validateTopology(topology: NetworkTopology): {
  issues: TopologyValidationIssue[];
  warningsCount: number;
  infoCount: number;
} {
  const issues: TopologyValidationIssue[] = [];

  // 1. Host Gateways prüfen
  for (const device of topology.devices) {
    if (device.type === "pc" || device.type === "laptop" || device.type === "server") {
      const primaryIface = device.interfaces[0];
      const gateway = device.config?.defaultGateway;
      if (primaryIface?.ip && gateway) {
        const check = validateHostGateway(primaryIface.ip, gateway);
        if (!check.valid && check.issue) {
          issues.push({
            ...check.issue,
            deviceId: device.id,
          });
        }
      }
    }
  }

  // 2. Trunk Native VLAN Mismatches
  issues.push(...checkNativeVlanMismatches(topology));

  // 3. Access VLAN Mismatches
  issues.push(...checkAccessVlanMismatches(topology));

  // 4. EtherChannel Modi (Link-Level)
  issues.push(...checkEtherChannelCompatibility(topology));

  // 5. EtherChannel Member-Port-Konsistenz (Device-Level)
  issues.push(...checkEtherChannelMemberConsistencyAcrossTopology(topology));

  const warningsCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  return { issues, warningsCount, infoCount };
}

