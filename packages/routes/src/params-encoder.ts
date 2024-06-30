import { Encoder, EncoderResult } from './encoder';

export type ParamsEncoderResult<T> = EncoderResult<T> & {
  // route: Route<T, unknown, unknown>;
  parent: ParamsEncoderResult<unknown> | undefined;
};

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

export interface CreateParamsEncoderFactory<TEncoded, TParams, TParentParams> {
  (...args: any[]): ParamsEncoderFactory<TEncoded, TParams, TParentParams>;
}
