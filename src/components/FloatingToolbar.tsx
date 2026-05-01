import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FontFamily,
  GridPattern,
  GridSize,
  PRESET_COLORS,
  PenWidth,
  SUBJECT_CONFIGS,
  ShapeDefinition,
  TextSize,
  Tool,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowUpRight,
  Circle as CircleIcon,
  DownloadSimple,
  Eraser,
  FileSvg,
  FloppyDisk,
  GitBranch,
  GridFour,
  Image,
  LineSegment,
  List,
  Minus,
  Moon,
  PencilLine,
  Question,
  Selection,
  SelectionAll,
  Shapes,
  Square,
  Sun,
  TextT,
  UploadSimple,
} from "@phosphor-icons/react";

interface FloatingToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  penWidth: PenWidth;
  onPenWidthChange: (width: PenWidth) => void;
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
  fontFamily: FontFamily;
  onFontFamilyChange: (font: FontFamily) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  showGrid: boolean;
  onGridToggle: () => void;
  gridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  gridPattern: GridPattern;
  onGridPatternChange: (pattern: GridPattern) => void;
  gridColor: string;
  gridAccentColor: string;
  onGridColorChange: (color: string, accentColor: string) => void;
  gridOpacity: number;
  onGridOpacityChange: (opacity: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onExportPNG?: () => void;
  onExportSVG?: () => void;
  onImport: () => void;
  onShowPresentations: () => void;
  onShowShapePicker: () => void;
  onShowKeyboardShortcuts?: () => void;
  onSelectAll?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentSubject: string;
  selectedShape: ShapeDefinition | null;
}

const tools: Array<{
  tool: Tool;
  icon: any;
  label: string;
  shortcut?: string;
}> = [
  { tool: "select", icon: Selection, label: "Auswählen", shortcut: "V" },
  { tool: "pen", icon: PencilLine, label: "Stift", shortcut: "P" },
  { tool: "eraser", icon: Eraser, label: "Radierer", shortcut: "E" },
  { tool: "text", icon: TextT, label: "Text", shortcut: "T" },
  { tool: "rectangle", icon: Square, label: "Rechteck", shortcut: "R" },
  { tool: "circle", icon: CircleIcon, label: "Kreis", shortcut: "C" },
  { tool: "line", icon: LineSegment, label: "Linie", shortcut: "L" },
  { tool: "arrow", icon: ArrowUpRight, label: "Pfeil", shortcut: "A" },
  { tool: "connection", icon: GitBranch, label: "Verbindung", shortcut: "K" },
  { tool: "shape", icon: Shapes, label: "IT-Formen", shortcut: "S" },
];

export function FloatingToolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  penWidth,
  onPenWidthChange,
  textSize,
  onTextSizeChange,
  fontFamily,
  onFontFamilyChange,
  theme,
  onThemeToggle,
  showGrid,
  onGridToggle,
  gridSize,
  onGridSizeChange,
  gridPattern,
  onGridPatternChange,
  gridColor,
  gridAccentColor,
  onGridColorChange,
  gridOpacity,
  onGridOpacityChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onExportPNG,
  onExportSVG,
  onImport,
  onShowPresentations,
  onShowShapePicker,
  onShowKeyboardShortcuts,
  onSelectAll,
  canUndo,
  canRedo,
  currentSubject,
  selectedShape,
}: FloatingToolbarProps) {
  const subjectColor = SUBJECT_CONFIGS[currentSubject]?.color || "#6366F1";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className={cn(
            "flex items-center gap-1 p-2 rounded-2xl shadow-2xl backdrop-blur-xl border",
            theme === "dark"
              ? "bg-slate-900/90 border-slate-700/50 shadow-black/50"
              : "bg-white/90 border-slate-200 shadow-slate-200/50",
          )}
        >
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 px-1">
            {tools.map(({ tool: t, icon: Icon, label, shortcut }) => (
              <Tooltip key={t}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToolChange(t)}
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all duration-200",
                      tool === t
                        ? "shadow-md"
                        : theme === "dark"
                          ? "text-slate-400 hover:text-white hover:bg-slate-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    )}
                    style={
                      tool === t
                        ? {
                            backgroundColor: subjectColor,
                            color: "white",
                          }
                        : undefined
                    }
                  >
                    <Icon size={20} weight={tool === t ? "fill" : "regular"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className={cn(
                    "mb-2",
                    theme === "dark" ? "bg-slate-800 border-slate-700" : "",
                  )}
                >
                  <p>
                    {label}{" "}
                    {shortcut && (
                      <span className="text-slate-500">({shortcut})</span>
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {onSelectAll && (
            <>
              <Separator
                orientation="vertical"
                className={cn(
                  "h-8 mx-1",
                  theme === "dark" ? "bg-slate-700" : "bg-slate-200",
                )}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSelectAll}
                    className={cn(
                      "h-10 w-10 rounded-xl",
                      theme === "dark"
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <SelectionAll size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className={cn(
                    "mb-2",
                    theme === "dark" ? "bg-slate-800 border-slate-700" : "",
                  )}
                >
                  <p>
                    Alles markieren{" "}
                    <span className="text-slate-500">(Strg+A)</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Separator
            orientation="vertical"
            className={cn(
              "h-8 mx-1",
              theme === "dark" ? "bg-slate-700" : "bg-slate-200",
            )}
          />

          {/* Color Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-10 w-10 p-0 rounded-xl",
                  theme === "dark"
                    ? "hover:bg-slate-800"
                    : "hover:bg-slate-100",
                )}
              >
                <div
                  className="w-6 h-6 rounded-lg shadow-inner border-2"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      theme === "dark"
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.1)",
                  }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                "w-56 p-3",
                theme === "dark" ? "bg-slate-900 border-slate-700" : "",
              )}
            >
              <div className="space-y-3">
                <div>
                  <Label className={theme === "dark" ? "text-slate-300" : ""}>
                    Farbe auswählen
                  </Label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-10 mt-2 cursor-pointer rounded-lg border-0"
                  />
                </div>
                <div>
                  <Label className={theme === "dark" ? "text-slate-300" : ""}>
                    Schnellauswahl
                  </Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => onColorChange(c)}
                        className={cn(
                          "h-8 w-full rounded-lg transition-all hover:scale-110 border-2",
                          color === c
                            ? "ring-2 ring-offset-2 ring-indigo-500"
                            : "border-transparent hover:border-slate-400",
                        )}
                        style={{
                          backgroundColor: c,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Pen Width */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-10 px-3 rounded-xl gap-2",
                  theme === "dark"
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <Minus
                  size={16}
                  style={{
                    strokeWidth:
                      penWidth === "thin" ? 2 : penWidth === "normal" ? 4 : 6,
                  }}
                />
                <span className="text-xs font-medium capitalize hidden sm:inline">
                  {penWidth}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                "w-40 p-2",
                theme === "dark" ? "bg-slate-900 border-slate-700" : "",
              )}
            >
              <div className="space-y-1">
                {(["thin", "normal", "thick"] as PenWidth[]).map((w) => (
                  <Button
                    key={w}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start capitalize rounded-lg",
                      penWidth === w
                        ? "text-white"
                        : theme === "dark"
                          ? "text-slate-400 hover:text-white hover:bg-slate-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    )}
                    style={
                      penWidth === w
                        ? { backgroundColor: subjectColor }
                        : undefined
                    }
                    onClick={() => onPenWidthChange(w)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 rounded-full"
                        style={{
                          height: w === "thin" ? 2 : w === "normal" ? 4 : 8,
                          backgroundColor:
                            penWidth === w
                              ? "white"
                              : theme === "dark"
                                ? "#94a3b8"
                                : "#64748b",
                        }}
                      />
                      <span>
                        {w === "thin"
                          ? "Dünn"
                          : w === "normal"
                            ? "Normal"
                            : "Dick"}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Text Size */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-10 px-3 rounded-xl gap-2",
                  theme === "dark"
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <TextT size={16} />
                <span className="text-xs font-medium capitalize hidden sm:inline">
                  {textSize}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                "w-44 p-2",
                theme === "dark" ? "bg-slate-900 border-slate-700" : "",
              )}
            >
              <div className="space-y-1">
                {[
                  { id: "small", label: "Klein", size: 14 },
                  { id: "medium", label: "Mittel", size: 18 },
                  { id: "large", label: "Groß", size: 24 },
                  { id: "xlarge", label: "Sehr Groß", size: 32 },
                ].map(({ id, label, size }) => (
                  <Button
                    key={id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start rounded-lg",
                      textSize === id
                        ? "text-white"
                        : theme === "dark"
                          ? "text-slate-400 hover:text-white hover:bg-slate-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    )}
                    style={
                      textSize === id
                        ? { backgroundColor: subjectColor }
                        : undefined
                    }
                    onClick={() => onTextSizeChange(id as TextSize)}
                  >
                    <span style={{ fontSize: Math.min(size, 18) }}>
                      {label}
                    </span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Separator
            orientation="vertical"
            className={cn(
              "h-8 mx-1",
              theme === "dark" ? "bg-slate-700" : "bg-slate-200",
            )}
          />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={cn(
                    "h-10 w-10 rounded-xl",
                    theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:text-slate-300",
                  )}
                >
                  <ArrowCounterClockwise size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className={
                  theme === "dark" ? "bg-slate-800 border-slate-700" : ""
                }
              >
                <p>
                  Rückgängig <span className="text-slate-500">(Ctrl+Z)</span>
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className={cn(
                    "h-10 w-10 rounded-xl",
                    theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:text-slate-300",
                  )}
                >
                  <ArrowClockwise size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className={
                  theme === "dark" ? "bg-slate-800 border-slate-700" : ""
                }
              >
                <p>
                  Wiederholen <span className="text-slate-500">(Ctrl+Y)</span>
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator
            orientation="vertical"
            className={cn(
              "h-8 mx-1",
              theme === "dark" ? "bg-slate-700" : "bg-slate-200",
            )}
          />

          {/* Grid Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onGridToggle}
                className={cn(
                  "h-10 w-10 rounded-xl transition-all",
                  showGrid
                    ? "shadow-md text-white"
                    : theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
                style={showGrid ? { backgroundColor: subjectColor } : undefined}
              >
                <GridFour size={20} weight={showGrid ? "fill" : "regular"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className={
                theme === "dark" ? "bg-slate-800 border-slate-700" : ""
              }
            >
              <p>Raster {showGrid ? "ausblenden" : "anzeigen"}</p>
            </TooltipContent>
          </Tooltip>

          {showGrid && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 px-3 rounded-xl",
                    theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <span className="text-xs font-medium capitalize">
                    {gridPattern}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className={cn(
                  "w-64 p-3",
                  theme === "dark" ? "bg-slate-900 border-slate-700" : "",
                )}
              >
                <div className="space-y-4">
                  <div>
                    <Label className={theme === "dark" ? "text-slate-300" : ""}>
                      Rastermuster
                    </Label>
                    <div className="flex gap-2 mt-2">
                      {(["lines", "dots", "dashed"] as GridPattern[]).map(
                        (p) => (
                          <Button
                            key={p}
                            variant="ghost"
                            className={cn(
                              "flex-1 capitalize rounded-lg",
                              gridPattern === p
                                ? "text-white"
                                : theme === "dark"
                                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                            )}
                            style={
                              gridPattern === p
                                ? { backgroundColor: subjectColor }
                                : undefined
                            }
                            onClick={() => onGridPatternChange(p)}
                          >
                            {p === "lines"
                              ? "Linien"
                              : p === "dots"
                                ? "Punkte"
                                : "Gestrichelt"}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className={theme === "dark" ? "text-slate-300" : ""}>
                      Größe
                    </Label>
                    <div className="flex gap-2 mt-2">
                      {(["small", "medium", "large"] as GridSize[]).map((s) => (
                        <Button
                          key={s}
                          variant="ghost"
                          className={cn(
                            "flex-1 capitalize rounded-lg",
                            gridSize === s
                              ? "text-white"
                              : theme === "dark"
                                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                          )}
                          style={
                            gridSize === s
                              ? { backgroundColor: subjectColor }
                              : undefined
                          }
                          onClick={() => onGridSizeChange(s)}
                        >
                          {s === "small" ? "S" : s === "medium" ? "M" : "L"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <Label
                        className={theme === "dark" ? "text-slate-300" : ""}
                      >
                        Transparenz
                      </Label>
                      <span
                        className={cn(
                          "text-sm",
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-500",
                        )}
                      >
                        {Math.round(gridOpacity * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[gridOpacity * 100]}
                      onValueChange={(values) =>
                        onGridOpacityChange(values[0] / 100)
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Separator
            orientation="vertical"
            className={cn(
              "h-8 mx-1",
              theme === "dark" ? "bg-slate-700" : "bg-slate-200",
            )}
          />

          {/* File Actions – bundled into a single popover */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl",
                    theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  )}
                  title="Datei: Speichern, Importieren, Exportieren"
                  aria-label="Datei-Aktionen"
                >
                  <FloppyDisk size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                side="top"
                className={cn(
                  "w-56 p-2",
                  theme === "dark" ? "bg-slate-900 border-slate-700" : "",
                )}
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    onClick={onSave}
                    className="justify-start gap-2 h-9"
                  >
                    <FloppyDisk size={16} />
                    Speichern
                    <span className="ml-auto text-xs text-slate-500">
                      Ctrl+S
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onImport}
                    className="justify-start gap-2 h-9"
                  >
                    <UploadSimple size={16} />
                    Importieren (JSON)
                  </Button>
                  <Separator
                    className={cn(
                      "my-1",
                      theme === "dark" ? "bg-slate-700" : "bg-slate-200",
                    )}
                  />
                  <Button
                    variant="ghost"
                    onClick={onExport}
                    className="justify-start gap-2 h-9"
                  >
                    <DownloadSimple size={16} />
                    JSON exportieren
                  </Button>
                  {onExportPNG && (
                    <Button
                      variant="ghost"
                      onClick={onExportPNG}
                      className="justify-start gap-2 h-9"
                    >
                      <Image size={16} />
                      PNG exportieren
                    </Button>
                  )}
                  {onExportSVG && (
                    <Button
                      variant="ghost"
                      onClick={onExportSVG}
                      className="justify-start gap-2 h-9"
                    >
                      <FileSvg size={16} />
                      SVG exportieren
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShowPresentations}
                  className={cn(
                    "h-10 w-10 rounded-xl",
                    theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <List size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className={
                  theme === "dark" ? "bg-slate-800 border-slate-700" : ""
                }
              >
                <p>Präsentationen</p>
              </TooltipContent>
            </Tooltip>

            {onShowKeyboardShortcuts && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShowKeyboardShortcuts}
                    className={cn(
                      "h-10 w-10 rounded-xl",
                      theme === "dark"
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <Question size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-700" : ""
                  }
                >
                  <p>
                    Tastenkürzel <span className="text-slate-500">(?)</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <Separator
            orientation="vertical"
            className={cn(
              "h-8 mx-1",
              theme === "dark" ? "bg-slate-700" : "bg-slate-200",
            )}
          />

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onThemeToggle}
                className={cn(
                  "h-10 w-10 rounded-xl",
                  theme === "dark"
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                {theme === "dark" ? (
                  <Sun size={20} weight="fill" />
                ) : (
                  <Moon size={20} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className={
                theme === "dark" ? "bg-slate-800 border-slate-700" : ""
              }
            >
              <p>{theme === "dark" ? "Heller Modus" : "Dunkler Modus"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
