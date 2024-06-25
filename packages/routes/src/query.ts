import { Encoder } from './encoder';

export interface QueryEntry {
  key: string;
  value: string;
}

export interface Query {
  entries: QueryEntry[];
}

export function createQueryEncoder(): Encoder<string, Query> {
  // @ts-expect-error fixme
  return undefined;
}
