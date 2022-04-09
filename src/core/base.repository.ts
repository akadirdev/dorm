import { DataSource } from './datasource';

export class BaseRepository<T> {
  private readonly dataSource: DataSource;
  readonly entity?: T;

  constructor(ds: DataSource) {
    this.dataSource = ds;
  }
}
