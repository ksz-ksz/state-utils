import { Historian } from './historian';

export interface HistoryEntry {
  href: string;
  state: unknown;
}

export interface MemoryHistorian extends Historian {
  getCurrentEntry(): HistoryEntry;
  getEntries(): HistoryEntry[];
}

export function createMemoryHistorian(
  initialEntry: HistoryEntry
): MemoryHistorian {
  let currentIndex = 0;
  const entries: HistoryEntry[] = [initialEntry];

  const listeners: ((href: string, state: unknown) => void)[] = [];

  function notify() {
    const { href, state } = entries[currentIndex];
    for (const listener of listeners) {
      listener(href, state);
    }
  }

  return {
    getCurrentEntry(): HistoryEntry {
      return entries[currentIndex];
    },
    getEntries(): HistoryEntry[] {
      return entries;
    },
    push(href: string, state: unknown) {
      currentIndex += 1;
      entries[currentIndex] = { href, state };
      entries.length = currentIndex + 1;
    },
    replace(href: string, state: unknown) {
      entries[currentIndex] = { href, state };
    },
    go(delta: number) {
      currentIndex += delta;
      currentIndex = Math.max(currentIndex, 0);
      currentIndex = Math.min(currentIndex, entries.length - 1);
      notify();
    },
    forward() {
      this.go(+1);
    },
    backward() {
      this.go(-1);
    },
    addPopListener(listener: (href: string, state: unknown) => void) {
      listeners.push(listener);
    },
    removePopListener(listener: (href: string, state: unknown) => void) {
      const indexOfListener = listeners.indexOf(listener);
      if (indexOfListener !== -1) {
        listeners.splice(indexOfListener, 1);
      }
    },
    dispose() {},
  };
}
