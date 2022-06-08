import { PgConnector } from "./connectors";
import { model, property } from "./decorators";
import { Dorm } from "./dorm";

@model("personel")
export class Person {
  @property({
    id: true,
  })
  id?: number;

  @property({
    type: "string",
    required: true,
  })
  name: string;

  @property({
    type: "string",
    required: true,
  })
  email: string;

  @property({
    name: "p_age",
    type: "number",
    nullable: true,
  })
  age: number;

  constructor(data?: Partial<Person>) {
    Object.assign(this, data ?? {});
  }
}

// const main = async (): Promise<void> => {
//   const ds = new Dorm<PgConnector>({
//     user: "postgres",
//     host: "localhost",
//     database: "speedy",
//     password: "12345",
//     port: 5432,
//     connector: "pg",
//     pooling: true,
//   });

//   await ds.connect();

//   const repo = ds.repository;
//   await repo.create({ a: 1 });

//   await repo.find(Person, {
//     age: {
//       inq: [24, 25],
//     },
//     name: {
//       neq: "akadirdev",
//     },
//   });

//   await ds.disconnect();
// };

// main();

export * from "./dorm";
export * from "./connectors";
export * from "./decorators";
export * from "./filters";
