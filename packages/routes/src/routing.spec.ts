import { createRouting } from './routing';
import { createBrowserHistorian } from './browser-historian';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';
import { path } from './create-path-params-encoder-factory';
import { query } from './create-query-params-encoder-factory';
import { fragment } from './create-fragment-params-encoder-factory';
import { params } from './params';

function createTestHarness() {
  const routing = createRouting({
    historian: createBrowserHistorian(),
    pathEncoder: createPathEncoder(),
    queryEncoder: createQueryEncoder(),
    fragmentEncoder: createFragmentEncoder(),
    defaultPlace: {
      path: [],
      query: {},
      fragment: undefined,
    },
  });

  const rootRoute = routing.createRoute({
    path: path({
      path: '',
    }),
    query: query(),
    fragment: fragment(),
  });

  const testParentRoute = routing.createRoute({
    parent: rootRoute,
    path: path({
      path: 'test',
    }),
  });

  const testRoute = routing.createRoute({
    parent: testParentRoute,
    path: path({
      path: ':pathParam',
      params: {
        pathParam: params.string({
          pattern: /^valid-path-param$/,
        }),
      },
    }),
    query: query({
      params: {
        queryParam: params.string({
          pattern: /^valid-query-param$/,
        }),
      },
    }),
    fragment: fragment({
      param: params.string({
        pattern: /^valid-fragment$/,
      }),
    }),
  });
  return { routing, testRoute };
}

describe('routing', () => {
  describe('createPlace', () => {
    it('should create place', () => {
      const { routing, testRoute } = createTestHarness();

      const place = routing.createPlace(testRoute, {
        path: {
          pathParam: 'valid-path-param',
        },
        query: {
          queryParam: 'valid-query-param',
        },
        fragment: 'valid-fragment',
      });

      expect(place).toMatchInlineSnapshot(`
{
  "fragment": "valid-fragment",
  "path": [
    "",
    "test",
    "valid-path-param",
  ],
  "query": {
    "queryParam": "valid-query-param",
  },
}
`);
    });

    it('should create default place if path param is invalid', () => {
      const { routing, testRoute } = createTestHarness();

      const place = routing.createPlace(testRoute, {
        path: {
          pathParam: 'invalid-path-param',
        },
        query: {
          queryParam: 'valid-query-param',
        },
        fragment: 'valid-fragment',
      });

      expect(place).toMatchInlineSnapshot(`
{
  "fragment": undefined,
  "path": [],
  "query": {},
}
`);
    });
  });
});
