// ============================================================
// TopicDetailPanel — Phase 6c-3 / 6c-3a
// Renders the full detail view for a single Topic:
//   - Concepts (ordered, full Markdown rendering via react-markdown)
//   - Quizzes (via adapters.ts — FIRST production use)
//   - Cross-References (via CONCEPT_BRIDGES, read-only)
//   - Close button + ESC key
// Gamification, canvas-integration: Phase 6c-4 / 6c-5
// ============================================================

import { extractQuizzes, getTopicQuizIds } from "@/lib/content/adapters";
import { CONCEPT_BRIDGES } from "@/lib/content/cross-references";
import type { CertificationModule, Topic } from "@/lib/content/types";
import type { Quiz, ScoreResult } from "@/lib/types";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  Link,
  Question,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IPv6CalculatorDialog } from "./IPv6CalculatorDialog";
import { QuizDialog } from "./QuizDialog";
import { SubnettingDrillDialog } from "./SubnettingDrillDialog";
import { VerkabelungTrainerDialog } from "./VerkabelungTrainerDialog";
import { VlanSimulatorDialog } from "./VlanSimulatorDialog";
import { SubnetSegmentationTool } from "./SubnetSegmentationTool";

interface TopicDetailPanelProps {
  topic: Topic;
  module: CertificationModule;
  theme: "light" | "dark";
  onClose: () => void;
}

// ── Cross-reference helpers ──────────────────────────────────
// adapters.ts has no cross-reference functions — we read CONCEPT_BRIDGES
// directly here. Noted as Architektur-Befund in Phase-6c-3 report.

interface TopicCrossRef {
  conceptId: string;
  conceptTitle: string;
  otherModuleId: string;
  bridgeNote: string;
  direction: "outbound" | "inbound";
}

function getCrossRefsForTopic(topic: Topic, moduleId: string): TopicCrossRef[] {
  const refs: TopicCrossRef[] = [];
  for (const bridge of CONCEPT_BRIDGES) {
    if (
      bridge.sourceModuleId === moduleId &&
      topic.conceptIds.includes(bridge.sourceConceptId)
    ) {
      refs.push({
        conceptId: bridge.sourceConceptId,
        conceptTitle: bridge.sourceConceptId,
        otherModuleId: bridge.targetModuleId,
        bridgeNote: bridge.bridgeNote,
        direction: "outbound",
      });
    } else if (
      bridge.targetModuleId === moduleId &&
      topic.conceptIds.includes(bridge.targetConceptId)
    ) {
      refs.push({
        conceptId: bridge.targetConceptId,
        conceptTitle: bridge.targetConceptId,
        otherModuleId: bridge.sourceModuleId,
        bridgeNote: bridge.bridgeNote,
        direction: "inbound",
      });
    }
  }
  return refs;
}

// ── Component ────────────────────────────────────────────────

export function TopicDetailPanel({
  topic,
  module,
  theme,
  onClose,
}: TopicDetailPanelProps) {
  const dark = theme === "dark";
  const [drillOpen, setDrillOpen] = useState(false);
  const [ipv6Open, setIpv6Open] = useState(false);
  const [verkabelungOpen, setVerkabelungOpen] = useState(false);
  const [vlanSimOpen, setVlanSimOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [lastResult, setLastResult] = useState<ScoreResult | null>(null);
  const hasSubnettingDrill = topic.conceptIds.includes("subnetting-drill");
  const hasIPv6Calculator = topic.conceptIds.includes("ipv6-calculator");
  const hasVerkabelungTrainer = topic.conceptIds.includes("verkabelung-trainer");
  const hasVlanSimulator = topic.conceptIds.includes("vlan-simulator");
  const hasSubnetSegTool = topic.conceptIds.includes("subnet-seg-tool");

  // ESC key support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── adapters.ts — FIRST PRODUCTION USE ──────────────────────
  // getTopicQuizIds: returns quiz IDs linked to this topic
  const quizIds = getTopicQuizIds(module, topic.id);
  // extractQuizzes: returns full quiz map for the module
  const allQuizzes = extractQuizzes(module);
  const topicQuizzes = quizIds.map((qid) => allQuizzes[qid]).filter(Boolean);

  // ── Concepts ─────────────────────────────────────────────────
  const concepts = topic.conceptIds
    .map((id) => module.concepts[id])
    .filter(Boolean);

  // ── Cross-References ─────────────────────────────────────────
  const crossRefs = getCrossRefsForTopic(topic, module.id);

  // ── Module label for module ID ────────────────────────────────
  const moduleLabel: Record<string, string> = {
    ccna: "CCNA 200-301",
    "az-900": "AZ-900",
    "comptia-network-plus": "Network+ N10-009",
  };
  const getModLabel = (id: string) => moduleLabel[id] ?? id;

  return (
    <div
      className={`h-full flex flex-col border-l ${
        dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
      }`}
      role="region"
      aria-label={`Topic-Detail: ${topic.title}`}
    >
      {/* ── Header ── */}
      <div
        className={`flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 ${
          dark ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Schließen"
          className={`p-1.5 rounded-lg transition-colors ${
            dark
              ? "text-slate-400 hover:text-white hover:bg-slate-700"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <h2
            className={`font-semibold text-sm truncate ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            {topic.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {topic.estimatedMinutes} Min. · {concepts.length} Konzepte
            {topicQuizzes.length > 0 &&
              ` · ${topicQuizzes.reduce((s, q) => s + q.questions.length, 0)} Fragen`}
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Panel schließen"
          className={`p-1.5 rounded-lg transition-colors ${
            dark
              ? "text-slate-400 hover:text-white hover:bg-slate-700"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Description */}
        {topic.description && (
          <p
            className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}
          >
            {topic.description}
          </p>
        )}

        {/* ── Subnetting Drill CTA (interaktiv, 30 generierte Aufgaben) ── */}
        {hasSubnettingDrill && (
          <section>
            <button
              type="button"
              onClick={() => setDrillOpen(true)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                dark
                  ? "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-200"
                  : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-800"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  dark
                    ? "bg-indigo-500/30 text-indigo-200"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                <Calculator size={18} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">
                  Interaktiver Subnetting-Drill
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  30 automatisch generierte Aufgaben — Subnetz, Broadcast,
                  Hostbereich, Magic Number
                </div>
              </div>
              <span
                className={`text-xs ${dark ? "text-indigo-300" : "text-indigo-600"}`}
              >
                Starten →
              </span>
            </button>
          </section>
        )}

        {/* ── IPv6 Rechner & Drill CTA ── */}
        {hasIPv6Calculator && (
          <section>
            <button
              type="button"
              onClick={() => setIpv6Open(true)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                dark
                  ? "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-200"
                  : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-800"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  dark ? "bg-indigo-500/30 text-indigo-200" : "bg-indigo-100 text-indigo-700"
                }`}
              >
                <Calculator size={18} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">IPv6 Rechner &amp; Drill</div>
                <div className="text-xs opacity-80 mt-0.5">
                  Adress-Analyse · EUI-64 · Segmentierung · Zufalls-Drill
                </div>
              </div>
              <span className={`text-xs ${dark ? "text-indigo-300" : "text-indigo-600"}`}>
                Starten →
              </span>
            </button>
          </section>
        )}

        {/* ── Verkabelungs-Trainer CTA ── */}
        {hasVerkabelungTrainer && (
          <section>
            <button
              type="button"
              onClick={() => setVerkabelungOpen(true)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                dark
                  ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${
                  dark ? "bg-emerald-500/30 text-emerald-200" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                🔌
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Verkabelungs-Trainer</div>
                <div className="text-xs opacity-80 mt-0.5">
                  Pin-Belegung T568A/B · Kabeltyp-Wizard · Kategorie-Vergleich
                </div>
              </div>
              <span className={`text-xs ${dark ? "text-emerald-300" : "text-emerald-600"}`}>
                Starten →
              </span>
            </button>
          </section>
        )}

        {/* ── VLAN-Simulator CTA ── */}
        {hasVlanSimulator && (
          <section>
            <button
              type="button"
              onClick={() => setVlanSimOpen(true)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                dark
                  ? "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-200"
                  : "bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-800"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${
                  dark ? "bg-cyan-500/30 text-cyan-200" : "bg-cyan-100 text-cyan-700"
                }`}
              >
                🌐
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">VLAN-Simulator</div>
                <div className="text-xs opacity-80 mt-0.5">
                  802.1Q Frame-Vivisektor · Switch-Simulator · Trunk-Animation
                </div>
              </div>
              <span className={`text-xs ${dark ? "text-cyan-300" : "text-cyan-600"}`}>
                Starten →
              </span>
            </button>
          </section>
        )}

        {/* ── Subnetz-Segmentierungsplaner (inline) ── */}
        {hasSubnetSegTool && (
          <section>
            <SubnetSegmentationTool dark={dark} />
          </section>
        )}

        {/* ── Concepts ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen
              size={14}
              className={dark ? "text-indigo-400" : "text-indigo-500"}
            />
            <h3
              className={`text-xs font-semibold uppercase tracking-wider ${
                dark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Konzepte ({concepts.length})
            </h3>
          </div>

          {concepts.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Keine Konzepte verknüpft.
            </p>
          ) : (
            <div className="space-y-2">
              {concepts.map((concept, idx) => (
                <div
                  key={concept.id}
                  className={`rounded-xl border p-4 ${
                    dark
                      ? "bg-slate-800/60 border-slate-700/50"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        dark
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm ${
                          dark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {concept.title}
                      </div>
                      {/* Phase 6c-3a: full Markdown rendering with custom components */}
                      <div className="mt-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1
                                className={`text-base font-bold mt-3 mb-1 ${dark ? "text-white" : "text-slate-900"}`}
                              >
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2
                                className={`text-sm font-semibold mt-3 mb-1 ${dark ? "text-slate-100" : "text-slate-800"}`}
                              >
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3
                                className={`text-xs font-semibold uppercase tracking-wide mt-2 mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}
                              >
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p
                                className={`text-xs leading-relaxed my-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
                              >
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong
                                className={`font-semibold ${dark ? "text-white" : "text-slate-900"}`}
                              >
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            ul: ({ children }) => (
                              <ul
                                className={`list-disc list-inside text-xs space-y-0.5 my-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
                              >
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol
                                className={`list-decimal list-inside text-xs space-y-0.5 my-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
                              >
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed">{children}</li>
                            ),
                            code: ({ children, className }) => {
                              const isBlock = className?.includes("language-");
                              return isBlock ? (
                                <code
                                  className={`block text-xs rounded-lg p-3 my-2 font-mono overflow-x-auto ${dark ? "bg-slate-900 text-slate-200 border border-slate-700" : "bg-slate-100 text-slate-800 border border-slate-200"}`}
                                >
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className={`text-xs font-mono px-1 py-0.5 rounded ${dark ? "bg-slate-700 text-indigo-300" : "bg-slate-100 text-indigo-700"}`}
                                >
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre
                                className={`text-xs rounded-lg p-3 my-2 font-mono overflow-x-auto ${dark ? "bg-slate-900 border border-slate-700" : "bg-slate-100 border border-slate-200"}`}
                              >
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote
                                className={`border-l-2 pl-3 my-2 italic text-xs ${dark ? "border-indigo-500 text-slate-400" : "border-indigo-400 text-slate-500"}`}
                              >
                                {children}
                              </blockquote>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-2">
                                <table className="w-full text-xs border-collapse">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead
                                className={
                                  dark ? "bg-slate-700" : "bg-slate-100"
                                }
                              >
                                {children}
                              </thead>
                            ),
                            th: ({ children }) => (
                              <th
                                className={`px-2 py-1 text-left font-semibold border ${dark ? "border-slate-600 text-slate-200" : "border-slate-200 text-slate-700"}`}
                              >
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td
                                className={`px-2 py-1 border ${dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                              >
                                {children}
                              </td>
                            ),
                            hr: () => (
                              <hr
                                className={`my-3 ${dark ? "border-slate-700" : "border-slate-200"}`}
                              />
                            ),
                          }}
                        >
                          {concept.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* "Verstanden"-Button — disabled, Gamification in Phase 6c-4 */}
                  <div className="mt-3 flex justify-end">
                    <button
                      disabled
                      aria-disabled="true"
                      title="XP-System wird in Phase 6c-4 angebunden"
                      className={`text-xs px-3 py-1 rounded-lg border transition-colors opacity-50 cursor-not-allowed ${
                        dark
                          ? "border-slate-600 text-slate-500"
                          : "border-slate-300 text-slate-400"
                      }`}
                    >
                      Verstanden
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Quizzes ── */}
        {topicQuizzes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Question
                size={14}
                className={dark ? "text-amber-400" : "text-amber-500"}
              />
              <h3
                className={`text-xs font-semibold uppercase tracking-wider ${
                  dark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Quiz ({topicQuizzes.reduce((s, q) => s + q.questions.length, 0)}{" "}
                Fragen)
              </h3>
            </div>

            <div className="space-y-2">
              {topicQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`rounded-xl border p-4 ${
                    dark
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div
                    className={`font-medium text-sm ${
                      dark ? "text-amber-200" : "text-amber-800"
                    }`}
                  >
                    {quiz.title}
                  </div>
                  <div className="text-xs mt-1 text-slate-500">
                    {quiz.questions.length} Fragen · Bestehensgrenze{" "}
                    {quiz.passingScore}%
                  </div>

                  {/* Quiz questions preview */}
                  <div className="mt-3 space-y-1.5">
                    {quiz.questions.slice(0, 3).map((q, i) => (
                      <div
                        key={q.id}
                        className={`text-xs rounded-lg px-3 py-2 ${
                          dark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span className="opacity-50">{i + 1}. </span>
                        {q.text}
                      </div>
                    ))}
                    {quiz.questions.length > 3 && (
                      <p className="text-xs text-slate-500 text-center py-1">
                        + {quiz.questions.length - 3} weitere Fragen
                      </p>
                    )}
                  </div>

                  {/* Start-Quiz-Button */}
                  <button
                    onClick={() => { setLastResult(null); setActiveQuiz(quiz); }}
                    className={`mt-3 w-full text-xs py-2 rounded-lg border transition-colors ${
                      dark
                        ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                        : "border-amber-300 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    Quiz starten →
                  </button>
                  {lastResult && (
                    <p className={`mt-1.5 text-center text-xs ${lastResult.passed ? (dark ? "text-emerald-400" : "text-emerald-600") : (dark ? "text-red-400" : "text-red-600")}`}>
                      Letztes Ergebnis: {lastResult.score}% — {lastResult.passed ? "Bestanden ✓" : "Nicht bestanden ✗"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Cross-References ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Link
              size={14}
              className={dark ? "text-emerald-400" : "text-emerald-500"}
            />
            <h3
              className={`text-xs font-semibold uppercase tracking-wider ${
                dark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Cross-References ({crossRefs.length})
            </h3>
          </div>

          {crossRefs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Keine Cross-References für dieses Topic.
            </p>
          ) : (
            <div className="space-y-2">
              {crossRefs.map((ref, idx) => (
                <div
                  key={`${ref.conceptId}-${idx}`}
                  className={`rounded-xl border p-3 ${
                    dark
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`text-xs font-medium flex-shrink-0 ${
                        dark ? "text-emerald-300" : "text-emerald-700"
                      }`}
                    >
                      → {getModLabel(ref.otherModuleId)}
                    </div>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      dark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {ref.bridgeNote}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 opacity-70">
                    Konzept: {ref.conceptId}
                    {ref.direction === "inbound" && " (von anderem Modul)"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {hasSubnettingDrill && (
        <SubnettingDrillDialog
          open={drillOpen}
          onClose={() => setDrillOpen(false)}
          theme={theme}
        />
      )}

      {hasIPv6Calculator && (
        <IPv6CalculatorDialog
          open={ipv6Open}
          onClose={() => setIpv6Open(false)}
          theme={theme}
        />
      )}

      {hasVerkabelungTrainer && verkabelungOpen && (
        <VerkabelungTrainerDialog
          dark={dark}
          onClose={() => setVerkabelungOpen(false)}
        />
      )}

      {hasVlanSimulator && vlanSimOpen && (
        <VlanSimulatorDialog
          dark={dark}
          onClose={() => setVlanSimOpen(false)}
        />
      )}

      {activeQuiz && (
        <QuizDialog
          quiz={activeQuiz}
          theme={theme}
          onComplete={(result) => {
            setLastResult(result);
            setActiveQuiz(null);
          }}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
