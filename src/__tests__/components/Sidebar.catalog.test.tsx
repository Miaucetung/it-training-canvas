// @vitest-environment jsdom
/**
 * Phase 6c-1: Sicherheits-Leine für Sidebar ↔ module-catalog Anbindung.
 *
 * Tests prüfen:
 * 1. CATALOG_SUBJECTS enthält genau die Slugs, die NICHT in DEFAULT_SUBJECTS stehen
 * 2. Sidebar rendert Anzeigenamen aller drei Catalog-Einträge korrekt
 * 3. Sidebar rendert Legacy-Subjects weiterhin (kein Regression)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/Sidebar";
import { CATALOG_PREVIEW } from "@/lib/content/module-catalog";
import { DEFAULT_SUBJECTS, SUBJECT_CONFIGS } from "@/lib/types";

// ── Repliziert die CATALOG_SUBJECTS-Berechnung aus App.tsx ──────────────────
const CATALOG_SLUG_TO_SUBJECT: Record<string, string> = {
  "ccna": "CCNA",
  "az-900": "AZ-900",
  "comptia-network-plus": "NetworkPlus",
};

const CATALOG_SUBJECTS = CATALOG_PREVIEW
  .map((m) => CATALOG_SLUG_TO_SUBJECT[m.slug])
  .filter((s): s is string => !!s && !DEFAULT_SUBJECTS.includes(s));

// ── Hilfsfunktion für Standard-Sidebar-Props ────────────────────────────────
function makeSidebarProps(subjects: string[]) {
  return {
    subjects,
    currentSubject: subjects[0],
    onSubjectChange: vi.fn(),
    onAddSubject: vi.fn(),
    onRemoveSubject: vi.fn(),
    collapsed: false,
    onToggleCollapse: vi.fn(),
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────
describe("Phase 6c-1: Sidebar ↔ module-catalog", () => {
  describe("CATALOG_SUBJECTS mapping (unit)", () => {
    it("enthält genau die Catalog-Slugs, die nicht in DEFAULT_SUBJECTS stehen", () => {
      // CCNA ist in DEFAULT_SUBJECTS → soll NICHT in CATALOG_SUBJECTS sein
      expect(CATALOG_SUBJECTS).not.toContain("CCNA");
      // AZ-900 und NetworkPlus sind neu → sollen enthalten sein
      expect(CATALOG_SUBJECTS).toContain("AZ-900");
      expect(CATALOG_SUBJECTS).toContain("NetworkPlus");
    });

    it("alle Catalog-Subjects haben einen SUBJECT_CONFIGS-Eintrag", () => {
      for (const subject of CATALOG_SUBJECTS) {
        expect(
          SUBJECT_CONFIGS[subject],
          `SUBJECT_CONFIGS["${subject}"] fehlt`,
        ).toBeDefined();
      }
    });

    it("SUBJECT_CONFIGS-Einträge für Catalog-Subjects haben die richtigen Namen", () => {
      expect(SUBJECT_CONFIGS["AZ-900"].name).toBe("AZ-900 Fundamentals");
      expect(SUBJECT_CONFIGS["NetworkPlus"].name).toBe("CompTIA Network+");
    });
  });

  describe("Sidebar rendering mit Catalog-Subjects", () => {
    const allSubjects = [...DEFAULT_SUBJECTS, ...CATALOG_SUBJECTS];

    it("zeigt den Display-Namen von AZ-900 an", () => {
      render(<Sidebar {...makeSidebarProps(allSubjects)} />);
      expect(screen.getByText("AZ-900 Fundamentals")).toBeTruthy();
    });

    it("zeigt den Display-Namen von CompTIA Network+ an", () => {
      render(<Sidebar {...makeSidebarProps(allSubjects)} />);
      expect(screen.getByText("CompTIA Network+")).toBeTruthy();
    });

    it("zeigt CCNA weiterhin an (kein Regression bei Legacy-Subjects)", () => {
      render(<Sidebar {...makeSidebarProps(allSubjects)} />);
      expect(screen.getByText("CCNA 200-301")).toBeTruthy();
    });

    it("alle drei Catalog-Einträge (CCNA, AZ-900, NetworkPlus) sind gleichzeitig sichtbar", () => {
      render(<Sidebar {...makeSidebarProps(allSubjects)} />);
      expect(screen.getByText("CCNA 200-301")).toBeTruthy();
      expect(screen.getByText("AZ-900 Fundamentals")).toBeTruthy();
      expect(screen.getByText("CompTIA Network+")).toBeTruthy();
    });
  });
});
