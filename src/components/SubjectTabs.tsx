import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from '@phosphor-icons/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface SubjectTabsProps {
  subjects: string[];
  currentSubject: string;
  onSubjectChange: (subject: string) => void;
  onAddSubject: (name: string) => void;
  onRemoveSubject: (subject: string) => void;
}

export function SubjectTabs({
  subjects,
  currentSubject,
  onSubjectChange,
  onAddSubject,
  onRemoveSubject,
}: SubjectTabsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      onAddSubject(newSubjectName.trim());
      setNewSubjectName('');
      setIsAdding(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-card border-b border-border overflow-x-auto">
        <Tabs value={currentSubject} onValueChange={onSubjectChange} className="flex-1">
          <TabsList className="h-12">
            {subjects.map((subject) => (
              <div key={subject} className="relative group">
                <TabsTrigger value={subject} className="h-10 px-6 text-base font-medium">
                  {subject}
                </TabsTrigger>
                {subjects.length > 1 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSubject(subject);
                        }}
                        className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove subject</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </TabsList>
        </Tabs>

        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="Subject name..."
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubject();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewSubjectName('');
                }
              }}
              className="h-10 w-40"
            />
            <Button onClick={handleAddSubject} size="sm" className="h-10">
              Add
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewSubjectName('');
              }}
              size="sm"
              variant="ghost"
              className="h-10"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsAdding(true)}
                size="icon"
                variant="outline"
                className="h-10 w-10 flex-shrink-0"
              >
                <Plus size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new subject</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
