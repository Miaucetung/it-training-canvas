import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CATEGORY_LABELS, SUBJECT_CONFIGS } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CaretLeft,
  CaretRight,
  Certificate,
  Cloud,
  Code,
  Cube,
  Database,
  Folder,
  GitBranch,
  GraduationCap,
  Infinity as InfinityIcon,
  LinuxLogo,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  Terminal,
  WifiHigh,
  WindowsLogo,
  X,
} from "@phosphor-icons/react";
import { memo, useState } from "react";

interface SidebarProps {
  subjects: string[];
  currentSubject: string;
  onSubjectChange: (subject: string) => void;
  onAddSubject: (name: string) => void;
  onRemoveSubject: (subject: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const iconMap: Record<string, any> = {
  Certificate: Certificate,
  MicrosoftAzureLogo: Cloud,
  AmazonLogo: Cloud,
  LinuxLogo: LinuxLogo,
  Cube: Cube,
  GitBranch: GitBranch,
  WifiHigh: WifiHigh,
  ShieldCheck: ShieldCheck,
  Code: Code,
  Infinity: InfinityIcon,
  WindowsLogo: WindowsLogo,
  Database: Database,
  Terminal: Terminal,
  Folder: Folder,
  GraduationCap: GraduationCap,
};

function getSubjectIcon(subject: string) {
  const config = SUBJECT_CONFIGS[subject];
  if (config && iconMap[config.icon]) {
    return iconMap[config.icon];
  }
  return Folder;
}

function getSubjectColor(subject: string): string {
  const config = SUBJECT_CONFIGS[subject];
  return config?.color || "#6366F1";
}


function SidebarInner({
  subjects,
  currentSubject,
  onSubjectChange,
  onAddSubject,
  onRemoveSubject,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      onAddSubject(newSubjectName.trim());
      setNewSubjectName("");
      setIsAdding(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Gruppiere nach Kategorien
  const groupedSubjects = filteredSubjects.reduce(
    (acc, subject) => {
      const config = SUBJECT_CONFIGS[subject];
      const category = config?.category || "development";
      if (!acc[category]) acc[category] = [];
      acc[category].push(subject);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const availableSubjectsToAdd = Object.keys(SUBJECT_CONFIGS).filter(
    (key) => !subjects.includes(key),
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-72",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center gap-3 p-4 border-b border-slate-700/50",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <GraduationCap size={22} weight="fill" className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  IT Training
                </h1>
                <p className="text-xs text-slate-400">Canvas Studio</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap size={22} weight="fill" className="text-white" />
            </div>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-3">
            <div className="relative">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <Input
                placeholder="Thema suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Subject List */}
        <ScrollArea className="flex-1 px-2">
          <div
            className={cn(
              "space-y-1 py-2",
              collapsed && "flex flex-col items-center",
            )}
          >
            {!collapsed ? (
              // Expanded View - grouped by category
              <>
                {Object.entries(groupedSubjects).map(
                  ([category, categorySubjects]) => (
                    <div key={category} className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {CATEGORY_LABELS[
                          category as keyof typeof CATEGORY_LABELS
                        ] || category}
                      </div>
                      {categorySubjects.map((subject) => {
                        const Icon = getSubjectIcon(subject);
                        const config = SUBJECT_CONFIGS[subject];
                        const isActive = currentSubject === subject;

                        return (
                          <div key={subject} className="relative group">
                            <button
                              onClick={() => onSubjectChange(subject)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                isActive
                                  ? "bg-gradient-to-r text-white shadow-lg"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                              )}
                              style={
                                isActive
                                  ? {
                                      background: `linear-gradient(135deg, ${getSubjectColor(subject)}20, ${getSubjectColor(subject)}40)`,
                                      borderLeft: `3px solid ${getSubjectColor(subject)}`,
                                    }
                                  : undefined
                              }
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                  isActive ? "shadow-md" : "",
                                )}
                                style={{
                                  backgroundColor: isActive
                                    ? getSubjectColor(subject)
                                    : `${getSubjectColor(subject)}30`,
                                }}
                              >
                                <Icon
                                  size={18}
                                  weight={isActive ? "fill" : "regular"}
                                  className="text-white"
                                />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div
                                  className={cn(
                                    "font-medium text-sm truncate",
                                    isActive ? "text-white" : "text-slate-300",
                                  )}
                                >
                                  {config?.name || subject}
                                </div>
                                {config?.description && (
                                  <div className="text-xs text-slate-500 truncate">
                                    {config.description}
                                  </div>
                                )}
                              </div>
                            </button>
                            {subjects.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveSubject(subject);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500/30"
                              >
                                <X size={12} weight="bold" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ),
                )}
              </>
            ) : (
              // Collapsed View - just icons
              <>
                {filteredSubjects.map((subject) => {
                  const Icon = getSubjectIcon(subject);
                  const isActive = currentSubject === subject;

                  return (
                    <Tooltip key={subject}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onSubjectChange(subject)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 mb-2",
                            isActive
                              ? "shadow-lg"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                          )}
                          style={
                            isActive
                              ? {
                                  backgroundColor: getSubjectColor(subject),
                                  boxShadow: `0 4px 14px ${getSubjectColor(subject)}40`,
                                }
                              : {
                                  backgroundColor: `${getSubjectColor(subject)}20`,
                                }
                          }
                        >
                          <Icon
                            size={22}
                            weight={isActive ? "fill" : "regular"}
                            className="text-white"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-slate-800 border-slate-700"
                      >
                        <p className="font-medium">
                          {SUBJECT_CONFIGS[subject]?.name || subject}
                        </p>
                        {SUBJECT_CONFIGS[subject]?.description && (
                          <p className="text-xs text-slate-400">
                            {SUBJECT_CONFIGS[subject].description}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Add Subject */}
        <div className="p-3 border-t border-slate-700/50">
          {isAdding && !collapsed ? (
            <div className="space-y-2">
              <Input
                autoFocus
                placeholder="Themenname..."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubject();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewSubjectName("");
                  }
                }}
                className="bg-slate-800/50 border-slate-700 text-slate-200 h-9 text-sm"
              />
              {availableSubjectsToAdd.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <div className="text-xs text-slate-500 px-1">Vorschläge:</div>
                  {availableSubjectsToAdd.slice(0, 4).map((subject) => {
                    const Icon = getSubjectIcon(subject);
                    return (
                      <button
                        key={subject}
                        onClick={() => {
                          onAddSubject(subject);
                          setIsAdding(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <Icon
                          size={14}
                          style={{ color: getSubjectColor(subject) }}
                        />
                        <span className="text-sm">
                          {SUBJECT_CONFIGS[subject]?.name || subject}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddSubject}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-8"
                >
                  Hinzufügen
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setNewSubjectName("");
                  }}
                  className="text-slate-400 hover:text-white h-8"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsAdding(true)}
                  className={cn(
                    "bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-dashed border-slate-600 hover:border-indigo-500 transition-all",
                    collapsed ? "w-12 h-12 p-0" : "w-full h-10",
                  )}
                  variant="ghost"
                >
                  <Plus size={18} className={collapsed ? "" : "mr-2"} />
                  {!collapsed && "Neues Thema"}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent
                  side="right"
                  className="bg-slate-800 border-slate-700"
                >
                  <p>Neues Thema hinzufügen</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-slate-700/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleCollapse}
                variant="ghost"
                className={cn(
                  "text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all",
                  collapsed ? "w-12 h-10 p-0 mx-auto" : "w-full h-9",
                )}
              >
                {collapsed ? (
                  <CaretRight size={18} />
                ) : (
                  <>
                    <CaretLeft size={18} className="mr-2" />
                    Minimieren
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent
                side="right"
                className="bg-slate-800 border-slate-700"
              >
                <p>Sidebar erweitern</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

export const Sidebar = memo(SidebarInner);
