export interface RouteObject<TPathParams, TQueryParams, TFragmentParams> {
  path: TPathParams;
  query: TQueryParams;
  fragment: TFragmentParams;
}
