import { StoreTransition } from './store';
import { produce } from 'immer';

export function producer<TState, TPayload>(
  produceState: (state: TState, payload: TPayload) => void
): StoreTransition<TState, TPayload> {
  return (state, payload) => {
    // @ts-expect-error unsafe cast
    return produce(state, (draft) => produceState(draft, payload));
  };
}
