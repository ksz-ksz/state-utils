import { Fragment } from './fragment';
import { Encoder, EncoderResult } from './encoder';
import {
  ParamsEncoder,
  ParamsEncoderFactory,
  ParamsEncoderResult,
} from './params-encoder';

export function createFragmentParamsEncoderFactory<TParam>(options: {
  param: Encoder<string, TParam>;
}): ParamsEncoderFactory<Fragment, TParam, unknown> {
  return () => new FragmentParamsEncoder(options.param);
}

class FragmentParamsEncoder<TParam> implements ParamsEncoder<Fragment, TParam> {
  constructor(private readonly param: Encoder<string, TParam>) {}

  encode(value: TParam): EncoderResult<Fragment> {
    return this.param.encode(value);
  }

  decode(value: Fragment): ParamsEncoderResult<TParam> {
    return {
      ...this.param.decode(value),
      parent: undefined,
    };
  }
}
