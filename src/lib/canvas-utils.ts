import { DrawingObject, Point } from './types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isPointInBounds(point: Point, object: DrawingObject, threshold = 10): boolean {
  if (object.type === 'text' && object.startPoint && object.text) {
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

  if (object.type === 'pen' && object.points) {
    return object.points.some(p => distance(point, p) < threshold);
  }

  if (object.startPoint && object.endPoint) {
    const minX = Math.min(object.startPoint.x, object.endPoint.x) - threshold;
    const maxX = Math.max(object.startPoint.x, object.endPoint.x) + threshold;
    const minY = Math.min(object.startPoint.y, object.endPoint.y) - threshold;
    const maxY = Math.max(object.startPoint.y, object.endPoint.y) + threshold;

    return (
      point.x >= minX &&
      point.x <= maxX &&
      point.y >= minY &&
      point.y <= maxY
    );
  }

  return false;
}

export function drawObject(ctx: CanvasRenderingContext2D, obj: DrawingObject): void {
  ctx.strokeStyle = obj.color;
  ctx.fillStyle = obj.color;
  ctx.lineWidth = obj.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (obj.selected) {
    ctx.shadowColor = 'rgba(0, 200, 255, 0.8)';
    ctx.shadowBlur = 10;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  switch (obj.type) {
    case 'pen':
    case 'eraser':
      if (obj.points && obj.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i].x, obj.points[i].y);
        }
        ctx.stroke();
      }
      break;

    case 'line':
      if (obj.startPoint && obj.endPoint) {
        ctx.beginPath();
        ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
        ctx.lineTo(obj.endPoint.x, obj.endPoint.y);
        ctx.stroke();
      }
      break;

    case 'arrow':
      if (obj.startPoint && obj.endPoint) {
        const headLength = 15;
        const angle = Math.atan2(
          obj.endPoint.y - obj.startPoint.y,
          obj.endPoint.x - obj.startPoint.x
        );

        ctx.beginPath();
        ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
        ctx.lineTo(obj.endPoint.x, obj.endPoint.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(obj.endPoint.x, obj.endPoint.y);
        ctx.lineTo(
          obj.endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
          obj.endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(obj.endPoint.x, obj.endPoint.y);
        ctx.lineTo(
          obj.endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
          obj.endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
      break;

    case 'rectangle':
      if (obj.startPoint && obj.endPoint) {
        const width = obj.endPoint.x - obj.startPoint.x;
        const height = obj.endPoint.y - obj.startPoint.y;
        ctx.strokeRect(obj.startPoint.x, obj.startPoint.y, width, height);
      }
      break;

    case 'circle':
      if (obj.startPoint && obj.endPoint) {
        const radius = distance(obj.startPoint, obj.endPoint);
        ctx.beginPath();
        ctx.arc(obj.startPoint.x, obj.startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      break;

    case 'text':
      if (obj.startPoint && obj.text) {
        ctx.font = `${obj.fontSize || 20}px ${obj.fontFamily || 'IBM Plex Mono'}`;
        ctx.fillText(obj.text, obj.startPoint.x, obj.startPoint.y);
      }
      break;
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

export function exportToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function downloadJSON(data: any, filename: string): void {
  const json = exportToJSON(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
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
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
