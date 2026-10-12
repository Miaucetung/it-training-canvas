import { calculateSubnet } from "@/lib/subnet-calc";
import { describe, expect, it } from "vitest";

describe("calculateSubnet", () => {
  it("berechnet 192.168.10.77/27 exakt (Netz .64, Bcast .95, 30 Hosts, Maske .224)", () => {
    const res = calculateSubnet("192.168.10.77/27");
    expect(res.isValid).toBe(true);
    if (!res.isValid) return;

    expect(res.networkAddress).toBe("192.168.10.64");
    expect(res.broadcastAddress).toBe("192.168.10.95");
    expect(res.firstUsableHost).toBe("192.168.10.65");
    expect(res.lastUsableHost).toBe("192.168.10.94");
    expect(res.usableHosts).toBe(30);
    expect(res.subnetMask).toBe("255.255.255.224");
    expect(res.wildcardMask).toBe("0.0.0.31");
    expect(res.magicNumber).toBe(32);
    expect(res.interestingOctet).toBe(4);
    expect(res.ipClass).toBe("C");
    expect(res.isPrivate).toBe(true);
  });

  it("berechnet 10.0.4.150/22 (Klasse A, 1022 Hosts)", () => {
    const res = calculateSubnet("10.0.4.150/22");
    expect(res.isValid).toBe(true);
    if (!res.isValid) return;

    expect(res.networkAddress).toBe("10.0.4.0");
    expect(res.broadcastAddress).toBe("10.0.7.255");
    expect(res.firstUsableHost).toBe("10.0.4.1");
    expect(res.lastUsableHost).toBe("10.0.7.254");
    expect(res.usableHosts).toBe(1022);
    expect(res.subnetMask).toBe("255.255.252.0");
    expect(res.wildcardMask).toBe("0.0.3.255");
    expect(res.magicNumber).toBe(4);
    expect(res.interestingOctet).toBe(3);
    expect(res.isPrivate).toBe(true);
  });

  it("unterstützt RFC 3021 /31 (P2P mit 2 nutzbaren Adressen)", () => {
    const res = calculateSubnet("192.168.1.0/31");
    expect(res.isValid).toBe(true);
    if (!res.isValid) return;

    expect(res.usableHosts).toBe(2);
    expect(res.firstUsableHost).toBe("192.168.1.0");
    expect(res.lastUsableHost).toBe("192.168.1.1");
  });

  it("liefert saubere Fehlermeldung bei ungültiger Eingabe", () => {
    const res = calculateSubnet("invalid-ip");
    expect(res.isValid).toBe(false);
    if (res.isValid) return;
    expect(res.errorMessage).toContain("Ungültige");
  });
});
