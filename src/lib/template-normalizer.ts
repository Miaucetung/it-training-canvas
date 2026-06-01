import type { CanvasConnection, DrawingObject } from "@/lib/types";

/**
 * Auto-spread converging connection labels.
 *
 * When multiple connections share the same node, their labels would otherwise
 * all stack at midpoint. We distribute them along the curve (labelOffsetT)
 * so they fan out and stay readable.
 *
 * Pure function — does not mutate inputs.
 */
export function spreadConnectionLabels(
  connections: CanvasConnection[],
): CanvasConnection[] {
  // Count connections per node
  const perNode = new Map<string, number>();
  connections.forEach((c) => {
    perNode.set(c.sourceShapeId, (perNode.get(c.sourceShapeId) || 0) + 1);
    perNode.set(c.targetShapeId, (perNode.get(c.targetShapeId) || 0) + 1);
  });

  // Track position-within-node so we can spread T values
  const seenSource = new Map<string, number>();
  const seenTarget = new Map<string, number>();

  return connections.map((c) => {
    // Respect explicit offset
    if (c.labelOffsetT !== undefined) return c;

    const srcCount = perNode.get(c.sourceShapeId) || 1;
    const tgtCount = perNode.get(c.targetShapeId) || 1;

    // Choose the side with more convergence to spread along
    let t = 0.5;
    if (srcCount > tgtCount && srcCount > 1) {
      const idx = seenSource.get(c.sourceShapeId) || 0;
      seenSource.set(c.sourceShapeId, idx + 1);
      // Spread between 0.25 and 0.55 (closer to source so label sits near origin)
      t = 0.25 + (idx / Math.max(1, srcCount - 1)) * 0.3;
    } else if (tgtCount > 1) {
      const idx = seenTarget.get(c.targetShapeId) || 0;
      seenTarget.set(c.targetShapeId, idx + 1);
      // Spread between 0.45 and 0.75 (closer to target)
      t = 0.45 + (idx / Math.max(1, tgtCount - 1)) * 0.3;
    }

    return { ...c, labelOffsetT: t };
  });
}

/**
 * Enforce minimum spacing between shapes to prevent visual overlap.
 *
 * For each pair of shapes whose bounding boxes overlap (or are closer than
 * MIN_GAP), push them apart along the shorter axis. Iterative, capped at
 * MAX_ITERATIONS to avoid pathological cases.
 *
 * Returns new objects with adjusted positions (text/labels untouched).
 */
const MIN_GAP = 24;
const MAX_ITERATIONS = 8;

export function enforceMinimumSpacing(
  objects: DrawingObject[],
): DrawingObject[] {
  // Operate on a deep-enough copy: we only mutate startPoint/endPoint
  const out = objects.map((o) => ({
    ...o,
    startPoint: o.startPoint ? { ...o.startPoint } : undefined,
    endPoint: o.endPoint ? { ...o.endPoint } : undefined,
  }));

  // Index of objects we will shift (shapes only — not text/rect backgrounds)
  const shapeIdxs = out
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => o.type === "shape" && o.startPoint && o.endPoint)
    .map(({ i }) => i);

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let moved = false;
    for (let a = 0; a < shapeIdxs.length; a++) {
      for (let b = a + 1; b < shapeIdxs.length; b++) {
        const A = out[shapeIdxs[a]];
        const B = out[shapeIdxs[b]];
        if (!A.startPoint || !A.endPoint || !B.startPoint || !B.endPoint)
          continue;

        const ax1 = Math.min(A.startPoint.x, A.endPoint.x);
        const ax2 = Math.max(A.startPoint.x, A.endPoint.x);
        const ay1 = Math.min(A.startPoint.y, A.endPoint.y);
        const ay2 = Math.max(A.startPoint.y, A.endPoint.y);
        const bx1 = Math.min(B.startPoint.x, B.endPoint.x);
        const bx2 = Math.max(B.startPoint.x, B.endPoint.x);
        const by1 = Math.min(B.startPoint.y, B.endPoint.y);
        const by2 = Math.max(B.startPoint.y, B.endPoint.y);

        // Expanded overlap test (include MIN_GAP buffer)
        const overlapX = Math.min(ax2, bx2) - Math.max(ax1, bx1) + MIN_GAP;
        const overlapY = Math.min(ay2, by2) - Math.max(ay1, by1) + MIN_GAP;
        if (overlapX <= 0 || overlapY <= 0) continue;

        // Push apart along axis with smaller overlap (least visual disruption)
        if (overlapX < overlapY) {
          const half = overlapX / 2;
          const aCx = (ax1 + ax2) / 2;
          const bCx = (bx1 + bx2) / 2;
          const sign = aCx <= bCx ? 1 : -1;
          shift(A, -sign * half, 0);
          shift(B, sign * half, 0);
        } else {
          const half = overlapY / 2;
          const aCy = (ay1 + ay2) / 2;
          const bCy = (by1 + by2) / 2;
          const sign = aCy <= bCy ? 1 : -1;
          shift(A, 0, -sign * half);
          shift(B, 0, sign * half);
        }
        moved = true;
      }
    }
    if (!moved) break;
  }

  return out;
}

function shift(o: DrawingObject, dx: number, dy: number) {
  if (o.startPoint) {
    o.startPoint.x += dx;
    o.startPoint.y += dy;
  }
  if (o.endPoint) {
    o.endPoint.x += dx;
    o.endPoint.y += dy;
  }
}

/**
 * Combined template normalizer: spreads labels and enforces shape spacing.
 * Use this when applying a template so converging labels and cramped layouts
 * are automatically tidied without touching the source templates.
 */
export function normalizeTemplate(
  objects: DrawingObject[],
  connections: CanvasConnection[],
): { objects: DrawingObject[]; connections: CanvasConnection[] } {
  return {
    objects: enforceMinimumSpacing(objects),
    connections: spreadConnectionLabels(connections),
  };
}
