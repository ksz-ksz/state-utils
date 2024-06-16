import { ComponentRef } from './component-ref';
import { Component } from './component';
import { Container } from './container';

export type Components<T> = {
  [K in keyof T]: Component<T[K]>;
};

function useComponentsObject<T extends Record<any, any>>(
  container: Container,
  components: Components<T>
): ComponentRef<T> {
  const refs: ComponentRef<unknown>[] = [];
  const componentsObject: Record<any, any> = {};

  for (const [key, component] of Object.entries<Component<unknown>>(
    components
  )) {
    const ref = container.use(component);
    refs.push(ref);
    componentsObject[key] = ref.component;
  }

  return {
    component: componentsObject as T,
    release() {
      for (const ref of refs) {
        ref.release();
      }
    },
  };
}

function useComponentsArray<T extends Array<any>>(
  container: Container,
  components: [...Components<T>]
): ComponentRef<T> {
  const refs: ComponentRef<unknown>[] = [];
  const componentsArray: Array<any> = [];

  for (const component of components) {
    const ref = container.use(component);
    refs.push(ref);
    componentsArray.push(ref.component);
  }

  return {
    component: componentsArray as T,
    release() {
      for (const ref of refs) {
        ref.release();
      }
    },
  };
}

export function useComponents<T extends Array<any>>(
  container: Container,
  components: [...Components<T>]
): ComponentRef<T>;
export function useComponents<T extends Record<any, any>>(
  container: Container,
  components: Components<T>
): ComponentRef<T>;
export function useComponents(
  container: Container,
  components: Components<Array<any> | Record<any, any>>
): ComponentRef<Array<any> | Record<any, any>> {
  return Array.isArray(components)
    ? useComponentsArray(container, components)
    : useComponentsObject(container, components);
}

export function createComponents<T extends Array<any>>(
  components: [...Components<T>]
): Component<T>;
export function createComponents<T extends Record<any, any>>(
  components: Components<T>
): Component<T>;
export function createComponents(
  components: Components<Array<any> | Record<any, any>>
): Component<Array<any> | Record<any, any>> {
  return {
    init(container) {
      return useComponents(container, components);
    },
  };
}
