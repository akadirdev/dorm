import { BaseWhereFilter, WhereFilter } from "../filters/where.filter";
import { getModelSchema, ModelSchema } from "../schemas/model.schema";

export type TableSymbol = `t${number}`;

export interface PgJoin {
  joinSchema: ModelSchema<any>;
  joinTableSymbol: TableSymbol;
  refererProp: string;
  parentSchema: ModelSchema<any>;
  parentTableSymbol: TableSymbol;
}

export interface PgQuery {
  text: string;
  values: any[];
  joins: PgJoin[];
}

export interface ParseOptions {
  text: string;
  paramCount: number;
  values: any[];
  tableCount: number;
  joins: PgJoin[];
}

export const parseWhereFilter = <T>(
  whereFilter: WhereFilter<T>,
  schema: ModelSchema<T>
): PgQuery => {
  const p = {
    paramCount: 1,
    tableCount: 0,
    text: "",
    values: [],
    joins: [],
  } as ParseOptions;
  parseWhere(whereFilter, schema, p);

  return { text: p.text, values: p.values, joins: p.joins };
};

export const parseWhere = <T>(
  whereFilter: WhereFilter<T>,
  schema: ModelSchema<T>,
  p: ParseOptions
): void => {
  const tName: TableSymbol = `t${p.tableCount}`;

  for (const key in whereFilter) {
    if (p.values.length && !p.text.endsWith(" AND ")) p.text += " AND ";
    if (typeof whereFilter[key] !== "object") {
      p.text +=
        tName + "." + schema.getColumnName(key) + " = $" + p.paramCount++;
      p.values.push(whereFilter[key]);
    } else if (schema.isRelationKey(key)) {
      const target = schema.getRelationClass(key);
      p.tableCount++;
      const targetSchema = getModelSchema(target);
      if (p.tableCount > 0)
        p.joins.push({
          joinSchema: targetSchema,
          refererProp: key,
          parentSchema: schema,
          parentTableSymbol: tName,
          joinTableSymbol: `t${p.tableCount}`,
        });
      parseWhere(whereFilter[key], targetSchema, p);
    } else {
      const commandObj = whereFilter[key];
      const commandKey = Object.keys(commandObj)[0];

      if (commandKey === "inq") {
        p.text += tName + "." + schema.getColumnName(key) + " in (";
        p.text +=
          whereFilter[key][commandKey].map((m) => "$" + p.paramCount++) + ")";
        p.values.push(...whereFilter[key][commandKey]);
      } else if (commandKey === "neq") {
        p.text +=
          tName + "." + schema.getColumnName(key) + " != $" + p.paramCount++;
        p.values.push(whereFilter[key][commandKey]);
      }
    }
  }
};
