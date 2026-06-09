import { supabase } from "@/lib/supabase";
import { X } from "@phosphor-icons/react";
import { useState } from "react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

type Tab = "signin" | "signup";
type View = "form" | "reset";

export function AuthDialog({ dark, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("signin");
  const [view, setView] = useState<View>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (view === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setError(translateError(error.message));
      } else {
        setSuccess("Reset-Link gesendet. Bitte Postfach prüfen.");
      }
    } else if (tab === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        setSuccess("Bestätigungs-E-Mail gesendet. Bitte E-Mail-Adresse bestätigen, dann einloggen.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl ${base}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? "border-zinc-700" : "border-zinc-100"}`}>
          <h2 className="text-base font-semibold">
            {view === "reset" ? "Passwort zurücksetzen" : tab === "signin" ? "Anmelden" : "Registrieren"}
          </h2>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${dark ? "hover:bg-zinc-700" : "hover:bg-zinc-100"}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs — hidden in reset view */}
        {view === "form" && (
          <div className={`flex border-b ${dark ? "border-zinc-700" : "border-zinc-100"}`}>
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? dark
                      ? "border-b-2 border-sky-400 text-sky-400"
                      : "border-b-2 border-sky-600 text-sky-600"
                    : dark
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {t === "signin" ? "Anmelden" : "Registrieren"}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
              E-Mail
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              className={inputCls}
            />
          </div>

          {view === "form" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Passwort
                </label>
                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={() => { setView("reset"); setError(null); setSuccess(null); }}
                    className={`text-xs transition-colors ${dark ? "text-zinc-500 hover:text-sky-400" : "text-zinc-400 hover:text-sky-600"}`}
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "signup" ? "Mindestens 6 Zeichen" : "••••••••"}
                className={inputCls}
              />
            </div>
          )}

          {error && (
            <div className={`rounded-lg px-3 py-2 text-sm ${dark ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-600"}`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`rounded-lg px-3 py-2 text-sm ${dark ? "bg-green-900/30 text-green-300" : "bg-green-50 text-green-700"}`}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? "Bitte warten…" : view === "reset" ? "Reset-Link senden" : tab === "signin" ? "Anmelden" : "Konto erstellen"}
          </button>

          {view === "reset" ? (
            <button
              type="button"
              onClick={() => { setView("form"); setError(null); setSuccess(null); }}
              className={`text-center text-xs transition-colors ${dark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              ← Zurück zur Anmeldung
            </button>
          ) : (
            <p className={`text-center text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
              Fortschritt wird geräteübergreifend synchronisiert.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-Mail oder Passwort falsch.";
  if (msg.includes("Email not confirmed")) return "E-Mail noch nicht bestätigt. Bitte Postfach prüfen.";
  if (msg.includes("User already registered")) return "Diese E-Mail ist bereits registriert.";
  if (msg.includes("Password should be at least")) return "Passwort muss mindestens 6 Zeichen haben.";
  if (msg.includes("rate limit")) return "Zu viele Versuche. Bitte kurz warten.";
  return msg;
}
