import { BaseConnector } from "./base.connector";

export class MysqlConnector implements BaseConnector {
  connect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
