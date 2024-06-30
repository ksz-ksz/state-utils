import { Encoder, EncoderResult } from './encoder';
import { Query } from './query';

export function createQueryEncoder(): Encoder<string, Query> {
  return new QueryEncoder();
}

class QueryEncoder implements Encoder<string, Query> {
  encode(value: Query): EncoderResult<string> {
    let queryString = '';
    for (const [paramKey, paramValue] of Object.entries(value)) {
      queryString += `${queryString === '' ? '?' : '&'}${encodeURIComponent(paramKey)}=${encodeURIComponent(paramValue)}`;
    }
    return {
      valid: true,
      value: queryString,
    };
  }

  decode(value: string): EncoderResult<Query> {
    const query: Query = {};
    const queryString = normalizeQueryString(value);
    const entries = queryString.split('&');
    for (const entry of entries) {
      const [paramKey, paramValue] = entry.split('=');
      query[decodeURIComponent(paramKey)] = decodeURIComponent(paramValue);
    }
    return {
      valid: true,
      value: query,
    };
  }
}

function normalizeQueryString(value: string) {
  let queryString = value;
  if (queryString.startsWith('?')) {
    queryString = queryString.substring(1);
  }
  if (queryString.endsWith('&')) {
    queryString = queryString.substring(0, -1);
  }
  return queryString;
}