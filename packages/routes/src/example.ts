import { Encoder } from './encoder';
import { createRouting } from './routing';
import { createBrowserHistorian } from './browser-historian';
import { createPathEncoder } from './path';
import { createQueryEncoder } from './query';
import { createFragmentEncoder } from './fragment';
import { pathFn } from './path-fn';
import { queryFn } from './query-fn';
import { fragmentFn } from './fragment-fn';
import { createPlace } from './place';

const routing = createRouting({
  historian: createBrowserHistorian(),
  pathEncoder: createPathEncoder(),
  queryEncoder: createQueryEncoder(),
  fragmentEncoder: createFragmentEncoder(),
  pathFn,
  queryFn,
  fragmentFn,
});

const params: {
  enum<T extends string>(options: { values: T[] }): Encoder<T, string>;
  string<T extends string>(options?: {
    pattern?: string | RegExp;
    minLength?: number;
    maxLength?: number;
  }): Encoder<T, string>;
  number<T extends number>(options?: {
    integer?: boolean;
    min?: number;
    max?: number;
  }): Encoder<T, string>;
  boolean<T extends boolean>(options?: {
    trueValue?: string;
    falseValue?: string;
  }): Encoder<T, string>;
} = undefined as any;

const rootRoute = routing.createRoute({
  path: routing.path({
    path: ':pathParamBase',
    params: {
      pathParamBase: params.number(),
    },
  }),
  query: routing.query({
    params: {
      queryParamBase: params.enum({
        values: ['hi', 'hello'],
      }),
    },
  }),
  fragment: routing.fragment(),
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

const baseRoute = routing.createRoute({});

createPlace(baseRoute);
createPlace(baseRoute, {});
createPlace(baseRoute, {
  path: {
    x: 1,
  },
});

// @ts-expect-error options must be provided
createPlace(entityRoute);

// @ts-expect-error options.path must be provided
createPlace(entityRoute, {});

// @ts-expect-error options.path.x is unknown
createPlace(entityRoute, {
  path: {
    x: 1,
    pathParamBase: 1,
  },
});

// @ts-expect-error options.path.x is unknown
createPlace(entityDetailsRoute, {
  path: {
    x: 1,
    pathParamBase: 1,
    entityId: '2',
  },
});

createPlace(entityRoute, {
  path: {
    pathParamBase: 1,
  },
  query: {
    baz: 'asd',
  },
});

createPlace(entityDetailsRoute, {
  path: {
    pathParamBase: 1,
    entityId: '2',
  },
  query: {
    baz: 'asd',
  },
});

// type InferPath<T> = T extends Route<infer U, any, any> ? U : never;
