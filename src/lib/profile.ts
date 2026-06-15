// ============================================================
// Profile — Anzeigename & Profildaten für angemeldete Nutzer.
// Liest/schreibt die public.profiles-Tabelle (RLS: nur eigene Zeile).
// Alle Funktionen scheitern leise (null), damit die App ohne Login
// und bei DB-Fehlern weiterläuft.
// ============================================================

import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  display_name: string | null;
  updated_at: string;
}

/** Lädt das Profil des Nutzers. null bei Fehler oder nicht vorhanden. */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("getProfile failed:", error.message);
      return null;
    }
    return (data as Profile) ?? null;
  } catch (e) {
    console.error("getProfile threw:", e);
    return null;
  }
}

export interface SaveResult {
  profile: Profile | null;
  error: string | null;
}

/** Setzt/aktualisiert den Anzeigenamen. error enthält die DB-Meldung bei Fehler. */
export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<SaveResult> {
  const trimmed = displayName.trim();
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, display_name: trimmed || null },
        { onConflict: "id" },
      )
      .select("id, display_name, updated_at")
      .single();
    if (error) {
      console.error("updateDisplayName failed:", error.message);
      return { profile: null, error: error.message };
    }
    return { profile: data as Profile, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("updateDisplayName threw:", e);
    return { profile: null, error: msg };
  }
}
