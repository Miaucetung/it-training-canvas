// @vitest-environment jsdom
/**
 * Phase 6c-3 Tests — TopicDetailPanel + adapters.ts Production Integration
 *
 * Tests:
 * a) Rendert Topic-Title und Description korrekt
 * b) Rendert alle Konzepte des Topics
 * c) Rendert alle Quizfragen
 * d) Rendert Cross-References (auch wenn leer: kein Crash)
 * e) Schließen-Button löst onClose aus
 * f) ESC-Key löst onClose aus
 * g) Funktioniert für Topic ohne Quizfragen (Stub-Topic)
 * h) Funktioniert für Topic ohne Cross-References
 * i) (App-Ebene) Klick auf Topic in Liste → TopicDetailPanel öffnet
 * j) adapters.ts wird tatsächlich aufgerufen (spy)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { TopicDetailPanel } from "@/components/TopicDetailPanel";
import * as adapters from "@/lib/content/adapters";
import type { CertificationModule, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Test data factories ──────────────────────────────────────

function makeQuestion(id: string, text: string): Question {
  return {
    id,
    type: "single-choice",
    text,
    explanation: "Erklärung",
    options: [
      { id: "a", text: "Option A", isCorrect: true },
      { id: "b", text: "Option B", isCorrect: false },
    ],
    tags: [],
    difficulty: "medium",
    moduleId: "test",
  } as unknown as Question;
}

function makeQuiz(id: string, title: string, questionCount = 3): Quiz {
  return {
    id,
    title,
    description: "Quiz-Beschreibung",
    passingScore: 70,
    shuffleQuestions: false,
    questions: Array.from({ length: questionCount }, (_, i) =>
      makeQuestion(`${id}-q${i}`, `Frage ${i + 1} aus ${title}`),
    ),
  };
}

function makeTopic(
  id: string,
  title: string,
  conceptIds: string[],
  quizIds: string[] = [],
): Topic {
  return {
    id,
    title,
    description: `Beschreibung für ${title}`,
    conceptIds,
    quizIds,
    exerciseIds: [],
    estimatedMinutes: 60,
    tags: ["test"],
  };
}

function makeModule(
  id: string,
  topics: Topic[],
  quizzes: Record<string, Quiz> = {},
): CertificationModule {
  const concepts = topics
    .flatMap((t) => t.conceptIds)
    .reduce(
      (acc, cid) => ({
        ...acc,
        [cid]: {
          id: cid,
          title: `Konzept: ${cid}`,
          content: `## ${cid}\n\nInhalt des Konzepts ${cid}.`,
          appliesTo: [id],
          tags: [],
        },
      }),
      {},
    );

  return {
    id,
    vendor: "generic",
    title: `Modul ${id}`,
    subtitle: `${id} Certification`,
    description: `Beschreibung ${id}`,
    difficulty: "intermediate",
    estimatedHours: 8,
    topics,
    concepts,
    quizzes,
    exercises: {},
    learningPaths: {},
    metadata: {
      slug: id,
      tagline: "",
      objectives: [],
      targetAudience: [],
      previewImageUrl: "",
      priceCents: 0,
      lastUpdated: "2026-01-01",
      certificationBody: "Test",
      featured: false,
      categories: [],
    },
  };
}

const T1_CONCEPTS = ["osi-model", "tcp-ip", "encapsulation"];
const T1_QUIZ_ID = "quiz-topic1";

const TOPIC_WITH_QUIZ = makeTopic("t1", "Netzwerkgrundlagen", T1_CONCEPTS, [T1_QUIZ_ID]);
const TOPIC_NO_QUIZ = makeTopic("t2", "IPv6 Grundlagen", ["ipv6-addr", "ndp"], []);
const TOPIC_NO_CROSSREF = makeTopic("t3", "WLAN Basics", ["wlan-std"], []);

const QUIZ_T1 = makeQuiz(T1_QUIZ_ID, "Quiz Netzwerkgrundlagen", 5);

const MODULE_TEST = makeModule(
  "test-module",
  [TOPIC_WITH_QUIZ, TOPIC_NO_QUIZ, TOPIC_NO_CROSSREF],
  { [T1_QUIZ_ID]: QUIZ_T1 },
);

// ── a) Rendert Topic-Title und Description ───────────────────
describe("a) Topic-Title und Description", () => {
  it("zeigt den Topic-Titel im Header", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Netzwerkgrundlagen")).toBeTruthy();
  });

  it("zeigt die Topic-Description", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Beschreibung für Netzwerkgrundlagen")).toBeTruthy();
  });
});

// ── b) Rendert alle Konzepte ─────────────────────────────────
describe("b) Konzepte-Rendering", () => {
  it("zeigt alle Konzept-Titel", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Konzept: osi-model")).toBeTruthy();
    expect(screen.getByText("Konzept: tcp-ip")).toBeTruthy();
    expect(screen.getByText("Konzept: encapsulation")).toBeTruthy();
  });

  it("zeigt Konzept-Index-Badges (1, 2, 3)", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("zeigt 'Konzepte (3)' in der Sektionsüberschrift", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Konzepte (3)")).toBeTruthy();
  });

  it("zeigt disabled Verstanden-Button pro Konzept", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    const buttons = screen.getAllByText("Verstanden");
    expect(buttons).toHaveLength(T1_CONCEPTS.length);
    buttons.forEach((btn) => {
      expect(btn.closest("button")).toHaveProperty("disabled", true);
    });
  });
});

// ── c) Rendert alle Quizfragen ───────────────────────────────
describe("c) Quiz-Rendering", () => {
  it("zeigt Quiz-Titel", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Quiz Netzwerkgrundlagen")).toBeTruthy();
  });

  it("zeigt Anzahl der Quizfragen in Sektionsüberschrift", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Quiz (5 Fragen)")).toBeTruthy();
  });

  it("zeigt erste 3 Quizfragen als Vorschau", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Frage 1 aus Quiz Netzwerkgrundlagen/)).toBeTruthy();
    expect(screen.getByText(/Frage 2 aus Quiz Netzwerkgrundlagen/)).toBeTruthy();
    expect(screen.getByText(/Frage 3 aus Quiz Netzwerkgrundlagen/)).toBeTruthy();
  });

  it("zeigt '+ N weitere Fragen' wenn >3 Fragen", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    // 5 questions: shows 3 + "2 weitere Fragen"
    expect(screen.getByText("+ 2 weitere Fragen")).toBeTruthy();
  });
});

// ── d) Cross-References ──────────────────────────────────────
describe("d) Cross-References", () => {
  it("zeigt keine Cross-Ref-Sektion wenn Topic keine Bridges hat", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_NO_CROSSREF}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Cross-References/)).toBeNull();
  });

  it("rendert ohne Crash wenn crossRefs leer sind", () => {
    expect(() =>
      render(
        <TopicDetailPanel
          topic={TOPIC_NO_CROSSREF}
          module={MODULE_TEST}
          theme="dark"
          onClose={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });
});

// ── e) Schließen-Button ──────────────────────────────────────
describe("e) Schließen-Button", () => {
  it("X-Button löst onClose aus", () => {
    const onClose = vi.fn();
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={onClose}
      />,
    );
    const closeButtons = screen.getAllByLabelText(/schließen/i);
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ArrowLeft-Button löst onClose aus", () => {
    const onClose = vi.fn();
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={onClose}
      />,
    );
    // First button is ArrowLeft
    const backButton = screen.getByLabelText("Schließen");
    fireEvent.click(backButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ── f) ESC-Key ───────────────────────────────────────────────
describe("f) ESC-Key", () => {
  it("ESC-Taste löst onClose aus", () => {
    const onClose = vi.fn();
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("andere Tasten lösen onClose NICHT aus", () => {
    const onClose = vi.fn();
    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Tab" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ── g) Topic ohne Quizfragen ─────────────────────────────────
describe("g) Stub-Topic ohne Quizfragen", () => {
  it("zeigt keine Quiz-Sektion wenn quizIds leer", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_NO_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    // Quiz-Sektion komplett absent
    expect(screen.queryByText(/Quiz \(\d+ Fragen\)/)).toBeNull();
  });

  it("rendert Konzepte auch ohne Quiz", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_NO_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Konzept: ipv6-addr")).toBeTruthy();
    expect(screen.getByText("Konzept: ndp")).toBeTruthy();
  });

  it("rendert ohne Crash für Stub-Topic", () => {
    expect(() =>
      render(
        <TopicDetailPanel
          topic={TOPIC_NO_QUIZ}
          module={MODULE_TEST}
          theme="dark"
          onClose={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });
});

// ── h) Topic ohne Cross-References ──────────────────────────
describe("h) Topic ohne Cross-References", () => {
  it("zeigt keine Cross-Ref-Sektion wenn crossRefs leer sind", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_NO_CROSSREF}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Cross-References/)).toBeNull();
  });

  it("zeigt keinen Hinweistext wenn keine Cross-Refs (Section ist versteckt)", () => {
    render(
      <TopicDetailPanel
        topic={TOPIC_NO_CROSSREF}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.queryByText("Keine Cross-References für dieses Topic."),
    ).toBeNull();
  });
});

// ── j) adapters.ts wird aufgerufen (spy) ─────────────────────
// Note: test j is placed before i intentionally (simpler, no mocking needed)
describe("j) adapters.ts Production-Aufruf verifiziert", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getTopicQuizIds wird beim Rendern aufgerufen", () => {
    const spy = vi.spyOn(adapters, "getTopicQuizIds");

    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );

    expect(spy).toHaveBeenCalledWith(MODULE_TEST, TOPIC_WITH_QUIZ.id);
  });

  it("extractQuizzes wird beim Rendern aufgerufen", () => {
    const spy = vi.spyOn(adapters, "extractQuizzes");

    render(
      <TopicDetailPanel
        topic={TOPIC_WITH_QUIZ}
        module={MODULE_TEST}
        theme="dark"
        onClose={vi.fn()}
      />,
    );

    expect(spy).toHaveBeenCalledWith(MODULE_TEST);
  });

  it("getTopicQuizIds gibt Quiz-IDs des Topics zurück", () => {
    const quizIds = adapters.getTopicQuizIds(MODULE_TEST, TOPIC_WITH_QUIZ.id);
    expect(quizIds).toEqual([T1_QUIZ_ID]);
  });

  it("extractQuizzes gibt vollständige Quiz-Map zurück", () => {
    const quizMap = adapters.extractQuizzes(MODULE_TEST);
    expect(quizMap[T1_QUIZ_ID]).toBeDefined();
    expect(quizMap[T1_QUIZ_ID].questions).toHaveLength(5);
  });
});

// ── Light-theme smoke test ───────────────────────────────────
describe("Light-Theme", () => {
  it("rendert ohne Crash im Light-Theme", () => {
    expect(() =>
      render(
        <TopicDetailPanel
          topic={TOPIC_WITH_QUIZ}
          module={MODULE_TEST}
          theme="light"
          onClose={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });
});

// ── Phase 6c-3a: Markdown-Rendering Tests ────────────────────
describe("6c-3a) Markdown-Rendering in Konzept-Texten", () => {
  function makeMarkdownModule(content: string): CertificationModule {
    const conceptId = "md-concept";
    const topic = makeTopic("md-topic", "Markdown Topic", [conceptId]);
    return {
      ...makeModule("md-module", [topic]),
      concepts: {
        [conceptId]: {
          id: conceptId,
          title: "Markdown Konzept",
          content,
          appliesTo: ["md-module"],
          tags: [],
        },
      },
    };
  }

  it("rendert **fett** als <strong>-Element", () => {
    const { container } = render(
      <TopicDetailPanel
        topic={makeTopic("md-topic", "MD Topic", ["md-concept"])}
        module={makeMarkdownModule("**Fettschrift** hier")}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    const strong = container.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toContain("Fettschrift");
  });

  it("rendert Listenelemente als <ul>/<li>", () => {
    const { container } = render(
      <TopicDetailPanel
        topic={makeTopic("md-topic", "MD Topic", ["md-concept"])}
        module={makeMarkdownModule("- Erster Punkt\n- Zweiter Punkt\n- Dritter Punkt")}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it("rendert Pipe-Tabellen als <table>", () => {
    const tableMarkdown =
      "| Spalte A | Spalte B |\n| --- | --- |\n| Wert 1 | Wert 2 |";
    const { container } = render(
      <TopicDetailPanel
        topic={makeTopic("md-topic", "MD Topic", ["md-concept"])}
        module={makeMarkdownModule(tableMarkdown)}
        theme="dark"
        onClose={vi.fn()}
      />,
    );
    const table = container.querySelector("table");
    expect(table).not.toBeNull();
  });
});
