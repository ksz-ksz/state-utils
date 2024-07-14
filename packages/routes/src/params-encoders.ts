import { ParamsEncoder } from './params-encoder';

export type ParamsEncoders<TParams> = {
  [K in keyof TParams]: ParamsEncoder<unknown, TParams[K]>;
};
