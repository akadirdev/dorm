import { BaseConnector, PgConnector } from "./connectors";
import { WhereFilter } from "./filters/where.filter";

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

export const CONNECTORS = {
  pg: { class: (config: Config) => new PgConnector(config) },
};

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

  async find<T>(where: WhereFilter<T>, option?: any): Promise<T[]> {
    return;
  }
}

export type Class<T> = new (...args: any[]) => T;
