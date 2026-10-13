import { describe, it, expect } from "vitest";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import type { LabTopologyDevice } from "@/components/labs/types";
import {
  deviceModelWidth,
  deviceNameWidth,
  getPortLabelPos,
  ipLabelWidth,
  portLabelWidth,
  subnetLabelWidth,
} from "@/components/labs/topology-layout";

interface BBox {
  id: string;
  kind: "device-icon" | "device-label" | "port-label" | "subnet-label";
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Point {
  x: number;
  y: number;
}

interface Segment {
  linkId: string;
  p1: Point;
  p2: Point;
}

function boxesOverlap(b1: BBox, b2: BBox, padding = 0): boolean {
  return !(
    b1.maxX + padding <= b2.minX ||
    b2.maxX + padding <= b1.minX ||
    b1.maxY + padding <= b2.minY ||
    b2.maxY + padding <= b1.minY
  );
}

function crossProduct(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function segmentsCross(s1: Segment, s2: Segment): boolean {
  const eps = 0.5;
  const isSamePoint = (pA: Point, pB: Point) =>
    Math.hypot(pA.x - pB.x, pA.y - pB.y) < eps;

  // Shared vertex / endpoints don't count as a crossing
  if (
    isSamePoint(s1.p1, s2.p1) ||
    isSamePoint(s1.p1, s2.p2) ||
    isSamePoint(s1.p2, s2.p1) ||
    isSamePoint(s1.p2, s2.p2)
  ) {
    return false;
  }

  const cp1 = crossProduct(s2.p1, s2.p2, s1.p1);
  const cp2 = crossProduct(s2.p1, s2.p2, s1.p2);
  const cp3 = crossProduct(s1.p1, s1.p2, s2.p1);
  const cp4 = crossProduct(s1.p1, s1.p2, s2.p2);

  return (
    ((cp1 > 0 && cp2 < 0) || (cp1 < 0 && cp2 > 0)) &&
    ((cp3 > 0 && cp4 < 0) || (cp3 < 0 && cp4 > 0))
  );
}

describe("Cisco-Press Lab-Topologie Qualitätsprüfung", () => {
  const targetLabs = ["basic-ip", "vlan-trunking", "roas", "ospf"];

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
        const devMap = new Map<string, LabTopologyDevice>();
        topology.devices.forEach((d) => devMap.set(d.id, d));

        const bboxes: BBox[] = [];

        // 1. Device Icons und Labels
        for (const d of topology.devices) {
          bboxes.push({
            id: `${d.id}-icon`,
            kind: "device-icon",
            minX: d.x - 24,
            minY: d.y - 24,
            maxX: d.x + 24,
            maxY: d.y + 24,
          });

          const nameWidth = deviceNameWidth(d.name);
          const modelWidth = deviceModelWidth(d.model);
          const labelW = Math.max(nameWidth, modelWidth);
          const labelH = d.model ? 33 : 18;
          bboxes.push({
            id: `${d.id}-label`,
            kind: "device-label",
            minX: d.x - labelW / 2,
            minY: d.y + 25,
            maxX: d.x + labelW / 2,
            maxY: d.y + 25 + labelH,
          });
        }

        // 2. Links, Port-Labels und Subnetz-Labels
        for (const link of topology.links) {
          const fromDev = devMap.get(link.from)!;
          const toDev = devMap.get(link.to)!;

          const firstTarget = link.bendPoints?.[0] ?? toDev;
          const lastSource = link.bendPoints?.[link.bendPoints.length - 1] ?? fromDev;

          const fromOffset = link.fromPortOffset ?? 48;
          const toOffset = link.toPortOffset ?? 48;
          const fromSide = link.fromPortSide ?? 12;
          const toSide = link.toPortSide ?? 12;

          const fromPos = getPortLabelPos(fromDev.x, fromDev.y, firstTarget.x, firstTarget.y, fromOffset, fromSide);
          const toPos = getPortLabelPos(toDev.x, toDev.y, lastSource.x, lastSource.y, toOffset, toSide);

          // Port from label (centered)
          const fromPortW = portLabelWidth(link.fromPort);
          const fromIpW = ipLabelWidth(link.fromIp);
          const fromMaxW = Math.max(fromPortW, fromIpW);
          bboxes.push({
            id: `${link.id}-fromPort`,
            kind: "port-label",
            minX: fromPos.x - fromMaxW / 2,
            minY: fromPos.y - 8,
            maxX: fromPos.x + fromMaxW / 2,
            maxY: fromPos.y + (link.fromIp ? 23 : 8),
          });

          // Port to label (centered)
          const toPortW = portLabelWidth(link.toPort);
          const toIpW = ipLabelWidth(link.toIp);
          const toMaxW = Math.max(toPortW, toIpW);
          bboxes.push({
            id: `${link.id}-toPort`,
            kind: "port-label",
            minX: toPos.x - toMaxW / 2,
            minY: toPos.y - 8,
            maxX: toPos.x + toMaxW / 2,
            maxY: toPos.y + (link.toIp ? 23 : 8),
          });

          if (link.subnetLabel) {
            const midX = link.subnetLabelPos?.x ?? (fromDev.x + toDev.x) / 2;
            const midY = link.subnetLabelPos?.y ?? (fromDev.y + toDev.y) / 2;
            const subW = subnetLabelWidth(link.subnetLabel);
            bboxes.push({
              id: `${link.id}-subnetLabel`,
              kind: "subnet-label",
              minX: midX - subW / 2,
              minY: midY - 9,
              maxX: midX + subW / 2,
              maxY: midY + 9,
            });
          }
        }

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
