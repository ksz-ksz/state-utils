import { Encoder } from './encoder';

export type Query = {
  [name: string]: string;
};

export function createQueryEncoder(): Encoder<string, Query> {
  // @ts-expect-error fixme
  return undefined;
}
