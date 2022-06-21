import { Class, ModelDefinition } from "../definitions";
import { PropertyDefinition } from "../definitions";

export type PropertySchema<T> = {
  [P in keyof Required<T>]: Required<PropertyDefinition>;
};

const modelSchemaMap = new Map<string, ModelSchema<any>>();

export const getModelSchema = <T>(target: Class<T>): ModelSchema<T> => {
  if (modelSchemaMap.has(target.name)) {
    const ms = modelSchemaMap.get(target.name);
    return ms as ModelSchema<T>;
  }
  const newMs = new ModelSchema(target);
  modelSchemaMap.set(target.name, newMs);
  return newMs;
};

export class ModelSchema<T> {
  private readonly _target: Class<T>;
  private readonly _modelDef: Required<ModelDefinition>;
  private readonly _propDef: PropertySchema<T>;

  constructor(target: Class<T>) {
    this._modelDef = Reflect.getMetadata("meta:model", target);
    this._propDef = Reflect.getMetadata("meta:property", target);
    this._target = target;
  }

  getTableName(): string {
    return this._modelDef.name;
  }

  getClassName(): string {
    return this._target.name;
  }

  getColumnName<K extends keyof T>(key: K): string {
    return this._propDef[String(key)].name;
  }

  getIdPropName(): string {
    for (const key in this._propDef) {
      const propDef = this._propDef[key];
      if (propDef.id) {
        return key;
      }
    }
  }

  getIdColumnName(): string {
    for (const key in this._propDef) {
      const propDef = this._propDef[key];
      if (propDef.id) {
        return propDef.name;
      }
    }
  }

  getColumnNames(): string[] {
    return Object.keys(this._propDef).map((m) => this._propDef[m].name);
  }

  getRequiredProps(): string[] {
    return Object.keys(this._propDef).filter(
      (f) => this._propDef[f].required && !this._propDef[f].nullable
    );
  }

  validateModel(modelObject: T): object {
    const validatedObject = {};

    for (const key in this._propDef) {
      const propDef = this._propDef[key];
      const value = modelObject[key];

      if (propDef.id && value) {
        throw new Error(`id prop must be empty!`);
      }
      if (propDef.required && !value && !propDef.id) {
        throw new Error(`${key} prop is required!`);
      }
      if (!propDef.nullable && value === null) {
        throw new Error(`${key} prop is not nullable!`);
      }

      if (!propDef.id) validatedObject[propDef.name] = value ?? null;
    }

    return validatedObject;
  }

  validateModels(modelObject: T[]): object[] {
    return modelObject.map((m) => this.validateModel(m));
  }

  createInstances(objects: T[]): T[] {
    return objects.map((m) => {
      if (m instanceof this._target) return m;

      const x = new this._target();
      Object.assign(x, m);
      return x;
    });
  }
}
