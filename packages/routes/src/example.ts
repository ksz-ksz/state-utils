import { createRouting } from './routing';
import { createBrowserHistorian } from './browser-historian';
import { createPath } from './create-path-params-encoder-factory';
import { createQuery } from './create-query-params-encoder-factory';
import { createFragment } from './create-fragment-params-encoder-factory';
import { params } from './params';
import { createPathEncoder } from './path-encoder';
import { createQueryEncoder } from './query-encoder';
import { createFragmentEncoder } from './fragment-encoder';

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

createPath(':a', {
  a: params.string(),
});

createPath(':c', {
  c: params.string(),
});

const rootRoute = routing.createRoute({
  path: createPath(':pathParamBase', {
    pathParamBase: params.number(),
  }),
  query: createQuery({
    queryParamBase: params.string(),
  }),
  fragment: createFragment(params.string()),
});

const entityRoute = routing.createRoute({
  parent: rootRoute,
  query: createQuery({
    baz: params.string(),
  }),
});

const entityDetailsRoute = routing.createRoute({
  parent: entityRoute,
  path: createPath(':entityId', {
    entityId: params.string({
      pattern: /ENTITY-[0-9]{16}/,
    }),
  }),
});

// @ts-expect-error must provide encoders for root route
routing.createRoute({});

const baseRoute = routing.createRoute({
  path: createPath(''),
  query: createQuery(),
  fragment: createFragment(),
});

routing.createPlace(baseRoute);
routing.createPlace(baseRoute, {});
routing.createPlace(baseRoute, {
  path: {
    // fixme: @ts-expect-error options.path.x is unknown
    x: 1,
  },
});

routing.createPlace(baseRoute, {
  query: {
    // fixme: @ts-expect-error options.path.x is unknown
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

const rootRoute2 = routing.createRoute({
  path: createPath(''),
  query: createQuery(),
  fragment: createFragment(),
});

const entityRoute2 = routing.createRoute({
  parent: rootRoute2,
  path: createPath('entity'),
});

const entityDetailsRoute2 = routing.createRoute({
  parent: entityRoute2,
  path: createPath(':entityId', {
    entityId: params.string({
      pattern: /ENTITY-[0-9]{8}/,
    }),
  }),
});

// @ts-expect-error options are expected
routing.createPlace(entityDetailsRoute2);
