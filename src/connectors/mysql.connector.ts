import { WhereFilter } from "../filters";
import { BaseConnector } from "./base.connector";

export class MysqlConnector implements BaseConnector {
  find<T>(where: WhereFilter<T>, target: Object, option?: any): Promise<T[]> {
    throw new Error("Method not implemented.");
  }
  connect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
