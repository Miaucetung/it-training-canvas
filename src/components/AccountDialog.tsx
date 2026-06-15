import { supabase } from "@/lib/supabase";
import { getProfile, updateDisplayName } from "@/lib/profile";
import type { User } from "@supabase/supabase-js";
import { SignOut, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  user: User;
  dark: boolean;
  onClose: () => void;
}

export function AccountDialog({ user, dark, onClose }: Props) {
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
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl ${base}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? "border-zinc-700" : "border-zinc-100"}`}>
          <h2 className="text-base font-semibold">Mein Konto</h2>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${dark ? "hover:bg-zinc-700" : "hover:bg-zinc-100"}`}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4 p-5">
          {/* Avatar + email */}
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
              <p className={`truncate text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
              Anzeigename
            </label>
            <input
              type="text"
              maxLength={60}
              value={loading ? "" : displayName}
              disabled={loading}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={loading ? "Lädt…" : "Dein Name"}
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={saving || loading || !dirty}
            className="rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-50"
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>

          <div className={`my-1 h-px ${dark ? "bg-zinc-700" : "bg-zinc-100"}`} />

          <button
            type="button"
            onClick={handleSignOut}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              dark
                ? "text-red-300 hover:bg-red-900/30"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <SignOut size={16} />
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}
