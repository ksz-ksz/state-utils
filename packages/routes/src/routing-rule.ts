import { RouteConfig } from './route-config';
import { RouteObject } from './route-object';
import { Place } from './place';
import { Observable } from 'rxjs';

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
    routeConfig: RouteConfig<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >,
    routeObject: RouteObject<TPathParams, TQueryParams, TFragmentParams>,
    routeObjects: RouteObject<unknown, unknown, unknown>[],
    place: Place<TPath, TQuery, TFragment>
  ): Observable<Place<TPath, TQuery, TFragment> | boolean> | void;
  onAfterRouteEnter?(
    routeConfig: RouteConfig<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >,
    routeObject: RouteObject<TPathParams, TQueryParams, TFragmentParams>,
    routeObjects: RouteObject<unknown, unknown, unknown>[],
    place: Place<TPath, TQuery, TFragment>
  ): void;
  onBeforeRouteLeave?(
    routeConfig: RouteConfig<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >,
    routeObject: RouteObject<TPathParams, TQueryParams, TFragmentParams>,
    routeObjects: RouteObject<unknown, unknown, unknown>[],
    place: Place<TPath, TQuery, TFragment>
  ): Observable<Place<TPath, TQuery, TFragment> | boolean> | void;
  onAfterRouteLeave?(
    routeConfig: RouteConfig<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >,
    routeObject: RouteObject<TPathParams, TQueryParams, TFragmentParams>,
    routeObjects: RouteObject<unknown, unknown, unknown>[],
    place: Place<TPath, TQuery, TFragment>
  ): void;
}
