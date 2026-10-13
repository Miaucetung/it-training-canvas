import { describe, it } from "vitest";
import * as q from "@/data/ccnaQuestions";
import * as c from "@/data/ccnaQuestionsClassified";
import * as d from "@/data/ccnaDragDrop";

describe("AUDIT Datenzaehlung", () => {
  it("Exporte und Laengen", () => {
    for (const [n, m] of [["ccnaQuestions", q], ["ccnaQuestionsClassified", c], ["ccnaDragDrop", d]] as const)
      for (const [k, v] of Object.entries(m)) if (Array.isArray(v)) console.log(`${n}.${k}: ${v.length}`);
  });
});
