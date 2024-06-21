import {
  StoreActionTypes,
  StoreAfterTransitionEvent,
  StoreBeforeTransitionEvent,
} from './store-action-types';
import { ActionSource, ActionSources, ActionType } from '@state-utils/actions';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { StoreRef, storeRefSymbol } from './store-ref';

export interface StoreTransition<TState, TPayload> {
  (state: TState, payload: TPayload): TState;
}

export type StoreTransitions<TState, TPayloads> = {
  [K in keyof TPayloads]: StoreTransition<TState, TPayloads[K]>;
};

export interface StoreDef<TState, TPayloads> {
  ref?: symbol;
  name?: string;
  state: TState;
  actions: StoreActionTypes<TState, TPayloads>;
  transitions: StoreTransitions<TState, TPayloads>;
}

export interface Store<TState> extends StoreRef<symbol, TState> {
  getState(): TState;
  getStateObservable(): Observable<TState>;
  dispose(): void;
}

function getCommandName(name: string) {
  return `${name}Command`;
}

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getBeforeEventName(name: string) {
  return `before${capitalize(name)}Event`;
}

function getAfterEventName(name: string) {
  return `after${capitalize(name)}Event`;
}

export function createStore<TState, TPayloads>(
  actionSources: ActionSources,
  storeDef: StoreDef<TState, TPayloads>
): Store<TState> {
  const {
    name,
    ref = name !== undefined ? Symbol(name) : Symbol(),
    state,
    actions,
    transitions,
  } = storeDef;

  const stateSubject = new BehaviorSubject(state);
  const stateObservable = stateSubject.asObservable();

  const transitionEntries =
    Object.entries<StoreTransition<TState, any>>(transitions);

  const subscription = new Subscription();
  for (const [transitionName, transition] of transitionEntries) {
    const commandType: ActionType<any> =
      // @ts-expect-error ignore no index signature
      actions[getCommandName(transitionName)];
    const beforeEventType: ActionType<StoreBeforeTransitionEvent<TState, any>> =
      // @ts-expect-error ignore no index signature
      actions[getBeforeEventName(transitionName)];
    const afterEventType: ActionType<StoreAfterTransitionEvent<TState, any>> =
      // @ts-expect-error ignore no index signature
      actions[getAfterEventName(transitionName)];
    const commands: ActionSource<any> = actionSources.ofType(commandType);
    subscription.add(
      commands.subscribe({
        next({ payload }) {
          const prevState = stateSubject.getValue();
          actionSources.dispatch(
            beforeEventType({
              state: prevState,
              payload,
            })
          );

          try {
            const state = transition(prevState, payload);
            stateSubject.next(state);
          } catch (error) {
            subscription.unsubscribe();
            stateSubject.error(error);
          }

          actionSources.dispatch(
            afterEventType({
              prevState,
              state,
              payload,
            })
          );
        },
      })
    );
  }

  return {
    [storeRefSymbol]: ref,
    getState(): TState {
      return stateSubject.getValue();
    },
    getStateObservable(): Observable<TState> {
      return stateObservable;
    },
    dispose() {
      subscription.unsubscribe();
    },
  };
}
