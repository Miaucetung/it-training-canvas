import { describe, it, expect } from "vitest";
import {
  cidrToWildcard,
  networkAddress,
  checkWildcard,
  checkOspfNetwork,
  electDrBdr,
  generateWildcardTask,
  generateOspfNetworkTask,
  generateDrBdrTask,
  type DrRouter,
} from "@/lib/ospf-wildcard-drill";

describe("Wildcard-Helfer", () => {
  it("cidrToWildcard invertiert die Maske", () => {
    expect(cidrToWildcard(24)).toBe("0.0.0.255");
    expect(cidrToWildcard(25)).toBe("0.0.0.127");
    expect(cidrToWildcard(16)).toBe("0.0.255.255");
    expect(cidrToWildcard(8)).toBe("0.255.255.255");
    expect(cidrToWildcard(30)).toBe("0.0.0.3");
    expect(cidrToWildcard(32)).toBe("0.0.0.0");
  });

  it("networkAddress maskiert korrekt", () => {
    expect(networkAddress("192.168.1.77", 24)).toBe("192.168.1.0");
    expect(networkAddress("10.1.0.5", 29)).toBe("10.1.0.0");
    expect(networkAddress("172.16.20.200", 26)).toBe("172.16.20.192");
  });
});

describe("checkWildcard", () => {
  const task = generateWildcardTask();
  it("akzeptiert die eigene Lösung, lehnt Quatsch ab", () => {
    expect(checkWildcard(task.expected, task).ok).toBe(true);
    expect(checkWildcard("  " + task.expected + " ", task).ok).toBe(true);
    expect(checkWildcard("255.255.255.0", task).ok).toBe(false);
    expect(checkWildcard("foo", task).ok).toBe(false);
  });
});

describe("checkOspfNetwork", () => {
  it("akzeptiert korrekten Befehl tolerant (Prompt/Whitespace/Case)", () => {
    const t = generateOspfNetworkTask();
    expect(checkOspfNetwork(t.expected, t).ok).toBe(true);
    expect(checkOspfNetwork(`  NETWORK  ${t.net}   ${t.wildcard}  AREA  ${t.area} `, t).ok).toBe(true);
    expect(checkOspfNetwork(`R1(config-router)#${t.expected}`, t).ok).toBe(true);
  });
  it("lehnt falsche Wildcard/Subnetzmaske ab", () => {
    const t = generateOspfNetworkTask();
    const bad = checkOspfNetwork(`network ${t.net} 255.255.255.0 area ${t.area}`, t);
    if (t.wildcard !== "255.255.255.0") expect(bad.ok).toBe(false);
  });
});

describe("electDrBdr", () => {
  it("höchste Priority gewinnt DR, zweithöchste BDR", () => {
    const rs: DrRouter[] = [
      { name: "R1", priority: 255, rid: "1.1.1.1" },
      { name: "R2", priority: 100, rid: "2.2.2.2" },
      { name: "R3", priority: 1, rid: "9.9.9.9" },
    ];
    const { dr, bdr } = electDrBdr(rs);
    expect(dr?.name).toBe("R1");
    expect(bdr?.name).toBe("R2");
  });

  it("bei Priority-Gleichstand entscheidet die höchste RID", () => {
    const rs: DrRouter[] = [
      { name: "R1", priority: 1, rid: "192.168.254.1" },
      { name: "R2", priority: 1, rid: "192.168.254.4" },
      { name: "R3", priority: 1, rid: "192.168.254.3" },
    ];
    const { dr, bdr } = electDrBdr(rs);
    expect(dr?.name).toBe("R2"); // .4 höchste RID
    expect(bdr?.name).toBe("R3"); // .3 zweithöchste
  });

  it("Priority 0 ist nie wählbar", () => {
    const rs: DrRouter[] = [
      { name: "R1", priority: 0, rid: "9.9.9.9" },
      { name: "R2", priority: 0, rid: "8.8.8.8" },
    ];
    const { dr, bdr } = electDrBdr(rs);
    expect(dr).toBeNull();
    expect(bdr).toBeNull();
  });
});

describe("Generatoren (50x selbstkonsistent)", () => {
  it("wildcard & ospf-network sind mit eigener Lösung gültig", () => {
    for (let i = 0; i < 50; i++) {
      const w = generateWildcardTask(i);
      expect(checkWildcard(w.expected, w).ok).toBe(true);
      expect(w.expected).toBe(cidrToWildcard(w.cidr));

      const n = generateOspfNetworkTask(i);
      expect(checkOspfNetwork(n.expected, n).ok).toBe(true);
      expect(n.net).toBe(networkAddress(n.ip, n.cidr));
    }
  });

  it("dr-bdr: markierte Lösung entspricht der Wahl-Logik", () => {
    for (let i = 0; i < 50; i++) {
      const t = generateDrBdrTask(i);
      const { dr } = electDrBdr(t.routers);
      if (dr) {
        expect(t.options[t.correctIndex]).toBe(dr.name);
      } else {
        // "Kein DR"-Option ist die markierte Lösung
        expect(t.correctIndex).toBe(t.options.length - 1);
      }
    }
  });
});
