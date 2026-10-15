import { describe, it, expect } from "vitest";
import snapshotJson from "../fixtures/content-snapshot.json";
import { buildSnapshot, compareSnapshots, hashOf, snapshotDragDrop, snapshotQuestion, type ContentSnapshot } from "../helpers/content-snapshot";

const expected = snapshotJson as unknown as ContentSnapshot;

describe("Inhalts-Snapshot der Prüfungsfragen (Schutz vor inhaltlichen Änderungen)", () => {
  it("der aktuelle Stand stimmt mit dem eingecheckten Snapshot überein (Fragetext, Optionen, Lösung, Exhibit-Inhalte)", () => {
    const violations = compareSnapshots(expected, buildSnapshot());
    // Bei einer Abweichung nennt jede Zeile Pool, Frage-ID und Feld. Absichtliche Änderungen: npm run snapshot:content:update
    expect(violations).toEqual([]);
  });

  it("der Snapshot deckt alle drei Pools ab und ist nicht leer", () => {
    expect(Object.keys(expected.pools).sort()).toEqual(["ccnaDragDrop", "ccnaQuestions", "ccnaQuestionsClassified"]);
    expect(Object.keys(expected.pools.ccnaQuestions).length).toBeGreaterThan(1000);
    expect(Object.keys(expected.pools.ccnaQuestionsClassified).length).toBeGreaterThan(1000);
    expect(Object.keys(expected.pools.ccnaDragDrop).length).toBeGreaterThan(50);
  });
});

describe("Snapshot-Mechanik (synthetische Fragen)", () => {
  const topo = (over: Record<string, unknown> = {}) => ({
    id: "q1",
    question: "Refer to the exhibit. Which route?",
    options: ["a", "b", "c"],
    correct: 1,
    exhibit: {
      type: "topology",
      devices: [
        { id: "R1", type: "router", label: "R1", x: 10, y: 20 },
        { id: "R2", type: "router", label: "R2", x: 110, y: 20 },
      ],
      links: [{ from: "R1", to: "R2", labelFrom: "Gi0/0", labelTo: "Gi0/1", subnet: "10.0.0.0/30" }],
      labels: [{ text: "LAN A", attachTo: "R1", position: "above" }],
    },
    ...over,
  });
  const changed = (a: object, b: object) => {
    const x = snapshotQuestion(a);
    const y = snapshotQuestion(b);
    return Object.keys(x).filter((k) => x[k] !== y[k]);
  };
  interface TopoExhibit {
    devices: Array<Record<string, unknown>>;
    links: Array<Record<string, unknown>>;
    labels: Array<Record<string, unknown>>;
  }
  const withExhibit = (patch: (e: TopoExhibit) => void) => {
    const q = JSON.parse(JSON.stringify(topo()));
    patch(q.exhibit);
    return q;
  };

  it("Layout-Felder (x, y, Label-Position) ändern keine Prüfsumme", () => {
    const moved = withExhibit((e) => {
      e.devices[0].x = 999;
      e.devices[1].y = -5;
      e.labels[0].position = "below";
    });
    expect(changed(topo(), moved)).toEqual([]);
  });

  it("Fragetext, Optionen und Lösung werden erkannt", () => {
    expect(changed(topo(), topo({ question: "Refer to the exhibit. Which route is used?" }))).toEqual(["text"]);
    expect(changed(topo(), topo({ options: ["a", "b", "d"] }))).toEqual(["options"]);
    expect(changed(topo(), topo({ correct: 2 }))).toEqual(["correct"]);
    expect(changed(topo(), topo({ options: ["b", "a", "c"] }))).toEqual(["options"]);
  });

  it("Gerätenamen, Interface-Namen, Subnetze, Label-Texte und Verbindungen werden erkannt", () => {
    expect(changed(topo(), withExhibit((e) => (e.devices[0].label = "R9")))).toEqual(expect.arrayContaining(["exhibitDevices", "exhibitAll"]));
    expect(changed(topo(), withExhibit((e) => (e.links[0].labelFrom = "Gi0/9")))).toEqual(expect.arrayContaining(["exhibitInterfaces", "exhibitAll"]));
    expect(changed(topo(), withExhibit((e) => (e.links[0].subnet = "10.0.0.4/30")))).toEqual(expect.arrayContaining(["exhibitSubnets", "exhibitAll"]));
    expect(changed(topo(), withExhibit((e) => (e.labels[0].text = "LAN B")))).toEqual(expect.arrayContaining(["exhibitLabels", "exhibitAll"]));
    expect(changed(topo(), withExhibit((e) => (e.labels[0].attachTo = "R2")))).toEqual(expect.arrayContaining(["exhibitLabels", "exhibitAll"]));
    expect(changed(topo(), withExhibit((e) => (e.links[0].to = "R1")))).toEqual(expect.arrayContaining(["exhibitLinks", "exhibitAll"]));
    expect(changed(topo(), withExhibit((e) => e.devices.push({ id: "R3", type: "router", label: "R3", x: 0, y: 0 })))).toContain("exhibitDevices");
  });

  it("CLI-, Tabellen- und Zonen-Inhalte werden erkannt, Zonen-Koordinaten nicht", () => {
    const cli = (content: string) => ({ id: "q2", question: "q", options: [], correct: 0, exhibit: { type: "cli", content } });
    expect(changed(cli("a"), cli("b"))).toContain("exhibitCli");
    const table = (cell: string) => ({ id: "q3", question: "q", options: [], correct: 0, exhibit: [{ type: "table", headers: ["h"], rows: [[cell]] }] });
    expect(changed(table("x"), table("y"))).toContain("exhibitTable");
    const zones = (label: string, x: number) => ({ id: "q4", question: "q", options: [], correct: 0, exhibit: { type: "wireless-zones", zones: [{ id: "z", label, channel: 1, x, y: 0, r: 5 }] } });
    expect(changed(zones("A", 1), zones("A", 99))).toEqual([]);
    expect(changed(zones("A", 1), zones("B", 1))).toContain("exhibitZones");
  });

  it("Exhibit-Art (false → true, boolean → Topologie) und übrige Felder werden erkannt", () => {
    expect(changed(topo({ exhibit: false }), topo({ exhibit: true }))).toContain("exhibitKind");
    expect(changed(topo({ exhibit: false }), topo())).toContain("exhibitKind");
    expect(changed(topo({ priority_score: 1 }), topo({ priority_score: 2 }))).toEqual(["meta"]);
  });

  it("Drag-and-Drop: Aufgabe, Ziele, Zuordnung und Erklärung werden erkannt", () => {
    const dd = (over: Record<string, unknown> = {}) => ({
      id: "dd-1",
      instruction: "Drag",
      targets: [{ id: "t1", label: "FTP" }],
      items: [{ id: "i1", label: "port 21", target: "t1" }],
      explanation: "e",
      ...over,
    });
    const d = (a: object, b: object) => {
      const x = snapshotDragDrop(a as never);
      const y = snapshotDragDrop(b as never);
      return Object.keys(x).filter((k) => x[k] !== y[k]);
    };
    expect(d(dd(), dd())).toEqual([]);
    expect(d(dd(), dd({ instruction: "Drop" }))).toEqual(["instruction"]);
    expect(d(dd(), dd({ targets: [{ id: "t1", label: "TFTP" }] }))).toEqual(["targets"]);
    expect(d(dd(), dd({ items: [{ id: "i1", label: "port 21", target: null }] }))).toEqual(["items"]);
    expect(d(dd(), dd({ explanation: "f" }))).toEqual(["explanation"]);
  });

  it("compareSnapshots nennt Pool, Frage-ID und Feld; entfernte und neue Fragen werden gemeldet", () => {
    const base: ContentSnapshot = { version: 1, pools: { p: { a: { text: "1", options: "2" }, b: { text: "3", options: "4" } } } };
    const cur: ContentSnapshot = { version: 1, pools: { p: { a: { text: "X", options: "2" }, c: { text: "5", options: "6" } } } };
    expect(compareSnapshots(base, cur).sort()).toEqual(["p a: text geändert", "p b: Frage entfernt", "p c: Frage neu (nicht im Snapshot)"]);
    expect(compareSnapshots(base, base)).toEqual([]);
  });

  it("hashOf ist unabhängig von der Schlüsselreihenfolge", () => {
    expect(hashOf({ a: 1, b: [1, { c: 2, d: 3 }] })).toBe(hashOf({ b: [1, { d: 3, c: 2 }], a: 1 }));
    expect(hashOf([1, 2])).not.toBe(hashOf([2, 1]));
  });
});
