import { describe, it, expect } from "vitest";
import {
  ipToInt,
  maskString,
  networkAddr,
  contains,
  generateIpRouteTask,
  generateMatchTask,
  checkIpRoute,
} from "@/lib/routing-drill";

describe("routing helpers", () => {
  it("maskString liefert dezimale Masken", () => {
    expect(maskString(24)).toBe("255.255.255.0");
    expect(maskString(26)).toBe("255.255.255.192");
    expect(maskString(30)).toBe("255.255.255.252");
    expect(maskString(0)).toBe("0.0.0.0");
    expect(maskString(32)).toBe("255.255.255.255");
  });

  it("contains: Host im Netz?", () => {
    expect(contains("10.0.0.0", 24, "10.0.0.55")).toBe(true);
    expect(contains("10.0.0.0", 24, "10.0.1.55")).toBe(false);
    expect(contains("10.10.13.208", 29, "10.10.13.214")).toBe(true);
    expect(contains("10.10.13.208", 29, "10.10.13.216")).toBe(false);
  });

  it("networkAddr maskiert korrekt", () => {
    expect(networkAddr(ipToInt("10.10.13.214"), 29)).toBe(ipToInt("10.10.13.208"));
  });
});

describe("checkIpRoute", () => {
  const task = {
    kind: "ip-route" as const, scenario: "normal" as const,
    prompt: "", net: "10.2.0.0", cidr: 24, mask: "255.255.255.0",
    nextHop: "10.0.0.2", ad: null,
    expected: "ip route 10.2.0.0 255.255.255.0 10.0.0.2", hint: "",
  };

  it("akzeptiert korrekten Befehl (auch mit config-Prompt & Mehrfach-Whitespace)", () => {
    expect(checkIpRoute("ip route 10.2.0.0 255.255.255.0 10.0.0.2", task).ok).toBe(true);
    expect(checkIpRoute("  IP  ROUTE  10.2.0.0  255.255.255.0  10.0.0.2 ", task).ok).toBe(true);
    expect(checkIpRoute("R1(config)#ip route 10.2.0.0 255.255.255.0 10.0.0.2", task).ok).toBe(true);
  });

  it("lehnt falsche Maske/Next-Hop ab und benennt den Fehler", () => {
    expect(checkIpRoute("ip route 10.2.0.0 255.255.0.0 10.0.0.2", task).ok).toBe(false);
    const r = checkIpRoute("ip route 10.2.0.0 255.255.255.0 10.0.0.9", task);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/Next-Hop/);
  });

  it("verlangt AD bei Floating-Static", () => {
    const f = { ...task, ad: 130, expected: "ip route 10.2.0.0 255.255.255.0 10.0.0.2 130" };
    expect(checkIpRoute("ip route 10.2.0.0 255.255.255.0 10.0.0.2", f).ok).toBe(false);
    expect(checkIpRoute("ip route 10.2.0.0 255.255.255.0 10.0.0.2 130", f).ok).toBe(true);
  });
});

describe("Generatoren", () => {
  it("ip-route-Aufgabe ist mit ihrer eigenen expected-Lösung gültig (50x)", () => {
    for (let i = 0; i < 50; i++) {
      const t = generateIpRouteTask(i);
      expect(checkIpRoute(t.expected, t).ok).toBe(true);
      if (t.scenario === "default") expect(t.mask).toBe("0.0.0.0");
      if (t.scenario === "host") expect(t.cidr).toBe(32);
    }
  });

  it("longest-match: korrekte Route enthält das Ziel und ist das längste Präfix (50x)", () => {
    for (let i = 0; i < 50; i++) {
      const t = generateMatchTask(i);
      const r = t.table[t.correctIndex];
      expect(r).toBeTruthy();
      if (r.cidr > 0) {
        expect(contains(r.net, r.cidr, t.dest)).toBe(true);
        // kein längeres Präfix enthält das Ziel
        for (const o of t.table) {
          if (o.cidr > r.cidr && contains(o.net, o.cidr, t.dest)) {
            throw new Error("längeres Präfix matcht ebenfalls");
          }
        }
      }
    }
  });
});
