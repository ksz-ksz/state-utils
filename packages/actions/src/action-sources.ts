import { ActionSource } from './action-source';
import { Action, ActionType } from './action';
import { Observable } from 'rxjs';

export interface ActionSources {
  dispatch<TPayload, TReturnPayload>(
    action: Action<TPayload, TReturnPayload>
  ): Observable<TReturnPayload>[];
  ofType<TPayload, TReturnPayload>(
    type: ActionType<TPayload, TReturnPayload>
  ): ActionSource<TPayload, TReturnPayload>;
}

export function createActionSources(): ActionSources {
  const sources = new Map<string, WeakRef<ActionSource<unknown, unknown>>>();

  function getSource<TPayload, TReturnPayload>(
    namespace: string,
    name: string,
    create?: true
  ): ActionSource<TPayload, TReturnPayload>;
  function getSource<TPayload, TReturnPayload>(
    namespace: string,
    name: string,
    create: false
  ): ActionSource<TPayload, TReturnPayload> | undefined;
  function getSource<TPayload, TReturnPayload>(
    namespace: string,
    name: string,
    create = true
  ): ActionSource<TPayload, TReturnPayload> | undefined {
    const actionKey = `${namespace}::${name}`;
    const source = sources.get(actionKey)?.deref();
    if (source !== undefined) {
      return source as ActionSource<TPayload, TReturnPayload>;
    } else if (create) {
      const source = new ActionSource<TPayload, TReturnPayload>(
        namespace,
        name
      );
      sources.set(actionKey, new WeakRef(source));
      return source;
    } else {
      return undefined;
    }
  }

  return {
    dispatch<TPayload, TReturnPayload>(
      action: Action<TPayload, TReturnPayload>
    ): Observable<TReturnPayload>[] {
      const source = getSource(action.namespace, action.name, false);
      return (source?.dispatch(action) as Observable<TReturnPayload>[]) ?? [];
    },
    ofType<TPayload, TReturnPayload>(
      type: ActionType<TPayload, TReturnPayload>
    ): ActionSource<TPayload, TReturnPayload> {
      return getSource(type.namespace, type.name);
    },
  };
}
