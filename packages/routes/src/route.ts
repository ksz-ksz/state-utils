import { RouteParamsEncoder } from './route-params-encoder';

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
  readonly pathEncoder: RouteParamsEncoder<TPath, TPathParams>;
  readonly queryEncoder: RouteParamsEncoder<TQuery, TQueryParams>;
  readonly fragmentEncoder: RouteParamsEncoder<TFragment, TFragmentParams>;
}
