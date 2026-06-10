import { supabase } from "@/lib/supabase";
import { X } from "@phosphor-icons/react";
import { useState } from "react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

export function SetPasswordDialog({ dark, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const base = dark
    ? "bg-zinc-900 border-zinc-700 text-zinc-100"
    : "bg-white border-zinc-200 text-zinc-900";

  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${
    dark
      ? "bg-zinc-800 border-zinc-600 text-zinc-100 placeholder-zinc-500 focus:border-sky-500"
      : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-sky-500"
  }`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl ${base}`}>
        <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? "border-zinc-700" : "border-zinc-100"}`}>
          <h2 className="text-base font-semibold">Neues Passwort setzen</h2>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${dark ? "hover:bg-zinc-700" : "hover:bg-zinc-100"}`}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {success ? (
            <div className={`rounded-lg px-3 py-2 text-sm ${dark ? "bg-green-900/30 text-green-300" : "bg-green-50 text-green-700"}`}>
              Passwort erfolgreich geändert. Du wirst weitergeleitet…
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Neues Passwort
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className={inputCls}
                />
              </div>

              {error && (
                <div className={`rounded-lg px-3 py-2 text-sm ${dark ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-600"}`}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-50"
              >
                {loading ? "Bitte warten…" : "Passwort speichern"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
