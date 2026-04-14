import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DrawingObject } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowFatLineDown,
  ArrowFatLineUp,
  ArrowsClockwise,
  CaretDown,
  Copy,
  LinkSimple,
  Lock,
  LockOpen,
  Trash,
} from "@phosphor-icons/react";

interface SelectionToolbarProps {
  selectedObjects: DrawingObject[];
  position: { x: number; y: number };
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleLock: () => void;
  onGroup: () => void;
  onRotate: (degrees: number) => void;
  onSetLayer: (layer: "background" | "default" | "foreground") => void;
  theme: "light" | "dark";
}

export function SelectionToolbar({
  selectedObjects,
  position,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onGroup,
  onRotate,
  onSetLayer,
  theme,
}: SelectionToolbarProps) {
  const allLocked = selectedObjects.every((obj) => obj.locked);
  const canGroup = selectedObjects.length > 1;

  // Get bounding box center
  const toolbarX = position.x;
  const toolbarY = position.y - 50; // Position above selection

  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-1 p-1 rounded-lg shadow-lg border",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        theme === "dark"
          ? "bg-slate-900/95 border-slate-700 backdrop-blur-xl"
          : "bg-white/95 border-slate-200 backdrop-blur-xl",
      )}
      style={{
        left: toolbarX,
        top: Math.max(10, toolbarY),
        transform: "translateX(-50%)",
      }}
    >
      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className={cn(
          "h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10",
        )}
        title="Löschen"
      >
        <Trash size={16} />
      </Button>

      {/* Duplicate */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDuplicate}
        className={cn(
          "h-8 w-8",
          theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
        )}
        title="Duplizieren"
      >
        <Copy size={16} />
      </Button>

      {/* Rotate */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRotate(90)}
        className={cn(
          "h-8 w-8",
          theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
        )}
        title="Drehen 90°"
      >
        <ArrowsClockwise size={16} />
      </Button>

      {/* Divider */}
      <div
        className={cn(
          "w-px h-6",
          theme === "dark" ? "bg-slate-700" : "bg-slate-200",
        )}
      />

      {/* Layer Controls */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBringToFront}
        className={cn(
          "h-8 w-8",
          theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
        )}
        title="Nach vorne"
      >
        <ArrowFatLineUp size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onSendToBack}
        className={cn(
          "h-8 w-8",
          theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
        )}
        title="Nach hinten"
      >
        <ArrowFatLineDown size={16} />
      </Button>

      {/* Divider */}
      <div
        className={cn(
          "w-px h-6",
          theme === "dark" ? "bg-slate-700" : "bg-slate-200",
        )}
      />

      {/* Lock */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleLock}
        className={cn(
          "h-8 w-8",
          allLocked ? "text-amber-500" : "",
          theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
        )}
        title={allLocked ? "Entsperren" : "Sperren"}
      >
        {allLocked ? <LockOpen size={16} /> : <Lock size={16} />}
      </Button>

      {/* Group */}
      {canGroup && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onGroup}
          className={cn(
            "h-8 w-8",
            theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
          )}
          title="Gruppieren"
        >
          <LinkSimple size={16} />
        </Button>
      )}

      {/* More dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
            )}
          >
            <CaretDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={theme === "dark" ? "bg-slate-800 border-slate-700" : ""}
          align="end"
        >
          <DropdownMenuItem onClick={() => onSetLayer("foreground")}>
            Vordergrund-Ebene
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSetLayer("default")}>
            Standard-Ebene
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSetLayer("background")}>
            Hintergrund-Ebene
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onRotate(45)}>
            Drehen 45°
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRotate(180)}>
            Drehen 180°
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
