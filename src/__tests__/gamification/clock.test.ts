import { describe, it, expect, afterEach } from 'vitest';
import { realClock, setClock, resetClock, getClock } from '@/lib/gamification/clock';

describe('clock', () => {
  afterEach(() => {
    resetClock();
  });

  it('realClock.now() returns a number close to Date.now()', () => {
    const before = Date.now();
    const result = realClock.now();
    const after = Date.now();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('realClock.today() returns YYYY-MM-DD format', () => {
    const today = realClock.today();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('setClock() overrides the clock', () => {
    const mockClock = { now: () => 12345, today: () => '2024-01-15' };
    setClock(mockClock);
    expect(getClock().now()).toBe(12345);
    expect(getClock().today()).toBe('2024-01-15');
  });

  it('resetClock() restores the real clock', () => {
    const mockClock = { now: () => 0, today: () => '2000-01-01' };
    setClock(mockClock);
    resetClock();
    expect(getClock()).toBe(realClock);
  });
});
