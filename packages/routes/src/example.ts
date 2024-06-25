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

type Alt<T, U> = T extends unknown ? U : T;

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
    TParentPath = unknown,
    TParentQuery = unknown,
    TParentFragment = unknown,
    TPath = TParentPath,
    TQuery = TParentQuery,
    TFragment = TParentFragment,
  >(options: {
    parent?: Route<TParentPath, TParentQuery, TParentFragment>;
    path?: EncoderFactory<TEncodedPath, TPath, TParentPath>;
    query?: EncoderFactory<TEncodedQuery, TQuery, TParentFragment>;
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
  [name in InferParamNames<TPath>]: unknown;
};

function pathFn<
  TPath extends string,
  TParams extends PathParams<TPath>,
  TParentParams,
>(
  options: object extends PathParams<TPath>
    ? {
        path: TPath;
        params?: TParams;
      }
    : {
        path: TPath;
        params: TParams;
      }
): (
  parent: Encoder<Path, TParentParams>
) => Encoder<Path, TParentParams & TParams> {
  // @ts-expect-error fixme
  return options;
}

function queryFn<TParams, TParentParams>(options?: {
  params?: TParams;
}): (
  parent: Encoder<Query, TParentParams>
) => Encoder<Query, Partial<TParentParams & TParams>> {
  // @ts-expect-error fixme
  return options;
}

function fragmentFn<TParam>(): () => Encoder<Fragment, TParam> {
  return undefined as any;
}

const routing = createRouting({
  history: createBrowserHistory(),
  pathEncoder: createPathEncoder(),
  queryEncoder: createQueryEncoder(),
  fragmentEncoder: createFragmentEncoder(),
  pathFn,
  queryFn,
  fragmentFn,
});

const rootRoute = routing.createRoute({
  path: routing.path({
    path: ':foo/:bar',
    params: {
      foo: 123,
      bar: 'str',
    },
  }),
  query: routing.query({
    params: {
      foo: 123,
      bar: 'str',
    },
  }),
  fragment: routing.fragment(),
});

const entityRoute = routing.createRoute({
  parent: rootRoute,
  query: queryFn({
    params: {
      baz: false,
    },
  }),
});

const entityDetailsRoute = routing.createRoute({
  parent: entityRoute,
  path: routing.path(':entityId', {
    entityId: params.string({
      regex: /ENTITY-[0-9]{16}/,
    }),
  }),
  query: {
    timeframe: params.string(),
  },
  fragment: params.string(),
});
