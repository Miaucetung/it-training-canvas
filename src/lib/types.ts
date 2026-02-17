export type Tool = 
  | 'pen' 
  | 'eraser' 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'arrow' 
  | 'text' 
  | 'select';

export type PenWidth = 'thin' | 'normal' | 'thick';

export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';

export type FontFamily = 'IBM Plex Sans' | 'IBM Plex Mono' | 'Arial';

export type GridSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingObject {
  id: string;
  type: Tool;
  color: string;
  width: number;
  points?: Point[];
  startPoint?: Point;
  endPoint?: Point;
  text?: string;
  fontSize?: number;
  fontFamily?: FontFamily;
  selected?: boolean;
}

export interface CanvasState {
  objects: DrawingObject[];
  history: DrawingObject[][];
  historyIndex: number;
}

export interface SubjectData {
  name: string;
  canvasState: CanvasState;
  lastModified: number;
}

export interface AppState {
  subjects: Record<string, SubjectData>;
  currentSubject: string;
  tool: Tool;
  color: string;
  penWidth: PenWidth;
  textSize: TextSize;
  fontFamily: FontFamily;
  theme: 'light' | 'dark';
}

export const PEN_WIDTHS: Record<PenWidth, number> = {
  thin: 2,
  normal: 4,
  thick: 8,
};

export const TEXT_SIZES: Record<TextSize, number> = {
  small: 14,
  medium: 20,
  large: 32,
  xlarge: 48,
};

export const GRID_SIZES: Record<GridSize, number> = {
  small: 10,
  medium: 20,
  large: 40,
  xlarge: 80,
};

export const PRESET_COLORS = [
  '#000000',
  '#FFFFFF',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];

export const GRID_COLOR_PRESETS = [
  { name: 'Light Gray', color: 'oklch(0.92 0 0)', accent: 'oklch(0.88 0 0)' },
  { name: 'Medium Gray', color: 'oklch(0.8 0 0)', accent: 'oklch(0.7 0 0)' },
  { name: 'Blue', color: 'oklch(0.85 0.05 250)', accent: 'oklch(0.75 0.08 250)' },
  { name: 'Green', color: 'oklch(0.85 0.05 150)', accent: 'oklch(0.75 0.08 150)' },
  { name: 'Purple', color: 'oklch(0.85 0.05 300)', accent: 'oklch(0.75 0.08 300)' },
  { name: 'Orange', color: 'oklch(0.85 0.05 50)', accent: 'oklch(0.75 0.08 50)' },
];

export const GRID_COLOR_PRESETS_DARK = [
  { name: 'Dark Gray', color: 'oklch(0.25 0 0)', accent: 'oklch(0.3 0 0)' },
  { name: 'Medium Gray', color: 'oklch(0.35 0 0)', accent: 'oklch(0.45 0 0)' },
  { name: 'Blue', color: 'oklch(0.3 0.05 250)', accent: 'oklch(0.4 0.08 250)' },
  { name: 'Green', color: 'oklch(0.3 0.05 150)', accent: 'oklch(0.4 0.08 150)' },
  { name: 'Purple', color: 'oklch(0.3 0.05 300)', accent: 'oklch(0.4 0.08 300)' },
  { name: 'Orange', color: 'oklch(0.3 0.05 50)', accent: 'oklch(0.4 0.08 50)' },
];

export const DEFAULT_SUBJECTS = ['FISI', 'Azure', 'AWS', 'Linux'];
