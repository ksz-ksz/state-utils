import {
  createSelector,
  createStateSelector,
  SelectorContext,
  SelectorMetadata,
  SelectorOptions,
  StateSelectorMetadata,
} from '@state-utils/selectors';

declare const storeRefSymbol: unique symbol;
declare const storeRefState: unique symbol;

interface StoreRef<TSymbol extends symbol, TState> {
  [storeRefSymbol]: TSymbol;
  [storeRefState]?: TState;
}

type StoreEntry<TSymbol extends symbol, TState> = {
  [K in TSymbol]: TState;
};

declare const storeSelectorEntries: unique symbol;

interface StoreSelectorContext<TStoreEntries> extends SelectorContext<unknown> {
  [storeSelectorEntries]?: TStoreEntries;
}

interface StoreSelector<TStoreEntries, TResult, TArgs extends any[]> {
  (state: StoreSelectorContext<TStoreEntries>, ...args: TArgs): TResult;
  meta: SelectorMetadata<TStoreEntries, TResult, TArgs>;
  deps: StoreRef<symbol, unknown>[];
}

interface StoreStateSelector<TStoreEntries, TResult, TArgs extends any[]> {
  (state: StoreSelectorContext<TStoreEntries>, ...args: TArgs): TResult;
  meta: StateSelectorMetadata<TStoreEntries, TResult, TArgs>;
  deps: StoreRef<symbol, unknown>[];
}

type AnyStoreSelector<TStoreEntries, TResult, TArgs extends any[]> =
  | StoreSelector<TStoreEntries, TResult, TArgs>
  | StoreStateSelector<TStoreEntries, TResult, TArgs>;

function createStoreStateSelector<
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

type MapStoreSelectors<TStoreEntries> = {
  [K in keyof TStoreEntries]: AnyStoreSelector<
    TStoreEntries[K],
    unknown,
    any[]
  >;
};

type Intersect<T> = T extends [infer U]
  ? U
  : T extends [infer U, ...infer Rest]
    ? U & Intersect<Rest>
    : unknown;

function createStoreSelector<
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

interface Foo {
  foo: {
    fooValue: string;
  };
}

interface Bar {
  bar: {
    barValue: string;
  };
}

const fooSymbol = Symbol('foo');
const barSymbol = Symbol('bar');
const fooStoreRef: StoreRef<typeof fooSymbol, Foo> = undefined as any;
const barStoreRef: StoreRef<typeof barSymbol, Bar> = undefined as any;

const selectFoo = createStoreStateSelector(fooStoreRef);
const selectBar = createStoreStateSelector(
  barStoreRef,
  (state, returnUndefined: boolean) =>
    returnUndefined ? undefined : { ugabuga: state }
);

const selectSuccess = createStoreSelector([selectFoo, selectBar], (ctx) => {
  return {
    foo: selectFoo(ctx),
    bar: selectBar(ctx, true)?.ugabuga,
  };
});

const selectFail = createStoreSelector([selectFoo], (ctx) => {
  return {
    foo: selectFoo(ctx),
    bar: selectBar(ctx, true)?.ugabuga, // <-- should fail
  };
});

console.log(selectSuccess, selectFail);
