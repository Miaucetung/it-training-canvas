// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within, fireEvent, act } from "@testing-library/react";
import { CcnaDashboard } from "@/components/dashboard/CcnaDashboard";
import { TodayPracticeSection } from "@/components/dashboard/TodayPracticeSection";
import { BUILT_IN_TEMPLATES } from "@/lib/collaboration-engine";

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

describe("Dashboard: keine erfundenen Inhalte (B-05)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("zeigt ohne echte Historie keinen Beispieleintrag, auch wenn Fortschritt existiert", async () => {
    const progress = {
      "ccna-full-path": {
        completedSteps: ["networking-fundamentals"],
        lastActivityAt: undefined,
      },
    } as never;
    render(<CcnaDashboard theme="dark" userProgress={progress} />);
    await waitFor(() => expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument());

    const region = screen.getByRole("region", { name: "Zuletzt bearbeitet" });
    expect(within(region).getByText("Noch keine Lernhistorie vorhanden")).toBeInTheDocument();
    expect(within(region).queryByText(/OSI-Modell/)).toBeNull();
    expect(within(region).queryByText(/Vor \d+ Stunden/)).toBeNull();
    expect(within(region).queryByRole("button", { name: /Fortsetzen/ })).toBeNull();
  });

  it("zeigt echte Historie aus dem Speicher unverändert an", async () => {
    localStorage.setItem(
      "ccna-recent-history",
      JSON.stringify([{ id: "ios-cli", type: "topic", title: "Cisco IOS CLI", timestamp: Date.now() - 3 * 86400000 }])
    );
    render(<CcnaDashboard theme="dark" />);
    await waitFor(() => expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument());
    const region = screen.getByRole("region", { name: "Zuletzt bearbeitet" });
    expect(within(region).getByText("Cisco IOS CLI")).toBeInTheDocument();
    expect(within(region).getByText("Vor 3 Tagen")).toBeInTheDocument();
  });

  it("Übungskarten tragen keine fest einprogrammierten Zähler", () => {
    render(<TodayPracticeSection onOpenWeaknessDrill={vi.fn()} onOpenDragDropTrainer={vi.fn()} onOpenSubnetDrill={vi.fn()} onOpenLabs={vi.fn()} />);
    expect(screen.queryByText(/81 Labs/)).toBeNull();
    expect(screen.queryByText(/\(55\)/)).toBeNull();
  });

  it("eingebaute Vorlagen tragen keine erfundenen Bewertungen", () => {
    for (const t of BUILT_IN_TEMPLATES) {
      expect(t.rating, t.id).toBe(0);
      expect(t.downloads, t.id).toBe(0);
    }
  });

  it("Ping-Hinweis behauptet keine Messwerte", async () => {
    render(<CcnaDashboard theme="dark" />);
    await waitFor(() => expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument());
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: /Ping testen/i }));
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    vi.useRealTimers();
    expect(screen.queryByText(/RTT|Pakete empfangen/)).toBeNull();
    expect(screen.getByText(/keine Messung/)).toBeInTheDocument();
  });
});
