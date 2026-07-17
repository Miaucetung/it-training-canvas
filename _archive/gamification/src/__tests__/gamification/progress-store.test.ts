import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageProgressStore, createEmptyState, pruneEventHistory, SCHEMA_VERSION } from '@/lib/gamification/state/progress-store';
import type { ProgressState } from '@/lib/gamification/types';

describe('progress-store', () => {
  let store: LocalStorageProgressStore;
  const mockStorage = new Map<string, string>();

  beforeEach(() => {
    mockStorage.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string) => { mockStorage.set(key, value); },
      removeItem: (key: string) => { mockStorage.delete(key); },
    });
    store = new LocalStorageProgressStore();
  });

  it('load() on empty storage returns createEmptyState()', () => {
    const state = store.load();
    expect(state.xpTotal).toBe(0);
    expect(state.level).toBe(1);
    expect(state.userId).toBe('local');
  });

  it('save() + load() round-trip is identical', () => {
    const original = createEmptyState();
    const modified: ProgressState = { ...original, xpTotal: 500, level: 3 };
    store.save(modified);
    const loaded = store.load();
    expect(loaded.xpTotal).toBe(500);
    expect(loaded.level).toBe(3);
  });

  it('save() prunes events older than 30 days', () => {
    const old = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const state: ProgressState = {
      ...createEmptyState(),
      eventHistory: [
        { id: 'old', type: 'topic_completed', timestamp: old, payload: { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 } },
        { id: 'new', type: 'topic_completed', timestamp: Date.now(), payload: { topicId: 't2', moduleId: 'm1', estimatedMinutes: 10 } },
      ],
    };
    store.save(state);
    const loaded = store.load();
    expect(loaded.eventHistory).toHaveLength(1);
    expect(loaded.eventHistory[0].id).toBe('new');
  });

  it('reset() + load() returns empty state', () => {
    store.save({ ...createEmptyState(), xpTotal: 999 });
    store.reset();
    const state = store.load();
    expect(state.xpTotal).toBe(0);
  });

  it('load() with corrupt JSON returns empty state', () => {
    mockStorage.set('it-training-progress-v1', 'not-valid-json{{{');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = store.load();
    expect(state.xpTotal).toBe(0);
    consoleSpy.mockRestore();
  });

  it('load() with future schemaVersion returns empty state and warns', () => {
    mockStorage.set('it-training-progress-v1', JSON.stringify({ schemaVersion: 999, xpTotal: 500 }));
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = store.load();
    expect(state.xpTotal).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Future schema'));
    consoleSpy.mockRestore();
  });

  it('load() with null/non-object data returns empty state', () => {
    mockStorage.set('it-training-progress-v1', JSON.stringify(null));
    const state = store.load();
    expect(state.xpTotal).toBe(0);
  });

  it('load() with schemaVersion=0 returns empty state', () => {
    mockStorage.set('it-training-progress-v1', JSON.stringify({ schemaVersion: 0, xpTotal: 500 }));
    const state = store.load();
    expect(state.xpTotal).toBe(0);
  });

  it('load() with current schema version returns data', () => {
    const validState = createEmptyState();
    mockStorage.set('it-training-progress-v1', JSON.stringify(validState));
    const state = store.load();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
  });
});

describe('pruneEventHistory', () => {
  it('removes events older than 30 days', () => {
    const old = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const state: ProgressState = {
      ...createEmptyState(),
      eventHistory: [
        { id: 'old', type: 'topic_completed', timestamp: old, payload: { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 } },
        { id: 'new', type: 'topic_completed', timestamp: Date.now(), payload: { topicId: 't2', moduleId: 'm1', estimatedMinutes: 10 } },
      ],
    };
    const pruned = pruneEventHistory(state);
    expect(pruned.eventHistory).toHaveLength(1);
    expect(pruned.eventHistory[0].id).toBe('new');
  });
});
