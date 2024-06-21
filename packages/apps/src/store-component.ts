import {
  createStore,
  Store,
  StoreDef,
  StoreRef,
  storeRefSymbol,
} from '@state-utils/stores';
import {
  Component,
  Components,
  createComponent,
  createComponents,
} from '@state-utils/containers';
import { actionSourcesComponent } from './action-sources-component';

export interface StoreComponent<TState>
  extends Component<Store<TState>>,
    StoreRef<symbol, TState> {}

export function createStoreComponent<TState, TPayloads, TDeps>(
  createStoreDef: (deps: TDeps) => StoreDef<TState, TPayloads>,
  options?: {
    deps?: Components<TDeps>;
  }
): StoreComponent<TState> {
  const storeRef = Symbol();
  return Object.assign(
    createComponent(
      ({ actionSources, deps }) =>
        createStore(actionSources, createStoreDef(deps), storeRef),
      {
        deps: {
          actionSources: actionSourcesComponent,
          deps: createComponents((options?.deps ?? []) as Components<TDeps>),
        },
      }
    ),
    {
      [storeRefSymbol]: storeRef,
    }
  );
}
