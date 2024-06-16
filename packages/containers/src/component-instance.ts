export interface ComponentInstance<T> {
  component: T;
  dispose?: () => void;
}
