import type { ToolId } from "@/lib/types";

export type AuditTheme = "light" | "dark";
export type AuditDialogTarget = "exam" | "prioritized" | "dragdrop" | "labs";

export interface AuditHookMap {
  __auditApp: {
    setTheme: (theme: AuditTheme) => void;
    openDialog: (target: AuditDialogTarget) => void;
    openTool: (id: ToolId) => void;
    closeDialogs: () => void;
  };
  __quizDialogState: {
    setIndex: (index: number) => void;
    confirmCurrent: () => void;
    resetConfirmed: () => void;
    getCurrentQ: () => unknown;
    getQuestions: () => unknown[];
  };
  __dragDropState: {
    setIndex: (index: number) => void;
    checkCurrent: () => void;
    resetPlaced: () => void;
    getCurrentQ: () => unknown;
    getCount: () => number;
  };
  __examPrepState: {
    setQIndex: (index: number) => void;
    revealAnswer: () => void;
    resetRevealed: () => void;
    getCurrentQ: () => unknown;
    getQuestions: () => unknown[];
    startLearn: () => void;
  };
  __prioritizedLearningState: {
    startAll: () => void;
    closeQuiz: () => void;
  };
}

declare global {
  interface Window extends Partial<AuditHookMap> {
    __AUDIT_NO_SHUFFLE__?: boolean;
  }
}

// Vite ersetzt beide Ausdrücke beim Build statisch. Aufrufer prüfen das Flag selbst, damit der Hook-Name im Produktionsbuild nicht im Bundle bleibt.
export const AUDIT_HOOKS_ENABLED: boolean = import.meta.env.DEV || import.meta.env.VITE_AUDIT_HOOKS === "1";

export function registerAuditHook<K extends keyof AuditHookMap>(name: K, api: AuditHookMap[K]): () => void {
  if (!AUDIT_HOOKS_ENABLED || typeof window === "undefined") return () => undefined;
  const hooks: Partial<AuditHookMap> = window;
  hooks[name] = api;
  return () => {
    if (hooks[name] === api) delete hooks[name];
  };
}

export function auditNoShuffle(): boolean {
  return AUDIT_HOOKS_ENABLED && typeof window !== "undefined" && window.__AUDIT_NO_SHUFFLE__ === true;
}
