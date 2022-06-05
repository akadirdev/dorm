import "reflect-metadata";

export const model = (table_name: string) => {
  return (target: Function) => {
    Reflect.defineMetadata("meta:model", table_name, target);
  };
};
