export type WhereFilter<T> = Partial<Where<T>>;

export interface BaseWhereFilter<T> {
  inq?: T[];
  neq?: T;
}

// type Prop<T, P extends keyof T> = T[P] extends Array<infer Item> ? Item : T[P];

type Where<T> = {
  [Property in keyof T]: T[Property] | BaseWhereFilter<T[Property]>;
};
