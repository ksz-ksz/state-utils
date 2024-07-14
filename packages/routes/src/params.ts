import { EncoderResult } from './encoder';
import { ParamsEncoder } from './params-encoder';

export interface StringParamOptions {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
}

export interface NumberParamOptions {
  integer?: boolean;
  min?: number;
  max?: number;
}

export interface BooleanParamOptions {
  trueValue?: string;
  falseValue?: string;
}

export const params: {
  string(options?: StringParamOptions): ParamsEncoder<string, string>;
  number(options?: NumberParamOptions): ParamsEncoder<string, number>;
  boolean(options?: BooleanParamOptions): ParamsEncoder<string, boolean>;
} = {
  string(options = {}) {
    return new StringParamEncoder(options);
  },
  number(options = {}) {
    return new NumberParamEncoder(options);
  },
  boolean(options = {}) {
    return new BooleanParamEncoder(options);
  },
};

class StringParamEncoder implements ParamsEncoder<string, string> {
  constructor(private readonly options: StringParamOptions) {}

  encode(value: string): EncoderResult<string> {
    if (this.isValid(value)) {
      return {
        valid: true,
        value,
      };
    } else {
      return {
        valid: false,
      };
    }
  }

  decode(value: string): EncoderResult<string> {
    if (this.isValid(value)) {
      return {
        valid: true,
        value,
      };
    } else {
      return {
        valid: false,
      };
    }
  }

  areParamsEqual(a: string, b: string): boolean {
    return Object.is(a, b);
  }

  private isValid(value: string) {
    if (typeof value !== 'string') {
      return false;
    }
    const { pattern, minLength, maxLength } = this.options;
    if (pattern !== undefined && !pattern.test(value)) {
      return false;
    }
    if (minLength !== undefined && value.length < minLength) {
      return false;
    }
    if (maxLength !== undefined && value.length > maxLength) {
      return false;
    }

    return true;
  }
}

class NumberParamEncoder implements ParamsEncoder<string, number> {
  constructor(private readonly options: NumberParamOptions) {}

  decode(value: string): EncoderResult<number> {
    const encodedValue = Number(value);
    if (this.isValid(encodedValue)) {
      return {
        valid: true,
        value: encodedValue,
      };
    } else {
      return {
        valid: false,
      };
    }
  }

  encode(value: number): EncoderResult<string> {
    if (this.isValid(value)) {
      return {
        valid: true,
        value: String(value),
      };
    } else {
      return {
        valid: false,
      };
    }
  }

  areParamsEqual(a: number, b: number): boolean {
    return Object.is(a, b);
  }

  private isValid(value: number) {
    if (typeof value !== 'number') {
      return false;
    }
    if (Number.isNaN(value)) {
      return false;
    }

    const { integer, min, max } = this.options;
    if (integer !== undefined && integer && !Number.isInteger(value)) {
      return false;
    }
    if (min !== undefined && value < min) {
      return false;
    }
    if (max !== undefined && value > max) {
      return false;
    }

    return true;
  }
}

class BooleanParamEncoder implements ParamsEncoder<string, boolean> {
  constructor(private readonly options: BooleanParamOptions) {}

  decode(value: string): EncoderResult<boolean> {
    const encodedValue = this.parse(value);
    if (encodedValue !== undefined) {
      return {
        valid: true,
        value: encodedValue,
      };
    } else {
      return {
        valid: false,
      };
    }
  }

  encode(value: boolean): EncoderResult<string> {
    if (typeof value !== 'boolean') {
      return {
        valid: false,
      };
    }
    const decodedValue = this.format(value);
    return {
      valid: true,
      value: decodedValue,
    };
  }

  areParamsEqual(a: boolean, b: boolean): boolean {
    return Object.is(a, b);
  }

  private parse(value: string) {
    const { trueValue = 'true', falseValue = 'false' } = this.options;
    if (value) {
      return value === trueValue ? true : undefined;
    } else {
      return value === falseValue ? false : undefined;
    }
  }

  private format(value: boolean) {
    const { trueValue = 'true', falseValue = 'false' } = this.options;
    if (value) {
      return trueValue;
    } else {
      return falseValue;
    }
  }
}
