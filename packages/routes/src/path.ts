import { Encoder } from './encoder';

export interface PathPathSegment {
  type: 'path';
  literal: string;
}

export interface PathParamPathSegment {
  type: 'path-param';
  param: string;
}

export type PathSegment = PathPathSegment | PathParamPathSegment;

export interface Path {
  segments: PathSegment[];
}

export function createPathEncoder(): Encoder<string, Path> {
  // @ts-expect-error fixme
  return undefined;
}
