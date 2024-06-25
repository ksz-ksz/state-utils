import { MapEncoders } from './map-encoders';
import { Encoder } from './encoder';
import { Query } from './query';

export function createQueryEncoderFactory<TParams, TParentParams>(options?: {
  params?: MapEncoders<TParams>;
}): (
  parent: Encoder<Query, TParentParams>
) => Encoder<Query, Partial<TParentParams & TParams>> {
  // @ts-expect-error fixme
  return options;
}
