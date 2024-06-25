import { Encoder } from './encoder';

export type MapEncoders<TParams> = {
  [K in keyof TParams]: Encoder<TParams[K], unknown>;
};
