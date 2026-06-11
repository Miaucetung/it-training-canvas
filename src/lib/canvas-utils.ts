import { DrawingObject, Point, ShapeDefinition } from "./types";

// SVG Image Cache for shapes
const svgImageCache = new Map<string, HTMLImageElement>();
let onImageLoadCallback: (() => void) | null = null;
let preloadComplete = false;

// Set callback for when images load (for redrawing canvas)
export function setImageLoadCallback(callback: () => void): void {
  onImageLoadCallback = callback;
}

// Pre-load all shapes for instant rendering
export function preloadShapes(shapes: ShapeDefinition[]): Promise<void> {
  if (preloadComplete) return Promise.resolve();

  const promises = shapes.map((shape) => {
    return new Promise<void>((resolve) => {
      const cacheKey = `${shape.svgPath.substring(0, 50)}-${shape.color}-${shape.width}-${shape.height}`;

      if (svgImageCache.has(cacheKey)) {
        resolve();
        return;
      }

      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${shape.width} ${shape.height}" width="${shape.width}" height="${shape.height}">
          ${shape.svgPath.replace(/currentColor/g, shape.color)}
        </svg>
      `;

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        resolve(); // Don't fail on error
      };
      img.src = url;
      svgImageCache.set(cacheKey, img);
    });
  });

  return Promise.all(promises).then(() => {
    preloadComplete = true;
  });
}

// Pre-create SVG image from path
function getSvgImage(
  svgPath: string,
  color: string,
  width: number,
  height: number,
): HTMLImageElement | null {
  const cacheKey = `${svgPath.substring(0, 50)}-${color}-${width}-${height}`;

  if (svgImageCache.has(cacheKey)) {
    const img = svgImageCache.get(cacheKey)!;
    if (img.complete) return img;
    return null; // Still loading
  }

  // Create SVG with the path and color - preserve original viewBox
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      ${svgPath.replace(/currentColor/g, color)}
    </svg>
  `;

  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.src = url;
  svgImageCache.set(cacheKey, img);

  img.onload = () => {
    URL.revokeObjectURL(url);
    // Trigger redraw when image loads
    if (onImageLoadCallback) {
      onImageLoadCallback();
    }
  };

  return null; // Image is loading
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isPointInBounds(
  point: Point,
  object: DrawingObject,
  threshold = 10,
): boolean {
  if (object.type === "text" && object.startPoint && object.text) {
    const fontSize = object.fontSize || 20;
    const width = object.text.length * fontSize * 0.6;
    const height = fontSize * 1.2;

    return (
      point.x >= object.startPoint.x - threshold &&
      point.x <= object.startPoint.x + width + threshold &&
      point.y >= object.startPoint.y - fontSize &&
      point.y <= object.startPoint.y + height
    );
  }

  if (object.type === "pen" && object.points) {
    return object.points.some((p) => distance(point, p) < threshold);
  }

  if (object.startPoint && object.endPoint) {
    const minX = Math.min(object.startPoint.x, object.endPoint.x) - threshold;
    const maxX = Math.max(object.startPoint.x, object.endPoint.x) + threshold;
    const minY = Math.min(object.startPoint.y, object.endPoint.y) - threshold;
    const maxY = Math.max(object.startPoint.y, object.endPoint.y) + threshold;

    return (
      point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    );
  }

  return false;
}

export function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: DrawingObject,
  isHovered = false,
): void {
  ctx.save();

  ctx.strokeStyle = obj.color;
  ctx.fillStyle = obj.color;
  ctx.lineWidth = obj.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Apply shadow if enabled
  if (obj.shadow) {
    ctx.shadowColor = obj.shadowColor || "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = obj.shadowBlur || 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
  } else if (obj.selected) {
    ctx.shadowColor = "rgba(99, 102, 241, 0.8)";
    ctx.shadowBlur = 15;
  } else if (isHovered) {
    ctx.shadowColor = "rgba(99, 102, 241, 0.5)";
    ctx.shadowBlur = 10;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  switch (obj.type) {
    case "pen":
    case "eraser":
      if (obj.points && obj.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i].x, obj.points[i].y);
        }
        ctx.stroke();
      }
      break;

    case "line":
      if (obj.startPoint && obj.endPoint) {
        ctx.beginPath();
        ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
        ctx.lineTo(obj.endPoint.x, obj.endPoint.y);
        ctx.stroke();
      }
      break;

    case "arrow":
      if (obj.startPoint && obj.endPoint) {
        const headLength = 15;
        const angle = Math.atan2(
          obj.endPoint.y - obj.startPoint.y,
          obj.endPoint.x - obj.startPoint.x,
        );

        ctx.beginPath();
        ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
        ctx.lineTo(obj.endPoint.x, obj.endPoint.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(obj.endPoint.x, obj.endPoint.y);
        ctx.lineTo(
          obj.endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
          obj.endPoint.y - headLength * Math.sin(angle - Math.PI / 6),
        );
        ctx.moveTo(obj.endPoint.x, obj.endPoint.y);
        ctx.lineTo(
          obj.endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
          obj.endPoint.y - headLength * Math.sin(angle + Math.PI / 6),
        );
        ctx.stroke();
      }
      break;

    case "rectangle":
      if (obj.startPoint && obj.endPoint) {
        const width = obj.endPoint.x - obj.startPoint.x;
        const height = obj.endPoint.y - obj.startPoint.y;
        // Semi-transparent fill so zone rects are visible on dark canvas
        ctx.fillStyle = obj.color + "20";
        ctx.fillRect(obj.startPoint.x, obj.startPoint.y, width, height);
        ctx.strokeRect(obj.startPoint.x, obj.startPoint.y, width, height);
      }
      break;

    case "circle":
      if (obj.startPoint && obj.endPoint) {
        const radius = distance(obj.startPoint, obj.endPoint);
        ctx.beginPath();
        ctx.arc(obj.startPoint.x, obj.startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      break;

    case "text":
      if (obj.startPoint && obj.text) {
        ctx.font = `${obj.fontSize || 20}px ${obj.fontFamily || "IBM Plex Mono"}`;
        ctx.fillText(obj.text, obj.startPoint.x, obj.startPoint.y);
      }
      break;

    case "shape":
      if (obj.startPoint && obj.svgPath && obj.shapeWidth && obj.shapeHeight) {
        const x = obj.startPoint.x;
        const y = obj.startPoint.y;
        const width = obj.shapeWidth;
        const height = obj.shapeHeight;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        // Apply rotation if set
        if (obj.rotation) {
          ctx.translate(centerX, centerY);
          ctx.rotate((obj.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
        }

        // Platform shadow — grounds the device on the canvas
        ctx.save();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          y + height + 4,
          width * 0.42,
          4.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "rgba(2, 6, 18, 0.35)";
        ctx.fill();
        ctx.restore();

        // Try to get cached SVG image
        const svgImg = getSvgImage(obj.svgPath, obj.color, width, height);

        if (svgImg && svgImg.complete) {
          // Draw the SVG image
          ctx.drawImage(svgImg, x, y, width, height);
        } else {
          // Fallback: draw a placeholder while loading
          ctx.fillStyle = obj.color + "20";
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 2;

          const radius = 8;
          ctx.beginPath();
          ctx.roundRect(x, y, width, height, radius);
          ctx.fill();
          ctx.stroke();

          // Draw loading indicator
          ctx.fillStyle = obj.color;
          ctx.font = "10px IBM Plex Mono";
          ctx.textAlign = "center";
          ctx.fillText("...", centerX, centerY + 4);
        }

        // Draw label below the shape
        if (obj.label) {
          const lx = centerX;
          const ly = y + height + 14;
          ctx.font = "bold 11px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          const tw = ctx.measureText(obj.label).width;

          // Badge background (semi-transparent dark pill)
          ctx.fillStyle = "rgba(10, 15, 30, 0.72)";
          ctx.shadowBlur = 0;
          ctx.beginPath();
          (ctx as unknown as { roundRect: (...a: unknown[]) => void })
            .roundRect(lx - tw / 2 - 5, ly - 11, tw + 10, 14, 3);
          ctx.fill();

          // Label text in shape color
          ctx.fillStyle = obj.color;
          ctx.fillText(obj.label, lx, ly);
        }

        // Draw status indicator (top-right corner)
        if (obj.status) {
          drawStatusIndicator(ctx, x + width - 6, y + 6, obj.status);
        }

        // HUD-style selection/hover frame
        if (obj.selected) {
          drawSelectionHud(ctx, x, y, width, height, true);
        } else if (isHovered) {
          drawSelectionHud(ctx, x, y, width, height, false);
        }

        ctx.textAlign = "left";
      }
      break;
  }

  ctx.restore();
}

// HUD frame: dashed rounded outline + corner brackets (Packet-Tracer-/Sci-Fi-Look)
function drawSelectionHud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  selected: boolean,
): void {
  const pad = 7;
  const bx = x - pad;
  const by = y - pad;
  const bw = w + pad * 2;
  const bh = h + pad * 2;
  const c = Math.min(11, bw / 4, bh / 4); // corner bracket length

  ctx.save();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Dashed outline
  ctx.strokeStyle = selected
    ? "rgba(129, 140, 248, 0.55)"
    : "rgba(129, 140, 248, 0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.stroke();
  ctx.setLineDash([]);

  // Corner brackets (only when selected)
  if (selected) {
    ctx.strokeStyle = "#818CF8";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    // top-left
    ctx.moveTo(bx, by + c);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + c, by);
    // top-right
    ctx.moveTo(bx + bw - c, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + c);
    // bottom-right
    ctx.moveTo(bx + bw, by + bh - c);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw - c, by + bh);
    // bottom-left
    ctx.moveTo(bx + c, by + bh);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx, by + bh - c);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw status indicator on canvas
function drawStatusIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  status: DrawingObject["status"],
): void {
  const colors: Record<NonNullable<DrawingObject["status"]>, string> = {
    running: "#22C55E",
    stopped: "#64748B",
    error: "#EF4444",
    pending: "#F59E0B",
    warning: "#F97316",
  };

  const color = colors[status || "stopped"];
  const radius = 5;

  // Draw glow for running/error
  if (status === "running" || status === "error") {
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = color + "40";
    ctx.fill();
  }

  // Draw main indicator
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Draw border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// Draw connection points for a shape
export function drawConnectionPoints(
  ctx: CanvasRenderingContext2D,
  obj: DrawingObject,
  isHovered = false,
): void {
  if (
    obj.type !== "shape" ||
    !obj.startPoint ||
    !obj.shapeWidth ||
    !obj.shapeHeight
  )
    return;
  if (!obj.selected && !isHovered) return;

  const x = obj.startPoint.x;
  const y = obj.startPoint.y;
  const width = obj.shapeWidth;
  const height = obj.shapeHeight;

  ctx.save();

  // Apply rotation if set
  if (obj.rotation) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Default connection points: top, right, bottom, left
  const points = [
    { x: x + width / 2, y: y, position: "top" },
    { x: x + width, y: y + height / 2, position: "right" },
    { x: x + width / 2, y: y + height, position: "bottom" },
    { x: x, y: y + height / 2, position: "left" },
  ];

  ctx.fillStyle = "#6366f1";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

// Get the nearest connection point to a position
export function getNearestConnectionPoint(
  obj: DrawingObject,
  pos: Point,
  threshold = 20,
): { point: Point; position: string } | null {
  if (
    obj.type !== "shape" ||
    !obj.startPoint ||
    !obj.shapeWidth ||
    !obj.shapeHeight
  )
    return null;

  const x = obj.startPoint.x;
  const y = obj.startPoint.y;
  const width = obj.shapeWidth;
  const height = obj.shapeHeight;

  const points = [
    { x: x + width / 2, y: y, position: "top" },
    { x: x + width, y: y + height / 2, position: "right" },
    { x: x + width / 2, y: y + height, position: "bottom" },
    { x: x, y: y + height / 2, position: "left" },
  ];

  let nearest: { point: Point; position: string; dist: number } | null = null;

  for (const p of points) {
    const dist = distance(pos, { x: p.x, y: p.y });
    if (dist < threshold && (!nearest || dist < nearest.dist)) {
      nearest = { point: { x: p.x, y: p.y }, position: p.position, dist };
    }
  }

  return nearest ? { point: nearest.point, position: nearest.position } : null;
}

// Get bounds of shape considering rotation
export function getShapeBounds(
  obj: DrawingObject,
): { x: number; y: number; width: number; height: number } | null {
  if (!obj.startPoint) return null;

  if (obj.type === "shape" && obj.shapeWidth && obj.shapeHeight) {
    return {
      x: obj.startPoint.x,
      y: obj.startPoint.y,
      width: obj.shapeWidth,
      height: obj.shapeHeight,
    };
  }

  if (obj.endPoint) {
    return {
      x: Math.min(obj.startPoint.x, obj.endPoint.x),
      y: Math.min(obj.startPoint.y, obj.endPoint.y),
      width: Math.abs(obj.endPoint.x - obj.startPoint.x),
      height: Math.abs(obj.endPoint.y - obj.startPoint.y),
    };
  }

  return null;
}

export function exportToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function downloadJSON(data: any, filename: string): void {
  const json = exportToJSON(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Export canvas as PNG
export function exportCanvasAsPNG(
  canvas: HTMLCanvasElement,
  filename: string,
  backgroundColor?: string,
): void {
  // Create a temporary canvas with white/custom background
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  if (tempCtx) {
    // Fill background
    tempCtx.fillStyle = backgroundColor || "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas content
    tempCtx.drawImage(canvas, 0, 0);

    // Download
    const link = document.createElement("a");
    link.download = filename;
    link.href = tempCanvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Export canvas as SVG
export function exportCanvasAsSVG(
  objects: DrawingObject[],
  width: number,
  height: number,
  filename: string,
  backgroundColor?: string,
): void {
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${backgroundColor || "#ffffff"}"/>
  <g>`;

  objects.forEach((obj) => {
    if (obj.type === "pen" && obj.points && obj.points.length > 1) {
      const pathData = obj.points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
      svgContent += `\n    <path d="${pathData}" stroke="${obj.color}" stroke-width="${obj.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (obj.type === "line" && obj.startPoint && obj.endPoint) {
      svgContent += `\n    <line x1="${obj.startPoint.x}" y1="${obj.startPoint.y}" x2="${obj.endPoint.x}" y2="${obj.endPoint.y}" stroke="${obj.color}" stroke-width="${obj.width}"/>`;
    } else if (obj.type === "rectangle" && obj.startPoint && obj.endPoint) {
      const x = Math.min(obj.startPoint.x, obj.endPoint.x);
      const y = Math.min(obj.startPoint.y, obj.endPoint.y);
      const w = Math.abs(obj.endPoint.x - obj.startPoint.x);
      const h = Math.abs(obj.endPoint.y - obj.startPoint.y);
      svgContent += `\n    <rect x="${x}" y="${y}" width="${w}" height="${h}" stroke="${obj.color}" stroke-width="${obj.width}" fill="none"/>`;
    } else if (obj.type === "circle" && obj.startPoint && obj.endPoint) {
      const r = distance(obj.startPoint, obj.endPoint);
      svgContent += `\n    <circle cx="${obj.startPoint.x}" cy="${obj.startPoint.y}" r="${r}" stroke="${obj.color}" stroke-width="${obj.width}" fill="none"/>`;
    } else if (obj.type === "text" && obj.startPoint && obj.text) {
      svgContent += `\n    <text x="${obj.startPoint.x}" y="${obj.startPoint.y}" fill="${obj.color}" font-size="${obj.fontSize || 20}px" font-family="${obj.fontFamily || "IBM Plex Mono"}">${obj.text}</text>`;
    } else if (obj.type === "shape" && obj.startPoint && obj.svgPath) {
      svgContent += `\n    <g transform="translate(${obj.startPoint.x}, ${obj.startPoint.y})" style="color: ${obj.color}">${obj.svgPath}</g>`;
    }
  });

  svgContent += `\n  </g>\n</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
