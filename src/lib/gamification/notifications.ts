import { toast } from 'sonner';

export function showAchievementToast(name: string, icon: string, xpReward: number): void {
  toast.success(`${icon} ${name}`, {
    description: `+${xpReward} XP freigeschaltet!`,
    duration: 4000,
  });
}
