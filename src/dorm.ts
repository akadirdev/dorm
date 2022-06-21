import { BaseConnector, PgConnector } from "./connectors";
import { Class } from "./definitions";
import { DormError } from "./errors/dorm.error";
import { EntityRepository, Repository } from "./repository";

export namespace Dorm {
  export const createDatasource = async <T extends BaseConnector>(
    config: Config
  ): Promise<Datasource<T>> => {
    return new Datasource<T>(config);
  };

  const CONNECTORS = {
    pg: { class: (config: Config) => new PgConnector(config) },
  };

  export class Datasource<T extends BaseConnector = BaseConnector> {
    private readonly _connector: T;

    public readonly repository: Repository;

    constructor(config: Config) {
      this._connector = CONNECTORS[config.connector].class(config);
      this.repository = new Repository(this._connector);
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

    public getEntityRepository<T, K extends keyof T>(
      entity: Class<T>,
      id: K
    ): EntityRepository<T, K> {
      return new EntityRepository(this, entity, id);
    }
  }

  type ConnectorType = "pg" | "mysql";

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
}

export function getObjectDef<T>(target: Class<T>) {
  const modelDef = Reflect.getMetadata("meta:model", target);
  const propDef = Reflect.getMetadata("meta:property", target) as object;
  propDef["0"] = modelDef;
  return {
    [target.name]: propDef,
  };
}
