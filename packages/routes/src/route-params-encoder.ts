import { Encoder } from './encoder';
import { ParamsComparator } from './params-comparator';

export interface ValidRouteParamsEncoderResult<T> {
  partiallyValid: true;
  valid: true;
  value: T;
}

export interface PartiallyValidRouteParamsEncoderResult<T> {
  partiallyValid: true;
  valid: false;
  value: T;
}

export interface InvalidRouteParamsEncoderResult<T> {
  partiallyValid: false;
  valid: false;
  value?: T;
}

export type RouteParamsEncoderResult<T> =
  | ValidRouteParamsEncoderResult<T>
  | PartiallyValidRouteParamsEncoderResult<T>
  | InvalidRouteParamsEncoderResult<T>;

export interface RouteParamsEncoder<TEncoded, TParams>
  extends Encoder<TEncoded, TParams>,
    ParamsComparator<TParams> {
  decode(
    value: TEncoded,
    parentResult?: RouteParamsEncoderResult<unknown>
  ): RouteParamsEncoderResult<TParams>;
}

export interface RouteParamsEncoderFactory<TEncoded, TParams, TParentParams> {
  (
    parent?: RouteParamsEncoder<TEncoded, TParentParams>
  ): RouteParamsEncoder<TEncoded, TParams>;
}
