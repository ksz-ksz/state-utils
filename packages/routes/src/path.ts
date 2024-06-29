import { Encoder } from './encoder';

export type Path = string[];

export function createPathEncoder(): Encoder<string, Path> {
  // @ts-expect-error fixme
  return undefined;
}
