import { useEffect, useState, useCallback, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Canvas } from '@/components/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { SubjectTabs } from '@/components/SubjectTabs';
import { PresentationsDialog } from '@/components/PresentationsDialog';
import { Toaster, toast } from 'sonner';
import {
  AppState,
  SubjectData,
  CanvasState,
  DrawingObject,
  Tool,
  PenWidth,
  TextSize,
  FontFamily,
  GridSize,
  PEN_WIDTHS,
  TEXT_SIZES,
  GRID_SIZES,
  DEFAULT_SUBJECTS,
} from '@/lib/types';
import { downloadJSON, importFromJSON } from '@/lib/canvas-utils';

function App() {
  const [appData, setAppData] = useKV<Record<string, SubjectData>>('canvas-app-data', {});
  const [currentSubject, setCurrentSubject] = useState<string>(DEFAULT_SUBJECTS[0]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState<PenWidth>('normal');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [fontFamily, setFontFamily] = useState<FontFamily>('IBM Plex Mono');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState<GridSize>('medium');
  const [showPresentations, setShowPresentations] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!appData || Object.keys(appData).length === 0) {
      const initialData: Record<string, SubjectData> = {};
      DEFAULT_SUBJECTS.forEach((subject) => {
        initialData[subject] = {
          name: subject,
          canvasState: {
            objects: [],
            history: [[]],
            historyIndex: 0,
          },
          lastModified: Date.now(),
        };
      });
      setAppData(initialData);
    } else {
      setSubjects(Object.keys(appData));
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('canvas-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const getCurrentCanvasState = (): CanvasState => {
    if (!appData) {
      return {
        objects: [],
        history: [[]],
        historyIndex: 0,
      };
    }
    return (
      appData[currentSubject]?.canvasState || {
        objects: [],
        history: [[]],
        historyIndex: 0,
      }
    );
  };

  const updateCanvasState = useCallback(
    (newObjects: DrawingObject[]) => {
      setAppData((prev) => {
        if (!prev) {
          return {
            [currentSubject]: {
              name: currentSubject,
              canvasState: {
                objects: newObjects,
                history: [newObjects],
                historyIndex: 0,
              },
              lastModified: Date.now(),
            },
          };
        }

        const current = prev[currentSubject] || {
          name: currentSubject,
          canvasState: { objects: [], history: [[]], historyIndex: 0 },
          lastModified: Date.now(),
        };

        const newHistory = current.canvasState.history.slice(
          0,
          current.canvasState.historyIndex + 1
        );
        newHistory.push(newObjects);

        return {
          ...prev,
          [currentSubject]: {
            ...current,
            canvasState: {
              objects: newObjects,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            },
            lastModified: Date.now(),
          },
        };
      });

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        toast.success('Auto-saved', { duration: 2000 });
      }, 30000);
    },
    [currentSubject, setAppData]
  );

  const handleUndo = useCallback(() => {
    setAppData((prev) => {
      if (!prev) return {};
      const current = prev[currentSubject];
      if (!current || current.canvasState.historyIndex <= 0) return prev;

      const newIndex = current.canvasState.historyIndex - 1;
      return {
        ...prev,
        [currentSubject]: {
          ...current,
          canvasState: {
            ...current.canvasState,
            objects: current.canvasState.history[newIndex],
            historyIndex: newIndex,
          },
          lastModified: Date.now(),
        },
      };
    });
  }, [currentSubject, setAppData]);

  const handleRedo = useCallback(() => {
    setAppData((prev) => {
      if (!prev) return {};
      const current = prev[currentSubject];
      if (
        !current ||
        current.canvasState.historyIndex >= current.canvasState.history.length - 1
      )
        return prev;

      const newIndex = current.canvasState.historyIndex + 1;
      return {
        ...prev,
        [currentSubject]: {
          ...current,
          canvasState: {
            ...current.canvasState,
            objects: current.canvasState.history[newIndex],
            historyIndex: newIndex,
          },
          lastModified: Date.now(),
        },
      };
    });
  }, [currentSubject, setAppData]);

  const handleSave = useCallback(() => {
    toast.success('Saved successfully!', { duration: 2000 });
  }, []);

  const handleExport = useCallback(() => {
    if (!appData) {
      toast.error('No data to export', { duration: 2000 });
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadJSON(appData, `canvas-backup-${timestamp}.json`);
    toast.success('Exported successfully!', { duration: 2000 });
  }, [appData]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const data = await importFromJSON(file);
        setAppData(data);
        setSubjects(Object.keys(data));
        toast.success('Imported successfully!', { duration: 2000 });
      } catch (error) {
        toast.error('Failed to import: Invalid JSON file', { duration: 3000 });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [setAppData]
  );

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('canvas-theme', newTheme);
  }, [theme]);

  const handleGridToggle = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  const handleAddSubject = useCallback(
    (name: string) => {
      if (subjects.includes(name)) {
        toast.error('Subject already exists', { duration: 2000 });
        return;
      }

      setAppData((prev) => {
        const prevData = prev || {};
        return {
          ...prevData,
          [name]: {
            name,
            canvasState: {
              objects: [],
              history: [[]],
              historyIndex: 0,
            },
            lastModified: Date.now(),
          },
        };
      });
      setSubjects((prev) => [...prev, name]);
      setCurrentSubject(name);
      toast.success(`Added subject: ${name}`, { duration: 2000 });
    },
    [subjects, setAppData]
  );

  const handleRemoveSubject = useCallback(
    (subject: string) => {
      if (subjects.length === 1) {
        toast.error('Cannot remove the last subject', { duration: 2000 });
        return;
      }

      setAppData((prev) => {
        if (!prev) return {};
        const newData = { ...prev };
        delete newData[subject];
        return newData;
      });

      const newSubjects = subjects.filter((s) => s !== subject);
      setSubjects(newSubjects);

      if (currentSubject === subject) {
        setCurrentSubject(newSubjects[0]);
      }

      toast.success(`Removed subject: ${subject}`, { duration: 2000 });
    },
    [subjects, currentSubject, setAppData]
  );

  const handleDeleteSubject = useCallback(
    (subject: string) => {
      handleRemoveSubject(subject);
    },
    [handleRemoveSubject]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvasState = getCurrentCanvasState();
        const selectedObjects = canvasState.objects.filter((obj) => obj.selected);
        if (selectedObjects.length > 0) {
          e.preventDefault();
          const newObjects = canvasState.objects.filter((obj) => !obj.selected);
          updateCanvasState(newObjects);
        }
      } else if (!e.ctrlKey && !e.metaKey) {
        const toolMap: Record<string, Tool> = {
          v: 'select',
          p: 'pen',
          e: 'eraser',
          t: 'text',
          r: 'rectangle',
          c: 'circle',
          l: 'line',
          a: 'arrow',
        };
        const newTool = toolMap[e.key.toLowerCase()];
        if (newTool) {
          e.preventDefault();
          setTool(newTool);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, currentSubject, appData, updateCanvasState]);

  const canvasState = getCurrentCanvasState();
  const canUndo = canvasState.historyIndex > 0;
  const canRedo = canvasState.historyIndex < canvasState.history.length - 1;

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        penWidth={penWidth}
        onPenWidthChange={setPenWidth}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        showGrid={showGrid}
        onGridToggle={handleGridToggle}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onShowPresentations={() => setShowPresentations(true)}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <SubjectTabs
        subjects={subjects}
        currentSubject={currentSubject}
        onSubjectChange={setCurrentSubject}
        onAddSubject={handleAddSubject}
        onRemoveSubject={handleRemoveSubject}
      />

      <div className="flex-1 relative">
        <Canvas
          objects={canvasState.objects}
          onObjectsChange={updateCanvasState}
          tool={tool}
          color={color}
          penWidth={PEN_WIDTHS[penWidth]}
          fontSize={TEXT_SIZES[textSize]}
          fontFamily={fontFamily}
          theme={theme}
          showGrid={showGrid}
          gridSize={GRID_SIZES[gridSize]}
        />
      </div>

      <PresentationsDialog
        open={showPresentations}
        onOpenChange={setShowPresentations}
        subjects={appData || {}}
        onLoadSubject={setCurrentSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Toaster position="bottom-right" theme={theme} />
    </div>
  );
}

export default App;