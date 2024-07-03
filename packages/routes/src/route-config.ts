import { Route } from './route';
import { RoutingRule } from './routing-rule';

export interface RouteConfig<
  TData,
  TPathParams,
  TQueryParams,
  TFragmentParams,
  TPath = unknown,
  TQuery = unknown,
  TFragment = unknown,
> {
  data: TData;
  route: Route<
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >;
  rules: RoutingRule<
    TData,
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >[];
  children: RouteConfig<
    TData,
    unknown,
    unknown,
    unknown,
    TPath,
    TQuery,
    TFragment
  >[];
}
