// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementsPanel } from '@/components/gamification/AchievementsPanel';
import { ACHIEVEMENT_RULES } from '@/lib/gamification/rules/achievement-rules';

describe('AchievementsPanel', () => {
  it('renders achievements', () => {
    render(
      <AchievementsPanel
        achievements={ACHIEVEMENT_RULES.slice(0, 3)}
        unlockedIds={[]}
        onClose={vi.fn()}
        theme="light"
      />
    );
    expect(screen.getByText('Erste Schritte')).toBeTruthy();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <AchievementsPanel
        achievements={[]}
        unlockedIds={[]}
        onClose={onClose}
        theme="light"
      />
    );
    fireEvent.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows secret achievement as hidden', () => {
    const secretRule = ACHIEVEMENT_RULES.find(r => r.secret)!;
    render(
      <AchievementsPanel
        achievements={[secretRule]}
        unlockedIds={[]}
        onClose={vi.fn()}
        theme="light"
      />
    );
    expect(screen.getByText('???')).toBeTruthy();
  });

  it('shows unlocked achievement normally', () => {
    const secretRule = ACHIEVEMENT_RULES.find(r => r.secret)!;
    render(
      <AchievementsPanel
        achievements={[secretRule]}
        unlockedIds={[secretRule.id]}
        onClose={vi.fn()}
        theme="light"
      />
    );
    expect(screen.getByText(secretRule.name)).toBeTruthy();
  });
});
