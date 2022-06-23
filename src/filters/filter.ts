import { FieldFilter } from "./field.filter";
import { RelationFilter } from "./include.filter";
import { WhereFilter } from "./where.filter";

export interface Filter<T> {
  field?: FieldFilter<keyof T>;
  where?: WhereFilter<T>;
  relations?: RelationFilter<T, keyof T>;
}
