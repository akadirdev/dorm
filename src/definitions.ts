import { Transaction } from "./connectors";

export type Constructor<T> = new (...args: any[]) => T;

export type Entity<T> = Function & {
  prototype: T;
};

export interface ModelDefinition {
  name?: string;
}

export type ColumnTypes =
  | "number"
  | "string"
  | "boolean"
  | "array"
  | "object"
  | "date";

export interface PropertyDefinition {
  id?: boolean;
  name?: string;
  type: ColumnTypes;
  required?: boolean;
  nullable?: boolean;
  format?: string;
}

export interface Options {
  transaction?: Transaction;
}

export interface RelationDefinition<T> {
  // target?: Class<T>;
  type?: Extract<ColumnTypes, "object" | "array">;
  refererName?: keyof T;
}
