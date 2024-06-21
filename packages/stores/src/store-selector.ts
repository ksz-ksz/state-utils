import {
  createSelector,
  createStateSelector,
  SelectorContext,
  SelectorMetadata,
  SelectorOptions,
  StateSelectorMetadata,
} from '@state-utils/selectors';
import { StoreRef, storeRefSymbol } from './store-ref';
import { Intersect } from './intersect';

export type StoreEntry<TSymbol extends symbol, TState> = {
  [K in TSymbol]: TState;
};

declare const storeSelectorEntries: unique symbol;

export interface StoreSelectorContext<TStoreEntries>
  extends SelectorContext<unknown> {
  [storeSelectorEntries]?: TStoreEntries;
}

export interface StoreSelector<TStoreEntries, TResult, TArgs extends any[]> {
  (state: StoreSelectorContext<TStoreEntries>, ...args: TArgs): TResult;
  meta: SelectorMetadata<TStoreEntries, TResult, TArgs>;
  deps: StoreRef<symbol, unknown>[];
}

export interface StoreStateSelector<
  TStoreEntries,
  TResult,
  TArgs extends any[],
> {
  (state: StoreSelectorContext<TStoreEntries>, ...args: TArgs): TResult;
  meta: StateSelectorMetadata<TStoreEntries, TResult, TArgs>;
  deps: StoreRef<symbol, unknown>[];
}

export type AnyStoreSelector<TStoreEntries, TResult, TArgs extends any[]> =
  | StoreSelector<TStoreEntries, TResult, TArgs>
  | StoreStateSelector<TStoreEntries, TResult, TArgs>;

export function createStoreStateSelector<
  TSymbol extends symbol,
  TState,
  TResult = TState,
  TArgs extends any[] = [],
>(
  ref: StoreRef<TSymbol, TState>,
  run?: (state: TState, ...args: TArgs) => TResult
): StoreStateSelector<StoreEntry<TSymbol, TState>, TResult, TArgs> {
  const _run =
    run !== undefined
      ? (storeEntries: StoreEntry<TSymbol, TState>, ...args: TArgs) =>
          run(storeEntries[ref[storeRefSymbol]], ...args)
      : (storeEntries: StoreEntry<TSymbol, TState>) =>
          storeEntries[ref[storeRefSymbol]];

  // @ts-expect-error unsafe cast of _run
  return Object.assign(createStateSelector(_run), { deps: [ref] });
}

export type MapStoreSelectors<TStoreEntries> = {
  [K in keyof TStoreEntries]: AnyStoreSelector<
    TStoreEntries[K],
    unknown,
    any[]
  >;
};

export function createStoreSelector<
  TStoreEntries extends any[],
  TResult,
  TArgs extends any[],
>(
  deps: MapStoreSelectors<TStoreEntries>,
  run: (
    context: StoreSelectorContext<Intersect<TStoreEntries>>,
    ...args: TArgs
  ) => TResult,
  options?: SelectorOptions
): StoreSelector<Intersect<TStoreEntries>, TResult, TArgs> {
  return Object.assign(createSelector(run, options), {
    deps: collectDeps(deps),
  }) as StoreSelector<Intersect<TStoreEntries>, TResult, TArgs>;
}

function collectDeps(
  selectors: AnyStoreSelector<unknown, unknown, unknown[]>[]
) {
  const deps = new Set<StoreRef<symbol, unknown>>();
  for (const selector of selectors) {
    for (const dep of selector.deps) {
      deps.add(dep);
    }
  }
  return Array.from(deps);
}
