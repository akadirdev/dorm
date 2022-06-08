import { BaseConnector, PgConnector } from "./connectors";
import { WhereFilter } from "./filters/where.filter";

export const CONNECTORS = {
  pg: { class: (config: Config) => new PgConnector(config) },
};

export class Dorm<T extends BaseConnector> {
  private readonly connector: T;

  public readonly repository: Repository;

  constructor(config: Config) {
    this.connector = CONNECTORS[config.connector].class(config);
    this.repository = new Repository(this.connector);
  }

  public async connect(): Promise<void> {
    await this.connector.connect();
  }
  public async disconnect(): Promise<void> {
    await this.connector.disconnect();
  }
}

export type ConnectorType = "pg" | "mysql";

export interface Config {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  url?: string;
  connector: ConnectorType;
  pooling: boolean;
}

class Repository {
  private readonly connector: BaseConnector;

  constructor(connector: BaseConnector) {
    this.connector = connector;
  }
  async create<T>(data: T, option?: any): Promise<T> {
    return data;
  }

  async find<T>(
    entity: Class<T>,
    where: WhereFilter<T>,
    option?: any
  ): Promise<T[]> {
    return this.connector.find(where, entity, option);
  }
}

export type Class<T> = new (...args: any[]) => T;

export function getObjectDef<T>(target: Class<T>) {
  const modelName = Reflect.getMetadata("meta:model", target);
  const propDef = Reflect.getMetadata("meta:property", target) as object;
  propDef["0"] = modelName;
  return {
    [target.name]: propDef,
  };
}
