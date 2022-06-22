import { FieldFilter } from "./field.filter";
import { IncludeFilter } from "./include.filter";
import { WhereFilter } from "./where.filter";

export interface Filter<T> {
  field?: FieldFilter<keyof T>;
  where?: WhereFilter<T>;
  relations?: IncludeFilter<T, keyof T>;
}
