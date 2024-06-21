import { SelectorContext } from '@state-utils/selectors';

declare const storeRefSymbol: unique symbol;
declare const storeRefState: unique symbol;

interface StoreRef<TSymbol extends symbol, TState> {
  [storeRefSymbol]: TSymbol;
  [storeRefState]?: TState;
}

type StoreEntry<TSymbol extends symbol, TState> = {
  [K in TSymbol]: TState;
};

declare const x: unique symbol;

interface StoreSelectorContext<TStoreEntries> {
  [x]?: TStoreEntries;
}

interface StoreSelector<TStoreEntries, TResult> {
  (state: StoreSelectorContext<TStoreEntries>): TResult;
  deps: StoreSelector<any, any>[];
}

function createStoreStateSelector<TSymbol extends symbol, TState>(
  ref: StoreRef<TSymbol, TState>
): StoreSelector<StoreEntry<TSymbol, TState>, TState> {
  return undefined as any;
}

type MapStoreSelectors<TStoreEntries> = {
  [K in keyof TStoreEntries]: StoreSelector<TStoreEntries[K], any>;
};

type Intersect<T> = T extends [infer U]
  ? U
  : T extends [infer U, ...infer Rest]
    ? U & Intersect<Rest>
    : unknown;

function createStoreSelector<TStoreEntries, TResult>(
  deps: MapStoreSelectors<TStoreEntries>,
  run: (context: StoreSelectorContext<Intersect<TStoreEntries>>) => TResult
): StoreSelector<Intersect<TStoreEntries>, TResult> {
  return undefined as any;
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
const selectBar = createStoreStateSelector(barStoreRef);

const selectSuccess = createStoreSelector([selectFoo, selectBar], (ctx) => {
  return {
    foo: selectFoo(ctx),
    bar: selectBar(ctx),
  };
});

const selectFail = createStoreSelector([selectFoo], (ctx) => {
  return {
    foo: selectFoo(ctx),
    bar: selectBar(ctx), // <-- should fail
  };
});

type x = typeof selectSuccess.deps;
