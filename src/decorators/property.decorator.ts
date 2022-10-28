import "reflect-metadata";
import { Entity, PropertyDefinition } from "../definitions";
import { PropertySchema } from "../schemas/model.schema";

const getPropertiesMetadata = <T>(target: Entity<T>): PropertySchema<T> => {
  return (
    Reflect.getMetadata("meta:property", target) || ({} as PropertySchema<T>)
  );
};

export const property = (propertyDefinition: PropertyDefinition) => {
  return (target: Object, memberName: string) => {
    // let currentValue: any = target[memberName];
    const classConstructor = target.constructor;

    const propDef = setPropertyDefinition(memberName, propertyDefinition);

    const metadata = getPropertiesMetadata(classConstructor);
    metadata[memberName] = propDef;

    Reflect.defineMetadata("meta:property", metadata, classConstructor);

    // Object.defineProperty(target, memberName, {
    //   set: (v: any) => {
    //     if (typeof v !== propertyDefinition.type) {
    //       throw new Error(
    //         `typeof new value: ${typeof v} is not compatible with propert definition of prop: ${
    //           propertyDefinition.type
    //         }!`
    //       );
    //     }
    //     if (!propertyDefinition.nullable && v === null) {
    //       throw new Error(`property: ${memberName} is not nullable!`);
    //     }
    //     if (propertyDefinition.required && !v) {
    //       throw new Error(`property: ${memberName} is required!`);
    //     }
    //     currentValue = v;
    //   },
    //   get: () => currentValue,
    // });
  };
};

const setPropertyDefinition = (
  memberName: string,
  propertyDefinition: PropertyDefinition
): Required<PropertyDefinition> => {
  const propDef: Required<PropertyDefinition> = {
    id: propertyDefinition.id,
    name: propertyDefinition.name ?? memberName,
    nullable: propertyDefinition.nullable,
    required: propertyDefinition.required ?? true,
    type: propertyDefinition.type,
    format: propertyDefinition.format,
  };

  return propDef;
};
