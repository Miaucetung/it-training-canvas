import { describe, it, expect } from "vitest";
import { ccnaQuestions } from "@/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";
import type { CLIExhibit } from "@/types/exhibit";
import originals from "../fixtures/inline-cli-originals.json";
import { IOS_SHOW_INTERFACE_LINE_STARTS, normalizeWhitespace as norm, reconstructIosLines } from "../helpers/inline-cli";

type Q = { id: string; question: string; options: string[]; correct: unknown; exhibit: unknown };
const examById = (id: string) => ccnaQuestions.find((q) => q.id === id) as unknown as Q;
const classById = (id: string) => ccnaQuestionsClassified.find((q) => q.id === id) as unknown as Q;
const orig = originals as unknown as {
  ccnaQuestions: Record<string, { question: string; exhibit: unknown }>;
  ccnaQuestionsClassified: Record<string, { question: string; exhibit: unknown }>;
  randfaelleUnveraendert: { ccnaQuestions: Record<string, Q>; ccnaQuestionsClassified: Record<string, Q> };
};
const cliOf = (q: Q) => q.exhibit as CLIExhibit;

describe("q0829 / Q0829: CLI-Ausgabe aus dem Fragetext ins Exhibit", () => {
  const pools = [
    { name: "ccnaQuestions", q: examById("q0829"), o: orig.ccnaQuestions.q0829 },
    { name: "ccnaQuestionsClassified", q: classById("Q0829"), o: orig.ccnaQuestionsClassified.Q0829 },
  ];

  for (const { name, q, o } of pools) {
    it(`${name}: Fragetext + Exhibit ergeben ohne Leerraum-Unterschiede genau den Originaltext`, () => {
      expect(q.exhibit).toMatchObject({ type: "cli" });
      expect(norm(`${q.question} ${cliOf(q).content}`)).toBe(norm(o.question));
    });

    it(`${name}: der Fragetext enthält keine CLI-Zeilen mehr und ist der unveränderte Anfang des Originals`, () => {
      expect(q.question).not.toMatch(/line protocol|Hardware is|packets input/);
      expect(norm(o.question).startsWith(norm(q.question))).toBe(true);
      expect(q.question.endsWith("What is the root cause of the issue?")).toBe(true);
    });
  }

  it("beide Pools haben dasselbe CLI-Exhibit (Zeilenumbrüche aus dem klassifizierten Pool)", () => {
    expect(cliOf(examById("q0829")).content).toBe(cliOf(classById("Q0829")).content);
    expect(cliOf(examById("q0829")).content.split("\n")).toHaveLength(24);
  });

  it("Gegenprobe: die IOS-Zeilenanfänge zerlegen den einzeiligen Originaltext in genau diese 24 Zeilen", () => {
    const flat = orig.ccnaQuestions.q0829.question;
    const cliFlat = flat.slice(flat.indexOf("FastEthernet0/13 is up, line protocol is up"));
    expect(reconstructIosLines(cliFlat)).toEqual(cliOf(examById("q0829")).content.split("\n"));
  });

  it("jede Zeile des Exhibits beginnt mit einem typischen Zeilenanfang der show-interfaces-Ausgabe", () => {
    for (const line of cliOf(classById("Q0829")).content.split("\n")) {
      expect(IOS_SHOW_INTERFACE_LINE_STARTS.some((re) => re.test(line)), line).toBe(true);
    }
  });

  it("Tippfehler aus dem Einlesen bleiben unverändert (FastEthemet0/13, typografische Anführungszeichen)", () => {
    for (const q of [examById("q0829"), classById("Q0829")]) {
      expect(q.question).toContain("FastEthemet0/13");
      expect(cliOf(q).content).toContain("Last clearing of “show interface” counters never");
      expect(cliOf(q).content).toContain("Keepalive not set -");
    }
  });

  it("Optionen und Lösung sind unverändert", () => {
    expect(examById("q0829").options).toEqual(["local buffer overload", "err-disabled port on the far end", "physical errors", "duplicate IP addressing"]);
    expect(examById("q0829").correct).toBe(2);
    expect(classById("Q0829").correct).toBe(2);
  });
});

describe("q0965 / Q0965: doppelter Konfigurationsblock aus dem Fragetext entfernt", () => {
  const pools = [
    { name: "ccnaQuestions", q: examById("q0965"), o: orig.ccnaQuestions.q0965 },
    { name: "ccnaQuestionsClassified", q: classById("Q0965"), o: orig.ccnaQuestionsClassified.Q0965 },
  ];

  for (const { name, q, o } of pools) {
    it(`${name}: das Exhibit ist unverändert`, () => {
      expect(q.exhibit).toEqual(o.exhibit);
    });

    it(`${name}: Originaltext = Exhibit-Inhalt + neuer Fragetext (ohne Leerraum-Unterschiede)`, () => {
      expect(norm(`${cliOf(q).content} ${q.question}`)).toBe(norm(o.question));
    });

    it(`${name}: der entfernte Block war nach Leerraum-Normalisierung identisch mit dem Exhibit`, () => {
      const removed = o.question.slice(0, o.question.length - q.question.length);
      expect(o.question.endsWith(q.question)).toBe(true);
      expect(norm(removed)).toBe(norm(cliOf(q).content));
    });

    it(`${name}: Fragetext beginnt mit dem Exhibit-Hinweis`, () => {
      expect(q.question.startsWith("Refer to the exhibit. An engineer executed the script")).toBe(true);
      expect(q.question).not.toContain("hostname CPE");
    });
  }

  it("Tippfehler in den Optionen (name-serveer, domain mame) bleiben unverändert", () => {
    expect(examById("q0965").options).toContain("no ip name-serveer 198.51.100.210");
    expect(examById("q0965").options).toContain("no ip domain mame ccna.cisco.com");
  });
});

describe("Randfälle bleiben unverändert (Q0181, Q0242, Q0254, Q0277, q0398)", () => {
  for (const [id, before] of Object.entries(orig.randfaelleUnveraendert.ccnaQuestions)) {
    it(`ccnaQuestions ${id}`, () => {
      expect(examById(id)).toMatchObject(before);
    });
  }
  for (const [id, before] of Object.entries(orig.randfaelleUnveraendert.ccnaQuestionsClassified)) {
    it(`ccnaQuestionsClassified ${id}`, () => {
      expect(classById(id)).toMatchObject(before);
    });
  }
});
