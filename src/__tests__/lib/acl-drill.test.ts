import { describe, it, expect } from "vitest";
import {
  wildcardMatches,
  evaluateAcl,
  generateAclWildcardTask,
  checkAclWildcard,
  generateAclBuildTask,
  checkAclBuild,
  generateAclMatchTask,
  generateAclPlacementTask,
  rangeToBlocks,
  generateAclRangeTask,
  checkAclRange,
  generateAclNamedTask,
  checkAclNamed,
  generateAclAdvancedTask,
  checkAclAdvanced,
} from "@/lib/acl-drill";

describe("wildcardMatches", () => {
  it("host (0.0.0.0) trifft nur exakt", () => {
    expect(wildcardMatches("10.0.0.5", "0.0.0.0", "10.0.0.5")).toBe(true);
    expect(wildcardMatches("10.0.0.5", "0.0.0.0", "10.0.0.6")).toBe(false);
  });
  it("any (255.255.255.255) trifft alles", () => {
    expect(wildcardMatches("0.0.0.0", "255.255.255.255", "203.0.113.9")).toBe(true);
  });
  it("/24-Wildcard 0.0.0.255 trifft das ganze Subnetz", () => {
    expect(wildcardMatches("192.168.1.0", "0.0.0.255", "192.168.1.200")).toBe(true);
    expect(wildcardMatches("192.168.1.0", "0.0.0.255", "192.168.2.1")).toBe(false);
  });
});

describe("evaluateAcl (First-Match + implizites deny)", () => {
  const aces = [
    { action: "deny" as const, proto: "ip" as const, src: { ip: "192.168.1.50", wild: "0.0.0.0" } },
    { action: "permit" as const, proto: "ip" as const, src: { ip: "192.168.1.0", wild: "0.0.0.255" } },
  ];
  it("blockierter Host trifft Zeile 1 (deny)", () => {
    expect(evaluateAcl(aces, { src: "192.168.1.50", dst: "0.0.0.0", proto: "tcp", port: "0" }))
      .toEqual({ result: "deny", matchedIndex: 0 });
  });
  it("anderer Host im Subnetz trifft Zeile 2 (permit)", () => {
    expect(evaluateAcl(aces, { src: "192.168.1.7", dst: "0.0.0.0", proto: "tcp", port: "0" }))
      .toEqual({ result: "permit", matchedIndex: 1 });
  });
  it("Host außerhalb fällt ins implizite deny", () => {
    expect(evaluateAcl(aces, { src: "10.9.9.9", dst: "0.0.0.0", proto: "tcp", port: "0" }))
      .toEqual({ result: "deny", matchedIndex: -1 });
  });
  it("Extended: Port muss passen", () => {
    const ext = [
      { action: "deny" as const, proto: "tcp" as const, src: { ip: "10.0.0.0", wild: "0.0.0.255" }, dst: { ip: "10.1.1.1", wild: "0.0.0.0" }, port: "23" },
      { action: "permit" as const, proto: "ip" as const, src: { ip: "0.0.0.0", wild: "255.255.255.255" }, dst: { ip: "0.0.0.0", wild: "255.255.255.255" } },
    ];
    expect(evaluateAcl(ext, { src: "10.0.0.9", dst: "10.1.1.1", proto: "tcp", port: "23" }).result).toBe("deny");
    expect(evaluateAcl(ext, { src: "10.0.0.9", dst: "10.1.1.1", proto: "tcp", port: "80" }).result).toBe("permit");
  });
});

describe("Wildcard-Modus: generieren & prüfen", () => {
  it("akzeptiert host-Äquivalenz (host X ≙ X 0.0.0.0)", () => {
    for (let i = 0; i < 30; i++) {
      const t = generateAclWildcardTask(i);
      expect(checkAclWildcard(t.canonical, t).ok).toBe(true);
      if (t.target === "host") {
        const ip = t.canonical.replace("host ", "");
        expect(checkAclWildcard(`${ip} 0.0.0.0`, t).ok).toBe(true);
      }
      if (t.target === "any") {
        expect(checkAclWildcard("0.0.0.0 255.255.255.255", t).ok).toBe(true);
      }
    }
  });
  it("lehnt falsche Wildcard ab", () => {
    const t = generateAclWildcardTask();
    expect(checkAclWildcard("1.2.3.4 0.0.0.1", t).ok).toBe(false);
  });
});

describe("Build-Modus: generieren & prüfen", () => {
  it("die kanonische Lösung wird immer akzeptiert", () => {
    for (let i = 0; i < 60; i++) {
      const t = generateAclBuildTask(i);
      expect(checkAclBuild(t.canonical, t).ok, t.canonical).toBe(true);
    }
  });
  it("akzeptiert Port-Alias (eq telnet ≙ eq 23)", () => {
    let task = generateAclBuildTask();
    let guard = 0;
    while (!(task.variant === "extended" && task.canonical.includes("eq 23")) && guard++ < 200) {
      task = generateAclBuildTask();
    }
    if (task.canonical.includes("eq 23")) {
      const aliased = task.canonical.replace("eq 23", "eq telnet");
      expect(checkAclBuild(aliased, task).ok).toBe(true);
    }
  });
  it("akzeptiert Router-Prompt-Präfix", () => {
    const t = generateAclBuildTask();
    expect(checkAclBuild(`R1(config)# ${t.canonical}`, t).ok).toBe(true);
  });
  it("lehnt falsche ACL-Nummer ab", () => {
    const t = generateAclBuildTask();
    const wrong = t.canonical.replace(/access-list \d+/, "access-list 7");
    expect(checkAclBuild(wrong, t).ok).toBe(false);
  });
});

describe("rangeToBlocks (minimale ausgerichtete Blöcke)", () => {
  it("ausgerichteter Block bleibt eine Einheit", () => {
    expect(rangeToBlocks(64, 127)).toEqual([{ start: 64, size: 64 }]);
    expect(rangeToBlocks(0, 255)).toEqual([{ start: 0, size: 256 }]);
  });
  it("krummer Bereich .2–.5 zerfällt in ausgerichtete Blöcke", () => {
    // .2-.3 (size2) + .4-.5 (size2)
    expect(rangeToBlocks(2, 5)).toEqual([
      { start: 2, size: 2 },
      { start: 4, size: 2 },
    ]);
  });
  it("die Blöcke decken den Bereich exakt ab", () => {
    for (let t = 0; t < 50; t++) {
      const lo = Math.floor(Math.random() * 200);
      const hi = lo + Math.floor(Math.random() * 55);
      const covered = new Set<number>();
      for (const b of rangeToBlocks(lo, hi)) for (let i = 0; i < b.size; i++) covered.add(b.start + i);
      const target = new Set<number>();
      for (let i = lo; i <= hi; i++) target.add(i);
      expect([...covered].sort((a, b) => a - b)).toEqual([...target].sort((a, b) => a - b));
    }
  });
});

describe("Range-Modus: jeder korrekte Lösungsweg zählt", () => {
  it("Weg A (Permit-Blöcke) wird akzeptiert", () => {
    for (let i = 0; i < 40; i++) {
      const t = generateAclRangeTask(i);
      const sol = t.permitBlocks.map((b) => `permit ${b.net} ${b.wild}`).join("\n");
      const r = checkAclRange(sol, t);
      expect(r.ok, `${t.base}.${t.lo}-${t.hi}\n${sol}\n${r.reason}`).toBe(true);
    }
  });
  it("Weg B (Subnetz permit + Rand-deny) wird akzeptiert", () => {
    for (let i = 0; i < 40; i++) {
      const t = generateAclRangeTask(i);
      const lines = [
        ...t.denyEdges.map((b) => `deny ${b.net} ${b.wild}`),
        `permit ${t.base}.0 0.0.0.255`,
      ].join("\n");
      const r = checkAclRange(lines, t);
      expect(r.ok, `${t.base}.${t.lo}-${t.hi}\n${lines}\n${r.reason}`).toBe(true);
    }
  });
  it("zu breite Lösung (permit any) wird erkannt", () => {
    const t = generateAclRangeTask();
    const r = checkAclRange("permit any", t);
    // any erlaubt auch .0/.255 etc. → entweder extra (falls Bereich nicht ganzes /24) ok=false
    if (!(t.lo === 0 && t.hi === 255)) {
      expect(r.ok).toBe(false);
      expect(r.extra.length).toBeGreaterThan(0);
    }
  });
  it("zu enge Lösung meldet fehlende Hosts", () => {
    const t = generateAclRangeTask();
    const r = checkAclRange(`permit host ${t.base}.${t.lo}`, t);
    if (t.lo !== t.hi) {
      expect(r.ok).toBe(false);
      expect(r.missing.length).toBeGreaterThan(0);
    }
  });
  it("falsch ausgerichteter Block (.46 0.0.0.31) erzeugt Alignment-Hinweis mit Startliste", () => {
    const t = generateAclRangeTask();
    const r = checkAclRange(`permit ${t.base}.46 0.0.0.31`, t);
    if (!r.ok) {
      expect(r.alignmentHint).toBeDefined();
      expect(r.alignmentHint).toContain("46");
      expect(r.alignmentHint).toContain(".32");
    }
  });
  it("ausgerichtete (aber zu enge) Lösung erzeugt KEINEN Alignment-Hinweis", () => {
    const t = generateAclRangeTask();
    // host-Wildcard 0.0.0.0 ist immer ausgerichtet → kein Hinweis, auch wenn falsch
    const r = checkAclRange(`permit host ${t.base}.${t.lo}`, t);
    if (!r.ok) expect(r.alignmentHint).toBeUndefined();
  });
});

describe("Named-Modus: Definition + ACE", () => {
  it("kanonische 2-Zeilen-Lösung wird akzeptiert", () => {
    for (let i = 0; i < 40; i++) {
      const t = generateAclNamedTask(i);
      expect(checkAclNamed(t.canonicalLines.join("\n"), t).ok).toBe(true);
    }
  });
  it("optionale Sequenznummer vor der ACE ist erlaubt", () => {
    let t = generateAclNamedTask();
    let guard = 0;
    while (t.variant !== "extended" && guard++ < 50) t = generateAclNamedTask();
    const withSeq = [t.canonicalLines[0], `10 ${t.canonicalLines[1]}`].join("\n");
    expect(checkAclNamed(withSeq, t).ok).toBe(true);
  });
  it("falsche Zeilenzahl wird abgelehnt", () => {
    const t = generateAclNamedTask();
    expect(checkAclNamed(t.canonicalLines[0], t).ok).toBe(false);
  });
});

describe("Advanced-Modus: established / Operatoren / log / time-range", () => {
  it("kanonische Lösung akzeptiert; Trailer order-stabil geprüft", () => {
    for (let i = 0; i < 60; i++) {
      const t = generateAclAdvancedTask(i);
      expect(checkAclAdvanced(t.canonical, t).ok, t.canonical).toBe(true);
    }
  });
  it("akzeptiert Port-Namen in time-range-Aufgabe (eq http ≙ eq 80)", () => {
    let t = generateAclAdvancedTask();
    let guard = 0;
    while (!t.canonical.includes("eq 80") && guard++ < 200) t = generateAclAdvancedTask();
    if (t.canonical.includes("eq 80")) {
      expect(checkAclAdvanced(t.canonical.replace("eq 80", "eq http"), t).ok).toBe(true);
    }
  });
});

describe("Match- & Placement-Modus: konsistente Aufgaben", () => {
  it("Match: result passt zur ausgewiesenen matchedIndex-Zeile", () => {
    for (let i = 0; i < 40; i++) {
      const t = generateAclMatchTask(i);
      expect(t.lines.length).toBeGreaterThan(0);
      expect(["permit", "deny"]).toContain(t.result);
      expect(t.matchedIndex).toBeGreaterThanOrEqual(-1);
      expect(t.matchedIndex).toBeLessThan(t.lines.length);
    }
  });
  it("Placement: correctIndex zeigt auf eine existierende Option", () => {
    for (let i = 0; i < 20; i++) {
      const t = generateAclPlacementTask(i);
      expect(t.options).toHaveLength(4);
      expect(t.options[t.correctIndex]).toMatch(/NAHE/i);
    }
  });
});
