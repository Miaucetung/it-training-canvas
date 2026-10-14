// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { CcnaDashboard } from "@/components/dashboard/CcnaDashboard";
import { loadState, setLessonRead } from "@/lib/learning-progress";

const { TOPICS, QUIZZES } = vi.hoisted(() => ({
  TOPICS: [
  { id: "networking-fundamentals", title: "Netzwerkgrundlagen", estimatedMinutes: 120 },
  { id: "ios-cli", title: "Cisco IOS CLI", estimatedMinutes: 120 },
  { id: "routing-ospf", title: "Routing & OSPF", estimatedMinutes: 180 },
],
  QUIZZES: {
  "ccna-quiz-netzwerkgrundlagen": { id: "ccna-quiz-netzwerkgrundlagen", title: "Quiz Netzwerkgrundlagen", questions: [{ id: "a" }, { id: "b" }] },
  "ccna-quiz-tag1-grundlagen": { id: "ccna-quiz-tag1-grundlagen", title: "Quiz Tag 1", questions: [{ id: "c" }] },
},
}));

vi.mock("@/lib/content/content-loader", () => ({
  loadModule: vi.fn().mockResolvedValue({ id: "ccna", title: "CCNA", topics: TOPICS, quizzes: QUIZZES }),
}));
vi.mock("@/components/QuizDialog", () => ({
  QuizDialog: ({ quiz, onComplete }: { quiz: { id: string }; onComplete: (r: unknown) => void }) => (
    <button onClick={() => onComplete({ totalPoints: 2, maxPoints: 2, percentage: 100, passed: true, results: [], completedAt: 1 })}>Quiz {quiz.id} beenden</button>
  ),
}));
vi.mock("@/lib/lab-infos", () => ({
  useLabInfos: () => ({ "basic-ip": { id: "basic-ip", title: "IP-Grundkonfiguration", duration: "15 min" } }),
}));

beforeEach(() => localStorage.clear());

const setup = async (props: Record<string, unknown> = {}) => {
  const onTopicClick = vi.fn();
  const onOpenLab = vi.fn();
  render(<CcnaDashboard theme="dark" onTopicClick={onTopicClick} onOpenLab={onOpenLab} {...props} />);
  await waitFor(() => expect(screen.getByRole("region", { name: "Nächster Schritt" })).toBeInTheDocument());
  await waitFor(() => expect(TOPICS.length).toBeGreaterThan(0));
  return { onTopicClick, onOpenLab };
};

describe("Dashboard: Nächster Schritt", () => {
  it("neue Nutzer: Schritt 1, erste Lektion, ein Klick bis zur Lektion", async () => {
    const { onTopicClick } = await setup();
    const card = screen.getByRole("region", { name: "Nächster Schritt" });
    expect(within(card).getByText("Schritt 1 · Netzwerkgrundlagen und OSI/TCP-IP")).toBeInTheDocument();
    expect(within(card).getByText(/Hier fängst du an/)).toBeInTheDocument();
    await waitFor(() => expect(within(card).getByText(/Lektion: Netzwerkgrundlagen \(120 Min\.\)/)).toBeInTheDocument());
    fireEvent.click(within(card).getByRole("button", { name: /Jetzt starten: Lektion lesen/ }));
    expect(onTopicClick).toHaveBeenCalledTimes(1);
    expect(onTopicClick.mock.calls[0][0].id).toBe("networking-fundamentals");
    expect(onTopicClick.mock.calls[0][2]).toBeUndefined();
  });

  it("nach der Lektion folgen die Übungsfragen (ein Klick startet das Quiz), danach das nächste Quiz", async () => {
    await setup();
    act(() => setLessonRead("networking-fundamentals", true));
    const card = () => screen.getByRole("region", { name: "Nächster Schritt" });
    await waitFor(() => expect(within(card()).getByText(/Übungsfragen: Quiz Netzwerkgrundlagen \(2 Fragen\)/)).toBeInTheDocument());
    fireEvent.click(within(card()).getByRole("button", { name: "Übungsfragen starten" }));
    fireEvent.click(await screen.findByRole("button", { name: /ccna-quiz-netzwerkgrundlagen beenden/ }));
    expect(loadState().quizzes["ccna-quiz-netzwerkgrundlagen"]).toMatchObject({ attempts: 1, bestPercent: 100 });
    await waitFor(() => expect(within(card()).getByText(/Übungsfragen: Quiz Tag 1/)).toBeInTheDocument());
  });
});

describe("Dashboard: Lernpfad", () => {
  it("zeigt 15 Schritte mit Status; der empfohlene Schritt ist aufgeklappt", async () => {
    await setup();
    const path = screen.getByRole("region", { name: "Lernpfad" });
    expect(within(path).getAllByRole("listitem").length).toBeGreaterThanOrEqual(15);
    expect(within(path).getByText("0 von 15 Schritten abgeschlossen")).toBeInTheDocument();
    const first = within(path).getByRole("button", { name: /Schritt 1.*Netzwerkgrundlagen und OSI\/TCP-IP/ });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(within(path).getByRole("heading", { name: /1 · Verstehen/ })).toBeInTheDocument();
    expect(within(path).getByRole("heading", { name: /2 · Üben/ })).toBeInTheDocument();
    expect(within(path).getByRole("heading", { name: /3 · Anwenden/ })).toBeInTheDocument();
  });

  it("Status steigt mit echten Daten: begonnen → abgeschlossen, Zähler im Kopf", async () => {
    await setup();
    const path = () => screen.getByRole("region", { name: "Lernpfad" });
    act(() => setLessonRead("networking-fundamentals", true));
    await waitFor(() => expect(within(path()).getByText(/begonnen · 1\/3/)).toBeInTheDocument());
    act(() => {
      localStorage.setItem(
        "ccna-learning-progress-v1",
        JSON.stringify({ version: 1, lessons: { "networking-fundamentals": { read: true } }, quizzes: { "ccna-quiz-netzwerkgrundlagen": { attempts: 1, completedAt: 1, lastPercent: 50, bestPercent: 50 }, "ccna-quiz-tag1-grundlagen": { attempts: 1, completedAt: 2, lastPercent: 90, bestPercent: 90 } } }),
      );
      window.dispatchEvent(new CustomEvent("ccna-learning-progress-changed"));
    });
    await waitFor(() => expect(within(path()).getByText("1 von 15 Schritten abgeschlossen")).toBeInTheDocument());
    expect(within(path()).getByText(/abgeschlossen · 3\/3/)).toBeInTheDocument();
  });

  it("routing-ospf öffnet in Schritt 7 und 8 an unterschiedlichen Abschnitten", async () => {
    const { onTopicClick } = await setup();
    const path = screen.getByRole("region", { name: "Lernpfad" });
    fireEvent.click(within(path).getByRole("button", { name: /Schritt 7/ }));
    fireEvent.click(await within(path).findByRole("button", { name: /Lektion: Routing & OSPF/ }));
    expect(onTopicClick.mock.calls[onTopicClick.mock.calls.length - 1]?.[2]).toBe("routing-fundamentals");
    fireEvent.click(within(path).getByRole("button", { name: /Schritt 8/ }));
    fireEvent.click(await within(path).findByRole("button", { name: /Lektion: Routing & OSPF/ }));
    expect(onTopicClick.mock.calls[onTopicClick.mock.calls.length - 1]?.[2]).toBe("ospf");
  });

  it("Labs öffnen direkt das passende Lab (Schritt 4: IP-Grundkonfiguration)", async () => {
    const { onOpenLab } = await setup();
    const path = screen.getByRole("region", { name: "Lernpfad" });
    fireEvent.click(within(path).getByRole("button", { name: /Schritt 4/ }));
    fireEvent.click(await within(path).findByRole("button", { name: /Lab: IP-Grundkonfiguration/ }));
    expect(onOpenLab).toHaveBeenCalledWith("basic-ip");
  });

  it("Schritte ohne Lab sagen das sachlich (Wireless)", async () => {
    await setup();
    const path = screen.getByRole("region", { name: "Lernpfad" });
    fireEvent.click(within(path).getByRole("button", { name: /Schritt 13/ }));
    expect(await within(path).findByText("Für diesen Schritt gibt es kein Lab und keinen Simulator.")).toBeInTheDocument();
  });
});
