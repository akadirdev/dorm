import { WhereFilter } from "../filters";

export interface BaseConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  find<T>(where: WhereFilter<T>, target: Object, option?: any): Promise<T[]>;
}
