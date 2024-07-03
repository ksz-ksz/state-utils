export interface RouteObject<TPathParams, TQueryParams, TFragmentParams> {
  id: number;
  path: TPathParams;
  query: TQueryParams;
  fragment: TFragmentParams;
}
