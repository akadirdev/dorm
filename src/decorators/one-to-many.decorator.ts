import "reflect-metadata";
import { Class, Entity, RelationDefinition } from "../definitions";
import { RelationSchema, RelationTypes } from "../schemas/model.schema";

const getRelationMetadata = <T>(target: Entity<T>): RelationSchema<T> => {
  return (
    Reflect.getMetadata("meta:relation", target) || ({} as RelationSchema<T>)
  );
};

export const oneToMany = <T>(
  classObj: Class<T>,
  relationDefinition: RelationDefinition<T>
) => {
  return (target: Object, memberName: string) => {
    // let currentValue: any = target[memberName];
    const classConstructor = target.constructor;

    const relationDef = setRelationDefinition(memberName, relationDefinition);

    const metadata = getRelationMetadata(classConstructor);
    metadata[memberName] = Object.assign(relationDef, {
      target: classObj,
      relationType: RelationTypes.ONE_TO_MANY,
    });

    Reflect.defineMetadata("meta:relation", metadata, classConstructor);

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

const setRelationDefinition = <T>(
  memberName: string,
  relationDefinition: RelationDefinition<T>
): Required<RelationDefinition<T>> => {
  const relationDef: Required<RelationDefinition<T>> = {
    refererName: relationDefinition.refererName,
    type: relationDefinition.type ?? "array",
  };

  return relationDef;
};
