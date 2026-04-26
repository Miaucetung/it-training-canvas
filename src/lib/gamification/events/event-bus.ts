import type { GamificationEvent } from './event-types';

type Subscriber<T> = (event: T) => void;

export class EventBus<T extends { type: string }> {
  private subscribers = new Map<string, Set<Subscriber<T>>>();

  subscribe(type: T['type'] | '*', fn: Subscriber<T>): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(fn);
    return () => {
      this.subscribers.get(type)?.delete(fn);
    };
  }

  emit(event: T): void {
    const specific = this.subscribers.get(event.type);
    if (specific) {
      for (const fn of specific) {
        try { fn(event); } catch (e) { console.error('[EventBus] Subscriber error:', e); }
      }
    }
    const wildcard = this.subscribers.get('*');
    if (wildcard) {
      for (const fn of wildcard) {
        try { fn(event); } catch (e) { console.error('[EventBus] Subscriber error:', e); }
      }
    }
  }

  unsubscribeAll(): void {
    this.subscribers.clear();
  }
}

export const gamificationBus = new EventBus<GamificationEvent>();
