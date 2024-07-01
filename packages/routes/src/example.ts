import { createRouting } from './routing';
import { createBrowserHistorian } from './browser-historian';
import { createPathParamsEncoderFactory } from './create-path-params-encoder-factory';
import { createQueryParamsEncoderFactory } from './create-query-params-encoder-factory';
import { createFragmentParamsEncoderFactory } from './create-fragment-params-encoder-factory';
import { params } from './params';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';

const routing = createRouting({
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

const rootRoute = routing.createRoute({
  path: routing.path({
    path: ':pathParamBase',
    params: {
      pathParamBase: params.number(),
    },
  }),
  query: routing.query({
    params: {
      queryParamBase: params.string(),
    },
  }),
  fragment: routing.fragment({
    param: params.string(),
  }),
});

const entityRoute = routing.createRoute({
  parent: rootRoute,
  query: routing.query({
    params: {
      baz: params.string(),
    },
  }),
});

const entityDetailsRoute = routing.createRoute({
  parent: entityRoute,
  path: routing.path({
    path: ':entityId',
    params: {
      entityId: params.string({
        pattern: /ENTITY-[0-9]{16}/,
      }),
    },
  }),
});

// @ts-expect-error must provide encoders for root route
routing.createRoute({});

const baseRoute = routing.createRoute({
  path: routing.path({
    path: '',
  }),
  query: routing.query(),
  fragment: routing.fragment(),
});

routing.createPlace(baseRoute);
routing.createPlace(baseRoute, {});
routing.createPlace(baseRoute, {
  path: {
    // @ts-expect-error options.path.x is unknown
    x: 1,
  },
});

routing.createPlace(baseRoute, {
  query: {
    // @ts-expect-error options.path.x is unknown
    x: 1,
  },
});

// @ts-expect-error options must be provided
routing.createPlace(entityRoute);

// @ts-expect-error options.path must be provided
routing.createPlace(entityRoute, {});

// @ts-expect-error options.path.x is unknown
routing.createPlace(entityRoute, {
  path: {
    x: 1,
    pathParamBase: 1,
  },
});

// @ts-expect-error options.path.x is unknown
routing.createPlace(entityDetailsRoute, {
  path: {
    x: 1,
    pathParamBase: 1,
    entityId: '2',
  },
});

routing.createPlace(entityRoute, {
  path: {
    pathParamBase: 1,
  },
  query: {
    baz: 'asd',
  },
});

routing.createPlace(entityDetailsRoute, {
  path: {
    pathParamBase: 1,
    entityId: '2',
  },
  query: {
    queryParamBase: '',
    baz: 'asd',
  },
});

// type InferPath<T> = T extends Route<infer U, any, any> ? U : never;
