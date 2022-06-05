import { Pool } from "pg";
import { Config } from "../dorm";
import { BaseConnector } from "./base.connector";

export class PgConnector implements BaseConnector {
  private readonly _pool: Pool;

  constructor(config: Config) {
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
