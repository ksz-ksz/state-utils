export const storeRefSymbol = Symbol('storeRefSymbol');
declare const storeRefState: unique symbol;

export interface StoreRef<TSymbol extends symbol, TState> {
  [storeRefSymbol]: TSymbol;
  [storeRefState]?: TState;
}
