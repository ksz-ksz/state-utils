import { Encoder } from './encoder';

export interface Path {
  segments: string[];
}

export function createPathEncoder(): Encoder<string, Path> {
  // @ts-expect-error fixme
  return undefined;
}
