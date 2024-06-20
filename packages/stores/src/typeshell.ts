import { SelectorContext } from '@state-utils/selectors';

declare const storeRefState: unique symbol;

interface StoreRef<TState> {
  [storeRefState]?: TState;
}

declare const storeEntryState: unique symbol;

interface StoreEntry<TState> {
  [storeEntryState]?: TState;
  get(ref: StoreRef<TState>): TState;
}

declare const x: unique symbol;

interface StoreSelectorContext<TDepStates> {
  [x]?: TDepStates;
}

interface StoreSelector<TDepStates, TResult> {
  (state: StoreSelectorContext<TDepStates>): TResult;
  deps: TDepStates[];
}

function createStoreStateSelector<TState, TResult>(
  run: (state: StoreEntry<TState>) => TResult
): StoreSelector<TState, TResult> {
  return undefined as any;
}

type MapStoreSelectors<TStates> = {
  [K in keyof TStates]: StoreSelector<TStates[K], any>;
};

type Intersect<T> = T extends [infer U]
  ? U
  : T extends [infer U, ...infer Rest]
    ? U & Intersect<Rest>
    : unknown;

function createStoreSelector<TDepStates, TResult>(
  deps: MapStoreSelectors<TDepStates>,
  run: (context: StoreSelectorContext<Intersect<TDepStates>>) => TResult
): StoreSelector<Intersect<TDepStates>, TResult> {
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

const fooStoreRef: StoreRef<Foo> = undefined as any;
const barStoreRef: StoreRef<Bar> = undefined as any;

const selectFoo = createStoreStateSelector((state: StoreEntry<Foo>) =>
  state.get(fooStoreRef)
);
const selectBar = createStoreStateSelector((state: StoreEntry<Bar>) =>
  state.get(barStoreRef)
);

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
