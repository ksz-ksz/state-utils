import {
  createSelector,
  createStateSelector,
  Selector,
  SelectorContext,
  SelectorOptions,
  StateSelector,
} from '@state-utils/selectors';
import { StoreRef } from './store-ref';

export interface StoresMap<TState> {
  get(storeRef: StoreRef<TState>): TState;
}

export interface StoreSelector<
  TStoresMap extends StoresMap<any>,
  TResult,
  TArgs extends any[],
> extends Selector<TStoresMap, TResult, TArgs> {
  deps: StoreRef<any>[];
}

export interface StoreStateSelector<
  TStoresMap extends StoresMap<any>,
  TResult,
  TArgs extends any[],
> extends StateSelector<TStoresMap, TResult, TArgs> {
  deps: StoreRef<any>[];
}

export type AnyStoreSelector<
  TStoresMap extends StoresMap<any>,
  TResult,
  TArgs extends any[],
> =
  | StoreSelector<TStoresMap, TResult, TArgs>
  | StoreStateSelector<TStoresMap, TResult, TArgs>;

export function createStoreStateSelector<TState>(
  storeRef: StoreRef<TState>
): StoreStateSelector<StoresMap<TState>, TState, []> {
  return Object.assign(
    createStateSelector((storesMap: StoresMap<TState>) =>
      storesMap.get(storeRef)
    ),
    { deps: [storeRef] }
  );
}

function collectDeps(selectors: AnyStoreSelector<any, any, any>[]) {
  const deps = new Set<StoreRef<any>>();
  for (const selector of selectors) {
    for (const dep of selector.deps) {
      deps.add(dep);
    }
  }
  return Array.from(deps);
}

export function createStoreSelector<
  TResult,
  TArgs extends any[],
  TDeps extends AnyStoreSelector<any, any, any>[],
>(
  deps: [...TDeps],
  select: (context: StoreSelectorContext<TDeps>, ...args: TArgs) => TResult,
  options?: SelectorOptions
) {
  return Object.assign(createSelector(select as any, options), {
    deps: collectDeps(deps),
  });
}

export type InferStoreSelectorState<T> =
  T extends AnyStoreSelector<infer TStoresMap, any, any> ? TStoresMap : never;

export type Hack<TSelector> = {
  [K in keyof InferStoreSelectorState<TSelector>]: InferStoreSelectorState<TSelector>[K];
};

export type IntersectStoreSelectorStates<TDeps> = TDeps extends [infer THead]
  ? InferStoreSelectorState<THead>
  : TDeps extends [infer THead, ...infer TTail]
    ? InferStoreSelectorState<THead> & IntersectStoreSelectorStates<TTail>
    : unknown;

export interface StoreSelectorContext<
  TDeps extends AnyStoreSelector<any, any, any>[],
> extends SelectorContext<IntersectStoreSelectorStates<TDeps>> {
  // _state: IntersectStoreSelectorStates<TDeps>;
  // runSelector: any;
  // runStateSelector: any;
}

// export interface StoreSelectorContext<
//   TDeps extends AnyStoreSelector<any, any, any>[],
// > {
//   __state: IntersectStoreSelectorStates<TDeps>;
// }
