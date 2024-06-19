export const storeRefSymbol = Symbol.for('storeRef');

export interface StoreRef<TState> {
  __state?: TState;
  [storeRefSymbol]: any;
}

// export type StoreRef<TState> = Store<TState>;
