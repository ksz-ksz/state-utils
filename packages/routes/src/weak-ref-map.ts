export class WeakRefMap<T extends object> {
  private readonly map = new Map<number, WeakRef<T>>();
  private readonly registry = new FinalizationRegistry((id: number) => {
    this.map.delete(id);
  });

  set(id: number, value: T) {
    this.map.set(id, new WeakRef<T>(value));
  }

  get(id: number) {
    const ref = this.map.get(id);
    if (ref === undefined) {
      return undefined;
    }
    const value = ref.deref();
    if (value === undefined) {
      this.map.delete(id);
      return undefined;
    }
    return value;
  }

  delete(id: number) {
    const value = this.get(id);
    if (value !== undefined) {
      this.map.delete(id);
      this.registry.unregister(value);
    }
  }
}
