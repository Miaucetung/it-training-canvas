// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  LEARNING_PROGRESS_KEY,
  LEGACY_STEP_TO_QUIZ,
  LEGACY_STEP_TO_TOPIC,
  deriveProgress,
  emptyState,
  loadState,
  markLessonOpened,
  readShare,
  recordQuizResult,
  setLessonRead,
} from "@/lib/learning-progress";
import { BLUEPRINT_DOMAINS } from "@/lib/dashboard-blueprint-config";

const derive = (legacy = {}) => deriveProgress(loadState(), legacy);

beforeEach(() => localStorage.clear());

describe("Lernfortschritt: Ereignisse", () => {
  it("leer: nichts gelesen, nichts begonnen, nichts bearbeitet", () => {
    const p = derive();
    expect(p.readTopicIds.size).toBe(0);
    expect(p.openedTopicIds.size).toBe(0);
    expect(p.quizzes).toEqual({});
  });

  it("Lektion öffnen = begonnen, noch nicht gelesen", () => {
    markLessonOpened("ios-cli", 1000);
    const p = derive();
    expect(p.openedTopicIds.has("ios-cli")).toBe(true);
    expect(p.readTopicIds.has("ios-cli")).toBe(false);
  });

  it("als gelesen markieren und wieder abwählen", () => {
    setLessonRead("ios-cli", true, 2000);
    expect(derive().readTopicIds.has("ios-cli")).toBe(true);
    expect(loadState().lessons["ios-cli"]).toMatchObject({ read: true, readAt: 2000 });
    setLessonRead("ios-cli", false);
    expect(derive().readTopicIds.has("ios-cli")).toBe(false);
    expect(loadState().lessons["ios-cli"].readAt).toBeUndefined();
  });

  it("Quiz: Ergebnis, bestes Ergebnis und Versuche", () => {
    recordQuizResult("ccna-quiz-ipv4", 60, 1);
    recordQuizResult("ccna-quiz-ipv4", 85, 2);
    recordQuizResult("ccna-quiz-ipv4", 70, 3);
    expect(derive().quizzes["ccna-quiz-ipv4"]).toEqual({ attempts: 3, bestPercent: 85, lastPercent: 70, legacy: false });
  });

  it("Quiz: Prozentwerte werden begrenzt, ungültige Werte ignoriert", () => {
    recordQuizResult("a", 140);
    recordQuizResult("b", Number.NaN);
    const p = derive();
    expect(p.quizzes.a.bestPercent).toBe(100);
    expect(p.quizzes.b).toBeUndefined();
  });
});

describe("Lernfortschritt: abwärtskompatibel zu vorhandenen Daten", () => {
  it("Info-Schritte des Lernpfads zählen als gelesen, Quiz-Schritte als bearbeitet (ohne Ergebnis)", () => {
    const p = derive({ completedStepIds: ["step-3-ios-cli", "step-4-quiz-ios-cli", "step-99-unbekannt"] });
    expect(p.readTopicIds.has("ios-cli")).toBe(true);
    expect(p.quizzes["ccna-quiz-ios-cli"]).toEqual({ attempts: 1, legacy: true });
    expect(p.readTopicIds.size).toBe(1);
  });

  it("Schritt-IDs aus dem Speicher des Lernpfads (canvas-user-progress) werden gelesen", () => {
    localStorage.setItem("canvas-user-progress", JSON.stringify({ "ccna-full-path": { completedSteps: ["step-1-netzwerkgrundlagen"] } }));
    expect(derive().readTopicIds.has("networking-fundamentals")).toBe(true);
  });

  it("frühere Anzeige mit Themen-IDs und ccna-completed-topics bleibt gültig", () => {
    localStorage.setItem("ccna-completed-topics", JSON.stringify(["ipv6"]));
    const p = derive({ completedStepIds: ["networking-fundamentals"] });
    expect([...p.readTopicIds].sort()).toEqual(["ipv6", "networking-fundamentals"]);
  });

  it("zuletzt geöffnete Themen gelten als begonnen, nicht als gelesen", () => {
    localStorage.setItem("ccna-recent-history", JSON.stringify([{ id: "stp", type: "topic", title: "STP" }, { id: "q1", type: "quiz", title: "x" }]));
    const p = derive();
    expect(p.openedTopicIds.has("stp")).toBe(true);
    expect(p.openedTopicIds.has("q1")).toBe(false);
    expect(p.readTopicIds.has("stp")).toBe(false);
  });

  it("bewusstes Abwählen überstimmt Altdaten; neues Ergebnis überstimmt „Altdaten ohne Ergebnis“", () => {
    setLessonRead("ios-cli", false);
    recordQuizResult("ccna-quiz-ios-cli", 80);
    const p = derive({ completedStepIds: ["step-3-ios-cli", "step-4-quiz-ios-cli"] });
    expect(p.readTopicIds.has("ios-cli")).toBe(false);
    expect(p.quizzes["ccna-quiz-ios-cli"]).toMatchObject({ bestPercent: 80, legacy: false });
  });

  it("kaputte oder fremde Speicherstände ergeben einen leeren Zustand, ohne Absturz", () => {
    for (const raw of ["", "{", "[]", JSON.stringify({ version: 2 }), JSON.stringify({ version: 1, lessons: 5, quizzes: "x" })]) {
      localStorage.setItem(LEARNING_PROGRESS_KEY, raw);
      expect(loadState()).toEqual(emptyState());
    }
    localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify({ version: 1, lessons: { a: { read: "ja" }, b: { read: true } }, quizzes: { q: { attempts: "x" } } }));
    const s = loadState();
    expect(s.lessons.a).toEqual({});
    expect(s.lessons.b.read).toBe(true);
    expect(s.quizzes.q).toBeUndefined();
  });

  it("alle Schritt-Zuordnungen verweisen auf Themen bzw. Quizzes des Lernpfads (Schritt-IDs eindeutig)", () => {
    expect(new Set(Object.values(LEGACY_STEP_TO_TOPIC)).size).toBe(Object.keys(LEGACY_STEP_TO_TOPIC).length);
    expect(Object.keys(LEGACY_STEP_TO_QUIZ).every((k) => k.startsWith("step-"))).toBe(true);
  });
});

describe("Lernfortschritt: Auswertung für die Prüfungsbereiche", () => {
  it("Anteil steigt mit jedem als gelesen markierten Thema", () => {
    const domain = BLUEPRINT_DOMAINS[0];
    const before = readShare(domain.topicIds, derive());
    expect(before).toMatchObject({ read: 0, percent: 0, total: domain.topicIds.length });
    setLessonRead(domain.topicIds[0], true);
    setLessonRead(domain.topicIds[1], true);
    const after = readShare(domain.topicIds, derive());
    expect(after.read).toBe(2);
    expect(after.percent).toBe(Math.round((2 / domain.topicIds.length) * 100));
    expect(after.percent).toBeGreaterThan(before.percent);
  });
});
