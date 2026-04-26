export interface Clock {
  now(): number;
  today(): string; // 'YYYY-MM-DD' local timezone
}

export const realClock: Clock = {
  now: () => Date.now(),
  today: () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
};

let _clock: Clock = realClock;
export function setClock(c: Clock): void { _clock = c; }
export function resetClock(): void { _clock = realClock; }
export function getClock(): Clock { return _clock; }
