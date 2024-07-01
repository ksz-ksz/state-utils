import { Encoder, EncoderResult } from './encoder';
import { Fragment } from './fragment';

export function createFragmentEncoder(): Encoder<string, Fragment> {
  return new FragmentEncoder();
}

class FragmentEncoder implements Encoder<string, Fragment> {
  encode(value: Fragment): EncoderResult<string> {
    return {
      valid: true,
      value:
        value === undefined || value === ''
          ? ''
          : `#${encodeURIComponent(value)}`,
    };
  }

  decode(value: string): EncoderResult<Fragment> {
    const fragmentString = normalizeFragmentString(value);

    return {
      valid: true,
      value: decodeURIComponent(fragmentString),
    };
  }
}

function normalizeFragmentString(value: string) {
  let fragmentString = value;

  if (fragmentString.startsWith('#')) {
    fragmentString = fragmentString.substring(1);
  }

  return fragmentString;
}
