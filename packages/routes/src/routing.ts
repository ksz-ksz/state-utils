import { Encoder } from './encoder';
import { Route } from './route';
import { Historian } from './historian';
import {
  CreateParamsEncoderFactory,
  ParamsEncoder,
  ParamsEncoderFactory,
} from './params-encoder';

export interface Routing<
  TPath,
  TQuery,
  TFragment,
  TPathParamsEncoderFactory extends CreateParamsEncoderFactory<
    TPath,
    unknown,
    unknown
  >,
  TQueryParamsEncoderFactory extends CreateParamsEncoderFactory<
    TQuery,
    unknown,
    unknown
  >,
  TFragmentParamsEncoderFactory extends CreateParamsEncoderFactory<
    TFragment,
    unknown,
    unknown
  >,
> {
  path: TPathParamsEncoderFactory;
  query: TQueryParamsEncoderFactory;
  fragment: TFragmentParamsEncoderFactory;
  pathEncoder: Encoder<string, TPath>;
  queryEncoder: Encoder<string, TQuery>;
  fragmentEncoder: Encoder<string, TFragment>;

  createRoute: <
    TParentPathParams = Record<string, never>,
    TParentQueryParams = Record<string, never>,
    TParentFragmentParams = Record<string, never>,
    TPathParams = TParentPathParams,
    TQueryParams = TParentQueryParams,
    TFragmentParams = TParentFragmentParams,
  >(options: {
    parent?: Route<
      TParentPathParams,
      TParentQueryParams,
      TParentFragmentParams,
      TPath,
      TQuery,
      TFragment
    >;
    path?: ParamsEncoderFactory<TPath, TPathParams, TParentPathParams>;
    query?: ParamsEncoderFactory<TQuery, TQueryParams, TParentQueryParams>;
    fragment?: ParamsEncoderFactory<
      TFragment,
      TFragmentParams,
      TParentFragmentParams
    >;
  }) => Route<
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >;
}

export function createRouting<
  TPath,
  TQuery,
  TFragment,
  TPathParamsEncoderFactory extends CreateParamsEncoderFactory<
    TPath,
    unknown,
    unknown
  >,
  TQueryParamsEncoderFactory extends CreateParamsEncoderFactory<
    TQuery,
    unknown,
    unknown
  >,
  TFragmentParamsEncoderFactory extends CreateParamsEncoderFactory<
    TFragment,
    unknown,
    unknown
  >,
>(options: {
  historian: Historian;
  pathEncoder: Encoder<string, TPath>;
  queryEncoder: Encoder<string, TQuery>;
  fragmentEncoder: Encoder<string, TFragment>;
  pathParamsEncoderFactory: TPathParamsEncoderFactory;
  queryParamsEncoderFactory: TQueryParamsEncoderFactory;
  fragmentParamsEncoderFactory: TFragmentParamsEncoderFactory;
}): Routing<
  TPath,
  TQuery,
  TFragment,
  TPathParamsEncoderFactory,
  TQueryParamsEncoderFactory,
  TFragmentParamsEncoderFactory
> {
  let routeId = 0;

  return {
    path: options.pathParamsEncoderFactory,
    query: options.queryParamsEncoderFactory,
    fragment: options.fragmentParamsEncoderFactory,
    pathEncoder: options.pathEncoder,
    queryEncoder: options.queryEncoder,
    fragmentEncoder: options.fragmentEncoder,
    createRoute({ parent, path, query, fragment }) {
      return {
        id: routeId++,
        parent,
        pathEncoder: getParamsEncoder(path, parent?.pathEncoder),
        queryEncoder: getParamsEncoder(query, parent?.queryEncoder),
        fragmentEncoder: getParamsEncoder(fragment, parent?.fragmentEncoder),
      };
    },
  };
}

function getParamsEncoder<TEncoded, TParams>(
  encoderFactory?: ParamsEncoderFactory<TEncoded, TParams, any>,
  parentEncoder?: ParamsEncoder<TEncoded, any>
) {
  if (encoderFactory !== undefined) {
    return encoderFactory(parentEncoder);
  }
  if (parentEncoder !== undefined) {
    return parentEncoder;
  }
  throw new Error(`Please provide encoders configuration for root route.`);
}
