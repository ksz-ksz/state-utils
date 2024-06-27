import { Encoder } from './encoder';

export interface EncoderFactory<TEncoded, TDecoded, TParentDecoded> {
  (parent?: Encoder<TEncoded, TParentDecoded>): Encoder<TEncoded, TDecoded>;
}
