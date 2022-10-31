import {
  Constructor,
  ModelDefinition,
  RelationDefinition,
} from "../definitions";
import { PropertyDefinition } from "../definitions";

export enum RelationTypes {
  "ONE_TO_MANY",
  "MANY_TO_MANY",
  "MANY_TO_ONE",
  "ONE_TO_ONE",
}

export type PropertySchema<T> = {
  [P in keyof T]: Required<PropertyDefinition>;
};

export type RelationSchema<T> = {
  [P in keyof T]: Required<RelationDefinition<any>> & {
    target: Constructor<any>;
    relationType: RelationTypes;
  };
};

export interface Schema<T> {
  [model: string]: {
    _modelDef: Required<ModelDefinition>;
    _propDef: PropertySchema<T>;
    _relationDef?: RelationSchema<T>;
  };
}

const modelSchemaMap = new Map<string, ModelSchema<any>>();

export const getModelSchema = <T>(target: Constructor<T>): ModelSchema<T> => {
  if (modelSchemaMap.has(target.name)) {
    const ms = modelSchemaMap.get(target.name);
    return ms as ModelSchema<T>;
  }
  const newMs = new ModelSchema(target);
  modelSchemaMap.set(target.name, newMs);
  return newMs;
};

export class ModelSchema<T> {
  private readonly _target: Constructor<T>;
  private readonly _modelDef: Required<ModelDefinition>;
  private readonly _propDef: PropertySchema<T>;
  private readonly _relationDef: RelationSchema<T>;

  constructor(target: Constructor<T>) {
    this._modelDef = Reflect.getMetadata("meta:model", target);
    this._propDef = Reflect.getMetadata("meta:property", target);
    this._relationDef = Reflect.getMetadata("meta:relation", target);
    this._target = target;
  }

  getAllSchema(): Schema<T> {
    return {
      [this._target.name]: {
        _modelDef: this._modelDef,
        _propDef: this._propDef,
        _relationDef: this._relationDef,
      },
    };
  }

  getRefererColumn(key: keyof T): string {
    const relation = this._relationDef[key];
    const relSchema = getModelSchema(relation.target);
    return relSchema.getColumnName(relation.refererName);
  }

  getRelType(key: keyof T): "object" | "array" {
    return this._relationDef[key].type;
  }

  getRelationType(key: keyof T): RelationTypes {
    return this._relationDef[key].relationType;
  }

  getRelationClass<P>(key: keyof T): Constructor<P> {
    return this._relationDef[key].target;
  }

  getRelationReferer(key: keyof T): string {
    return this._relationDef[key].refererName as string;
  }

  isRelationKey(key: keyof T): boolean {
    const keys = Object.keys(this._relationDef ?? {});
    return Boolean(keys.find((f) => f === key));
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

  getPropNameFromColumnName(cName: string): string {
    return Object.keys(this._propDef).filter(
      (f) => this._propDef[f].name === cName
    )[0];
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
      const obj = {};
      const x = new this._target();
      for (const key in m) {
        const p = this.getPropNameFromColumnName(key);
        obj[p] = m[key];
      }
      Object.assign(x, obj);
      return x;
    });
  }
}
