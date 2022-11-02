import { BaseConnector, PgConnector } from "./connectors";
import { Constructor } from "./definitions";
import { Repository } from "./repository";

const CONNECTORS = {
  pg: { class: (config: DormConfig) => new PgConnector(config) },
};

export class Dorm<T extends BaseConnector = BaseConnector> {
  private readonly _connector: T;
  private readonly _repository: Repository;

  private constructor(config: DormConfig) {
    this._connector = CONNECTORS[config.connector].class(config);
    this._repository = new Repository(this._connector);
  }

  public static init<T extends BaseConnector>(config: DormConfig): Dorm<T> {
    return new Dorm<T>(config);
  }

  public getRepository(): Repository {
    return this._repository;
  }

  public get connector(): T {
    return this._connector;
  }

  public async connect(): Promise<void> {
    await this._connector.connect();
  }

  public async disconnect(): Promise<void> {
    await this._connector.disconnect();
  }

  // public getEntityRepository<T, K extends keyof T>(
  //   entity: Constructor<T>,
  //   id: K
  // ): EntityRepository<T, K> {
  //   return new EntityRepository(this, entity, id);
  // }
}

export type ConnectorType = "pg" | "mysql";

export interface DormConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  url?: string;
  connector: ConnectorType;
  pooling: boolean;
}

export function getObjectDef<T>(target: Constructor<T>) {
  const modelDef = Reflect.getMetadata("meta:model", target);
  const propDef = Reflect.getMetadata("meta:property", target) as object;
  propDef["0"] = modelDef;
  return {
    [target.name]: propDef,
  };
}
