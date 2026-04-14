import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IT_SHAPES, SHAPE_CATEGORIES, getShapesByCategory } from "@/lib/shapes";
import { ShapeCategory, ShapeDefinition } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChartBar,
  Cloud,
  Cube,
  Database,
  Globe,
  HardDrives,
  MagnifyingGlass,
  ShieldCheck,
  WifiHigh,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

interface ShapePickerProps {
  onSelectShape: (shape: ShapeDefinition) => void;
  onClose: () => void;
  theme: "light" | "dark";
}

const categoryIcons: Record<ShapeCategory, any> = {
  network: WifiHigh,
  cloud: Cloud,
  server: HardDrives,
  storage: Database,
  security: ShieldCheck,
  containers: Cube,
  arrows: ArrowRight,
  diagrams: ChartBar,
  azure: Cloud,
  aws: Cloud,
  infrastructure: Globe,
};

export function ShapePicker({
  onSelectShape,
  onClose,
  theme,
}: ShapePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ShapeCategory>("network");

  const shapesByCategory = getShapesByCategory();

  const filteredShapes = searchQuery
    ? IT_SHAPES.filter(
        (shape) =>
          shape.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shape.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : shapesByCategory[selectedCategory];

  const renderShape = (shape: ShapeDefinition) => (
    <Tooltip key={shape.id}>
      <TooltipTrigger asChild>
        <button
          onClick={() => onSelectShape(shape)}
          aria-label={shape.name}
          className={cn(
            "w-full aspect-square rounded-xl p-3 transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 border-2",
            theme === "dark"
              ? "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-700/50"
              : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50",
          )}
        >
          <div
            className="w-full h-16 flex items-center justify-center"
            style={{ color: shape.color }}
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 ${shape.width} ${shape.height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${shape.svgPath}</svg>`,
            }}
          />
          <span
            className={cn(
              "text-xs font-medium truncate w-full text-center",
              theme === "dark" ? "text-slate-400" : "text-slate-600",
            )}
          >
            {shape.name}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className={theme === "dark" ? "bg-slate-800 border-slate-700" : ""}
      >
        <p className="font-medium">{shape.name}</p>
        <p
          className={cn(
            "text-xs",
            theme === "dark" ? "text-slate-400" : "text-slate-500",
          )}
        >
          {SHAPE_CATEGORIES[shape.category].name}
        </p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden",
          theme === "dark"
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-slate-200",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b",
            theme === "dark" ? "border-slate-700" : "border-slate-200",
          )}
        >
          <h3
            className={cn(
              "font-semibold",
              theme === "dark" ? "text-white" : "text-slate-900",
            )}
          >
            Formen-Bibliothek
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "h-8 w-8 rounded-lg",
              theme === "dark"
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <X size={18} />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <MagnifyingGlass
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                theme === "dark" ? "text-slate-500" : "text-slate-400",
              )}
              size={16}
            />
            <Input
              placeholder="Formen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9 h-9",
                theme === "dark"
                  ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  : "",
              )}
            />
          </div>
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="px-3">
            <div className="flex flex-wrap gap-1 pb-2">
              {(Object.keys(SHAPE_CATEGORIES) as ShapeCategory[]).map((cat) => {
                const Icon = categoryIcons[cat];
                const info = SHAPE_CATEGORIES[cat];
                return (
                  <Tooltip key={cat}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          selectedCategory === cat
                            ? "shadow-md text-white"
                            : theme === "dark"
                              ? "text-slate-400 hover:text-white hover:bg-slate-800"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                        )}
                        style={
                          selectedCategory === cat
                            ? { backgroundColor: info.color }
                            : undefined
                        }
                      >
                        <Icon
                          size={16}
                          weight={selectedCategory === cat ? "fill" : "regular"}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className={
                        theme === "dark" ? "bg-slate-800 border-slate-700" : ""
                      }
                    >
                      {info.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Title */}
        {!searchQuery && (
          <div
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2",
              theme === "dark" ? "text-slate-500" : "text-slate-400",
            )}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: SHAPE_CATEGORIES[selectedCategory].color,
              }}
            />
            {SHAPE_CATEGORIES[selectedCategory].name}
            <span className="ml-auto font-normal normal-case">
              {shapesByCategory[selectedCategory].length} Formen
            </span>
          </div>
        )}

        {/* Shapes Grid */}
        <ScrollArea className="h-80 px-3 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {filteredShapes.map(renderShape)}
          </div>
          {filteredShapes.length === 0 && (
            <div
              className={cn(
                "text-center py-8",
                theme === "dark" ? "text-slate-500" : "text-slate-400",
              )}
            >
              <p>Keine Formen gefunden</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer Hint */}
        <div
          className={cn(
            "px-4 py-2 text-xs border-t",
            theme === "dark"
              ? "text-slate-500 border-slate-700 bg-slate-800/30"
              : "text-slate-400 border-slate-200 bg-slate-50",
          )}
        >
          Klicke eine Form an und platziere sie auf dem Canvas
        </div>
      </div>
    </TooltipProvider>
  );
}
