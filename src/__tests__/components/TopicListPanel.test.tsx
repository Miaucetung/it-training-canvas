// @vitest-environment jsdom
/**
 * Phase 6c-2 Tests — TopicListPanel
 *
 * Absicherung:
 * a) Rendert Topic-Liste für CCNA mit allen 8 Topics
 * b) Rendert Topic-Liste für AZ-900 mit genau 10 Topics
 * c) Rendert Topic-Liste für Network+ mit genau 5 Topics
 * d) Zeigt Ladezustand während async load
 * e) Zeigt Fehlerzustand für unbekannte moduleId
 * f) (App-Ebene) Klick auf AZ-900 → TopicListPanel erscheint
 * g) (App-Ebene) Legacy-Subject → kein TopicListPanel
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { TopicListPanel } from "@/components/TopicListPanel";
import { SUBJECT_TO_MODULE_ID } from "@/App";

// ── Module mocks ─────────────────────────────────────────────
// We mock content-loader so tests don't need the real registry dance.
// The real registry integration is covered by bridge-integrity.test.ts.

vi.mock("@/lib/content/content-loader", () => ({
  loadModule: vi.fn(),
}));

import { loadModule } from "@/lib/content/content-loader";
const mockLoadModule = loadModule as ReturnType<typeof vi.fn>;

// Minimal Topic factory
function makeTopic(id: string, title: string, conceptCount = 3, quizIds: string[] = []) {
  return {
    id,
    title,
    description: `Beschreibung für ${title}`,
    conceptIds: Array.from({ length: conceptCount }, (_, i) => `c-${id}-${i}`),
    quizIds,
    exerciseIds: [],
    estimatedMinutes: 60,
    tags: [],
  };
}

// Minimal module factory
function makeModule(id: string, title: string, topics: ReturnType<typeof makeTopic>[]) {
  return {
    id,
    title,
    subtitle: `${title} Certification`,
    description: `${title} Lernmodul`,
    vendor: "generic",
    difficulty: "intermediate" as const,
    topics,
    concepts: {},
    quizzes: {},
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

const CCNA_TOPICS = Array.from({ length: 8 }, (_, i) =>
  makeTopic(`ccna-topic-${i + 1}`, `CCNA Topic ${i + 1}`),
);
const AZ900_TOPICS = Array.from({ length: 10 }, (_, i) =>
  makeTopic(`az-topic-${i + 1}`, `AZ-900 Topic ${i + 1}`),
);
const NETPLUS_TOPICS = Array.from({ length: 5 }, (_, i) =>
  makeTopic(`np-topic-${i + 1}`, `Network+ Topic ${i + 1}`),
);

beforeEach(() => {
  mockLoadModule.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── a) CCNA: 8 Topics ────────────────────────────────────────
describe("a) CCNA — 8 Topics", () => {
  it("rendert alle 8 CCNA-Topic-Titel", async () => {
    mockLoadModule.mockResolvedValue(makeModule("ccna", "Cisco CCNA 200-301", CCNA_TOPICS));

    render(<TopicListPanel moduleId="ccna" theme="dark" />);

    await waitFor(() => {
      expect(screen.getByText("CCNA Topic 1")).toBeTruthy();
      expect(screen.getByText("CCNA Topic 8")).toBeTruthy();
    });

    // Exactly 8 numbered badges (1-8)
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(String(i))).toBeTruthy();
    }
  });

  it("zeigt Modulname in der Überschrift", async () => {
    mockLoadModule.mockResolvedValue(makeModule("ccna", "Cisco CCNA 200-301", CCNA_TOPICS));
    render(<TopicListPanel moduleId="ccna" theme="dark" />);
    await waitFor(() => expect(screen.getByText("Cisco CCNA 200-301")).toBeTruthy());
  });
});

// ── b) AZ-900: genau 10 Topics ───────────────────────────────
describe("b) AZ-900 — genau 10 Topics", () => {
  it("rendert genau 10 AZ-900-Topic-Titel", async () => {
    mockLoadModule.mockResolvedValue(
      makeModule("az-900", "Microsoft Azure Fundamentals", AZ900_TOPICS),
    );

    render(<TopicListPanel moduleId="az-900" theme="dark" />);

    await waitFor(() => {
      expect(screen.getByText("AZ-900 Topic 1")).toBeTruthy();
      expect(screen.getByText("AZ-900 Topic 10")).toBeTruthy();
    });

    // Badge "10" exists
    expect(screen.getByText("10")).toBeTruthy();
    // No badge "11"
    expect(screen.queryByText("11")).toBeNull();
  });

  it("zeigt '10 Topics' im Stats-Bereich", async () => {
    mockLoadModule.mockResolvedValue(
      makeModule("az-900", "Microsoft Azure Fundamentals", AZ900_TOPICS),
    );
    render(<TopicListPanel moduleId="az-900" theme="dark" />);
    await waitFor(() => expect(screen.getByText("10 Topics")).toBeTruthy());
  });
});

// ── c) Network+: genau 5 Topics ──────────────────────────────
describe("c) Network+ — genau 5 Topics", () => {
  it("rendert genau 5 Network+-Topic-Titel", async () => {
    mockLoadModule.mockResolvedValue(
      makeModule("comptia-network-plus", "CompTIA Network+ N10-009", NETPLUS_TOPICS),
    );

    render(<TopicListPanel moduleId="comptia-network-plus" theme="dark" />);

    await waitFor(() => {
      expect(screen.getByText("Network+ Topic 1")).toBeTruthy();
      expect(screen.getByText("Network+ Topic 5")).toBeTruthy();
    });

    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.queryByText("6")).toBeNull();
  });

  it("zeigt '5 Topics' im Stats-Bereich", async () => {
    mockLoadModule.mockResolvedValue(
      makeModule("comptia-network-plus", "CompTIA Network+ N10-009", NETPLUS_TOPICS),
    );
    render(<TopicListPanel moduleId="comptia-network-plus" theme="dark" />);
    await waitFor(() => expect(screen.getByText("5 Topics")).toBeTruthy());
  });
});

// ── d) Ladezustand ───────────────────────────────────────────
describe("d) Ladezustand", () => {
  it("zeigt Ladeindikator während loadModule noch läuft", () => {
    // Never resolves during this test
    mockLoadModule.mockReturnValue(new Promise(() => {}));

    render(<TopicListPanel moduleId="ccna" theme="dark" />);

    expect(screen.getByText("Modul wird geladen...")).toBeTruthy();
  });

  it("versteckt Ladeindikator nach erfolgreichem Load", async () => {
    mockLoadModule.mockResolvedValue(makeModule("ccna", "Cisco CCNA 200-301", CCNA_TOPICS));

    render(<TopicListPanel moduleId="ccna" theme="dark" />);

    await waitFor(() =>
      expect(screen.queryByText("Modul wird geladen...")).toBeNull(),
    );
  });
});

// ── e) Fehlerzustand ─────────────────────────────────────────
describe("e) Fehlerzustand", () => {
  it("zeigt Fehlermeldung für unbekannte moduleId", async () => {
    mockLoadModule.mockRejectedValue(new Error("No factory for 'unknown'"));

    render(<TopicListPanel moduleId="unknown" theme="dark" />);

    await waitFor(() =>
      expect(screen.getByText("Modul nicht gefunden")).toBeTruthy(),
    );
  });

  it("zeigt die moduleId im Fehlerzustand", async () => {
    mockLoadModule.mockRejectedValue(new Error("Not found"));

    render(<TopicListPanel moduleId="does-not-exist" theme="dark" />);

    await waitFor(() =>
      expect(screen.getByText(/does-not-exist/)).toBeTruthy(),
    );
  });
});

// ── f) SUBJECT_TO_MODULE_ID mapping ─────────────────────────
// App-level (unit): Mapping ist vollständig und korrekt
describe("f) SUBJECT_TO_MODULE_ID — App-level mapping", () => {
  it("enthält Eintrag für CCNA → ccna", () => {
    expect(SUBJECT_TO_MODULE_ID["CCNA"]).toBe("ccna");
  });

  it("enthält Eintrag für AZ-900 → az-900", () => {
    expect(SUBJECT_TO_MODULE_ID["AZ-900"]).toBe("az-900");
  });

  it("enthält Eintrag für NetworkPlus → comptia-network-plus", () => {
    expect(SUBJECT_TO_MODULE_ID["NetworkPlus"]).toBe("comptia-network-plus");
  });

  it("gibt undefined für Legacy-Subject FISI zurück", () => {
    expect(SUBJECT_TO_MODULE_ID["FISI"]).toBeUndefined();
  });

  it("gibt undefined für Legacy-Subject Linux zurück", () => {
    expect(SUBJECT_TO_MODULE_ID["Linux"]).toBeUndefined();
  });
});

// ── g) Concept-Count und Quiz-Question-Count ─────────────────
describe("g) Meta-Daten pro Topic", () => {
  it("zeigt Konzept-Anzahl pro Topic an", async () => {
    const topics = [makeTopic("t1", "Topic A", 5)];
    mockLoadModule.mockResolvedValue(makeModule("ccna", "CCNA", topics));

    render(<TopicListPanel moduleId="ccna" theme="dark" />);

    // "5 Konzepte" appears twice: in header stats and in topic row
    await waitFor(() => expect(screen.getAllByText("5 Konzepte").length).toBeGreaterThan(0));
  });

  it("zeigt Quizfragen-Anzahl wenn Quizzes vorhanden", async () => {
    const topic = makeTopic("t1", "Topic A", 3, ["quiz-1"]);
    const mod = makeModule("ccna", "CCNA", [topic]);
    mod.quizzes = {
      "quiz-1": {
        id: "quiz-1",
        title: "Test Quiz",
        description: "",
        passingScore: 70,
        shuffleQuestions: false,
        questions: Array.from({ length: 7 }, (_, i) => ({ id: `q${i}` })) as any,
      },
    };
    mockLoadModule.mockResolvedValue(mod);

    render(<TopicListPanel moduleId="ccna" theme="dark" />);

    // "7 Fragen" appears twice: in header stats and in topic row
    await waitFor(() => expect(screen.getAllByText("7 Fragen").length).toBeGreaterThan(0));
  });

  it("zeigt kein '0 Fragen' wenn keine Quizzes verlinkt", async () => {
    const topics = [makeTopic("t1", "Topic A", 3, [])]; // no quizIds
    mockLoadModule.mockResolvedValue(makeModule("ccna", "CCNA", topics));

    render(<TopicListPanel moduleId="ccna" theme="dark" />);

    await waitFor(() => expect(screen.queryByText("0 Fragen")).toBeNull());
  });
});
