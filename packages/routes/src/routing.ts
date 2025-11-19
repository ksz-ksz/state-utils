import { Encoder } from './encoder';
import { Route } from './route';
import {
  RouteParamsEncoder,
  RouteParamsEncoderFactory,
} from './route-params-encoder';
import { Place } from './place';
import { RouteConfig } from './route-config';
import { RoutingRule } from './routing-rule';

export interface Routing<TData, TPath, TQuery, TFragment> {
  readonly baseHref: string;
  readonly pathEncoder: Encoder<string, TPath>;
  readonly queryEncoder: Encoder<string, TQuery>;
  readonly fragmentEncoder: Encoder<string, TFragment>;
  readonly defaultPlace: Place<TPath, TQuery, TFragment>;

  parseHref(href: string): Place<TPath, TQuery, TFragment>;

  formatHref(place: Place<TPath, TQuery, TFragment>): string;

  createRoute<TPathParams, TQueryParams, TFragmentParams>(options: {
    parent?: never;
    path: RouteParamsEncoderFactory<TPath, TPathParams, unknown>;
    query: RouteParamsEncoderFactory<TQuery, TQueryParams, unknown>;
    fragment: RouteParamsEncoderFactory<TFragment, TFragmentParams, unknown>;
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
    path?: RouteParamsEncoderFactory<TPath, TPathParams, TParentPathParams>;
    query?: RouteParamsEncoderFactory<TQuery, TQueryParams, TParentQueryParams>;
    fragment?: RouteParamsEncoderFactory<
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
  baseHref: string;
  pathEncoder: Encoder<string, TPath>;
  queryEncoder: Encoder<string, TQuery>;
  fragmentEncoder: Encoder<string, TFragment>;
  defaultData: TData;
  defaultPlace: Place<TPath, TQuery, TFragment>;
}): Routing<TData, TPath, TQuery, TFragment> {
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
    defaultPlace,

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
      const route: Route<unknown, unknown, unknown, TPath, TQuery, TFragment> =
        {
          parent,
          pathEncoder: getParamsEncoder(
            path,
            parent?.pathEncoder as RouteParamsEncoder<TPath, any>
          ),
          queryEncoder: getParamsEncoder(
            query,
            parent?.queryEncoder as RouteParamsEncoder<TQuery, any>
          ),
          fragmentEncoder: getParamsEncoder(
            fragment,
            parent?.fragmentEncoder as RouteParamsEncoder<TFragment, any>
          ),
        };

      return route;
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
        route,
        rules,
        children,
        data,
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
  encoderFactory?: RouteParamsEncoderFactory<TEncoded, TParams, any>,
  parentEncoder?: RouteParamsEncoder<TEncoded, any>
) {
  if (encoderFactory !== undefined) {
    return encoderFactory(parentEncoder);
  }
  if (parentEncoder !== undefined) {
    return parentEncoder;
  }
  throw new Error(`Please provide encoders configuration for root route.`);
}
