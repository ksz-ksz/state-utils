import { Place } from './place';
import { Observable } from 'rxjs';
import { RouteDiff } from './route-diff';

export interface RoutingRuleContext<
  TData,
  TPathParams,
  TQueryParams,
  TFragmentParams,
  TPath = unknown,
  TQuery = unknown,
  TFragment = unknown,
> {
  // place: Place<TPath, TQuery, TFragment>;
  routeDiff: RouteDiff<
    TData,
    TPath,
    TQuery,
    TFragment,
    TPathParams,
    TQueryParams,
    TFragmentParams
  >;
  routeDiffs: RouteDiff<TData, TPath, TQuery, TFragment>[];
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
