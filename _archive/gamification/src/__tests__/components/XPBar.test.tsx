// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XPBar } from '@/components/gamification/XPBar';

describe('XPBar', () => {
  it('renders level badge', () => {
    render(<XPBar xp={0} level={1} theme="light" />);
    expect(screen.getByText('Lv.1')).toBeTruthy();
  });

  it('renders XP text', () => {
    render(<XPBar xp={100} level={1} theme="light" />);
    expect(screen.getByText(/100/)).toBeTruthy();
  });

  it('renders dark theme', () => {
    const { container } = render(<XPBar xp={0} level={1} theme="dark" />);
    expect(container.querySelector('.bg-indigo-600')).toBeTruthy();
  });
});
