import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isRecoveryMode: boolean;
  clearRecoveryMode: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, session, loading, isRecoveryMode, clearRecoveryMode: () => setIsRecoveryMode(false) };
}
