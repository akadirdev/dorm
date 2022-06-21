import { BaseConnector, Transaction } from "./connectors";
import { Class, Options } from "./definitions";
import { Dorm } from "./dorm";
import { WhereFilter } from "./filters";
import { FieldFilter } from "./filters/field.filter";
import { Querier } from "./querier";

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

  querier = <T, K extends keyof T>(entity: Class<T>): Querier<T, K> => {
    return new Querier(entity);
  };

  async create<T>(entity: Class<T>, data: T, options?: Options): Promise<T> {
    return this.connector.insert(data, entity, options);
  }

  async createAll<T>(
    entity: Class<T>,
    data: T[],
    options?: Options
  ): Promise<T[]> {
    if (!data?.length) return [];
    return this.connector.insertAll(data, entity, options);
  }

  async deleteById<T, K extends keyof T>(
    entity: Class<T>,
    id: T[K],
    options?: Options
  ): Promise<void> {
    await this.connector.deleteById(id, entity, options);
  }

  async find<T>(
    entity: Class<T>,
    where: WhereFilter<T>,
    options?: Options
  ): Promise<T[]> {
    return this.connector.find(where, entity, options);
  }

  async findById<T, K extends keyof T>(
    entity: Class<T>,
    id: T[K],
    options?: Options
  ): Promise<T> {
    return this.connector.findById(id, entity, options);
  }

  async update<T>(entity: Class<T>, object: T, options?: Options): Promise<T> {
    return this.connector.update(object, entity, options);
  }

  async updateAll<T>(
    entity: Class<T>,
    object: T,
    where: WhereFilter<T>,
    options?: Options
  ): Promise<number> {
    return this.connector.updateAll(object, where, entity, options);
  }
}

export class EntityRepository<T, K extends keyof T> {
  private readonly _entity: Class<T>;
  private readonly _repo: Repository;

  constructor(ds: Dorm.Datasource, entity: Class<T>, id?: K) {
    this._repo = ds.repository;
    this._entity = entity;
  }

  async findById(id: T[K], options?: Options): Promise<T> {
    return this._repo.findById(this._entity, id, options);
  }
}
