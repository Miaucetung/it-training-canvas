// ============================================================
// TopicListPanel — Phase 6c-2
// Renders the topic list of a CertificationModule loaded via
// content-loader.ts. Acts as the landing view when a catalog
// module (CCNA, AZ-900, Network+) is selected in the Sidebar.
// Topic-Detail-Ansicht folgt in Phase 6c-3.
// ============================================================

import { loadModule } from "@/lib/content/content-loader";
import type { CertificationModule, Topic } from "@/lib/content/types";
import {
  BookOpen,
  CheckCircle,
  Clock,
  ListBullets,
  Question,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface TopicListPanelProps {
  moduleId: string;
  theme: "light" | "dark";
  /** Called when user clicks a topic. Receives the Topic and the loaded module. */
  onTopicClick?: (topic: Topic, module: CertificationModule) => void;
}

export function TopicListPanel({ moduleId, theme, onTopicClick }: TopicListPanelProps) {
  const [mod, setMod] = useState<CertificationModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMod(null);

    loadModule(moduleId)
      .then((m) => {
        setMod(m);
        setLoading(false);
      })
      .catch(() => {
        setError("Modul nicht gefunden");
        setLoading(false);
      });
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Modul wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !mod) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-3">
            <Question size={24} className="text-red-400" />
          </div>
          <p className="text-red-400 text-sm font-medium">Modul nicht gefunden</p>
          <p className="text-slate-500 text-xs mt-1">moduleId: {moduleId}</p>
        </div>
      </div>
    );
  }

  const totalConcepts = mod.topics.reduce(
    (sum, t) => sum + t.conceptIds.length,
    0,
  );
  const totalQuestions = mod.topics.reduce((sum, t) => {
    return (
      sum +
      t.quizIds.reduce(
        (qSum, qId) => qSum + (mod.quizzes[qId]?.questions?.length ?? 0),
        0,
      )
    );
  }, 0);
  const totalMinutes = mod.topics.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <div
      className={`h-full overflow-y-auto ${
        theme === "dark" ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-indigo-400" weight="fill" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                {mod.title}
              </h1>
              <p
                className={`text-sm mt-1 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {mod.subtitle}
              </p>
            </div>
          </div>

          {/* Module Stats */}
          <div className="flex gap-6 mt-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ListBullets size={14} />
              <span>{mod.topics.length} Topics</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle size={14} />
              <span>{totalConcepts} Konzepte</span>
            </div>
            {totalQuestions > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Question size={14} />
                <span>{totalQuestions} Fragen</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock size={14} />
              <span>~{Math.round(totalMinutes / 60)} Std.</span>
            </div>
          </div>
        </div>

        {/* Topic List */}
        <div>
          <h2
            className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Themen ({mod.topics.length})
          </h2>

          <div className="space-y-2">
            {mod.topics.map((topic, index) => {
              const conceptCount = topic.conceptIds.length;
              const quizQuestionCount = topic.quizIds.reduce(
                (sum, qId) =>
                  sum + (mod.quizzes[qId]?.questions?.length ?? 0),
                0,
              );

              return (
                <div
                  key={topic.id}
                  role="button"
                  tabIndex={0}
                  title={
                    onTopicClick
                      ? `${topic.title} öffnen`
                      : "Detail-Ansicht in Kürze verfügbar"
                  }
                  aria-disabled={onTopicClick ? undefined : "true"}
                  onClick={() => onTopicClick && mod && onTopicClick(topic, mod)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && onTopicClick && mod) {
                      e.preventDefault();
                      onTopicClick(topic, mod);
                    }
                  }}
                  className={`group rounded-xl border p-4 transition-colors ${
                    onTopicClick
                      ? "cursor-pointer"
                      : "cursor-default"
                  } ${
                    theme === "dark"
                      ? "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Index Badge */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        theme === "dark"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Topic Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {topic.title}
                      </div>
                      {topic.description && (
                        <div
                          className={`text-xs mt-0.5 leading-relaxed ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {topic.description}
                        </div>
                      )}

                      {/* Topic Meta */}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-xs text-slate-500">
                          {conceptCount} Konzepte
                        </span>
                        {quizQuestionCount > 0 && (
                          <span className="text-xs text-slate-500">
                            {quizQuestionCount} Fragen
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {topic.estimatedMinutes} Min.
                        </span>
                      </div>
                    </div>

                    {/* "Coming soon" indicator — hidden when onTopicClick is active */}
                    {!onTopicClick && (
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                        theme === "dark"
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      Bald
                    </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
