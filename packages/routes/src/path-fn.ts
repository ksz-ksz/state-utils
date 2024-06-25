import { Encoder } from './encoder';
import { Path } from './path';
import { MapEncoders } from './map-encoders';

type InferPathSegments<TPath extends string> = TPath extends ''
  ? never
  : TPath extends `${infer THead}/${infer TTail}`
    ? (THead extends '' ? never : THead) | InferPathSegments<TTail>
    : TPath;
type InferParamName<TPathSegment> = TPathSegment extends `:${infer TParamName}`
  ? TParamName
  : never;
type InferParamNames<TPath extends string> = InferParamName<
  InferPathSegments<TPath>
>;
export type PathParams<TPath extends string> = {
  [K in InferParamNames<TPath>]: unknown;
};

export function pathFn<
  TPath extends string,
  TParams extends PathParams<TPath>,
  TParentParams,
>(
  options: object extends TParams
    ? {
        path: TPath;
        params?: MapEncoders<TParams>;
      }
    : {
        path: TPath;
        params: MapEncoders<TParams>;
      }
): (
  parent: Encoder<Path, TParentParams>
) => Encoder<Path, TParentParams & TParams> {
  // @ts-expect-error fixme
  return options;
}
