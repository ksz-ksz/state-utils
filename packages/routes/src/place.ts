import { Route } from './route';

export interface Place<TPath, TQuery, TFragment> {
  path: TPath;
  query: TQuery;
  fragment: TFragment;
}
