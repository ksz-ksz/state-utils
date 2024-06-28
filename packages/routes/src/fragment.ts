import { Encoder } from './encoder';

export type Fragment = string;

export function createFragmentEncoder(): Encoder<string, Fragment> {
  // @ts-expect-error fixme
  return undefined;
}
