import { BaseConnector, Transaction } from "./connectors";
import { Constructor, Options } from "./definitions";
import { Filter, WhereFilter } from "./filters";

export class Repository {
  private readonly connector: BaseConnector;

  constructor(connector: BaseConnector) {
    this.connector = connector;
  }

  /**
   * Start transaction.<br>
   * You can use this transaction object to commit/rollback transactional process
   * @returns Transaction Object
   * ```typescript
   *  const asd = new Transaction();
   * ```
   */
  async begin(): Promise<Transaction> {
    return this.connector.begin();
  }

  async create<T>(
    entity: Constructor<T>,
    data: T,
    options?: Options
  ): Promise<T> {
    return this.connector.insert(data, entity, options);
  }

  async createAll<T>(
    entity: Constructor<T>,
    data: T[],
    options?: Options
  ): Promise<T[]> {
    if (!data?.length) return [];
    return this.connector.insertAll(data, entity, options);
  }

  async deleteById<T, K extends keyof T>(
    entity: Constructor<T>,
    id: T[K],
    options?: Options
  ): Promise<void> {
    await this.connector.deleteById(id, entity, options);
  }

  async deleteAll<T>(
    entity: Constructor<T>,
    where: WhereFilter<T>,
    options?: Options
  ): Promise<void> {
    await this.connector.deleteAll(where, entity, options);
  }

  async find<T>(
    entity: Constructor<T>,
    filter: Filter<T>,
    options?: Options
  ): Promise<T[]> {
    return this.connector.find(filter, entity, options);
  }

  async findById<T, K extends keyof T>(
    entity: Constructor<T>,
    id: T[K],
    filter: Omit<Filter<T>, "where">,
    options?: Options
  ): Promise<T | null> {
    return this.connector.findById(id, filter, entity, options);
  }

  async update<T>(
    entity: Constructor<T>,
    object: T,
    options?: Options
  ): Promise<T> {
    return this.connector.update(object, entity, options);
  }

  async updateAll<T>(
    entity: Constructor<T>,
    object: Partial<T>,
    where: WhereFilter<T>,
    options?: Options
  ): Promise<number> {
    return this.connector.updateAll(object, where, entity, options);
  }
}
