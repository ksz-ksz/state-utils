import { RouteConfig } from './route-config';
import { RouteObject } from './route-object';
import { Place } from './place';
import { Observable } from 'rxjs';

export interface RoutingRuleContext<
  TData,
  TPathParams,
  TQueryParams,
  TFragmentParams,
  TPath = unknown,
  TQuery = unknown,
  TFragment = unknown,
> {
  routeConfig: RouteConfig<
    TData,
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >;
  routeConfigs: RouteConfig<
    TData,
    unknown,
    unknown,
    unknown,
    TPath,
    TQuery,
    TFragment
  >[];
  routeObject: RouteObject<TPathParams, TQueryParams, TFragmentParams>;
  routeObjects: RouteObject<unknown, unknown, unknown>[];
  place: Place<TPath, TQuery, TFragment>;
}

export interface RoutingRule<
  TData,
  TPathParams,
  TQueryParams,
  TFragmentParams,
  TPath = unknown,
  TQuery = unknown,
  TFragment = unknown,
> {
  onBeforeRouteEnter?(
    context: RoutingRuleContext<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >
  ): Observable<Place<TPath, TQuery, TFragment> | boolean> | void;
  onAfterRouteEnter?(
    context: RoutingRuleContext<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >
  ): void;
  onBeforeRouteLeave?(
    context: RoutingRuleContext<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >
  ): Observable<Place<TPath, TQuery, TFragment> | boolean> | void;
  onAfterRouteLeave?(
    context: RoutingRuleContext<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >
  ): void;
}
