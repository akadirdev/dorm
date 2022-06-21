import { Class } from "../definitions";
import { getModelSchema } from "../schemas/model.schema";

export interface FieldFilter<K> {
  inc?: K[];
  exc?: K[];
}

export const getNeededColumns = <T, K extends keyof T>(
  target: Class<T>,
  fieldFilter: FieldFilter<K>
): string[] => {
  if (fieldFilter.inc?.length) {
    return fieldFilter.inc.map((m) => String(m));
  }

  const ms = getModelSchema(target);
  const definedColumns = ms.getColumnNames();

  if (fieldFilter.exc?.length) {
    return definedColumns.filter(
      (f) => !fieldFilter.exc.find((ff) => ff === f)
    );
  }

  return definedColumns;
};
