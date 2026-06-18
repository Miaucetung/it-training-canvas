import { describe, it, expect } from "vitest";
import { __test__ } from "@/components/SubnettingDrillDialog";

const { explainSingle, explainSeg, toBin8, generateTask, generateSegTask } = __test__;

describe("toBin8", () => {
  it("liefert 8-Bit-Binär mit führenden Nullen", () => {
    expect(toBin8(42)).toBe("00101010");
    expect(toBin8(240)).toBe("11110000");
    expect(toBin8(0)).toBe("00000000");
    expect(toBin8(255)).toBe("11111111");
  });
});

describe("explainSingle", () => {
  it("Beispiel 172.16.42.5 /20 — interessantes 3. Oktett, Magic 16", () => {
    const task = {
      id: 1,
      ip: [172, 16, 42, 5] as [number, number, number, number],
      mask: [255, 255, 240, 0] as [number, number, number, number],
      cidr: 20,
      subnet: [172, 16, 32, 0] as [number, number, number, number],
      broadcast: [172, 16, 47, 255] as [number, number, number, number],
      firstHost: [172, 16, 32, 1] as [number, number, number, number],
      lastHost: [172, 16, 47, 254] as [number, number, number, number],
      magic: 16,
    };
    const ex = explainSingle(task);
    expect(ex.octetIndex).toBe(2);
    expect(ex.octetLabel).toBe("3. Oktett");
    expect(ex.maskOctet).toBe(240);
    expect(ex.magic).toBe(16);
    expect(ex.netBitsInOctet).toBe(4);
    expect(ex.subnetOctet).toBe(32);
    expect(ex.broadcastOctet).toBe(47);
    expect(ex.steps.some((s) => s.includes("256 − 240 = 16"))).toBe(true);
  });

  it("byte-aligned /24 — interessantes Oktett ist voller Host (Maske 0)", () => {
    const task = {
      id: 2,
      ip: [192, 168, 5, 77] as [number, number, number, number],
      mask: [255, 255, 255, 0] as [number, number, number, number],
      cidr: 24,
      subnet: [192, 168, 5, 0] as [number, number, number, number],
      broadcast: [192, 168, 5, 255] as [number, number, number, number],
      firstHost: [192, 168, 5, 1] as [number, number, number, number],
      lastHost: [192, 168, 5, 254] as [number, number, number, number],
      magic: 256,
    };
    const ex = explainSingle(task);
    expect(ex.octetIndex).toBe(3);
    expect(ex.netBitsInOctet).toBe(0);
    expect(ex.steps[0]).toContain("komplett zum Host-Anteil");
  });

  it("Rechenweg passt zu jeder generierten Aufgabe (Konsistenz)", () => {
    for (let i = 0; i < 20; i++) {
      const t = generateTask(i + 1);
      const ex = explainSingle(t);
      expect(ex.subnetOctet).toBe(t.subnet[ex.octetIndex]);
      expect(ex.broadcastOctet).toBe(t.broadcast[ex.octetIndex]);
      expect(ex.netBitsInOctet).toBeGreaterThanOrEqual(0);
      expect(ex.netBitsInOctet).toBeLessThanOrEqual(8);
      expect(ex.steps.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("explainSeg", () => {
  it("liefert Subnetz-Bits, neue Präfixlänge und Blockgröße", () => {
    const t = generateSegTask(1);
    const ex = explainSeg(t);
    expect(ex.subnetBits).toBe(Math.ceil(Math.log2(Math.max(t.requiredSubnets, 2))));
    expect(ex.newCidr).toBe(t.baseCidr + ex.subnetBits);
    expect(ex.blockSize).toBe(1 << (32 - ex.newCidr));
    expect(ex.steps.length).toBe(5);
    expect(ex.steps[1]).toContain(`/${ex.newCidr}`);
  });
});
