import { Class } from "./definitions";

export type QuerierCommands =
  | "SELECT"
  | "INSERT INTO"
  | "UPDATE"
  | "DELETE FROM";

export class Querier<T, K extends keyof T> {
  private _entity: Class<T>;
  private _queryString = "";

  constructor(entity: Class<T>) {
    this._entity = entity;
  }

  query(qcmd: QuerierCommands): this {
    this._queryString += qcmd;
    return this;
  }

  qs(qs: string): this {
    this._queryString += qs;
    return this;
  }

  fields(fields: K[]): this {
    this._queryString += " " + fields.toString();
    return this;
  }

  exec(): void {
    console.log(this._queryString);
  }
}
