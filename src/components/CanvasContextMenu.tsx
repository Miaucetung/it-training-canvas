import { DrawingObject } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowFatLineDown,
  ArrowFatLineUp,
  ArrowsClockwise,
  Copy,
  Eye,
  EyeSlash,
  Gear,
  Info,
  LinkBreak,
  LinkSimple,
  Lock,
  LockOpen,
  Selection,
  SelectionAll,
  Terminal,
  Trash,
} from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

interface ContextMenuAction {
  id: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    weight?: "regular" | "bold" | "fill";
  }>;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick: () => void;
}

interface CanvasContextMenuProps {
  x: number;
  y: number;
  selectedObjects: DrawingObject[];
  allObjects: DrawingObject[];
  onClose: () => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: (ids: string[]) => void;
  onBringToFront: (ids: string[]) => void;
  onSendToBack: (ids: string[]) => void;
  onToggleLock: (ids: string[]) => void;
  onToggleVisibility: (ids: string[]) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (ids: string[]) => void;
  onSelectAll: () => void;
  onShowProperties: (obj: DrawingObject) => void;
  onRotate: (ids: string[], degrees: number) => void;
  onOpenConfig?: (obj: DrawingObject) => void;
  onOpenTerminal?: (obj: DrawingObject) => void;
  theme: "light" | "dark";
}

export function CanvasContextMenu({
  x,
  y,
  selectedObjects,
  allObjects: _allObjects,
  onClose,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onToggleVisibility,
  onGroup,
  onUngroup,
  onSelectAll,
  onShowProperties,
  onRotate,
  onOpenConfig,
  onOpenTerminal,
  theme,
}: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const selectedIds = selectedObjects.map((obj) => obj.id);
  const hasSelection = selectedObjects.length > 0;
  const hasSingleSelection = selectedObjects.length === 1;
  const hasMultipleSelection = selectedObjects.length > 1;
  const allLocked = selectedObjects.every((obj) => obj.locked);
  const allVisible = selectedObjects.every((obj) => obj.visible !== false);
  const hasGroup = selectedObjects.some((obj) => obj.groupId);
  const canGroup = hasMultipleSelection && !hasGroup;

  const actions: ContextMenuAction[] = [
    // Selection actions
    {
      id: "select-all",
      label: "Alles auswählen",
      icon: SelectionAll,
      shortcut: "Strg+A",
      onClick: onSelectAll,
    },
    {
      id: "divider-1",
      label: "",
      icon: Selection,
      divider: true,
      onClick: () => {},
    },

    // Edit actions (only with selection)
    ...(hasSelection
      ? [
          {
            id: "duplicate",
            label: "Duplizieren",
            icon: Copy,
            shortcut: "Strg+D",
            onClick: () => onDuplicate(selectedIds),
          },
          {
            id: "delete",
            label: "Löschen",
            icon: Trash,
            shortcut: "Entf",
            danger: true,
            onClick: () => onDelete(selectedIds),
          },
          {
            id: "divider-2",
            label: "",
            icon: Selection,
            divider: true,
            onClick: () => {},
          },
        ]
      : []),

    // Layer actions
    ...(hasSelection
      ? [
          {
            id: "bring-front",
            label: "Nach vorne",
            icon: ArrowFatLineUp,
            onClick: () => onBringToFront(selectedIds),
          },
          {
            id: "send-back",
            label: "Nach hinten",
            icon: ArrowFatLineDown,
            onClick: () => onSendToBack(selectedIds),
          },
          {
            id: "divider-3",
            label: "",
            icon: Selection,
            divider: true,
            onClick: () => {},
          },
        ]
      : []),

    // Transform actions
    ...(hasSelection
      ? [
          {
            id: "rotate-90",
            label: "Drehen 90°",
            icon: ArrowsClockwise,
            shortcut: "R",
            onClick: () => onRotate(selectedIds, 90),
          },
        ]
      : []),

    // Group actions
    ...(canGroup
      ? [
          {
            id: "group",
            label: "Gruppieren",
            icon: LinkSimple,
            shortcut: "Strg+G",
            onClick: () => onGroup(selectedIds),
          },
        ]
      : []),
    ...(hasGroup
      ? [
          {
            id: "ungroup",
            label: "Gruppierung aufheben",
            icon: LinkBreak,
            shortcut: "Strg+Shift+G",
            onClick: () => onUngroup(selectedIds),
          },
        ]
      : []),

    // Visibility/Lock actions
    ...(hasSelection
      ? [
          {
            id: "divider-4",
            label: "",
            icon: Selection,
            divider: true,
            onClick: () => {},
          },
          {
            id: "toggle-lock",
            label: allLocked ? "Entsperren" : "Sperren",
            icon: allLocked ? LockOpen : Lock,
            onClick: () => onToggleLock(selectedIds),
          },
          {
            id: "toggle-visibility",
            label: allVisible ? "Ausblenden" : "Einblenden",
            icon: allVisible ? EyeSlash : Eye,
            onClick: () => onToggleVisibility(selectedIds),
          },
        ]
      : []),

    // Properties (single selection only)
    ...(hasSingleSelection
      ? [
          {
            id: "divider-5",
            label: "",
            icon: Selection,
            divider: true,
            onClick: () => {},
          },
          {
            id: "properties",
            label: "Eigenschaften",
            icon: Info,
            shortcut: "I",
            onClick: () => onShowProperties(selectedObjects[0]),
          },
          // Config and Terminal for shapes only
          ...(selectedObjects[0].type === "shape"
            ? [
                {
                  id: "config",
                  label: "Konfigurieren",
                  icon: Gear,
                  onClick: () => onOpenConfig?.(selectedObjects[0]),
                },
                {
                  id: "terminal",
                  label: "Terminal öffnen",
                  icon: Terminal,
                  onClick: () => onOpenTerminal?.(selectedObjects[0]),
                },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-[100] min-w-[200px] rounded-lg shadow-xl border overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        theme === "dark"
          ? "bg-slate-900 border-slate-700"
          : "bg-white border-slate-200",
      )}
      style={{ left: x, top: y }}
    >
      <div className="py-1">
        {actions.map((action) => {
          if (action.divider) {
            return (
              <div
                key={action.id}
                className={cn(
                  "my-1 h-px",
                  theme === "dark" ? "bg-slate-700" : "bg-slate-200",
                )}
              />
            );
          }

          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                action.danger
                  ? theme === "dark"
                    ? "text-red-400 hover:bg-red-500/20"
                    : "text-red-600 hover:bg-red-50"
                  : theme === "dark"
                    ? "text-slate-200 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{action.label}</span>
              {action.shortcut && (
                <span
                  className={cn(
                    "text-xs",
                    theme === "dark" ? "text-slate-500" : "text-slate-400",
                  )}
                >
                  {action.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
