import { PgConnector } from "../../connectors";
import { Dorm } from "../../dorm";

export const dorm = Dorm.init<PgConnector>({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgrespw",
  port: 49153,
  connector: "pg",
  pooling: true,
});
