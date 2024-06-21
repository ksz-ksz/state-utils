import { Action, ActionSources } from '@state-utils/actions';
import { catchError, merge, Observable, throwError } from 'rxjs';
import { EffectError } from './effect-error';

export interface Effect {
  dispose(): void;
}

export interface EffectInitializer {
  (actionSources: ActionSources): Observable<Action<any>>;
}

export type EffectInitializers =
  | Record<string, EffectInitializer>
  | Array<EffectInitializer>;

export function createEffect(
  actionSources: ActionSources,
  effectDef: EffectDef
): Effect {
  const { name = 'anonymous', effects } = effectDef;
  const subscription = merge(
    ...Object.entries(effects).map(([key, initializer]) =>
      initializer(actionSources).pipe(
        catchError((e) => throwError(() => new EffectError(name, key, e)))
      )
    )
  ).subscribe({
    next(action) {
      actionSources.dispatch(action);
    },
    // error(error) {
    //   queueMicrotask(() => {
    //     throw new EffectError(name, '*', error);
    //   });
    // },
    // TODO: complete?
    // TODO: observeOn(queue)?
  });

  return {
    dispose() {
      subscription.unsubscribe();
    },
  };
}

export interface EffectDef {
  name?: string;
  effects: EffectInitializers;
}
