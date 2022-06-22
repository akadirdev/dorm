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

  find<T>(filter: Filter<T>, target: Object, options?: Options): Promise<T[]>;
  findById<T, ID>(id: ID, target: Object, options?: Options): Promise<T>;

  insert<T>(object: T, Class: Class<T>, options?: Options): Promise<T>;
  insertAll<T>(objects: T[], Class: Class<T>, options?: Options): Promise<T[]>;

  update<T>(object: T, target: Object, options?: Options): Promise<T>;
  updateAll<T>(
    object: T,
    where: WhereFilter<T>,
    target: Object,
    options?: Options
  ): Promise<number>;

  deleteById<T, ID>(id: ID, Class: Class<T>, options?: Options): Promise<void>;
  deleteAll<T>(
    where: WhereFilter<T>,
    Class: Class<T>,
    options?: Options
  ): Promise<void>;

  begin(): Promise<Transaction>;
}
