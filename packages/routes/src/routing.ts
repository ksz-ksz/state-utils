import { Encoder } from './encoder';
import { Route } from './route';
import { Historian } from './historian';
import { ParamsEncoder, ParamsEncoderFactory } from './params-encoder';
import { Place } from './place';
import { RouteConfig } from './route-config';
import { RoutingRule } from './routing-rule';

export interface Routing<TData, TPath, TQuery, TFragment> {
  readonly baseHref: string;
  readonly pathEncoder: Encoder<string, TPath>;
  readonly queryEncoder: Encoder<string, TQuery>;
  readonly fragmentEncoder: Encoder<string, TFragment>;

  parseHref(href: string): Place<TPath, TQuery, TFragment>;

  formatHref(place: Place<TPath, TQuery, TFragment>): string;

  createRoute<TPathParams, TQueryParams, TFragmentParams>(options: {
    parent?: never;
    path: ParamsEncoderFactory<TPath, TPathParams, unknown>;
    query: ParamsEncoderFactory<TQuery, TQueryParams, unknown>;
    fragment: ParamsEncoderFactory<TFragment, TFragmentParams, unknown>;
  }): Route<
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >;
  createRoute<
    TParentPathParams,
    TParentQueryParams,
    TParentFragmentParams,
    TPathParams = TParentPathParams,
    TQueryParams = TParentQueryParams,
    TFragmentParams = TParentFragmentParams,
  >(options: {
    parent: Route<
      TParentPathParams,
      TParentQueryParams,
      TParentFragmentParams,
      TPath,
      TQuery,
      TFragment
    >;
    path?: ParamsEncoderFactory<TPath, TPathParams, TParentPathParams>;
    query?: ParamsEncoderFactory<TQuery, TQueryParams, TParentQueryParams>;
    fragment?: ParamsEncoderFactory<
      TFragment,
      TFragmentParams,
      TParentFragmentParams
    >;
  }): Route<
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >;

  createRouteConfig<TPathParams, TQueryParams, TFragmentParams>(
    route: Route<
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >,
    options: {
      data?: TData;
      rules?: RoutingRule<
        TData,
        TPathParams,
        TQueryParams,
        TFragmentParams,
        TPath,
        TQuery,
        TFragment
      >[];
      children?: RouteConfig<
        TData,
        unknown,
        unknown,
        unknown,
        TPath,
        TQuery,
        TFragment
      >[];
    }
  ): RouteConfig<
    TData,
    TPathParams,
    TQueryParams,
    TFragmentParams,
    TPath,
    TQuery,
    TFragment
  >;

  createPlace<
    TPathParams extends Record<string, unknown>,
    TQueryParams,
    TFragmentParams,
  >(
    route: Route<
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    >,
    options: {
      path: TPathParams;
      query?: TQueryParams;
      fragment?: TFragmentParams;
    }
  ): Place<TPath, TQuery, TFragment>;
  createPlace<
    TPathParams extends Record<string, never>,
    TQueryParams,
    TFragmentParams,
  >(
    route: Route<TPathParams, TQueryParams, TFragmentParams>,
    options?: {
      path?: TPathParams;
      query?: TQueryParams;
      fragment?: TFragmentParams;
    }
  ): Place<TPath, TQuery, TFragment>;
}

function isPathPrefix(path: string, prefix: string) {
  if (path === prefix) {
    return true;
  } else if (prefix.endsWith('/')) {
    return path.startsWith(prefix);
  } else {
    return path.startsWith(`${prefix}/`);
  }
}

function removePathPrefix(path: string, prefix: string) {
  if (path === prefix) {
    return '';
  } else if (prefix.endsWith('/')) {
    return path.substring(prefix.length);
  } else {
    return path.substring(prefix.length + 1);
  }
}

export function createRouting<TData, TPath, TQuery, TFragment>(options: {
  historian: Historian;
  baseHref: string;
  pathEncoder: Encoder<string, TPath>;
  queryEncoder: Encoder<string, TQuery>;
  fragmentEncoder: Encoder<string, TFragment>;
  defaultData: TData;
  defaultPlace: Place<TPath, TQuery, TFragment>;
}): Routing<TData, TPath, TQuery, TFragment> {
  let routeId = 0;

  const {
    baseHref,
    pathEncoder,
    queryEncoder,
    fragmentEncoder,
    defaultData,
    defaultPlace,
  } = options;

  const baseUrl = new URL(baseHref, 'http://base');

  return {
    baseHref,
    pathEncoder,
    queryEncoder,
    fragmentEncoder,

    parseHref(href: string): Place<TPath, TQuery, TFragment> {
      const { pathname, search, hash } = new URL(href, baseUrl);

      if (!isPathPrefix(pathname, baseHref)) {
        return defaultPlace;
      }

      const pathnameWithoutBaseHref = removePathPrefix(pathname, baseHref);

      const pathResult = pathEncoder.decode(pathnameWithoutBaseHref);
      if (!pathResult.valid) {
        return defaultPlace;
      }
      const queryResult = queryEncoder.decode(search);
      if (!queryResult.valid) {
        return defaultPlace;
      }
      const fragmentResult = fragmentEncoder.decode(hash);
      if (!fragmentResult.valid) {
        return defaultPlace;
      }

      return {
        path: pathResult.value,
        query: queryResult.value,
        fragment: fragmentResult.value,
      };
    },

    formatHref(place: Place<TPath, TQuery, TFragment>): string {
      const pathResult = pathEncoder.encode(place.path);
      if (!pathResult.valid) {
        return '';
      }

      const queryResult = queryEncoder.encode(place.query);
      if (!queryResult.valid) {
        return '';
      }

      const fragmentResult = fragmentEncoder.encode(place.fragment);
      if (!fragmentResult.valid) {
        return '';
      }

      const pathname = new URL(pathResult.value, baseUrl).pathname;
      const search = queryResult.value;
      const hash = fragmentResult.value;

      return `${pathname}${search}${hash}`;
    },

    createRoute({ parent, path, query, fragment }: any) {
      return {
        id: routeId++,
        parent,
        pathEncoder: getParamsEncoder(
          path,
          parent?.pathEncoder as ParamsEncoder<TPath, any>
        ),
        queryEncoder: getParamsEncoder(
          query,
          parent?.queryEncoder as ParamsEncoder<TQuery, any>
        ),
        fragmentEncoder: getParamsEncoder(
          fragment,
          parent?.fragmentEncoder as ParamsEncoder<TFragment, any>
        ),
      };
    },
    createRouteConfig<TPathParams, TQueryParams, TFragmentParams>(
      route: Route<
        TPathParams,
        TQueryParams,
        TFragmentParams,
        TPath,
        TQuery,
        TFragment
      >,
      {
        data = defaultData,
        rules = [],
        children = [],
      }: {
        data?: TData;
        rules?: RoutingRule<
          TData,
          TPathParams,
          TQueryParams,
          TFragmentParams,
          TPath,
          TQuery,
          TFragment
        >[];
        children?: RouteConfig<
          TData,
          unknown,
          unknown,
          unknown,
          TPath,
          TQuery,
          TFragment
        >[];
      }
    ): RouteConfig<
      TData,
      TPathParams,
      TQueryParams,
      TFragmentParams,
      TPath,
      TQuery,
      TFragment
    > {
      return {
        data,
        route,
        rules,
        children,
      };
    },
    createPlace(
      route: Route<unknown, unknown, unknown, TPath, TQuery, TFragment>,
      { path, query, fragment }: any = {}
    ): Place<TPath, TQuery, TFragment> {
      const pathResult = route.pathEncoder.encode(path);
      if (!pathResult.valid) {
        return defaultPlace;
      }
      const queryResult = route.queryEncoder.encode(query);
      if (!queryResult.valid) {
        return defaultPlace;
      }
      const fragmentResult = route.fragmentEncoder.encode(fragment);
      if (!fragmentResult.valid) {
        return defaultPlace;
      }

      return {
        path: pathResult.value,
        query: queryResult.value,
        fragment: fragmentResult.value,
      };
    },
  };
}

function getParamsEncoder<TEncoded, TParams>(
  encoderFactory?: ParamsEncoderFactory<TEncoded, TParams, any>,
  parentEncoder?: ParamsEncoder<TEncoded, any>
) {
  if (encoderFactory !== undefined) {
    return encoderFactory(parentEncoder);
  }
  if (parentEncoder !== undefined) {
    return parentEncoder;
  }
  throw new Error(`Please provide encoders configuration for root route.`);
}
