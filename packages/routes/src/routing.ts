import { EncoderFactoryFn } from './encoder-factory-fn';
import { Encoder } from './encoder';
import { Route } from './route';
import { EncoderFactory } from './encoder-factory';
import { Historian } from './historian';
import {
  CreateParamsEncoderFactory,
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
  TQueryParamsEncoderFactory extends EncoderFactoryFn<TQuery, unknown, unknown>,
  TFragmentParamsEncoderFactory extends EncoderFactoryFn<
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
    TParentPathParams = never,
    TParentQueryParams = never,
    TParentFragmentParams = never,
    TPathParams = TParentPathParams,
    TQueryParams = TParentQueryParams,
    TFragmentParams = TParentFragmentParams,
  >(options: {
    parent?: Route<
      TParentPathParams,
      TParentQueryParams,
      TParentFragmentParams
    >;
    path?: ParamsEncoderFactory<TPath, TPathParams, TParentPathParams>;
    query?: EncoderFactory<TQuery, TQueryParams, TParentQueryParams>;
    fragment?: EncoderFactory<
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
  TQueryParamsEncoderFactory extends EncoderFactoryFn<TQuery, unknown, unknown>,
  TFragmentParamsEncoderFactory extends EncoderFactoryFn<
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
  // @ts-expect-error fixme
  return options;
}
