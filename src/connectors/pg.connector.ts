import { PoolClient, Pool } from "pg";
import { Class, Options } from "../definitions";
import { Dorm, getObjectDef } from "../dorm";
import { Filter, getNeededColumnsString, WhereFilter } from "../filters";
import { BaseConnector, Transaction } from "./base.connector";
import { v4 } from "uuid";
import {
  getModelSchema,
  ModelSchema,
  RelationTypes,
} from "../schemas/model.schema";
import { ParseOptions, parseWhere, parseWhereFilter } from "./pg.parser";
import { RelationFilter } from "../filters/include.filter";

type Pr<T> = T extends Array<infer I> ? I : T;

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

  async insert<T>(object: T, target: Class<T>, options?: Options): Promise<T> {
    const schema = getModelSchema(target);

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
    target: Class<T>,
    options?: Options
  ): Promise<T[]> {
    const schema = getModelSchema(target);

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
    target: Class<T>,
    options?: Options
  ): Promise<void> {
    const schema = getModelSchema(target);

    const text =
      "DELETE FROM " +
      schema.getTableName() +
      " WHERE " +
      schema.getIdColumnName() +
      " = $1";

    await this.chooseClient(options.transaction).query(text, [id]);
  }

  async deleteAll<T>(
    where: WhereFilter<T>,
    target: Class<T>,
    options?: Options
  ): Promise<void> {
    const schema = getModelSchema(target);

    let text = "DELETE FROM " + schema.getTableName() + " t0";

    const whereQuery = parseWhereFilter(where, schema);

    let joinTables = "";
    let joinWhere = "";
    for (const [i, join] of whereQuery.joins.entries()) {
      if (i > 0) {
        joinTables += ", ";
        joinWhere += " AND ";
      }
      joinTables += join.joinSchema.getTableName() + " " + join.joinTableSymbol;
      joinWhere +=
        join.parentTableSymbol +
        "." +
        join.parentSchema.getIdColumnName() +
        " = " +
        join.joinTableSymbol +
        "." +
        join.parentSchema.getRefererColumn(join.refererProp);
    }

    if (joinTables.length) {
      text += " USING " + joinTables;
      text += " WHERE " + joinWhere + " AND " + whereQuery.text;
    } else {
      text += " WHERE " + whereQuery.text;
    }

    console.log("text: ", text);
    console.log("values: ", whereQuery.values);

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
    filter: Filter<T>,
    target: Class<T>,
    options?: Options
  ): Promise<T[]> {
    const schema = getModelSchema(target);

    let text =
      "SELECT " +
      getNeededColumnsString(target, filter.field) +
      " FROM " +
      schema.getTableName() +
      " t0";

    const whereQuery = parseWhereFilter(filter.where, schema);

    for (const [i, join] of whereQuery.joins.entries()) {
      text +=
        " JOIN " +
        join.joinSchema.getTableName() +
        " " +
        join.joinTableSymbol +
        " ON " +
        join.joinTableSymbol +
        "." +
        join.parentSchema.getRefererColumn(join.refererProp) +
        " = " +
        join.parentTableSymbol +
        "." +
        join.parentSchema.getIdColumnName();
    }

    if (whereQuery.text.length) {
      text += " WHERE " + whereQuery.text;
    }

    if (whereQuery.joins.length)
      text += " GROUP BY t0." + schema.getIdColumnName();

    console.log("text: ", text);
    console.log("values: ", whereQuery.values);

    const res = await this.chooseClient(options?.transaction).query(
      text,
      whereQuery.values
    );

    const datas = schema.createInstances(res.rows);

    await this.includeRelations(datas, schema, filter.relations);

    return datas;
  }

  private async includeRelations<T>(
    parentObjects: T[],
    schema: ModelSchema<T>,
    relation?: RelationFilter<T, keyof T>,
    options?: Options
  ): Promise<void> {
    if (!relation?.length) return;

    const relations = await Promise.all(
      relation.map((m) => {
        const target = schema.getRelationClass(m);
        return this.find(
          {
            where: {
              [schema.getRelationReferer(m)]: {
                inq: parentObjects.map((m) => m[schema.getIdPropName()]),
              },
            },
          },
          target,
          options
        );
      })
    );

    for (const [i, incKey] of relation.entries()) {
      const relType = schema.getRelType(incKey);

      if (relType === "array")
        parentObjects.map((m) => {
          m[incKey] = [] as unknown as T[keyof T];
        });

      relations[i].map((m) => {
        const found = parentObjects.find(
          (f) =>
            f[schema.getIdPropName()] === m[schema.getRelationReferer(incKey)]
        );

        if (found) {
          const relType = schema.getRelType(incKey);

          if (relType === "array") {
            (found[incKey] as unknown as Array<any>).push(m);
          }
        }
      });
    }
  }

  async findById<T, ID>(
    id: ID,
    filter: Omit<Filter<T>, "where">,
    target: Class<T>,
    options?: Options
  ): Promise<T | null> {
    const schema = getModelSchema(target);

    const text =
      "SELECT " +
      getNeededColumnsString(target, filter.field) +
      " FROM " +
      schema.getTableName() +
      " t0 WHERE t0." +
      schema.getIdColumnName() +
      " = $1";

    const values = [id];

    console.log(text);
    console.log(values);

    const res = await this.chooseClient(options?.transaction).query(
      text,
      values
    );

    if (!res.rowCount) return null;

    const datas = schema.createInstances(res.rows);

    await this.includeRelations(datas, schema, filter.relations);

    return datas[0];
  }

  async update<T>(object: T, target: Class<T>, options?: Options): Promise<T> {
    const schema = getModelSchema(target);

    const idProp = schema.getIdPropName();
    if (!object[idProp]) throw new Error(`Given object has empty id property!`);

    const id = object[idProp];
    delete object[idProp];

    let paramCount = 0;

    let text = "UPDATE " + schema.getTableName();
    const values = [];

    for (const key in object) {
      text += " SET " + schema.getColumnName(key) + " = $" + ++paramCount;
      values.push(object[key]);
    }

    text += " WHERE " + schema.getIdColumnName() + " = $" + ++paramCount;
    values.push(id);

    console.log(text);
    console.log(values);

    const res = await this.chooseClient(options?.transaction).query(
      text,
      values
    );

    console.log("res.rowCount", res.rowCount);

    if (!res.rowCount) throw new Error(`No affected row!`);

    object[idProp] = id;

    return schema.createInstances([object])[0];
  }

  async updateAll<T>(
    object: Partial<T>,
    where: WhereFilter<T>,
    target: Class<T>,
    options?: Options
  ): Promise<number> {
    const schema = getModelSchema(target);

    const idProp = schema.getIdPropName();
    if (object[idProp]) delete object[idProp];

    let paramCount = 1;

    let text = "UPDATE " + schema.getTableName() + " t0";
    const values = [];

    for (const key in object) {
      text += " SET t0." + schema.getColumnName(key) + " = $" + paramCount++;
      values.push(object[key]);
    }

    const parserOpt = {
      paramCount: paramCount,
      tableCount: 0,
      text: "",
      values: values,
      joins: [],
    } as ParseOptions;

    parseWhere(where, schema, parserOpt);

    let joinTables = "";
    let joinWhere = "";
    for (const [i, join] of parserOpt.joins.entries()) {
      if (i > 0) {
        joinTables += ", ";
        joinWhere += " AND ";
      }
      joinTables += join.joinSchema.getTableName() + " " + join.joinTableSymbol;
      joinWhere +=
        join.parentTableSymbol +
        "." +
        join.parentSchema.getIdColumnName() +
        " = " +
        join.joinTableSymbol +
        "." +
        join.parentSchema.getRefererColumn(join.refererProp);
    }

    if (joinTables.length) {
      text += " FROM " + joinTables;
      text += " WHERE " + joinWhere + parserOpt.text;
    } else {
      text += " WHERE " + parserOpt.text;
    }

    console.log(text);
    console.log(parserOpt.values);

    const res = await this.chooseClient(options?.transaction).query(
      text,
      parserOpt.values
    );

    return res.rowCount;
  }
}
