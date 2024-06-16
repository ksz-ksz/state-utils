import { Container } from './container';
import { ComponentInstance } from './component-instance';
import { Components, useComponents } from './components';

export interface Component<T> {
  init(container: Container): ComponentInstance<T>;
}

export function createComponent<TInstance, TDeps>(
  create: (deps: TDeps) => TInstance,
  options: {
    deps?: Components<TDeps>;
    dispose?: (instance: TInstance) => void;
  } = {}
): Component<TInstance> {
  return {
    init(container: Container): ComponentInstance<TInstance> {
      if (options.deps !== undefined) {
        const depsComponent = useComponents(container, options.deps);
        const instance = create(depsComponent.component);
        return {
          component: instance,
          dispose() {
            depsComponent.release();
            options?.dispose?.(instance);
          },
        };
      } else {
        const instance = create({} as TDeps);
        return {
          component: instance,
          dispose() {
            options?.dispose?.(instance);
          },
        };
      }
    },
  };
}
