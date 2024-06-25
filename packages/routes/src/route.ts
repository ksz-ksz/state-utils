import { Encoder } from './encoder';

export interface Route<
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
