import { Encoder, EncoderResult } from './encoder';
import { Path } from './path';

export function createPathEncoder(): Encoder<string, Path> {
  return new PathEncoder();
}

class PathEncoder implements Encoder<string, Path> {
  encode(value: Path): EncoderResult<string> {
    try {
      const segments: string[] = [];
      for (const segment of value) {
        if (segment === '') {
          return {
            valid: false,
          };
        }
        segments.push(encodeURIComponent(segment));
      }
      return {
        valid: true,
        value: segments.join('/'),
      };
    } catch (e) {
      return {
        valid: false,
      };
    }
  }

  decode(value: string): EncoderResult<Path> {
    try {
      const path: string[] = [];
      for (const segment of value.split('/')) {
        if (segment === '') {
          return {
            valid: false,
          };
        }
        path.push(decodeURIComponent(segment));
      }
      return {
        valid: true,
        value: path,
      };
    } catch (e) {
      return {
        valid: false,
      };
    }
  }
}
