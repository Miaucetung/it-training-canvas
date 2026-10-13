// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { CcnaDashboard } from "@/components/dashboard/CcnaDashboard";
import { LabScenariosDialog } from "@/components/LabScenariosDialog";
import { shouldIgnoreSingleKeyShortcut } from "@/lib/keyboard-shortcuts";

vi.mock("@/lib/content/content-loader", () => ({
  loadModule: vi.fn().mockResolvedValue({
    id: "ccna",
    title: "Cisco CCNA 200-301",
    topics: [{ id: "ios-cli", title: "Cisco IOS CLI" }],
  }),
}));

function press(target: Element | Window, init: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

describe("shouldIgnoreSingleKeyShortcut (B-08)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const ev = (init: KeyboardEventInit, target?: Element) => {
    const e = new KeyboardEvent("keydown", { bubbles: true, ...init });
    Object.defineProperty(e, "target", { value: target ?? document.body });
    return e;
  };

  it("ignoriert Strg/Cmd/Alt-Kombinationen", () => {
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p", ctrlKey: true }))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p", metaKey: true }))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p", altKey: true }))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }))).toBe(false);
  });

  it("ignoriert input, textarea, select, contenteditable und ARIA-Eingabewidgets", () => {
    const mk = (html: string) => {
      document.body.innerHTML = html;
      return document.body.firstElementChild!;
    };
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, mk("<input />")))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, mk("<textarea></textarea>")))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, mk("<select><option>a</option></select>")))).toBe(true);
    const ce = mk('<div contenteditable="true"></div>');
    Object.defineProperty(ce, "isContentEditable", { value: true });
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, ce))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, mk('<div role="combobox"><span id="x"></span></div>').querySelector("#x")!))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, mk("<button>ok</button>")))).toBe(false);
  });

  it("ignoriert bei offenem modalem Dialog, außer das Kürzel gehört zum Dialog", () => {
    document.body.innerHTML = '<div role="dialog" aria-modal="true"><button id="b">x</button></div>';
    const btn = document.getElementById("b")!;
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, btn))).toBe(true);
    expect(shouldIgnoreSingleKeyShortcut(ev({ key: "p" }, btn), { allowInModal: true })).toBe(false);
  });
});

describe("Dashboard-Kürzel P (B-08)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderDash = async () => {
    render(<CcnaDashboard theme="dark" />);
    await waitFor(() => expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument());
  };

  it("P schaltet den Präsentationsmodus um", async () => {
    await renderDash();
    const e = press(window, { key: "p" });
    expect(e.defaultPrevented).toBe(true);
    expect(screen.getByText(/Dozenten-Präsentationsmodus aktiv/)).toBeInTheDocument();
  });

  it("Strg+P bleibt beim Browser (kein preventDefault, kein Umschalten)", async () => {
    await renderDash();
    const e = press(window, { key: "p", ctrlKey: true });
    expect(e.defaultPrevented).toBe(false);
    expect(screen.queryByText(/Dozenten-Präsentationsmodus aktiv/)).toBeNull();
  });

  it("P in einem select schaltet nichts um", async () => {
    await renderDash();
    const select = document.createElement("select");
    document.body.appendChild(select);
    press(select, { key: "p" });
    expect(screen.queryByText(/Dozenten-Präsentationsmodus aktiv/)).toBeNull();
    select.remove();
  });

  it("P bei offenem Dialog schaltet nichts um", async () => {
    await renderDash();
    const dlg = document.createElement("div");
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-modal", "true");
    const btn = document.createElement("button");
    dlg.appendChild(btn);
    document.body.appendChild(dlg);
    press(btn, { key: "p" });
    expect(screen.queryByText(/Dozenten-Präsentationsmodus aktiv/)).toBeNull();
    dlg.remove();
  });
});

describe("Lab-Dialog-Kürzel P (B-08)", () => {
  it("Dashboard und Lab-Dialog schalten nicht gleichzeitig um; Strg+P wird nicht abgefangen", async () => {
    render(
      <>
        <CcnaDashboard theme="dark" />
        <LabScenariosDialog open={true} onClose={vi.fn()} />
      </>
    );
    await waitFor(() => expect(screen.getByText("CCNA 200-301 Lernplattform")).toBeInTheDocument());

    const ctrl = press(window, { key: "p", ctrlKey: true });
    expect(ctrl.defaultPrevented).toBe(false);

    press(window, { key: "p" });
    // Dashboard bleibt aus (Dialog ist modal), der Lab-Dialog schaltet um
    expect(screen.queryByText(/Dozenten-Präsentationsmodus aktiv/)).toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
  });
});
