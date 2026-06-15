import type { User } from "@supabase/supabase-js";
import { UserCircle } from "@phosphor-icons/react";
import { lazy, Suspense, useState } from "react";

const AccountDialog = lazy(() =>
  import("./AccountDialog").then((m) => ({ default: m.AccountDialog })),
);

interface Props {
  user: User | null;
  dark: boolean;
  /** Öffnet den Anmelde-Dialog (von App.tsx verwaltet). */
  onLogin: () => void;
}

/**
 * Navbar-Auth-Control: zeigt im abgemeldeten Zustand einen Anmelden-Button,
 * im angemeldeten Zustand einen Avatar, der das Konto-Panel öffnet.
 */
export function AuthMenu({ user, dark, onLogin }: Props) {
  const [showAccount, setShowAccount] = useState(false);

  if (!user) {
    return (
      <button
        onClick={onLogin}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
          dark
            ? "border-sky-700/60 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/80"
            : "border-sky-400/60 text-sky-600 hover:bg-sky-50 hover:border-sky-500"
        }`}
        title="Anmelden — Fortschritt geräteübergreifend synchronisieren"
      >
        <UserCircle size={15} />
        <span className="hidden sm:inline">Anmelden</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAccount(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          dark
            ? "text-emerald-400 hover:bg-zinc-700"
            : "text-emerald-600 hover:bg-emerald-50"
        }`}
        title={`Angemeldet als ${user.email} — Konto öffnen`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
            dark ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {user.email?.[0]?.toUpperCase() ?? "?"}
        </span>
        <span className="max-w-[80px] truncate hidden sm:block">
          {user.email?.split("@")[0]}
        </span>
      </button>

      {showAccount && (
        <Suspense fallback={null}>
          <AccountDialog
            user={user}
            dark={dark}
            onClose={() => setShowAccount(false)}
          />
        </Suspense>
      )}
    </>
  );
}
