import { describe, it, expect } from "vitest";
import {
  cidrToOctets,
  cidrRow,
  cidrTable,
  blockSizeTable,
  octetTable,
} from "@/lib/subnet-reference";

describe("cidrToOctets", () => {
  it("liefert korrekte Masken inkl. der Randfälle /0 und /32", () => {
    expect(cidrToOctets(0)).toEqual([0, 0, 0, 0]);
    expect(cidrToOctets(8)).toEqual([255, 0, 0, 0]);
    expect(cidrToOctets(16)).toEqual([255, 255, 0, 0]);
    expect(cidrToOctets(24)).toEqual([255, 255, 255, 0]);
    expect(cidrToOctets(26)).toEqual([255, 255, 255, 192]);
    expect(cidrToOctets(30)).toEqual([255, 255, 255, 252]);
    expect(cidrToOctets(32)).toEqual([255, 255, 255, 255]); // JS-Shift-Fallstrick
    expect(cidrToOctets(1)).toEqual([128, 0, 0, 0]);
  });
});

describe("cidrRow", () => {
  it("/24: 256 Adressen, 254 Hosts, Wildcard 0.0.0.255", () => {
    const r = cidrRow(24);
    expect(r.mask).toBe("255.255.255.0");
    expect(r.maskBinary).toBe("11111111.11111111.11111111.00000000");
    expect(r.wildcard).toBe("0.0.0.255");
    expect(r.blockSize).toBe(256);
    expect(r.usableHosts).toBe(254);
    expect(r.subnetsPerClassC).toBe(1);
  });

  it("/26: 64 Adressen, 62 Hosts, 4 Subnetze im /24", () => {
    const r = cidrRow(26);
    expect(r.blockSize).toBe(64);
    expect(r.usableHosts).toBe(62);
    expect(r.subnetsPerClassC).toBe(4);
  });

  it("/31 = 2 nutzbare (P2P), /32 = 1 (Host)", () => {
    expect(cidrRow(31).usableHosts).toBe(2);
    expect(cidrRow(32).usableHosts).toBe(1);
    expect(cidrRow(32).blockSize).toBe(1);
  });

  it("subnetsPerClassC ist null für Präfixe < /24", () => {
    expect(cidrRow(16).subnetsPerClassC).toBeNull();
  });
});

describe("cidrTable", () => {
  it("hat genau 33 Zeilen (/0 … /32) in aufsteigender Reihenfolge", () => {
    const t = cidrTable();
    expect(t).toHaveLength(33);
    expect(t[0].cidr).toBe(0);
    expect(t[32].cidr).toBe(32);
  });
});

describe("blockSizeTable", () => {
  it("deckt Blockgrößen 256 … 1 ab (/24 … /32)", () => {
    const t = blockSizeTable();
    expect(t).toHaveLength(9);
    expect(t[0]).toMatchObject({ blockSize: 256, cidr: 24, maskOctet: 0 });
    expect(t[8]).toMatchObject({ blockSize: 1, cidr: 32, maskOctet: 255 });
    // Maskenoktett = 256 - Blockgröße
    for (const r of t) expect(r.maskOctet).toBe(256 - r.blockSize);
  });
});

describe("octetTable", () => {
  it("hat 256 Zeilen mit 8-Bit-Binär", () => {
    const t = octetTable();
    expect(t).toHaveLength(256);
    expect(t[0]).toMatchObject({ dec: 0, bin: "00000000" });
    expect(t[255]).toMatchObject({ dec: 255, bin: "11111111" });
    expect(t[192].bin).toBe("11000000");
  });

  it("markiert nur die 9 gültigen Masken-Oktette", () => {
    const masks = octetTable().filter((r) => r.isMaskOctet).map((r) => r.dec);
    expect(masks).toEqual([0, 128, 192, 224, 240, 248, 252, 254, 255]);
  });
});
