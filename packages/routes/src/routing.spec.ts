import { createRouting } from './routing';
import { createBrowserHistorian } from './browser-historian';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';
import { createPath } from './create-path-params-encoder-factory';
import { createQuery } from './create-query-params-encoder-factory';
import { createFragment } from './create-fragment-params-encoder-factory';
import { params } from './params';

function createTestHarness() {
  const routing = createRouting({
    historian: createBrowserHistorian(),
    baseHref: '/base/href/',
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

  const testParentRoute = routing.createRoute({
    parent: rootRoute,
    path: createPath('test'),
  });

  const testRoute = routing.createRoute({
    parent: testParentRoute,
    path: createPath(':pathParam', {
      pathParam: params.string({
        pattern: /^valid-path-param$/,
      }),
    }),
    query: createQuery({
      queryParam: params.string({
        pattern: /^valid-query-param$/,
      }),
    }),
    fragment: createFragment(
      params.string({
        pattern: /^valid-fragment$/,
      })
    ),
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

  describe('parseHref', () => {
    it('should parse href with relative path', () => {
      const { routing } = createTestHarness();

      const result = routing.parseHref('foo/bar');

      expect(result).toMatchInlineSnapshot(`
{
  "fragment": "",
  "path": [
    "foo",
    "bar",
  ],
  "query": {},
}
`);
    });

    it('should parse href with root-relative path', () => {
      const { routing } = createTestHarness();

      const result = routing.parseHref('/base/href/foo/bar');

      expect(result).toMatchInlineSnapshot(`
{
  "fragment": "",
  "path": [
    "foo",
    "bar",
  ],
  "query": {},
}
`);
    });
  });

  it('should parse href with query', () => {
    const { routing } = createTestHarness();

    const result = routing.parseHref('foo/bar?a=hi&b=7');

    expect(result).toMatchInlineSnapshot(`
{
  "fragment": "",
  "path": [
    "foo",
    "bar",
  ],
  "query": {
    "a": "hi",
    "b": "7",
  },
}
`);
  });

  it('should parse href with fragment', () => {
    const { routing } = createTestHarness();

    const result = routing.parseHref('foo/bar#baz');

    expect(result).toMatchInlineSnapshot(`
{
  "fragment": "baz",
  "path": [
    "foo",
    "bar",
  ],
  "query": {},
}
`);
  });

  it('should parse href with path, query, and fragment', () => {
    const { routing } = createTestHarness();

    const result = routing.parseHref('foo/bar?a=hi&b=7#baz');

    expect(result).toMatchInlineSnapshot(`
{
  "fragment": "baz",
  "path": [
    "foo",
    "bar",
  ],
  "query": {
    "a": "hi",
    "b": "7",
  },
}
`);
  });

  describe('formatHref', () => {
    it('should format href', () => {
      const { routing } = createTestHarness();

      const result = routing.formatHref({
        path: ['foo', 'bar'],
        query: {
          a: 'hi',
          b: '7',
        },
        fragment: 'baz',
      });

      expect(result).toMatchInlineSnapshot(`"/base/href/foo/bar?a=hi&b=7#baz"`);
    });
  });
});
