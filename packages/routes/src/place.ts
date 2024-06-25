import { Route } from './route';

interface Place<TPath, TQuery, TFragment> {
  path: TPath;
  query: TQuery;
  fragment: TFragment;
}

export function createPlace<
  TPath extends object,
  TQuery,
  TFragment,
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
>(
  route: Route<
    TPath,
    TQuery,
    TFragment,
    TEncodedPath,
    TEncodedQuery,
    TEncodedFragment
  >,
  options: {
    path: TPath;
    query?: TQuery;
    fragment?: TFragment;
  }
): Place<TEncodedPath, TEncodedQuery, TEncodedFragment>;
export function createPlace<
  TPath extends never,
  TQuery,
  TFragment,
  TEncodedPath,
  TEncodedQuery,
  TEncodedFragment,
>(
  route: Route<TPath, TQuery, TFragment>,
  options?: {
    path?: TPath;
    query?: TQuery;
    fragment?: TFragment;
  }
): Place<TEncodedPath, TEncodedQuery, TEncodedFragment>;
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
