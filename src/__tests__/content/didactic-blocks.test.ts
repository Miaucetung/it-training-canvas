import { describe, it, expect } from "vitest";
import {
  parseDidacticContent,
  DIDACTIC_VARIANTS,
} from "@/lib/content/didactic-blocks";
import { CONCEPT_OSPF } from "@/content/modules/ccna/topics/routing-ospf";

describe("parseDidacticContent", () => {
  it("gibt reinen Markdown als ein Token zurück", () => {
    const t = parseDidacticContent("## Titel\n\nText hier.");
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ kind: "markdown" });
  });

  it("erkennt eine Slide-Sentinel als eigenes Token", () => {
    const t = parseDidacticContent("vor\n\n:::slide:ospf-basics:::\n\nnach");
    expect(t.map((x) => x.kind)).toEqual(["markdown", "slide", "markdown"]);
    expect(t[1]).toMatchObject({ kind: "slide", slug: "ospf-basics" });
  });

  it("parst einen Callout mit mehrzeiligem Body", () => {
    const t = parseDidacticContent(
      "Intro\n\n:::kernidee\nZeile 1\nZeile 2\n:::\n\nOutro",
    );
    expect(t.map((x) => x.kind)).toEqual(["markdown", "callout", "markdown"]);
    const c = t[1];
    if (c.kind !== "callout") throw new Error("kein callout");
    expect(c.variant).toBe("kernidee");
    expect(c.body).toBe("Zeile 1\nZeile 2");
    expect(c.title).toBeUndefined();
  });

  it("liest den Titel hinter dem Open-Tag (Selbst-Check-Frage)", () => {
    const t = parseDidacticContent(":::check Warum X?\nWeil Y.\n:::");
    const c = t[0];
    if (c.kind !== "callout") throw new Error("kein callout");
    expect(c.variant).toBe("check");
    expect(c.title).toBe("Warum X?");
    expect(c.body).toBe("Weil Y.");
  });

  it("verwechselt Slide-Sentinel nicht mit Callout-Open", () => {
    const t = parseDidacticContent(":::slide:rip:::");
    expect(t[0].kind).toBe("slide");
  });

  it("schließt einen nicht terminierten Callout am Ende sauber ab", () => {
    const t = parseDidacticContent(":::merke\nohne Ende");
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ kind: "callout", variant: "merke" });
  });

  it("unterstützt alle deklarierten Varianten", () => {
    for (const v of DIDACTIC_VARIANTS) {
      const t = parseDidacticContent(`:::${v}\nBody\n:::`);
      expect(t[0]).toMatchObject({ kind: "callout", variant: v });
    }
  });
});

describe("OSPF-Pilot nutzt die Didaktik-Callouts", () => {
  it("CONCEPT_OSPF enthält Kernidee, Analogie, Falle und Selbst-Check", () => {
    const variants = parseDidacticContent(CONCEPT_OSPF.content)
      .filter((t) => t.kind === "callout")
      .map((t) => (t.kind === "callout" ? t.variant : ""));
    expect(variants).toEqual(
      expect.arrayContaining(["kernidee", "analogie", "falle", "check"]),
    );
  });

  it("alle Slides im OSPF-Concept bleiben erhalten", () => {
    const slides = parseDidacticContent(CONCEPT_OSPF.content).filter(
      (t) => t.kind === "slide",
    );
    expect(slides).toHaveLength(1);
    expect(slides[0]).toMatchObject({ slug: "ospf-basics" });
  });
});
