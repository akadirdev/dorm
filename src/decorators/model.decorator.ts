import "reflect-metadata";
import { ModelDefinition } from "../definitions";

export const model = (modelDefinition?: ModelDefinition) => {
  return (target: Function) => {
    const modelDef: Required<ModelDefinition> = {
      name: modelDefinition?.name ?? target.name.toLowerCase(),
    };

    Reflect.defineMetadata("meta:model", modelDef, target);
  };
};
