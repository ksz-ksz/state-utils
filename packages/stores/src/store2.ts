export interface StoreSubscriber<TState> {
  (state: TState): void;
}

export interface ReadableStore<TState> {
  getState(): TState;
  subscribe(subscriber: StoreSubscriber<TState>): () => void;
}

export interface WritableStore<TState> extends ReadableStore<TState> {
  setState(state: TState): void;
}

function createStore<TState>(initialState: TState): WritableStore<TState> {
  let state = initialState;
  const subscribers: StoreSubscriber<TState>[] = [];
  let currentSubscribers: StoreSubscriber<TState>[] | undefined = undefined;

  function getState() {
    return state;
  }

  function setState(_state: TState) {
    state = _state;
    if (currentSubscribers === undefined) {
      currentSubscribers = Array.from(subscribers);
    }
    for (const subscriber of currentSubscribers) {
      subscriber(_state);
    }
  }

  function subscribe(subscriber: (state: TState) => void): () => void {
    currentSubscribers = undefined;
    subscribers.push(subscriber);

    return () => {
      if (subscribers === undefined) {
        return;
      }

      const indexOfObserver = subscribers.indexOf(subscriber);
      if (indexOfObserver !== -1) {
        currentSubscribers = undefined;
        subscribers.splice(indexOfObserver, 1);
      }
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
}

export function createControlledStore<TState, TController>(
  createInitialState: () => TState,
  createController: (options: {
    get(): TState;
    set(state: TState): void;
  }) => TController
): [store: ReadableStore<TState>, controller: TController] {
  const { getState, setState, subscribe } = createStore(createInitialState());
  const store: ReadableStore<TState> = { getState, subscribe };
  const controller = createController({ get: getState, set: setState });

  return [store, controller];
}
