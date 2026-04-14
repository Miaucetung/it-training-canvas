import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SUBJECT_CONFIGS, SubjectData } from "@/lib/types";
import { Clock, Cube, Folder, Trash } from "@phosphor-icons/react";

interface PresentationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Record<string, SubjectData>;
  onLoadSubject: (subject: string) => void;
  onDeleteSubject: (subject: string) => void;
}

export function PresentationsDialog({
  open,
  onOpenChange,
  subjects,
  onLoadSubject,
  onDeleteSubject,
}: PresentationsDialogProps) {
  const subjectEntries = Object.entries(subjects).sort(
    ([, a], [, b]) => b.lastModified - a.lastModified,
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Gerade eben";
    if (minutes < 60) return `Vor ${minutes} Min.`;
    if (hours < 24) return `Vor ${hours} Std.`;
    if (days < 7) return `Vor ${days} Tagen`;
    return date.toLocaleDateString("de-DE");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Folder size={20} weight="fill" className="text-white" />
            </div>
            Gespeicherte Präsentationen
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Alle gespeicherten Canvas-Präsentationen verwalten
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96 mt-4">
          <div className="space-y-3 pr-4">
            {subjectEntries.length === 0 ? (
              <div className="text-center py-12">
                <Folder size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">
                  Noch keine Präsentationen gespeichert
                </p>
              </div>
            ) : (
              subjectEntries.map(([name, data]) => {
                const config = SUBJECT_CONFIGS[name];
                const subjectColor = config?.color || "#6366F1";

                return (
                  <div
                    key={name}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${subjectColor}20` }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: subjectColor }}
                      >
                        <span className="text-white font-bold text-sm">
                          {name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {config?.name || name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Cube size={14} />
                          {data.canvasState.objects.length} Objekte
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(data.lastModified)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => {
                          onLoadSubject(name);
                          onOpenChange(false);
                        }}
                        className="h-9 px-4 rounded-lg"
                        style={{ backgroundColor: subjectColor }}
                      >
                        Öffnen
                      </Button>
                      <Button
                        onClick={() => onDeleteSubject(name)}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
