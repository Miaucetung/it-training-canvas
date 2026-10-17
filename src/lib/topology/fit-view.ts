export interface FitBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface FitTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

/**
 * Zoom und Verschiebung, damit ein Rechteck (Weltkoordinaten) mittig in einen Viewport passt.
 * `padding` ist der Rand je Seite in Weltkoordinaten, `fill` der Anteil des Viewports, den der Inhalt einnimmt.
 */
export function computeFitTransform(
  bounds: FitBounds,
  viewport: { width: number; height: number },
  options: { minScale: number; maxScale?: number; padding?: number; fill?: number },
): FitTransform {
  const { minScale, maxScale = 1.5, padding = 60, fill = 0.9 } = options;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;
  const scale = Math.min(maxScale, Math.max(minScale, Math.min(viewport.width / width, viewport.height / height) * fill));
  return {
    scale,
    translateX: (viewport.width - width * scale) / 2 - bounds.minX * scale + padding * scale,
    translateY: (viewport.height - height * scale) / 2 - bounds.minY * scale + padding * scale,
  };
}
