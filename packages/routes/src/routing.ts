import { EncoderFactoryFn } from './encoder-factory-fn';
import { Encoder, EncoderResult } from './encoder';
import { Route } from './route';
import { EncoderFactory } from './encoder-factory';
import { Historian } from './historian';

export type PathEncoderResult<T> = EncoderResult<T> & {
  // route: Route<T, unknown, unknown>;
  parent: PathEncoderResult<unknown> | undefined;
};

export interface PathEncoder<TEncodedParams, TDecodedParams>
  extends Encoder<TEncodedParams, TDecodedParams> {
  decode(value: TEncodedParams): PathEncoderResult<TDecodedParams>;
}

export interface PathEncoderFactory<TEncoded, TDecoded, TParentDecoded> {
  (
    parent?: PathEncoder<TEncoded, TParentDecoded>
  ): PathEncoder<TEncoded, TDecoded>;
}

export interface PathEncoderFactoryFn<
  TEncodedParams,
  TDecodedParams,
  TParentDecodedParams,
> {
  (
    ...args: any[]
  ): PathEncoderFactory<TEncodedParams, TDecodedParams, TParentDecodedParams>;
}

export interface Routing<
  TPath,
  TQuery,
  TFragment,
  TPathParamsEncoder extends PathEncoderFactoryFn<TPath, unknown, unknown>,
  TQueryParamsEncoderFactory extends EncoderFactoryFn<TQuery, unknown, unknown>,
  TFragmentParamsEncoderFactory extends EncoderFactoryFn<
    TFragment,
    unknown,
    unknown
  >,
> {
  path: TPathParamsEncoder;
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
    path?: PathEncoderFactory<TPath, TPathParams, TParentPathParams>;
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
  TPathParamsEncoderFactory extends PathEncoderFactoryFn<
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
  createPathEncoderFactory: TPathParamsEncoderFactory;
  createQueryEncoderFactory: TQueryParamsEncoderFactory;
  createFragmentEncoderFactory: TFragmentParamsEncoderFactory;
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
