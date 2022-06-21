import { PoolClient, Pool } from "pg";
import { Class, Options } from "../definitions";
import { Dorm, getObjectDef } from "../dorm";
import { WhereFilter } from "../filters";
import { BaseConnector, Transaction } from "./base.connector";
import { v4 } from "uuid";
import { getModelSchema } from "../schemas/model.schema";
import { parseWhereFilter } from "./pg.parser";

class PgTransaction implements Transaction {
  private readonly _poolClient: PoolClient;
  private _transactionCache: Map<string, PoolClient>;

  tid: string;

  constructor(
    poolClient: PoolClient,
    transactionCache: Map<string, PoolClient>
  ) {
    this._poolClient = poolClient;
    this.tid = v4();
    this._transactionCache = transactionCache;
    this._transactionCache.set(this.tid, this._poolClient);
  }

  async commit(): Promise<void> {
    await this._poolClient.query("COMMIT");
    this._poolClient.release();
    this._transactionCache.delete(this.tid);
    console.log("COMMIT");
  }

  async rollback(): Promise<void> {
    await this._poolClient.query("ROLLBACK");
    this._poolClient.release();
    this._transactionCache.delete(this.tid);
    console.log("ROLLBACK");
  }
}

export class PgConnector implements BaseConnector {
  private readonly _pool: Pool;
  private _transactionCache: Map<string, PoolClient>;

  constructor(config: Dorm.Config) {
    this._pool = new Pool({
      user: config.user,
      host: config.host,
      database: config.database,
      password: config.password,
      port: config.port,
    });
    this._transactionCache = new Map<string, PoolClient>();
  }

  private chooseClient(tx?: Transaction): Pool | PoolClient {
    if (tx) {
      if (this._transactionCache.has(tx.tid)) {
        const c = this._transactionCache.get(tx.tid);
        return c;
      } else throw new Error(`Transaction invalid!`);
    } else return this._pool;
  }

  async begin(): Promise<Transaction> {
    const client = await this._pool.connect();
    await client.query("BEGIN");

    const tx = new PgTransaction(client, this._transactionCache);
    console.log("BEGIN");
    return tx;
  }

  async insert<T>(object: T, Class: Class<T>, options?: Options): Promise<T> {
    const schema = getModelSchema(Class);

    const obj = schema.validateModel(object);

    const keys = Object.keys(obj);
    const text =
      "INSERT INTO " +
      schema.getTableName() +
      "(" +
      keys +
      ") VALUES(" +
      keys.map((m, i) => `$${i + 1}`).toString() +
      ") RETURNING " +
      schema.getIdColumnName();

    const res = await this.chooseClient(options.transaction).query(
      text,
      Object.values(obj)
    );

    object[schema.getIdPropName()] = res.rows[0][schema.getIdColumnName()];

    return schema.createInstances([object])[0];
  }

  async insertAll<T>(
    objects: T[],
    Class: Class<T>,
    options?: Options
  ): Promise<T[]> {
    const schema = getModelSchema(Class);

    const objs = schema.validateModels(objects);

    const keys = Object.keys(objs[0]);

    let text =
      "INSERT INTO " + schema.getTableName() + "(" + keys + ") VALUES ";

    let paramCount = 1;

    objs.map((m, i) => {
      if (i) text += ",";
      text += "(" + keys.map(() => `$${paramCount++}`).toString() + ")";
    });

    text += " RETURNING " + schema.getIdColumnName();
    const values = objs.flatMap((m) => Object.values(m));

    const res = await this.chooseClient(options.transaction).query(
      text,
      values
    );

    res.rows.map((m, i) => {
      objects[i][schema.getIdPropName()] = m[schema.getIdColumnName()];
    });

    return schema.createInstances(objects);
  }

  async deleteById<T, ID>(
    id: ID,
    Class: Class<T>,
    options?: Options
  ): Promise<void> {
    const schema = getModelSchema(Class);

    let text =
      "DELETE FROM " +
      schema.getTableName() +
      " WHERE " +
      schema.getIdColumnName() +
      " = $1";

    await this.chooseClient(options.transaction).query(text, [id]);
  }

  async deleteAll<T>(
    where: WhereFilter<T>,
    Class: Class<T>,
    options?: Options
  ): Promise<void> {
    const schema = getModelSchema(Class);

    let text = "DELETE FROM " + schema.getTableName() + " WHERE ";

    const whereQuery = parseWhereFilter(where, schema);

    text += whereQuery.text;

    await this.chooseClient(options.transaction).query(text, whereQuery.values);
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

  async find<T>(
    where: WhereFilter<T>,
    target: Class<T>,
    options?: any
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

  async findById<T, ID>(id: ID, target: Class<T>, options?: any): Promise<T> {
    const modelSchema = getObjectDef(target);

    let idName: string;
    for (const key in modelSchema[target.name]) {
      if (modelSchema[target.name][key].id) {
        idName = modelSchema[target.name][key].name;
      }
    }

    let text =
      "SELECT * FROM " +
      modelSchema[target.name]["0"] +
      " where " +
      idName +
      " = " +
      id +
      "";

    console.log(text);

    const res = await this._pool.query(text);

    console.log(res.rows);

    return res.rows[0];
  }

  async update<T>(object: T, target: Class<T>, options?: any): Promise<T> {
    const modelSchema = getObjectDef(target);

    let idColumnName: string;
    let idPropName: string;
    for (const key in modelSchema[target.name]) {
      if (modelSchema[target.name][key].id) {
        idColumnName = modelSchema[target.name][key].name;
        idPropName = key;
      }
    }

    if (!idColumnName)
      throw new Error(`Entity:${target.name} has no id property!`);

    if (!object[idColumnName])
      throw new Error(`Given object has empty id property!`);

    const id = object[idPropName];
    delete object[idPropName];
    let text = "UPDATE " + modelSchema[target.name]["0"];
    for (const key of Object.keys(object)) {
      const keyName = modelSchema[target.name][key]["name"];
      const keyType = modelSchema[target.name][key]["type"];

      if (keyType === "string")
        text += " SET " + keyName + " = '" + object[key] + "'";
      else text += " SET " + keyName + " = " + object[key];
    }

    text += " WHERE " + idColumnName + " = " + id;

    console.log(text);

    const res = await this._pool.query(text);

    console.log(res.rows);

    return object;
  }

  async updateAll<T>(
    object: T,
    where: WhereFilter<T>,
    target: Class<T>,
    options?: any
  ): Promise<number> {
    const modelSchema = getObjectDef(target);

    let idColumnName: string;
    let idPropName: string;
    for (const key in modelSchema[target.name]) {
      if (modelSchema[target.name][key].id) {
        idColumnName = modelSchema[target.name][key].name;
        idPropName = key;
      }
    }

    if (object[idPropName]) delete object[idPropName];

    let text = "UPDATE " + modelSchema[target.name]["0"];
    for (const key of Object.keys(object)) {
      const keyName = modelSchema[target.name][key]["name"];
      const keyType = modelSchema[target.name][key]["type"];

      if (keyType === "string")
        text += " SET " + keyName + " = '" + object[key] + "'";
      else text += " SET " + keyName + " = " + object[key];
    }

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

    text += " WHERE " + whereText;

    console.log(text);
    console.log(values);

    const res = await this._pool.query(text, values);

    console.log(res.rows);

    return 4;
  }
}
