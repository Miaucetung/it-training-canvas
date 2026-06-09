import { supabase } from "@/lib/supabase";
import type { UserProgress } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef } from "react";

const EXAM_STORAGE_KEY = "ccna-exam-weak-questions";

// ─── Upload all local progress to Supabase ───────────────────
async function pushProgressToSupabase(
  userId: string,
  progress: Record<string, UserProgress>,
) {
  const rows = Object.values(progress).map((p) => ({
    user_id: userId,
    path_id: p.pathId,
    data: p as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length === 0) return;
  await supabase
    .from("user_progress")
    .upsert(rows, { onConflict: "user_id,path_id" });
}

// ─── Download all Supabase progress rows ─────────────────────
async function fetchProgressFromSupabase(
  userId: string,
): Promise<Record<string, UserProgress>> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("path_id, data")
    .eq("user_id", userId);
  if (error || !data) return {};
  const result: Record<string, UserProgress> = {};
  for (const row of data) {
    result[row.path_id] = row.data as UserProgress;
  }
  return result;
}

// ─── Exam weak questions sync ─────────────────────────────────
async function pushWeakToSupabase(userId: string, ids: Set<string>) {
  await supabase
    .from("exam_weak_questions")
    .upsert(
      { user_id: userId, question_ids: [...ids], updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
}

async function fetchWeakFromSupabase(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("exam_weak_questions")
    .select("question_ids")
    .eq("user_id", userId)
    .single();
  return new Set<string>(data?.question_ids ?? []);
}

// ─── Hook ─────────────────────────────────────────────────────
export function useProgressSync(
  user: User | null,
  userProgress: Record<string, UserProgress>,
  setUserProgress: (p: Record<string, UserProgress>) => void,
) {
  const prevUserId = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On sign-in: fetch remote data and merge (remote wins on conflict).
  // Also push any local data that doesn't exist remotely (migration).
  useEffect(() => {
    if (!user) {
      prevUserId.current = null;
      return;
    }
    if (prevUserId.current === user.id) return;
    prevUserId.current = user.id;

    (async () => {
      const remote = await fetchProgressFromSupabase(user.id);
      // Merge: remote wins, but local paths not in remote are migrated up.
      const merged = { ...userProgress, ...remote };
      setUserProgress(merged);

      // Push any local-only paths to remote (one-time migration).
      const localOnly = Object.values(userProgress).filter(
        (p) => !remote[p.pathId],
      );
      if (localOnly.length > 0) {
        const toMigrate: Record<string, UserProgress> = {};
        for (const p of localOnly) toMigrate[p.pathId] = p;
        await pushProgressToSupabase(user.id, toMigrate);
      }

      // Sync exam weak questions.
      const localWeakRaw = localStorage.getItem(EXAM_STORAGE_KEY);
      const localWeak: Set<string> = localWeakRaw
        ? new Set(JSON.parse(localWeakRaw))
        : new Set();
      const remoteWeak = await fetchWeakFromSupabase(user.id);
      const mergedWeak = new Set([...localWeak, ...remoteWeak]);
      localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify([...mergedWeak]));
      if (mergedWeak.size !== remoteWeak.size) {
        await pushWeakToSupabase(user.id, mergedWeak);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Debounced sync: whenever userProgress changes while signed in, push to Supabase.
  const syncProgress = useCallback(
    (progress: Record<string, UserProgress>) => {
      if (!user) return;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        pushProgressToSupabase(user.id, progress);
      }, 2000);
    },
    [user],
  );

  // Watch userProgress and trigger debounced sync.
  const progressRef = useRef(userProgress);
  progressRef.current = userProgress;

  useEffect(() => {
    if (!user) return;
    syncProgress(userProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProgress, user?.id]);

  return { pushWeakToSupabase: user ? (ids: Set<string>) => pushWeakToSupabase(user.id, ids) : null };
}
