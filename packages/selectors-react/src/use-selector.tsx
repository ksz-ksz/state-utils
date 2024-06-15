import React from 'react';
import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import {
  AnySelector,
  createSelectorRunner,
  SelectorExecutionResultsSharedCache,
  SelectorRunner,
} from '@state-utils/selectors';

const SelectorSharedCacheContext = createContext<
  SelectorExecutionResultsSharedCache<any> | undefined
>(undefined);

export function useSelectorSharedCache() {
  return useContext(SelectorSharedCacheContext);
}

export function SelectorSharedCacheProvider({
  sharedCache,
  children,
}: PropsWithChildren<{
  sharedCache: SelectorExecutionResultsSharedCache<any>;
}>) {
  return (
    <SelectorSharedCacheContext.Provider value={sharedCache}>
      {children}
    </SelectorSharedCacheContext.Provider>
  );
}

export function useSelector<TState, TResult, TArgs extends any[]>(
  selector: AnySelector<TState, TResult, TArgs>,
  state: TState,
  args: TArgs
): TResult {
  const sharedCache = useSelectorSharedCache();
  const ref = useRef<
    | {
        selectorRunner: SelectorRunner<TState, TResult, TArgs>;
        selector: AnySelector<TState, TResult, TArgs>;
      }
    | undefined
  >(undefined);
  if (ref.current === undefined || ref.current.selector !== selector) {
    ref.current = {
      selector,
      selectorRunner: createSelectorRunner(selector, { sharedCache }),
    };
  }

  return ref.current.selectorRunner.run(state, ...args);
}
