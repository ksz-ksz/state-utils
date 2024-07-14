export interface ParamsComparator<TParams> {
  areParamsEqual(a: TParams, b: TParams): boolean;
}
