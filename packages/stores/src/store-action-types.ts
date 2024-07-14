import {
  ActionType,
  CreateActionsOptions,
  createActionTypes,
} from '@state-utils/actions';

export type StoreCommands<TPayloads> = {
  [K in keyof TPayloads as `${K & string}Command`]: ActionType<TPayloads[K]>;
};

export interface StoreBeforeTransitionEvent<TState, TPayload> {
  state: TState;
  payload: TPayload;
}

export interface StoreAfterTransitionEvent<TState, TPayload> {
  prevState: TState;
  state: TState;
  payload: TPayload;
}

export type StoreBeforeTransitionEvents<TState, TPayloads> = {
  [K in keyof TPayloads as `before${Capitalize<K & string>}Event`]: ActionType<
    StoreBeforeTransitionEvent<TState, TPayloads[K]>
  >;
};

export type StoreAfterTransitionEvents<TState, TPayloads> = {
  [K in keyof TPayloads as `after${Capitalize<K & string>}Event`]: ActionType<
    StoreAfterTransitionEvent<TState, TPayloads[K]>
  >;
};

export type StoreEvents<TState, TPayloads> = StoreBeforeTransitionEvents<
  TState,
  TPayloads
> &
  StoreAfterTransitionEvents<TState, TPayloads>;

export type StoreActionTypes<TState, TPayloads> = StoreCommands<TPayloads> &
  StoreEvents<TState, TPayloads>;

export type InferStoreActionsState<T> =
  T extends StoreActionTypes<infer TState, any> ? TState : never;

export type InferStoreActionsPayloads<T> =
  T extends StoreActionTypes<any, infer TPayloads> ? TPayloads : never;

export interface CreateStoreActionsOptions {
  namespace: string;
}

export function createStoreActionTypes<TState, TPayloads>(
  options: CreateStoreActionsOptions
): StoreActionTypes<TState, TPayloads> {
  return createActionTypes({
    namespace: options.namespace,
  }) as unknown as StoreActionTypes<TState, TPayloads>;
}
