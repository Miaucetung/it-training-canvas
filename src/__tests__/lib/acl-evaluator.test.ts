import { describe, it, expect } from "vitest";
import { evaluateAcl, matchesWildcard } from "@/lib/topology/simulation/acl-evaluator";
import type { SimulatedPacket } from "@/lib/topology/simulation/types";

describe("matchesWildcard", () => {
  it("prüft Host-Wildcard (0.0.0.0)", () => {
    expect(matchesWildcard("192.168.1.10", "192.168.1.10", "0.0.0.0")).toBe(true);
    expect(matchesWildcard("192.168.1.11", "192.168.1.10", "0.0.0.0")).toBe(false);
  });

  it("prüft Subnetz-Wildcard (0.0.0.255)", () => {
    expect(matchesWildcard("192.168.1.100", "192.168.1.0", "0.0.0.255")).toBe(true);
    expect(matchesWildcard("192.168.2.100", "192.168.1.0", "0.0.0.255")).toBe(false);
  });

  it("prüft Any-Wildcard (255.255.255.255)", () => {
    expect(matchesWildcard("10.1.2.3", "0.0.0.0", "255.255.255.255")).toBe(true);
  });
});

describe("Standard ACL Evaluierung", () => {
  const rules = [
    "access-list 10 permit 192.168.1.0 0.0.0.255",
    "access-list 10 deny 192.168.2.0 0.0.0.255",
    "access-list 10 permit any",
  ];

  it("erlaubt Host im ersten Subnetz", () => {
    const pkt: SimulatedPacket = {
      id: "1",
      type: "icmp-echo",
      srcIp: "192.168.1.50",
      dstIp: "10.0.0.1",
      protocol: "icmp",
      ttl: 64,
      srcMac: "MAC(PC1)",
      dstMac: "MAC(R1)",
    };
    const res = evaluateAcl("10", rules, pkt, "in");
    expect(res.action).toBe("permit");
    expect(res.ruleIndex).toBe(1);
  });

  it("blockiert Host im zweiten Subnetz", () => {
    const pkt: SimulatedPacket = {
      id: "2",
      type: "icmp-echo",
      srcIp: "192.168.2.50",
      dstIp: "10.0.0.1",
      protocol: "icmp",
      ttl: 64,
      srcMac: "MAC(PC2)",
      dstMac: "MAC(R1)",
    };
    const res = evaluateAcl("10", rules, pkt, "in");
    expect(res.action).toBe("deny");
    expect(res.ruleIndex).toBe(2);
  });

  it("greift auf implicit deny zurück wenn keine Regel matcht", () => {
    const noAnyRules = [
      "access-list 10 permit 192.168.1.0 0.0.0.255",
    ];
    const pkt: SimulatedPacket = {
      id: "3",
      type: "icmp-echo",
      srcIp: "172.16.0.1",
      dstIp: "10.0.0.1",
      protocol: "icmp",
      ttl: 64,
      srcMac: "MAC(PC3)",
      dstMac: "MAC(R1)",
    };
    const res = evaluateAcl("10", noAnyRules, pkt, "out");
    expect(res.action).toBe("deny");
    expect(res.matchedRule).toBe("implicit deny any");
  });
});

describe("Extended ACL Evaluierung (Protokoll, Ports, ICMP Typen)", () => {
  const namedAcl = [
    "deny tcp host 192.168.1.20 host 192.168.2.100 eq 80",
    "permit icmp 192.168.10.0 0.0.0.255 host 200.10.20.20 echo",
    "permit ip any any",
  ];

  it("blockiert gezielt TCP Port 80 von bestimmtem Host", () => {
    const httpPkt: SimulatedPacket = {
      id: "http",
      type: "icmp-echo",
      srcIp: "192.168.1.20",
      dstIp: "192.168.2.100",
      protocol: "tcp",
      dstPort: 80,
      ttl: 64,
      srcMac: "MAC(PC1)",
      dstMac: "MAC(R1)",
    };
    const res = evaluateAcl("BLOCK_HTTP", namedAcl, httpPkt, "in");
    expect(res.action).toBe("deny");
    expect(res.ruleIndex).toBe(1);
  });

  it("erlaubt anderen TCP Port vom selben Host durch permit ip any any", () => {
    const sshPkt: SimulatedPacket = {
      id: "ssh",
      type: "icmp-echo",
      srcIp: "192.168.1.20",
      dstIp: "192.168.2.100",
      protocol: "tcp",
      dstPort: 22,
      ttl: 64,
      srcMac: "MAC(PC1)",
      dstMac: "MAC(R1)",
    };
    const res = evaluateAcl("BLOCK_HTTP", namedAcl, sshPkt, "in");
    expect(res.action).toBe("permit");
    expect(res.ruleIndex).toBe(3);
  });

  it("erlaubt passenden ICMP echo request", () => {
    const icmpEcho: SimulatedPacket = {
      id: "ping",
      type: "icmp-echo",
      srcIp: "192.168.10.5",
      dstIp: "200.10.20.20",
      protocol: "icmp",
      icmpType: "echo",
      ttl: 64,
      srcMac: "MAC(PC1)",
      dstMac: "MAC(R1)",
    };
    const res = evaluateAcl("BLOCK_HTTP", namedAcl, icmpEcho, "in");
    expect(res.action).toBe("permit");
    expect(res.ruleIndex).toBe(2);
  });
});
