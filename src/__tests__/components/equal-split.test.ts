import { describe, it, expect } from "vitest";
import { calculateEqualSplit } from "@/components/SubnetSegmentationTool";

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, o) => (acc << 8) | parseInt(o, 10), 0) >>> 0;
}

describe("calculateEqualSplit", () => {
  it("192.168.1.0/24 in 4 gleich große Subnetze → /26", () => {
    const r = calculateEqualSplit(ipToNum("192.168.1.0"), 24, 4);
    expect(typeof r).not.toBe("string");
    if (typeof r === "string") return;
    expect(r.newPrefix).toBe(26);
    expect(r.subnetBits).toBe(2);
    expect(r.total).toBe(4);
    expect(r.blockSize).toBe(64);
    expect(r.results.map((s) => `${s.networkAddress}/${s.cidr}`)).toEqual([
      "192.168.1.0/26",
      "192.168.1.64/26",
      "192.168.1.128/26",
      "192.168.1.192/26",
    ]);
    expect(r.results[0].broadcast).toBe("192.168.1.63");
    expect(r.results[3].broadcast).toBe("192.168.1.255");
    expect(r.results[0].usableHosts).toBe(62);
  });

  it("rundet auf die nächste Zweierpotenz auf (5 → 8 Subnetze, /27)", () => {
    const r = calculateEqualSplit(ipToNum("10.0.0.0"), 24, 5);
    if (typeof r === "string") throw new Error(r);
    expect(r.total).toBe(8);
    expect(r.newPrefix).toBe(27);
    expect(r.blockSize).toBe(32);
  });

  it("teilt ein /22 anhand der Netz-ID korrekt (Class-B-Bereich)", () => {
    const r = calculateEqualSplit(ipToNum("172.16.0.0"), 22, 4);
    if (typeof r === "string") throw new Error(r);
    expect(r.newPrefix).toBe(24);
    expect(r.results.map((s) => s.networkAddress)).toEqual([
      "172.16.0.0",
      "172.16.1.0",
      "172.16.2.0",
      "172.16.3.0",
    ]);
  });

  it("lehnt zu feine Unterteilung ab (> /30)", () => {
    expect(typeof calculateEqualSplit(ipToNum("192.168.1.0"), 30, 4)).toBe("string");
  });

  it("verlangt mindestens 2 Subnetze", () => {
    expect(typeof calculateEqualSplit(ipToNum("10.0.0.0"), 24, 1)).toBe("string");
  });
});
