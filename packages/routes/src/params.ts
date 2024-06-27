import { Encoder, Result } from './encoder';

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
  string(options?: StringParamOptions): Encoder<string, string>;
  number(options?: NumberParamOptions): Encoder<number, string>;
  boolean(options?: BooleanParamOptions): Encoder<boolean, string>;
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

class StringParamEncoder implements Encoder<string, string> {
  constructor(private readonly options: StringParamOptions) {}

  encode(value: string): Result<string> {
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

  decode(value: string): Result<string> {
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

  private isValid(value: string) {
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

class NumberParamEncoder implements Encoder<number, string> {
  constructor(private readonly options: NumberParamOptions) {}

  encode(value: string): Result<number> {
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

  decode(value: number): Result<string> {
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

  private isValid(value: number) {
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

class BooleanParamEncoder implements Encoder<boolean, string> {
  constructor(private readonly options: BooleanParamOptions) {}

  encode(value: string): Result<boolean> {
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

  decode(value: boolean): Result<string> {
    const decodedValue = this.format(value);
    return {
      valid: true,
      value: decodedValue,
    };
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
