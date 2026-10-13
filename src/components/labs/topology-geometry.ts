import type { LabTopologyData, LabTopologyDevice } from "./types";
import {
  deviceModelWidth,
  deviceNameWidth,
  getPortLabelPos,
  ipLabelWidth,
  portLabelWidth,
  subnetLabelWidth,
  zoneBadgeWidth,
  assumedCaptionWidth,
} from "./topology-layout";

// Geometrische Analyse der Lab-Topologien (Überlappungen, Kreuzungen, Zonen, Raster).
// Wird von den Tests und vom Audit-Skript verwendet.

export interface BBox {
  id: string;
  kind: "device-icon" | "device-label" | "port-label" | "subnet-label";
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  linkId: string;
  p1: Point;
  p2: Point;
}

export function segmentHitsBox(a: Point, b: Point, box: BBox): boolean {
  // Liang-Barsky Segment/Rechteck
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };
  return (
    clip(-dx, a.x - box.minX) &&
    clip(dx, box.maxX - a.x) &&
    clip(-dy, a.y - box.minY) &&
    clip(dy, box.maxY - a.y)
  );
}

export function boxesOverlap(b1: BBox, b2: BBox, padding = 0): boolean {
  return !(
    b1.maxX + padding <= b2.minX ||
    b2.maxX + padding <= b1.minX ||
    b1.maxY + padding <= b2.minY ||
    b2.maxY + padding <= b1.minY
  );
}

export function crossProduct(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function segmentsCross(s1: Segment, s2: Segment): boolean {
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

export function buildBoxes(topology: LabTopologyData): BBox[] {
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
      const labelW = Math.max(nameWidth, modelWidth, d.assumed ? assumedCaptionWidth() : 0);
      const labelH = (d.model ? 33 : 18) + (d.assumed ? 12 : 0);
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
  for (const note of topology.notes ?? []) {
    const w = subnetLabelWidth(note.text);
    bboxes.push({ id: `${note.id}-note`, kind: "subnet-label", minX: note.x - w / 2, minY: note.y - 9, maxX: note.x + w / 2, maxY: note.y + 9 });
  }
  return bboxes;
}

export type ZoneBadgeCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

function zoneBadgeCandidate(z: LabTopologyData["zones"] extends (infer Z)[] | undefined ? Z : never, corner: ZoneBadgeCorner) {
  const w = zoneBadgeWidth(z.label);
  const minX = corner.endsWith("left") ? z.x + 10 : z.x + z.width - 10 - w;
  const minY = corner.startsWith("top") ? z.y + 5 : z.y + z.height - 23;
  return { minX, maxX: minX + w, minY, maxY: minY + 18 };
}

function zoneBadgeCollisions(
  topology: LabTopologyData,
  zoneId: string,
  box: { minX: number; maxX: number; minY: number; maxY: number },
  boxes: BBox[],
): string[] {
  const out: string[] = [];
  const probe: BBox = { id: `${zoneId}-badge`, kind: "subnet-label", ...box };
  for (const bx of boxes) if (boxesOverlap(probe, bx)) out.push(`überdeckt ${bx.id}`);
  const devMap = new Map(topology.devices.map((d) => [d.id, d]));
  for (const link of topology.links) {
    const pts = [devMap.get(link.from)!, ...(link.bendPoints ?? []), devMap.get(link.to)!];
    for (let i = 0; i + 1 < pts.length; i++) {
      if (segmentHitsBox(pts[i], pts[i + 1], probe)) out.push(`Linie ${link.id} läuft durch die Beschriftung`);
    }
  }
  return out;
}

/** Wählt die Ecke der Zone, in der die Beschriftung weder Linien noch Labels noch Geräte berührt. */
export function placeZoneBadge(topology: LabTopologyData, zoneId: string): { corner: ZoneBadgeCorner; box: { minX: number; maxX: number; minY: number; maxY: number }; problems: string[] } {
  const zone = topology.zones!.find((z) => z.id === zoneId)!;
  const boxes = buildBoxes(topology);
  let best: { corner: ZoneBadgeCorner; box: ReturnType<typeof zoneBadgeCandidate>; problems: string[] } | null = null;
  for (const corner of ["top-left", "top-right", "bottom-left", "bottom-right"] as ZoneBadgeCorner[]) {
    const box = zoneBadgeCandidate(zone, corner);
    const problems = zoneBadgeCollisions(topology, zone.id, box, boxes);
    if (box.maxX > zone.x + zone.width || box.minX < zone.x) problems.unshift("Beschriftung breiter als die Zone");
    if (!best || problems.length < best.problems.length) best = { corner, box, problems };
    if (problems.length === 0) break;
  }
  return best!;
}

export function zoneBadgeProblems(topology: LabTopologyData): string[] {
  return (topology.zones ?? []).flatMap((z) => placeZoneBadge(topology, z.id).problems.map((p) => `${z.id}: ${p}`));
}

export function offGridProblems(topology: LabTopologyData, grid = 10): string[] {
  const off: string[] = [];
  const chk = (what: string, v: number) => {
    if (v % grid !== 0) off.push(`${what}=${v}`);
  };
  for (const d of topology.devices) {
    chk(`${d.id}.x`, d.x);
    chk(`${d.id}.y`, d.y);
  }
  for (const l of topology.links) {
    (l.bendPoints ?? []).forEach((p, i) => {
      chk(`${l.id}.bend${i}.x`, p.x);
      chk(`${l.id}.bend${i}.y`, p.y);
    });
  }
  for (const z of topology.zones ?? []) {
    chk(`${z.id}.x`, z.x);
    chk(`${z.id}.y`, z.y);
  }
  return off;
}
