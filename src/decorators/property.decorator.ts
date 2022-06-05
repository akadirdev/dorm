import "reflect-metadata";

export interface PropertyDefinition {
  id?: boolean;
  name?: string;
  type?: string;
  required?: boolean;
  nullable?: boolean;
  format?: string;
}

export const property = (propertyDefinition?: PropertyDefinition) => {
  return (target: any, memberName: string) => {
    let currentValue: any = target[memberName];
    const classConstructor = target.constructor;

    setDefaultPropertyDefinition(target, memberName, propertyDefinition);

    const metadata =
      Reflect.getMetadata("meta:property", classConstructor) ?? {};
    metadata[memberName] = propertyDefinition;

    Reflect.defineMetadata("meta:property", metadata, classConstructor);

    Object.defineProperty(target, memberName, {
      set: (v: any) => {
        if (typeof v !== propertyDefinition.type) {
          throw new Error(
            `typeof new value: ${typeof v} is not compatible with propert definition of prop: ${
              propertyDefinition.type
            }!`
          );
        }
        if (!propertyDefinition.nullable && v === null) {
          throw new Error(`property: ${memberName} is not nullable!`);
        }
        if (propertyDefinition.required && !v) {
          throw new Error(`property: ${memberName} is required!`);
        }
        currentValue = v;
      },
      get: () => currentValue,
    });
  };
};

const setDefaultPropertyDefinition = (
  target: any,
  memberName: string,
  propDef?: PropertyDefinition
): void => {
  if (!propDef) propDef = {} as PropertyDefinition;
  if (!propDef.name) propDef.name = memberName;
  if (!propDef.type) propDef.type = typeof target[memberName];
};
