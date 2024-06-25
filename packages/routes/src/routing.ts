import { EncoderFactoryFn } from './encoder-factory-fn';
import { Encoder } from './encoder';
import { Route } from './route';
import { EncoderFactory } from './encoder-factory';
import { Historian } from './historian';

export interface Routing<
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

export function createRouting<
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
  TPathFn extends EncoderFactoryFn<TEncodedPath, unknown, unknown>,
  TQueryFn extends EncoderFactoryFn<TEncodedQuery, unknown, unknown>,
  TFragmentFn extends EncoderFactoryFn<TEncodedFragment, unknown, unknown>,
>(options: {
  historian: Historian;
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
