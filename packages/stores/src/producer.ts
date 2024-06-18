import { StoreTransition } from './store';
import { Draft, produce } from 'immer';

export function producer<TState, TPayload>(
  produceState: (
    state: Draft<TState>,
    payload: TPayload
  ) => Draft<TState> | void
): StoreTransition<TState, TPayload> {
  return (state, payload) => {
    return produce(state, (draft) => produceState(draft, payload));
  };
}
