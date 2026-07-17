import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '@/lib/gamification/events/event-bus';
import type { GamificationEvent } from '@/lib/gamification/events/event-types';

function makeEvent(type: GamificationEvent['type'] = 'topic_completed'): GamificationEvent {
  return {
    id: 'test-1',
    type,
    timestamp: Date.now(),
    payload: { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 },
  };
}

describe('EventBus', () => {
  let bus: EventBus<GamificationEvent>;

  beforeEach(() => {
    bus = new EventBus<GamificationEvent>();
  });

  it('subscriber receives events of its type', () => {
    const fn = vi.fn();
    bus.subscribe('topic_completed', fn);
    const event = makeEvent('topic_completed');
    bus.emit(event);
    expect(fn).toHaveBeenCalledWith(event);
  });

  it('subscriber does not receive events of other types', () => {
    const fn = vi.fn();
    bus.subscribe('quiz_completed', fn);
    bus.emit(makeEvent('topic_completed'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('unsubscribe stops receiving events', () => {
    const fn = vi.fn();
    const unsub = bus.subscribe('topic_completed', fn);
    unsub();
    bus.emit(makeEvent('topic_completed'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('wildcard subscriber receives all events', () => {
    const fn = vi.fn();
    bus.subscribe('*', fn);
    bus.emit(makeEvent('topic_completed'));
    bus.emit(makeEvent('quiz_completed'));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('error in one subscriber does not block others', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const throwing = vi.fn().mockImplementation(() => { throw new Error('oops'); });
    const normal = vi.fn();
    bus.subscribe('topic_completed', throwing);
    bus.subscribe('topic_completed', normal);
    bus.emit(makeEvent('topic_completed'));
    expect(normal).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('emit is synchronous', () => {
    const calls: string[] = [];
    bus.subscribe('topic_completed', () => calls.push('first'));
    bus.subscribe('topic_completed', () => calls.push('second'));
    bus.emit(makeEvent('topic_completed'));
    expect(calls).toEqual(['first', 'second']);
  });

  it('unsubscribeAll clears all subscribers', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.subscribe('topic_completed', fn1);
    bus.subscribe('*', fn2);
    bus.unsubscribeAll();
    bus.emit(makeEvent('topic_completed'));
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
  });
});
