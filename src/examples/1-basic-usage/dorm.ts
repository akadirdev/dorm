import { PgConnector } from "../../connectors";
import { Dorm } from "../../dorm";

export const dorm = Dorm.init<PgConnector>({
  user: "postgres",
  host: "localhost",
  database: "speedy",
  password: "12345",
  port: 5432,
  connector: "pg",
  pooling: true,
});
