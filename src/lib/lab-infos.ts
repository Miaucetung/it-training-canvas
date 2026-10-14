import { useEffect, useState } from "react";

export interface LabInfo {
  id: string;
  title: string;
  duration?: string;
  difficulty?: string;
}

/** Titel, Dauer und Stufe aller Labs. Die Lab-Daten sind groß und werden erst bei Bedarf nachgeladen. */
export function useLabInfos(): Record<string, LabInfo> {
  const [infos, setInfos] = useState<Record<string, LabInfo>>({});
  useEffect(() => {
    let alive = true;
    import("@/components/labs")
      .then((m) => {
        if (!alive) return;
        setInfos(Object.fromEntries(m.LABS.map((l) => [l.id, { id: l.id, title: l.title, duration: l.duration, difficulty: l.difficulty }])));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return infos;
}
