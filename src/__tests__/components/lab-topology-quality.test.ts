import { describe, it, expect } from "vitest";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import {
  boxesOverlap,
  buildBoxes,
  offGridProblems,
  segmentsCross,
  zoneBadgeProblems,
  type Point,
  type Segment,
} from "@/components/labs/topology-geometry";
import type { LabTopologyDevice } from "@/components/labs/types";

describe("Cisco-Press Lab-Topologie Qualitätsprüfung", () => {
  const targetLabs = Object.keys(CURATED_TOPOLOGIES);

  targetLabs.forEach((labId) => {
    describe(`Lab '${labId}'`, () => {
      const topology = CURATED_TOPOLOGIES[labId];

      it("ist in den kuratierten Topologien vollständig definiert", () => {
        expect(topology).toBeDefined();
        expect(topology.devices.length).toBeGreaterThan(0);
        expect(topology.links.length).toBeGreaterThan(0);
        expect(topology.addressingTable.length).toBeGreaterThan(0);
      });

      it("hat 0 überlappende Bounding-Boxes (Icons, Gerätenamen, Port-Labels & Subnetze)", () => {
        const bboxes = buildBoxes(topology);

        const collisions: Array<{ b1: string; b2: string }> = [];
        for (let i = 0; i < bboxes.length; i++) {
          for (let j = i + 1; j < bboxes.length; j++) {
            const b1 = bboxes[i];
            const b2 = bboxes[j];

            // Ein Gerät selbst darf seinen eigenen Icon und Textlabel haben
            if (
              b1.id.startsWith(b2.id.split("-")[0]) &&
              b1.kind.startsWith("device") &&
              b2.kind.startsWith("device")
            ) {
              continue;
            }

            if (boxesOverlap(b1, b2)) {
              collisions.push({ b1: b1.id, b2: b2.id });
            }
          }
        }

        expect(collisions).toEqual([]);
      });

      it("Zonen-Beschriftungen liegen innerhalb der Zone und überdecken keine Geräte, Labels oder Linien", () => {
        expect(zoneBadgeProblems(topology)).toEqual([]);
      });

      it("liegt auf dem 10-px-Raster (Geräte, Zwischenpunkte, Zonen)", () => {
        expect(offGridProblems(topology)).toEqual([]);
      });

      it("hat exakt 0 sich kreuzende Liniensegmente (planare Verbindungen)", () => {
        const devMap = new Map<string, LabTopologyDevice>();
        topology.devices.forEach((d) => devMap.set(d.id, d));

        const segments: Segment[] = [];
        for (const link of topology.links) {
          const fromDev = devMap.get(link.from)!;
          const toDev = devMap.get(link.to)!;
          const pts: Point[] = [
            { x: fromDev.x, y: fromDev.y },
            ...(link.bendPoints || []),
            { x: toDev.x, y: toDev.y },
          ];

          for (let i = 0; i < pts.length - 1; i++) {
            segments.push({
              linkId: link.id,
              p1: pts[i],
              p2: pts[i + 1],
            });
          }
        }

        const crossings: Array<{ linkA: string; linkB: string }> = [];
        for (let i = 0; i < segments.length; i++) {
          for (let j = i + 1; j < segments.length; j++) {
            const s1 = segments[i];
            const s2 = segments[j];
            if (s1.linkId === s2.linkId) continue;
            if (segmentsCross(s1, s2)) {
              crossings.push({ linkA: s1.linkId, linkB: s2.linkId });
            }
          }
        }

        expect(crossings.length).toBe(0);
      });

      it("ordnet Geräte gleicher Ebene auf identischer Achse / symmetrisch an", () => {
        if (labId === "ospf") {
          // OSPF-Backbone Dreiecks-Topologie:
          // R1 & R2 auf identischer Höhe (y=80)
          const r1 = topology.devices.find((d) => d.id === "r1")!;
          const r2 = topology.devices.find((d) => d.id === "r2")!;
          expect(r1.y).toBe(r2.y);

          // SW1 & SW2 auf identischer Höhe (y=270)
          const sw1 = topology.devices.find((d) => d.id === "sw1")!;
          const sw2 = topology.devices.find((d) => d.id === "sw2")!;
          expect(sw1.y).toBe(sw2.y);

          // PC0 & PC1 auf identischer Höhe (y=440)
          const pc0 = topology.devices.find((d) => d.id === "pc0")!;
          const pc1 = topology.devices.find((d) => d.id === "pc1")!;
          expect(pc0.y).toBe(pc1.y);

          // Zentraler Zweig (R3, SW3, PC2) exakt auf der Mittelachse
          const r3 = topology.devices.find((d) => d.id === "r3")!;
          const sw3 = topology.devices.find((d) => d.id === "sw3")!;
          const pc2 = topology.devices.find((d) => d.id === "pc2")!;
          const midX = (r1.x + r2.x) / 2;
          expect(r3.x).toBe(midX);
          expect(sw3.x).toBe(midX);
          expect(pc2.x).toBe(midX);
        } else {
          // Hierarchische Baumtopologien: Geräte desselben Tiers auf gleicher Y-Koordinate
          const tierGroups = new Map<string, number[]>();
          topology.devices.forEach((d) => {
            if (!tierGroups.has(d.tier)) {
              tierGroups.set(d.tier, []);
            }
            tierGroups.get(d.tier)!.push(d.y);
          });

          tierGroups.forEach((yCoords, tier) => {
            const firstY = yCoords[0];
            const allSame = yCoords.every((y) => Math.abs(y - firstY) < 1);
            expect(allSame, `Geräte im Tier '${tier}' müssen auf derselben Höhe liegen`).toBe(true);
          });
        }
      });
    });
  });
});
