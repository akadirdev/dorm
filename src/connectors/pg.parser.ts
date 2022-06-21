import { WhereFilter } from "../filters/where.filter";
import { ModelSchema } from "../schemas/model.schema";

export interface PgQuery {
  text: string;
  values?: any[];
}

export const parseWhereFilter = <T>(
  whereFilter: WhereFilter<T>,
  schema: ModelSchema<T>
): PgQuery => {
  let whereText = "";
  let paramCount = 1;
  const values = [];
  for (const key in whereFilter) {
    if (values.length) whereText += " AND ";
    if (typeof whereFilter[key] !== "object") {
      console.log("obje değil");
      whereText += schema.getColumnName(key) + " = $" + paramCount++;
      values.push(whereFilter[key]);
    } else {
      const commandObj = whereFilter[key];
      const commandKey = Object.keys(commandObj)[0];

      if (commandKey === "inq") {
        whereText += schema.getColumnName(key) + " in (";
        whereText +=
          whereFilter[key][commandKey].map((m) => "$" + paramCount++) + ")";
        values.push(...whereFilter[key][commandKey]);
      } else if (commandKey === "neq") {
        whereText += schema.getColumnName(key) + " != $" + paramCount++;
        values.push(whereFilter[key][commandKey]);
      }
    }
  }
  return { text: whereText, values: values };
};
