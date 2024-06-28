import { Fragment } from './fragment';
import { EncoderFactory } from './encoder-factory';
import { Encoder } from './encoder';

export function createFragmentEncoderFactory<TParam>(options: {
  param: Encoder<string, TParam>;
}): EncoderFactory<Fragment, TParam, unknown> {
  return () => options.param;
}
