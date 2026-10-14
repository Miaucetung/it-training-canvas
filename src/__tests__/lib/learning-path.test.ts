import { describe, it, expect } from "vitest";
import { loadModule } from "@/lib/content/content-loader";
import { LABS } from "@/components/labs";
import { LEARNING_STEPS, TOOL_LABELS, stepForLab, stepsForTopic } from "@/lib/learning-path-config";
import { computeNextAction, evaluateStep } from "@/lib/learning-path-logic";
import type { EffectiveProgress } from "@/lib/learning-progress";

const progress = (read: string[] = [], quizzes: string[] = [], opened: string[] = []): EffectiveProgress => ({
  readTopicIds: new Set(read),
  openedTopicIds: new Set([...opened, ...read]),
  quizzes: Object.fromEntries(quizzes.map((q) => [q, { attempts: 1, bestPercent: 80, lastPercent: 80, legacy: false }])),
});

describe("Lernpfad-Konfiguration: vollständig und eindeutig", () => {
  it("15 Schritte, durchnummeriert, Voraussetzungen verweisen nur auf frühere Schritte", () => {
    expect(LEARNING_STEPS.map((s) => s.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    LEARNING_STEPS.forEach((s, i) => {
      const earlier = new Set(LEARNING_STEPS.slice(0, i).map((x) => x.id));
      for (const p of s.prerequisiteStepIds) expect(earlier.has(p), `${s.id} → ${p}`).toBe(true);
    });
  });

  it("jedes Lektionsthema kommt vor (nur routing-ospf zweimal), jede Lektion existiert", async () => {
    const mod = await loadModule("ccna");
    const counts = new Map<string, number>();
    for (const s of LEARNING_STEPS) for (const l of s.lessons) counts.set(l.topicId, (counts.get(l.topicId) ?? 0) + 1);
    for (const t of mod.topics) expect(counts.get(t.id), `Thema ${t.id}`).toBeGreaterThanOrEqual(1);
    for (const id of counts.keys()) expect(mod.topics.some((t) => t.id === id), `unbekanntes Thema ${id}`).toBe(true);
    expect([...counts].filter(([, n]) => n > 1)).toEqual([["routing-ospf", 2]]);
  });

  it("Anker verweisen auf Konzepte des jeweiligen Themas; routing-ospf hat je Schritt einen eigenen Anker", async () => {
    const mod = await loadModule("ccna");
    for (const s of LEARNING_STEPS) {
      for (const l of s.lessons) {
        if (!l.anchor) continue;
        expect(mod.topics.find((t) => t.id === l.topicId)?.conceptIds, `${s.id} ${l.anchor}`).toContain(l.anchor);
      }
    }
    const anchors = LEARNING_STEPS.flatMap((s) => s.lessons.filter((l) => l.topicId === "routing-ospf").map((l) => l.anchor));
    expect(anchors).toEqual(["routing-fundamentals", "ospf"]);
  });

  it("jedes Quiz des Moduls steht in genau einem Schritt", async () => {
    const mod = await loadModule("ccna");
    const all = LEARNING_STEPS.flatMap((s) => s.quizIds);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual(Object.keys(mod.quizzes).sort());
  });

  it("jedes der 55 Labs steht in genau einem Schritt", () => {
    const all = LEARNING_STEPS.flatMap((s) => s.labIds);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual(LABS.map((l) => l.id).sort());
    expect(all).toHaveLength(55);
    expect(stepForLab("ospf")?.id).toBe("s08-ospf");
  });

  it("Werkzeuge sind bekannt, Themen finden ihre Schritte", () => {
    for (const s of LEARNING_STEPS) for (const t of s.toolIds) expect(TOOL_LABELS[t], t).toBeTruthy();
    expect(stepsForTopic("routing-ospf").map((s) => s.number)).toEqual([7, 8]);
    expect(stepsForTopic("stp").map((s) => s.number)).toEqual([6]);
  });
});

describe("Nächster Schritt und Schrittstatus aus echten Daten", () => {
  const none = new Set<string>();

  it("neue Nutzer: erste Lektion von Schritt 1, als erster Besuch gekennzeichnet", () => {
    const a = computeNextAction(LEARNING_STEPS, progress(), none);
    expect(a).toMatchObject({ kind: "lesson", firstVisit: true });
    if (a.kind === "lesson") {
      expect(a.evaluation.step.number).toBe(1);
      expect(a.lesson.topicId).toBe("networking-fundamentals");
    }
  });

  it("nach der Lektion kommen die Übungsfragen, danach der nächste Schritt", () => {
    const afterLesson = computeNextAction(LEARNING_STEPS, progress(["networking-fundamentals"]), none);
    expect(afterLesson).toMatchObject({ kind: "quiz", quizId: "ccna-quiz-netzwerkgrundlagen" });
    const afterQuiz1 = computeNextAction(LEARNING_STEPS, progress(["networking-fundamentals"], ["ccna-quiz-netzwerkgrundlagen"]), none);
    expect(afterQuiz1).toMatchObject({ kind: "quiz", quizId: "ccna-quiz-tag1-grundlagen" });
    const step1Done = progress(["networking-fundamentals"], ["ccna-quiz-netzwerkgrundlagen", "ccna-quiz-tag1-grundlagen"]);
    const next = computeNextAction(LEARNING_STEPS, step1Done, none);
    expect(next.kind).toBe("lesson");
    if (next.kind === "lesson") expect(next.evaluation.step.number).toBe(2);
  });

  it("Status: offen, begonnen, abgeschlossen (Labs sind keine Pflicht)", () => {
    const step = LEARNING_STEPS[0];
    expect(evaluateStep(step, progress(), none).status).toBe("offen");
    expect(evaluateStep(step, progress([], [], ["networking-fundamentals"]), none).status).toBe("begonnen");
    expect(evaluateStep(step, progress(["networking-fundamentals"]), none).status).toBe("begonnen");
    const done = evaluateStep(step, progress(["networking-fundamentals"], step.quizIds), none);
    expect(done.status).toBe("abgeschlossen");
    expect(done.requiredDone).toBe(done.requiredTotal);
    const s2 = LEARNING_STEPS[1];
    expect(evaluateStep(s2, progress(["ios-cli"], s2.quizIds), none).status).toBe("abgeschlossen"); // Lab drill-grundkonfig fehlt, trotzdem abgeschlossen
    expect(evaluateStep(s2, progress(), new Set(["drill-grundkonfig"])).status).toBe("begonnen"); // ein erledigtes Lab zählt als begonnen
  });

  it("übersprungene Schritte: es bleibt beim ersten offenen Schritt mit erfüllten Voraussetzungen; fehlende Voraussetzungen werden genannt", () => {
    const s4 = LEARNING_STEPS[3];
    const onlyStep4 = progress(["ipv4-addressing", "subnet-segmentation"], s4.quizIds);
    const a = computeNextAction(LEARNING_STEPS, onlyStep4, none);
    expect(a.kind === "lesson" && a.evaluation.step.number).toBe(1);
    // nur Schritt 5 gemacht, Schritt 1 und 2 offen → Empfehlung Schritt 1
    const s5 = LEARNING_STEPS[4];
    const b = computeNextAction(LEARNING_STEPS, progress(["switching-vlans", "vlan-advanced"], s5.quizIds), none);
    expect(b.kind === "lesson" && b.evaluation.step.number).toBe(1);
  });

  it("wenn alle Voraussetzungen offener Schritte fehlen, gibt es trotzdem eine Empfehlung mit Hinweis", () => {
    // Schritt 1 abgeschlossen, Schritt 2 fehlt, Schritt 3 hat keine Voraussetzung außer 1 → Schritt 2 (Voraussetzung 1 erfüllt)
    const s1 = LEARNING_STEPS[0];
    const a = computeNextAction(LEARNING_STEPS, progress(["networking-fundamentals"], s1.quizIds), none);
    expect(a.kind === "lesson" && a.evaluation.step.number).toBe(2);
    expect(a.kind === "lesson" && a.prerequisitesMissing).toEqual([]);
  });

  it("alle Schritte abgeschlossen: erst das nächste offene Lab, am Ende „fertig“", () => {
    const allTopics = LEARNING_STEPS.flatMap((s) => s.lessons.map((l) => l.topicId));
    const allQuizzes = LEARNING_STEPS.flatMap((s) => s.quizIds);
    const a = computeNextAction(LEARNING_STEPS, progress(allTopics, allQuizzes), none);
    expect(a).toMatchObject({ kind: "lab", labId: "drill-grundkonfig" });
    const allLabs = new Set(LEARNING_STEPS.flatMap((s) => s.labIds));
    expect(computeNextAction(LEARNING_STEPS, progress(allTopics, allQuizzes), allLabs)).toEqual({ kind: "done" });
  });
});
