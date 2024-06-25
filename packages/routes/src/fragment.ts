import { Encoder } from './encoder';

export interface Fragment {
  value: string;
}

export function createFragmentEncoder(): Encoder<string, Fragment> {
  // @ts-expect-error fixme
  return undefined;
}
