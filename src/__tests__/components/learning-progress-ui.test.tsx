// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { CcnaDashboard } from "@/components/dashboard/CcnaDashboard";
import { TopicDetailPanel } from "@/components/TopicDetailPanel";
import { loadState, recordQuizResult, setLessonRead } from "@/lib/learning-progress";
import type { CertificationModule, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

vi.mock("@/lib/content/content-loader", () => ({
  loadModule: vi.fn().mockResolvedValue({
    id: "ccna",
    title: "Cisco CCNA 200-301",
    topics: [
      { id: "networking-fundamentals", title: "Netzwerkgrundlagen" },
      { id: "ios-cli", title: "Cisco IOS CLI" },
    ],
  }),
}));

// Quiz-Dialog durch einen Knopf ersetzen, der das Quiz „vollständig durchläuft“
vi.mock("@/components/QuizDialog", () => ({
  QuizDialog: ({ onComplete }: { onComplete: (r: unknown) => void }) => (
    <button onClick={() => onComplete({ totalPoints: 3, maxPoints: 4, percentage: 75, passed: true, results: [], completedAt: 1 })}>Quiz beenden</button>
  ),
}));

beforeEach(() => localStorage.clear());

function domainCard(titleRe: RegExp) {
  return screen.getByRole("heading", { name: titleRe }).closest("div.rounded-lg") as HTMLElement;
}

describe("Dashboard: die Fortschrittsbalken steigen", () => {
  it("ein als gelesen markiertes Thema erhöht Zähler und Prozent im passenden Bereich, Abwählen senkt sie", async () => {
    render(<CcnaDashboard theme="dark" />);
    const card = () => domainCard(/Network Fundamentals/);
    await waitFor(() => expect(card()).toBeInTheDocument());
    expect(within(card()).getByText("Lektionen: 0/8")).toBeInTheDocument();
    expect(within(card()).getByText("0 %")).toBeInTheDocument();

    act(() => setLessonRead("networking-fundamentals", true));
    await waitFor(() => expect(within(card()).getByText("Lektionen: 1/8")).toBeInTheDocument());
    expect(within(card()).getByText("13 %")).toBeInTheDocument();
    // andere Bereiche bleiben unberührt
    expect(within(domainCard(/Network Access/)).getByText("0 %")).toBeInTheDocument();

    act(() => setLessonRead("ios-cli", true));
    await waitFor(() => expect(within(card()).getByText("Lektionen: 2/8")).toBeInTheDocument());
    expect(within(card()).getByText("25 %")).toBeInTheDocument();

    act(() => setLessonRead("ios-cli", false));
    await waitFor(() => expect(within(card()).getByText("Lektionen: 1/8")).toBeInTheDocument());
  });

  it("Altdaten (Schritte des Lernpfads) werden angezeigt", async () => {
    render(<CcnaDashboard theme="dark" userProgress={{ "ccna-full-path": { completedSteps: ["step-1-netzwerkgrundlagen", "step-3-ios-cli"] } } as never} />);
    await waitFor(() => expect(within(domainCard(/Network Fundamentals/)).getByText("Lektionen: 2/8")).toBeInTheDocument());
  });
});

function question(id: string): Question {
  return { id, type: "single-choice", text: `Frage ${id}`, explanation: "", options: [{ id: "a", text: "A", isCorrect: true }], tags: [], difficulty: "medium", moduleId: "t" } as unknown as Question;
}
const QUIZ: Quiz = { id: "quiz-t1", title: "Quiz T1", description: "", passingScore: 70, shuffleQuestions: false, questions: [question("q1"), question("q2")] };
const TOPIC: Topic = { id: "t1", title: "Thema Eins", description: "Beschreibung", conceptIds: ["c1"], quizIds: ["quiz-t1"], exerciseIds: [], estimatedMinutes: 30, tags: [] };
const MODULE = {
  id: "ccna",
  vendor: "cisco",
  title: "CCNA",
  subtitle: "",
  description: "",
  difficulty: "intermediate",
  estimatedHours: 1,
  topics: [TOPIC],
  concepts: { c1: { id: "c1", title: "Konzept 1", content: "Inhalt", appliesTo: ["ccna"], tags: [] } },
  quizzes: { "quiz-t1": QUIZ },
  exercises: {},
  learningPaths: {},
  metadata: { slug: "ccna", tagline: "", objectives: [], targetAudience: [], previewImageUrl: "", priceCents: 0, lastUpdated: "2026-01-01", certificationBody: "Cisco", featured: false, categories: [] },
} as unknown as CertificationModule;

describe("Lektion: gelesen markieren und Quiz-Ergebnis", () => {
  it("Öffnen = begonnen; Button markiert als gelesen und nimmt es wieder zurück", () => {
    render(<TopicDetailPanel topic={TOPIC} module={MODULE} theme="dark" onClose={() => {}} />);
    expect(loadState().lessons.t1.openedAt).toBeTypeOf("number");
    expect(screen.getByText("Status: begonnen")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Als gelesen markieren" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(loadState().lessons.t1.read).toBe(true);
    expect(screen.getByText("Status: gelesen")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /zurücknehmen/ })[0]);
    expect(loadState().lessons.t1.read).toBe(false);
    expect(screen.getByText("Status: begonnen")).toBeInTheDocument();
  });

  it("vollständig durchlaufenes Quiz wird mit Ergebnis gespeichert und angezeigt", async () => {
    render(<TopicDetailPanel topic={TOPIC} module={MODULE} theme="dark" onClose={() => {}} />);
    expect(screen.getByTestId("quiz-status-quiz-t1")).toHaveTextContent("Noch nicht bearbeitet");
    fireEvent.click(screen.getByRole("button", { name: /Quiz starten/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Quiz beenden" }));
    expect(loadState().quizzes["quiz-t1"]).toMatchObject({ attempts: 1, bestPercent: 75, lastPercent: 75 });
    await waitFor(() => expect(screen.getByTestId("quiz-status-quiz-t1")).toHaveTextContent("Bearbeitet · bestes Ergebnis 75 %"));
  });

  it("ein abgebrochenes Quiz (Dialog geschlossen, kein onComplete) zählt nicht als bearbeitet", () => {
    render(<TopicDetailPanel topic={TOPIC} module={MODULE} theme="dark" onClose={() => {}} />);
    expect(loadState().quizzes["quiz-t1"]).toBeUndefined();
    act(() => recordQuizResult("anderes-quiz", 50));
    expect(screen.getByTestId("quiz-status-quiz-t1")).toHaveTextContent("Noch nicht bearbeitet");
  });
});
