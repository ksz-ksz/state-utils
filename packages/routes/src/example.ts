interface HistoryController {}

interface Encoder<TEncoded, TDecoded> {
  encode(value: TDecoded): TEncoded;
  decode(value: TEncoded): TDecoded;
}

interface EncoderFactory<TEncoded, TDecoded, TParentDecoded> {
  (parent: Encoder<TEncoded, TParentDecoded>): Encoder<TEncoded, TDecoded>;
}

interface EncoderFactoryFn<TEncodedPath, TDecoded, TParentDecoded> {
  (...args: any[]): EncoderFactory<TEncodedPath, TDecoded, TParentDecoded>;
}

interface Route<
  TPath,
  TQuery,
  TFragment,
  TEncodedPath = unknown,
  TEncodedQuery = unknown,
  TEncodedFragment = unknown,
> {
  readonly id: number;
  readonly parent: Route<unknown, unknown, unknown> | undefined;
  readonly pathEncoder: Encoder<TEncodedPath, TPath> | undefined;
  readonly queryEncoder: Encoder<TEncodedQuery, TQuery> | undefined;
  readonly fragmentEncoder: Encoder<TEncodedFragment, TFragment> | undefined;
}

interface Routing<
  // TPath,
  // TQuery,
  // TFragment,
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
  TPathFn extends EncoderFactoryFn<TEncodedPath, unknown, unknown>,
  TQueryFn extends EncoderFactoryFn<TEncodedQuery, unknown, unknown>,
  TFragmentFn extends EncoderFactoryFn<TEncodedFragment, unknown, unknown>,
> {
  path: TPathFn;
  query: TQueryFn;
  fragment: TFragmentFn;
  pathEncoder: Encoder<string, TEncodedPath>;
  queryEncoder: Encoder<string, TEncodedQuery>;
  fragmentEncoder: Encoder<string, TEncodedFragment>;

  createRoute: <
    TParentPath = never,
    TParentQuery = never,
    TParentFragment = never,
    TPath = TParentPath,
    TQuery = TParentQuery,
    TFragment = TParentFragment,
  >(options: {
    parent?: Route<TParentPath, TParentQuery, TParentFragment>;
    path?: EncoderFactory<TEncodedPath, TPath, TParentPath>;
    query?: EncoderFactory<TEncodedQuery, TQuery, TParentQuery>;
    fragment?: EncoderFactory<TEncodedFragment, TFragment, TParentFragment>;
  }) => Route<
    TPath,
    TQuery,
    TFragment,
    TEncodedPath,
    TEncodedQuery,
    TEncodedFragment
  >;
}

function createRouting<
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
  TPathFn extends EncoderFactoryFn<TEncodedPath, unknown, unknown>,
  TQueryFn extends EncoderFactoryFn<TEncodedQuery, unknown, unknown>,
  TFragmentFn extends EncoderFactoryFn<TEncodedFragment, unknown, unknown>,
>(options: {
  history: HistoryController;
  pathEncoder: Encoder<string, TEncodedPath>;
  queryEncoder: Encoder<string, TEncodedQuery>;
  fragmentEncoder: Encoder<string, TEncodedFragment>;
  pathFn: TPathFn;
  queryFn: TQueryFn;
  fragmentFn: TFragmentFn;
}): Routing<
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
  TPathFn,
  TQueryFn,
  TFragmentFn
> {
  // @ts-expect-error fixme
  return options;
}

function createBrowserHistory(): HistoryController {
  // @ts-expect-error fixme
  return undefined;
}

interface PathPathSegment {
  type: 'path';
  literal: string;
}

interface PathParamPathSegment {
  type: 'path-param';
  param: string;
}

type PathSegment = PathPathSegment | PathParamPathSegment;

interface Path {
  segments: PathSegment[];
}

function createPathEncoder(): Encoder<string, Path> {
  // @ts-expect-error fixme
  return undefined;
}

interface Query {
  get(key: string): string;
  set(key: string, value: string): void;
}

function createQueryEncoder(): Encoder<string, Query> {
  return undefined as any;
}

interface Fragment {
  value: string;
}

function createFragmentEncoder(): Encoder<string, Fragment> {
  return undefined as any;
}

type InferPathSegments<TPath extends string> = TPath extends ''
  ? never
  : TPath extends `${infer THead}/${infer TTail}`
    ? (THead extends '' ? never : THead) | InferPathSegments<TTail>
    : TPath;

type InferParamName<TPathSegment> = TPathSegment extends `:${infer TParamName}`
  ? TParamName
  : never;

type InferParamNames<TPath extends string> = InferParamName<
  InferPathSegments<TPath>
>;

type PathParams<TPath extends string> = {
  [K in InferParamNames<TPath>]: unknown;
};

type MapEncoders<TParams> = {
  [K in keyof TParams]: Encoder<TParams[K], unknown>;
};

function pathFn<
  TPath extends string,
  TParams extends PathParams<TPath>,
  TParentParams,
>(
  options: object extends TParams
    ? {
        path: TPath;
        params?: MapEncoders<TParams>;
      }
    : {
        path: TPath;
        params: MapEncoders<TParams>;
      }
): (
  parent: Encoder<Path, TParentParams>
) => Encoder<Path, TParentParams & TParams> {
  // @ts-expect-error fixme
  return options;
}

function queryFn<TParams, TParentParams>(options?: {
  params?: MapEncoders<TParams>;
}): (
  parent: Encoder<Query, TParentParams>
) => Encoder<Query, Partial<TParentParams & TParams>> {
  // @ts-expect-error fixme
  return options;
}

function fragmentFn<TParam>(): () => Encoder<Fragment, TParam> {
  return undefined as any;
}

interface Location {
  path: string;
  query: string;
  fragment: string;
}

function createLocation<TPath extends object, TQuery, TFragment>(
  route: Route<TPath, TQuery, TFragment>,
  options: {
    path: TPath;
    query?: TQuery;
    fragment?: TFragment;
  }
): Location;
function createLocation<TPath extends never, TQuery, TFragment>(
  route: Route<TPath, TQuery, TFragment>,
  options?: {
    path?: TPath;
    query?: TQuery;
    fragment?: TFragment;
  }
): Location;
function createLocation(
  route: Route<unknown, unknown, unknown>,
  options?: {
    path?: unknown;
    query?: unknown;
    fragment?: unknown;
  }
): Location {
  // @ts-expect-error fixme
  return [route, options];
}

// function createLocation<TPath, TQuery, TFragment>(
//   route: Route<TPath, TQuery, TFragment>,
//   options: TPath extends object
//     ? {
//         path: TPath;
//         query?: TQuery;
//         fragment?: TFragment;
//       }
//     : {
//         path?: TPath;
//         query?: TQuery;
//         fragment?: TFragment;
//       }
// ): Location {
//   // @ts-expect-error fixme
//   return [route, options];
// }

const routing = createRouting({
  history: createBrowserHistory(),
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

createLocation(baseRoute);
createLocation(baseRoute, {});
createLocation(baseRoute, {
  path: {
    x: 1,
  },
});

// @ts-expect-error options must be provided
createLocation(entityRoute);

// @ts-expect-error options.path must be provided
createLocation(entityRoute, {});

// @ts-expect-error options.path.x is unknown
createLocation(entityRoute, {
  path: {
    x: 1,
    pathParamBase: 1,
  },
});

// @ts-expect-error options.path.x is unknown
createLocation(entityDetailsRoute, {
  path: {
    x: 1,
    pathParamBase: 1,
    entityId: '2',
  },
});

createLocation(entityRoute, {
  path: {
    pathParamBase: 1,
  },
  query: {
    baz: 'asd',
  },
});

createLocation(entityDetailsRoute, {
  path: {
    pathParamBase: 1,
    entityId: '2',
  },
  query: {
    baz: 'asd',
  },
});

// type InferPath<T> = T extends Route<infer U, any, any> ? U : never;
