import { Query } from './query';
import { Encoder, EncoderResult } from './encoder';
import {
  RouteParamsEncoder,
  RouteParamsEncoderFactory,
  RouteParamsEncoderResult,
} from './route-params-encoder';
import { ParamsEncoder } from './params-encoder';
import { ParamsEncoders } from './params-encoders';

export function createQuery<TParams, TParentParams>(
  params?: ParamsEncoders<TParams>
): RouteParamsEncoderFactory<
  Query,
  Partial<TParentParams & TParams>,
  TParentParams
> {
  return (parent) => {
    if (parent !== undefined && !(parent instanceof QueryParamsEncoder)) {
      throw new Error('Parent must be an instance of QueryParamsEncoder');
    }
    return new QueryParamsEncoder(parent, params);
  };
}

export function createQueryParamsEncoderFactory<
  TParams,
  TParentParams,
>(options?: {
  params?: ParamsEncoders<TParams>;
}): RouteParamsEncoderFactory<
  Query,
  Partial<TParentParams & TParams>,
  TParentParams
> {
  return (parent) => {
    if (parent !== undefined && !(parent instanceof QueryParamsEncoder)) {
      throw new Error('Parent must be an instance of QueryParamsEncoder');
    }
    return new QueryParamsEncoder(parent, options?.params);
  };
}

export const query = createQueryParamsEncoderFactory;

class QueryParamsEncoder<TParams, TParentParams>
  implements RouteParamsEncoder<Query, Partial<TParentParams & TParams>>
{
  constructor(
    private readonly parent:
      | RouteParamsEncoder<Query, TParentParams>
      | undefined,
    private readonly params: ParamsEncoders<TParams> = {} as ParamsEncoders<TParams>
  ) {}

  encode(value: Partial<TParentParams & TParams>): EncoderResult<Query> {
    const query = this.encodeQuery(value);

    if (this.parent !== undefined) {
      // @ts-expect-error unsafe cast
      const parentResult = this.parent.encode(value);
      return {
        valid: true,
        value: {
          ...parentResult.value,
          ...query,
        },
      };
    } else {
      return {
        valid: true,
        value: query,
      };
    }
  }

  decode(
    value: Query,
    parentResult = this.parent?.decode(value)
  ): RouteParamsEncoderResult<Partial<TParentParams & TParams>> {
    const params: any = this.decodeQuery(value);
    if (parentResult !== undefined) {
      return {
        partiallyValid: true,
        valid: true,
        value: {
          ...parentResult.value,
          ...params,
        },
      };
    } else {
      return {
        partiallyValid: true,
        valid: true,
        value: params,
      };
    }
  }

  areParamsEqual(a: any, b: any): boolean {
    for (const name of new Set(...Object.keys(a), ...Object.keys(b))) {
      const param = (this.params as any)[name] as ParamsEncoder<
        string,
        unknown
      >;

      if (param === undefined) {
        return false;
      }

      const aVal = a[name];
      const bVal = b[name];

      if (param.areParamsEqual(aVal, bVal) ?? Object.is(aVal, bVal)) {
        return false;
      }
    }

    return true;
  }

  private encodeQuery(value: Partial<TParentParams & TParams>) {
    const query: Query = {};
    for (const [paramName, paramEncoder] of Object.entries<
      Encoder<string, unknown>
    >(this.params as any)) {
      const paramValue = (value as any)[paramName];
      if (paramValue === undefined) {
        continue;
      }

      const paramResult = paramEncoder.encode(paramValue);
      if (!paramResult.valid) {
        continue;
      }

      query[paramName] = paramResult.value;
    }
    return query;
  }

  private decodeQuery(value: Query): Partial<TParams> {
    const params: any = {};
    for (const [paramName, paramEncoder] of Object.entries<
      Encoder<string, unknown>
    >(this.params as any)) {
      const paramValue = (value as any)[paramName];
      if (paramValue === undefined) {
        continue;
      }

      const paramResult = paramEncoder.decode(paramValue);
      if (!paramResult.valid) {
        continue;
      }

      params[paramName] = paramResult.value;
    }
    return params;
  }
}
