import { createRouting, Routing } from './routing';
import { RouteConfig } from './route-config';
import { createControlledStore } from '@state-utils/stores';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';
import { createPath } from './create-path-params-encoder-factory';
import { createQuery } from './create-query-params-encoder-factory';
import { createFragment } from './create-fragment-params-encoder-factory';
import { params } from './params';
import { Place } from './place';
import { RouteObject } from './route-object';
import { Historian } from './historian';

const routing = createRouting({
  baseHref: '',
  pathEncoder: createPathEncoder(),
  queryEncoder: createQueryEncoder(),
  fragmentEncoder: createFragmentEncoder(),
  defaultData: {} as { component?: any },
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

const entityRoute = routing.createRoute({
  parent: rootRoute,
  path: createPath('entity'),
});

const entityListRoute = routing.createRoute({
  parent: entityRoute,
  path: createPath(''),
});

const entityDetailsRoute = routing.createRoute({
  parent: entityRoute,
  path: createPath(':entityId', {
    entityId: params.string(),
  }),
});

function RootComponent() {
}

function EntityComponent() {
}

function EntityListComponent() {
}

function EntityDetailsComponent() {
}

const rootRouteConfig = routing.createRouteConfig(rootRoute, {
  data: {
    component: RootComponent,
  },
  children: [
    routing.createRouteConfig(entityRoute, {
      data: {
        component: EntityComponent,
      },
      children: [
        routing.createRouteConfig(entityListRoute, {
          data: {
            component: EntityListComponent,
          },
        }),
        routing.createRouteConfig(entityDetailsRoute, {
          data: {
            component: EntityDetailsComponent,
          },
        }),
      ],
    }),
  ],
});

interface NavigateOptions<TPath, TQuery, TFragment> {
  place?: Place<TPath, TQuery, TFragment>;
  state?: unknown;
  action?: 'push' | 'replace';
  extras?: unknown;
  queryMode?: 'replace' | 'merge';
  fragmentMode?: 'replace' | 'merge';
}

interface NavigateResult<TPath, TQuery, TFragment> {
  place: Place<TPath, TQuery, TFragment>;
}

interface RouterState<TPath, TQuery, TFragment> {
  id: string;
  place: Place<TPath, TQuery, TFragment>;
  state: unknown;
  routes: RouteObject<unknown, unknown, unknown>[];
}

interface NavigationStarted<TPath, TQuery, TFragment> {
  type: 'navigation-started';
  id: string;
  place: Place<TPath, TQuery, TFragment>;
  state: unknown;
  action: 'pop' | 'push' | 'replace';
  extras: unknown;
}

interface NavigationCanceled<TPath, TQuery, TFragment> {
  type: 'navigation-canceled';
  id: string;
  place: Place<TPath, TQuery, TFragment>;
  state: unknown;
  action: 'pop' | 'push' | 'replace';
  extras: unknown;
}

interface NavigationCompleted<TPath, TQuery, TFragment> {
  type: 'navigation-completed';
  id: string;
  place: Place<TPath, TQuery, TFragment>;
  state: unknown;
  action: 'pop' | 'push' | 'replace';
  extras: unknown;
  routes: RouteObject<unknown, unknown, unknown>[];
}

type RouterEvent<TPath, TQuery, TFragment> =
  | NavigationStarted<TPath, TQuery, TFragment>
  | NavigationCanceled<TPath, TQuery, TFragment>
  | NavigationCompleted<TPath, TQuery, TFragment>;

interface Router<TPath, TQuery, TFragment> {
  readonly state: SubscribableState<RouterState<TPath, TQuery, TFragment>>;
  readonly events: Subscribable<RouterEvent<TPath, TQuery, TFragment>>;

  navigate(
    options: NavigateOptions<TPath, TQuery, TFragment>,
  ): Promise<NavigateResult<TPath, TQuery, TFragment>>;

  cancelNavigation(): void;

  getNavigationExtras(): unknown | undefined;
}

interface Navigation<TPath, TQuery, TFragment> {
  id: string;
  place: Place<TPath, TQuery, TFragment>;
  state: unknown;
  action: 'pop' | 'push' | 'replace';
  extras: unknown;
}

function createInitialState<TPath, TQuery, TFragment>(place: Place<TPath, TQuery, TFragment>, state: unknown): RouterState<TPath, TQuery, TFragment {
  return {
    id: 'initial',
    place,
    state,
    routes: [],
  };
}

export function createRouter<TData, TPath, TQuery, TFragment>({routing,historian, root}: {
  routing: Routing<TData, TPath, TQuery, TFragment>;
  historian: Historian;
  root: RouteConfig<TData, unknown, unknown, unknown, TPath, TQuery, TFragment>;
}) {
  return createControlledStore((): RouterState<TPath, TQuery, TFragment> => ({
    id: 'initial',
    place: routing.parseHref(historian.getHref()),
    state: historian.getState(),
    routes: []//eek
  }), ({get, set}) => {

  });
}
