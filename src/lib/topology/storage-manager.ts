import { NetworkTopology, networkTopologySchema } from "@/types/topology";

// ============================================================================
// CCNA 200-301 Storage & Export Manager (2d-3)
// ============================================================================

export const TOPOLOGY_LIBRARY_KEY = "canvas-topology-v2-library";
export const ACTIVE_TOPOLOGY_ID_KEY = "canvas-topology-v2-active-id";
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // 2 Megabyte

export interface StoredTopologySummary {
  id: string;
  name: string;
  updatedAt: string;
  deviceCount: number;
  linkCount: number;
  category?: string;
}

export interface StorageResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  quotaExceeded?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. localStorage Multi-Topologie Verwaltung
// ────────────────────────────────────────────────────────────────────────────

export function getNamedTopologies(
  storage: Storage = typeof window !== "undefined" ? window.localStorage : ({} as Storage)
): StoredTopologySummary[] {
  try {
    const raw = storage.getItem(TOPOLOGY_LIBRARY_KEY);
    if (!raw) return [];
    const library = JSON.parse(raw) as Record<string, NetworkTopology>;

    return Object.values(library).map((t) => ({
      id: t.id,
      name: t.name,
      updatedAt: t.metadata?.updatedAt || new Date().toISOString(),
      deviceCount: t.devices.length,
      linkCount: t.links.length,
      category: t.category,
    }));
  } catch (err) {
    console.error("Fehler beim Lesen der Topologie-Bibliothek:", err);
    return [];
  }
}

export function loadNamedTopology(
  id: string,
  storage: Storage = typeof window !== "undefined" ? window.localStorage : ({} as Storage)
): NetworkTopology | null {
  try {
    const raw = storage.getItem(TOPOLOGY_LIBRARY_KEY);
    if (!raw) return null;
    const library = JSON.parse(raw) as Record<string, NetworkTopology>;
    const found = library[id];
    if (!found) return null;

    const parsed = networkTopologySchema.safeParse(found);
    return parsed.success ? parsed.data : null;
  } catch (err) {
    console.error("Fehler beim Laden der Topologie:", err);
    return null;
  }
}

export function saveNamedTopology(
  topology: NetworkTopology,
  storage: Storage = typeof window !== "undefined" ? window.localStorage : ({} as Storage)
): StorageResult {
  try {
    // Schema vor dem Speichern validieren
    const parsed = networkTopologySchema.safeParse(topology);
    if (!parsed.success) {
      return {
        success: false,
        error: `Ungültiges Topologie-Format: ${parsed.error.errors[0]?.message}`,
      };
    }

    const validTopo = parsed.data;
    const updatedTopo: NetworkTopology = {
      ...validTopo,
      metadata: {
        ...validTopo.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    let library: Record<string, NetworkTopology> = {};
    const raw = storage.getItem(TOPOLOGY_LIBRARY_KEY);
    if (raw) {
      try {
        library = JSON.parse(raw);
      } catch {
        library = {};
      }
    }

    library[updatedTopo.id] = updatedTopo;
    storage.setItem(TOPOLOGY_LIBRARY_KEY, JSON.stringify(library));
    storage.setItem(ACTIVE_TOPOLOGY_ID_KEY, updatedTopo.id);

    return { success: true };
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.code === 22 ||
        err.code === 1014 ||
        err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED");

    if (isQuota) {
      return {
        success: false,
        quotaExceeded: true,
        error:
          "Speicherlimit im Browser (localStorage Quota) erreicht. Bitte löschen Sie nicht mehr benötigte Topologien oder exportieren Sie diese als JSON-Datei.",
      };
    }

    return {
      success: false,
      error: `Speichern fehlgeschlagen: ${(err as Error).message}`,
    };
  }
}

export function deleteNamedTopology(
  id: string,
  storage: Storage = typeof window !== "undefined" ? window.localStorage : ({} as Storage)
): boolean {
  try {
    const raw = storage.getItem(TOPOLOGY_LIBRARY_KEY);
    if (!raw) return false;
    const library = JSON.parse(raw) as Record<string, NetworkTopology>;
    if (!library[id]) return false;

    delete library[id];
    storage.setItem(TOPOLOGY_LIBRARY_KEY, JSON.stringify(library));
    return true;
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 2. JSON-Import mit Zod-Validierung & 2MB Größenlimit
// ────────────────────────────────────────────────────────────────────────────

export function importTopologyFromJson(jsonString: string): StorageResult<NetworkTopology> {
  // 1. Größenbeschränkung < 2MB
  const byteSize = new Blob([jsonString]).size;
  if (byteSize > MAX_IMPORT_BYTES) {
    return {
      success: false,
      error: `Datei überschreitet das maximal zulässige Limit von 2 MB (${(byteSize / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  // 2. JSON Syntax parsen
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (err) {
    return {
      success: false,
      error: `Ungültiges JSON-Dateiformat: ${(err as Error).message}`,
    };
  }

  // 3. Schema-Validierung mit Zod
  const zodResult = networkTopologySchema.safeParse(parsedJson);
  if (!zodResult.success) {
    const firstIssue = zodResult.error.errors[0];
    const pathStr = firstIssue.path.join(".");
    return {
      success: false,
      error: `Topologie entspricht nicht dem CCNA Schema 2.0 (Feld '${pathStr}': ${firstIssue.message})`,
    };
  }

  // 4. Sanitize String-Inhalte gegen Skript-Injektion & XSS
  const sanitizedData = sanitizeTopology(zodResult.data);

  return {
    success: true,
    data: sanitizedData,
  };
}

/**
 * Bewahrt Nutzertexte unverändert im Modell/Speicher auf (keine Datenmutation).
 * Bereinigung und Escaping von Script- und Event-Handlern erfolgen ausschließlich
 * auf SVG/Markup- und Rendering-Ebene (z. B. generateCleanSvgString).
 */
export function sanitizeTopology(topology: NetworkTopology): NetworkTopology {
  return topology;
}

// ────────────────────────────────────────────────────────────────────────────
// 3. SVG-Export mit XML-Escaping & Skript-Bereinigung
// ────────────────────────────────────────────────────────────────────────────

export function generateCleanSvgString(
  svgElement: SVGSVGElement,
  theme: "dark" | "light" = "dark"
): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // 1. Entferne interaktive UI-Klassen und Anfasser
  const interactiveHandles = clone.querySelectorAll(".annotation-handles, .pointer-events-auto");
  interactiveHandles.forEach((el) => el.remove());

  // 2. Sicherheits-Filter: Entferne potenziell schadhafte Skript-Tags (<script>, <foreignObject>)
  clone.querySelectorAll("script, foreignObject").forEach((el) => el.remove());

  // 3. Entferne alle Inline-Event-Handler (z. B. onclick, onload, onerror) und javascript: URIs
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    for (let i = el.attributes.length - 1; i >= 0; i--) {
      const attr = el.attributes[i];
      if (
        attr.name.toLowerCase().startsWith("on") ||
        attr.value.toLowerCase().includes("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });

  // Hintergrund-Rechteck einfügen falls nicht vorhanden
  const bgColor = theme === "dark" ? "#0F172A" : "#FFFFFF";
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("width", "100%");
  bgRect.setAttribute("height", "100%");
  bgRect.setAttribute("fill", bgColor);
  clone.insertBefore(bgRect, clone.firstChild);

  // XMLSerializer für sauberes XML-Escaping
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  // XML-Deklaration hinzufügen falls noch nicht vorhanden
  if (!svgString.startsWith("<?xml")) {
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  }

  return svgString;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTopologyAsSvg(
  svgElement: SVGSVGElement,
  filename = "ccna-topology.svg",
  theme: "dark" | "light" = "dark"
): void {
  const svgContent = generateCleanSvgString(svgElement, theme);
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename.endsWith(".svg") ? filename : `${filename}.svg`);
}

// ────────────────────────────────────────────────────────────────────────────
// 4. PNG-Export mit 1x/2x Retina, Theme & Safari <4096px Schutz
// ────────────────────────────────────────────────────────────────────────────

export async function exportTopologyAsPng(
  svgElement: SVGSVGElement,
  options: {
    scale?: 1 | 2;
    theme?: "dark" | "light";
    includeLegend?: boolean;
    filename?: string;
  } = {}
): Promise<void> {
  const {
    scale = 2,
    theme = "dark",
    includeLegend = true,
    filename = "ccna-topology.png",
  } = options;

  const svgString = generateCleanSvgString(svgElement, theme);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      URL.revokeObjectURL(url);

      const bbox = svgElement.getBoundingClientRect();
      const rawWidth = Math.max(bbox.width, 800);
      const rawHeight = Math.max(bbox.height, 600);

      let targetWidth = rawWidth * scale;
      let targetHeight = rawHeight * scale;

      // Safari Canvas Limit Schutz: Max 4096px Dimension
      const MAX_CANVAS_DIM = 4096;
      if (targetWidth > MAX_CANVAS_DIM || targetHeight > MAX_CANVAS_DIM) {
        const factor = Math.min(MAX_CANVAS_DIM / targetWidth, MAX_CANVAS_DIM / targetHeight);
        targetWidth = Math.floor(targetWidth * factor);
        targetHeight = Math.floor(targetHeight * factor);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("2D Canvas Context konnte nicht initialisiert werden."));
        return;
      }

      // Hintergrund
      ctx.fillStyle = theme === "dark" ? "#0F172A" : "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // SVG zeichnen
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Optionale Legende unten rechts zeichnen
      if (includeLegend) {
        drawPngLegend(ctx, targetWidth, targetHeight, theme, scale);
      }

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          reject(new Error("PNG Blob Erzeugung fehlgeschlagen."));
          return;
        }
        downloadBlob(pngBlob, filename.endsWith(".png") ? filename : `${filename}.png`);
        resolve();
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG Rendering auf Canvas fehlgeschlagen."));
    };

    img.src = url;
  });
}

function drawPngLegend(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  theme: "dark" | "light",
  scale: number
): void {
  const pad = 12 * scale;
  const legW = 200 * scale;
  const legH = 75 * scale;
  const legX = canvasWidth - legW - pad;
  const legY = canvasHeight - legH - pad;

  ctx.save();
  ctx.fillStyle = theme === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.9)";
  ctx.strokeStyle = theme === "dark" ? "#334155" : "#CBD5E1";
  ctx.lineWidth = 1 * scale;

  ctx.beginPath();
  ctx.roundRect(legX, legY, legW, legH, 6 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.font = `bold ${9 * scale}px monospace`;
  ctx.fillStyle = theme === "dark" ? "#38BDF8" : "#0284C7";
  ctx.fillText("CCNA 200-301 TOPOLOGIE", legX + 10 * scale, legY + 16 * scale);

  ctx.font = `${8 * scale}px sans-serif`;
  ctx.fillStyle = theme === "dark" ? "#E2E8F0" : "#1E293B";

  // Legende Items
  ctx.fillText("──  Ethernet / Trunk Link", legX + 10 * scale, legY + 34 * scale);
  ctx.fillText("┅┅  STP Blocking / Down (X)", legX + 10 * scale, legY + 48 * scale);
  ctx.fillText("⚡  Serial WAN / Point-to-Point", legX + 10 * scale, legY + 62 * scale);

  ctx.restore();
}

