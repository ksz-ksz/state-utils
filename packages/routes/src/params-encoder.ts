import { Encoder } from './encoder';
import { ParamsComparator } from './params-comparator';

export interface ParamsEncoder<TEncoded, TParams>
  extends Encoder<TEncoded, TParams>,
    ParamsComparator<TParams> {}
