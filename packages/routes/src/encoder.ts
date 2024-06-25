export interface Encoder<TEncoded, TDecoded> {
  encode(value: TDecoded): TEncoded;

  decode(value: TEncoded): TDecoded;
}
