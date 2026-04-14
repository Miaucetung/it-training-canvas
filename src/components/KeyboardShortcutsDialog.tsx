import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Werkzeuge",
    shortcuts: [
      { keys: ["P"], description: "Stift" },
      { keys: ["E"], description: "Radierer" },
      { keys: ["V"], description: "Auswahl" },
      { keys: ["T"], description: "Text" },
      { keys: ["L"], description: "Linie" },
      { keys: ["R"], description: "Rechteck" },
      { keys: ["O"], description: "Kreis" },
      { keys: ["A"], description: "Pfeil" },
    ],
  },
  {
    title: "Bearbeiten",
    shortcuts: [
      { keys: ["Ctrl", "Z"], description: "Rückgängig" },
      { keys: ["Ctrl", "Y"], description: "Wiederholen" },
      { keys: ["Ctrl", "C"], description: "Kopieren" },
      { keys: ["Ctrl", "V"], description: "Einfügen" },
      { keys: ["Ctrl", "A"], description: "Alles auswählen" },
      { keys: ["Del"], description: "Löschen" },
      { keys: ["Ctrl", "G"], description: "Gruppieren" },
      { keys: ["Ctrl", "Shift", "G"], description: "Gruppierung aufheben" },
    ],
  },
  {
    title: "Shapes",
    shortcuts: [
      { keys: ["R"], description: "Drehen (15°)" },
      { keys: ["Shift", "R"], description: "Drehen (-15°)" },
      { keys: ["S"], description: "Schatten ein/aus" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "Scroll"], description: "Zoom" },
      { keys: ["Alt", "Drag"], description: "Canvas verschieben" },
      { keys: ["Shift"], description: "Snap zum Raster" },
      { keys: ["Doppelklick"], description: "Text bearbeiten" },
    ],
  },
  {
    title: "Datei",
    shortcuts: [
      { keys: ["Ctrl", "S"], description: "Speichern" },
      { keys: ["Ctrl", "E"], description: "Exportieren" },
      { keys: ["Ctrl", "I"], description: "Importieren" },
    ],
  },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "light" | "dark";
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  theme,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[80vh] overflow-y-auto",
          theme === "dark" ? "bg-slate-900 border-slate-700" : "",
        )}
      >
        <DialogHeader>
          <DialogTitle className={theme === "dark" ? "text-white" : ""}>
            Tastenkürzel
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3
                className={cn(
                  "font-semibold text-sm mb-3",
                  theme === "dark" ? "text-slate-300" : "text-slate-700",
                )}
              >
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4"
                  >
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ? "text-slate-400" : "text-slate-600",
                      )}
                    >
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          <kbd
                            className={cn(
                              "px-2 py-1 text-xs font-mono rounded border",
                              theme === "dark"
                                ? "bg-slate-800 border-slate-600 text-slate-300"
                                : "bg-slate-100 border-slate-300 text-slate-700",
                            )}
                          >
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span
                              className={cn(
                                "text-xs",
                                theme === "dark"
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            >
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "mt-6 pt-4 border-t text-xs text-center",
            theme === "dark"
              ? "border-slate-700 text-slate-500"
              : "border-slate-200 text-slate-400",
          )}
        >
          Drücke{" "}
          <kbd
            className={cn(
              "px-1.5 py-0.5 rounded",
              theme === "dark" ? "bg-slate-800" : "bg-slate-100",
            )}
          >
            ?
          </kbd>{" "}
          um dieses Fenster zu öffnen
        </div>
      </DialogContent>
    </Dialog>
  );
}
