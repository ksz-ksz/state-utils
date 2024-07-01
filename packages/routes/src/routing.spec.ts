import { createRouting } from './routing';
import { createBrowserHistorian } from './browser-historian';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';
import { createPathParamsEncoderFactory } from './create-path-params-encoder-factory';
import { createQueryParamsEncoderFactory } from './create-query-params-encoder-factory';
import { createFragmentParamsEncoderFactory } from './create-fragment-params-encoder-factory';
import { params } from './params';

function createTestRouting() {
  return createRouting({
    historian: createBrowserHistorian(),
    pathEncoder: createPathEncoder(),
    queryEncoder: createQueryEncoder(),
    fragmentEncoder: createFragmentEncoder(),
    pathParamsEncoderFactory: createPathParamsEncoderFactory,
    queryParamsEncoderFactory: createQueryParamsEncoderFactory,
    fragmentParamsEncoderFactory: createFragmentParamsEncoderFactory,
    defaultPlace: {
      path: [],
      query: {},
      fragment: undefined,
    },
  });
}

describe('routing', () => {
  describe('createPlace', () => {
    it('should create place', () => {
      const routing = createTestRouting();

      const rootRoute = routing.createRoute({
        path: routing.path({
          path: '',
        }),
        query: routing.query(),
        fragment: routing.fragment(),
      });

      const entityRoute = routing.createRoute({
        parent: rootRoute,
        path: routing.path({
          path: 'book',
        }),
      });

      const entityDetailsRoute = routing.createRoute({
        parent: entityRoute,
        path: routing.path({
          path: ':bookId',
          params: {
            bookId: params.string(),
          },
        }),
        query: routing.query({
          params: {
            foo: params.number(),
          },
        }),
        fragment: routing.fragment({
          param: params.boolean(),
        }),
      });

      const place = routing.createPlace(entityDetailsRoute, {
        path: {
          bookId: '1234',
        },
        query: {
          foo: 42,
        },
        fragment: true,
      });

      expect(place).toMatchInlineSnapshot(`
{
  "fragment": "true",
  "path": [
    "",
    "book",
    "1234",
  ],
  "query": {
    "foo": "42",
  },
}
`);
    });
  });
});
