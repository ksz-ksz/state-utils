import { Encoders } from './encoders';
import { Query } from './query';
import { EncoderFactory } from './encoder-factory';

export function createQueryEncoderFactory<TParams, TParentParams>(options?: {
  params?: Encoders<TParams>;
}): EncoderFactory<Query, Partial<TParentParams & TParams>, TParentParams> {
  // @ts-expect-error fixme
  return options;
}
