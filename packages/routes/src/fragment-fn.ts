import { Encoder } from './encoder';
import { Fragment } from './fragment';

export function fragmentFn<TParam>(): () => Encoder<Fragment, TParam> {
  // @ts-expect-error fixme
  return undefined;
}
