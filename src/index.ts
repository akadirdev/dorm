import { Dormi } from "./sql/client";

class Person {
  id: number;
  name: string;
  surname: string;
  age: number;
}

const main = async (): Promise<void> => {
  const ds = new Dormi.Dorm<Dormi.PgDriver>({
    user: "postgres",
    host: "localhost",
    database: "speedy",
    password: "12345",
    port: 5432,
    connector: "pg",
    pooling: true,
  });

  await ds.connect();

  const repo = ds.repository;
  await repo.create({ a: 1 });

  await repo.find<Person>({
    age: 12,
    name: {
      inq: ["june", "july"],
    },
    surname: {
      inq: ["saturday"],
    },
  });

  await ds.disconnect();
};

main();
