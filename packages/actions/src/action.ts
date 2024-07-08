declare const returnPayload: unique symbol;

export interface ActionType<TPayload = unknown, TReturnPayload = unknown> {
  namespace: string;
  name: string;
  (payload: TPayload): Action<TPayload, TReturnPayload>;
  is(action: Action): action is Action<TPayload, TReturnPayload>;
}

export interface Action<TPayload = unknown, TReturnPayload = unknown> {
  [returnPayload]?: TReturnPayload;
  namespace: string;
  name: string;
  payload: TPayload;
}

export type ActionTypes<TActionTypes extends ActionTypeDefs> = {
  [K in keyof TActionTypes]: ActionType<
    TActionTypes[K]['payload'],
    TActionTypes[K]['returnPayload']
  >;
};

interface ActionTypeDef<TPayload = unknown, TReturnPayload = unknown> {
  payload: TPayload;
  returnPayload?: TReturnPayload;
}

type ActionTypeDefs = {
  [key: string]: ActionTypeDef;
};

export function createActionTypes<TActionTypes extends ActionTypeDefs>({
  namespace,
}: {
  namespace: string;
}): ActionTypes<TActionTypes> {
  // @ts-expect-error unsafe cast
  return new Proxy(
    {},
    {
      get(
        target: Record<string, ActionType<unknown>>,
        key: string
      ): ActionType<unknown> {
        const name = key;
        let actionFactory = target[name];
        if (actionFactory === undefined) {
          actionFactory = Object.defineProperties(
            (payload: unknown) => ({ namespace, name, payload }),
            {
              namespace: { value: namespace },
              name: { value: name },
              is: {
                value: (action: Action<unknown>): action is Action<unknown> =>
                  action.namespace === namespace && action.name === name,
              },
            }
          ) as ActionType<unknown>;
          target[name] = actionFactory;
        }
        return actionFactory;
      },
    }
  );
}
