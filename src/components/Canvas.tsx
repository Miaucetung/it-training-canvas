import { useEffect, useRef, useState } from 'react';
import { DrawingObject, Point, Tool, PEN_WIDTHS, FontFamily } from '@/lib/types';
import { drawObject, generateId, isPointInBounds } from '@/lib/canvas-utils';

interface CanvasProps {
  objects: DrawingObject[];
  onObjectsChange: (objects: DrawingObject[]) => void;
  tool: Tool;
  color: string;
  penWidth: number;
  fontSize: number;
  fontFamily: FontFamily;
  theme: 'light' | 'dark';
  showGrid: boolean;
}

export function Canvas({
  objects,
  onObjectsChange,
  tool,
  color,
  penWidth,
  fontSize,
  fontFamily,
  theme,
  showGrid,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentObject, setCurrentObject] = useState<DrawingObject | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState<{ position: Point; value: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    redraw();
  }, [objects, theme, showGrid]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    const gridColor = theme === 'dark' ? 'oklch(0.25 0 0)' : 'oklch(0.92 0 0)';
    const accentGridColor = theme === 'dark' ? 'oklch(0.3 0 0)' : 'oklch(0.88 0 0)';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= width; x += gridSize) {
      if (x % (gridSize * 5) === 0) {
        ctx.strokeStyle = accentGridColor;
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
      }
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      if (y % (gridSize * 5) === 0) {
        ctx.strokeStyle = accentGridColor;
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
      }
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const bgColor = theme === 'dark' ? 'oklch(0.18 0 0)' : 'oklch(0.98 0 0)';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    objects.forEach((obj) => {
      if (tool === 'eraser' && obj.type === 'eraser') {
        const eraserObj = { ...obj, color: bgColor };
        drawObject(ctx, eraserObj);
      } else {
        drawObject(ctx, obj);
      }
    });

    if (currentObject) {
      drawObject(ctx, currentObject);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setDragStart(pos);

    if (tool === 'text') {
      setTextInput({ position: pos, value: '' });
      return;
    }

    if (tool === 'select') {
      const clickedObject = [...objects].reverse().find((obj) =>
        isPointInBounds(pos, obj)
      );

      if (clickedObject) {
        if (e.ctrlKey || e.metaKey) {
          const newSelected = new Set(selectedObjects);
          if (newSelected.has(clickedObject.id)) {
            newSelected.delete(clickedObject.id);
          } else {
            newSelected.add(clickedObject.id);
          }
          setSelectedObjects(newSelected);
        } else {
          setSelectedObjects(new Set([clickedObject.id]));
        }
        
        const updatedObjects = objects.map((obj) => ({
          ...obj,
          selected: obj.id === clickedObject.id || selectedObjects.has(obj.id),
        }));
        onObjectsChange(updatedObjects);
      } else {
        setSelectedObjects(new Set());
        onObjectsChange(objects.map((obj) => ({ ...obj, selected: false })));
      }
      return;
    }

    const newObject: DrawingObject = {
      id: generateId(),
      type: tool,
      color: tool === 'eraser' ? (theme === 'dark' ? 'oklch(0.18 0 0)' : 'oklch(0.98 0 0)') : color,
      width: tool === 'eraser' ? 20 : penWidth,
    };

    if (tool === 'pen' || tool === 'eraser') {
      newObject.points = [pos];
    } else {
      newObject.startPoint = pos;
      newObject.endPoint = pos;
    }

    setCurrentObject(newObject);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentObject) return;

    const pos = getMousePos(e);

    if (tool === 'select' && dragStart && selectedObjects.size > 0) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      const updatedObjects = objects.map((obj) => {
        if (selectedObjects.has(obj.id)) {
          const newObj = { ...obj };
          if (newObj.points) {
            newObj.points = newObj.points.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            }));
          }
          if (newObj.startPoint) {
            newObj.startPoint = {
              x: newObj.startPoint.x + dx,
              y: newObj.startPoint.y + dy,
            };
          }
          if (newObj.endPoint) {
            newObj.endPoint = {
              x: newObj.endPoint.x + dx,
              y: newObj.endPoint.y + dy,
            };
          }
          return newObj;
        }
        return obj;
      });

      onObjectsChange(updatedObjects);
      setDragStart(pos);
      return;
    }

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentObject({
        ...currentObject,
        points: [...(currentObject.points || []), pos],
      });
    } else {
      setCurrentObject({
        ...currentObject,
        endPoint: pos,
      });
    }

    redraw();
  };

  const handleMouseUp = () => {
    if (isDrawing && currentObject && tool !== 'text') {
      onObjectsChange([...objects, currentObject]);
      setCurrentObject(null);
    }
    setIsDrawing(false);
    setDragStart(null);
  };

  const handleTextSubmit = () => {
    if (textInput && textInput.value.trim()) {
      const textObject: DrawingObject = {
        id: generateId(),
        type: 'text',
        color,
        width: 0,
        startPoint: textInput.position,
        text: textInput.value,
        fontSize,
        fontFamily,
      };
      onObjectsChange([...objects, textObject]);
    }
    setTextInput(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setTextInput(null);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair"
        style={{
          cursor:
            tool === 'select'
              ? 'default'
              : tool === 'text'
              ? 'text'
              : tool === 'eraser'
              ? 'cell'
              : 'crosshair',
        }}
      />
      
      {textInput && (
        <input
          type="text"
          autoFocus
          value={textInput.value}
          onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
          onBlur={handleTextSubmit}
          onKeyDown={handleKeyDown}
          className="absolute border-2 border-accent bg-transparent outline-none px-2 py-1 font-mono"
          style={{
            left: textInput.position.x,
            top: textInput.position.y,
            color,
            fontSize: `${fontSize}px`,
            fontFamily,
            minWidth: '200px',
          }}
        />
      )}
    </div>
  );
}
