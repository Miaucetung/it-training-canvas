// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SubnettingCheatsheet from "@/tools/SubnettingCheatsheet";

describe("Subnetting-Cheatsheet: Landmarks und Tabellenköpfe", () => {
  it("erzeugt keinen eigenen banner-Landmark", () => {
    render(<SubnettingCheatsheet />);
    expect(screen.queryAllByRole("banner").length).toBe(0);
    expect(screen.getByRole("heading", { level: 1, name: "Subnetting-Cheatsheet" })).toBeTruthy();
  });

  it("jede Tabellenkopfzelle hat einen Text", () => {
    const { container } = render(<SubnettingCheatsheet />);
    for (const th of container.querySelectorAll("th")) expect((th.textContent ?? "").trim()).not.toBe("");
  });
});
