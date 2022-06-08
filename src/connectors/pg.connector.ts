import { Pool } from "pg";
import { Class, Config, getObjectDef } from "../dorm";
import { WhereFilter } from "../filters";
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

  async find<T>(
    where: WhereFilter<T>,
    target: Class<T>,
    option?: any
  ): Promise<T[]> {
    const modelSchema = getObjectDef(target);
    console.log(modelSchema);
    console.log(where);

    let text = "SELECT * FROM " + modelSchema[target.name]["0"];

    let whereText = "";
    let paramCount = 1;
    let values = [];
    for (const key in where) {
      if (values.length) whereText += " AND ";
      if (typeof where[key] !== "object") {
        console.log("obje değil");
        whereText +=
          "" +
          modelSchema[target.name][key as string]["name"] +
          " = $" +
          paramCount++;
        values.push(where[key]);
      } else {
        const commandObj = where[key];
        const commandKey = Object.keys(commandObj);

        if (commandKey[0] === "inq") {
          whereText +=
            "" + modelSchema[target.name][key as string]["name"] + " in (";

          whereText += where[key][commandKey[0]].map((m) => "$" + paramCount++);

          whereText += ")";
          values.push(...where[key][commandKey[0]]);
        } else if (commandKey[0] === "neq") {
          whereText +=
            "" +
            modelSchema[target.name][key as string]["name"] +
            " != $" +
            paramCount++;
          values.push(where[key][commandKey[0]]);
        }
      }
    }

    if (whereText.length) {
      text += " WHERE " + whereText;
    }
    console.log(text);
    // console.log(whereText);
    console.log(values);

    const res = await this._pool.query(text, values);

    console.log("res", res.rows);

    return [];
  }
}
