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
