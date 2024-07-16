import { Historian } from './historian';

export function createBrowserHistorian(
  window: Window,
  history: History = window.history,
  location: Location = window.location
): Historian {
  const listeners: ((href: string, state: unknown) => void)[] = [];

  function notify(event: PopStateEvent) {
    const href = location.href;
    const state = event.state;
    for (const listener of listeners) {
      listener(href, state);
    }
  }

  window.addEventListener('popstate', notify);

  return {
    push(href: string, state: unknown) {
      history.pushState(state, '', href);
    },
    replace(href: string, state: unknown) {
      history.replaceState(state, '', href);
    },
    go(delta: number) {
      history.go(delta);
    },
    backward() {
      history.back();
    },
    forward() {
      history.forward();
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
    dispose() {
      window.removeEventListener('popstate', notify);
    },
  };
}
