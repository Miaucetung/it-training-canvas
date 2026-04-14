import { DrawingObject, Point } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef } from "react";

interface MiniMapProps {
  objects: DrawingObject[];
  canvasWidth: number;
  canvasHeight: number;
  viewportOffset: Point;
  viewportScale: number;
  theme: "light" | "dark";
  onNavigate?: (point: Point) => void;
}

export function MiniMap({
  objects,
  canvasWidth,
  canvasHeight,
  viewportOffset,
  viewportScale,
  theme,
  onNavigate,
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniMapWidth = 150;
  const miniMapHeight = 100;

  // Calculate bounds of all objects
  const bounds = useMemo(() => {
    if (objects.length === 0) {
      return { minX: 0, minY: 0, maxX: canvasWidth, maxY: canvasHeight };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    objects.forEach((obj) => {
      if (obj.points) {
        obj.points.forEach((p) => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
      }
      if (obj.startPoint) {
        minX = Math.min(minX, obj.startPoint.x);
        minY = Math.min(minY, obj.startPoint.y);
        maxX = Math.max(maxX, obj.startPoint.x + (obj.shapeWidth || 0));
        maxY = Math.max(maxY, obj.startPoint.y + (obj.shapeHeight || 0));
      }
      if (obj.endPoint) {
        maxX = Math.max(maxX, obj.endPoint.x);
        maxY = Math.max(maxY, obj.endPoint.y);
      }
    });

    // Add padding
    const padding = 50;
    return {
      minX: Math.min(0, minX - padding),
      minY: Math.min(0, minY - padding),
      maxX: Math.max(canvasWidth, maxX + padding),
      maxY: Math.max(canvasHeight, maxY + padding),
    };
  }, [objects, canvasWidth, canvasHeight]);

  // Calculate scale to fit content in mini-map
  const scale = useMemo(() => {
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    return Math.min(miniMapWidth / contentWidth, miniMapHeight / contentHeight);
  }, [bounds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = theme === "dark" ? "#1e293b" : "#f1f5f9";
    ctx.fillRect(0, 0, miniMapWidth, miniMapHeight);

    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-bounds.minX, -bounds.minY);

    // Draw objects as simplified shapes
    objects.forEach((obj) => {
      ctx.fillStyle = obj.color;
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = Math.max(1, obj.width * 0.5);

      if (obj.type === "pen" && obj.points && obj.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        obj.points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (
        obj.type === "shape" &&
        obj.startPoint &&
        obj.shapeWidth &&
        obj.shapeHeight
      ) {
        ctx.fillStyle = obj.color + "60";
        ctx.fillRect(
          obj.startPoint.x,
          obj.startPoint.y,
          obj.shapeWidth,
          obj.shapeHeight,
        );
      } else if (obj.startPoint && obj.endPoint) {
        ctx.strokeRect(
          Math.min(obj.startPoint.x, obj.endPoint.x),
          Math.min(obj.startPoint.y, obj.endPoint.y),
          Math.abs(obj.endPoint.x - obj.startPoint.x),
          Math.abs(obj.endPoint.y - obj.startPoint.y),
        );
      }
    });

    ctx.restore();

    // Draw viewport rectangle
    const viewX = (-viewportOffset.x / viewportScale - bounds.minX) * scale;
    const viewY = (-viewportOffset.y / viewportScale - bounds.minY) * scale;
    const viewW = (canvasWidth / viewportScale) * scale;
    const viewH = (canvasHeight / viewportScale) * scale;

    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.strokeRect(viewX, viewY, viewW, viewH);
    ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
    ctx.fillRect(viewX, viewY, viewW, viewH);
  }, [
    objects,
    bounds,
    scale,
    viewportOffset,
    viewportScale,
    canvasWidth,
    canvasHeight,
    theme,
  ]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNavigate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to world coordinates
    const worldX = x / scale + bounds.minX;
    const worldY = y / scale + bounds.minY;

    onNavigate({ x: worldX, y: worldY });
  };

  // Don't show if there's nothing to display
  if (objects.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 rounded-lg overflow-hidden shadow-lg border",
        theme === "dark"
          ? "border-slate-700 bg-slate-800/80"
          : "border-slate-300 bg-white/80",
        "backdrop-blur-sm cursor-pointer",
      )}
    >
      <div
        className={cn(
          "px-2 py-1 text-xs font-medium border-b",
          theme === "dark"
            ? "border-slate-700 text-slate-400"
            : "border-slate-200 text-slate-500",
        )}
      >
        Mini-Map
      </div>
      <canvas
        ref={canvasRef}
        width={miniMapWidth}
        height={miniMapHeight}
        onClick={handleClick}
        className="block"
      />
    </div>
  );
}
