import {
  Component,
  Components,
  createComponent,
  createComponents,
} from '@state-utils/containers';
import { createEffect, Effect, EffectDef } from '@state-utils/effects';
import { actionSourcesComponent } from './action-sources-component';

export interface EffectComponent extends Component<Effect> {}

export function createEffectComponent<TDeps>(
  createEffectDef: (deps: TDeps) => EffectDef,
  options?: { deps?: Components<TDeps> }
): EffectComponent {
  return createComponent(
    ({ actionSources, deps }) =>
      createEffect(actionSources, createEffectDef(deps)),
    {
      deps: {
        actionSources: actionSourcesComponent,
        deps: createComponents((options?.deps ?? []) as Components<TDeps>),
      },
    }
  );
}
