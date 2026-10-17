import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import {
  AUSFALL,
  AUSGELASSEN,
  ORACLE,
  ausfallLabel,
  describeOutcome,
  runAusfallRow,
  runOracleRow,
  stateLabel,
  type AusfallOutcome,
  type OracleOutcome,
} from "../helpers/simulation-oracle";

const outcomes: OracleOutcome[] = [];

describe("Lab-Orakel: explizite Ping-Erwartungen", () => {
  it("Tabelle ist eindeutig und verweist nur auf vorhandene Labs", () => {
    const nrs = ORACLE.map((r) => r.nr);
    expect(new Set(nrs).size).toBe(nrs.length);
    for (const r of ORACLE) {
      expect(LABS.some((l) => l.id === r.lab), r.lab).toBe(true);
      expect(CURATED_TOPOLOGIES[r.lab], r.lab).toBeTruthy();
      if (r.offen) expect(r.offen.grund.length, `Zeile ${r.nr}`).toBeGreaterThan(10);
    }
  });

  for (const row of ORACLE) {
    const title = `${row.nr}. ${row.lab}: ${row.quelle} → ${row.ziel}${row.quelleIp ? ` source ${row.quelleIp}` : ""} (${stateLabel(row.zustand)}) erwartet ${row.erwartet}${row.grund ? ` [${row.grund}]` : ""}${row.offen ? " — erwartet offen" : ""}`;
    it(title, () => {
      const o = runOracleRow(row);
      outcomes.push(o);
      if (row.offen) {
        expect(
          o.erfuellt,
          `Zeile ${row.nr} ist inzwischen erfüllt (${describeOutcome(o)}). Markierung „erwartet offen“ entfernen.`,
        ).toBe(false);
      } else {
        expect(o.erfuellt, `Zeile ${row.nr}: ${describeOutcome(o)}`).toBe(true);
      }
    });
  }

  it("Export (nur mit ORAKEL_EXPORT)", () => {
    const target = process.env.ORAKEL_EXPORT;
    if (!target) return;
    const rows = outcomes
      .sort((a, b) => a.row.nr - b.row.nr)
      .map((o) => ({
        nr: o.row.nr,
        lab: o.row.lab,
        quelle: o.row.quelle,
        ziel: o.row.ziel,
        quelleIp: o.row.quelleIp,
        zustand: stateLabel(o.row.zustand),
        vorher: o.row.vorher,
        erwartet: o.row.erwartet,
        grund: o.row.grund,
        ist: describeOutcome(o),
        erfuellt: o.erfuellt,
        offen: o.row.offen,
        hinweis: o.row.hinweis,
        beleg: o.row.beleg,
      }));
    fs.writeFileSync(target, JSON.stringify(rows, null, 1));
  });
});

const ausfallOutcomes: AusfallOutcome[] = [];

describe("Lab-Orakel: Ausfall-Szenarien (Zustand und Konvergenz)", () => {
  it("Tabelle ist eindeutig und verweist nur auf vorhandene Labs", () => {
    const nrs = AUSFALL.map((r) => r.nr);
    expect(new Set(nrs).size).toBe(nrs.length);
    for (const r of AUSFALL) {
      expect(CURATED_TOPOLOGIES[r.lab], r.lab).toBeTruthy();
      if (r.offen) expect(r.offen.grund.length, `Zeile ${r.nr}`).toBeGreaterThan(10);
    }
  });

  it("ausdrücklich ausgelassene Lab-Schritte sind begründet und verweisen auf vorhandene Labs", () => {
    for (const a of AUSGELASSEN) {
      expect(LABS.some((l) => l.id === a.lab), a.lab).toBe(true);
      expect(a.grund.length).toBeGreaterThan(10);
    }
  });

  for (const row of AUSFALL) {
    it(`${ausfallLabel(row)}${row.offen ? " — erwartet offen" : ""}`, () => {
      const o = runAusfallRow(row);
      ausfallOutcomes.push(o);
      if (row.offen) {
        expect(o.erfuellt, `Zeile ${row.nr} ist inzwischen erfüllt (${o.ist}). Markierung „erwartet offen“ entfernen.`).toBe(false);
      } else {
        expect(o.erfuellt, `Zeile ${row.nr}: ist ${o.ist}`).toBe(true);
      }
    });
  }

  it("Export (nur mit ORAKEL_EXPORT)", () => {
    const target = process.env.ORAKEL_EXPORT;
    if (!target) return;
    const rows = ausfallOutcomes.map((o) => ({
      nr: o.row.nr,
      lab: o.row.lab,
      pruefung: ausfallLabel(o.row),
      erwartet: o.row.erwartet,
      ist: o.ist,
      erfuellt: o.erfuellt,
      offen: o.row.offen,
      beleg: o.row.beleg,
    }));
    fs.writeFileSync(target.replace(/\.json$/, "-ausfall.json"), JSON.stringify(rows, null, 1));
  });
});
