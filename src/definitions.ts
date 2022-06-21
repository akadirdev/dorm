import { Transaction } from "./connectors";

export type Class<T> = new (...args: any[]) => T;

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
