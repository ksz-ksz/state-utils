export interface Historian {
  getHref(): string;
  getState(): unknown;
  push(href: string, state: unknown): void;
  replace(href: string, state: unknown): void;
  go(delta: number): void;
  forward(): void;
  backward(): void;
  addPopListener(listener: (href: string, state: unknown) => void): void;
  removePopListener(listener: (href: string, state: unknown) => void): void;
  dispose(): void;
}
