export interface ValidResult<T> {
  valid: true;
  value: T;
}

export interface InvalidResult<T> {
  valid: false;
  value?: T;
}

export type Result<T> = ValidResult<T> | InvalidResult<T>;

export interface Encoder<TEncoded, TDecoded> {
  encode(value: TDecoded): Result<TEncoded>;

  decode(value: TEncoded): Result<TDecoded>;
}
