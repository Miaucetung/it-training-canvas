import type { AchievementRule } from '@/lib/gamification/types';

interface AchievementsPanelProps {
  achievements: AchievementRule[];
  unlockedIds: string[];
  onClose: () => void;
  theme: 'light' | 'dark';
}

export function AchievementsPanel({ achievements, unlockedIds, onClose, theme }: AchievementsPanelProps) {
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-slate-900' : 'bg-white';
  const border = isDark ? 'border-slate-700' : 'border-slate-200';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-[600px] max-w-[95vw] max-h-[80vh] overflow-y-auto rounded-2xl ${bg} ${border} border shadow-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${text}`}>🏆 Achievements</h2>
          <button onClick={onClose} className={`${textMuted} hover:opacity-70 text-xl`}>✕</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {achievements.map(a => {
            const unlocked = unlockedIds.includes(a.id);
            const hidden = a.secret && !unlocked;
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${unlocked ? (isDark ? 'border-indigo-600 bg-indigo-900/20' : 'border-indigo-300 bg-indigo-50') : (isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50')} ${unlocked ? '' : 'opacity-60'}`}
              >
                <span className="text-2xl">{hidden ? '❓' : a.icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${text}`}>{hidden ? '???' : a.name}</p>
                  <p className={`text-xs ${textMuted}`}>{hidden ? 'Noch nicht freigeschaltet' : a.description}</p>
                </div>
                {unlocked && <span className="text-xs text-indigo-400 font-medium">+{a.xpReward} XP</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
