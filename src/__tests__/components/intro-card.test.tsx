// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { CcnaDashboard } from "@/components/dashboard/CcnaDashboard";
import { CISCO_EXAM_PAGE, CISCO_EXAM_TOPICS_PDF, INTRO_DISMISSED_KEY } from "@/components/dashboard/IntroCard";
import { BLUEPRINT_DOMAINS } from "@/lib/dashboard-blueprint-config";

vi.mock("@/lib/content/content-loader", () => ({
  loadModule: vi.fn().mockResolvedValue({ id: "ccna", title: "CCNA", topics: [], quizzes: {} }),
}));

beforeEach(() => localStorage.clear());

const ready = async () => {
  render(<CcnaDashboard theme="dark" />);
  await waitFor(() => expect(screen.getByRole("region", { name: "Nächster Schritt" })).toBeInTheDocument());
};

describe("Einführungskarte", () => {
  it("erscheint beim ersten Besuch als Karte (kein Dialog/Overlay), mit drei Schritten", async () => {
    await ready();
    const card = screen.getByRole("region", { name: "So funktioniert die App" });
    expect(within(card).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("lässt sich schließen, bleibt geschlossen und ist über das „?“ wieder aufrufbar", async () => {
    const { unmount } = render(<CcnaDashboard theme="dark" />);
    await waitFor(() => expect(screen.getByRole("region", { name: "So funktioniert die App" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Einführung schließen" }));
    expect(screen.queryByRole("region", { name: "So funktioniert die App" })).toBeNull();
    expect(localStorage.getItem(INTRO_DISMISSED_KEY)).toBe("1");
    unmount();

    await ready();
    expect(screen.queryByRole("region", { name: "So funktioniert die App" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Hilfe: So funktioniert die App" }));
    expect(screen.getByRole("region", { name: "So funktioniert die App" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hilfe: So funktioniert die App" }));
    expect(screen.queryByRole("region", { name: "So funktioniert die App" })).toBeNull();
  });

  it("Prüfungsangaben: nur offizielle Cisco-Angaben mit Quelle und Datum, keine Bestehensgrenze und keine Fragenzahl", async () => {
    await ready();
    const card = screen.getByRole("region", { name: "So funktioniert die App" });
    fireEvent.click(within(card).getByRole("button", { name: /Was ist die CCNA/ }));
    const text = card.textContent ?? "";
    expect(text).toContain("120 Minuten");
    expect(text).toContain("Version 1.1");
    expect(text).toContain("keine Angaben");
    expect(text).toContain("abgerufen am 14.10.2026");
    expect(text).not.toMatch(/\d+\s*%\s*(zum|Bestehen)|Bestehensgrenze von|\b\d{3,4}\s*(Punkte|von 1000)/);
    expect(within(card).getByRole("link", { name: "Prüfungsseite" })).toHaveAttribute("href", CISCO_EXAM_PAGE);
    expect(within(card).getByRole("link", { name: /Prüfungsthemen v1\.1/ })).toHaveAttribute("href", CISCO_EXAM_TOPICS_PDF);
    // die genannten Gewichte entsprechen der Blueprint-Konfiguration der App
    for (const d of BLUEPRINT_DOMAINS) expect(text).toContain(`${d.title} (${d.weightPercent} %)`.replace("Automation and Programmability", "Automation and Programmability"));
  });
});
