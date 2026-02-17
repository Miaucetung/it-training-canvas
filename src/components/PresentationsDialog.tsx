import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash } from '@phosphor-icons/react';
import { SubjectData } from '@/lib/types';

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
    ([, a], [, b]) => b.lastModified - a.lastModified
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Saved Presentations</DialogTitle>
          <DialogDescription>
            View and manage all your saved canvas presentations
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {subjectEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No saved presentations yet
              </p>
            ) : (
              subjectEntries.map(([name, data]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {data.canvasState.objects.length} objects • Last modified:{' '}
                      {new Date(data.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        onLoadSubject(name);
                        onOpenChange(false);
                      }}
                      variant="default"
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => onDeleteSubject(name)}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash size={20} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
