import { Encoder } from './encoder';

export const params: {
  enum<T extends string>(options: { values: T[] }): Encoder<T, string>;
  string<T extends string>(options?: {
    pattern?: string | RegExp;
    minLength?: number;
    maxLength?: number;
  }): Encoder<T, string>;
  number<T extends number>(options?: {
    integer?: boolean;
    min?: number;
    max?: number;
  }): Encoder<T, string>;
  boolean<T extends boolean>(options?: {
    trueValue?: string;
    falseValue?: string;
  }): Encoder<T, string>;
} = undefined as any;