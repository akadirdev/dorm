import { BaseRepository } from './base.repository';

export class DefaultRepository<T> extends BaseRepository<T> {
  public async findAll(): Promise<T[]> {
    return [] as T[];
  }
}
