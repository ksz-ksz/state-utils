import { Fragment } from './fragment';
import { Encoder, EncoderResult, ValidEncoderResult } from './encoder';
import {
  ParamsEncoder,
  ParamsEncoderFactory,
  ParamsEncoderResult,
} from './params-encoder';

export function createFragmentParamsEncoderFactory<
  TParam = undefined,
>(options?: {
  param?: Encoder<string, TParam>;
}): ParamsEncoderFactory<Fragment, TParam, unknown> {
  return () => new FragmentParamsEncoder(options?.param);
}

class FragmentParamsEncoder<TParam> implements ParamsEncoder<Fragment, TParam> {
  constructor(private readonly param: Encoder<string, TParam> | undefined) {}

  encode(value: TParam): EncoderResult<Fragment> {
    return (
      this.param?.encode(value) ?? {
        valid: true,
        value: '',
      }
    );
  }

  decode(value: Fragment): ParamsEncoderResult<TParam> {
    const result =
      this.param?.decode(value) ??
      ({
        valid: true,
        value: undefined,
      } as ValidEncoderResult<TParam>);
    return {
      ...result,
      parent: undefined,
    };
  }
}
