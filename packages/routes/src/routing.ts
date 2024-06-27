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
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
  TCreatePath extends PathEncoderFactoryFn<TEncodedPath, unknown, unknown>,
  TCreateQuery extends EncoderFactoryFn<TEncodedQuery, unknown, unknown>,
  TCreateFragment extends EncoderFactoryFn<TEncodedFragment, unknown, unknown>,
> {
  path: TCreatePath;
  query: TCreateQuery;
  fragment: TCreateFragment;
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
    path?: PathEncoderFactory<TEncodedPath, TPath, TParentPath>;
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
  TCreatePath extends PathEncoderFactoryFn<TEncodedPath, unknown, unknown>,
  TCreateQuery extends EncoderFactoryFn<TEncodedQuery, unknown, unknown>,
  TCreateFragment extends EncoderFactoryFn<TEncodedFragment, unknown, unknown>,
>(options: {
  historian: Historian;
  pathEncoder: Encoder<string, TEncodedPath>;
  queryEncoder: Encoder<string, TEncodedQuery>;
  fragmentEncoder: Encoder<string, TEncodedFragment>;
  createPathEncoderFactory: TCreatePath;
  createQueryEncoderFactory: TCreateQuery;
  createFragmentEncoderFactory: TCreateFragment;
}): Routing<
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
  TCreatePath,
  TCreateQuery,
  TCreateFragment
> {
  // @ts-expect-error fixme
  return options;
}
