import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SUBJECT_CONFIGS } from "@/lib/types";
import type { Topic } from "@/lib/content/types";
import { CaretRight, GraduationCap, Network } from "@phosphor-icons/react";
import React from "react";

interface AppBreadcrumbsProps {
  currentSubject: string;
  canvasView: boolean;
  canvasEngine?: "v1" | "v2";
  selectedTopic: Topic | null;
  activeLearningPathTitle?: string | null;
  onNavigateHome: () => void;
}

export const AppBreadcrumbs: React.FC<AppBreadcrumbsProps> = ({
  currentSubject,
  canvasView,
  canvasEngine = "v2",
  selectedTopic,
  activeLearningPathTitle,
  onNavigateHome,
}) => {
  const currentConfig = SUBJECT_CONFIGS[currentSubject];
  const subjectName = currentConfig?.name || currentSubject;

  const handleKeyActivation = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigateHome();
    }
  };

  return (
    <div className="h-8 md:h-9 shrink-0 flex items-center px-3 md:px-6 bg-surface/90 border-b border-border-default z-sticky text-xs text-text-muted backdrop-blur-xs select-none">
      <Breadcrumb aria-label="Brotkrumen">
        <BreadcrumbList className="text-xs sm:gap-1.5">
          {/* Ebene 1: Fach / Modul */}
          <BreadcrumbItem>
            {canvasView || selectedTopic || activeLearningPathTitle ? (
              <BreadcrumbLink
                href="#"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateHome();
                }}
                onKeyDown={handleKeyActivation}
                className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors font-medium cursor-pointer"
                title={`${subjectName} Themenübersicht`}
              >
                <GraduationCap size={14} className="shrink-0 text-accent-primary-fg" />
                <span className="truncate max-w-[130px] sm:max-w-none">{subjectName}</span>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-text-primary" aria-current="page">
                <GraduationCap size={14} className="shrink-0 text-accent-primary-fg" />
                <span className="truncate max-w-[160px] sm:max-w-none">{subjectName}</span>
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>

          {/* Separator */}
          {(canvasView || selectedTopic || activeLearningPathTitle) && (
            <BreadcrumbSeparator>
              <CaretRight size={12} className="text-text-muted opacity-60" />
            </BreadcrumbSeparator>
          )}

          {/* Fall A: Topologie-Canvas Ansicht */}
          {canvasView && (
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-text-primary" aria-current="page">
                <Network size={14} className="shrink-0 text-sky-400" />
                <span>Topologie-Canvas ({canvasEngine})</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}

          {/* Fall B: Aktiver Lernpfad */}
          {!canvasView && activeLearningPathTitle && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateHome();
                  }}
                  onKeyDown={handleKeyActivation}
                  className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  Lernpfade
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <CaretRight size={12} className="text-text-muted opacity-60" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-text-primary truncate max-w-[180px] sm:max-w-[280px]" aria-current="page">
                  {activeLearningPathTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}

          {/* Fall C: Detail-Thema geöffnet */}
          {!canvasView && !activeLearningPathTitle && selectedTopic && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateHome();
                  }}
                  onKeyDown={handleKeyActivation}
                  className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  title="Zurück zur Themenübersicht"
                >
                  Themenübersicht
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <CaretRight size={12} className="text-text-muted opacity-60" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-text-primary truncate max-w-[180px] sm:max-w-[320px]" aria-current="page">
                  {selectedTopic.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}

          {/* Fall D: Themenübersicht (Startseite) */}
          {!canvasView && !activeLearningPathTitle && !selectedTopic && (
            <>
              <BreadcrumbSeparator>
                <CaretRight size={12} className="text-text-muted opacity-60" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-text-primary" aria-current="page">
                  Themenübersicht
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
