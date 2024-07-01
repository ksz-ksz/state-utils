import { Fragment } from './fragment';
import { Encoder, EncoderResult } from './encoder';
import {
  ParamsEncoder,
  ParamsEncoderFactory,
  ParamsEncoderResult,
} from './params-encoder';

export function createFragmentParamsEncoderFactory<TParam>(options: {
  param: Encoder<string, TParam>;
}): ParamsEncoderFactory<Fragment, { value?: TParam }, unknown> {
  return () => new FragmentParamsEncoder(options.param);
}

class FragmentParamsEncoder<TParam>
  implements ParamsEncoder<Fragment, { value?: TParam }>
{
  constructor(private readonly param: Encoder<string, TParam>) {}

  encode(value: { value?: TParam }): EncoderResult<Fragment> {
    if (value?.value === undefined) {
      return {
        valid: true,
        value: '',
      };
    }
    return this.param.encode(value.value);
  }

  decode(value: Fragment): ParamsEncoderResult<{ value?: TParam }> {
    const result = this.param.decode(value);
    return {
      valid: result.valid,
      value: { value: result.value },
      parent: undefined,
    };
  }
}
