// import { Options } from "../definitions";
// import { Filter, WhereFilter } from "../filters";
// import { BaseConnector, Transaction } from "./base.connector";

// export class MysqlConnector implements BaseConnector {
//   find<T>(filter: Filter<T>, target: Object, options?: Options): Promise<T[]> {
//     throw new Error("Method not implemented.");
//   }
//   begin(): Promise<Transaction> {
//     throw new Error("Method not implemented.");
//   }
//   insert<T>(object: T, target: Object, options?: any): Promise<T> {
//     throw new Error("Method not implemented.");
//   }
//   insertAll<T>(object: T[], target: Object, options?: any): Promise<T[]> {
//     throw new Error("Method not implemented.");
//   }
//   deleteById<ID>(id: ID, target: Object, options?: any): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   deleteAll<T>(
//     where: WhereFilter<T>,
//     target: Object,
//     options?: any
//   ): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   updateAll<T>(
//     object: T,
//     where: WhereFilter<T>,
//     target: Object,
//     options?: any
//   ): Promise<number> {
//     throw new Error("Method not implemented.");
//   }
//   update<T>(object: T, target: Object, options?: any): Promise<T> {
//     throw new Error("Method not implemented.");
//   }
//   findById<T, ID>(id: ID, target: Object, options?: any): Promise<T> {
//     throw new Error("Method not implemented.");
//   }
//   connect(): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   disconnect(): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
// }
