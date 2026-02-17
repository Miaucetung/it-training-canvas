import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PencilLine,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  TextT,
  Selection,
  ArrowCounterClockwise,
  ArrowClockwise,
  FloppyDisk,
  DownloadSimple,
  UploadSimple,
  Sun,
  Moon,
  List,
  GridFour,
} from '@phosphor-icons/react';
import { Tool, PenWidth, TextSize, FontFamily, GridSize, GridPattern, PRESET_COLORS, GRID_COLOR_PRESETS, GRID_COLOR_PRESETS_DARK } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ToolbarProps {
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
  theme: 'light' | 'dark';
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
  onImport: () => void;
  onShowPresentations: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
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
  onImport,
  onShowPresentations,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const tools: Array<{ tool: Tool; icon: any; label: string; shortcut?: string }> = [
    { tool: 'select', icon: Selection, label: 'Select', shortcut: 'V' },
    { tool: 'pen', icon: PencilLine, label: 'Pen', shortcut: 'P' },
    { tool: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { tool: 'text', icon: TextT, label: 'Text', shortcut: 'T' },
    { tool: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { tool: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
    { tool: 'line', icon: ArrowRight, label: 'Line', shortcut: 'L' },
    { tool: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-4 p-4 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          {tools.map(({ tool: t, icon: Icon, label, shortcut }) => (
            <Tooltip key={t}>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === t ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => onToolChange(t)}
                  className={cn(
                    'h-12 w-12',
                    tool === t && 'bg-accent text-accent-foreground hover:bg-accent/90'
                  )}
                >
                  <Icon size={24} weight={tool === t ? 'fill' : 'regular'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label} {shortcut && `(${shortcut})`}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-12" />

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-12 p-0"
                style={{ backgroundColor: color }}
              >
                <span className="sr-only">Select color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <div>
                  <Label>Color Picker</Label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-10 mt-2 cursor-pointer rounded border border-input"
                  />
                </div>
                <div>
                  <Label>Preset Colors</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => onColorChange(c)}
                        className={cn(
                          'h-10 w-full rounded border-2 transition-all hover:scale-110',
                          color === c ? 'border-accent' : 'border-transparent'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 px-4">
                Pen: {penWidth}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Label>Pen Width</Label>
                {(['thin', 'normal', 'thick'] as PenWidth[]).map((w) => (
                  <Button
                    key={w}
                    variant={penWidth === w ? 'default' : 'ghost'}
                    className="w-full justify-start capitalize"
                    onClick={() => onPenWidthChange(w)}
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 px-4">
                Text: {textSize}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Label>Text Size</Label>
                {(['small', 'medium', 'large', 'xlarge'] as TextSize[]).map((s) => (
                  <Button
                    key={s}
                    variant={textSize === s ? 'default' : 'ghost'}
                    className="w-full justify-start capitalize"
                    onClick={() => onTextSizeChange(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 px-4">
                Font
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <Label>Font Family</Label>
                {(['IBM Plex Sans', 'IBM Plex Mono', 'Arial'] as FontFamily[]).map((f) => (
                  <Button
                    key={f}
                    variant={fontFamily === f ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onFontFamilyChange(f)}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Separator orientation="vertical" className="h-12" />

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-12 w-12"
              >
                <ArrowCounterClockwise size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-12 w-12"
              >
                <ArrowClockwise size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-12" />

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className="h-12 w-12"
              >
                <FloppyDisk size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                className="h-12 w-12"
              >
                <DownloadSimple size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export JSON</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onImport}
                className="h-12 w-12"
              >
                <UploadSimple size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import JSON</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onShowPresentations}
                className="h-12 w-12"
              >
                <List size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Presentations</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-12" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onGridToggle}
              className={cn(
                'h-12 w-12',
                showGrid && 'bg-accent text-accent-foreground hover:bg-accent/90'
              )}
            >
              <GridFour size={24} weight={showGrid ? 'fill' : 'regular'} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Grid</p>
          </TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 px-4 capitalize">
              Grid: {gridSize}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Grid Pattern</Label>
                {(['lines', 'dots', 'dashed'] as GridPattern[]).map((p) => (
                  <Button
                    key={p}
                    variant={gridPattern === p ? 'default' : 'ghost'}
                    className="w-full justify-start capitalize"
                    onClick={() => onGridPatternChange(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Grid Spacing</Label>
                {(['small', 'medium', 'large', 'xlarge'] as GridSize[]).map((s) => (
                  <Button
                    key={s}
                    variant={gridSize === s ? 'default' : 'ghost'}
                    className="w-full justify-start capitalize"
                    onClick={() => onGridSizeChange(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Grid Opacity</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(gridOpacity * 100)}%</span>
                </div>
                <Slider
                  value={[gridOpacity * 100]}
                  onValueChange={(values) => onGridOpacityChange(values[0] / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 px-4">
              Grid Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div>
                <Label>Grid Color Presets</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(theme === 'dark' ? GRID_COLOR_PRESETS_DARK : GRID_COLOR_PRESETS).map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="h-auto py-2 px-3 flex flex-col items-start gap-1"
                      onClick={() => onGridColorChange(preset.color, preset.accent)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-xs">{preset.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-12" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="h-12 w-12"
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Theme</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
