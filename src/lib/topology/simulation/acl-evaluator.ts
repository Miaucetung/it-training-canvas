import type { SimulatedPacket } from "./types";

export interface AclMatchResult {
  action: "permit" | "deny" | "not-evaluated";
  matchedRule?: string;
  ruleIndex?: number;
  reason: string;
}

/** Prüft, ob eine IP auf eine Regel-IP mit Wildcard-Maske passt. */
export function matchesWildcard(ip: string, ruleIp: string, wildcard: string): boolean {
  const ipOctets = ip.split(".").map(Number);
  const ruleOctets = ruleIp.split(".").map(Number);
  const wcOctets = wildcard.split(".").map(Number);

  if (ipOctets.length !== 4 || ruleOctets.length !== 4 || wcOctets.length !== 4) return false;

  for (let i = 0; i < 4; i++) {
    const mask = ~wcOctets[i] & 0xff;
    if ((ipOctets[i] & mask) !== (ruleOctets[i] & mask)) {
      return false;
    }
  }
  return true;
}

/** Token-Parser für IP-Spezifikation: 'any', 'host <ip>' oder '<ip> <wildcard>' */
function parseIpSpec(tokens: string[], startIndex: number): { ip: string; wildcard: string; nextIndex: number } | null {
  if (startIndex >= tokens.length) return null;
  const t = tokens[startIndex].toLowerCase();

  if (t === "any") {
    return { ip: "0.0.0.0", wildcard: "255.255.255.255", nextIndex: startIndex + 1 };
  }
  if (t === "host") {
    const ip = tokens[startIndex + 1];
    if (!ip) return null;
    return { ip, wildcard: "0.0.0.0", nextIndex: startIndex + 2 };
  }
  // IP gefolgt von optionaler Wildcard
  const ip = tokens[startIndex];
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return null;

  const nextToken = tokens[startIndex + 1];
  if (nextToken && /^\d{1,3}(?:\.\d{1,3}){3}$/.test(nextToken)) {
    return { ip, wildcard: nextToken, nextIndex: startIndex + 2 };
  }
  // Standard-Wildcard ohne zweite Angabe ist 0.0.0.0 (Host)
  return { ip, wildcard: "0.0.0.0", nextIndex: startIndex + 1 };
}

/** Port-Namen zu Nummern */
const PORT_NAMES: Record<string, number> = {
  echo: 7,
  ftp: 21,
  ssh: 22,
  telnet: 23,
  smtp: 25,
  dns: 53,
  domain: 53,
  http: 80,
  www: 80,
  pop3: 110,
  ntp: 123,
  https: 443,
  snmp: 161,
};

function parsePort(val?: string): number | undefined {
  if (!val) return undefined;
  const num = Number(val);
  if (!isNaN(num)) return num;
  return PORT_NAMES[val.toLowerCase()];
}

/** Wertet eine einzelne ACL-Zeile (ACE) gegen ein Paket aus. */
export function evaluateAce(line: string, packet: SimulatedPacket): { matched: boolean; action: "permit" | "deny" } | null {
  const clean = line.replace(/^\s*(?:ip\s+access-list\s+(?:standard|extended)\s+\S+\s*)?/, "").trim();
  if (!clean || clean.startsWith("remark") || clean.startsWith("!")) return null;

  // Format: [access-list <num>] (permit|deny) ...
  const tokens = clean.split(/\s+/);
  let idx = 0;
  if (tokens[idx]?.toLowerCase() === "access-list") {
    idx += 2; // skip "access-list" and number
  }

  const actionStr = tokens[idx]?.toLowerCase();
  if (actionStr !== "permit" && actionStr !== "deny") return null;
  const action = actionStr as "permit" | "deny";
  idx++;

  if (idx >= tokens.length) return null;

  const nextTok = tokens[idx]?.toLowerCase();
  const isProto = ["ip", "icmp", "tcp", "udp", "ospf", "eigrp", "gre"].includes(nextTok);

  if (isProto) {
    // Extended ACL
    const proto = nextTok;
    idx++;

    // Protokoll-Match
    if (proto !== "ip") {
      if (proto !== packet.protocol) return { matched: false, action };
    }

    // Source IP
    const srcSpec = parseIpSpec(tokens, idx);
    if (!srcSpec) return null;
    idx = srcSpec.nextIndex;

    // Optionaler Quell-Port: eq <port>
    let srcPortFilter: number | undefined;
    if (tokens[idx]?.toLowerCase() === "eq") {
      srcPortFilter = parsePort(tokens[idx + 1]);
      idx += 2;
    }

    // Destination IP
    const dstSpec = parseIpSpec(tokens, idx);
    if (!dstSpec) return null;
    idx = dstSpec.nextIndex;

    // Optionaler Ziel-Port oder ICMP-Typ
    let dstPortFilter: number | undefined;
    let icmpTypeFilter: string | undefined;

    if (tokens[idx]?.toLowerCase() === "eq") {
      dstPortFilter = parsePort(tokens[idx + 1]);
      idx += 2;
    } else if (proto === "icmp" && tokens[idx]) {
      const icmpTok = tokens[idx].toLowerCase();
      if (icmpTok === "echo" || icmpTok === "echo-reply") {
        icmpTypeFilter = icmpTok;
        idx++;
      }
    }

    // Prüfe IP Matches
    if (!matchesWildcard(packet.srcIp, srcSpec.ip, srcSpec.wildcard)) {
      return { matched: false, action };
    }
    if (!matchesWildcard(packet.dstIp, dstSpec.ip, dstSpec.wildcard)) {
      return { matched: false, action };
    }

    // Prüfe Port / ICMP Matches
    if (srcPortFilter !== undefined && packet.srcPort !== srcPortFilter) {
      return { matched: false, action };
    }
    if (dstPortFilter !== undefined && packet.dstPort !== dstPortFilter) {
      return { matched: false, action };
    }
    if (icmpTypeFilter && packet.icmpType && packet.icmpType !== icmpTypeFilter) {
      return { matched: false, action };
    }

    return { matched: true, action };
  } else {
    // Standard ACL (filtert nur nach Source-IP)
    const srcSpec = parseIpSpec(tokens, idx);
    if (!srcSpec) return null;

    if (matchesWildcard(packet.srcIp, srcSpec.ip, srcSpec.wildcard)) {
      return { matched: true, action };
    }
    return { matched: false, action };
  }
}

/**
 * Wertet eine ACL (Liste von ACE-Zeilen) sequenziell aus.
 * Cisco IOS Regel: Erste übereinstimmende Zeile gewinnt; falls keine passt, gilt implicit deny.
 */
export function evaluateAcl(
  aclNameOrNum: string,
  rules: string[] | undefined,
  packet: SimulatedPacket,
  direction: "in" | "out",
): AclMatchResult {
  if (!rules || rules.length === 0) {
    return {
      action: "not-evaluated",
      reason: `ACL ${aclNameOrNum} ist nicht definiert oder enthält keine Regeln.`,
    };
  }

  for (let i = 0; i < rules.length; i++) {
    const line = rules[i];
    const res = evaluateAce(line, packet);
    if (res && res.matched) {
      return {
        action: res.action,
        matchedRule: line.trim(),
        ruleIndex: i + 1,
        reason:
          res.action === "permit"
            ? `Erlaubt durch ACL ${aclNameOrNum} (Zeile ${i + 1}: ${line.trim()}) [${direction.toUpperCase()}]`
            : `Verworfen durch ACL ${aclNameOrNum} (Zeile ${i + 1}: ${line.trim()}) [${direction.toUpperCase()}]`,
      };
    }
  }

  // Implicit Deny Any
  return {
    action: "deny",
    matchedRule: "implicit deny any",
    reason: `Verworfen durch ACL ${aclNameOrNum} (implizites deny any am Ende der ACL) [${direction.toUpperCase()}]`,
  };
}
