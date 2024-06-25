import { Encoder } from './encoder';
import { Fragment } from './fragment';

export function createFragmentEncoderFactory<TParam>(): () => Encoder<
  Fragment,
  TParam
> {
  // @ts-expect-error fixme
  return undefined;
}
