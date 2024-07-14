import { Fragment } from './fragment';
import { EncoderResult, ValidEncoderResult } from './encoder';
import {
  RouteParamsEncoder,
  RouteParamsEncoderFactory,
  RouteParamsEncoderResult,
} from './route-params-encoder';
import { ParamsEncoder } from './params-encoder';

export function createFragment<TParam = undefined>(
  param?: ParamsEncoder<string, TParam>
): RouteParamsEncoderFactory<Fragment, TParam, unknown> {
  return () => new FragmentParamsEncoder(param);
}

class FragmentParamsEncoder<TParam>
  implements RouteParamsEncoder<Fragment, TParam>
{
  constructor(
    private readonly param: ParamsEncoder<string, TParam> | undefined
  ) {}

  encode(value: TParam): EncoderResult<Fragment> {
    return (
      this.param?.encode(value) ?? {
        valid: true,
        value: undefined,
      }
    );
  }

  decode(value: Fragment): RouteParamsEncoderResult<TParam> {
    const result =
      this.param?.decode(value ?? '') ??
      ({
        valid: true,
        value: undefined,
      } as ValidEncoderResult<TParam>);
    return {
      partiallyValid: true,
      valid: result.valid,
      value: result.value as TParam,
    };
  }

  areParamsEqual(a: TParam, b: TParam): boolean {
    return this.param?.areParamsEqual(a, b) ?? Object.is(a, b);
  }
}
