import { RouteMatch } from './route-matcher';

export type RouteDiff<
  TData,
  TPath,
  TQuery,
  TFragment,
  TPathParams = unknown,
  TQueryParams = unknown,
  TFragmentParams = unknown,
> =
  | {
      prevRouteMatch: RouteMatch<
        TData,
        TPath,
        TQuery,
        TFragment,
        TPathParams,
        TQueryParams,
        TFragmentParams
      >;
      routeMatch: RouteMatch<
        TData,
        TPath,
        TQuery,
        TFragment,
        TPathParams,
        TQueryParams,
        TFragmentParams
      >;
      routeChanged: false;
      pathParamsChanged: boolean;
      queryParamsChanged: boolean;
      fragmentParamsChanged: boolean;
    }
  | {
      prevRouteMatch:
        | RouteMatch<
            TData,
            TPath,
            TQuery,
            TFragment,
            TPathParams,
            TQueryParams,
            TFragmentParams
          >
        | undefined;
      routeMatch:
        | RouteMatch<
            TData,
            TPath,
            TQuery,
            TFragment,
            TPathParams,
            TQueryParams,
            TFragmentParams
          >
        | undefined;
      routeChanged: true;
      pathParamsChanged: true;
      queryParamsChanged: true;
      fragmentParamsChanged: true;
    };
