export type Intersect<T> = T extends [infer U]
  ? U
  : T extends [infer U, ...infer Rest]
    ? U & Intersect<Rest>
    : unknown;
