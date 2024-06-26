import { Encoder } from './encoder';

export type Encoders<TParams> = {
  [K in keyof TParams]: Encoder<unknown, TParams[K]>;
};
