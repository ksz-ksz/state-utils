import { Path } from './path';
import { Encoders } from './encoders';
import { Encoder, EncoderResult } from './encoder';
import {
  ParamsEncoder,
  ParamsEncoderFactory,
  ParamsEncoderResult,
} from './routing';

type InferPathSegments<TPath extends string> = TPath extends ''
  ? never
  : TPath extends `${infer THead}/${infer TTail}`
    ? (THead extends '' ? never : THead) | InferPathSegments<TTail>
    : TPath;
type InferParamName<TPathSegment> = TPathSegment extends `:${infer TParamName}`
  ? TParamName
  : never;
type InferParamNames<TPath extends string> = InferParamName<
  InferPathSegments<TPath>
>;
export type PathParams<TPath extends string> = {
  [K in InferParamNames<TPath>]: unknown;
};

export function createPathParamsEncoderFactory<
  TPath extends string,
  TParams extends PathParams<TPath>,
  TParentParams,
>(
  options: object extends TParams
    ? {
        path: TPath;
        params?: Encoders<TParams>;
      }
    : {
        path: TPath;
        params: Encoders<TParams>;
      }
): ParamsEncoderFactory<Path, TParentParams & TParams, TParentParams> {
  return (parent) => {
    return new PathParamsEncoder(
      // @ts-expect-error unsafe parent cast
      parent,
      parsePath(options.path),
      options.params
    );
  };
}

interface PathSegment {
  type: 'path';
  name: string;
}

interface PathParamSegment {
  type: 'path-param';
  name: string;
}

type Segment = PathSegment | PathParamSegment;

function normalizePath(path: string): string {
  let normalizedPath = path.replaceAll(/\/+/g, '/');
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }
  if (normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.substring(0, -1);
  }
  return normalizedPath;
}

function parseNormalizedPath(path: string): Segment[] {
  return path.split('/').map((segment): Segment => {
    if (segment.startsWith(':')) {
      return {
        type: 'path-param',
        name: segment.substring(1),
      };
    } else {
      return {
        type: 'path',
        name: segment,
      };
    }
  });
}

function parsePath(path: string): Segment[] {
  return parseNormalizedPath(normalizePath(path));
}

type PathEncoderResult<T> = ParamsEncoderResult<T> & {
  /**
   * - positive integer - a number of successfully consumed path segments
   * - -1 - means that the Path cannot be decoded
   */
  consumed: number;
};

class PathParamsEncoder<TParams, TParentParams>
  implements ParamsEncoder<Path, TParentParams & TParams>
{
  constructor(
    private readonly parent:
      | PathParamsEncoder<TParentParams, unknown>
      | undefined,
    private readonly path: Segment[],
    private readonly params: Encoders<TParams>
  ) {}

  encode(value: TParentParams & TParams): EncoderResult<Path> {
    if (this.parent !== undefined) {
      const parentResult = this.parent.encode(value);
      if (!parentResult.valid) {
        return {
          valid: false,
        };
      }
      const segments = this.encodeSegments(value);
      if (segments === undefined) {
        return {
          valid: false,
        };
      }

      return {
        valid: true,
        value: [...parentResult.value, ...segments],
      };
    } else {
      const segments = this.encodeSegments(value);
      if (segments === undefined) {
        return {
          valid: false,
        };
      }

      return {
        valid: true,
        value: segments,
      };
    }
  }

  decode(value: Path): PathEncoderResult<TParentParams & TParams> {
    if (this.parent !== undefined) {
      const parentResult = this.parent.decode(value);
      if (parentResult.valid) {
        // parent consumed all the segments
        if (this.path.length === 0) {
          // there are no segments to match against on this level
          return parentResult as PathEncoderResult<TParentParams & TParams>;
        } else {
          // there are still segments to match against on this lever, but there's nothing to consume
          return {
            valid: false,
            consumed: -1,
            parent: parentResult,
          };
        }
      } else if (parentResult.consumed !== -1) {
        // parent did not consume all the segments, but the segments it consumed so far are valid
        const params = this.decodeSegments(value, parentResult.consumed);
        if (params === undefined) {
          return {
            valid: false,
            consumed: -1,
            parent: parentResult,
          };
        }

        const consumed = parentResult.consumed + this.path.length;
        return {
          valid: consumed === value.length,
          consumed,
          parent: parentResult,
          value: { ...parentResult.value, ...params },
        };
      } else {
        return {
          valid: false,
          consumed: parentResult.consumed,
          parent: parentResult,
        };
      }
    } else {
      const params = this.decodeSegments(value, 0);
      if (params === undefined) {
        return {
          valid: false,
          consumed: -1,
          parent: undefined,
        };
      }

      const consumed = this.path.length;
      return {
        valid: consumed === value.length,
        consumed,
        parent: undefined,
        value: params,
      };
    }
  }

  private decodeSegments(segments: string[], consumed: number) {
    const params: any = {};
    for (let i = 0; i < this.path.length; i++) {
      const segmentValue = segments[consumed + i];
      if (segmentValue === undefined) {
        return undefined;
      }
      const segment = this.path[i];
      switch (segment.type) {
        case 'path':
          if (segmentValue !== segment.name) {
            return undefined;
          }
          break;
        case 'path-param': {
          const param = this.decodeParam(segment.name, segmentValue);
          if (param === undefined) {
            return undefined;
          }
          params[segment.name] = param;

          break;
        }
      }
    }
    return params;
  }

  private encodeSegments(
    params: TParentParams & TParams
  ): string[] | undefined {
    const segments: string[] = [];
    for (const segment of this.path) {
      switch (segment.type) {
        case 'path':
          segments.push(segment.name);
          break;
        case 'path-param': {
          const param = (params as any)[segment.name];
          const segmentValue = this.encodeParam(segment.name, param);
          if (segmentValue === undefined) {
            return undefined;
          }
          segments.push(segmentValue);
          break;
        }
      }
    }
    return segments;
  }

  private encodeParam(name: string, param: unknown): string | undefined {
    const paramEncoder = (this.params as any)[name] as Encoder<string, unknown>;
    if (paramEncoder === undefined) {
      return undefined;
    }
    const result = paramEncoder.encode(param);
    if (!result.valid) {
      return undefined;
    }

    return result.value;
  }

  private decodeParam(name: string, param: string) {
    const paramEncoder = (this.params as any)[name] as Encoder<string, unknown>;
    const result = paramEncoder.decode(param);
    if (!result.valid) {
      return undefined;
    }
    return result.value;
  }
}
