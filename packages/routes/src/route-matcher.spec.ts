import { createRouting } from './routing';
import { createBrowserHistorian } from './browser-historian';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';
import { createPath } from './create-path-params-encoder-factory';
import { createQuery } from './create-query-params-encoder-factory';
import { createFragment } from './create-fragment-params-encoder-factory';
import { params } from './params';
import { createRouteMatcher } from './route-matcher';

function createTestHarness() {
  const routing = createRouting({
    historian: createBrowserHistorian(),
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

  const fooWithNumberRoute = routing.createRoute({
    parent: rootRoute,
    path: createPath('foo/:numberParam', {
      numberParam: params.number(),
    }),
  });

  const fooWithStringRoute = routing.createRoute({
    parent: rootRoute,
    path: createPath('foo/:stringParam', {
      stringParam: params.string(),
    }),
  });

  const barRoute = routing.createRoute({
    parent: rootRoute,
    path: createPath('bar'),
  });

  const bazRoute = routing.createRoute({
    parent: barRoute,
    path: createPath(''),
  });

  const fooWithNumberRouteConfig = routing.createRouteConfig(
    fooWithNumberRoute,
    {}
  );

  const fooWithStringRouteConfig = routing.createRouteConfig(
    fooWithStringRoute,
    {}
  );

  const bazRouteConfig = routing.createRouteConfig(bazRoute, {});

  const barRouteConfig = routing.createRouteConfig(barRoute, {
    children: [bazRouteConfig],
  });

  const rootRouteConfig = routing.createRouteConfig(rootRoute, {
    children: [
      fooWithNumberRouteConfig,
      fooWithStringRouteConfig,
      barRouteConfig,
    ],
  });

  const routeMatcher = createRouteMatcher(rootRouteConfig);
  return {
    routing,
    fooWithStringRoute,
    fooWithStringRouteConfig,
    fooWithNumberRoute,
    fooWithNumberRouteConfig,
    barRoute,
    barRouteConfig,
    bazRoute,
    bazRouteConfig,
    rootRouteConfig,
    routeMatcher,
  };
}

describe('route-matcher fooWithString', () => {
  describe('match', () => {
    it('should match', () => {
      const {
        routing,
        fooWithStringRoute,
        fooWithStringRouteConfig,
        rootRouteConfig,
        routeMatcher,
      } = createTestHarness();

      const place = routing.createPlace(fooWithStringRoute, {
        path: {
          stringParam: 'hello',
        },
      });

      const result = routeMatcher.match(place);
      const routeConfigs = result?.map(({ routeConfig }) => routeConfig);
      const routeObjects = result?.map(({ routeObject }) => routeObject);

      expect(routeConfigs).toEqual([rootRouteConfig, fooWithStringRouteConfig]);
      expect(routeObjects).toMatchInlineSnapshot(`
[
  {
    "fragment": undefined,
    "id": 0,
    "path": {},
    "query": {},
  },
  {
    "fragment": undefined,
    "id": 2,
    "path": {
      "stringParam": "hello",
    },
    "query": {},
  },
]
`);
    });

    it('should match fooWithNumber', () => {
      const {
        routing,
        fooWithNumberRoute,
        fooWithNumberRouteConfig,
        rootRouteConfig,
        routeMatcher,
      } = createTestHarness();

      const place = routing.createPlace(fooWithNumberRoute, {
        path: {
          numberParam: 17,
        },
      });

      const result = routeMatcher.match(place);
      const routeConfigs = result?.map(({ routeConfig }) => routeConfig);
      const routeObjects = result?.map(({ routeObject }) => routeObject);

      expect(routeConfigs).toEqual([rootRouteConfig, fooWithNumberRouteConfig]);
      expect(routeObjects).toMatchInlineSnapshot(`
[
  {
    "fragment": undefined,
    "id": 0,
    "path": {},
    "query": {},
  },
  {
    "fragment": undefined,
    "id": 1,
    "path": {
      "numberParam": 17,
    },
    "query": {},
  },
]
`);
    });

    it('should match baz', () => {
      const {
        routing,
        bazRoute,
        bazRouteConfig,
        barRouteConfig,
        rootRouteConfig,
        routeMatcher,
      } = createTestHarness();

      const place = routing.createPlace(bazRoute);

      const result = routeMatcher.match(place);
      const routeConfigs = result?.map(({ routeConfig }) => routeConfig);
      const routeObjects = result?.map(({ routeObject }) => routeObject);

      expect(routeConfigs).toEqual([
        rootRouteConfig,
        barRouteConfig,
        bazRouteConfig,
      ]);
      expect(routeObjects).toMatchInlineSnapshot(`
[
  {
    "fragment": undefined,
    "id": 0,
    "path": {},
    "query": {},
  },
  {
    "fragment": undefined,
    "id": 3,
    "path": {},
    "query": {},
  },
  {
    "fragment": undefined,
    "id": 4,
    "path": {},
    "query": {},
  },
]
`);
    });
  });
});
