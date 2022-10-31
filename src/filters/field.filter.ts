import { Constructor } from "../definitions";
import { getModelSchema } from "../schemas/model.schema";

export interface FieldFilter<K> {
  inc?: K[];
  exc?: K[];
}

export const getNeededColumnsString = <T, K extends keyof T>(
  target: Constructor<T>,
  fieldFilter?: FieldFilter<K>
): string => {
  const columns = getNeededColumns(target, fieldFilter);
  return columns.map((m) => `t0.${m}`).join(",");
};

const getNeededColumns = <T, K extends keyof T>(
  target: Constructor<T>,
  fieldFilter?: FieldFilter<K>
): string[] => {
  const ms = getModelSchema(target);

  if (fieldFilter?.inc?.length) {
    return fieldFilter.inc.map((m) => ms.getColumnName(m));
  }

  const definedColumns = ms.getColumnNames();

  if (fieldFilter?.exc?.length) {
    return definedColumns.filter(
      (f) => !fieldFilter.exc.find((ff) => ff === f)
    );
  }

  return definedColumns;
};
