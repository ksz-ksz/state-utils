import { Encoder, EncoderResult } from './encoder';

export interface ValidParamsEncoderResult<T> {
  partiallyValid: true;
  valid: true;
  value: T;
}

export interface PartiallyValidParamsEncoderResult<T> {
  partiallyValid: true;
  valid: false;
  value: T;
}

export interface InvalidParamsEncoderResult<T> {
  partiallyValid: false;
  valid: false;
  value?: T;
}

export type ParamsEncoderResult<T> =
  | ValidParamsEncoderResult<T>
  | PartiallyValidParamsEncoderResult<T>
  | InvalidParamsEncoderResult<T>;

// export type ParamsEncoderResult<T> = EncoderResult<T> & {
//   partiallyValid: boolean;
//   // route: Route<T, unknown, unknown>;
//   // parent: ParamsEncoderResult<unknown> | undefined;
// };

export interface ParamsEncoder<TEncoded, TParams>
  extends Encoder<TEncoded, TParams> {
  decode(
    value: TEncoded,
    parentResult?: ParamsEncoderResult<unknown>
  ): ParamsEncoderResult<TParams>;
}

export interface ParamsEncoderFactory<TEncoded, TParams, TParentParams> {
  (
    parent?: ParamsEncoder<TEncoded, TParentParams>
  ): ParamsEncoder<TEncoded, TParams>;
}
