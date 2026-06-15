import { supabase } from "@/lib/supabase";
import { getProfile, updateDisplayName } from "@/lib/profile";
import type { LearningPath, UserProgress } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { SignOut, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  user: User;
  dark: boolean;
  learningPaths: Record<string, LearningPath>;
  userProgress: Record<string, UserProgress>;
  onClose: () => void;
}

export function AccountDialog({
  user,
  dark,
  learningPaths,
  userProgress,
  onClose,
}: Props) {
  const [displayName, setDisplayName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const base = dark
    ? "bg-zinc-900 border-zinc-700 text-zinc-100"
    : "bg-white border-zinc-200 text-zinc-900";

  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${
    dark
      ? "bg-zinc-800 border-zinc-600 text-zinc-100 placeholder-zinc-500 focus:border-sky-500"
      : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-sky-500"
  }`;
  const muted = dark ? "text-zinc-500" : "text-zinc-400";
  const divider = dark ? "bg-zinc-700" : "bg-zinc-100";

  useEffect(() => {
    let active = true;
    getProfile(user.id).then((p) => {
      if (!active) return;
      const name = p?.display_name ?? "";
      setDisplayName(name);
      setInitialName(name);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user.id]);

  // ── Fortschritt aus den Lernpfaden aggregieren ──────────────
  const progress = useMemo(() => {
    const rows = Object.values(userProgress)
      .map((p) => {
        const path = learningPaths[p.pathId];
        if (!path) return null;
        const total = path.steps.length || 1;
        const done = p.completedSteps.length;
        return {
          id: p.pathId,
          title: path.title,
          done,
          total,
          pct: Math.round((done / total) * 100),
          lastActivityAt: p.lastActivityAt,
          quizScores: Object.values(p.quizScores),
          overallScore: p.overallScore,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);

    const allQuiz = rows.flatMap((r) => r.quizScores);
    const avgQuiz =
      allQuiz.length > 0
        ? Math.round(allQuiz.reduce((s, q) => s + q.percentage, 0) / allQuiz.length)
        : null;
    const totalPoints = rows.reduce((s, r) => s + r.overallScore, 0);

    return { rows, avgQuiz, totalPoints };
  }, [userProgress, learningPaths]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { profile, error } = await updateDisplayName(user.id, displayName);
    setSaving(false);
    if (profile) {
      setInitialName(profile.display_name ?? "");
      toast.success("Profil gespeichert.");
    } else {
      toast.error(`Speichern fehlgeschlagen: ${error ?? "unbekannt"}`, {
        duration: 8000,
      });
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    onClose();
  }

  const dirty = displayName.trim() !== initialName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`flex max-h-[90vh] w-full max-w-sm flex-col rounded-2xl border shadow-2xl ${base}`}>
        {/* Header */}
        <div className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${dark ? "border-zinc-700" : "border-zinc-100"}`}>
          <h2 className="text-base font-semibold">Mein Konto</h2>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${dark ? "hover:bg-zinc-700" : "hover:bg-zinc-100"}`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          {/* Profil */}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-bold ${
                  dark ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {(displayName || user.email || "?")[0]?.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName || "—"}</p>
                <p className={`truncate text-xs ${muted}`}>{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                Anzeigename
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={60}
                  value={loading ? "" : displayName}
                  disabled={loading}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={loading ? "Lädt…" : "Dein Name"}
                  className={inputCls}
                />
                <button
                  type="submit"
                  disabled={saving || loading || !dirty}
                  className="shrink-0 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-40"
                >
                  {saving ? "…" : "Speichern"}
                </button>
              </div>
            </div>
          </form>

          <div className={`h-px ${divider}`} />

          {/* Fortschritt */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Dein Fortschritt</h3>
              {progress.rows.length > 0 && (
                <span className={`text-xs ${muted}`}>
                  {progress.rows.length} Pfad{progress.rows.length === 1 ? "" : "e"}
                  {progress.avgQuiz !== null && ` · Ø Quiz ${progress.avgQuiz}%`}
                  {progress.totalPoints > 0 && ` · ${progress.totalPoints} Pkt`}
                </span>
              )}
            </div>

            {progress.rows.length === 0 ? (
              <p className={`text-xs ${muted}`}>
                Noch keinen Lernpfad begonnen. Starte oben über „Lernpfade", dann
                erscheint dein Fortschritt hier — geräteübergreifend synchronisiert.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {progress.rows.map((r) => (
                  <div key={r.id} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-medium">{r.title}</span>
                      <span className={`shrink-0 text-[11px] tabular-nums ${muted}`}>
                        {r.done}/{r.total} · {r.pct}%
                      </span>
                    </div>
                    <div className={`h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`h-px ${divider}`} />

          <button
            type="button"
            onClick={handleSignOut}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              dark ? "text-red-300 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50"
            }`}
          >
            <SignOut size={16} />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
