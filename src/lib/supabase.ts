import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ─── DB row types ─────────────────────────────────────────────
export interface ProgressRow {
  id: string;
  user_id: string;
  path_id: string;
  data: Record<string, unknown>;
  updated_at: string;
}

export interface ExamWeakRow {
  id: string;
  user_id: string;
  question_ids: string[];
  updated_at: string;
}
