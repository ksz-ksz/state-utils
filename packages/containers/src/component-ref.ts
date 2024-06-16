export interface ComponentRef<T> {
  component: T;
  release: () => void;
}
