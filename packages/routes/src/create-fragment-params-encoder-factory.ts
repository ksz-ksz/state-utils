import { Fragment } from './fragment';
import { Encoder, EncoderResult, ValidEncoderResult } from './encoder';
import {
  ParamsEncoder,
  ParamsEncoderFactory,
  ParamsEncoderResult,
} from './params-encoder';

export function createFragment<TParam = undefined>(
  param?: Encoder<string, TParam>
): ParamsEncoderFactory<Fragment, TParam, unknown> {
  return () => new FragmentParamsEncoder(param);
}

export function createFragmentParamsEncoderFactory<
  TParam = undefined,
>(options?: {
  param?: Encoder<string, TParam>;
}): ParamsEncoderFactory<Fragment, TParam, unknown> {
  return () => new FragmentParamsEncoder(options?.param);
}

export const fragment = createFragmentParamsEncoderFactory;

class FragmentParamsEncoder<TParam> implements ParamsEncoder<Fragment, TParam> {
  constructor(private readonly param: Encoder<string, TParam> | undefined) {}

  encode(value: TParam): EncoderResult<Fragment> {
    return (
      this.param?.encode(value) ?? {
        valid: true,
        value: undefined,
      }
    );
  }

  decode(value: Fragment): ParamsEncoderResult<TParam> {
    const result =
      this.param?.decode(value ?? '') ??
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
