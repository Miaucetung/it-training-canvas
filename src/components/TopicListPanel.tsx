// ============================================================
// TopicListPanel — Phase 6c-2
// Renders the topic list of a CertificationModule loaded via
// content-loader.ts. Acts as the landing view when a catalog
// module (CCNA, AZ-900, Network+) is selected in the Sidebar.
// Topic-Detail-Ansicht folgt in Phase 6c-3.
//
// Erweiterung: Sofort-Suche (durchsucht auch Concept-Titel/Tags,
// nicht nur Themen-Titel) + Kategorie-Gruppen mit Sticky-Headern,
// damit man z. B. "STP" tippen kann statt raten zu müssen, in
// welchem Themen-Block es steckt. Fortschritts-Ring pro Karte ist
// optional (nur sichtbar, wenn der Aufrufer quizScores mitgibt).
// ============================================================

import { loadModule } from "@/lib/content/content-loader";
import type { CertificationModule, Topic } from "@/lib/content/types";
import type { ScoreResult } from "@/lib/types";
import {
  BookOpen,
  CaretRight,
  CheckCircle,
  Clock,
  ListBullets,
  MagnifyingGlass,
  Question,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

interface TopicListPanelProps {
  moduleId: string;
  theme: "light" | "dark";
  /** Called when user clicks a topic. Receives the Topic and the loaded module. */
  onTopicClick?: (topic: Topic, module: CertificationModule) => void;
  /** Startet ein Tool aus dem Schnellstart (Tool-IDs aus dem App-Tools-Menü). */
  onLaunchTool?: (toolId: string) => void;
  /** Quiz-Ergebnisse (Quiz-ID → Score) für den Fortschritts-Ring pro Karte. Optional. */
  quizScores?: Record<string, ScoreResult>;
}

// ── Kategorie-Gruppen (nur Anzeige/Navigation, keine Datenmodell-Änderung) ──
// Modul-ID → Gruppen-Label → Topic-IDs. Module ohne Eintrag zeigen weiterhin
// die flache Karten-Liste ohne Kategorie-Chips (kein Verhaltensbruch für
// AZ-900/Network+, solange die für die noch keine Gruppen definiert sind).
const CATEGORY_GROUPS: Record<string, Record<string, string[]>> = {
  ccna: {
    Fundamentals: ["networking-fundamentals", "ios-cli"],
    Adressierung: ["ipv4-addressing", "subnet-segmentation", "ipv6"],
    "Switching & Routing": [
      "switching-vlans",
      "stp",
      "etherchannel",
      "vlan-advanced",
      "routing-ospf",
      "fhrp",
    ],
    Infrastruktur: ["verkabelung", "glasfaser", "wlan", "wan"],
    "Dienste & Management": ["dhcp-nat", "nat", "dns", "device-management", "qos"],
    Security: ["security", "acl"],
    "Advanced & Cloud": ["sdn-controller", "automation", "ccna-virtualization", "troubleshooting"],
  },
};

/** Durchsuchbarer Text pro Topic: Titel/Beschreibung/Tags + Titel/Tags aller referenzierten Concepts. */
function buildSearchHaystack(topic: Topic, mod: CertificationModule): string {
  const conceptText = topic.conceptIds
    .map((id) => {
      const c = mod.concepts[id];
      return c ? `${c.title} ${(c.tags ?? []).join(" ")}` : "";
    })
    .join(" ");
  return `${topic.title} ${topic.description} ${(topic.tags ?? []).join(" ")} ${conceptText}`.toLowerCase();
}

/** Anteil bestandener Quizze eines Topics (0..1), oder null wenn keine Daten vorhanden. */
function getTopicProgress(
  topic: Topic,
  quizScores: Record<string, ScoreResult> | undefined,
): number | null {
  if (!quizScores || topic.quizIds.length === 0) return null;
  const passed = topic.quizIds.filter((id) => quizScores[id]?.passed).length;
  return passed / topic.quizIds.length;
}

function ProgressRing({ progress, theme }: { progress: number; theme: "light" | "dark" }) {
  const size = 26;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const trackColor = theme === "dark" ? "#334155" : "#e2e8f0";
  const doneColor = progress >= 1 ? "#22c55e" : "#6366f1";
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={doneColor}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 300ms ease" }}
      />
    </svg>
  );
}

export function TopicListPanel({
  moduleId,
  theme,
  onTopicClick,
  onLaunchTool,
  quizScores,
}: TopicListPanelProps) {
  const [mod, setMod] = useState<CertificationModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMod(null);
    setSearchQuery("");
    setActiveCategory("all");

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

  const categoryGroups = mod ? CATEGORY_GROUPS[mod.id] : undefined;

  // Haystack pro Topic-ID vorab berechnen (vermeidet Neuberechnung bei jedem Tastendruck)
  const haystacks = useMemo(() => {
    if (!mod) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const t of mod.topics) map.set(t.id, buildSearchHaystack(t, mod));
    return map;
  }, [mod]);

  const query = searchQuery.trim().toLowerCase();
  const isFiltering = query.length > 0 || activeCategory !== "all";

  const visibleTopics = useMemo(() => {
    if (!mod) return [];
    return mod.topics.filter((t) => {
      if (activeCategory !== "all") {
        const idsInCategory = categoryGroups?.[activeCategory] ?? [];
        if (!idsInCategory.includes(t.id)) return false;
      }
      if (query && !(haystacks.get(t.id) ?? "").includes(query)) return false;
      return true;
    });
  }, [mod, activeCategory, query, categoryGroups, haystacks]);

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

  function renderCard(topic: Topic, index: number) {
    const conceptCount = topic.conceptIds.length;
    const quizQuestionCount = topic.quizIds.reduce(
      (sum, qId) => sum + (mod!.quizzes[qId]?.questions?.length ?? 0),
      0,
    );
    const progress = getTopicProgress(topic, quizScores);

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
        className={`group relative rounded-xl border p-4 transition-all duration-200 overflow-hidden ${
          onTopicClick
            ? "cursor-pointer hover:-translate-y-0.5"
            : "cursor-default"
        } ${
          theme === "dark"
            ? "bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-[0_4px_24px_rgba(99,102,241,0.18)]"
            : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-[0_4px_20px_rgba(99,102,241,0.12)]"
        }`}
      >
        {/* Akzentleiste links — erscheint beim Hover */}
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
        <div className="flex items-start gap-3">
          {/* Index Badge */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-shadow duration-200 ${
              theme === "dark"
                ? "bg-gradient-to-br from-indigo-500/35 to-indigo-500/10 ring-1 ring-indigo-400/25 text-indigo-300 group-hover:shadow-[0_0_14px_rgba(99,102,241,0.35)]"
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

          {/* Progress-Ring — nur wenn Score-Daten vorhanden */}
          {progress !== null && <ProgressRing progress={progress} theme={theme} />}

          {/* Chevron — erscheint beim Hover */}
          {onTopicClick && (
            <div className="self-center flex-shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
              <CaretRight
                size={16}
                className={theme === "dark" ? "text-indigo-400" : "text-indigo-500"}
              />
            </div>
          )}

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
  }

  return (
    <div
      className={`h-full overflow-y-auto @container ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-900 to-[#0a0f1e]"
          : "bg-gradient-to-b from-slate-50 to-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Module Header — Hero */}
        <div
          className={`relative mb-8 rounded-2xl border p-5 overflow-hidden ${
            theme === "dark"
              ? "border-indigo-500/20 bg-slate-800/40"
              : "border-indigo-100 bg-white"
          }`}
        >
          {/* Glow-Akzent oben rechts */}
          <div
            aria-hidden
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            }}
          />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/40 to-indigo-500/10 ring-1 ring-indigo-400/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_18px_rgba(99,102,241,0.25)]">
              <BookOpen size={24} className="text-indigo-300" weight="fill" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className={`text-2xl font-bold tracking-tight ${
                  theme === "dark"
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300"
                    : "text-slate-900"
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

          {/* Module Stats — Glas-Chips */}
          <div className="relative flex flex-wrap gap-2 mt-5">
            {[
              { icon: <ListBullets size={13} />, text: `${mod.topics.length} Topics` },
              { icon: <CheckCircle size={13} />, text: `${totalConcepts} Konzepte` },
              ...(totalQuestions > 0
                ? [{ icon: <Question size={13} />, text: `${totalQuestions} Fragen` }]
                : []),
              { icon: <Clock size={13} />, text: `~${Math.round(totalMinutes / 60)} Std.` },
            ].map((chip, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                  theme === "dark"
                    ? "border-slate-700/60 bg-slate-900/60 text-slate-300"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {chip.icon}
                {chip.text}
              </span>
            ))}
          </div>
        </div>

        {/* Tool-Schnellstart — nur wenn Platz da ist (breiter Container) */}
        {onLaunchTool && (
          <div className="hidden @3xl:flex flex-wrap gap-2 mb-8 -mt-3">
            {[
              { id: "subnetting-drill", name: "Subnetting-Drill" },
              { id: "vlan-simulator", name: "VLAN-Simulator" },
              { id: "stp-simulator", name: "STP-Simulator" },
              { id: "osi-simulator", name: "OSI-Simulator" },
              { id: "routing-simulator", name: "Routing-Simulator" },
              { id: "ipv6-calculator", name: "IPv6-Rechner" },
              { id: "cli-glossary", name: "CLI-Glossar" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => onLaunchTool(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  theme === "dark"
                    ? "border-slate-700/60 bg-slate-800/50 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 hover:shadow-[0_2px_12px_rgba(245,158,11,0.15)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600 hover:shadow-sm"
                }`}
              >
                <Wrench size={12} className={theme === "dark" ? "text-amber-400" : "text-amber-500"} />
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Sofort-Suche */}
        <div className="relative mb-4">
          <MagnifyingGlass
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Thema oder Begriff suchen — z. B. STP, ACL, DR/BDR..."
            className={`w-full rounded-xl border py-2.5 pl-10 pr-9 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
              theme === "dark"
                ? "border-slate-700/60 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 ${
                theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Kategorie-Chips — nur wenn für dieses Modul definiert */}
        {categoryGroups && (
          <div className="hidden @xl:flex flex-wrap gap-1.5 mb-6">
            {["all", ...Object.keys(categoryGroups)].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === cat
                    ? theme === "dark"
                      ? "border-indigo-400/60 bg-indigo-500/25 text-indigo-200"
                      : "border-indigo-300 bg-indigo-100 text-indigo-700"
                    : theme === "dark"
                    ? "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-slate-200"
                    : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
                }`}
              >
                {cat === "all" ? "Alle" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Topic List */}
        <div>
          {!isFiltering ? (
            <>
              <h2
                className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  theme === "dark" ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Themen ({mod.topics.length})
              </h2>

              {categoryGroups ? (
                <div className="flex flex-col gap-6">
                  {(() => {
                    const covered = new Set<string>();
                    const sections = Object.entries(categoryGroups).map(([label, ids]) => {
                      const topicsInGroup = mod.topics.filter((t) => ids.includes(t.id));
                      topicsInGroup.forEach((t) => covered.add(t.id));
                      return [label, topicsInGroup] as const;
                    });
                    // Sicherheitsnetz: Topics, die in keiner Gruppe gelistet sind
                    // (z. B. neu hinzugefügt, Mapping noch nicht aktualisiert),
                    // fallen NICHT unter den Tisch, sondern landen in "Weitere Themen".
                    const uncovered = mod.topics.filter((t) => !covered.has(t.id));
                    if (uncovered.length > 0) sections.push(["Weitere Themen", uncovered]);

                    return sections
                      .filter(([, topics]) => topics.length > 0)
                      .map(([label, topics]) => (
                        <div key={label}>
                          <h3
                            className={`sticky top-0 z-10 -mx-1 mb-2 px-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm ${
                              theme === "dark"
                                ? "text-indigo-300/90 bg-slate-900/70"
                                : "text-indigo-600 bg-slate-50/80"
                            }`}
                          >
                            {label}
                          </h3>
                          <div className="grid grid-cols-1 @3xl:grid-cols-2 @6xl:grid-cols-3 gap-2 @3xl:gap-3">
                            {topics.map((t) => renderCard(t, mod.topics.indexOf(t)))}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-1 @3xl:grid-cols-2 @6xl:grid-cols-3 gap-2 @3xl:gap-3">
                  {mod.topics.map((t, i) => renderCard(t, i))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2
                className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  theme === "dark" ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {visibleTopics.length} Treffer
              </h2>
              {visibleTopics.length > 0 ? (
                <div className="grid grid-cols-1 @3xl:grid-cols-2 @6xl:grid-cols-3 gap-2 @3xl:gap-3">
                  {visibleTopics.map((t) => renderCard(t, mod.topics.indexOf(t)))}
                </div>
              ) : (
                <div
                  className={`rounded-xl border border-dashed p-8 text-center text-sm ${
                    theme === "dark"
                      ? "border-slate-700 text-slate-500"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  Keine Themen gefunden für "{searchQuery}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
