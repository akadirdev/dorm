import "reflect-metadata";

export const repository = () => {
  return (target: Function) => {
    Reflect.defineMetadata("meta:repository", target.name, target);
  };
};
