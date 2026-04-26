import { LEVEL_THRESHOLDS } from '@/lib/gamification/rules/xp-rules';

interface XPBarProps {
  xp: number;
  level: number;
  theme: 'light' | 'dark';
}

export function XPBar({ xp, level, theme }: XPBarProps) {
  const isDark = theme === 'dark';
  const levelIndex = level - 1;
  const levelStart = LEVEL_THRESHOLDS[levelIndex] ?? 0;
  const levelEnd = LEVEL_THRESHOLDS[levelIndex + 1] ?? levelStart + 1000;
  const progress = Math.min(100, Math.max(0, Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100)));

  return (
    <div className="flex items-center gap-2 w-[200px]">
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
        Lv.{level}
      </span>
      <div className="flex-1 flex flex-col gap-0.5">
        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {xp} / {levelEnd} XP
        </span>
      </div>
    </div>
  );
}
