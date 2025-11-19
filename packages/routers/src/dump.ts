import {
  Action,
  ActionSources,
  ActionTypes,
  createActionSources,
  createActionTypes,
} from '@state-utils/actions';
import {
  createFragment,
  createFragmentEncoder,
  createPath,
  createPathEncoder,
  createQuery,
  createQueryEncoder,
  createRouteMatcher,
  createRouting,
  Fragment,
  Path,
  Place,
  Query,
  RouteConfig,
  RouteDiff,
  RouteMatch,
  RouteObject,
  RouteParamsEncoder,
  Routing,
  RoutingRule,
} from '@state-utils/routes';
import {
  createStore,
  producer,
  Store,
  StoreActionTypes,
  StoreAfterTransitionEvents,
  StoreBeforeTransitionEvents,
  StoreCommands,
} from '@state-utils/stores';
import { createEffect } from '@state-utils/effects';
import {
  concat,
  concatMap,
  defer,
  EMPTY,
  filter,
  isObservable,
  map,
  Observable,
  of,
  takeUntil,
} from 'rxjs';
import { Historian } from '../../routes/src/historian';
import { createBrowserHistorian } from '../../routes/src/browser-historian';

const actionSources = createActionSources();

const routing = createRouting({
  baseHref: '/',
  pathEncoder: createPathEncoder(),
  queryEncoder: createQueryEncoder(),
  fragmentEncoder: createFragmentEncoder(),
  defaultData: {},
  defaultPlace: {
    path: [],
    query: {},
    fragment: undefined,
  },
});

const rootRoute = routing.createRoute({
  path: createPath(''),
  query: createQuery(),
  fragment: createFragment(),
});

const rootRouteConfig = routing.createRouteConfig(rootRoute, {});

interface RouterState<TPath, TQuery, TFragment> {
  id: string;
  place: Place<TPath, TQuery, TFragment>;
  state: unknown;
  routes: RouteObject<unknown, unknown, unknown>[];
  pendingNavigation?: {
    id: string;
    place: Place<TPath, TQuery, TFragment>;
    state: unknown;
    extras?: unknown;
  };
}

type RouterStorePayloads<TPath, TQuery, TFragment> = {
  startNavigation: {
    id: string;
    place: Place<TPath, TQuery, TFragment>;
    state: unknown;
    extras: unknown | undefined;
    queryMode: 'replace' | 'merge';
    fragmentMode: 'replace' | 'merge';
    historyMode: 'push' | 'replace';
  };
  completeNavigation: {
    id: string;
    place: Place<TPath, TQuery, TFragment>;
    state: unknown;
    routes: RouteObject<unknown, unknown, unknown>[];
    extras: unknown | undefined;
    queryMode: 'replace' | 'merge';
    fragmentMode: 'replace' | 'merge';
    historyMode: 'push' | 'replace';
  };
  cancelNavigation: {
    id: string;
    place: Place<TPath, TQuery, TFragment>;
    state: unknown;
    extras: unknown | undefined;
  };
};
type NavigateCommand<TPath, TQuery, TFragment> = {
  place?: Place<TPath, TQuery, TFragment>;
  state?: unknown;
  queryMode?: 'replace' | 'merge';
  fragmentMode?: 'replace' | 'merge';
  historyMode?: 'push' | 'replace';
  extras?: unknown;
};
type RouterActionTypes<TPath, TQuery, TFragment> = ActionTypes<{
  navigateCommand: NavigateCommand<TPath, TQuery, TFragment>;
  cancelNavigationCommand: void;
}> &
  StoreActionTypes<
    RouterState<TPath, TQuery, TFragment>,
    RouterStorePayloads<TPath, TQuery, TFragment>
  >;

function createRouterActionTypes<TPath, TQuery, TFragment>(
  namespace: string
): RouterActionTypes<TPath, TQuery, TFragment> {
  // @ts-expect-error unsafe cast
  return createActionTypes({ namespace });
}

const routerActionTypes = createRouterActionTypes<Path, Query, Fragment>(
  'router'
);

function createRouterStore<TPath, TQuery, TFragment>(
  actionSources: ActionSources,
  routerStoreDef: {
    routing: Routing<unknown, TPath, TQuery, TFragment>;
    actionTypes: RouterActionTypes<TPath, TQuery, TFragment>;
  }
) {
  const actionTypes = routerStoreDef.actionTypes as unknown as StoreActionTypes<
    RouterState<TPath, TQuery, TFragment>,
    RouterStorePayloads<TPath, TQuery, TFragment>
  >;
  const {
    routing: { defaultPlace },
  } = routerStoreDef;

  return createStore(actionSources, {
    actionTypes,
    state: {
      id: 'default',
      state: undefined,
      place: defaultPlace,
      routes: [],
    },
    transitions: {
      startNavigation: producer((state, payload) => {
        state.pendingNavigation = {
          id: payload.id,
          place: payload.place,
          state: payload.state,
          extras: payload.extras,
        };
      }),
      completeNavigation: producer((state, payload) => {
        state.place = payload.place;
        state.state = payload.state;
        state.pendingNavigation = undefined;
      }),
      cancelNavigation: producer((state) => {
        state.pendingNavigation = undefined;
      }),
    },
  });
}

const routerStore = createRouterStore(actionSources, {
  routing,
  actionTypes: routerActionTypes,
});

function hasParamsChanged<TParams>(
  pathEncoder: RouteParamsEncoder<unknown, TParams>,
  prevPath: TParams,
  nextPath: TParams
) {
  return !(
    pathEncoder.areParamsEqual?.(prevPath, nextPath) ||
    Object.is(prevPath, nextPath)
  );
}

function diffRoutes<TData, TPath, TQuery, TFragment>(
  prevMatches: RouteMatch<TData, TPath, TQuery, TFragment>[],
  nextMatches: RouteMatch<TData, TPath, TQuery, TFragment>[]
) {
  const n = Math.max(prevMatches.length, nextMatches.length);
  const diffs: RouteDiff<TData, TPath, TQuery, TFragment>[] = [];

  for (let i = 0; i < n; i++) {
    const prevMatch = prevMatches[i];
    const nextMatch = nextMatches[i];

    if (prevMatch?.routeConfig !== nextMatch?.routeConfig) {
      diffs.push({
        prevRouteMatch: prevMatch,
        routeMatch: nextMatch,
        routeChanged: true,
        pathParamsChanged: true,
        queryParamsChanged: true,
        fragmentParamsChanged: true,
      });
    } else {
      const routeConfig = nextMatch.routeConfig;
      const { pathEncoder, queryEncoder, fragmentEncoder } = routeConfig.route;
      const {
        path: prevPath,
        query: prevQuery,
        fragment: prevFragment,
      } = prevMatch.routeObject;
      const {
        path: nextPath,
        query: nextQuery,
        fragment: nextFragment,
      } = nextMatch.routeObject;
      const pathChanged = hasParamsChanged(pathEncoder, prevPath, nextPath);
      const queryChanged = hasParamsChanged(queryEncoder, prevQuery, nextQuery);
      const fragmentChanged = hasParamsChanged(
        fragmentEncoder,
        prevFragment,
        nextFragment
      );

      diffs.push({
        prevRouteMatch: prevMatch,
        routeMatch: nextMatch,
        routeChanged: false,
        pathParamsChanged: pathChanged,
        queryParamsChanged: queryChanged,
        fragmentParamsChanged: fragmentChanged,
      });
    }
  }

  return diffs;
}

interface RuleHook<T> {
  diff: RouteDiff<unknown, unknown, unknown, unknown>;
  hook: T;
}

function collectRuleHooks<T>(
  diffs: RouteDiff<unknown, unknown, unknown, unknown>[],
  getLeaveHook: (
    rule: RoutingRule<unknown, unknown, unknown, unknown>
  ) => T | undefined,
  getEnterHook: (
    rule: RoutingRule<unknown, unknown, unknown, unknown>
  ) => T | undefined
) {
  const hooks: RuleHook<T>[] = [];
  for (let i = diffs.length - 1; i >= 0; i--) {
    const diff = diffs[i];
    if (diff.prevRouteMatch) {
      for (const rule of diff.prevRouteMatch.routeConfig.rules) {
        if (rule.onBeforeRouteLeave !== undefined) {
          const hook = getLeaveHook(rule);
          if (hook !== undefined) {
            hooks.push({
              diff,
              hook,
            });
          }
        }
      }
    }
  }
  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i];
    if (diff.routeMatch) {
      for (const rule of diff.routeMatch.routeConfig.rules) {
        if (rule.onBeforeRouteLeave !== undefined) {
          const hook = getEnterHook(rule);
          if (hook !== undefined) {
            hooks.push({
              diff,
              hook,
            });
          }
        }
      }
    }
  }

  return hooks;
}

function beforeHooks<TData, TPath, TQuery, TFragment>(
  diffs: RouteDiff<TData, unknown, unknown, unknown>[],
  actionTypes: RouterActionTypes<TPath, TQuery, TFragment>
) {
  const hooks = collectRuleHooks(
    diffs,
    (rule) => rule.onBeforeRouteLeave,
    (rule) => rule.onBeforeRouteEnter
  );
  const observables: Observable<Place<any, any, any> | boolean>[] = [];
  for (const { diff, hook } of hooks) {
    observables.push(
      defer(() => {
        const result = hook({ routeDiff: diff, routeDiffs: diffs });
        return isObservable(result) ? result : EMPTY;
      })
    );
  }
  return concat(...observables).pipe(
    filter((value) => value !== true),
    map((value) => {
      if (typeof value === 'boolean') {
        return actionTypes.cancelNavigationCommand();
      } else {
        return actionTypes.navigateCommand({
          place: value,
        });
      }
    })
  );
}

function afterHooks(diffs: RouteDiff<unknown, unknown, unknown, unknown>[]) {
  const hooks = collectRuleHooks(
    diffs,
    (rule) => rule.onAfterRouteLeave,
    (rule) => rule.onAfterRouteEnter
  );
  for (const { diff, hook } of hooks) {
    hook({ routeDiff: diff, routeDiffs: diffs });
  }
}

function createCancelNavigationCommand<TPath, TQuery, TFragment>(
  actionTypes: ActionTypes<{
    navigateCommand: {
      place?: Place<TPath, TQuery, TFragment>;
      state?: unknown;
      queryMode?: 'replace' | 'merge';
      fragmentMode?: 'replace' | 'merge';
      historyMode?: 'push' | 'replace';
      extras?: unknown;
    };
    cancelNavigationCommand: void;
  }> &
    StoreBeforeTransitionEvents<
      RouterState<TPath, TQuery, TFragment>,
      RouterStorePayloads<TPath, TQuery, TFragment>
    > &
    StoreAfterTransitionEvents<
      RouterState<TPath, TQuery, TFragment>,
      RouterStorePayloads<TPath, TQuery, TFragment>
    > &
    StoreCommands<RouterStorePayloads<TPath, TQuery, TFragment>>,
  pendingNavigation: {
    id: string;
    place: Place<TPath, TQuery, TFragment>;
    state: unknown;
    extras?: unknown;
  }
) {
  const { id, place, state, extras } = pendingNavigation;
  const action = actionTypes.cancelNavigationCommand({
    id,
    place,
    state,
    extras,
  });
  return action;
}

function createStartNavigationCommand<TPath, TQuery, TFragment>(
  actionTypes: RouterActionTypes<TPath, TQuery, TFragment>,
  action: Action<NavigateCommand<TPath, TQuery, TFragment>>,
  currentPlace: Place<TPath, TQuery, TFragment>
) {
  const id = crypto.randomUUID();
  const {
    place = currentPlace,
    state = undefined,
    extras = undefined,
    historyMode = 'push',
    queryMode = 'replace',
    fragmentMode = 'replace',
  } = action.payload;
  return actionTypes.startNavigationCommand({
    id,
    place,
    state,
    extras,
    historyMode,
    queryMode,
    fragmentMode,
  });
}

interface Navigation<TData, Path, TQuery, TFragment> {
  matches: RouteMatch<TData, Path, TQuery, TFragment>[];
  diffs: RouteDiff<TData, Path, TQuery, TFragment, unknown, unknown, unknown>[];
}

function createRouter<TData, TPath, TQuery, TFragment>(
  actionSources: ActionSources,
  routerDef: {
    historian: Historian;
    routing: Routing<unknown, TPath, TQuery, TFragment>;
    actionTypes: RouterActionTypes<TPath, TQuery, TFragment>;
    store: Store<RouterState<TPath, TQuery, TFragment>>;
    root: RouteConfig<
      unknown,
      unknown,
      unknown,
      unknown,
      TPath,
      TQuery,
      TFragment
    >;
  }
) {
  const { root, historian, routing, store } = routerDef;
  const actionTypes = routerDef.actionTypes as RouterActionTypes<
    TPath,
    TQuery,
    TFragment
  > &
    StoreActionTypes<
      RouterState<TPath, TQuery, TFragment>,
      RouterStorePayloads<TPath, TQuery, TFragment>
    >;

  const matcher = createRouteMatcher(root);

  const navigate$ = actionSources.ofType(actionTypes.navigateCommand);
  const afterStartNavigation$ = actionSources.ofType(
    actionTypes.afterStartNavigationEvent
  );
  const afterCancelNavigation$ = actionSources.ofType(
    actionTypes.afterCancelNavigationEvent
  );
  const afterCompleteNavigation$ = actionSources.ofType(
    actionTypes.afterCompleteNavigationEvent
  );

  const navigations = new Map<
    string,
    Navigation<TData, TPath, TQuery, TFragment>
  >();

  return createEffect(actionSources, {
    name: 'router',
    effects: {
      triggerNavigation() {
        return navigate$.pipe(
          concatMap((action) => {
            const { place, pendingNavigation } = store.getState();
            return pendingNavigation === undefined
              ? of(createStartNavigationCommand(actionTypes, action, place))
              : of(
                  createCancelNavigationCommand(actionTypes, pendingNavigation),
                  createStartNavigationCommand(actionTypes, action, place)
                );
          })
        );
      },
      navigate() {
        return afterStartNavigation$.pipe(
          concatMap((action) => {
            const { payload, state: storeState } = action.payload;
            const {
              id,
              place,
              state,
              extras,
              historyMode,
              queryMode,
              fragmentMode,
            } = payload;

            const prevNavigation = navigations.get(storeState.id);

            const prevMatches = prevNavigation?.matches ?? [];
            const nextMatches = matcher.match(place) ?? [];

            const diffs = diffRoutes(prevMatches, nextMatches);
            const routes = nextMatches.map(({ routeObject }) => routeObject);

            navigations.set(id, {
              diffs,
              matches: nextMatches,
            });

            const navigationInterceptor = beforeHooks(diffs, actionTypes);

            return concat(
              navigationInterceptor,
              of(
                actionTypes.completeNavigationCommand({
                  id,
                  place,
                  state,
                  extras,
                  historyMode,
                  queryMode,
                  fragmentMode,
                  routes,
                })
              )
            ).pipe(takeUntil(afterCancelNavigation$));
          })
        );
      },
      completeNavigation() {
        return afterCompleteNavigation$.subscribe({
          next(action) {
            const { id, place, state, historyMode } = action.payload.payload;
            const href = routing.formatHref(place);

            switch (historyMode) {
              case 'push':
                historian.push(href, state);
                break;
              case 'replace':
                historian.replace(href, state);
                break;
            }

            const navigation = navigations.get(id);
            if (navigation !== undefined) {
              navigations.delete(id);
              afterHooks(navigation.diffs);
            }
          },
        });
      },
    },
  });
}

const router = createRouter(actionSources, {
  routing,
  historian: createBrowserHistorian(window),
  actionTypes: routerActionTypes,
  store: routerStore,
  root: rootRouteConfig,
});
