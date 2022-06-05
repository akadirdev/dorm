export type WhereFilter<T> = Partial<Where<T>>;

interface BaseWhereFilter<T> {
  inq?: T[];
}

type Where<T> = {
  [Property in keyof T]: T[Property] | BaseWhereFilter<T[Property]>;
};
