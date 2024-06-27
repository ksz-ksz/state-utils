export interface ValidEncoderResult<T> {
  valid: true;
  value: T;
}

export interface InvalidEncoderResult<T> {
  valid: false;
  value?: T;
}

export type EncoderResult<T> = ValidEncoderResult<T> | InvalidEncoderResult<T>;

export interface Encoder<TEncoded, TDecoded> {
  encode(value: TDecoded): EncoderResult<TEncoded>;

  decode(value: TEncoded): EncoderResult<TDecoded>;
}
