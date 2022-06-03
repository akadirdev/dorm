import { Dormi } from "./sql/client";

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

  await ds.disconnect();
};

main();
