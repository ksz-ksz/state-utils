import { createRouting, Routing } from './routing';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';
import { createPath } from './create-path-params-encoder-factory';
import { createQuery } from './create-query-params-encoder-factory';
import { createFragment } from './create-fragment-params-encoder-factory';
import { params } from './params';
import { Place } from './place';
import { RouteObject } from './route-object';
import { RouteConfig } from './route-config';

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

function RootComponent() {}
function EntityComponent() {}
function EntityListComponent() {}
function EntityDetailsComponent() {}

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

interface Observer<T> {
  next(value: T): void;
  error(error: unknown): void;
  complete(): void;
}

interface Unsubscribable {
  unsubscribe(): void;
}

interface Subscribable<T> {
  subscribe(observer: Observer<T>): Unsubscribable;
}

interface SubscribableState<T> extends Subscribable<T> {
  getState(): T;
}

const EMPTY_UNSUBSCRIBABLE: Unsubscribable = {
  unsubscribe() {},
};

abstract class AbstractSubject<T> implements Subscribable<T> {
  private observers: Observer<T>[] | undefined = [];
  private currentObservers: Observer<T>[] | undefined = undefined;

  subscribe(observer: Observer<T>): Unsubscribable {
    if (this.observers === undefined) {
      return EMPTY_UNSUBSCRIBABLE;
    }

    this.currentObservers = undefined;
    this.observers.push(observer);

    return {
      unsubscribe: () => {
        if (this.observers === undefined) {
          return;
        }

        const indexOfObserver = this.observers.indexOf(observer);
        if (indexOfObserver !== -1) {
          this.currentObservers = undefined;
          this.observers.splice(indexOfObserver, 1);
        }
      },
    };
  }

  protected next(value: T) {
    if (this.observers === undefined) {
      return;
    }
    if (this.currentObservers === undefined) {
      this.currentObservers = Array.from(this.observers);
    }
    for (const observer of this.currentObservers) {
      observer.next(value);
    }
  }

  protected error(error: unknown) {
    if (this.observers === undefined) {
      return;
    }
    if (this.currentObservers === undefined) {
      this.currentObservers = Array.from(this.observers);
    }
    for (const observer of this.currentObservers) {
      observer.error(error);
    }
    this.observers = undefined;
    this.currentObservers = undefined;
  }

  protected complete() {
    if (this.observers === undefined) {
      return;
    }
    if (this.currentObservers === undefined) {
      this.currentObservers = Array.from(this.observers);
    }
    for (const observer of this.currentObservers) {
      observer.complete();
    }
    this.observers = undefined;
    this.currentObservers = undefined;
  }
}

class EventsSubject<TEvent> extends AbstractSubject<TEvent> {
  dispatch(event: TEvent): void {
    this.next(event);
  }
}

class StateSubject<TState>
  extends AbstractSubject<TState>
  implements SubscribableState<TState>
{
  constructor(private state: TState) {
    super();
  }

  getState(): TState {
    return this.state;
  }

  setState(state: TState) {
    this.state = state;
    this.next(state);
  }
}

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
    options: NavigateOptions<TPath, TQuery, TFragment>
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

class RouterImpl<TData, TPath, TQuery, TFragment> {
  readonly state = new StateSubject<RouterState<TPath, TQuery, TFragment>>({
    id: 'default',
    place: this.routing.defaultPlace,
    routes: [],
    state: undefined,
  });
  readonly events = new EventsSubject<RouterEvent<TPath, TQuery, TFragment>>();

  private navigation: Navigation<TPath, TQuery, TFragment> | undefined =
    undefined;

  constructor(
    private readonly root: RouteConfig<TData, TPath, TQuery, TFragment>,
    readonly routing: Routing<TData, TPath, TQuery, TFragment>,
    readonly historian: Historian
  ) {}

  async navigate(
    options: NavigateOptions<TPath, TQuery, TFragment>
  ): Promise<NavigateResult<TPath, TQuery, TFragment>> {
    if (this.navigation !== undefined) {
      this.events.dispatch({
        type: 'navigation-canceled',
        ...this.navigation,
      });
    }

    const routerState = this.state.getState();
    const {
      place = routerState.place,
      state = routerState.state,
      action = 'push',
      extras,
      queryMode = 'replace',
      fragmentMode = 'replace',
    } = options;
    this.navigation = {
      id: crypto.randomUUID(),
      place,
      state,
      action,
      extras,
    };
  }

  cancelNavigation(): void;

  getNavigationExtras(): unknown | undefined;
}

const router = createRouter({
  routing,
  historian: createMemoryHistorian(),
  root: rootRouteConfig,
});
