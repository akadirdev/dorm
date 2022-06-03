import { Client, Pool } from "pg";

export namespace Dormi {
  export const CONNECTORS = {
    pg: { class: (config: Dormi.Config) => new PgDriver(config) },
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

  export interface BaseDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
  }

  export class PgDriver implements BaseDriver {
    private readonly _pool: Pool;

    constructor(config: Dormi.Config) {
      this._pool = new Pool({
        user: config.user,
        host: config.host,
        database: config.database,
        password: config.password,
        port: config.port,
      });
    }

    async connect(): Promise<void> {
      // await this._pool.connect();
      console.log("connected!");
      // await this.insertData();
    }

    async disconnect(): Promise<void> {
      await this._pool.end();
      console.log("disconnected");
    }

    async insertData(): Promise<void> {
      const res = await this._pool.query(
        "INSERT INTO personel(name, email, age) VALUES($1, $2, $3) RETURNING *",
        ["akadirdev", "akadir@dev.com", 24]
      );

      console.log("res", res.rows);
    }
  }

  export class MysqlDriver implements BaseDriver {
    connect(): Promise<void> {
      throw new Error("Method not implemented.");
    }
    disconnect(): Promise<void> {
      throw new Error("Method not implemented.");
    }
  }

  export class Repository {
    async create<T>(data: T, option?: any): Promise<T> {
      return data;
    }
  }

  export class Dorm<T extends Dormi.BaseDriver> {
    private readonly driver: T;

    public readonly repository: Repository;

    constructor(config: Dormi.Config) {
      this.driver = Dormi.CONNECTORS[config.connector].class(config);
      this.repository = new Repository();
    }

    public async connect(): Promise<void> {
      await this.driver.connect();
    }
    public async disconnect(): Promise<void> {
      await this.driver.disconnect();
    }
  }
}
