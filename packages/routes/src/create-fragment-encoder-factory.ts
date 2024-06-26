import { Encoder } from './encoder';
import { Fragment } from './fragment';
import { EncoderFactory } from './encoder-factory';

export function createFragmentEncoderFactory<TParam>(): EncoderFactory<
  Fragment,
  TParam,
  unknown
> {
  // @ts-expect-error fixme
  return undefined;
}
