import { Encoders } from './encoders';
import { Query } from './query';
import { Encoder, EncoderResult } from './encoder';
import {
  ParamsEncoder,
  ParamsEncoderFactory,
  ParamsEncoderResult,
} from './params-encoder';

export function createQueryParamsEncoderFactory<
  TParams,
  TParentParams,
>(options?: {
  params?: Encoders<TParams>;
}): ParamsEncoderFactory<
  Query,
  Partial<TParentParams & TParams>,
  TParentParams
> {
  return (parent) =>
    new QueryParamsEncoder(
      // @ts-expect-error unsafe cast
      parent,
      options?.params ?? {}
    );
}

export const query = createQueryParamsEncoderFactory;

class QueryParamsEncoder<TParams, TParentParams>
  implements ParamsEncoder<Query, Partial<TParentParams & TParams>>
{
  constructor(
    private readonly parent: ParamsEncoder<Query, TParentParams>,
    private readonly params: Encoders<TParams> = {} as Encoders<TParams>
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

  decode(value: Query): ParamsEncoderResult<Partial<TParentParams & TParams>> {
    const params: any = this.decodeQuery(value);
    if (this.parent !== undefined) {
      const parentResult = this.parent.decode(value);
      return {
        valid: true,
        value: {
          ...parentResult.value,
          ...params,
        },
        parent: parentResult,
      };
    } else {
      return {
        valid: true,
        value: params,
        parent: undefined,
      };
    }
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
