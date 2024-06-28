import { Encoders } from './encoders';
import { Query } from './query';
import { EncoderFactory } from './encoder-factory';
import { Encoder, EncoderResult } from './encoder';

export function createQueryEncoderFactory<TParams, TParentParams>(options?: {
  params?: Encoders<TParams>;
}): EncoderFactory<
  Query,
  Partial<TParentParams & TParams>,
  Partial<TParentParams>
> {
  // @ts-expect-error unsafe cast
  return (parent) => new QueryEncoder(parent, options.params);
}

class QueryEncoder<TParams, TParentParams>
  implements Encoder<Query, Partial<TParentParams & TParams>>
{
  constructor(
    private readonly parent: Encoder<Query, TParentParams>,
    private readonly params: Encoders<TParams>
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

  decode(value: Query): EncoderResult<Partial<TParentParams & TParams>> {
    const params: any = this.decodeQuery(value);
    if (this.parent !== undefined) {
      const parentResult = this.parent.decode(value);
      return {
        valid: true,
        value: {
          ...parentResult.value,
          ...params,
        },
      };
    } else {
      return {
        valid: true,
        value: params,
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
