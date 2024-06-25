import { EncoderFactory } from './encoder-factory';

export interface EncoderFactoryFn<TEncodedPath, TDecoded, TParentDecoded> {
  (...args: any[]): EncoderFactory<TEncodedPath, TDecoded, TParentDecoded>;
}
