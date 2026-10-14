import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, parseLabDeviceConfig } from "@/components/labs/lab-to-network";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { computeHsrp, formatShowStandbyBrief, hsrpHints } from "@/lib/topology/hsrp";
import type { InterfaceHsrpGroup, NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";

type LabLike = (typeof LABS)[number];

/** Lab ohne die Befehle, die das Prädikat trifft (z. B. den abschließenden `shutdown` des Failover-Tests). */
function labWithout(lab: LabLike, drop: (cmd: string) => boolean): LabLike {
  return {
    ...lab,
    steps: lab.steps.map((st) => ({
      ...st,
      blocks: (st.blocks as Array<{ device: string; commands: Array<{ cmd: string }> }>).map((b) => ({
        ...b,
        commands: b.commands.map((c) => ({ ...c, cmd: String(c.cmd).split("\n").filter((l) => !drop(l.trim())).join("\n") })),
      })),
    })),
  } as LabLike;
}
const hsrpLab = LABS.find((l) => l.id === "hsrp")!;
const buildLab = (lab: LabLike, state: "target" | "start" = "target") => buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES["hsrp"], state).topology;
const dev = (t: NetworkTopology, name: string) => t.devices.find((d) => d.name === name)!;
const brief = (t: NetworkTopology, name: string) => CiscoCliGenerator.getDynamicShowOutputs(dev(t, name), t)["show standby brief"];
const row = (text: string) => text.split("\n").find((l) => /^Gi0\/0/.test(l))!;

describe("show standby brief – hsrp-Lab", () => {
  it("Zielzustand laut Lab: R1 endet mit shutdown (Failover-Test), R2 ist allein Active", () => {
    const t = buildLab(hsrpLab);
    expect(row(brief(t, "R1"))).toMatch(/Gi0\/0\s+1\s+80\s+P Init\s+unknown\s+unknown\s+192\.168\.1\.1/);
    expect(row(brief(t, "R2"))).toMatch(/Gi0\/0\s+1\s+100\s+P Active\s+local\s+unknown\s+192\.168\.1\.1/);
    expect(brief(t, "R2")).toContain("Kein weiterer HSRP-Teilnehmer");
  });

  it("ohne den Failover-Shutdown: track Gi0/1 30 senkt R1 auf 80, weil Gi0/1 im Lab nicht verbunden ist; R2 wird Active", () => {
    const t = buildLab(labWithout(hsrpLab, (c) => c === "shutdown"));
    expect(row(brief(t, "R1"))).toMatch(/Gi0\/0\s+1\s+80\s+P Standby\s+192\.168\.1\.3\s+local\s+192\.168\.1\.1/);
    expect(row(brief(t, "R2"))).toMatch(/Gi0\/0\s+1\s+100\s+P Active\s+local\s+192\.168\.1\.2\s+192\.168\.1\.1/);
    expect(brief(t, "R1")).toContain("Priority 110 − 30 = 80");
    expect(hsrpHints(dev(t, "R1"), t).join(" ")).toContain("Tracking-Interface Gi0/1");
  });

  it("ohne Shutdown und ohne Tracking: R1 (110) ist Active, Preempt auf beiden Seiten, Ergebnis eindeutig", () => {
    const t = buildLab(labWithout(hsrpLab, (c) => c === "shutdown" || c.startsWith("standby 1 track")));
    expect(row(brief(t, "R1"))).toMatch(/Gi0\/0\s+1\s+110\s+P Active\s+local\s+192\.168\.1\.3\s+192\.168\.1\.1/);
    expect(row(brief(t, "R2"))).toMatch(/Gi0\/0\s+1\s+100\s+P Standby\s+192\.168\.1\.2\s+local\s+192\.168\.1\.1/);
    expect(brief(t, "R1")).not.toContain("Startreihenfolge");
    expect(hsrpHints(dev(t, "R1"), t)).toEqual([]);
  });

  it("negativ: PC, Switch und Startzustand haben keine standby-Ausgabe", () => {
    const t = buildLab(hsrpLab);
    for (const n of ["PC0", "Verteiler"]) expect(brief(t, n), n).toBeUndefined();
    const start = buildLab(hsrpLab, "start");
    expect(brief(start, "R1")).toBeUndefined();
    expect(brief(start, "R2")).toBeUndefined();
  });

  it("Parser: Version, Gruppen, Tracking, Authentication und Timer", () => {
    const lab = {
      steps: [
        {
          blocks: [
            {
              device: "R",
              commands: [
                {
                  cmd: [
                    "interface gi0/0",
                    "standby version 2",
                    "standby 3 ip 10.0.0.1",
                    "standby 3 priority 120",
                    "standby 3 preempt delay minimum 30",
                    "standby 3 timers msec 200 msec 750",
                    "standby 3 track gi0/1",
                    "standby 3 track 5 decrement 15",
                    "standby 3 authentication md5 key-string geheim",
                    "standby ip 10.0.0.9",
                  ].join("\n"),
                },
              ],
            },
          ],
        },
      ],
    };
    const g = parseLabDeviceConfig(lab as never, "R").ifaces.get("Gi0/0");
    expect(g?.hsrpVersion).toBe(2);
    expect(g?.hsrpGroups?.get(3)).toEqual({
      id: 3,
      ip: "10.0.0.1",
      priority: 120,
      preempt: true,
      timers: "msec 200 msec 750",
      track: [{ interface: "Gi0/1", decrement: 10 }],
      trackObjects: [5],
      authentication: "md5:geheim",
    });
    expect(g?.hsrpGroups?.get(0)?.ip).toBe("10.0.0.9");
  });
});

describe("HSRP-Wahl (synthetische Segmente)", () => {
  const mkIface = (id: string, name: string, extra: Partial<TopologyInterface> = {}): TopologyInterface => ({ id, name, status: "up", ...extra });
  const group = (extra: Partial<InterfaceHsrpGroup> = {}): InterfaceHsrpGroup => ({ id: 1, ip: "10.0.0.1", ...extra });
  const router = (name: string, ip: string, g: InterfaceHsrpGroup | null, version: 1 | 2 = 1, extra: Partial<TopologyInterface> = {}): TopologyDevice => ({
    id: name,
    name,
    type: "router",
    x: 0,
    y: 0,
    interfaces: [mkIface(`${name}-g0`, "Gi0/0", { ip, ...(g ? { hsrp: { version, groups: [g] } } : {}), ...extra }), mkIface(`${name}-g1`, "Gi0/1")],
    config: { hostname: name },
  });
  const build = (routers: TopologyDevice[], extraLinks: NetworkTopology["links"] = []): NetworkTopology => {
    const sw: TopologyDevice = {
      id: "SW",
      name: "SW",
      type: "switch-l2",
      x: 0,
      y: 0,
      interfaces: routers.map((r) => mkIface(`SW-${r.name}`, `Fa0/${routers.indexOf(r) + 1}`, { mode: "access" })),
    };
    return {
      id: "t",
      name: "t",
      version: "2.0",
      devices: [...routers, sw],
      links: [
        ...routers.map((r) => ({ id: `l-${r.name}`, sourceDeviceId: r.id, sourceInterfaceId: `${r.name}-g0`, targetDeviceId: "SW", targetInterfaceId: `SW-${r.name}`, linkType: "ethernet" as const, status: "up" as const })),
        ...extraLinks,
      ],
    };
  };
  const state = (t: NetworkTopology, n: string) => computeHsrp(dev(t, n), t)[0];

  it("höhere Priority gewinnt, Standby ist der zweite, weitere Router hören (Listen)", () => {
    const t = build([
      router("A", "10.0.0.2/24", group({ priority: 120, preempt: true })),
      router("B", "10.0.0.3/24", group({ priority: 110, preempt: true })),
      router("C", "10.0.0.4/24", group({ preempt: true })),
    ]);
    expect([state(t, "A").state, state(t, "B").state, state(t, "C").state]).toEqual(["Active", "Standby", "Listen"]);
    expect(state(t, "C").active).toBe("10.0.0.2");
    expect(state(t, "C").standby).toBe("10.0.0.3");
  });

  it("gleiche Priority: die höhere Interface-IP gewinnt", () => {
    const t = build([router("A", "10.0.0.2/24", group({ preempt: true })), router("B", "10.0.0.3/24", group({ preempt: true }))]);
    expect(state(t, "B").state).toBe("Active");
    expect(state(t, "A").state).toBe("Standby");
    expect(state(t, "A").notes.join(" ")).toContain("Gleiche Priority");
  });

  it("Preempt fehlt auf dem Router mit der höchsten Priority: abhängig von der Startreihenfolge", () => {
    const t = build([router("A", "10.0.0.2/24", group({ priority: 120 })), router("B", "10.0.0.3/24", group({ preempt: true }))]);
    expect(state(t, "A").state).toBe("Active");
    expect(state(t, "A").startOrderDependent).toBe(true);
    expect(brief(t, "A")).toContain("gleichzeitigem Start");
    expect(hsrpHints(dev(t, "A"), t).join(" ")).toContain("nicht präemptiv");
  });

  it("Preempt nur auf dem Router mit der höchsten Priority genügt für ein eindeutiges Ergebnis", () => {
    const t = build([router("A", "10.0.0.2/24", group({ priority: 120, preempt: true })), router("B", "10.0.0.3/24", group())]);
    expect(state(t, "A").startOrderDependent).toBe(false);
    expect(state(t, "B").startOrderDependent).toBe(false);
  });

  it("negativ: unterschiedliche Authentication — beide Active, Hinweis", () => {
    const t = build([router("A", "10.0.0.2/24", group({ authentication: "text:x" })), router("B", "10.0.0.3/24", group({ authentication: "text:y" }))]);
    expect(state(t, "A").state).toBe("Active");
    expect(state(t, "B").state).toBe("Active");
    expect(state(t, "A").standby).toBe("unknown");
    expect(state(t, "A").notes.join(" ")).toContain("Authentication unterschiedlich");
  });

  it("negativ: Version 1 gegen Version 2 — Peer wird ignoriert", () => {
    const t = build([router("A", "10.0.0.2/24", group(), 1), router("B", "10.0.0.3/24", group(), 2)]);
    expect(state(t, "A").state).toBe("Active");
    expect(state(t, "A").notes.join(" ")).toContain("Version 2");
  });

  it("negativ: anderes Subnetz oder andere Gruppennummer — kein gemeinsamer Teilnehmer", () => {
    const sub = build([router("A", "10.0.0.2/24", group()), router("B", "10.0.9.3/24", group())]);
    expect(state(sub, "A").standby).toBe("unknown");
    const grp = build([router("A", "10.0.0.2/24", group()), router("B", "10.0.0.3/24", group({ id: 2 }))]);
    expect(state(grp, "A").standby).toBe("unknown");
  });

  it("negativ: Interface abgeschaltet oder ohne IP bleibt in Init", () => {
    const down = build([router("A", "10.0.0.2/24", group(), 1, { isShutdown: true, status: "admin-down" })]);
    expect(state(down, "A").state).toBe("Init");
    const noIp = build([router("A", "10.0.0.2/24", group(), 1, { ip: undefined })]);
    expect(state(noIp, "A").state).toBe("Init");
  });

  it("Timer unterschiedlich: Hinweis „nicht bestimmbar“, Wahl bleibt nach Priority", () => {
    const t = build([router("A", "10.0.0.2/24", group({ priority: 120, preempt: true, timers: "1 3" })), router("B", "10.0.0.3/24", group({ timers: "3 10" }))]);
    expect(state(t, "A").notes.join(" ")).toContain("Timer unterschiedlich");
    expect(state(t, "A").state).toBe("Active");
  });

  it("Tracking: verbundenes, aktives Tracking-Interface senkt die Priority nicht, ein abgeschaltetes schon", () => {
    const a = router("A", "10.0.0.2/24", group({ priority: 120, preempt: true, track: [{ interface: "Gi0/1", decrement: 30 }] }));
    const b = router("B", "10.0.0.3/24", group({ preempt: true }));
    const other: TopologyDevice = { id: "X", name: "X", type: "router", x: 0, y: 0, interfaces: [mkIface("X-g0", "Gi0/0")] };
    const link = { id: "lx", sourceDeviceId: "A", sourceInterfaceId: "A-g1", targetDeviceId: "X", targetInterfaceId: "X-g0", linkType: "ethernet" as const, status: "up" as const };
    const t = build([a, b]);
    const withTrack = { ...t, devices: [...t.devices, other], links: [...t.links, link] };
    expect(state(withTrack, "A").priority).toBe(120);
    expect(state(withTrack, "A").state).toBe("Active");
    const down = { ...withTrack, devices: withTrack.devices.map((d) => (d.id === "A" ? { ...d, interfaces: d.interfaces.map((i) => (i.id === "A-g1" ? { ...i, isShutdown: true, status: "admin-down" as const } : i)) } : d)) };
    expect(state(down, "A").priority).toBe(90);
    expect(state(down, "A").state).toBe("Standby");
    expect(state(down, "B").state).toBe("Active");
  });

  it("Tracking-Objekte werden nicht ausgewertet und als nicht bestimmbar vermerkt", () => {
    const t = build([router("A", "10.0.0.2/24", group({ trackObjects: [1] }))]);
    expect(state(t, "A").notes.join(" ")).toContain("Tracking-Objekt 1");
  });

  it("Gruppe ohne virtuelle IP übernimmt die IP des Partners", () => {
    const t = build([router("A", "10.0.0.2/24", { id: 1, preempt: true, priority: 120 }), router("B", "10.0.0.3/24", group())]);
    expect(state(t, "A").virtualIp).toBe("10.0.0.1");
  });

  it("Format: Kopfzeile und Spalten", () => {
    const t = build([router("A", "10.0.0.2/24", group({ priority: 120, preempt: true })), router("B", "10.0.0.3/24", group({ preempt: true }))]);
    const text = formatShowStandbyBrief(dev(t, "A"), t);
    expect(text).toContain("Interface   Grp  Pri P State   Active          Standby         Virtual IP");
    expect(text).toMatch(/Gi0\/0\s+1\s+120\s+P Active\s+local\s+10\.0\.0\.3\s+10\.0\.0\.1/);
  });
});
