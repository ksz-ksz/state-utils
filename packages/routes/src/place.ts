import { Route } from './route';

interface Place<TPath, TQuery, TFragment> {
  path: TPath;
  query: TQuery;
  fragment: TFragment;
}

export function createPlace<
  TPathParams extends object,
  TQueryParams,
  TFragmentParams,
  TPath,
  TQuery,
  TFragment,
>(
  route: Route<
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >,
  options: {
    path: TPathParams;
    query?: TQueryParams;
    fragment?: TFragmentParams;
  }
): Place<TPath, TQuery, TFragment>;
export function createPlace<
  TPathParams extends never,
  TQueryParams,
  TFragmentParams,
  TPath,
  TQuery,
  TFragment,
>(
  route: Route<TPathParams, TQueryParams, TFragmentParams>,
  options?: {
    path?: TPathParams;
    query?: TQueryParams;
    fragment?: TFragmentParams;
  }
): Place<TPath, TQuery, TFragment>;
export function createPlace(
  route: Route<unknown, unknown, unknown>,
  options?: {
    path?: unknown;
    query?: unknown;
    fragment?: unknown;
  }
): Place<unknown, unknown, unknown> {
  // @ts-expect-error fixme
  return [route, options];
}
