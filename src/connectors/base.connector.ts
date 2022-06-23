import { Class, Options } from "../definitions";
import { Filter, WhereFilter } from "../filters";

export interface Transaction {
  tid: string;

  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface BaseConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  find<T>(filter: Filter<T>, target: Class<T>, options?: Options): Promise<T[]>;
  findById<T, ID>(
    id: ID,
    filter: Omit<Filter<T>, "where">,
    target: Class<T>,
    options?: Options
  ): Promise<T | null>;

  insert<T>(object: T, target: Class<T>, options?: Options): Promise<T>;
  insertAll<T>(objects: T[], target: Class<T>, options?: Options): Promise<T[]>;

  update<T>(object: T, target: Class<T>, options?: Options): Promise<T>;
  updateAll<T>(
    object: Partial<T>,
    where: WhereFilter<T>,
    target: Class<T>,
    options?: Options
  ): Promise<number>;

  deleteById<T, ID>(id: ID, target: Class<T>, options?: Options): Promise<void>;
  deleteAll<T>(
    where: WhereFilter<T>,
    target: Class<T>,
    options?: Options
  ): Promise<void>;

  begin(): Promise<Transaction>;
}
