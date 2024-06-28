import { Fragment } from './fragment';
import { EncoderFactory } from './encoder-factory';
import { Encoder, EncoderResult } from './encoder';

export function createFragmentEncoderFactory<TParam>(options: {
  param: Encoder<string, TParam>;
}): EncoderFactory<Fragment, TParam, unknown> {
  return () => new FragmentEncoder(options.param);
}

class FragmentEncoder<TParam> implements Encoder<Fragment, TParam> {
  constructor(private readonly param: Encoder<string, TParam>) {}

  encode(value: TParam): EncoderResult<Fragment> {
    return this.param.encode(value);
  }

  decode(value: Fragment): EncoderResult<TParam> {
    return this.param.decode(value);
  }
}
