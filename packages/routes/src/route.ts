import { Encoder } from './encoder';

export interface Route<
  TPathParams,
  TQueryParams,
  TFragmentParams,
  TPath = unknown,
  TQuery = unknown,
  TFragment = unknown,
> {
  readonly id: number;
  readonly parent: Route<unknown, unknown, unknown> | undefined;
  readonly pathEncoder: Encoder<TPath, TPathParams> | undefined;
  readonly queryEncoder: Encoder<TQuery, TQueryParams> | undefined;
  readonly fragmentEncoder: Encoder<TFragment, TFragmentParams> | undefined;
}
