import { ParamsEncoder } from './params-encoder';

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
  readonly pathEncoder: ParamsEncoder<TPath, TPathParams>;
  readonly queryEncoder: ParamsEncoder<TQuery, TQueryParams>;
  readonly fragmentEncoder: ParamsEncoder<TFragment, TFragmentParams>;
}
