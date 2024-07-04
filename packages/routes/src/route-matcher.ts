import { Place } from './place';
import { RouteObject } from './route-object';
import { RouteConfig } from './route-config';
import { ParamsEncoderResult } from './params-encoder';

export interface RouteMatch<TData, Path, TQuery, TFragment> {
  routeConfig: RouteConfig<
    TData,
    unknown,
    unknown,
    unknown,
    Path,
    TQuery,
    TFragment
  >;
  routeObject: RouteObject<unknown, unknown, unknown>;
}

export interface RouteMatcher<TData, TPath, TQuery, TFragment> {
  match(
    place: Place<TPath, TQuery, TFragment>
  ): RouteMatch<TData, TPath, TQuery, TFragment>[] | undefined;
}

export function createRouteMatcher<TData, TPath, TQuery, TFragment>(
  rootRouteConfig: RouteConfig<
    TData,
    unknown,
    unknown,
    unknown,
    TPath,
    TQuery,
    TFragment
  >
): RouteMatcher<TData, TPath, TQuery, TFragment> {
  return new RouteMatcherImpl(rootRouteConfig);
}

class RouteMatcherImpl<TData, TPath, TQuery, TFragment>
  implements RouteMatcher<TData, TPath, TQuery, TFragment>
{
  constructor(
    private readonly rootRouteConfig: RouteConfig<
      TData,
      unknown,
      unknown,
      unknown,
      TPath,
      TQuery,
      TFragment
    >
  ) {}

  match(
    place: Place<TPath, TQuery, TFragment>
  ): RouteMatch<TData, TPath, TQuery, TFragment>[] | undefined {
    return match(this.rootRouteConfig, place);
  }
}

function match<TData, TPath, TQuery, TFragment>(
  routeConfig: RouteConfig<
    TData,
    unknown,
    unknown,
    unknown,
    TPath,
    TQuery,
    TFragment
  >,
  place: Place<TPath, TQuery, TFragment>,
  parentPathResult?: ParamsEncoderResult<unknown>,
  parentQueryResult?: ParamsEncoderResult<unknown>,
  parentFragmentResult?: ParamsEncoderResult<unknown>
): RouteMatch<TData, TPath, TQuery, TFragment>[] | undefined {
  const { id, pathEncoder, queryEncoder, fragmentEncoder } = routeConfig.route;
  const { path, query, fragment } = place;
  const pathResult = pathEncoder.decode(path, parentPathResult);

  if (!pathResult.partiallyValid) {
    return undefined;
  }

  const queryResult = queryEncoder.decode(query, parentQueryResult);
  const fragmentResult = fragmentEncoder.decode(fragment, parentFragmentResult);

  for (const child of routeConfig.children) {
    const matchResult = match(
      child,
      place,
      pathResult,
      queryResult,
      fragmentResult
    );
    if (matchResult !== undefined) {
      return [
        {
          routeConfig,
          routeObject: {
            id,
            path: pathResult.value,
            query: queryResult.valid ? queryResult.value : undefined, // fixme: return undefined or default value?
            fragment: fragmentResult.valid ? fragmentResult.value : undefined, // fixme: return undefined or default value?
          },
        },
        ...matchResult,
      ];
    }
  }

  if (pathResult.valid) {
    return [
      {
        routeConfig,
        routeObject: {
          id,
          path: pathResult.value,
          query: queryResult.valid ? queryResult.value : undefined, // fixme: return undefined or default value?
          fragment: fragmentResult.valid ? fragmentResult.value : undefined, // fixme: return undefined or default value?
        },
      },
    ];
  }

  return undefined;
}
